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

### Frontend

(Estando en /frontend)

```bash
npm install
npm run dev
```

Corre en `http://localhost:5173`

### Variables de entorno

Copia `.env.example` a `.env` dentro de `frontend/` y completa los valores. El frontend consume
la API configurada en `VITE_API_URL`; las llamadas están agrupadas por dominio en
`src/features/*/api.ts` y los componentes acceden a ellas mediante hooks.

VITE_API_URL=http://localhost:8080/api
VITE_TURNSTILE_SITE_KEY=


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