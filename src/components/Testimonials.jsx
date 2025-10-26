// src/components/Testimonials.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  SparklesIcon,
  AcademicCapIcon,
  UserGroupIcon
} from '@heroicons/react/24/solid';

const TESTIMONIOS = [
  {
    nombre: 'Ana López Martínez',
    cargo: 'Docente de Ingeniería',
    departamento: 'TECSUP Lima',
    mensaje: 'TecCreate ha revolucionado la forma en que preparo mis clases. Es intuitivo, rápido y poderoso. Mis estudiantes están más comprometidos con presentaciones visualmente atractivas.',
    avatar: 'https://ui-avatars.com/api/?name=Ana+Lopez&background=06b6d4&color=fff&size=200&bold=true',
    rating: 5,
    tag: 'Docente',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    nombre: 'Carlos Mendoza Ríos',
    cargo: 'Estudiante de Mecatrónica',
    departamento: 'TECSUP Arequipa',
    mensaje: 'Gracias a TecCreate puedo generar presentaciones profesionales en minutos. ¡Me encanta! La IA hace todo el trabajo pesado y yo solo me enfoco en el contenido.',
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Mendoza&background=8b5cf6&color=fff&size=200&bold=true',
    rating: 5,
    tag: 'Estudiante',
    color: 'from-purple-500 to-pink-600',
  },
  {
    nombre: 'Lucía Pérez Vega',
    cargo: 'Coordinadora Académica',
    departamento: 'TECSUP Trujillo',
    mensaje: 'Facilita la vida docente. Las presentaciones son visualmente atractivas y de alta calidad. El equipo ahora puede crear material educativo más rápido que nunca.',
    avatar: 'https://ui-avatars.com/api/?name=Lucia+Perez&background=ec4899&color=fff&size=200&bold=true',
    rating: 5,
    tag: 'Coordinadora',
    color: 'from-pink-500 to-rose-600',
  },
  {
    nombre: 'Miguel Torres Silva',
    cargo: 'Estudiante de Electrónica',
    departamento: 'TECSUP Lima',
    mensaje: 'La mejor herramienta para estudiantes. Ahorro horas de trabajo y obtengo resultados increíbles. Perfecta para presentar proyectos y trabajos finales con estilo.',
    avatar: 'https://ui-avatars.com/api/?name=Miguel+Torres&background=10b981&color=fff&size=200&bold=true',
    rating: 5,
    tag: 'Estudiante',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    nombre: 'Patricia Rojas Campos',
    cargo: 'Docente de Sistemas',
    departamento: 'TECSUP Cusco',
    mensaje: 'Impresionante cómo la IA entiende el contexto y genera diapositivas coherentes. Mis presentaciones ahora son más dinámicas y mis alumnos participan más en clase.',
    avatar: 'https://ui-avatars.com/api/?name=Patricia+Rojas&background=f59e0b&color=fff&size=200&bold=true',
    rating: 5,
    tag: 'Docente',
    color: 'from-amber-500 to-orange-600',
  },
  {
    nombre: 'Diego Flores Mendez',
    cargo: 'Estudiante de Administración',
    departamento: 'TECSUP Lima',
    mensaje: 'TecCreate es simplemente genial. La interfaz es súper amigable y los resultados son profesionales. Lo recomiendo a todos mis compañeros de TECSUP.',
    avatar: 'https://ui-avatars.com/api/?name=Diego+Flores&background=3b82f6&color=fff&size=200&bold=true',
    rating: 5,
    tag: 'Estudiante',
    color: 'from-blue-500 to-indigo-600',
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = TESTIMONIOS.length - 1;
      if (nextIndex >= TESTIMONIOS.length) nextIndex = 0;
      return nextIndex;
    });
  };

  const currentTestimonio = TESTIMONIOS[currentIndex];

  return (
    <section 
      className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-24 px-6 overflow-hidden" 
      id="testimonios"
    >
      {/* Elementos de fondo animados */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-r from-blue-300/20 to-purple-300/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-r from-cyan-300/20 to-blue-300/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-blob animation-delay-4000" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <SparklesIcon className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-bold text-purple-900 uppercase tracking-wider">
              Testimonios
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
            Lo que dice nuestra comunidad
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Más de <span className="font-bold text-purple-600">500 usuarios</span> de TECSUP confían en TecCreate
          </p>
        </motion.div>

        {/* Carrusel de testimonios */}
        <div className="relative max-w-5xl mx-auto">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
              }}
              className="relative"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/60">
                {/* Barra superior de color */}
                <div className={`h-2 bg-gradient-to-r ${currentTestimonio.color}`} />

                <div className="p-10 md:p-16">
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    {/* Avatar y info */}
                    <motion.div
                      className="flex-shrink-0 text-center md:text-left"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="relative inline-block mb-4">
                        <div className={`absolute inset-0 bg-gradient-to-r ${currentTestimonio.color} rounded-full blur-xl opacity-50`} />
                        <img
                          src={currentTestimonio.avatar}
                          alt={currentTestimonio.nombre}
                          className="relative w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                        />
                        {/* Badge */}
                        <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r ${currentTestimonio.color} text-white text-xs font-bold shadow-lg`}>
                          {currentTestimonio.tag}
                        </div>
                      </div>
                      
                      {/* Rating */}
                      <div className="flex justify-center md:justify-start gap-1 mb-3">
                        {[...Array(currentTestimonio.rating)].map((_, i) => (
                          <StarIcon key={i} className="w-5 h-5 text-yellow-500" />
                        ))}
                      </div>
                    </motion.div>

                    {/* Contenido */}
                    <div className="flex-1">
                      {/* Quote icon */}
                      <div className={`text-7xl font-serif mb-4 bg-gradient-to-r ${currentTestimonio.color} bg-clip-text text-transparent opacity-30`}>
                        "
                      </div>

                      {/* Mensaje */}
                      <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6 italic">
                        {currentTestimonio.mensaje}
                      </p>

                      {/* Autor info */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-xl font-black text-gray-900 mb-1">
                          {currentTestimonio.nombre}
                        </h4>
                        <p className={`font-bold text-sm mb-1 bg-gradient-to-r ${currentTestimonio.color} bg-clip-text text-transparent`}>
                          {currentTestimonio.cargo}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <AcademicCapIcon className="w-4 h-4" />
                          {currentTestimonio.departamento}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controles del carrusel */}
          <div className="flex justify-center items-center gap-6 mt-8">
            <motion.button
              onClick={() => paginate(-1)}
              className="p-4 rounded-full bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg hover:shadow-xl transition-all group"
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeftIcon className="w-6 h-6 text-gray-700 group-hover:text-purple-600 transition-colors" />
            </motion.button>

            {/* Indicadores */}
            <div className="flex gap-2">
              {TESTIMONIOS.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? `w-8 bg-gradient-to-r ${currentTestimonio.color}`
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>

            <motion.button
              onClick={() => paginate(1)}
              className="p-4 rounded-full bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg hover:shadow-xl transition-all group"
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRightIcon className="w-6 h-6 text-gray-700 group-hover:text-purple-600 transition-colors" />
            </motion.button>
          </div>
        </div>

        {/* Estadísticas */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {[
            { icon: UserGroupIcon, value: '500+', label: 'Usuarios Activos', color: 'from-cyan-500 to-blue-600' },
            { icon: StarIcon, value: '4.9/5', label: 'Rating Promedio', color: 'from-amber-500 to-orange-600' },
            { icon: AcademicCapIcon, value: '98%', label: 'Satisfacción', color: 'from-purple-500 to-pink-600' },
            { icon: SparklesIcon, value: '2K+', label: 'Presentaciones', color: 'from-emerald-500 to-teal-600' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-lg text-center"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} text-white mb-3`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`text-3xl font-black mb-1 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 font-semibold">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
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
    </section>
  );
}
