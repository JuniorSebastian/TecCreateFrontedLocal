import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { iniciarSesionConGoogle } from '../services/api';
import {
  SparklesIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  BoltIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await iniciarSesionConGoogle();
    } catch (error) {
      console.error('Error en login:', error);
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: BoltIcon,
      title: 'Acceso Instantáneo',
      description: 'Inicia sesión en segundos',
      color: 'from-teal-400 to-sky-500',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Seguro y Protegido',
      description: 'Autenticación verificada',
      color: 'from-sky-400 to-indigo-500',
    },
    {
      icon: SparklesIcon,
      title: 'IA Avanzada',
      description: 'Presentaciones inteligentes',
      color: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Elementos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Grid de fondo */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />

      {/* Botón de volver */}
      <motion.button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white font-semibold text-sm hover:bg-white/20 transition-all duration-300"
        whileHover={{ scale: 1.05, x: -5 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Volver al inicio
      </motion.button>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Columna izquierda - Información */}
          <motion.div
            className="text-white space-y-8 lg:pr-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo y título */}
            <div className="space-y-6">
              <motion.div
                className="inline-flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-sky-500 rounded-2xl blur-xl opacity-50" />
                  <div className="relative bg-gradient-to-br from-teal-400 via-sky-500 to-purple-600 p-3 rounded-2xl shadow-2xl">
                    <SparklesIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-teal-300 via-sky-400 to-purple-400 bg-clip-text text-transparent">
                    TecCreate
                  </h1>
                  <p className="text-sm text-teal-300 font-semibold">Powered by AI</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                  Transforma tus ideas en{' '}
                  <span className="bg-gradient-to-r from-teal-300 to-sky-400 bg-clip-text text-transparent">
                    presentaciones increíbles
                  </span>
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  La plataforma de inteligencia artificial diseñada exclusivamente para la comunidad
                  <span className="font-bold text-white"> TECSUP</span>. Crea contenido profesional en minutos.
                </p>
              </motion.div>
            </div>

            {/* Features */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ x: 10, scale: 1.02 }}
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-400">{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Estadísticas */}
            <motion.div
              className="grid grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              {[
                { value: '500+', label: 'Usuarios' },
                { value: '2K+', label: 'Presentaciones' },
                { value: '98%', label: 'Satisfacción' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="text-2xl font-black bg-gradient-to-r from-teal-300 to-sky-400 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Columna derecha - Formulario de login */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Barra superior decorativa */}
              <div className="h-2 bg-gradient-to-r from-teal-400 via-sky-500 to-purple-600" />

              <div className="p-8 md:p-12">
                {/* Logo de TECSUP */}
                <motion.div
                  className="mb-8"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <img
                    src="https://i.ibb.co/Q3JXxDPY/Chat-GPT-Image-13-jun-2025-22-14-04-removebg-preview-Photoroom.png"
                    alt="TecCreate Logo"
                    className="w-48 mx-auto drop-shadow-lg"
                  />
                </motion.div>

                {/* Título */}
                <motion.div
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h2 className="text-3xl font-black text-gray-900 mb-3">
                    ¡Bienvenido de vuelta!
                  </h2>
                  <p className="text-gray-600">
                    Inicia sesión con tu cuenta institucional de{' '}
                    <span className="font-bold text-blue-600">TECSUP</span>
                  </p>
                </motion.div>

                {/* Botón de Google */}
                <motion.button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className="group relative w-full overflow-hidden bg-white border-2 border-gray-200 hover:border-sky-400 text-gray-700 font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  {/* Efecto de fondo animado */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-teal-50 to-purple-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovering ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />

                  <span className="relative flex items-center justify-center gap-3 text-lg">
                    {isLoading ? (
                      <>
                        <motion.div
                          className="w-6 h-6 border-3 border-sky-500 border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        <span>Iniciando sesión...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-6 h-6"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 48 48"
                        >
                          <path
                            fill="#FFC107"
                            d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.4-5.7 7.5-10.6 7.5-6.2 0-11.3-5-11.3-11.2S18.5 13 24.7 13c2.9 0 5.5 1.1 7.4 2.9l5.7-5.7C34 6.3 29.7 4.5 24.7 4.5 13.5 4.5 4.5 13.5 4.5 24.7S13.5 45 24.7 45c10.6 0 20.1-8.2 20.1-20 0-1.6-.2-2.8-.5-4.5z"
                          />
                          <path
                            fill="#FF3D00"
                            d="M6.3 14.6l6.6 4.8c1.8-3.5 5.3-6.1 9.4-6.6V4.5c-6.4.6-11.8 4.5-16 10.1z"
                          />
                          <path
                            fill="#4CAF50"
                            d="M24.7 45c5 0 9.6-1.6 13.2-4.3l-6.1-5.1c-2.2 1.5-5 2.4-8 2.4-4.9 0-9-3.1-10.6-7.5l-6.5 5c3.9 5.6 10.2 9.5 17.5 9.5z"
                          />
                          <path
                            fill="#1976D2"
                            d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.1 5.1c.4-.4 7-5.3 7-15.2 0-1.6-.2-2.8-.5-4.5z"
                          />
                        </svg>
                        <span>Iniciar sesión con Google</span>
                        <RocketLaunchIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                      </>
                    )}
                  </span>
                </motion.button>

                {/* Nota de seguridad */}
                <motion.div
                  className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <div className="flex items-start gap-3">
                    <ShieldCheckIcon className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">
                        Acceso exclusivo TECSUP
                      </p>
                      <p className="text-xs text-blue-700">
                        Solo usuarios con correos{' '}
                        <span className="font-bold">@tecsup.edu.pe</span> pueden acceder.
                        Tu información está protegida.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Características adicionales */}
                <motion.div
                  className="mt-8 grid grid-cols-3 gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  {[
                    { icon: '🚀', text: 'Rápido' },
                    { icon: '🔒', text: 'Seguro' },
                    { icon: '✨', text: 'Fácil' },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="text-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-xs font-semibold text-gray-600">{item.text}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Decoración flotante */}
            <motion.div
              className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-teal-300 to-sky-400 rounded-full blur-2xl opacity-50"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-2xl opacity-50"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}
