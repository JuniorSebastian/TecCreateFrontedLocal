// src/components/Contact.jsx
import React, { useState } from 'react';
import { 
  EnvelopeIcon, 
  MapPinIcon, 
  PhoneIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// Estilos CSS personalizados para animaciones
const styles = `
  @keyframes blob {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(20px, -50px) scale(1.1); }
    50% { transform: translate(-20px, 20px) scale(0.9); }
    75% { transform: translate(20px, 20px) scale(1.05); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.4); }
    50% { box-shadow: 0 0 40px rgba(6, 182, 212, 0.8); }
  }
  
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .animate-blob { animation: blob 7s infinite; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
  .animate-slideInLeft { animation: slideInLeft 0.6s ease-out forwards; opacity: 0; }
  .animate-slideInRight { animation: slideInRight 0.6s ease-out forwards; opacity: 0; }
  .animate-shimmer { animation: shimmer 2s infinite; }
  .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
  .animate-gradient { animation: gradient 3s ease infinite; background-size: 200% 200%; }
  
  .animation-delay-100 { animation-delay: 0.1s; }
  .animation-delay-200 { animation-delay: 0.2s; }
  .animation-delay-300 { animation-delay: 0.3s; }
  .animation-delay-400 { animation-delay: 0.4s; }
  .animation-delay-500 { animation-delay: 0.5s; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
  
  .bg-size-200 { background-size: 200% 200%; }
  .hover\:shadow-3xl:hover { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
`;

export default function Contact() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviando(true);
    
    // Simular envío
    setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
      setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
      
      // Ocultar mensaje después de 5 segundos
      setTimeout(() => setEnviado(false), 5000);
    }, 1500);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <style>{styles}</style>
      <section className="min-h-screen py-20 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 relative overflow-hidden">
        {/* Elementos de fondo animados */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header animado */}
          <div className="text-center mb-16 animate-fadeIn">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur-lg opacity-50 animate-pulse-glow"></div>
                <div className="relative bg-white rounded-full p-4 shadow-2xl">
                  <SparklesIcon className="w-12 h-12 text-blue-600 animate-float" />
                </div>
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent mb-4 animate-gradient bg-size-200">
              Contáctanos
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              ¿Tienes alguna pregunta o sugerencia? Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos pronto.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Información de contacto - Lado izquierdo */}
            <div className="space-y-8 animate-slideInLeft">
              {/* Tarjeta principal de info */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 transform transition-all duration-500 hover:shadow-3xl hover:scale-[1.02]">
                <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </span>
                  Información de Contacto
                </h3>
                
                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 transform transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <EnvelopeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">Correo Electrónico</h4>
                      <a href="mailto:soporte@teccreate.com" className="text-blue-600 hover:text-cyan-600 transition-colors font-medium">
                        soporte@teccreate.com
                      </a>
                      <p className="text-sm text-gray-600 mt-1">Respuesta en 24-48 horas</p>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 transform transition-all duration-300 hover:scale-105 hover:shadow-lg group animation-delay-100">
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <MapPinIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">Ubicación</h4>
                      <p className="text-gray-700 font-medium">TECSUP</p>
                      <p className="text-gray-600">Lima, Perú</p>
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 transform transition-all duration-300 hover:scale-105 hover:shadow-lg group animation-delay-200">
                    <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <PhoneIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">Soporte Técnico</h4>
                      <p className="text-gray-700 font-medium">Lun - Vie: 9:00 AM - 6:00 PM</p>
                      <p className="text-gray-600">Atención en línea</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta decorativa adicional */}
              <div className="bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-600 bg-size-200 animate-gradient rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-shimmer"></div>
                <div className="relative z-10">
                  <h4 className="text-2xl font-bold mb-3">¿Por qué TecCreate?</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircleIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                      <span>Plataforma intuitiva y fácil de usar</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircleIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                      <span>Soporte técnico profesional</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircleIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                      <span>Actualizaciones constantes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircleIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                      <span>Seguridad garantizada</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Formulario - Lado derecho */}
            <div className="animate-slideInRight">
              <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 transform transition-all duration-500 hover:shadow-3xl relative overflow-hidden">
                {/* Efecto de brillo */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-size-200 animate-gradient"></div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Envíanos un mensaje</h3>
                
                {/* Mensaje de éxito */}
                {enviado && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">¡Mensaje enviado con éxito!</p>
                        <p className="text-sm text-green-700">Te responderemos pronto.</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nombre */}
                  <div className="group">
                    <label className="block mb-2 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all duration-300 group-hover:border-gray-300"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  {/* Email */}
                  <div className="group">
                    <label className="block mb-2 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all duration-300 group-hover:border-gray-300"
                      placeholder="tucorreo@ejemplo.com"
                    />
                  </div>

                  {/* Asunto */}
                  <div className="group">
                    <label className="block mb-2 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                      Asunto
                    </label>
                    <input
                      type="text"
                      name="asunto"
                      value={formData.asunto}
                      onChange={handleChange}
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all duration-300 group-hover:border-gray-300"
                      placeholder="¿En qué podemos ayudarte?"
                    />
                  </div>

                  {/* Mensaje */}
                  <div className="group">
                    <label className="block mb-2 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                      Mensaje
                    </label>
                    <textarea
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all duration-300 resize-none group-hover:border-gray-300"
                      placeholder="Escribe tu mensaje aquí..."
                    ></textarea>
                  </div>

                  {/* Botón de envío */}
                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-size-200 animate-gradient text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 group relative overflow-hidden"
                  >
                    {/* Efecto de brillo en hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-shimmer"></div>
                    
                    {enviando ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="relative z-10">Enviando...</span>
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                        <span className="relative z-10">Enviar mensaje</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Nota de privacidad */}
                <p className="mt-6 text-center text-sm text-gray-500">
                  <span className="inline-block mr-1">🔒</span>
                  Tus datos están protegidos y serán tratados con confidencialidad
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
