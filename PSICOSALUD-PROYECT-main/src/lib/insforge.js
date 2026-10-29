// Cliente de base de datos de PsicoSalud.
//
// ANTES: se conectaba a InsForge (servicio de pago) con VITE_INSFORGE_URL / VITE_INSFORGE_ANON_KEY.
// AHORA: usa una base de datos SIMULADA que vive en el navegador (localStorage),
//        con la misma interfaz, así que el resto de la app no cambia.
//
// Detalles en src/lib/mockDb/. Para restaurar los datos de ejemplo, ejecuta en la
// consola del navegador:  window.__resetMockDb(); location.reload();

import { createMockClient } from './mockDb/mockClient.js';

export const insforge = createMockClient();
