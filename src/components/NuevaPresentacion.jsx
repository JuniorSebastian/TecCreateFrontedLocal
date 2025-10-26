import React, { useState } from 'react';
import { crearPresentacion } from '../services/api'; // ✅ Usa la función de API centralizada

const NuevaPresentacion = ({ onCreada }) => {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo.trim() || !contenido.trim()) {
      return alert('Completa todos los campos');
    }

    try {
      setCargando(true);

      // ✅ Construye la nueva presentación
      const nueva = {
        titulo,
        contenido: JSON.stringify([contenido]) // Puedes ajustarlo si usas estructura diferente
      };

      await crearPresentacion(nueva); // ✅ Usa axiosInstance con token incluido

      if (onCreada) onCreada();

      // Limpia formulario
      setTitulo('');
      setContenido('');
      alert('Presentación creada con éxito');
    } catch (error) {
      console.error('Error al crear presentación:', error);
      alert('Ocurrió un error al crear la presentación');
    } finally {
      setCargando(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow p-6 rounded-xl space-y-4 border"
    >
      <h2 className="text-xl font-bold text-gray-800">Nueva Presentación</h2>

      <input
        type="text"
        placeholder="Título"
        className="w-full p-3 border rounded shadow-sm"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        required
      />

      <textarea
        placeholder="Contenido"
        className="w-full p-3 border rounded shadow-sm min-h-[100px]"
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={cargando}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded transition disabled:opacity-50"
      >
        {cargando ? 'Creando...' : 'Crear'}
      </button>
    </form>
  );
};

export default NuevaPresentacion;
