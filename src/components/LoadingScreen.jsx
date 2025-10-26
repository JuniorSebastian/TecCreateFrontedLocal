import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
      <img
        src="https://i.ibb.co/Q3JXxDPY/Chat-GPT-Image-13-jun-2025-22-14-04-removebg-preview-Photoroom.png"
        alt="TecCreate Logo"
        className="w-52 md:w-64 mb-8 animate-float drop-shadow-xl"
      />

      <h1 className="text-3xl md:text-4xl font-extrabold text-blue-800 mb-3">TecCreate</h1>

      <div className="text-blue-700 font-medium text-lg md:text-xl flex items-center gap-1">
        Cargando tu cuenta<span className="animate-ellipsis">...</span>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes ellipsis {
          0% { content: ''; }
          33% { content: '.'; }
          66% { content: '..'; }
          100% { content: '...'; }
        }

        .animate-ellipsis::after {
          display: inline-block;
          animation: ellipsis 1.2s steps(3, end) infinite;
          content: '';
        }
      `}</style>
    </div>
  );
}
