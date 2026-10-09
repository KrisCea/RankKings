# RankKings
---

# Especificación de Requisitos de Software (ERS)

# Proyecto: RankKings

**Fecha:** Octubre 2026
**Autor:** @KrisCea

Este documento define los requisitos del MVP de RankKings, una plataforma para puntuar, rankear y descubrir obras de música, arte, películas y libros en un solo lugar.

## 1. Introducción

### 1.1 Propósito

RankKings es un hub digital donde los usuarios catalogan, puntúan, rankean y guardan contenido multimedia diverso, y donde los creadores (emergentes, under y mainstream) llegan a su público mediante un sistema algorítmico. Este ERS especifica qué debe hacer el MVP (Fase 2) y bajo qué restricciones se construye (Fase 3), y sirve como acuerdo entre el equipo, el cliente y quienes validan el producto.

### 1.2 Alcance

El MVP cubre autenticación, subida y catalogación de obras con prevención de duplicados, valoración numérica y likes, colecciones personales y descubrimiento por feed y por categoría. Incluye las categorías Música, Arte, Películas y Libros. El lanzamiento inicial es en Chile y Latinoamérica, con servidores en Santiago; la expansión a Europa, el resto de América y el mundo viene después (sección 12.5). La recomendación por similitud conceptual y sonora con IA queda fuera del MVP, pero la arquitectura se prepara para integrarla.

### 1.3 Definiciones y acrónimos

| Término | Definición |
| --- | --- |
| **ERS** | Especificación de Requisitos de Software

 |
| **HU** | Historia de usuario

 |
| **RF / RNF** | Requisito funcional / no funcional

 |
| **MVP** | Producto mínimo viable

 |
| **Obra** | Pieza de contenido catalogada (canción, álbum, cuadro, película, libro)

 |
| **Sello de verificación** | Marca de oficialidad otorgada por un administrador a un creador

 |
| **pHash** | Hash perceptual de una imagen, usado para detectar portadas duplicadas

 |
| **SSO** | Inicio de sesión único mediante cuenta de Google

 |
| **JWT** | Token firmado que emite el proveedor de identidad

 |
| **Nota** | Puntuación de 1.0 a 10.0 que un usuario asigna a una obra

 |

### 1.4 Referencias

* IEEE 830-1998 e ISO/IEC/IEEE 29148 como guía de estructura del ERS.


* Backlog de producto del MVP (Fase 2) y diseño arquitectónico (Fase 3) de RankKings.



### 1.5 Convenciones

Cada requisito tiene un ID único. Las prioridades siguen MoSCoW: Must (imprescindible en el MVP), Should (importante), Could (deseable). Las HU originales conservan su ID (US1.01, US2.03, etc.); las propuestas nuevas llevan el sufijo (nueva).

---

## 2. Descripción general

### 2.1 Perspectiva del producto

RankKings es una aplicación web independiente, con cliente React y backend de microservicios. Reúne en una sola cuenta lo que hoy está repartido en plataformas separadas por tipo de contenido (música, cine, libros, arte). Su valor está en unificar listas, notas y críticas, y en dar visibilidad a creadores que no tienen espacio en los canales masivos.

### 2.2 Actores del sistema

| Actor | Qué puede hacer | Restricción |
| --- | --- | --- |
| **Visitante** | Navegar por el catálogo, ver fichas, perfiles y rankings

 | No puede interactuar sin cuenta

 |
| **Usuario registrado** | Puntuar, dar like, crear listas ("Visto", "Pendiente", "Favoritos"), comentar, reportar y subir sus propias obras

 | Requiere sesión iniciada

 |
| **Creador / Artista** | Subir obras, gestionar su perfil público y solicitar el sello de verificación

 | No es un rol aparte: es cualquier usuario registrado que sube obras. Puede tener sello "Verificado"

 |
| **Administrador / Moderador** | Gestionar reportes, verificar cuentas, supervisar la plataforma

 | Acceso restringido por rol

 |

### 2.3 Características de los usuarios

Se espera público general con dominio básico de navegación web y de dispositivos móviles. Los creadores pueden ser personas sin formación técnica, por lo que los formularios de subida deben guiar cada campo. Los moderadores necesitan una vista de trabajo clara para resolver reportes.

### 2.4 Restricciones

* **Arquitectura:** microservicios por dominio con separación estricta cliente-servidor y un único punto de entrada (API Gateway).


* **Persistencia políglota:** MongoDB para el catálogo y PostgreSQL para usuarios, votos y ranking.


* **Identidad:** autenticación delegada a un proveedor externo (Firebase Auth o Auth0) con tokens JWT.


* **Stack:** React + TypeScript en el cliente, Spring Boot en el servidor.


* **Alcance de la IA:** la recomendación por similitud no se implementa en el MVP; solo se deja el diseño preparado.



### 2.5 Supuestos y dependencias

* El proveedor de identidad mantiene disponibilidad suficiente para el login con Google.


* Las portadas se suben o se enlazan; la plataforma no aloja catálogos de terceros.


* Los administradores existen desde el lanzamiento para verificar cuentas y atender reportes.


* El alojamiento de imágenes y el costo de infraestructura se definirán antes del despliegue.



---

## 3. Requisitos funcionales

### 3.1 Épica 1: Autenticación e identidad

| ID | Historia | Prioridad | Criterios de aceptación |
| --- | --- | --- | --- |
| **US1.01** | Como visitante, quiero iniciar sesión con correo y contraseña o con mi cuenta de Google, para acceder a las funciones sociales.

 | Must | Con credenciales válidas se recibe un JWT y se accede a la sesión; rutas protegidas redirigen al login si no hay sesión.

 |
| **US1.02** | Como creador, quiero un perfil público con sello de verificación, para que mi público reconozca mi cuenta oficial.

 | Must | El sello se ve en el perfil, en las fichas y tarjetas; solo un administrador puede otorgar o quitar el sello.

 |
| **US1.03** | Como persona nueva, quiero registrarme con correo y contraseña, para crear mi cuenta sin depender de Google.

 | Must | Correo único y válido; contraseña segura; envío de correo de verificación.

 |
| **US1.04** | Como usuario registrado, quiero recuperar mi contraseña, para volver a entrar si la olvido.

 | Should | Enlace expira y sirve una vez; la respuesta no revela si el correo existe.

 |
| **US1.05** | Como usuario registrado, quiero editar mi perfil y cerrar sesión, para controlar mi identidad.

 | Should | Edición de nombre visible, avatar y biografía; limpiar datos locales al cerrar sesión.

 |
| **US1.06** | Como usuario registrado, quiero solicitar el sello de verificación como artista o sello discográfico.

 | Should | Aprobación de administrador requerida; obras de cuentas sin sello se publican sin el distintivo.

 |

### 3.2 Épica 2: Gestión de contenido y prevención de duplicados

| ID | Historia | Prioridad | Criterios de aceptación |
| --- | --- | --- | --- |
| **US2.01** | Como creador, quiero subir una obra indicando Categoría, Título, Autor original y Portada.

 | Must | Validación cliente/servidor; la obra queda visible en su categoría.

 |
| **US2.02** | Como creador, quiero que el formulario muestre campos específicos según la categoría.

 | Must | Música pide género/duración; Arte pide técnica/año; Cine pide director, etc.

 |
| **US2.03** | Como sistema, debo rechazar una obra si ya existe la combinación Categoría + Título + Autor.

 | Must | La comparación ignora mayúsculas, tildes y espacios; índice único en BD.

 |
| **US2.04** | Como sistema, debo generar un pHash de cada portada, para detectar imágenes duplicadas.

 | Should | Distancia de Hamming menor al umbral marca para revisión; el hash se guarda junto a la obra.

 |
| **US2.05** | Como usuario registrado, quiero reportar contenido duplicado o plagiado.

 | Must | Botón pide motivo; un usuario no reporta dos veces lo mismo.

 |
| **US2.06** | Como creador, quiero editar o eliminar mis obras.

 | Should | Cambios a título/autor re-validan duplicidad; al eliminar pide confirmación.

 |
| **US2.07** | Como creador, quiero que mi obra suba como borrador y se publique al validarse.

 | Could | Estados Borrador/Publicada; solo publicadas aparecen en feed.

 |

### 3.3 Épica 3: Interacción y valoración

| ID | Historia | Prioridad | Criterios de aceptación |
| --- | --- | --- | --- |
| **US3.01** | Como usuario registrado, quiero asignar una nota de 1.0 a 10.0 con decimales.

 | Must | Promedio se recalcula; el usuario tiene 1 sola nota por obra.

 |
| **US3.02** | Como usuario registrado, quiero dar Like o quitarlo con un botón rápido.

 | Must | Independiente de la nota; actualización optimista.

 |
| **US3.03** | Como usuario registrado, quiero escribir una crítica junto a mi nota.

 | Should | Texto con límite; editable.

 |
| **US3.04** | Como usuario registrado, quiero comentar y responder en una obra.

 | Should | Comentarios anidados 1 nivel.

 |
| **US3.05** | Como visitante, quiero ver el ranking de obras por categoría.

 | Must | Promedio ponderado por cantidad de votos.

 |
| **US3.06** | Como sistema, debo limitar la manipulación de votos.

 | Should | Límite por minuto; notas sin verificar no pesan igual.

 |

### 3.4 Épica 4: Colecciones personales

| ID | Historia | Prioridad | Criterios de aceptación |
| --- | --- | --- | --- |
| **US4.01** | Como usuario registrado, quiero marcar una obra como "Visto/Jugado", "Pendiente" o "Favorito".

 | Must | Visto/Pendiente son mutuamente excluyentes; Favorito no; UI sin recargar.

 |
| **US4.02** | Como usuario registrado, quiero crear y gestionar listas personalizadas.

 | Must | Crear, renombrar, reordenar elementos; privadas o públicas.

 |
| **US4.03** | Como usuario registrado, quiero compartir una lista mediante un enlace.

 | Could | Copia enlace al portapapeles; listas privadas bloqueadas.

 |
| **US4.04** | Como usuario registrado, quiero ver mi perfil con mis estadísticas.

 | Could | Totales de estados, promedios.

 |

### 3.5 Épica 5: Descubrimiento

| ID | Historia | Prioridad | Criterios de aceptación |
| --- | --- | --- | --- |
| **US5.01** | Como visitante o usuario, quiero un feed principal unificado ordenado por interacción.

 | Must | Scroll infinito, mezcla categorías.

 |
| **US5.02** | Como visitante o usuario, quiero sub-páginas por categoría con temática visual propia.

 | Must | Uso de variables CSS `data-theme` dinámicas.

 |
| **US5.03** | Como visitante o usuario, quiero buscar obras y creadores por texto y filtros.

 | Must | Tolerante a errores tipográficos.

 |
| **US5.04** | Como visitante, quiero ver la ficha detallada de una obra.

 | Must | Obras relacionadas incluidas.

 |
| **US5.05** | Como usuario registrado, quiero seguir a creadores.

 | Could | Filtro "Siguiendo".

 |

### 3.6 Épica 6: Moderación y administración

| ID | Historia | Prioridad | Criterios de aceptación |
| --- | --- | --- | --- |
| **US6.01** | Como moderador, quiero una cola de reportes con filtros.

 | Must | Vista de pendientes, en revisión, resueltos.

 |
| **US6.02** | Como moderador, quiero aprobar, ocultar, fusionar o eliminar una obra reportada.

 | Must | Fusionar conserva las notas de la obra eliminada; notifica al creador.

 |
| **US6.03** | Como administrador, quiero otorgar o revocar el sello de verificación.

 | Must | Deja registro en auditoría.

 |
| **US6.04** | Como administrador, quiero suspender o bloquear cuentas.

 | Should | Invalida sesiones activas.

 |
| **US6.05** | Como administrador, quiero un registro de auditoría de acciones de moderación.

 | Should | Registra recurso y fecha de forma inmutable.

 |

### 3.7 Épica 7: Panel del creador

* **US7.01:** Ver rendimiento de mis obras (Should).


* **US7.02:** Gestionar mis obras desde un solo lugar (Should).


* **US7.03:** Responder a las críticas de mis obras con el sello destacado (Could).



### 3.8 Épica 8: Notificaciones y preferencias

* **US8.01:** Campana de notificaciones in-app (Could).


* **US8.02:** Preferencia de tema Claro/Oscuro en `localStorage` (Should).


* **US8.03:** Eliminar mi cuenta (anonimización de contenido público) (Should).



---

## 4. Requisitos no funcionales

| ID | Categoría | Requisito | Criterio |
| --- | --- | --- | --- |
| **RNF-01/02** | Rendimiento | Carga rápida; feeds paginados | LCP < 2,5s; Máx 20 elementos por pag. Caché en TanStack.

 |
| **RNF-03/04** | Escala/Disp. | Escalado independiente; degradación controlada | Servicios sin estado (estado en DB). 99,5% Uptime.

 |
| **RNF-05/06** | Seguridad | Tráfico HTTPS; Rutas con JWT; Control por Rol | Gateway valida tokens centralizadamente.

 |
| **RNF-07** | Seguridad | Protección ataques comunes | Bloqueo XSS, CSRF, Inyección SQL; archivos limitados por tamaño.

 |
| **RNF-08** | Privacidad | Contraseñas no almacenadas en la DB nativa | Gestión de identidad 100% por proveedor externo.

 |
| **RNF-09** | Usabilidad | UI Accesible y Responsive | Funciona desde 360px; cumple WCAG 2.1 AA.

 |
| **RNF-12** | Integridad | Consistencia en base de datos | Índices UNIQUE en PostgreSQL; operaciones transaccionales (ACID).

 |
| **RNF-13/15** | Mant/Desp. | DDD y Entornos reproducibles | `features/` y `components/ui`. Despliegue con Docker y CI/CD.

 |
| **RNF-16** | Extensión IA | Diseño listo para ML/IA | Catálogo expone metadatos y portadas vía API abierta internamente.

 |
| **RNF-18** | Legal | Cumplimiento Ley Chile/UE | Aprobación de requisitos (RC-01 a RC-18) previo al lanzamiento.

 |

---

## 5. Arquitectura

La arquitectura es de microservicios orientados a dominios, con separación estricta entre cliente y servidor y un único punto de entrada.

1. **Cliente React:** Se comunica exclusivamente vía HTTPS con el Gateway.


2. **Proveedor de Identidad:** (Firebase/Auth0) gestiona SSO de Google y emite el JWT.


3. **API Gateway (Spring Cloud Gateway):** Concentra el enrutamiento y la validación de tokens.


4. **Microservicios (Spring Boot):** Catálogo (obras), Usuarios y Motor de Interacciones.


5. **Persistencia Políglota:** MongoDB guarda metadatos dinámicos del arte; PostgreSQL guarda usuarios, reglas ACID de votos y rankings.


6. **Evolución:** El servicio de recomendación IA consumirá el Catálogo vía API de forma asíncrona.



## 6. Stack tecnológico y patrones del frontend

* **Núcleo y Rutas:** React (Hooks), TypeScript, Vite, React Router (`createBrowserRouter`).


* **Estado:** `@tanstack/react-query` con mutations y cliente `Axios` centralizado.


* **Formularios:** React Hook Form + Zod (`@hookform/resolvers`) para validación estricta.


* **UI:** Tailwind CSS v4, `lucide-react`, variables CSS nativas y `@theme` para cambiar de paleta en caliente por categoría.


* **Técnicas avanzadas:** React Portals (`createPortal`) para aislar previsualizaciones del DOM; APIs nativas (Clipboard, localStorage); compensación de layout matemática vía `requestAnimationFrame` y `getBoundingClientRect`.



## 7. Modelo de datos conceptual

* **MongoDB:** Guarda `Obra` (flexible por categoría).


* **PostgreSQL:** Guarda `Usuario`, `Voto` (relación estricta 1 a 1 entre usuario y obra), `Like`, `Comentario`, `Estado de consumo` y `Lista personalizada`.



## 8. Matriz de trazabilidad

*Ver documento anexo para cruce detallado Épica > Actor > Servicio.*
Las prioridades se distribuyen en: 19 historias *Must*, 14 *Should*, y 6 *Could*.

## 9. Riesgos y mitigaciones

* **Complejidad de bases políglotas:** Identificadores estables y borrado lógico con tareas de limpieza automáticas.


* **Manipulación de ranking:** Algoritmos Bayesianos, límite de votos y menos peso algorítmico a cuentas sin validar.


* **Plagio:** Hash perceptual (pHash), botón de reporte de comunidad y declaración de titularidad en Términos y Condiciones.


* **Fuera del MVP:** La recomendación IA (similitud), App Móvil Nativa, Pagos y Chat Privado.



---

## 10. Estrategia de Pruebas y Aseguramiento de Calidad (QA)

Para garantizar la estabilidad del MVP y respaldar los requisitos no funcionales de mantenibilidad (RNF-13), se implementará una estrategia de pruebas multicapa.

### 10.1 Matriz de Trazabilidad Extendida

Cada HU estará vinculada a Casos de Uso (CU) y a sus respectivos Casos de Prueba (CP). La estructura será: `Épica -> HU -> CU -> CP -> Tipo -> Resultado`.

### 10.2 Pruebas Unitarias y Funcionales

* **Frontend (React/TypeScript):** Se utilizará exclusivamente **Vitest** (junto a React Testing Library) para aislar y probar la lógica de los componentes, *hooks* personalizados, validaciones de *Zod* y la asignación de `data-theme`. *(Corrección técnica: Vitest se integra nativamente en el ecosistema Vite, evitando duplicidad de configuraciones).*


* **Backend (Spring Boot):** Se utilizará **JUnit 5 y Mockito** para la lógica de servicios y cálculo de promedios, junto a Testcontainers para PostgreSQL y MongoDB. Cobertura mínima esperada: 70% (JaCoCo).



### 10.3 Pruebas de Aceptación y End-to-End (E2E)

Se utilizará **Playwright**. Automatizará los flujos críticos (Chromium, WebKit, Firefox) interceptando la red (`page.route`):

1. Inicio de sesión exitoso y denegado.


2. Navegación fluida entre categorías verificando retención de estado.


3. Flujo completo de subida simulando un rechazo por contenido duplicado (pHash).


4. Voto numérico con validación del recálculo de ranking en interfaz.



---

## 11. Infraestructura, Despliegue y Preparación para IA

Considerando la restricción de microservicios y la visión de IA, se propone Google Cloud Platform (GCP) como opción recomendada.

### 11.1 Ecosistema Cloud

* **Frontend:** Firebase Hosting.


* **Backend Gateway/Servicios:** Google Cloud Run (Docker serverless).


* **Bases de Datos:** Cloud SQL (PostgreSQL) y MongoDB Atlas alojado en la misma región.


* **Ventaja IA:** Integración directa a **Vertex AI** para alimentar el futuro recomendador de similitud sonora/conceptual. *(Alternativa: AWS con Fargate, RDS, S3 y SageMaker).*



### 11.2 Gestión de Archivos Estáticos (Imágenes)

* Las imágenes de portadas **nunca** pasarán por los microservicios en Spring Boot.


* El cliente subirá las imágenes directamente hacia **Google Cloud Storage (o S3)** mediante una **URL Firmada de corta duración**.


* **Regla Técnica:** Para que el frontend ejecute el método `PUT` hacia el Bucket, se debe configurar una política restrictiva de **CORS (Cross-Origin Resource Sharing)** en la nube que acepte las peticiones desde el dominio del cliente web.
* La BD de MongoDB solo guardará la ruta final de la imagen y el `pHash` calculado.



### 11.3 Pipeline CI/CD (GitHub Actions)

1. Linter y formato de código (ESLint/Prettier).


2. Suite unitaria (Vitest y JUnit).


3. Pruebas E2E (Playwright) contra entorno de *Staging*.


4. Construcción y *Push* de imagen Docker hacia Registry; Despliegue automático de contenedores a Cloud Run.



---

## 12. Cumplimiento Normativo (Chile y UE)

RankKings se diseña preparado legalmente para escalar (Ley 21.719 en Chile, RGPD/DSA en la Unión Europea).

### 12.1 y 12.2 Requisitos Claves

* **RC-02 Consentimiento IA:** Consentimiento separado, explícito y revocable para analizar el audio con IA. El audio no se conservará, solo se extraerán *embeddings* matemáticos temporales.


* **RC-04 Retención:** Datos mínimos guardados; capacidad del usuario para exportar/eliminar su perfil.


* **RC-05 Edad Mínima:** 16 años como piso (Chile). Se debe incorporar lógica legal en el registro.



### 12.6 Verificación de Edad Segura (Webhook)

El sistema empleará un proveedor externo (ej. Didit o Persona) para estimación facial/documento sin que RankKings deba almacenar los datos biométricos sensibles de los menores o adultos.

* **Flujo Técnico Seguro:** Tras la verificación, el proveedor externo no solo redirige al usuario, sino que debe enviar un **Webhook Server-to-Server** firmado criptográficamente hacia el `User Service` (Spring Boot). Este será el **único** método válido para que RankKings confíe y cambie el estado de "Menor" a "Verificado", evitando manipulaciones del lado del cliente en React.

### 12.7 Política de Contenido

RankKings no acepta pornografía; contenido explícito que involucre menores se denuncia inmediatamente a autoridades legales. El contenido "para adultos" requiere etiquetado formal y confirmación de mayoría de edad en la UI. Toda portada es pre-evaluada mediante servicios de Cloud Vision (SafeSearch).

---

## 13. Operaciones y Estándares de Desarrollo

Para asegurar que el código desarrollado en local funcione de manera idéntica en producción de forma escalable:

### 13.1 Migraciones de Base de Datos

* No se permitirán modificaciones manuales a los esquemas de PostgreSQL.
* Se integrará la herramienta **Flyway** en Spring Boot. Cada cambio de tabla se gestionará con un script SQL inmutable versionado en el código fuente (ej. `V1__init_schema.sql`), garantizando paridad entre los entornos de Desarrollo y Producción.

### 13.2 Estandarización de Errores de API (RFC 7807)

* Para que React y TanStack Query gestionen excepciones predecibles, el API Gateway y los microservicios implementarán la convención global **RFC 7807 (Problem Details)**.
* Cualquier error (4xx/5xx) devolverá un JSON estricto con campos `title`, `status` y `detail`, facilitando la captura e internacionalización en el UI.

### 13.3 Entorno de Desarrollo Local Contenerizado

* Se utilizará un archivo maestro `docker-compose.yml` para levantar la orquestación en local.
* Se emularán dependencias completas sin saturar la máquina host:
1. Instancia local de MongoDB y PostgreSQL.
2. Herramienta como **Mailpit** (SMTP local simulado) para capturar y probar visualmente los envíos de correos de recuperación (US1.04) y verificación sin requerir credenciales de servidores de correos reales.