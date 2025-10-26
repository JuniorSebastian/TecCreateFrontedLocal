// src/pages/CuentaSuspendida.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ExclamationTriangleIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function CuentaSuspendida() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/';
  };

  const handleSolicitarDesbaneo = () => {
    navigate('/contacto');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-red-100 px-4 py-12">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center">
        {/* Icono animado */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-red-100 rounded-full animate-ping opacity-25"></div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <ExclamationTriangleIcon className="w-16 h-16 text-white animate-pulse" />
            </div>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          Cuenta Suspendida
        </h1>

        {/* Mensaje principal */}
        <div className="mb-8">
          <p className="text-lg text-gray-700 mb-4">
            Tu cuenta ha sido <span className="font-bold text-red-600">suspendida temporalmente</span>.
          </p>
          <p className="text-gray-600">
            No puedes acceder a la plataforma en este momento. Por favor, contacta con nuestro equipo de soporte para obtener más información y resolver esta situación.
          </p>
        </div>

        {/* Información de contacto */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">¿Necesitas ayuda?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <EnvelopeIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Email de Soporte</p>
                <a 
                  href="mailto:soporte@teccreate.com" 
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  soporte@teccreate.com
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <PhoneIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">WhatsApp</p>
                <a 
                  href="https://wa.me/51999999999" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  +51 999 999 999
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleSolicitarDesbaneo}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <EnvelopeIcon className="w-5 h-5" />
            Solicitar Desbaneo
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>

        {/* Mensaje adicional */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Si crees que esto es un error, haz clic en "Solicitar Desbaneo" para contactar con nuestro equipo.
          </p>
        </div>
      </div>

      {/* Estilos para animaciones */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
