// src/components/Features.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  PresentationChartBarIcon,
  UserGroupIcon,
  BoltIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';

const FEATURES = [
  {
    icon: SparklesIcon,
    title: "Creación con IA",
    desc: "Genera presentaciones completas a partir de un simple prompt. La IA hace el trabajo pesado por ti.",
    gradient: "from-cyan-500 via-blue-500 to-indigo-500",
    bgGradient: "from-cyan-50 to-blue-50",
    glowColor: "cyan",
    stats: "En segundos",
  },
  {
    icon: PresentationChartBarIcon,
    title: "Diseño Profesional",
    desc: "Plantillas elegantes, modernas y optimizadas para presentaciones académicas y profesionales.",
    gradient: "from-purple-500 via-pink-500 to-rose-500",
    bgGradient: "from-purple-50 to-pink-50",
    glowColor: "purple",
    stats: "20+ Templates",
  },
  {
    icon: UserGroupIcon,
    title: "Colaboración TECSUP",
    desc: "Acceso exclusivo con Google institucional. Comparte y colabora con tu comunidad educativa.",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    bgGradient: "from-emerald-50 to-teal-50",
    glowColor: "emerald",
    stats: "500+ Usuarios",
  },
  {
    icon: BoltIcon,
    title: "Velocidad Extrema",
    desc: "Crea presentaciones en minutos, no en horas. Optimizado para máximo rendimiento.",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    bgGradient: "from-amber-50 to-orange-50",
    glowColor: "amber",
    stats: "10x más rápido",
  },
  {
    icon: ShieldCheckIcon,
    title: "Seguro y Privado",
    desc: "Tus datos están protegidos. Infraestructura segura y respaldo automático.",
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
    bgGradient: "from-blue-50 to-indigo-50",
    glowColor: "blue",
    stats: "Encriptación SSL",
  },
  {
    icon: RocketLaunchIcon,
    title: "Actualizaciones Continuas",
    desc: "Nuevas funciones cada mes. Mejoras constantes basadas en feedback de usuarios.",
    gradient: "from-pink-500 via-rose-500 to-red-500",
    bgGradient: "from-pink-50 to-rose-50",
    glowColor: "pink",
    stats: "Updates semanales",
  }
];

export default function Features() {
  return (
    <section id="funcionalidades" className="relative bg-gradient-to-br from-slate-50 via-white to-slate-100 py-24 px-6 md:px-20 overflow-hidden">
      {/* Elementos de fondo animados */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-blob" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl translate-x-1/2 animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl translate-y-1/2 animate-blob animation-delay-4000" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header de la sección */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <SparklesIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-blue-900 uppercase tracking-wider">
              Funcionalidades
            </span>
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            ¿Por qué elegir TecCreate?
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Herramientas potentes diseñadas para{' '}
            <span className="font-bold text-blue-600">estudiantes</span> y{' '}
            <span className="font-bold text-purple-600">docentes</span> de TECSUP
          </p>
        </motion.div>

        {/* Grid de funcionalidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                className={`group relative p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br ${feature.bgGradient} border border-white/60 backdrop-blur-sm overflow-hidden`}
                whileHover={{ scale: 1.05, y: -10 }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-3xl`} />
                
                {/* Brillo animado */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Contenido */}
                <div className="relative z-10">
                  {/* Icono con animación */}
                  <motion.div
                    className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="w-8 h-8" />
                  </motion.div>

                  {/* Badge de estadística */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-gradient-to-r ${feature.gradient} text-white text-xs font-bold shadow-md`}>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    {feature.stats}
                  </div>

                  {/* Título */}
                  <h3 className={`text-2xl font-black mb-4 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                    {feature.title}
                  </h3>

                  {/* Descripción */}
                  <p className="text-gray-700 leading-relaxed font-medium">
                    {feature.desc}
                  </p>

                  {/* Decoración inferior */}
                  <div className="mt-6 pt-6 border-t border-gray-200/50 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-500">Saber más</span>
                    <motion.div
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md"
                      whileHover={{ x: 5 }}
                    >
                      <svg className={`w-4 h-4 text-${feature.glowColor}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA inferior */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            className="group relative overflow-hidden px-10 py-5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold rounded-full shadow-2xl text-lg"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/login'}
          >
            <span className="relative z-10 flex items-center gap-3">
              <RocketLaunchIcon className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              Comenzar ahora gratis
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>
          <p className="mt-4 text-sm text-gray-500 font-semibold">
            ✨ Sin tarjeta de crédito • Acceso instantáneo • Solo para TECSUP
          </p>
        </motion.div>
      </div>

      {/* CSS para animaciones */}
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
    </section>
  );
}
