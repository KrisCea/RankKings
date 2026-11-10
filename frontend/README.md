# RANKKINGS (frontend)

Plataforma de catálogo y reseñas combinada con funcionalidades de red social.

## Stack tecnológico

**Frontend**
- React + TypeScript
- Vite
- Tailwind CSS v4
- React Router
- TanStack Query (React Query)
- Axios

### Estructura frontend

frontend/src/
├── main.tsx # punto de entrada
├── index.css # estilos globales (Tailwind)
├── app/ # configuración global (router, providers)
├── pages/ # vistas (Home, Login, Register, Profile...)
├── components/
│ ├── layout/ # Navbar, RootLayout
│ └── ui/ # componentes genéricos reutilizables
├── features/ # lógica de negocio agrupada por dominio (auth, users, reviews...)
├── hooks/ # hooks reutilizables generales
├── lib/ # configuración de librerías externas (axios)
├── types/ # tipos TypeScript compartidos
├── constants/ # valores fijos de configuración
└── assets/ # imágenes, iconos propios


## 🚀 Cómo correr el proyecto

### Requisitos

- Node.js compatible con la versión de Vite del proyecto y npm.
- API Gateway y servicios backend disponibles para probar funciones que requieren datos o sesión.

### Preparar el frontend

Desde la raíz del repositorio, instala las dependencias:

```bash
cd frontend
npm install
```

Crea el archivo local de variables de entorno a partir del ejemplo (en PowerShell):

```powershell
Copy-Item .env.example .env
```

Revisa `VITE_API_URL` en `frontend/.env`; por defecto apunta a `http://localhost:8080/api`. Debe ser la URL pública del API Gateway, no la de un microservicio. Si el gateway usa otra dirección, actualízala antes de iniciar la app.

### Ejecutar el frontend

Desde la carpeta `frontend`:

```bash
npm run dev
```

Abre la URL que muestra Vite (por defecto `http://localhost:5173`).

### CAPTCHA en desarrollo

Para probar registro e inicio de sesión, configura una clave pública de Turnstile en `VITE_TURNSTILE_SITE_KEY`. Alternativamente, el bypass local se puede habilitar únicamente en Vite en modo desarrollo:

```dotenv
VITE_DEV_CAPTCHA_BYPASS=true
```

El bypass también requiere `DEV_CAPTCHA_BYPASS=true` en el servicio Identity. No lo habilites en producción; el frontend solo lo muestra durante desarrollo y el backend debe aplicar su propia validación.

### Probar la aplicación

1. Inicia el API Gateway y los servicios backend siguiendo la [guía de implementación del backend](../docs/GUIA_IMPLEMENTACION_BACKEND.md).
2. Ejecuta el frontend y abre `http://localhost:5173`.
3. Prueba la navegación pública: feed, una ficha de obra, una publicación y un perfil.
4. Registra una cuenta o inicia sesión para probar las funciones que requieren autenticación.
5. Para probar la publicación, selecciona **Publicar**, ingresa el ID de una obra existente en el catálogo, elige publicación de obra o reseña, completa el texto y envía el formulario. La app navega a la publicación o ficha creada.

Las operaciones que requieren sesión necesitan que el API Gateway permita credenciales y cookies desde el origen del frontend. Si una petición falla, revisa `VITE_API_URL`, que los servicios estén activos y los errores de red en las herramientas de desarrollador del navegador.

### Comprobaciones automatizadas

No hay un script de pruebas unitarias o E2E configurado actualmente. Para comprobar tipos, compilación de producción y lint:

```bash
npm run build
npm run lint
```

El build puede mostrar un aviso de tamaño del bundle; la compilación sigue siendo válida si el comando termina correctamente.

### Paleta de colores:

Esta paleta está diseñada para mantener un equilibrio elegante y un contraste accesible, adaptando el morado según el tema y reservando el dorado para interacciones clave.

## Modo Claro

| Elemento UI | Color (Hex) | Uso y Fundamento |
| :--- | :--- | :--- |
| **Fondo Principal** | `#FBFBFE` | Blanco con matiz púrpura (1%). Unifica térmicamente sin cansar la vista. |
| **Superficies** | `#FFFFFF` | Blanco puro. Crea elevación en tarjetas y separaciones naturales. |
| **Texto Principal** | `#1A1625` | Púrpura casi negro. Reduce la fatiga visual frente al negro `#000000`. |
| **Primario** | `#6B46C1` | Morado sólido. Alto contraste sobre claro; ideal para headers o enlaces. |
| **Acento** | `#D69E2E` | Dorado ocre oscuro. Muy legible para botones secundarios o etiquetas. |

## Modo Oscuro

| Elemento UI | Color (Hex) | Uso y Fundamento |
| :--- | :--- | :--- |
| **Fondo Principal** | `#13111C` | Púrpura profundo casi negro. Brinda una sensación *premium*. |
| **Superficies** | `#1E1B2E` | Tono más claro que el fondo para modales, tarjetas y jerarquía. |
| **Texto Principal** | `#E2E8F0` | Gris azulado. Previene el deslumbramiento del blanco puro `#FFFFFF`. |
| **Primario** | `#9F7AEA` | Morado pastel desaturado. No "vibra" en la pantalla oscura. |
| **Acento** | `#ECC94B` | Dorado brillante. Foco de atención perfecto para botones CTA. |

---





La URL debe apuntar a un backend compatible con los endpoints utilizados por cada módulo.