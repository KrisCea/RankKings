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
├── constants/ # valores fijos (rutas, enums)
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

Copia `.env.example` a `.env` dentro de `frontend/` y completa los valores:

VITE_API_URL=http://localhost:8080/api
