import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SparklesIcon, RocketLaunchIcon, BoltIcon, StarIcon } from '@heroicons/react/24/outline';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-screen overflow-hidden" id="inicio">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-cover"
        src="https://videos.pexels.com/video-files/3184465/3184465-hd_1280_720_25fps.mp4"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-blue-900/70 to-purple-900/60 z-10" />

      {/* Partículas flotantes mejoradas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[15]">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              i % 3 === 0
                ? 'w-3 h-3 bg-cyan-400/40'
                : i % 3 === 1
                ? 'w-2 h-2 bg-blue-400/30'
                : 'w-1 h-1 bg-purple-400/50'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Líneas de Grid animadas */}
      <div className="absolute inset-0 z-[12] opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent h-[1px] animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500 to-transparent w-[1px] animate-pulse"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 text-white">
        {/* Badge superior */}
        <motion.div
          className="mb-8 inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <SparklesIcon className="w-5 h-5 text-teal-300" />
          <span className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-teal-200 to-purple-300 bg-clip-text text-transparent">
            Inteligencia Artificial Avanzada
          </span>
          <StarIcon className="w-5 h-5 text-purple-400" />
        </motion.div>

        {/* Título principal mejorado */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1]"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <span className="block text-white drop-shadow-2xl">Crea presentaciones</span>
          <span className="block mt-2 bg-gradient-to-r from-teal-300 via-sky-400 to-purple-400 bg-clip-text text-transparent animate-text-shimmer bg-[length:200%_auto]">
            increíbles con IA
          </span>
        </motion.h1>

        {/* Subtítulo mejorado */}
        <motion.p
          className="text-xl sm:text-2xl md:text-3xl max-w-5xl mb-12 text-gray-200 leading-relaxed font-medium"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          TecCreate transforma tus ideas en{' '}
          <span className="text-teal-300 font-bold">diapositivas profesionales</span> en segundos.{' '}
          <span className="block mt-2 text-lg sm:text-xl text-gray-300">
            Sin complicaciones. Con inteligencia. Para estudiantes y docentes de TECSUP.
          </span>
        </motion.p>

        {/* Estadísticas rápidas */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {[
            { label: 'Usuarios Activos', value: '500+', icon: '👥' },
            { label: 'Presentaciones', value: '2K+', icon: '📊' },
            { label: 'Satisfacción', value: '98%', icon: '⭐' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-3xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-black text-teal-300">{stat.value}</div>
              <div className="text-xs text-gray-300 font-semibold uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Botones de acción mejorados */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <motion.button
            onClick={() => navigate('/login')}
            className="group relative overflow-hidden bg-gradient-to-r from-teal-400 via-sky-500 to-purple-600 text-white font-bold px-10 py-5 rounded-full shadow-2xl text-lg"
            whileHover={{ scale: 1.08, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10 flex items-center gap-3">
              <RocketLaunchIcon className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              Iniciar con Google
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.button>

          <motion.button
            onClick={() => document.getElementById('funcionalidades').scrollIntoView({ behavior: 'smooth' })}
            className="group relative overflow-hidden bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white font-bold px-10 py-5 rounded-full shadow-2xl text-lg hover:bg-white/20 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10 flex items-center gap-3">
              <BoltIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              Ver funcionalidades
            </span>
          </motion.button>
        </motion.div>

        {/* Nota institucional mejorada */}
        <motion.div
          className="flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <div className="w-2 h-2 bg-teal-300 rounded-full animate-pulse"></div>
          <p className="text-sm text-gray-300 font-semibold">
            🎓 Exclusivo para la comunidad TECSUP
          </p>
        </motion.div>

        {/* Indicador de scroll */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-2 bg-white rounded-full"
              animate={{
                y: [0, 12, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
