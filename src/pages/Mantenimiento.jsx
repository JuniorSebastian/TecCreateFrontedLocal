// src/pages/Mantenimiento.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  WrenchScrewdriverIcon,
  ClockIcon,
  ArrowPathIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

// Estilos CSS personalizados para animaciones avanzadas
const styles = `
  @keyframes blob {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(20px, -50px) scale(1.1); }
    50% { transform: translate(-20px, 20px) scale(0.9); }
    75% { transform: translate(20px, 20px) scale(1.05); }
  }
  
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes ping-slow {
    0% { transform: scale(1); opacity: 1; }
    75%, 100% { transform: scale(2); opacity: 0; }
  }
  
  @keyframes ping-slower {
    0% { transform: scale(1); opacity: 1; }
    75%, 100% { transform: scale(2.5); opacity: 0; }
  }
  
  .animate-blob { animation: blob 7s infinite; }
  .animate-gradient { animation: gradient 3s ease infinite; background-size: 200% 200%; }
  .animate-shimmer { animation: shimmer 2s infinite; }
  .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
  .animate-slideInDown { animation: slideInDown 0.6s ease-out; }
  .animate-slideInUp { animation: slideInUp 0.6s ease-out; }
  .animate-slideInLeft { animation: slideInLeft 0.6s ease-out forwards; opacity: 0; }
  .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
  .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
  .animate-ping-slower { animation: ping-slower 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
  
  .animation-delay-100 { animation-delay: 0.1s; }
  .animation-delay-200 { animation-delay: 0.2s; }
  .animation-delay-300 { animation-delay: 0.3s; }
  .animation-delay-400 { animation-delay: 0.4s; }
  .animation-delay-500 { animation-delay: 0.5s; }
  .animation-delay-600 { animation-delay: 0.6s; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
  
  .bg-size-200 { background-size: 200% 200%; }
  .hover\:shadow-3xl:hover { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
`;

export default function Mantenimiento() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mensaje, setMensaje] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Leer parámetros de la URL
    const mensajeParam = searchParams.get('mensaje');

    setMensaje(
      mensajeParam || 'El sistema se encuentra en mantenimiento. Por favor, intenta más tarde.'
    );
  }, [searchParams]);

  useEffect(() => {
    let timer;
    if (verificando && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (verificando && countdown === 0) {
      // Recargar la misma página después de 5 segundos
      window.location.reload();
    }
    return () => clearTimeout(timer);
  }, [verificando, countdown]);

  const verificarEstado = () => {
    setVerificando(true);
    setCountdown(5);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Elementos de fondo animados */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-2xl w-full relative z-10 animate-fadeIn">
        {/* Card principal con animación de entrada */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-3xl hover:scale-[1.02]">
          {/* Header con gradiente animado */}
          <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-size-200 animate-gradient p-8 text-center relative overflow-hidden">
            {/* Efecto de onda */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
            </div>
            
            <div className="flex justify-center mb-4 relative">
              <div className="bg-white rounded-full p-4 shadow-2xl animate-bounce-slow">
                <WrenchScrewdriverIcon className="w-16 h-16 text-blue-600 animate-pulse" />
              </div>
              {/* Círculos decorativos animados */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 border-4 border-white/30 rounded-full animate-ping-slow"></div>
                <div className="w-32 h-32 border-2 border-white/20 rounded-full animate-ping-slower absolute"></div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2 animate-slideInDown">
              Sistema en Mantenimiento
            </h1>
            <p className="text-blue-100 text-lg animate-slideInUp">
              Estamos trabajando para mejorar tu experiencia
            </p>
          </div>

          {/* Contenido */}
          <div className="p-8 space-y-6">
            {/* Mensaje personalizado - Destacado */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-2xl p-8 shadow-xl">
              {/* Efecto de brillo animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 shadow-lg">
                    <ClockIcon className="w-10 h-10 text-white animate-pulse" />
                  </div>
                </div>
                
                <h3 className="text-center text-white/90 text-sm font-medium uppercase tracking-wider mb-3">
                  Mensaje del equipo TecCreate
                </h3>
                
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
                  <p className="text-gray-800 text-lg md:text-xl font-semibold text-center leading-relaxed">
                    {mensaje}
                  </p>
                </div>
                
                {/* Decoración */}
                <div className="flex items-center justify-center mt-4 gap-2">
                  <div className="h-1 w-12 bg-white/40 rounded-full"></div>
                  <div className="h-1 w-4 bg-white/60 rounded-full"></div>
                  <div className="h-1 w-12 bg-white/40 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Información adicional con animación escalonada */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 space-y-3 border border-blue-100 shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                ¿Qué está pasando?
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3 animate-slideInLeft animation-delay-100 transform transition-all duration-300 hover:translate-x-2">
                  <span className="text-blue-500 font-bold text-xl flex-shrink-0">•</span>
                  <span className="leading-relaxed">Estamos realizando mejoras importantes en el sistema</span>
                </li>
                <li className="flex items-start gap-3 animate-slideInLeft animation-delay-200 transform transition-all duration-300 hover:translate-x-2">
                  <span className="text-cyan-500 font-bold text-xl flex-shrink-0">•</span>
                  <span className="leading-relaxed">El acceso temporal está restringido para usuarios regulares</span>
                </li>
                <li className="flex items-start gap-3 animate-slideInLeft animation-delay-300 transform transition-all duration-300 hover:translate-x-2">
                  <span className="text-blue-600 font-bold text-xl flex-shrink-0">•</span>
                  <span className="leading-relaxed">Los administradores y equipo de soporte siguen operando</span>
                </li>
                <li className="flex items-start gap-3 animate-slideInLeft animation-delay-400 transform transition-all duration-300 hover:translate-x-2">
                  <span className="text-cyan-600 font-bold text-xl flex-shrink-0">•</span>
                  <span className="leading-relaxed">Volveremos pronto con nuevas funcionalidades</span>
                </li>
              </ul>
            </div>

            {/* Acciones con animaciones mejoradas */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={verificarEstado}
                disabled={verificando}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-size-200 animate-gradient text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 relative overflow-hidden group"
              >
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-shimmer"></div>
                
                {verificando ? (
                  <>
                    <ArrowPathIcon className="w-6 h-6 animate-spin" />
                    <span className="relative z-10 text-lg">Verificando... ({countdown}s)</span>
                    {/* Barra de progreso */}
                    <div className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-1000"
                         style={{ width: `${((5 - countdown) / 5) * 100}%` }}></div>
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="relative z-10 text-lg">Verificar estado</span>
                  </>
                )}
              </button>

              <button
                onClick={() => navigate('/')}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-4 rounded-xl font-semibold border-2 border-gray-300 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 active:scale-95 group"
              >
                <HomeIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-lg">Volver al inicio</span>
              </button>
            </div>

            {/* Nota de ayuda con animación */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200 animate-fadeIn animation-delay-500">
              <p className="flex items-center justify-center gap-2 flex-wrap">
                <span className="inline-block animate-bounce-slow">💬</span>
                ¿Necesitas ayuda urgente?{' '}
                <button
                  onClick={() => navigate('/contacto')}
                  className="text-blue-600 hover:text-blue-700 font-semibold underline decoration-2 underline-offset-2 hover:underline-offset-4 transition-all duration-300 inline-flex items-center gap-1 group"
                >
                  <span>Contáctanos aquí</span>
                  <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">→</span>
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer informativo mejorado */}
        <div className="mt-8 text-center animate-fadeIn animation-delay-600">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-blue-100">
            <p className="flex items-center justify-center gap-3 text-gray-700 font-medium">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <span>Esta página se actualizará automáticamente cuando el mantenimiento finalice</span>
              <span className="text-2xl animate-pulse">✨</span>
            </p>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
