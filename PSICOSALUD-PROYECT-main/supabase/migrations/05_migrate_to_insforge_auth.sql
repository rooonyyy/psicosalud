-- Migración a InsForge Auth y Seguridad RLS
-- IMPORTANTE: Ejecuta este script en el SQL Editor de tu panel de InsForge.

-- 1. Modificar la tabla public.users para que su ID coincida con auth.users
-- Nota: Si public.users ya tiene datos, esto puede fallar si los IDs no son UUIDs.
-- Asumimos que los IDs actuales son genéricos. Para InsForge Auth, necesitamos
-- que el id de public.users sea una referencia (Foreign Key) a auth.users.id
-- Si no puedes cambiar el tipo de ID, añade una columna auth_id UUID UNIQUE.

-- Por simplicidad, si la tabla está vacía o en desarrollo, la mejor práctica es:
/*
ALTER TABLE public.users 
  ALTER COLUMN id SET DATA TYPE UUID USING (uuid_generate_v4()),
  ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
*/

-- Opcionalmente, si no quieres modificar el ID principal, agrega auth_id:
-- ALTER TABLE public.users ADD COLUMN auth_id UUID REFERENCES auth.users(id);

-- 2. Eliminar las políticas públicas inseguras anteriores
DROP POLICY IF EXISTS "Allow public full access to users" ON public.users;
DROP POLICY IF EXISTS "Allow public full access to areas" ON public.areas;
DROP POLICY IF EXISTS "Allow public full access to reports" ON public.reports;

-- 3. Crear Políticas RLS Seguras (Row Level Security)

-- AREAS: Solo usuarios autenticados pueden ver y modificar
CREATE POLICY "Usuarios autenticados pueden ver áreas" 
ON public.areas FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Solo administradores pueden modificar áreas" 
ON public.areas FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND rol = 'Administrador'
  )
);

-- REPORTS (Registros): Solo autenticados pueden ver y crear
CREATE POLICY "Usuarios autenticados pueden ver reportes" 
ON public.reports FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden insertar reportes" 
ON public.reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden actualizar reportes" 
ON public.reports FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Solo administradores pueden borrar reportes" 
ON public.reports FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND rol = 'Administrador'
  )
);

-- USERS: Seguridad estricta
-- Cada usuario puede ver su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil" 
ON public.users FOR SELECT USING (id = auth.uid());

-- Los administradores pueden ver todos los usuarios
CREATE POLICY "Administradores pueden ver todos los usuarios" 
ON public.users FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND rol = 'Administrador'
  )
);

-- Solo administradores pueden insertar/modificar/borrar otros usuarios
CREATE POLICY "Administradores pueden gestionar usuarios" 
ON public.users FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND rol = 'Administrador'
  )
);

-- 4. Trigger automático (Opcional pero recomendado)
-- Crea automáticamente un perfil en public.users cuando alguien se registra en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nombre, apellido1, apellido2, rol, password)
  VALUES (new.id, new.email, 'Usuario', 'Nuevo', '', 'Psicólogo', '');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- NOTA CRÍTICA SOBRE CONTRASEÑAS:
-- Como las contraseñas anteriores estaban cacheadas en SHA-256 en frontend, 
-- no se pueden migrar a InsForge Auth directamente. 
-- Tendrás que crear los usuarios de nuevo usando la interfaz de InsForge Auth
-- o pedirles que se registren nuevamente.
