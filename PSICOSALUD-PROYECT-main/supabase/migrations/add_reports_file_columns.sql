-- Agregar columnas para los archivos adjuntos en los reportes
ALTER TABLE public.reports ADD COLUMN archivo_url TEXT;
ALTER TABLE public.reports ADD COLUMN archivo_nombre TEXT;
