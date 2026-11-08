# RankKings: estado del proyecto y pendientes de backend

## Alcance y estado revisado

Este documento describe el código presente en el repositorio y contrasta sus contratos con la especificación de requisitos (ERS) del `README.md`. La revisión se limita a este repositorio: actualmente contiene una aplicación frontend React/TypeScript, no un servicio backend. Por lo tanto, los endpoints descritos abajo son contratos que el frontend intenta consumir, no evidencia de que ya exista un servidor que los implemente.

Para construir el backend en otro repositorio, usa la [guía de implementación del backend](GUIA_IMPLEMENTACION_BACKEND.md), que reúne requisitos, endpoints, arquitectura, seguridad, pruebas y fases de trabajo.

El frontend organiza el código por dominio y centraliza las solicitudes HTTP. No se encontraron fuentes de backend, migraciones, configuración Docker/Compose ni pruebas de código fuente en el repositorio. La especificación sí propone Spring Boot, un gateway, MongoDB, PostgreSQL, almacenamiento de objetos y despliegue cloud; esas propuestas todavía no están representadas aquí como una implementación.

Se añadieron contratos OpenAPI iniciales para los 26 métodos HTTP que consume hoy la interfaz:
[identidad](../contracts/openapi/identity-service.yaml) (9), [catálogo](../contracts/openapi/catalog-service.yaml) (2),
[biblioteca](../contracts/openapi/library-service.yaml) (3) y [social](../contracts/openapi/social-service.yaml) (12).
Son contratos propuestos, no una API desplegada ni una especificación ya validada contra servicios.

## Qué contiene el frontend

- **Tecnología:** React 19, TypeScript, Vite, React Router, TanStack Query, Axios, Tailwind CSS v4, React Hook Form y Zod.
- **Vistas y rutas:** `/` (inicio/feed), `/login`, `/register`, `/profile/:username`, `/movie/:id`, `/post/:id`, `/item/:id`, `/library` y `/verify-email`.
- **Dominios:** autenticación, usuarios/perfiles, publicaciones y reseñas, obras catalogables, comentarios, biblioteca personal y componentes para compartir.
- **Categorías configuradas:** música, podcasts, libros, películas, conciertos, videojuegos, arte y juegos de mesa. Música, películas, libros y arte están marcadas como activas; las otras cuatro están inactivas en el registro actual.
- **Modelos de respuesta que espera el cliente:** `User`, `UserProfile`, `UserSummary`, `Post`, `RankableItem`, `Comment` y `SavedItem`, definidos en `frontend/src/types/`.
- **Estado y caché:** TanStack Query gestiona consultas y mutaciones; algunas mutaciones actualizan o invalidan caché. El tema se persiste en `localStorage`.
- **Configuración local:** copiar `frontend/.env.example` a `frontend/.env` y configurar `VITE_API_URL` y, para mostrar Turnstile, `VITE_TURNSTILE_SITE_KEY`. La clave secreta de Turnstile nunca debe ir al cliente.

### Ejecutar y comprobar el frontend

Desde `frontend/`:

```bash
npm install
npm run dev
npm run build
npm run lint
```

El cliente usa `VITE_API_URL` como base de las rutas HTTP. El ejemplo de entorno no proporciona una URL ni una clave de Turnstile; sin una URL de API válida no se podrán completar las operaciones remotas. `package.json` no define un script de pruebas.

## Contrato HTTP que consume hoy el frontend

Las rutas se concatenan a `VITE_API_URL`; por ejemplo, con `http://localhost:8080/api`, `/posts` se solicita como `http://localhost:8080/api/posts`. Axios envía cookies mediante `withCredentials: true`.

| Método y ruta | Uso en la interfaz | Acceso esperado |
|---|---|---|
| `POST /auth/register` | Registro; cuerpo `RegisterInput` (`displayName`, `username`, `email`, `password`, `captchaToken`); respuesta `RegisterResult` | Público |
| `POST /auth/login` | Inicio con correo y contraseña; respuesta `User` | Público; establece sesión |
| `POST /auth/logout` | Cierre de sesión | Autenticado; invalida sesión |
| `POST /auth/verify-email` | Verificación; cuerpo `{ token }` | Token de verificación |
| `POST /auth/resend-verification` | Reenvío; cuerpo `{ email }` | Público, con límites |
| `GET /users/me` | Usuario de la sesión; ante `401` el frontend lo trata como visitante | Autenticado |
| `GET /users/:username` | Perfil público, contadores y estado de seguimiento | Público |
| `POST /users/:username/follow` | Seguir/dejar de seguir; respuesta `UserProfile` | Autenticado |
| `GET /users/me/share-contacts` | Contactos sugeridos al compartir | Autenticado |
| `GET /users/me/saved` | Obras guardadas; respuesta `SavedItem[]` | Autenticado |
| `GET /users/:username/posts?kind=item\|review` | Publicaciones del perfil | Público |
| `GET /posts` | Feed; respuesta `Post[]` | Público |
| `GET /posts/featured` | Publicaciones destacadas | Público |
| `GET /posts/:postId` | Detalle de publicación | Público |
| `GET /items/:itemId/reviews` | Reseñas de una obra | Público |
| `POST /posts/:postId/vote` | Alterna un voto/like; respuesta `Post` | Autenticado |
| `PUT /posts/:postId/rating` | Guarda nota; cuerpo `{ score }`; respuesta `Post` | Autenticado |
| `DELETE /posts/:postId/rating` | Elimina la nota; respuesta `Post` | Autenticado |
| `POST /posts/:postId/share` | Comparte con `{ recipientId }`; respuesta `Post` | Autenticado |
| `GET /items/:itemId` | Detalle de obra; respuesta `RankableItem` | Público |
| `GET /items/:itemId/children` | Obras hijas de una colección | Público |
| `PUT /items/:itemId/save` | Guarda obra; respuesta `RankableItem` | Autenticado |
| `DELETE /items/:itemId/save` | Quita obra guardada; respuesta `RankableItem` | Autenticado |
| `GET /posts/:postId/comments` | Lista de comentarios | Público |
| `POST /posts/:postId/comments` | Crea comentario/respuesta; cuerpo `NewCommentInput` | Autenticado |
| `POST /comments/:commentId/like` | Alterna like a comentario; respuesta `Comment` | Autenticado |

Los tipos de TypeScript describen las formas esperadas de éxito, pero no sustituyen un esquema OpenAPI ni validación del servidor. El frontend no define actualmente una operación para crear/subir una obra o publicación, reportar contenido, buscar, consultar rankings o solicitar una URL firmada para cargar archivos.

## Trabajo pendiente para backend

### Prioridad 0: decidir e implementar la base técnica

1. **Aprobar el contrato de identidad y errores.** La ERS habla de proveedor externo y JWT; el cliente actual espera una cookie httpOnly y `withCredentials`. Los OpenAPI proponen cookie `rk_token` y dejan Bearer para herramientas; falta decidir el proveedor de identidad y documentar emisión, renovación, expiración e invalidación de sesión. El cliente actual no lee ni guarda JWT.
2. **Alinear errores con el contrato propuesto.** `frontend/src/lib/errors.ts` busca `{ code, message }`; la ERS pide RFC 7807 (`title`, `status`, `detail`). Los OpenAPI proponen `code` y `message`, con los campos RFC opcionales. Confirmar esta compatibilidad, definir códigos estables para autenticación/captcha y aplicar el formato de manera consistente.
3. **Crear la aplicación backend y el punto de entrada.** Implementar el gateway/API base que corresponda a `VITE_API_URL`, autorización centralizada y enrutamiento a dominios. La ERS propone Spring Boot/Spring Cloud Gateway, pero el stack debe confirmarse como decisión de implementación.
4. **Preparar entornos reproducibles y persistencia.** Configurar PostgreSQL y MongoDB según la separación conceptual de la ERS; migraciones versionadas (la ERS propone Flyway); configuración por entorno, secretos fuera del repositorio y entorno local con Docker Compose. Incorporar Mailpit u otro SMTP de pruebas.
5. **Seguridad de sesión y transporte.** HTTPS; CORS restringido a los orígenes permitidos y con credenciales; atributos seguros de cookie (`HttpOnly`, `Secure`, `SameSite` apropiado); estrategia CSRF para operaciones mutables; controles de autorización por recurso/rol y límites de tasa. No redirigir todos los `401` globalmente: el frontend permite navegación pública y espera `401` en `/users/me`.
6. **Validar y mantener la especificación OpenAPI.** Revisar los contratos iniciales en `contracts/openapi/` contra el backend y `frontend/src/features/*/api.ts`/`frontend/src/types/`; completar ejemplos, políticas de paginación y reglas de sesión; añadir validación automática al CI.

### Prioridad 1: cubrir las operaciones ya usadas por la interfaz

1. **Autenticación y cuentas:** implementar registro, login, logout, consulta de sesión, verificación y reenvío de correo. Hacer cumplir unicidad de correo/usuario, hash seguro de contraseñas si se administran localmente, validación de contraseñas, protección contra enumeración de cuentas y expiración/uso único de tokens. Verificar el token de Turnstile en servidor (la site key pública no es prueba de validación). Respetar los códigos de error que consume el frontend.
2. **Usuarios y perfiles:** implementar perfiles públicos y `/users/me`, seguimiento idempotente o conmutativo según el contrato, contadores coherentes, contactos para compartir y manejo de avatar/biografía. La edición de perfil no está conectada en la API actual aunque aparece en la ERS.
3. **Catálogo de obras:** implementar lectura de obra, hijos de colección y reseñas, con respuesta compatible con `RankableItem`. Validar en servidor categorías, campos e identificadores; no confiar en `validateIdentifiers` del cliente, porque `ENFORCE_REQUIRED_IDENTIFIERS` está desactivado actualmente.
4. **Feed y publicaciones:** implementar feed, destacados, detalle y publicaciones de usuario, con estados de moderación y campos de `Post`. Definir de forma consistente cómo una publicación de tipo `item` se relaciona con su `RankableItem`, y cómo se crea una reseña.
5. **Interacciones:** implementar voto/like, nota, quitar nota, compartir, comentarios, respuestas y likes de comentario. Asegurar unicidad de nota y voto por usuario/objeto, límites y reglas de puntuación, contadores/medias atómicos y autorización. La ERS establece nota de 1.0 a 10.0, comentario anidado a un nivel y controles contra manipulación.
6. **Biblioteca:** implementar guardar/quitar y la lectura de la biblioteca con los campos y marcas de sesión que requieren `RankableItem`/`SavedItem`. Debe ser segura frente a duplicados de solicitudes concurrentes.

### Prioridad 1: cerrar brechas del MVP descrito en la ERS

Estas funcionalidades son requisitos Must en la ERS, pero no hay una API cliente implementada para ellas en el código actual:

- **Creación/subida de obras y publicaciones**, validación categoría/título/autor, control de duplicados (normalización de mayúsculas, tildes y espacios e índice único), y flujo de publicación.
- **Carga segura de portadas y medios.** La ERS propone URL firmada de corta duración para almacenamiento de objetos, CORS limitado del bucket, límites de tamaño/tipo, metadatos de imagen y pHash. El cliente no tiene hoy flujo de carga ni API de URL firmada.
- **Reportes y moderación:** crear reportes con motivo y evitar reportes duplicados; cola filtrable; aprobar/ocultar/fusionar/eliminar contenido; preservar notas al fusionar; notificar al creador; roles de moderación y auditoría.
- **Rankings por categoría** con promedio ponderado según reglas acordadas y API consumible por el frontend.
- **Búsqueda de obras y creadores** con filtros y tolerancia a errores tipográficos.
- **Feed paginado:** la ERS pide scroll infinito y máximo 20 elementos por página, mientras que `GET /posts` y `usePosts()` no envían cursor, página ni límite. Definir contrato paginado y actualizar el cliente.
- **Colecciones personales completas:** la ERS pide estados visto/jugado, pendiente y favorito, además de listas personalizadas públicas/privadas; el cliente solo consulta una lista plana de elementos guardados.

### Prioridad 2: requisitos adicionales y operación

- Recuperación de contraseña (respuesta que no revele existencia del correo, enlace de un solo uso y expiración), autenticación con Google, solicitud/gestión administrativa de verificación, suspensión de cuenta e invalidación de sesiones.
- Panel del creador (gestión y estadísticas), notificaciones in-app, exportación y eliminación/anonimización de cuenta. Estas funciones también requieren trabajo de interfaz.
- Cumplimiento legal y privacidad: edad mínima y flujos regulatorios aplicables; si se usa proveedor de verificación de edad, verificar webhook servidor-a-servidor firmado y no aceptar como prueba un valor enviado por el navegador. Definir retención, consentimiento y proceso de eliminación antes del lanzamiento.
- Observabilidad (logs sin secretos ni datos sensibles, métricas, trazas, alertas), copias de seguridad y restauración, políticas de retención, revisión de permisos y procedimiento de incidentes.
- CI/CD, despliegues separados por entorno, gestión de secretos y pruebas de integración/E2E contra backend real o staging.

## Criterios de terminado recomendados para backend

- Cada endpoint consumido está implementado conforme al contrato OpenAPI y tiene prueba de autorización/validación; los contratos iniciales existen en `contracts/openapi/`.
- Las migraciones crean índices y restricciones que garantizan unicidad e integridad, no solo validaciones de aplicación.
- Pruebas automatizadas cubren permisos, casos límite, concurrencia de interacciones, errores y acceso anónimo; la ERS propone JUnit 5, Mockito, Testcontainers y 70% de cobertura backend.
- Los errores, cookies, CORS/CSRF y límites de tasa se validan en pruebas de integración.
- El frontend puede ejecutar sus flujos contra el entorno de desarrollo/staging usando únicamente variables de entorno, sin datos mock ni secretos en el bundle.
- Las decisiones que difieren de la ERS (identidad, persistencia, microservicios, error API y despliegue) quedan aprobadas y documentadas.

## Observaciones de alcance

- Los endpoints de la tabla son inferidos directamente de las llamadas Axios actuales. Las etiquetas de acceso son una recomendación consistente con los flujos de interfaz; deben formalizarse en OpenAPI.
- La ERS incluye aspiraciones y propuestas arquitectónicas que no equivalen a funcionalidades implementadas. Esta lista separa lo que consume hoy el frontend de lo que falta para completar el MVP descrito.
- El frontend no contiene pruebas fuente ni un script `test`; los directorios `coverage/`, `playwright-report/` y `test-results/` no constituyen por sí solos pruebas reproducibles desde el código actual.
