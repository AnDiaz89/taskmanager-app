# Task Manager App

Aplicación web para gestión de tareas personales, con autenticación de usuarios, prioridades, fechas límite y filtros. Frontend construido en React, conectado a una API REST propia.

**Demo en vivo:** https://taskmanager-app-hazel.vercel.app
**Backend (repositorio separado):** https://github.com/AnDiaz89/taskmanager-api

## Características

- Registro e inicio de sesión de usuarios
- Sesión persistente (el token se guarda en el navegador)
- Rutas protegidas: solo usuarios logueados pueden ver el dashboard
- Crear, editar, completar y eliminar tareas
- Prioridad (alta / media / baja) con indicadores de color
- Fecha límite, con aviso visual si la tarea está vencida
- Filtros: todas / pendientes / completadas
- Confirmación antes de eliminar una tarea
- Notificaciones (toasts) al crear, editar o eliminar
- Diseño responsive

## Stack tecnológico

- **React** (con Vite)
- **React Router** para navegación
- **Axios** para peticiones HTTP, con interceptor para agregar el token automáticamente
- **Context API** para el manejo de sesión

## Cómo correrlo localmente

1. Clona el repositorio:
```bash
git clone https://github.com/AnDiaz89/taskmanager-app.git
cd taskmanager-app
```

2. Instala las dependencias:
```bash
npm install
```

3. Si quieres apuntar a un backend local en vez del desplegado, edita `src/api/axios.js` y cambia la `baseURL` a `http://localhost:3000/api`.

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

La app corre por defecto en `http://localhost:5173`.

> Nota: necesitas el [backend](https://github.com/AnDiaz89/taskmanager-api) corriendo (local o el desplegado) para que la app funcione, ya que no tiene datos propios.

## Estructura del proyecto

src/
api/ # Configuración de Axios y conexión con el backend
components/ # Componentes reutilizables (ej. rutas protegidas)
context/ # Contexto de autenticación (estado global de sesión)
pages/ # Páginas de la app (Login, Register, Dashboard)

## Lo que aprendí

Este fue mi primer proyecto full stack completo, construido de cero. Aprendí a manejar autenticación en el frontend con Context API, a interceptar peticiones con Axios para adjuntar el token automáticamente, y a resolver problemas específicos del despliegue de una SPA (como configurar rewrites en Vercel para que las rutas de React Router funcionaran correctamente al recargar la página).