import { createAdminClient } from "npm:@insforge/sdk";
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sha256(text: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default async function (req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const baseUrl = Deno.env.get("INSFORGE_BASE_URL") ?? "";
    const apiKey = Deno.env.get("API_KEY") ?? "";
    const jwtSecretStr = Deno.env.get("JWT_SECRET") ?? "";

    if (!jwtSecretStr) {
      throw new Error("Missing JWT_SECRET environment variable");
    }

    const admin = createAdminClient({ baseUrl, apiKey });

    // 1. Buscar al usuario en public.users
    const { data: userRec, error: fetchError } = await admin.database
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (fetchError || !userRec) {
      return new Response(JSON.stringify({ error: 'Credenciales inválidas' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // 2. Verificar la contraseña hasheada
    const hashedPassword = await sha256(password);
    if (hashedPassword !== userRec.password) {
      return new Response(JSON.stringify({ error: 'Credenciales inválidas' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // 3. Generar un JWT usando djwt
    // Importante: El payload debe contener "sub" igual al userRec.id para que funcione el RLS (auth.uid())
    const payload = {
      sub: userRec.id,
      role: 'authenticated', // El rol base de InsForge
      email: userRec.email,
      exp: getNumericDate(60 * 60 * 24), // 24 horas de expiración
    };

    // Crear clave criptográfica desde el string JWT_SECRET
    const encoder = new TextEncoder();
    const keyBuf = encoder.encode(jwtSecretStr);
    const key = await crypto.subtle.importKey(
      "raw",
      keyBuf,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const token = await create({ alg: "HS256", typ: "JWT" }, payload, key);

    // Retornamos el usuario (sin el password) y el token JWT
    const safeUser = { ...userRec };
    delete safeUser.password;

    return new Response(JSON.stringify({ user: safeUser, token }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}
