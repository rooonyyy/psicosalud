<div align="center">

# PsicoSalud - Frontend (Interfaz Web)

![React](https://img.shields.io/badge/React-19-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB) ![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?style=flat&logo=react-router&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-5-%23646CFF.svg?style=flat&logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white) ![NodeJS](https://img.shields.io/badge/Node.js-18+-%2343853D.svg?style=flat&logo=node.js&logoColor=white)

</div>

Esta rama contiene el código cliente de PsicoSalud, diseñado para garantizar rendimiento y una experiencia de usuario fluida.

## Base de datos simulada 



**Credenciales de prueba**

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@psicosalud.com | admin123 |
| Psicólogo | psicologo@psicosalud.com | psico123 |

**Portal de empleados** (`/login-empleado`): código `ESTRES2026` y cualquiera de estas áreas: Recursos Humanos, Operaciones, Ventas, Tecnología.

Para añadir o cambiar los datos de ejemplo, edita `src/lib/mockDb/seed.js`. La carpeta `supabase/` (esquema SQL y edge functions) quedó solo como referencia y ya no se usa.

> Los informes adjuntos se guardan en el navegador (límite aproximado de 5 MB en total). La función de IA (PsicoIA) sigue necesitando `VITE_OPENROUTER_API_KEY`; sin ella el resto de la app funciona y solo ese botón avisa que falta la clave.

## Arquitectura del Proyecto (Feature-Sliced Design)

El sistema ha sido refactorizado desde un MVC clásico hacia una **Arquitectura Orientada a Funcionalidades**. Esto significa que el código está encapsulado según el contexto de negocio, lo que permite escalabilidad sin acoplamiento.

```text
C:\...\psicosalud-frontend\
│
├─ 📂 src/                    <-- Código fuente del Frontend
│  │
│  ├─ 📂 lib/                 <-- Librerías Core
│  │  └─ 📄 insforge.js       (Inicializa el cliente de Base de Datos)
│  │
│  ├─ 📂 features/            <-- Módulos de Funcionalidad Específica
│  │  ├─ 📂 auth/             (Inicio de sesión y autenticación)
│  │  ├─ 📂 dashboard/        (Gráficos y KPIs globales)
│  │  ├─ 📂 areas/            (Análisis de estrés por departamento)
│  │  ├─ 📂 quizzes/          (Constructor y motor de evaluaciones)
│  │  ├─ 📂 reports/          (Visualización de informes)
│  │  └─ 📂 users/            (Gestión de personal psicólogo)
│  │
│  ├─ 📂 components/          <-- Componentes Transversales UI
│  │  └─ 📂 layout/           (Sidebar, cabeceras, modales genéricos)
│  │
│  ├─ 📂 pages/               <-- Ensambladores de Rutas (Vistas)
│  │  ├─ 📄 Dashboard.jsx     (Orquesta features/dashboard)
│  │  ├─ 📄 QuizEditor.jsx    (Orquesta features/quizzes)
│  │  └─ 📄 ...
│  │
│  └─ 📂 styles/              <-- Variables CSS y directivas de Tailwind
