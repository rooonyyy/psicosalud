-- 1. Eliminar el trigger automático de auth.users, ya no lo usaremos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Eliminar la restricción de clave foránea si se aplicó
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- 3. Asegurar que el email sea único en public.users para evitar duplicados
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);

-- (La columna password debería existir desde el esquema original, si no, se debe agregar)
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;
