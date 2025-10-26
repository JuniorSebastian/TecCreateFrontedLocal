import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  HeartIcon,
  PaperAirplaneIcon,
  TagIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { crearReporteSoporte, obtenerCategoriasReportes } from '../services/api';

// Estilos CSS personalizados para animaciones avanzadas
const styles = `
  @keyframes blob {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(20px, -50px) scale(1.1); }
    50% { transform: translate(-20px, 20px) scale(0.9); }
    75% { transform: translate(20px, 20px) scale(1.05); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 30px rgba(6, 182, 212, 0.5); }
    50% { box-shadow: 0 0 60px rgba(6, 182, 212, 0.9); }
  }
  
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes bounce-soft {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  
  .animate-blob { animation: blob 8s infinite; }
  .animate-float { animation: float 4s ease-in-out infinite; }
  .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
  .animate-slideInLeft { animation: slideInLeft 0.7s ease-out forwards; }
  .animate-slideInRight { animation: slideInRight 0.7s ease-out forwards; }
  .animate-shimmer { animation: shimmer 2.5s infinite; }
  .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
  .animate-gradient { animation: gradient 4s ease infinite; background-size: 200% 200%; }
  .animate-bounce-soft { animation: bounce-soft 2.5s ease-in-out infinite; }
  
  .animation-delay-100 { animation-delay: 0.1s; }
  .animation-delay-200 { animation-delay: 0.2s; }
  .animation-delay-300 { animation-delay: 0.3s; }
  .animation-delay-400 { animation-delay: 0.4s; }
  .animation-delay-500 { animation-delay: 0.5s; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
  
  .bg-size-200 { background-size: 200% 200%; }
  .hover\:shadow-3xl:hover { box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.3); }
`;

const DESTINATARIOS = ['rodrigo.diaz.i@tecsup.edu.pe', 'junior.osorio@tecsup.edu.pe'];
const CATEGORIAS_FALLBACK = [
  { value: 'bug', label: 'Error en la aplicación' },
  { value: 'soporte', label: 'Soporte o problema de cuenta' },
  { value: 'idea', label: 'Sugerencia o nueva funcionalidad' },
  { value: 'otro', label: 'Otro motivo' },
];

const buildInitialForm = (categoriaDefault = CATEGORIAS_FALLBACK[0]?.value ?? '') => ({
  categoria: categoriaDefault,
  detalle: '',
  mensaje: '',
});

export default function Contactanos() {
  const navigate = useNavigate();
  const location = useLocation();
  const [categorias, setCategorias] = useState(() => CATEGORIAS_FALLBACK);
  const [form, setForm] = useState(() => buildInitialForm());
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargandoCategorias, setCargandoCategorias] = useState(false);
  
  // Obtener datos del usuario desde localStorage (incluye usuarios suspendidos)
  const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
  // Aceptar tanto 'email' como 'correo' del backend
  const correoUsuario = usuarioGuardado.email || usuarioGuardado.correo || '';
  const tieneUsuario = !!usuarioGuardado.nombre && !!correoUsuario;
  
  // Verificar si el usuario está suspendido
  const estasSuspendido = (usuarioGuardado.estado || '').toLowerCase() === 'suspendido';
  const redirigidoPorSuspension = (location.state?.motivo === 'suspendido') || estasSuspendido;
  
  // 🛡️ PROTECCIÓN: Evitar que usuarios suspendidos sean redirigidos fuera de /contacto
  // Esta página DEBE ser accesible para usuarios suspendidos para enviar reportes
  useEffect(() => {
    if (estasSuspendido && window.location.pathname !== '/contacto') {
      console.warn('⚠️ Usuario suspendido detectado fuera de /contacto, previniendo redirect');
    }
  }, [estasSuspendido]);
  
  // Determinar ruta de retorno según estado
  const handleVolver = () => {
    if (estasSuspendido) {
      navigate('/cuenta-suspendida');
    } else if (tieneUsuario) {
      navigate('/perfil');
    } else {
      navigate('/');
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setEnviado(false);
  };

  const resetForm = () => {
    const categoriaDefault = categorias[0]?.value ?? CATEGORIAS_FALLBACK[0]?.value ?? '';
    setForm(buildInitialForm(categoriaDefault));
    setEnviando(false);
    setError('');
  };

  useEffect(() => {
    let activo = true;
    const cargarCategorias = async () => {
      // Si el usuario está suspendido, usar directamente las categorías fallback
      // para evitar peticiones 403 que pueden causar redirecciones
      if (estasSuspendido) {
        console.warn('⚠️ Usuario suspendido: usando categorías fallback sin hacer petición al servidor');
        setCategorias(CATEGORIAS_FALLBACK);
        setForm((prev) => ({ ...prev, categoria: CATEGORIAS_FALLBACK[0].value }));
        setCargandoCategorias(false);
        return;
      }
      
      setCargandoCategorias(true);
      try {
        const respuesta = await obtenerCategoriasReportes();
        const normalizadas = Array.isArray(respuesta)
          ? respuesta
              .map((item) => {
                if (!item) return null;
                if (typeof item === 'string') {
                  return { value: item, label: item };
                }

                const value =
                  item.value ??
                  item.id ??
                  item.codigo ??
                  item.slug ??
                  item.nombre ??
                  item.name;
                const label =
                  item.label ??
                  item.nombre ??
                  item.descripcion ?? 
                  item.title ??
                  item.value ??
                  item.id;

                if (!value || !label) return null;
                return { value, label };
              })
              .filter(Boolean)
          : [];

        if (activo && normalizadas.length) {
          setCategorias(normalizadas);
          setForm((prev) =>
            normalizadas.some((categoria) => categoria.value === prev.categoria)
              ? prev
              : { ...prev, categoria: normalizadas[0].value }
          );
        }
      } catch (fetchError) {
        console.error('Error al cargar categorías de soporte', fetchError);
        // Si hay error (incluye 403 de usuario suspendido), usar categorías fallback
        console.warn('⚠️ Usando categorías fallback debido a error en la petición');
        if (activo) {
          setCategorias(CATEGORIAS_FALLBACK);
          setForm((prev) => ({ ...prev, categoria: CATEGORIAS_FALLBACK[0].value }));
        }
      } finally {
        if (activo) {
          setCargandoCategorias(false);
        }
      }
    };

    cargarCategorias();

    return () => {
      activo = false;
    };
  }, [estasSuspendido]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Obtener datos del usuario desde localStorage (puede ser usuario suspendido)
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    // Aceptar tanto 'email' como 'correo' del backend
    const correoUsuario = usuarioGuardado.email || usuarioGuardado.correo || '';
    
    // Verificar que tengamos datos del usuario (autenticado o suspendido)
    if (!usuarioGuardado.nombre || !correoUsuario) {
      setError('Debes iniciar sesión para enviar un reporte.');
      return;
    }

    const { categoria, detalle, mensaje } = form;
    if (!mensaje.trim()) {
      setError('Por favor escribe un mensaje.');
      return;
    }

    setEnviado(false);
    setEnviando(true);
    setError('');

    try {
      const categoriaSeleccionada =
        categorias.find((item) => item.value === categoria) || categorias[0] || CATEGORIAS_FALLBACK[0];

      // Enviar nombre y correo desde localStorage (funciona para usuarios autenticados y suspendidos)
      const payload = {
        categoria: categoriaSeleccionada?.value ?? categoria,
        resumenBreve: detalle.trim() || null,
        mensaje: mensaje.trim(),
        nombre: usuarioGuardado.nombre,
        correo: correoUsuario, // Usar el correo que ya verificamos (email o correo)
      };

      await crearReporteSoporte(payload);
      setEnviado(true);
      resetForm();
    } catch (submitError) {
      console.error('Error al enviar reporte de soporte', submitError);
      
      // NO redirigir en /contacto - esta página es accesible para usuarios suspendidos
      // Solo mostrar el mensaje de error sin redirigir
      const mensajeError =
        submitError?.response?.data?.message ||
        submitError?.response?.data?.error ||
        'No pudimos enviar tu reporte. Intenta nuevamente en unos minutos.';
      setError(mensajeError);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 py-14 px-4 relative overflow-hidden">
        {/* Elementos de fondo animados - Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="mx-auto max-w-5xl space-y-10 relative z-10">
        <header className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-size-200 animate-gradient p-10 text-white shadow-2xl hover:shadow-3xl transition-shadow duration-500 animate-fadeIn">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_55%)]"></div>
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/25 blur-3xl animate-pulse-glow"></div>
          <div className="absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-cyan-200/35 blur-[120px] animate-pulse"></div>
          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleVolver}
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 transition-all duration-300 hover:bg-white/20 hover:scale-105 transform active:scale-95 backdrop-blur-sm"
              >
                <ArrowLeftIcon className="h-4 w-4" /> 
                {estasSuspendido ? 'Volver a información de suspensión' : 'Volver a mi espacio'}
              </button>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur animate-bounce-soft">
                <HeartIcon className="h-4 w-4 animate-pulse" /> Estamos aquí para ayudarte
              </span>
            </div>
            {redirigidoPorSuspension && (
              <div className="flex items-start gap-3 rounded-2xl bg-white/15 p-4 text-left text-white/90">
                <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">Detectamos que tu cuenta está suspendida.</p>
                  <p className="opacity-80">
                    Completa este formulario para solicitar el desbaneo. Usaremos tu correo guardado como identificador.
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl text-center animate-slideInLeft">Cuéntanos qué necesitas</h1>
              <p className="max-w-3xl text-base text-white/80 md:text-lg text-center mx-auto animate-slideInRight animation-delay-100">
                Si encontraste un problema en TecCreate, tienes una propuesta o solo quieres saludar, escríbenos. Amamos escuchar a nuestra comunidad.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {DESTINATARIOS.map((correo, idx) => (
                <a
                  key={correo}
                  href={`mailto:${correo}`}
                  className={`group flex items-center justify-between gap-3 rounded-2xl border border-white/40 bg-white/15 px-5 py-4 text-sm font-semibold text-white/90 shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/25 hover:shadow-2xl transform animate-slideInLeft`}
                  style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
                >
                  <span className="flex items-center gap-3">
                    <EnvelopeIcon className="h-5 w-5" />
                    {correo}
                  </span>
                  <PaperAirplaneIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </a>
              ))}
            </div>
          </div>
        </header>

        <section className="grid gap-8 md:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6 rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 animate-slideInLeft animation-delay-300 backdrop-blur-sm">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent animate-gradient bg-size-200">
                Compártenos tu mensaje
              </h2>
              <p className="text-sm text-blue-600/80">
                Responderemos directo a tu correo. Cuéntanos todos los detalles para ayudarte más rápido.
              </p>
            </div>

            {/* Mensaje si no está autenticado */}
            {!tieneUsuario && (
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-5 py-4">
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0 text-yellow-600" />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-yellow-800">
                      Debes iniciar sesión para enviar un reporte
                    </p>
                    <p className="text-xs text-yellow-700">
                      Por seguridad, todos los reportes deben estar asociados a una cuenta de usuario.
                      Tu nombre y correo se tomarán automáticamente de tu sesión.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="mt-2 inline-flex items-center gap-2 rounded-full bg-yellow-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-700"
                    >
                      Iniciar sesión
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Información del usuario autenticado o suspendido */}
            {tieneUsuario && (
              <div className="relative overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 px-6 py-5 shadow-sm">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-green-200/30 blur-3xl"></div>
                <div className="relative flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-lg shadow-lg">
                    {usuarioGuardado.nombre?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-green-900 mb-1">
                      Enviando como: {usuarioGuardado.nombre || 'Usuario'}
                    </p>
                    <p className="text-xs text-green-700 mb-2 flex items-center gap-1">
                      <EnvelopeIcon className="h-3 w-3" />
                      {correoUsuario || 'No disponible'}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Información verificada automáticamente
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-[1.1fr,0.9fr]">
                <div className="space-y-2.5">
                  <label htmlFor="categoria" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                    <TagIcon className="h-4 w-4" />
                    Categoría del mensaje
                  </label>
                  <div className="group relative">
                    <select
                      id="categoria"
                      name="categoria"
                      value={form.categoria}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-2xl border-2 border-blue-100 bg-gradient-to-b from-white to-blue-50/30 px-5 py-3.5 pr-12 text-gray-800 font-medium shadow-sm transition-all duration-200 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:shadow-md disabled:opacity-60 disabled:cursor-not-allowed hover:border-blue-200"
                      disabled={cargandoCategorias || !tieneUsuario}
                    >
                      {categorias.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 transition-transform group-hover:scale-110">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <label htmlFor="detalle" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Resumen breve (opcional)
                  </label>
                  <input
                    id="detalle"
                    name="detalle"
                    type="text"
                    value={form.detalle}
                    onChange={handleChange}
                    placeholder="Ej. Error al descargar plantilla"
                    className="w-full rounded-2xl border-2 border-blue-100 bg-gradient-to-b from-white to-blue-50/30 px-5 py-3.5 text-gray-800 font-medium shadow-sm transition-all duration-200 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:shadow-md disabled:opacity-60 disabled:cursor-not-allowed hover:border-blue-200"
                    disabled={!tieneUsuario}
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label htmlFor="mensaje" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Mensaje
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={form.mensaje}
                  onChange={handleChange}
                  placeholder="Cuéntanos con detalle qué ocurrió, qué estabas haciendo o qué idea te gustaría que hagamos realidad. Mientras más información, mejor podremos ayudarte."
                  rows={7}
                  className="w-full rounded-2xl border-2 border-blue-100 bg-gradient-to-b from-white to-blue-50/30 px-5 py-4 text-gray-800 font-medium shadow-sm transition-all duration-200 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:shadow-md disabled:opacity-60 disabled:cursor-not-allowed hover:border-blue-200 resize-none"
                  disabled={!tieneUsuario}
                />
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mínimo: 10 caracteres • Máximo: 2000 caracteres
                </p>
              </div>

              {error && (
                <div className="group relative overflow-hidden rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50 px-5 py-4 shadow-sm">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-red-200/20 blur-2xl"></div>
                  <div className="relative flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                        <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-sm font-bold text-red-800 mb-1">Oops, algo salió mal</p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {enviado && !error && (
                <div className="group relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 px-5 py-4 shadow-sm animate-fade-in">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-200/20 blur-2xl"></div>
                  <div className="relative flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                        <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-sm font-bold text-emerald-800 mb-1">¡Mensaje enviado exitosamente! 🎉</p>
                      <p className="text-sm text-emerald-700">
                        Registramos tu reporte en nuestro sistema. Te contactaremos muy pronto al correo <span className="font-semibold">{correoUsuario}</span>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={enviando || !tieneUsuario}
                className="group relative inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-size-200 animate-gradient px-10 py-4 text-base font-bold text-white shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 overflow-hidden"
              >
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-shimmer"></div>
                
                <span className="relative flex items-center gap-3 z-10">
                  {enviando ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando reporte...
                    </>
                  ) : (
                    <>
                      Enviar reporte
                      <PaperAirplaneIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>

          <aside className="space-y-6 rounded-3xl border border-blue-100 bg-white/90 p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 animate-slideInRight animation-delay-400 backdrop-blur-sm">
            <div className="space-y-3">
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Sistema de reportes autenticados
              </h3>
              <p className="text-sm text-blue-600/75">
                Por tu seguridad y la nuestra, ahora todos los reportes requieren que inicies sesión. 
                Tu correo y nombre se tomarán automáticamente de tu cuenta.
              </p>
            </div>

            {tieneUsuario && (
              <div className="relative overflow-hidden space-y-4 rounded-2xl border-2 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 px-6 py-5 shadow-sm">
                <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-green-200/20 blur-3xl"></div>
                <p className="relative text-xs font-black uppercase tracking-widest text-green-600 flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Tu información
                </p>
                <div className="relative space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-bold shadow-lg ring-4 ring-green-100">
                      {usuarioGuardado.nombre?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-green-900">{usuarioGuardado.nombre}</p>
                      <p className="text-xs text-green-700 flex items-center gap-1">
                        <EnvelopeIcon className="h-3 w-3" />
                        {correoUsuario}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-xl bg-white/60 px-3 py-2.5 backdrop-blur">
                    <svg className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-green-800 leading-relaxed">
                      Esta información se enviará automáticamente con tu reporte. No necesitas escribirla de nuevo.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {DESTINATARIOS.map((correo, index) => (
                <div key={`card-${correo}`} className="group relative overflow-hidden rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 px-6 py-5 shadow-md transition-all duration-300 hover:shadow-xl hover:border-blue-200 hover:scale-105 transform animate-fadeIn" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-200/20 blur-2xl transition-all duration-300 group-hover:bg-blue-300/30"></div>
                  <div className="relative space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-blue-600 text-xs font-bold">
                          {index + 1}
                        </div>
                        Correo directo
                      </p>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <EnvelopeIcon className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-sm font-bold text-blue-900 break-all">{correo}</p>
                    <a
                      href={`mailto:${correo}`}
                      className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 transition-all hover:text-blue-700 hover:gap-3"
                    >
                      Escribir ahora
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 rounded-2xl border border-blue-100 bg-white px-5 py-4 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-400">Guía rápida</p>
              <ul className="space-y-2 text-sm text-blue-500/80">
                <li className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
                    1
                  </span>
                  Inicia sesión con tu cuenta de TecCreate
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
                    2
                  </span>
                  Describe qué estabas haciendo cuando ocurrió el problema.
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
                    3
                  </span>
                  Tu información de contacto se agregará automáticamente.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-4 text-sm text-blue-600">
              También puedes llamarnos en horario laboral a
              <a href="tel:+51982706458" className="ml-2 font-semibold text-blue-700 underline-offset-2 hover:underline">
                +51 982 706 458
              </a>
              {' '}para orientación inmediata.
            </div>
          </aside>
        </section>

        <footer className="text-center animate-fadeIn animation-delay-500">
          <p className="text-xl md:text-2xl font-bold text-gray-800 flex items-center justify-center gap-3">
            <span className="text-3xl">✨</span>
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent animate-gradient bg-size-200">
              "Lo que se hace con amor, jamás se olvida."
            </span>
            <span className="text-3xl">✨</span>
          </p>
        </footer>
      </div>
      </div>
    </>
  );
}
