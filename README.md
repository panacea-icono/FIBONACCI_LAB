# Chat con IA para Gestión de Redes Sociales

Una aplicación web tipo Telegram con integración de IA para gestión de redes sociales.

## Características

- ✅ Autenticación de usuarios (registro e inicio de sesión)
- ✅ Chat en tiempo real con Socket.io
- ✅ Análisis de sentimiento de mensajes con OpenAI
- ✅ Base de datos PostgreSQL para almacenamiento persistente
- ✅ Interfaz de usuario moderna y responsiva

## Tecnologías utilizadas

- Frontend: React, TailwindCSS, Shadcn/UI
- Backend: Express, Socket.io
- Base de datos: PostgreSQL con Drizzle ORM
- IA: OpenAI API

## Cómo usar

1. Clona el repositorio
2. Instala las dependencias con `npm install`
3. Configura las variables de entorno:
   - `DATABASE_URL`: URL de conexión a PostgreSQL
   - `OPENAI_API_KEY`: Clave de API de OpenAI
4. Inicia el servidor con `npm run dev`

## Estructura del proyecto

- `client`: Aplicación frontend en React
- `server`: Servidor Express y Socket.io
- `shared`: Esquemas compartidos entre cliente y servidor

## Próximas características

- Integración completa con redes sociales
- Panel de análisis de datos
- Configuración de respuestas automáticas
- Programación de publicaciones
---

🔗 **Este proyecto forma parte del Ecosistema PANAS**  
Consulte [ECOSISTEMA.md](./ECOSISTEMA.md) para más detalles.

