-- Habilitar RLS y crear políticas permisivas para users, areas y reports

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public full access to users" ON public.users FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public full access to areas" ON public.areas FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public full access to reports" ON public.reports FOR ALL TO public USING (true) WITH CHECK (true);

