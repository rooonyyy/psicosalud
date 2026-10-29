# Psicosalud Frontend - Documentación Técnica


Bienvenido a la documentación técnica oficial de **Psicosalud Frontend**. Este proyecto es una plataforma interactiva orientada a la gestión y evaluación de la salud laboral, clima organizacional y control del estrés de los empleados en una empresa.

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Arquitectura y Feature-Sliced Design](#2-arquitectura-y-feature-sliced-design)
3. [Estructura y Árbol de Renderizado](#3-estructura-y-árbol-de-renderizado)
4. [Manejo del Estado y Patrones JSX](#4-manejo-del-estado-y-patrones-jsx)
5. [Servicios y Capa de Datos (API)](#5-servicios-y-capa-de-datos-api)
6. [Modelos de Datos (Detalle de Campos)](#6-modelos-de-datos-detalle-de-campos)

---

## 1. Visión General

La plataforma está dividida en dos grandes portales, garantizando la separación de responsabilidades (Separation of Concerns):
- **Portal del Empleado (`EmployeeLogin`, `EmployeeQuiz`)**: Una interfaz de usuario enfocada en la usabilidad, anónima y protegida por contraseña (código de área), donde los empleados responden evaluaciones cronometradas.
- **Panel Administrativo (Dashboard, Editor de Quizzes)**: Exclusivo para profesionales de salud (psicólogos) donde administran cuestionarios estandarizados y personalizados, revisan estadísticas por departamento y redactan reportes.

---

## 2. Arquitectura y Feature-Sliced Design

El proyecto abandona la tradicional división por tipo de archivo (`/components`, `/containers`) a favor de una arquitectura orientada a funcionalidades o dominios (**Feature-Sliced Design**).

### Estructura de Directorios

```text
📁 src/
 ├── 📁 assets/          # Imágenes, íconos y variables CSS globales.
 ├── 📁 components/      # Componentes transversales y de layout (ej. Sidebar.jsx).
 ├── 📁 data/            # Mocks de datos iniciales y constantes de negocio.
 ├── 📁 features/        # Módulos de la aplicación encapsulados por dominio.
 │    ├── 📁 dashboard/  # -> /api, /components (Gráficos, KPIs)
 │    ├── 📁 quizzes/    # -> /api (quizzes.service.js), /components (QuizCard, Editor)
 │    └── 📁 auth/       # -> Manejo de credenciales de psicólogos.
 ├── 📁 lib/             # Clientes de terceros (ej. inicialización de Insforge/Supabase).
 ├── 📁 pages/           # Vistas principales encargadas de orquestar los Features.
 └── 📁 styles/          # Hojas de estilo modulares.
```
> **Nota de Beneficio:** Modificar el motor del editor de cuestionarios (`features/quizzes`) no impacta el funcionamiento del panel de reportes, manteniendo el código escalable y mantenible.

---

## 3. Estructura y Árbol de Renderizado

La aplicación está controlada por `react-router-dom` dentro de `App.jsx`, implementando un enrutamiento dual.

### Jerarquía de Vistas (JSX)

```text
<Router>
 ├── Rutas Públicas (Renderizado Directo)
 │    ├── /login             -> <Login />
 │    ├── /login-empleado    -> <EmployeeLogin />
 │    └── /evaluacion        -> <EmployeeQuiz />
 │
 └── Rutas Privadas (Protegidas por <AdminLayout>)
      ├── Sidebar Global     -> <Sidebar />
      └── Inyección <main>
           ├── /dashboard    -> <Dashboard />
           ├── /areas        -> <Areas />
           ├── /registros    -> <Reports />
           ├── /usuarios     -> <Users />
           └── /quizzes      -> <QuizList /> y <QuizEditor />
```

---

## 4. Manejo del Estado y Patrones JSX

### 4.1 Flujo Unidireccional ("Lifting State Up")
Para mantener el sincronismo en interfaces complejas como el `QuizEditor.jsx`, el estado recae siempre en el componente padre.
- El Padre define: `const [customQuestions, setCustomQuestions] = useState([])`
- El Padre envía como *Props* al hijo (`QuizEditorPreguntaCard.jsx`): La función `onUpdate(campo, valor)`.
- El Hijo **no posee estado local** del input; solo ejecuta `onUpdate('text', e.target.value)` en el evento `onChange`.

### 4.2 Renderizado Condicional Defensivo
Para evitar bloqueos y fallos visuales (Crashes), el JSX utiliza renderizados seguros y condicionales:
- **Protección de Navegación**: En `EmployeeQuiz.jsx`, se usa `const quizRecibido = location.state?.quiz;`. Si es nulo (acceso directo por URL), JSX hace un retorno temprano (`if (!quizRecibido) return <ErrorView />`) en lugar de provocar una excepción al intentar leer `quizRecibido.id`.
- **Condicionales Ternarios Múltiples**: `isSubmitting ? "Enviando..." : currentStep === questions.length - 1 ? "Finalizar" : "Siguiente"` asegura que el botón del formulario refleje el estado real de la base de datos de forma dinámica.

### 4.3 Inmutabilidad de Colecciones
Toda modificación a Arrays u Objetos utiliza el operador *Spread* (`...`).
- Agregar un área nueva a la selección del quiz: `setAreasSeleccionadas(prev => [...prev, area])`.
- Esto garantiza que el Virtual DOM de React detecte el cambio de referencia y repinte la interfaz de inmediato.

---

## 5. Servicios y Capa de Datos (API)

Las conexiones con el Backend (basado en Supabase/Insforge) residen dentro de la carpeta `features/{domain}/api`.

### Ejemplo: `quizzes.service.js`
Este servicio abstrae las consultas SQL usando el SDK de Javascript de Supabase:
- **`getQuizzes()`**: Extrae los registros y hace un *Join* implícito con la tabla `questions`, mapeando el resultado para contar la cantidad de preguntas disponibles dinámicamente.
- **`updateQuiz()`**: Actualiza los datos principales del cuestionario y, para garantizar consistencia atómica sin cruce de IDs, elimina las preguntas previas en cascada para reinsertar el nuevo lote modificado.
- **`submitQuizResponse()`**: Recibe un Payload con el `area` y un objeto JSON `{ [id_pregunta]: indice_respuesta }`, el cual inserta como respuesta directa del trabajador.

---

## 6. Modelos de Datos (Detalle de Campos)

A continuación, se detalla la estructura de las entidades (basadas en `src/data/`), las cuales reflejan el esquema diseñado para la Base de Datos.

### 6.1 `Quizzes` (Cuestionarios)
Define la estructura de las encuestas psicosociales.
| Campo | Tipo | Comportamiento |
| :--- | :--- | :--- |
| `id` | `Number` | Identificador único. |
| `titulo` / `desc` | `String` | Textos para mostrar en tarjetas (`QuizCard.jsx`). |
| `estado` | `String` | `'asignado'` (bloquea edición, permite respuestas) o `'desasignado'`. |
| `esPreestablecido`| `Boolean`| Si es `true`, la UI desactiva los botones de eliminación/edición de sus preguntas (Plantillas estándar como Maslach Burnout). |
| `duracionMinutos` | `Number` | Multiplicado por 60 para generar el temporizador visual en `EmployeeQuiz.jsx`. |
| `codigoArea` | `String` | El "Token" que los empleados usan como contraseña para ingresar. |
| `areasAsignadas` | `Array<String>` | Lista de los departamentos autorizados a realizarlo. |
| `preguntas_detalle`| `Array<Object>`| Colección de preguntas anidadas. Contiene `text` (String), `type` (Select Options) y `opciones` (Array de Strings, si aplica). |

### 6.2 `Areas` (Departamentos)
Métricas y agregados estadísticos por área laboral.
| Campo | Tipo | Comportamiento |
| :--- | :--- | :--- |
| `nombre` | `String` | Nombre del departamento (ej. "Recursos Humanos"). |
| `bienestar` | `Number` | Porcentaje (0-100) que define las barras del Dashboard. |
| `riesgo` | `String` | `'Crítico'`, `'Moderado'` o `'Bajo'`. Cambia dinámicamente el color a Rojo, Naranja o Verde mediante clases CSS. |
| `tendencia` | `Number` | Valor positivo (verde, hacia arriba) o negativo (rojo, hacia abajo) que define la mejora del área. |
| `factoresRiesgo` | `Array<Object>`| Factores (Ej. "Carga de trabajo") asociados a su propio nivel de urgencia, usados para dibujar métricas secundarias. |

### 6.3 `Reports` (Informes Emitidos)
Historial y trazabilidad de los diagnósticos.
| Campo | Tipo | Comportamiento |
| :--- | :--- | :--- |
| `id` | `Number` | Clave foránea o ID único. |
| `responsable` | `String` | Nombre del profesional de la salud. |
| `iniciales` | `String` | Usado para renderizar el Avatar visual del profesional. |
| `area` | `String` | Área evaluada en dicho reporte. |
| `fecha` | `String` | Timestamp de emisión del resultado analítico. |

---
