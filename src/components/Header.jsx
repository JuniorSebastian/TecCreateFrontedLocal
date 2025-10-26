// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { SparklesIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#inicio', text: 'Inicio', icon: '🏠' },
    { href: '#funcionalidades', text: 'Funcionalidades', icon: '⚡' },
    { href: '#testimonios', text: 'Testimonios', icon: '💬' },
    { href: '#contacto', text: 'Contacto', icon: '📧' },
  ];

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-2xl shadow-cyan-500/10'
          : 'bg-white/80 backdrop-blur-md shadow-lg'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo mejorado */}
          <motion.div
            className="flex items-center gap-3 group cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-sky-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-teal-400 via-sky-500 to-purple-600 p-2 rounded-xl shadow-lg">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-teal-500 via-sky-500 to-purple-600 bg-clip-text text-transparent">
                TecCreate
              </h1>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Powered by AI
              </p>
            </div>
          </motion.div>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.text}
                href={link.href}
                className="relative px-4 py-2 text-gray-700 hover:text-cyan-600 font-semibold text-sm transition-colors duration-300 group rounded-xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-lg">{link.icon}</span>
                  {link.text}
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-teal-50 to-sky-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  layoutId="navHighlight"
                />
              </motion.a>
            ))}
            
            {/* Botón CTA */}
            <motion.a
              href="/login"
              className="ml-4 relative group overflow-hidden px-6 py-2.5 bg-gradient-to-r from-teal-400 via-sky-500 to-purple-600 text-white font-bold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <SparklesIcon className="w-4 h-4" />
                Comenzar
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.a>
          </nav>

          {/* Botón Menú Mobile */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-gradient-to-br from-teal-50 to-sky-50 text-teal-600 hover:from-teal-100 hover:to-sky-100 transition-all duration-300"
            whileTap={{ scale: 0.9 }}
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Menú Mobile */}
      <motion.div
        initial={false}
        animate={{
          height: isMobileMenuOpen ? 'auto' : 0,
          opacity: isMobileMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-gray-100"
      >
        <nav className="px-4 py-6 space-y-3">
          {navLinks.map((link, index) => (
            <motion.a
              key={link.text}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 text-gray-700 hover:text-teal-600 font-semibold rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-sky-50 transition-all duration-300"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-3">
                <span className="text-xl">{link.icon}</span>
                {link.text}
              </span>
            </motion.a>
          ))}
          <motion.a
            href="/login"
            className="block text-center mt-4 px-6 py-3 bg-gradient-to-r from-teal-400 via-sky-500 to-purple-600 text-white font-bold rounded-full shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center justify-center gap-2">
              <SparklesIcon className="w-5 h-5" />
              Comenzar Ahora
            </span>
          </motion.a>
        </nav>
      </motion.div>
    </motion.header>
  );
};

export default Header;
