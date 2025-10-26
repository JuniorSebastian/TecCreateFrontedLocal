# Script de configuración para PowerShell
Write-Host "🚀 Configurando TecCreate Frontend para desarrollo local..." -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "📦 Verificando si Node.js está instalado..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no encontrado. Por favor instala Node.js 18 o superior." -ForegroundColor Red
    Write-Host "🔗 Descarga desde: https://nodejs.org/" -ForegroundColor Blue
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""

# Instalar dependencias
Write-Host "📦 Instalando dependencias de npm..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencias instaladas correctamente." -ForegroundColor Green
} catch {
    Write-Host "❌ Error al instalar dependencias." -ForegroundColor Red
    Write-Host "🔧 Intenta ejecutar manualmente: npm install" -ForegroundColor Blue
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""

# Verificar configuración
Write-Host "🔧 Verificando configuración..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "⚠️ Archivo .env no encontrado. Creando configuración por defecto..." -ForegroundColor Yellow
    @"
REACT_APP_API_URL=http://localhost:3001
PORT=3000
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Archivo .env creado." -ForegroundColor Green
} else {
    Write-Host "✅ Archivo .env encontrado." -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Asegúrate de que el backend esté ejecutándose en puerto 3001"
Write-Host "   2. Ejecuta: npm start"
Write-Host "   3. Abre tu navegador en: http://localhost:3000"
Write-Host ""
Write-Host "🔍 Para verificar que el backend esté funcionando:" -ForegroundColor Blue
Write-Host "   Invoke-WebRequest -Uri http://localhost:3001/ -Method GET"
Write-Host ""

Read-Host "Presiona Enter para continuar"