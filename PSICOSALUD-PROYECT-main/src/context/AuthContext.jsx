import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { insforge } from '../lib/insforge';

const AuthContext = createContext(null);

const SESSION_TIMEOUT_MS = 40 * 60 * 1000;

export function AuthProvider({ children }) {
  const [sessionUser, setSessionUser] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const inactivityTimerRef = useRef(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('mi_app_token');
        const userStr = localStorage.getItem('mi_app_user');
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          // Refrescar los datos del usuario desde la DB para asegurar que esté al día
          const { data, error } = await insforge.database
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!error && data) {
            setSessionUser(data);
            setSessionToken(token);
            localStorage.setItem('mi_app_user', JSON.stringify(data));
          } else {
            // Si el token es inválido o el usuario fue borrado, cerramos sesión
            logout();
          }
        }
      } catch (error) {
        console.error("Error validando sesión local:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (!sessionToken) return;

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(async () => {
      console.warn('[Auth] Sesión expirada por inactividad.');
      logout();
    }, SESSION_TIMEOUT_MS);
  }, [sessionToken]);

  useEffect(() => {
    if (!sessionToken) {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      return;
    }

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    activityEvents.forEach(event => {
      window.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    resetInactivityTimer();

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [sessionToken, resetInactivityTimer]);

  const login = useCallback((user, token) => {
    localStorage.setItem('mi_app_token', token);
    localStorage.setItem('mi_app_user', JSON.stringify(user));
    setSessionUser(user);
    setSessionToken(token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('mi_app_token');
    localStorage.removeItem('mi_app_user');
    setSessionUser(null);
    setSessionToken(null);
    
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const value = {
    sessionUser,
    sessionToken,
    isAuthenticated: !!sessionToken && !!sessionUser,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return context;
}

export default AuthContext;
