// src/components/Footer.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  SparklesIcon,
  EnvelopeIcon,
  MapPinIcon,
  CodeBracketIcon 
} from '@heroicons/react/24/outline';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'GitHub', icon: '💻', url: '#' },
    { name: 'LinkedIn', icon: '💼', url: '#' },
    { name: 'Twitter', icon: '🐦', url: '#' },
    { name: 'Instagram', icon: '📸', url: '#' },
  ];

  const quickLinks = [
    { name: 'Inicio', url: '#inicio' },
    { name: 'Funcionalidades', url: '#funcionalidades' },
    { name: 'Testimonios', url: '#testimonios' },
    { name: 'Contacto', url: '#contacto' },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-16 px-6 overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Columna 1: Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur-lg opacity-50" />
                <div className="relative bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-2.5 rounded-xl">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  TecCreate
                </h3>
                <p className="text-xs text-cyan-400 font-semibold">Powered by AI</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              Transforma tus ideas en presentaciones profesionales con inteligencia artificial.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPinIcon className="w-4 h-4" />
              <span>TECSUP, Lima - Perú</span>
            </div>
          </motion.div>

          {/* Columna 2: Enlaces rápidos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <CodeBracketIcon className="w-5 h-5 text-cyan-400" />
              Navegación
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Columna 3: Recursos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <EnvelopeIcon className="w-5 h-5 text-cyan-400" />
              Recursos
            </h4>
            <ul className="space-y-3">
              <li>
                <button className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2 group bg-transparent border-none cursor-pointer p-0 text-left">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Documentación
                </button>
              </li>
              <li>
                <button className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2 group bg-transparent border-none cursor-pointer p-0 text-left">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Tutoriales
                </button>
              </li>
              <li>
                <button className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2 group bg-transparent border-none cursor-pointer p-0 text-left">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  API
                </button>
              </li>
              <li>
                <button className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2 group bg-transparent border-none cursor-pointer p-0 text-left">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Soporte
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Columna 4: Redes sociales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-lg font-bold mb-6">Síguenos</h4>
            <div className="grid grid-cols-2 gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  className="flex items-center gap-2 px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300 group"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {social.icon}
                  </span>
                  <span className="text-sm font-semibold text-gray-300 group-hover:text-cyan-400 transition-colors">
                    {social.name}
                  </span>
                </motion.a>
              ))}
            </div>
            
            {/* Newsletter */}
            <div className="mt-6 p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-xl">
              <p className="text-sm text-gray-300 mb-3 font-semibold">
                📬 Recibe actualizaciones
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <motion.button
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-sm font-bold hover:from-cyan-600 hover:to-blue-700 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ✓
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Línea divisoria */}
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mb-8" />

        {/* Footer inferior */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 text-gray-400">
            <p className="text-sm">
              © {currentYear} TecCreate. Todos los derechos reservados.
            </p>
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <p className="text-sm flex items-center gap-2">
              Hecho con
              <HeartIcon className="w-4 h-4 text-red-500 animate-pulse" />
              por estudiantes y docentes de
              <span className="font-bold text-cyan-400">TECSUP</span>
            </p>
          </div>

          <div className="flex gap-4 text-sm">
            <button className="text-gray-400 hover:text-cyan-400 transition-colors bg-transparent border-none cursor-pointer p-0">
              Privacidad
            </button>
            <span className="text-gray-600">•</span>
            <button className="text-gray-400 hover:text-cyan-400 transition-colors bg-transparent border-none cursor-pointer p-0">
              Términos
            </button>
            <span className="text-gray-600">•</span>
            <button className="text-gray-400 hover:text-cyan-400 transition-colors bg-transparent border-none cursor-pointer p-0">
              Cookies
            </button>
          </div>
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
    </footer>
  );
}
