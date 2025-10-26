import React from 'react';
import NuevaPresentacion from '../components/NuevaPresentacion';

const Crear = () => {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Crear Nueva Presentación</h2>
      <NuevaPresentacion onCreada={() => window.location.href = '/'} />
    </div>
  );
};

export default Crear;
