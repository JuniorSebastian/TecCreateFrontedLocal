import React from 'react';

const PresentacionCard = ({ presentacion, onEliminar, onEditar }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <h2 className="text-xl font-semibold mb-2">{presentacion.titulo}</h2>
      <p className="text-gray-700 mb-2">{presentacion.contenido}</p>
      <p className="text-gray-400 text-sm mb-4">Creada el {new Date(presentacion.fecha_creacion).toLocaleString()}</p>
      <div className="flex space-x-2">
        <button
          className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
          onClick={() => onEditar(presentacion)}
        >
          Editar
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          onClick={() => onEliminar(presentacion.id)}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default PresentacionCard;
