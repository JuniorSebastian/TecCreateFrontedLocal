@echo off
echo 🚀 Configurando TecCreate Frontend para desarrollo local...
echo.

echo 📦 Verificando si Node.js esta instalado...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no encontrado. Por favor instala Node.js 18 o superior.
    echo 🔗 Descarga desde: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js encontrado: 
node --version

echo.
echo 📦 Instalando dependencias de npm...
npm install

if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias.
    echo 🔧 Intenta ejecutar manualmente: npm install
    pause
    exit /b 1
)

echo.
echo ✅ Dependencias instaladas correctamente.

echo.
echo 🔧 Verificando configuracion...
if not exist .env (
    echo ⚠️ Archivo .env no encontrado. Creando configuracion por defecto...
    echo REACT_APP_API_URL=http://localhost:3001> .env
    echo PORT=3000>> .env
    echo ✅ Archivo .env creado.
) else (
    echo ✅ Archivo .env encontrado.
)

echo.
echo 🎉 ¡Configuracion completada!
echo.
echo 📋 Proximos pasos:
echo    1. Asegurate de que el backend este ejecutandose en puerto 3001
echo    2. Ejecuta: npm start
echo    3. Abre tu navegador en: http://localhost:3000
echo.
echo 🔍 Para verificar que el backend este funcionando:
echo    curl http://localhost:3001/
echo.

pause