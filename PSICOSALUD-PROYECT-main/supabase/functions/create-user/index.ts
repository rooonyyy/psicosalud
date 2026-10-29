import { createAdminClient } from "npm:@insforge/sdk";

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
    const { email, password, nombre, apellido1, apellido2, rol, iniciales } = body;

    if (!email || !password || !nombre || !apellido1 || !rol) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const admin = createAdminClient({
      baseUrl: Deno.env.get("INSFORGE_BASE_URL") ?? "",
      apiKey: Deno.env.get("API_KEY") ?? "",
    });

    // 1. Verificar si el email ya existe en public.users
    const { data: existingUser } = await admin.database
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
      
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'El correo electrónico ya está registrado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 409,
      });
    }

    // 2. Generar el hash de la contraseña
    const hashedPassword = await sha256(password);

    // 3. Insertar directamente en public.users
    const { data: userData, error: userError } = await admin.database
      .from('users')
      .insert([{
        email,
        password: hashedPassword,
        nombre,
        apellido1,
        apellido2: apellido2 || '',
        rol,
        iniciales: iniciales || null
      }])
      .select()
      .single();

    if (userError) {
      console.log("DB Insert Error:", userError);
      return new Response(JSON.stringify({ error: userError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    return new Response(JSON.stringify(userData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error("Function Error:", err);
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

