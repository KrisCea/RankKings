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
- JDK 25 para ejecutar el backend local.

### Iniciar el backend

El backend vive en el repositorio separado `rankkings-backend`. En el layout de desarrollo habitual, ambos checkouts están bajo la misma carpeta:

```text
RankKings FullStack\
├── rankkings-backend\
└── RANKKINGS\
    └── frontend\
```

Desde `RANKKINGS\frontend`, inicia sus cuatro servicios con el script del backend:

```powershell
Set-Location ..\..\rankkings-backend
.\scripts\start-local.ps1
```

Se abrirá una ventana de PowerShell por servicio. Déjalas abiertas mientras desarrollas. El Gateway (`8080`) es la URL que debe usar el frontend; Identity (`8081`), Catalog (`8082`) y Social (`8083`) son servicios internos. El script configura el perfil `local` y activa opciones de desarrollo para CAPTCHA y verificación de correo; no las uses en producción.

Si tus checkouts están en otras carpetas, ejecuta el mismo script desde la raíz de `rankkings-backend`. Consulta la [guía del backend](../../rankkings-backend/docs/DEVELOPER_GUIDE.md) para perfiles, pruebas, configuración y arquitectura.

### Preparar y ejecutar el frontend

Desde la raíz del repositorio, instala las dependencias:

```bash
cd frontend
npm ci
```

Si aún no existe `.env`, créalo desde el ejemplo (PowerShell):

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Configura `VITE_API_URL` en `frontend/.env` para que apunte al Gateway, no a un microservicio. Se recomienda `http://localhost:8080/api/v1`; el Gateway también conserva `/api` por compatibilidad. Si se usa otra dirección del Gateway, actualízala antes de iniciar.

### Ejecutar el frontend

Desde la carpeta `frontend`:

```bash
npm run dev
```

Abre la URL que muestra Vite (por defecto `http://localhost:5173`).

### CAPTCHA en desarrollo

Por defecto, Vite omite el widget sólo en desarrollo cuando `VITE_API_URL` apunta a `localhost` o `127.0.0.1`; el backend requiere `DEV_CAPTCHA_BYPASS=true` y el perfil `local` o `test`. El frontend no permite omitir captcha cuando el API apunta a un host remoto.

```dotenv
VITE_DEV_CAPTCHA_BYPASS=true
```

Para probar Turnstile de verdad, configura `VITE_TURNSTILE_SITE_KEY` y `VITE_DEV_CAPTCHA_BYPASS=false` en el frontend, además de `TURNSTILE_SECRET` y `DEV_CAPTCHA_BYPASS=false` en Identity. No habilites bypass en producción.

### Verificación de correo

En modo local, por defecto Identity imprime el enlace de verificación en su consola. Para enviar un correo real, configura `RESEND_API_KEY`, `VERIFICATION_FROM_EMAIL` (remitente verificado con Resend) y `VERIFICATION_URL` en el backend. Define `DEV_VERIFICATION_LOGGING=false` en Identity y `VITE_DEV_VERIFICATION_LOGGING=false` en el frontend para que el flujo muestre mensajes de correo enviado. `start-local.ps1` respeta los valores `false` definidos antes de ejecutarlo. No guardes secretos en el repositorio.

### Probar la aplicación

1. Inicia el API Gateway y los servicios backend según los pasos anteriores.
2. Ejecuta el frontend y abre `http://localhost:5173`.
3. Prueba la navegación pública: feed, una ficha de obra, una publicación y un perfil.
4. Registra una cuenta o inicia sesión para probar las funciones que requieren autenticación.
5. Para probar una publicación, selecciona **Publicar**, ingresa el ID de una obra existente en el catálogo y completa el texto. Las imágenes se envían a S3 después de crear el post; los videos y enlaces externos se registran como enlaces HTTPS y se abren fuera de RankKings. Para escribir una reseña, selecciona **Reseña**: se asociará como comentario al post existente de la obra.

Las operaciones que requieren sesión necesitan que el API Gateway permita credenciales y cookies desde el origen del frontend. Si una petición falla, revisa `VITE_API_URL`, que los servicios estén activos y los errores de red en las herramientas de desarrollador del navegador.

Las imágenes admitidas son JPEG, PNG y WebP, hasta 10 MiB por archivo, cuatro adjuntos en total y 20 MiB de imágenes. La carga requiere que Social tenga configurado S3 y que el bucket permita `PUT` desde el origen del frontend con los encabezados `Content-Type` e `If-None-Match`. Los videos no se suben ni se incrustan: solo se guardan enlaces HTTPS externos. Solo el autor de la publicación de obra puede adjuntar o eliminar sus medios.

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