import React, { useState, useEffect } from 'react';

export default function LoadingSpinner({ message = "Cargando...", delay = 300 }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) return null;

  return (
    <div className="flex flex-col items-center justify-center p-12 col-span-full">
      <div className="w-[3.125rem] h-[3.125rem] border-4 border-surface-container-highest border-t-primary rounded-full animate-spin mb-4"></div>
      <p className="text-on-surface-variant text-[1.1rem] font-medium animate-pulse">{message}</p>
    </div>
  );
}
