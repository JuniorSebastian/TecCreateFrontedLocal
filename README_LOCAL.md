# TecCreate Frontend (Local)

Este proyecto frontend React se conecta con el backend TecCreate ejecutándose en `localhost:3001`.

## 🚀 Configuración Rápida

### Prerrequisitos
- Node.js 18 o superior
- Backend TecCreate ejecutándose en puerto 3001
- PostgreSQL configurado (ver README del backend)

### Instalación y Ejecución

1. **Instalar dependencias:**
   ```powershell
   npm install
   ```

2. **Verificar configuración:**
   - El archivo `.env` debe tener `REACT_APP_API_URL=http://localhost:3001`
   - El backend debe estar ejecutándose en puerto 3001

3. **Iniciar el frontend:**
   ```powershell
   npm start
   ```

El frontend estará disponible en `http://localhost:3000`

## 🔧 Configuración de Entorno

### Variables de Entorno (`.env`)
```
REACT_APP_API_URL=http://localhost:3001
PORT=3000
```

### Puertos
- **Frontend (React):** `localhost:3000`
- **Backend (Node.js):** `localhost:3001`

## 🌐 Flujo de Autenticación

1. Usuario hace clic en "Iniciar sesión con Google"
2. Se redirige a: `http://localhost:3001/auth/google`
3. Google OAuth procesa la autenticación
4. Redirige de vuelta a: `http://localhost:3000/oauth-success?token=...&user=...`
5. El frontend guarda el token y redirige según el rol del usuario

## 📋 Verificación Rápida

1. **Backend funcionando:**
   ```powershell
   curl http://localhost:3001/
   ```
   Debería responder sin errores.

2. **Frontend funcionando:**
   - Abre `http://localhost:3000`
   - Debería cargar la página de inicio
   - No debería haber errores en la consola del navegador

3. **Autenticación funcionando:**
   - Haz clic en "Iniciar sesión con Google"
   - Debería redirigir al backend correctamente
   - Después de autenticarte, deberías ver el dashboard

## 🐛 Problemas Comunes

### Error de CORS
Si ves errores de CORS, verifica que el backend tenga configurado `CLIENT_URL=http://localhost:3000` en su `.env`.

### Error 404 en rutas
Si las rutas del frontend no funcionan después de recargar, esto es normal en desarrollo. React Router maneja las rutas en el cliente.

### Error de conexión al backend
- Verifica que el backend esté ejecutándose en puerto 3001
- Comprueba que `REACT_APP_API_URL` en `.env` sea correcta
- Reinicia ambos servidores si es necesario

### Google OAuth no funciona
- Verifica que el backend tenga configuradas correctamente las credenciales de Google
- Asegúrate de que `GOOGLE_CALLBACK_URL` en el backend sea `http://localhost:3001/auth/google/callback`
- Comprueba que la cuenta de Google que usas sea del dominio `@tecsup.edu.pe`

## 📁 Estructura del Proyecto

```
src/
├── components/         # Componentes reutilizables
├── pages/             # Páginas principales
├── services/          # Configuración de API (axios)
└── styles/            # Estilos CSS/Tailwind
```

## 🔄 Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm test` - Ejecuta las pruebas
- `npm run eject` - Expone la configuración de webpack (no reversible)

## 📚 Tecnologías Utilizadas

- **React 19** - Framework principal
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Estilos
- **Framer Motion** - Animaciones
- **Headless UI** - Componentes accesibles