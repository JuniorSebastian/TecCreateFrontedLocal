import React from 'react';
import NuevaPresentacion from '../components/NuevaPresentacion';

const Nueva = () => {
  return (
    <div>
      <h2>Crear nueva presentación</h2>
      <NuevaPresentacion onGuardar={() => {}} />
    </div>
  );
};

export default Nueva;
