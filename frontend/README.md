# Slack Clone - Frontend

Aplicación web tipo Slack hecha con React y Vite. Permite registrarse, verificar el email, iniciar sesión, crear y administrar espacios de trabajo (workspaces), canales y miembros, y enviar mensajes dentro de los canales.

Este es el frontend. Consume la API del backend (repositorio en la carpeta `backend`).

## Despliegue

- Frontend (Web): https://slack-frontend-wine.vercel.app
- Backend (API): https://slack-backend-lac.vercel.app

## Tecnologías

- React
- Vite
- React Router
- Context API (WorkspaceContext y ChannelContext)
- Hooks propios (useRequest, useForm)

## Funcionalidades

- Registro con verificación por email, login y recuperación de contraseña
- Listado de espacios de trabajo del usuario
- Crear, editar y eliminar workspaces (solo el owner)
- Canales por workspace y envío de mensajes
- Agregar miembros al workspace (solo el owner)
- Interfaz responsiva

## Estructura

- `src/screens`: pantallas (login, registro, home, workspace, etc.)
- `src/Components`: componentes reutilizables
- `src/Context`: contextos de workspace y canal
- `src/services`: llamadas a la API
- `src/hooks`: hooks personalizados
- `src/Middlewares`: protección de rutas con autenticación

## Instalación y uso local

1. Clonar el repositorio e ingresar a la carpeta del frontend:

```bash
cd frontend
```

2. Instalar dependencias:

```bash
npm install
```

3. Crear un archivo `.env` en la raíz del frontend con la URL del backend:

```
VITE_APP_URL_BACKEND=http://localhost:3000
```

Si el backend corre en otro puerto, o querés usar el desplegado, poné esa URL.

4. Levantar el servidor de desarrollo:

```bash
npm run dev
```

5. Para generar el build de producción:

```bash
npm run build
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_APP_URL_BACKEND` | URL base del backend (sin barra final) |

En Vercel, esta variable se configura en el proyecto del frontend y hay que volver a desplegar después de cambiarla.

## Autor

Juan Ignacio