import React from 'react';
import { iniciarSesionConGoogle } from '../services/api';

export default function GoogleLoginButton() {
  const handleLogin = () => {
    // ✅ Usa la función centralizada que maneja correctamente el redirect
    iniciarSesionConGoogle();
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center justify-center gap-3 bg-white text-gray-800 border border-gray-300 rounded-lg shadow px-6 py-3 font-semibold hover:bg-gray-50 transition"
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
        alt="Google"
        className="w-5 h-5"
      />
      Iniciar sesión con Google
    </button>
  );
}
