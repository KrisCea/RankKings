# RankKings — guía de implementación del backend

## 1. Propósito y alcance

Este documento es una especificación de trabajo para desarrollar el backend de RankKings en un repositorio separado. Describe qué construir para que el frontend actual pueda conectarse y qué falta para completar el MVP descrito en la especificación de requisitos (ERS) del repositorio frontend.

**Estado de partida:** en el repositorio frontend no hay aplicación backend, microservicios, base de datos, migraciones ni pruebas de backend. Las rutas y modelos de este documento expresan el contrato que el frontend espera o requisitos pendientes; no significan que ya exista un servidor.

El frontend consume su API desde `VITE_API_URL` (por ejemplo, `http://localhost:8080/api`) y envía cookies con `withCredentials: true`. El backend debe exponer una URL base estable `/api` mediante un gateway o una API única. La documentación OpenAPI inicial está en `contracts/openapi/` de este repositorio; al iniciar el repositorio backend, copiarla o versionar allí los cuatro archivos para que sea la fuente de verdad junto al código.

## 2. Decisiones que deben tomarse antes de implementar

- [ ] **Arquitectura de despliegue:** la ERS propone Spring Boot y microservicios con API Gateway. Confirmar ese stack y si habrá cuatro servicios independientes (identity, catalog, social, library) desde el inicio. Si se empieza como monolito modular, preservar los límites de dominio y las mismas rutas para poder separar servicios después.
- [ ] **Identidad:** el frontend hoy espera cookie httpOnly `rk_token`; la ERS menciona proveedor externo (Firebase/Auth0) y JWT. Elegir entre identidad propia y proveedor, y definir quién emite/valida la sesión. El frontend no almacena ni adjunta JWT desde JavaScript.
- [ ] **Ciclo de sesión:** definir duración, renovación, cierre y revocación. Borrar una cookie no revoca un JWT ya copiado; si se elige JWT, especificar expiración corta y mecanismo de revocación/refresh apropiado. Hoy no existe endpoint frontend de refresh.
- [ ] **Errores HTTP:** el frontend busca `{ "code": "...", "message": "..." }`; la ERS pide Problem Details/RFC 7807. Acordar un único formato que incluya `code` y `message` y, si se necesitan, campos estándar `title`, `status`, `detail`. Alinear también `Content-Type`, cliente y OpenAPI.
- [ ] **Persistencia:** la ERS propone PostgreSQL para usuarios/interacciones y MongoDB para catálogo flexible. Confirmar motores y propiedad de cada dato. No introducir una base adicional sin justificarla.
- [ ] **Medios e infraestructura:** escoger almacenamiento de objetos (por ejemplo, GCS o S3), proveedor SMTP y despliegue. Mantener adaptadores para no acoplar la lógica de negocio al proveedor.
- [ ] **Políticas aún no cerradas:** límites de tamaño y tipos de archivo, límites de texto, cálculo exacto de ranking/ponderación, condiciones de contenido destacado, plazos de retención y jurisdicciones regulatorias iniciales.

Las propuestas de Spring Boot, PostgreSQL, MongoDB, Flyway, Docker Compose, Mailpit y almacenamiento cloud son las decisiones descritas por la ERS, no componentes que ya estén instalados.

## 3. Arquitectura y límites de confianza

### Componentes propuestos

1. **API Gateway / API pública:** única entrada del navegador, prefijo `/api`, CORS, límites de tasa, validación de sesión y enrutamiento.
2. **Identity:** registro, sesión, verificación de correo, usuarios, perfiles y relaciones de seguimiento.
3. **Catalog:** obras, categorías, identificadores, colecciones, duplicados, metadatos de portada y consulta de catálogo.
4. **Social:** publicaciones/reseñas, feed, votos, notas, comentarios, likes y compartidos.
5. **Library:** elementos guardados y, para completar el MVP, estados de consumo y listas personales.
6. **PostgreSQL:** entidades relacionales que necesitan restricciones únicas y transacciones (cuentas, seguimientos, interacciones, comentarios, biblioteca, reportes).
7. **MongoDB (si se aprueba):** atributos variables del catálogo por categoría. Definir qué servicio es dueño de cada entidad antes de persistir duplicados entre motores.
8. **Almacenamiento de objetos:** portadas y medios. Los bytes no deben pasar por los microservicios: usar cargas directas con URL firmada y metadatos confirmados por servidor.
9. **Correo y tareas asíncronas:** verificación de cuenta, notificaciones, moderación de medios y procesamiento de portadas.

### Seguridad entre gateway y servicios

- Los servicios internos no deben ser accesibles públicamente; solo el gateway o identidades de servicio autorizadas pueden invocarlos.
- El gateway debe eliminar encabezados entrantes como `X-User-Id` y `X-Username` antes de validarlos e inyectarlos. Nunca confiar en esos valores enviados por el cliente.
- Propagar identidad mediante credenciales verificadas o red privada autenticada. Validar autorización también en el servicio dueño del recurso; el gateway no sustituye reglas de propiedad/rol.
- No guardar secretos en Git ni en valores predeterminados del código. La clave JWT, credenciales de base de datos, claves SMTP, secret key de Turnstile y credenciales de almacenamiento deben venir de un gestor de secretos o variables de entorno protegidas.
- No registrar contraseñas, tokens, cookies, tokens captcha ni datos personales innecesarios.
- Las operaciones autenticadas por cookie requieren protección CSRF apropiada. Configurar CORS con orígenes explícitos y credenciales; nunca combinar credenciales con `Access-Control-Allow-Origin: *`.
- Cookies de producción: `HttpOnly`, `Secure`, `Path=/` y política `SameSite` acorde al dominio real. No fijar `SameSite=Lax` sin validar la topología de despliegue; si frontend y API son cross-site puede requerirse otro atributo y protección CSRF adicional.
- Activar HTTPS fuera del entorno local, límites de payload, validación de entrada, protección contra fuerza bruta y rate limits por IP/cuenta/operación.

## 4. Contrato común de API

- JSON en solicitudes y respuestas; fechas en ISO 8601 UTC (`date-time`).
- Validar todo en servidor: formatos, tamaños, rangos, enums, propiedad del recurso y estado de cuenta.
- Respuestas de error con códigos estables, mensaje seguro para usuario y estado HTTP correcto. No enviar stack traces ni detalles internos.
- Usar `401` cuando falta o expira autenticación, `403` cuando la cuenta autenticada carece de permiso, `404` para recurso ausente y `409` para conflictos únicos/de estado. No filtrar si una cuenta existe en flujos de recuperación/verificación.
- Usar UUID u otro identificador opaco estable y documentarlo; no mezclar formatos entre servicios.
- Definir una política uniforme de `POST` repetidos, reintentos, concurrencia y operaciones idempotentes.
- Exponer OpenAPI con esquemas completos, restricciones, autenticación, errores, ejemplos y respuestas para cada operación. Validar los YAML en CI.
- Las consultas públicas pueden aceptar sesión opcional para devolver campos personalizados (`votedByCurrentUser`, `savedByCurrentUser`, `currentUserRating`). Para visitantes esos campos deben tener valores deterministas (`false`/ausente según contrato).

## 5. Endpoints que el frontend ya consume

Todas estas rutas se publican bajo `/api`; los paths de la tabla son relativos a esa base. Los cuerpos y modelos completos están en los OpenAPI. Respetar método HTTP, forma de respuesta y acceso; no sustituir PUT/DELETE por un toggle.

### Identity

| Método | Ruta | Acceso | Comportamiento/respuesta |
|---|---|---|---|
| `POST` | `/auth/register` | Público | Recibe `displayName`, `username`, `email`, `password`, `captchaToken`; devuelve `{email}` y envía verificación. |
| `POST` | `/auth/login` | Público | Recibe email/contraseña; establece cookie y devuelve objeto `User`, nunca el JWT en JSON para el flujo del navegador. |
| `POST` | `/auth/logout` | Sesión | Revoca sesión según estrategia y expira cookie; frontend no necesita cuerpo de respuesta. |
| `POST` | `/auth/verify-email` | Token de verificación | Recibe `{token}`; consume token de un solo uso. |
| `POST` | `/auth/resend-verification` | Público, rate-limited | Recibe `{email}`; respuesta no revela existencia de la cuenta. |
| `GET` | `/users/me` | Sesión | Devuelve usuario actual; responde `401` al visitante. |
| `GET` | `/users/me/share-contacts` | Sesión | Devuelve `UserSummary[]`. |
| `GET` | `/users/{username}` | Público, sesión opcional | Devuelve `UserProfile`; buscar por username, no por UUID. |
| `POST` | `/users/{username}/follow` | Sesión | Alterna seguimiento; devuelve `UserProfile` actualizado. |

### Catalog

| Método | Ruta | Acceso | Comportamiento/respuesta |
|---|---|---|---|
| `GET` | `/items/{itemId}` | Público, sesión opcional | Devuelve `RankableItem`, incluyendo marcas personalizadas para usuario actual. |
| `GET` | `/items/{itemId}/children` | Público, sesión opcional | Devuelve obras hijas de una colección en orden estable. |

### Library

| Método | Ruta | Acceso | Comportamiento/respuesta |
|---|---|---|---|
| `GET` | `/users/me/saved` | Sesión | Devuelve `SavedItem[]`, cada elemento `{item, savedAt}`. |
| `PUT` | `/items/{itemId}/save` | Sesión | Guarda idempotentemente; devuelve `RankableItem` con `savedByCurrentUser=true` y contador actualizado. |
| `DELETE` | `/items/{itemId}/save` | Sesión | Quita idempotentemente; devuelve `RankableItem` con `savedByCurrentUser=false` y contador actualizado. |

### Social

| Método | Ruta | Acceso | Comportamiento/respuesta |
|---|---|---|---|
| `GET` | `/posts` | Público, sesión opcional | Feed actual `Post[]`; agregar paginación es una tarea pendiente y requiere actualizar el cliente. |
| `GET` | `/posts/featured` | Público, sesión opcional | Publicaciones destacadas `Post[]`. |
| `GET` | `/posts/{postId}` | Público, sesión opcional | Detalle `Post`. |
| `GET` | `/users/{username}/posts?kind=item\|review` | Público, sesión opcional | Publicaciones del perfil; filtrar por username y tipo. |
| `GET` | `/items/{itemId}/reviews` | Público, sesión opcional | `Post[]` con `kind=review`. |
| `POST` | `/posts/{postId}/vote` | Sesión | Alterna voto; devuelve `Post` actualizado. Es un toggle no idempotente. |
| `PUT` | `/posts/{postId}/rating` | Sesión | Recibe `{score}` entre 1 y 10; crea o reemplaza nota; devuelve `Post`. |
| `DELETE` | `/posts/{postId}/rating` | Sesión | Elimina la nota del usuario; devuelve `Post`. |
| `POST` | `/posts/{postId}/share` | Sesión | Recibe `{recipientId}`; comparte y devuelve `Post`. |
| `GET` | `/posts/{postId}/comments` | Público, sesión opcional | Devuelve comentarios con marca `likedByCurrentUser`. |
| `POST` | `/posts/{postId}/comments` | Sesión | Recibe `text` y, opcionalmente, `parentId` y `replyToUsername`; devuelve comentario creado. |
| `POST` | `/comments/{commentId}/like` | Sesión | Alterna like y devuelve comentario actualizado. |

### Enrutamiento en gateway

Las rutas no deben derivarse solo por prefijo. Algunas pertenecen a un servicio distinto del que su prefijo sugiere:

- `/users/me/saved` → Library, antes de `/users/**` → Identity.
- `/users/{username}/posts` → Social, antes de `/users/**` → Identity.
- `/items/{itemId}/reviews` → Social, antes de `/items/**` → Catalog.
- `/items/{itemId}/save` → Library, antes de `/items/**` → Catalog.
- `/auth/**` y `/users/**` restantes → Identity.
- `/posts/**` y `/comments/**` → Social.
- `/items/**` restantes → Catalog.

Crear pruebas del gateway que verifiquen rutas, método, prefijo quitado/reenviado y encabezados para cada caso. Configurar `/api` una sola vez: si el gateway quita ese prefijo, los controladores internos reciben paths como `/auth/login`, `/posts` y `/items/{id}`.

## 6. Modelos y reglas de negocio

Implementar DTOs equivalentes a los modelos que usa TypeScript (`frontend/src/types/`). No serializar entidades ORM directamente.

- **User:** `id`, `username`, `displayName`, `avatarUrl`, `accountType` (`individual|business`), `isVerifiedBusiness`, `isAuthenticated`, `role` (`user|admin`).
- **UserProfile:** campos públicos de UserSummary, `bio`, `followersCount`, `followingCount`, `postsCount`, `isFollowedByCurrentUser`.
- **RankableItem:** `id`, `category`, `title`, `description`, `creator`, `uploadedBy`, `year`, `coverUrl`, `identifiers`, `verificationStatus`, `postId`, `averageRating`, `ratingsCount`, `parentId`, `position`, `childrenCount`, `childrenAverageRating`, `savedByCurrentUser`, `savesCount`, `externalLinks`, `createdAt`.
- **Post:** `id`, `kind` (`item|review`), `category`, `author`, `caption`, `media[]`, `rankableItem`, `review.authorScore`, `votesCount`, `votedByCurrentUser`, `averageRating`, `ratingsCount`, `currentUserRating`, `commentsCount`, `sharesCount`, `moderationStatus` (`approved|pending|rejected`), `createdAt`, `isReelEligible`.
- **Comment:** `id`, `postId`, `parentId` opcional, `replyToUsername` opcional, `author`, `text`, `likesCount`, `likedByCurrentUser`, `createdAt`. Limitar respuestas a un nivel para el MVP.
- **SavedItem:** `item` completo y `savedAt`.
- **UserSummary:** `id`, `username`, `displayName`, `avatarUrl`, `accountType`, `isVerifiedBusiness`.

Reglas mínimas:

- Normalizar email y username, imponer unicidad en base de datos y definir reglas de cambio de username.
- Nota válida de `1.0` a `10.0`; como máximo una nota vigente por usuario/objeto. Persistir nota bruta y calcular promedios en servidor. La ERS diferencia nota de obra y valoración de utilidad de reseña; precisar cuál aplica a cada `PostKind`.
- Votos, likes y guardados deben tener restricciones únicas por usuario/objeto; las operaciones tipo toggle deben actualizar estado y contadores de forma atómica.
- Guardar/quitar con PUT/DELETE debe ser idempotente incluso en solicitudes simultáneas; los contadores no deben incrementarse dos veces por reintentos.
- El backend debe devolver consistentemente los campos de estado actual del usuario en respuestas públicas autenticadas.
- En una reseña, validar la obra referida y el vínculo entre el autor, la nota y el post; definir si el usuario puede tener más de una reseña por obra.
- Eliminar/ocultar/fusionar una obra no debe corromper posts, votos, ratings, listas ni referencias; definir política de borrado lógico y auditoría.

## 7. Funcionalidades que faltan para completar el MVP de la ERS

No forman parte de los 26 métodos actuales o no tienen flujo de frontend conectado. Diseñar e implementar API adicional y luego coordinar el trabajo de interfaz.

### Crear obras y publicaciones

- Endpoints para crear/editar/eliminar obra y crear publicación/reseña; distinguir borrador, pendiente de moderación, publicada y rechazada.
- Validar categoría, título, creador, año, enlaces externos, hijos de colección y campos específicos por categoría.
- Categorías configuradas en frontend: `music`, `podcasts`, `books`, `movies`, `concerts`, `videogames`, `art`, `boardgames`. El frontend marca activas música, películas, libros y arte. Decidir qué acepta el backend por estado de despliegue y no confiar en el estado que envía el navegador.
- La validación en cliente no es autoridad: `ENFORCE_REQUIRED_IDENTIFIERS` está desactivado actualmente. Validar requeridos, patrones y reglas de certificación en servidor.
- Rechazar duplicado por categoría + título + creador, normalizando mayúsculas, tildes y espacios; respaldar con índice único o mecanismo de unicidad equivalente.
- Crear vínculo entre obra y su post inicial. Si Catalog y Social son servicios separados, no asumir que una transacción SQL abarca ambos: diseñar una saga/outbox, reintentos e idempotencia para evitar obras sin post o posts huérfanos.
- Duplicados de portada: calcular pHash en servidor, definir umbral/distancia, almacenar hash y mandar coincidencias a revisión; no confiar en hash calculado por cliente.

### Archivos multimedia

- Endpoint autenticado que emita URL de carga firmada de vida corta para objeto, con tipo, tamaño, usuario y destino restringidos.
- CORS del bucket limitado a dominios del frontend; impedir lectura/listado/escritura pública innecesaria.
- Confirmar la carga antes de asociar archivo a obra/post; verificar ownership, MIME real, extensión, tamaño, dimensiones y estado del archivo.
- Procesar thumbnail/dimensiones y análisis de contenido en servidor o worker; guardar solo clave/URL segura y metadatos en base de datos.
- Aplicar análisis de contenido y política de material prohibido; definir cuarentena y flujo de moderación.

### Feed, búsqueda y rankings

- Paginación por cursor (preferible para feed cambiante); documentar orden estable, cursor y límite. ERS plantea máximo de 20 resultados por página. Actualizar frontend para consumir `nextCursor`/`hasMore`.
- Feed unificado por categoría, estado de moderación, fecha/interacción y reglas antiabuso; evitar que pendientes/rechazados sean públicos.
- Endpoint de búsqueda de obras y creadores con texto, filtros, orden, paginación y tolerancia a errores tipográficos.
- Endpoint de ranking por categoría y ventana temporal si aplica; documentar fórmula ponderada, mínimo de votos y desempates. La fórmula no está suficientemente definida en la ERS; acordarla antes de implementarla.
- Definir selección y actualización de destacados; no basarla en un campo controlado por cliente.

### Biblioteca personal y moderación

- Estados visto/jugado, pendiente y favorito; reglas de exclusión mutua según ERS.
- Listas personalizadas: crear, consultar, renombrar, ordenar, agregar/quitar elementos, acceso público/privado y enlace compartido; autorizar cada lectura según privacidad.
- Reportes de obra/post/comentario con motivo; impedir reportes duplicados del mismo usuario/recurso según política acordada.
- Cola de moderación filtrable; acciones de aprobar, ocultar, rechazar, fusionar y eliminar.
- Al fusionar, migrar/reasignar referencias y preservar notas/interacciones conforme a reglas auditables; notificar al autor.
- Roles y permisos de moderador/admin separados de usuario normal; auditoría inmutable con actor, fecha, acción, recurso y motivo.

## 8. Identidad, privacidad y abuso

- Registro debe validar Turnstile con la **secret key solo en backend**, límites de frecuencia, unicidad de correo/username y envío seguro de correo.
- Contraseñas, si son propias, se almacenan solo con hash adaptativo moderno y configuración segura; nunca cifrado reversible ni logs. Respetar política de longitud/compromiso definida.
- Verificación y recuperación: tokens aleatorios de un solo uso, expiran, se almacenan de forma no reutilizable (hash del token), invalidación tras uso; respuesta genérica que no revela si el correo existe.
- Login: errores genéricos, rate limits, protección contra credential stuffing; distinguir cuenta no verificada sin filtrar información de más.
- OAuth/Google es requisito de la ERS pero no está implementado en la API actual; decidir alcance y flujo seguro de callback/estado.
- Verificación de negocio/creador: solicitudes, revisión y decisión administrativa con auditoría; cliente no puede otorgar su propio sello.
- Suspensión/bloqueo debe impedir acciones y, según decisión, revocar sesiones vigentes.
- Eliminar cuenta: definir exportación, anonimización de contenido público, cascada/retención legal, cierre de sesión y borrado en objetos/proveedores.
- La ERS incluye edad mínima y requisitos de Chile/UE; validar con asesoría legal antes de lanzamiento. Si hay proveedor de edad, confiar solo en webhook server-to-server firmado, con validación de firma, timestamp, replay y estado; nunca en un booleano del navegador.

## 9. Datos, consistencia y migraciones

Definir ownership y esquema antes de codificar. Como mínimo, modelar:

- Cuenta, perfil, roles, estado de verificación, sesiones/tokens y tokens de verificación.
- Creador y relación opcional con cuenta.
- Obra, identificadores normalizados, jerarquía padre/hijo, estado, medios y hashes.
- Post/review y estado de moderación.
- Voto, rating, comentario y like de comentario.
- Seguimiento y compartido.
- Guardados, estados de consumo y listas personales.
- Reportes, casos/acciones de moderación y auditoría.

Requisitos de almacenamiento:

- Restricciones únicas para email/username normalizados, identificadores de obra, voto/rating/like/guardado/seguimiento por pareja y reporte duplicado según política.
- Índices para feed, lookup de username, catálogo por categoría, búsqueda, hijos de colección y consultas de biblioteca.
- Migraciones versionadas e inmutables (la ERS sugiere Flyway para PostgreSQL); ningún cambio manual en producción.
- Backups probados mediante restauración, retención definida y migraciones con estrategia segura de despliegue.
- Para contadores y promedios, escoger fuente de verdad. Si se materializan, actualizar transaccionalmente o reconstruir; evitar valores divergentes por reintentos.
- En microservicios, cada servicio es dueño de su persistencia. No escribir directamente en base de datos ajena ni prometer transacciones distribuidas; usar eventos/outbox y reconciliación para consistencia eventual cuando corresponda.

## 10. Entornos, despliegue y operación

- Proveer configuración local reproducible (por ejemplo, Docker Compose para bases, gateway, servicios y Mailpit); incluir datos semilla seguros, sin cuentas/secretos de producción.
- Separar configuración local, test, staging y producción. No versionar `.env` con secretos.
- Configurar health/readiness endpoints, apagado ordenado, timeouts, reintentos acotados y circuit breakers para dependencias remotas.
- Logs estructurados con request/correlation ID y contexto de servicio; métricas de latencia/errores/colas/DB; trazas distribuidas si se separa en servicios.
- Alertas, backups, plan de recuperación, retención y procedimiento para incidentes.
- CI: formato/lint, build, pruebas, escaneo de dependencias/secretos, validación OpenAPI y migraciones contra bases efímeras.
- CD a staging y producción con aprobación, rollout/rollback y migraciones compatibles con versiones simultáneas.
- La ERS propone Firebase Hosting, Cloud Run, Cloud SQL, MongoDB Atlas y GCS; confirmar proveedor y región, no asumir que esas cuentas/recursos ya existen.

## 11. Pruebas necesarias

- **Unitarias:** validaciones, permisos, fórmulas, normalización, estado de moderación y reglas de categorías.
- **Integración:** persistencia real efímera (Testcontainers si se usa Spring), migraciones, constraints únicos, consultas y transacciones.
- **API/contrato:** verificar request/response, códigos, cookies, errores y OpenAPI; incluir regresión para las 26 operaciones listadas.
- **Gateway:** probar enrutamiento cruzado, CORS/preflight, autenticación, eliminación de headers falsos y propagación de identidad.
- **Seguridad:** acceso anónimo/autenticado/rol incorrecto, IDOR, CSRF, abuso de rate limits, payload inválido, carga maliciosa y exposición de secretos.
- **Concurrencia:** dos ratings, votos, follows o guardados simultáneos; garantizar unicidad y contadores coherentes.
- **Flujos E2E:** registro/verificación/login/logout; visitante consulta feed/perfil/obra; guardar/quitar; votar/calificar; comentar/responder; compartir; moderar y rechazar un duplicado.
- La ERS propone JUnit 5, Mockito, Testcontainers y objetivo de cobertura backend de 70%; acordar la métrica y priorizar cobertura de reglas críticas, no solo porcentaje.

## 12. Orden recomendado de implementación

### Fase 0 — contrato y decisiones

- [ ] Copiar `contracts/openapi/*.yaml` al nuevo repositorio.
- [ ] Revisar cada contrato con frontend; fijar formato de errores, cookie/sesión, códigos HTTP y paginación.
- [ ] Confirmar stack, arquitectura inicial, categorías activas, proveedores e invariantes de datos.
- [ ] Crear ADRs breves para decisiones que afectan autenticación, bases y consistencia entre servicios.

### Fase 1 — base ejecutable

- [ ] Crear proyecto, configuración local y pipeline CI.
- [ ] Levantar base(s) y correo de prueba; crear migraciones iniciales.
- [ ] Implementar gateway/API, CORS, sesión, control de acceso, errores y health checks.
- [ ] Añadir validación automática de OpenAPI y pruebas de routing.

### Fase 2 — conectividad mínima con frontend

- [ ] Implementar registro, login, logout, `GET /users/me`, verify y resend.
- [ ] Implementar perfil, posts por usuario, follows y contactos para compartir.
- [ ] Implementar catálogo de lectura, children y post/reviews.
- [ ] Implementar feed, destacados, detalle, comentarios, rating, vote, share y likes.
- [ ] Implementar biblioteca GET/PUT/DELETE con respuestas completas.
- [ ] Conectar el frontend en local y verificar todos sus estados anónimo/autenticado.

### Fase 3 — MVP de publicación y descubrimiento

- [ ] CRUD/publicación de obras y posts, campos por categoría, duplicados e identificadores.
- [ ] Carga firmada y procesamiento/moderación de medios.
- [ ] Feed paginado, búsqueda y rankings.
- [ ] Estados de consumo y listas personalizadas.
- [ ] Reportes, cola de moderación, fusión, auditoría y roles.

### Fase 4 — producción

- [ ] Completar privacidad/legal, recuperación de cuenta, Google SSO y verificación de creador según alcance.
- [ ] Completar métricas, alertas, backups/restauración, pruebas de carga/seguridad y runbooks.
- [ ] Validar staging con E2E y desplegar mediante rollout reversible.

## 13. Criterio de terminado

- Las APIs del frontend están implementadas y concuerdan con los contratos OpenAPI versionados.
- Todas las entradas y permisos se validan en backend; las restricciones críticas existen también en persistencia.
- Ninguna operación devuelve éxito antes de persistir el resultado requerido o aceptar explícitamente un trabajo asíncrono.
- Reintentos y solicitudes concurrentes no duplican cuentas, interacciones, archivos ni contadores.
- El gateway y los servicios pasan pruebas de autorización, CORS/CSRF, routing y errores.
- Entorno local permite ejecutar backend y frontend sin secretos productivos.
- Los requisitos Must pendientes de la ERS están completados o se han excluido del MVP con aprobación documentada.

## 14. Referencias del repositorio frontend

- Contratos HTTP iniciales: `contracts/openapi/identity-service.yaml`, `catalog-service.yaml`, `library-service.yaml`, `social-service.yaml`.
- Cliente HTTP y configuración de sesión: `frontend/src/lib/axios.ts`.
- Errores esperados por la interfaz: `frontend/src/lib/errors.ts`.
- DTOs consumidos: `frontend/src/types/`.
- Llamadas HTTP por dominio: `frontend/src/features/*/api.ts`.
- Categorías y requisitos de identificadores: `frontend/src/categories/`.
- Requisitos funcionales, no funcionales y arquitectura propuesta: secciones 3–13 de `README.md`.
