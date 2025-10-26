import React, { useEffect, useState } from 'react';
import {
  obtenerMisPresentaciones,
  eliminarPresentacion,
  actualizarPresentacion
} from '../services/api';
import PresentacionCard from './PresentacionCard';
import NuevaPresentacion from './NuevaPresentacion';

const ListaPresentaciones = () => {
  const [presentaciones, setPresentaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await obtenerMisPresentaciones(); // ✅ Usa API centralizada
      setPresentaciones(res.data || []);
    } catch (err) {
      console.error('Error al cargar presentaciones:', err);
      setPresentaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id) => {
    const confirmar = window.confirm('¿Eliminar esta presentación?');
    if (!confirmar) return;

    try {
      await eliminarPresentacion(id);
      cargar();
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('No se pudo eliminar');
    }
  };

  const editar = async (presentacion) => {
    const nuevoTitulo = prompt('Nuevo título:', presentacion.titulo);
    const nuevoContenido = prompt('Nuevo contenido:', presentacion.contenido);

    if (!nuevoTitulo || !nuevoContenido) return;

    try {
      await actualizarPresentacion(presentacion.id, {
        titulo: nuevoTitulo,
        contenido: nuevoContenido
      });
      cargar();
    } catch (err) {
      console.error('Error al editar:', err);
      alert('No se pudo actualizar');
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="space-y-6">
      <NuevaPresentacion onCreada={cargar} />
      {loading ? (
        <p className="text-gray-500 text-center">Cargando presentaciones...</p>
      ) : (
        <>
          {presentaciones.length === 0 ? (
            <p className="text-gray-500 text-center">No tienes presentaciones creadas.</p>
          ) : (
            presentaciones.map((p) => (
              <PresentacionCard
                key={p.id}
                presentacion={p}
                onEliminar={eliminar}
                onEditar={editar}
              />
            ))
          )}
        </>
      )}
    </div>
  );
};

export default ListaPresentaciones;
