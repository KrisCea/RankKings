import axios from "axios";

// BACKEND: la sesión viaja en una cookie httpOnly (el JS no puede leerla, así que un XSS no puede
// robarla). Requiere CORS con credenciales y protección CSRF en el servidor.
// No hay redirección global en 401: el sitio es navegable sin cuenta y /users/me responde 401
// a los visitantes. Cada acción protegida maneja su propio 401.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});