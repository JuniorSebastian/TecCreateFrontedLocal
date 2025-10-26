// src/components/Footer.jsx
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h3 className="text-2xl font-bold mb-4">¿Listo para empezar?</h3>
        <p className="mb-6">Contáctanos en <a href="mailto:soporte@teccreate.com" className="text-cyan-400 underline">soporte@teccreate.com</a></p>
        <p className="text-sm text-gray-400">© {new Date().getFullYear()} TecCreate. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
