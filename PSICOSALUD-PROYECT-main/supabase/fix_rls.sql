CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND rol = 'Administrador'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS "Administradores pueden ver todos los usuarios" ON public.users;
DROP POLICY IF EXISTS "Administradores pueden gestionar usuarios" ON public.users;
DROP POLICY IF EXISTS "Solo administradores pueden modificar áreas" ON public.areas;
DROP POLICY IF EXISTS "Solo administradores pueden borrar reportes" ON public.reports;

CREATE POLICY "Administradores pueden ver todos los usuarios" 
ON public.users FOR SELECT USING ( public.is_admin() );

CREATE POLICY "Administradores pueden gestionar usuarios" 
ON public.users FOR ALL USING ( public.is_admin() );

CREATE POLICY "Solo administradores pueden modificar áreas" 
ON public.areas FOR ALL USING ( public.is_admin() );

CREATE POLICY "Solo administradores pueden borrar reportes" 
ON public.reports FOR DELETE USING ( public.is_admin() );
