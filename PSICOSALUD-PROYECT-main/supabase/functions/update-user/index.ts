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
  // CORS Options preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { id, email, password, nombre, apellido1, apellido2, rol, iniciales } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Falta el ID del usuario' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const admin = createAdminClient({
      baseUrl: Deno.env.get("INSFORGE_BASE_URL") ?? "",
      apiKey: Deno.env.get("API_KEY") ?? "",
    });

    // 1. Preparar el objeto de actualización
    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (nombre !== undefined) updateData.nombre = nombre;
    if (apellido1 !== undefined) updateData.apellido1 = apellido1;
    if (apellido2 !== undefined) updateData.apellido2 = apellido2;
    if (rol !== undefined) updateData.rol = rol;
    if (iniciales !== undefined) updateData.iniciales = iniciales;

    // 2. Si se proporcionó una contraseña, encriptarla
    if (password) {
      updateData.password = await sha256(password);
    }

    // 3. Actualizar en public.users
    const { data: userData, error: userError } = await admin.database
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (userError) {
      console.log("DB Update Error:", userError);
      return new Response(JSON.stringify({ error: userError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    return new Response(JSON.stringify(userData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err: any) {
    console.error("Function Error:", err);
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}
