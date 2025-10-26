# 🔍 Debug: Foto de Perfil de Google OAuth

## Problema Reportado
La foto de perfil aparece gris en lugar de mostrar la imagen de Google.

## Soluciones Implementadas en Frontend

### 1. Fallback a Avatar Generado
- ✅ Agregado fallback en `Perfil.jsx` usando `ui-avatars.com`
- ✅ Agregado fallback en `Soporte.jsx` 
- ✅ Agregado handler `onError` para reintentar con avatar generado

### 2. Logs de Depuración
Agregados en `OauthSuccess.jsx`:
```javascript
console.log('📸 Foto de perfil recibida:', usuario.foto);
console.log('📋 Todos los campos del usuario:', Object.keys(usuario));
```

## Cómo Verificar el Problema

### En el Navegador (Consola):
1. Abre las DevTools (F12)
2. Ve a la pestaña Console
3. Haz login con Google
4. Busca los logs que empiezan con 📸 y 📋
5. Verifica si `usuario.foto` tiene un valor

### Posibles Causas:

#### A. Backend NO envía el campo `foto`
**Solución en Backend:**
```javascript
// En tu callback de OAuth (authController.js o similar)
const userData = {
  id: user.id,
  nombre: user.nombre,
  email: user.email,
  foto: user.foto || profile._json.picture, // ← ASEGURAR QUE EXISTA
  rol: user.rol,
  estado: user.estado
};

// Enviar en la URL de redirect:
const redirectUrl = `${CLIENT_URL}/oauth-success?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
```

#### B. Google no está devolviendo la foto
**Verificar scopes en backend:**
```javascript
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: `${API_URL}/auth/google/callback`,
  scope: ['profile', 'email'], // ← Asegurar que incluya 'profile'
}));
```

#### C. Campo con nombre diferente
El campo puede llamarse:
- `foto`
- `picture`
- `avatar`
- `image`
- `photoUrl`

**Verificar en el modelo de Usuario (backend):**
```javascript
// Usuario.js o similar
{
  foto: {
    type: String,
    default: null
  }
}
```

## Verificación Rápida

### 1. Ver localStorage:
```javascript
// En consola del navegador:
JSON.parse(localStorage.getItem('usuario'))
```

Deberías ver algo como:
```json
{
  "id": "123",
  "nombre": "Juan Pérez",
  "email": "juan@tecsup.edu.pe",
  "foto": "https://lh3.googleusercontent.com/a/...",
  "rol": "usuario",
  "estado": "activo"
}
```

### 2. Verificar URL de OAuth:
Revisa la URL completa en `/oauth-success`:
```
http://localhost:3000/oauth-success?token=xxx&user=%7B%22foto%22%3A%22https%3A%2F%2Flh3...
```

Decodifica el parámetro `user` en: https://www.urldecoder.org/

## Solución Temporal (Ya Implementada)
El frontend ahora usa un avatar generado automáticamente si no hay foto:
- Usa las iniciales del nombre
- Color azul (#3b82f6)
- Texto blanco
- Tamaño 200px

## Próximos Pasos

1. **Verificar logs en consola** al hacer login
2. **Si `usuario.foto` es `null` o `undefined`:** El problema está en el backend
3. **Si `usuario.foto` tiene URL pero no carga:** Problema de CORS o URL inválida
4. **Si la URL es correcta:** Verificar que Google OAuth tenga los permisos correctos

## Comando para Probar
```bash
# Abrir consola del navegador y ejecutar:
console.table(JSON.parse(localStorage.getItem('usuario')))
```

Esto mostrará todos los campos del usuario de forma legible.
