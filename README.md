# 🚀 Safe Movement - Frontend

Rentabilidad y bienestar animal en una interfaz rápida, clara y familiar para monitorear el rancho sin complicar la operación diaria.

## 1. Introducción y Propuesta de Valor

Este frontend es la capa visual del ecosistema de Precision Livestock Farming (PLF) de Safe Movement. Convierte datos técnicos de animales, vallas, dispositivos y elevación en una experiencia de uso directa para tomar decisiones más rápidas y con menos fricción.

La interfaz está pensada para ganaderos de 30 a 60 años que necesitan herramientas conocidas, navegación simple y pantallas claras, sin sacrificar potencia técnica. El objetivo es facilitar la gestión digital del rancho con una curva de aprendizaje baja.

## 2. Tecnologías Utilizadas

- **Core Stack:** React + Vite. Permite arranque rápido, recargas instantáneas y una experiencia de desarrollo ágil.
- **Visualización geoespacial:** `@vis.gl/react-google-maps` sobre Google Maps API para mostrar perímetros de pastoreo, animales y capas topográficas.
- **Diseño y componentes:** Tailwind CSS, MUI y componentes Radix para una interfaz moderna, consistente y ligera.
- **Iconografía:** `lucide-react` para iconos minimalistas y legibles.
- **Estado y utilidades:** React Hooks, `recharts`, `sonner` y utilidades de composición de clases para mantener la UI compacta y expresiva.

## 3. Arquitectura de Pantallas

### Vistas críticas

- **Dashboard:** vista principal con mapa, salud general, alertas y resumen operativo.
- **Valla Virtual:** permite dibujar perímetros y analizar riesgos topográficos.
- **Análisis Clínico con IA:** concentra señales clínicas y contexto operativo para apoyar decisiones.
- **Gemini Concierge:** asistente conversacional para consultas rápidas del estado del hato.
- **Vista de Elevación:** muestra relieve, riesgo por pendientes y zonas críticas.
- **Dispositivos:** administración del hardware de campo y su estado.
- **Animales:** consulta y monitoreo del inventario ganadero.
- **Alertas:** seguimiento de eventos relevantes y navegación hacia las vistas correctivas.

### Qué resuelve cada vista

- **Dashboard:** da una lectura general del rancho en pocos segundos.
- **Valla Virtual:** ayuda a delimitar áreas y visualizar riesgo por geometría o terreno.
- **Análisis Clínico con IA:** centraliza alertas y contexto para reducir tiempo de diagnóstico.
- **Gemini Concierge:** traduce preguntas naturales en respuestas operativas.
- **Elevación:** expone la topografía para decisiones sobre pastoreo, vallas y seguridad.

## 4. Características Especiales

### Modo Offline y resiliencia rural

El frontend está preparado para escenarios con conectividad irregular. Su diseño favorece estrategias de sincronización diferida tipo Store & Forward: el usuario puede capturar o revisar información y el sistema prioriza la continuidad operativa cuando la red vuelve a estar disponible.

### Análisis de riesgo local

El análisis topográfico se apoya detrás de cámaras en OpenTopoData, que puede ejecutarse vía Docker o como servicio accesible por URL. El frontend consume ese resultado indirectamente, sin cargar esa complejidad en la experiencia de uso, para mantener simple la interacción incluso sin internet estable.

## 5. Instalación y Uso

### Requisitos

- Node.js 18 o superior.
- Un backend disponible y configurado.
- API Key de Google Maps si quieres ver mapas reales.

### Clonar e instalar

```bash
git clone <url-del-repositorio>
cd Safe-Moovment/front
npm install
```

### Configuración

Crea un archivo `.env` en `front/` tomando como base [front/.env.example](front/.env.example).

Variables mínimas:

```dotenv
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_MAPS_API_KEY=
```

### Ejecución

```bash
npm run dev
```

### Build de producción

```bash
npm run build
```

## 6. Galería Visual

Espacio recomendado para capturas del frontend en contexto de hackathon.

- Dashboard principal
- Valla Virtual
- Vista de Elevación
- Gemini Concierge

### Capturas sugeridas

- Dashboard: `./docs/screenshots/dashboard.png`
- Valla Virtual: `./docs/screenshots/valla-virtual.png`
- Elevación: `./docs/screenshots/elevacion.png`

> Los jueces suelen valorar cómo la tecnología compleja se traduce en una interfaz simple y funcional.

## 7. Notas de Seguridad

- No subas `.env` al repositorio.
- La API Key de Google Maps debe restringirse por referrer en Google Cloud.
- Si cambias el backend de URL, actualiza `VITE_API_BASE_URL`.
- Mantén credenciales y tokens fuera del código fuente.

## 8. Estructura General

- `src/app/`: lógica de pantallas, APIs y estados de la app.
- `src/app/components/`: componentes visuales reutilizables.
- `src/styles/`: estilos globales, tema y fuentes.
- `public/`: archivos estáticos.

## 9. Desarrollo

- Desarrollo local: `npm run dev`
- Build: `npm run build`

