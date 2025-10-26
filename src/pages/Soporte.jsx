// src/pages/Soporte.jsx
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  XMarkIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import {
  obtenerReportesSoporte,
  actualizarEstadoReporte,
  obtenerMetricasReportesSoporte,
  exportarReportesSoporte,
  obtenerUsuariosSoporte,
  obtenerUsuarioSoportePorEmail,
  obtenerPresentacionesUsuarioAdmin,
  obtenerPresentacionesUsuarioSoporte,
  actualizarEstadoUsuarioAdmin,
  obtenerEstadoMantenimientoSoporte,
  actualizarEstadoMantenimientoSoporte,
  obtenerHistorialMantenimientoSoporte,
  obtenerHistorialReportesSoporte,
  obtenerNotificacionesSoporte,
  marcarNotificacionSoporteLeida,
  eliminarReporteSoporte,
  obtenerComentariosReporteSoporte,
  crearComentarioReporteSoporte,
  eliminarPresentacion,
} from '../services/api';

// ===========================
// UTILIDADES
// ===========================

const toLabel = (texto = '') => {
  const limpio = String(texto).replace(/[_-]+/g, ' ').trim();
  if (!limpio) return '';
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
};

const acortar = (texto, limite = 110) => {
  if (texto === null || texto === undefined) return 'N/A';
  const valor = String(texto);
  return valor.length > limite ? `${valor.slice(0, limite)}...` : valor;
};

const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin fecha';
  try {
    return new Date(fecha).toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return 'Fecha inválida';
  }
};

const obtenerIdReporte = (reporte, fallbackIndex) =>
  reporte?.id ??
  reporte?.reporteId ??
  reporte?.reporte_id ??
  reporte?.uuid ??
  `reporte-${fallbackIndex}`;

const obtenerEstadoKey = (reporte) =>
  (reporte?.estadoKey ?? reporte?.estado_key ?? reporte?.estado ?? 'pendiente')
    .toString()
    .toLowerCase();

const obtenerCategoriaKey = (reporte) =>
  (reporte?.categoriaKey ?? reporte?.categoria_key ?? reporte?.categoria ?? '')
    .toString()
    .toLowerCase();

const obtenerCategoriaLabel = (reporte) =>
  reporte?.categoria ??
  reporte?.categoriaNombre ??
  reporte?.categoria_label ??
  reporte?.categoriaDescripcion ??
  (obtenerCategoriaKey(reporte) ? toLabel(obtenerCategoriaKey(reporte)) : 'Sin categoria');

const obtenerFechaReporte = (reporte) =>
  reporte?.fecha ??
  reporte?.fecha_creacion ??
  reporte?.fechaCreacion ??
  reporte?.created_at ??
  reporte?.createdAt ??
  reporte?.creado_en ??
  reporte?.creadoEn ??
  reporte?.fechaRegistro ??
  reporte?.fecha_registro ??
  null;

const obtenerAvatarUrl = (foto, nombre = 'Usuario') => {
  const displayName = nombre || 'Usuario';
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`;
  if (!foto) return fallback;
  return /^(https?:|data:)/i.test(foto) ? foto : fallback;
};

const getEstadoIcon = (estadoKey) => {
  switch (estadoKey) {
    case 'pendiente':
    case 'abierto':
      return <ClockIcon className="w-5 h-5 text-yellow-600" />;
    case 'en_proceso':
    case 'enproceso':
      return <ExclamationTriangleIcon className="w-5 h-5 text-blue-600" />;
    case 'resuelto':
    case 'cerrado':
      return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
    default:
      return <ClockIcon className="w-5 h-5 text-gray-600" />;
  }
};

const getEstadoBadgeClass = (estadoKey) => {
  switch (estadoKey) {
    case 'pendiente':
    case 'abierto':
      return 'bg-yellow-100 text-yellow-800';
    case 'en_proceso':
    case 'enproceso':
      return 'bg-blue-100 text-blue-800';
    case 'resuelto':
    case 'cerrado':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const obtenerIdReporteParaAccion = (reporte) =>
  reporte?.id ?? reporte?.reporteId ?? reporte?.reporte_id ?? null;

const obtenerResueltoEn = (reporte) =>
  reporte?.resuelto_en ??
  reporte?.resueltoEn ??
  reporte?.fecha_resuelto ??
  reporte?.fechaResuelto ??
  reporte?.fecha_resolucion ??
  reporte?.fechaResolucion ??
  null;

const estaEliminado = (reporte) =>
  reporte?.eliminado === true || reporte?.estado === 'eliminado' || reporte?.estadoKey === 'eliminado';

const normalizarComentario = (comentario, index = 0) => {
  if (!comentario) {
    return {
      id: `comentario-${index}`,
      mensaje: 'Sin mensaje',
      tipo: 'interno',
      autor_nombre: 'Soporte',
      autor_foto: null,
      creado_en: null,
    };
  }

  const creado =
    comentario.creado_en ??
    comentario.created_at ??
    comentario.creadoEn ??
    comentario.createdAt ??
    comentario.fecha ??
    null;

  return {
    id: comentario.id ?? comentario.uuid ?? `comentario-${index}`,
    mensaje: comentario.mensaje ?? comentario.detalle ?? comentario.texto ?? 'Sin mensaje',
    tipo: (comentario.tipo ?? comentario.tipo_comentario ?? 'interno').toString().toLowerCase(),
    autor_nombre: comentario.autor_nombre ?? comentario.autor ?? comentario.nombre ?? 'Soporte',
    autor_foto: comentario.autor_foto ?? comentario.foto ?? comentario.avatar ?? null,
    creado_en: creado,
  };
};

const extraerListaReportes = (payload) => {
  if (!payload) return [];

  const convertirObjetoALista = (valor) => {
    if (!valor || typeof valor !== 'object') return null;
    if (Array.isArray(valor)) return valor;
    if (valor instanceof Map) return Array.from(valor.values());
    if (valor instanceof Set) return Array.from(valor);

    const valores = Object.values(valor);
    if (!valores.length) return null;

    const sonObjetos = valores.every((item) => item && typeof item === 'object');
    if (!sonObjetos) return null;

    return valores;
  };

  const clavesPreferidas = [
    'reportes',
    'data',
    'items',
    'rows',
    'results',
    'lista',
    'list',
    'entries',
    'registros',
    'tickets',
  ];

  const visitados = new Set();
  const cola = [payload];

  while (cola.length) {
    const actual = cola.shift();

    if (Array.isArray(actual)) {
      return actual;
    }

    if (!actual || typeof actual !== 'object') {
      continue;
    }

    if (visitados.has(actual)) {
      continue;
    }

    visitados.add(actual);

    const listaDesdeObjeto = convertirObjetoALista(actual);
    if (Array.isArray(listaDesdeObjeto)) {
      return listaDesdeObjeto;
    }

    for (const clave of clavesPreferidas) {
      const candidato = actual[clave];
      if (Array.isArray(candidato)) {
        return candidato;
      }

      if (candidato && typeof candidato === 'object' && !visitados.has(candidato)) {
        const lista = convertirObjetoALista(candidato);
        if (Array.isArray(lista)) {
          return lista;
        }
        cola.push(candidato);
      }
    }

    for (const valor of Object.values(actual)) {
      if (Array.isArray(valor)) {
        return valor;
      }

      if (valor && typeof valor === 'object' && !visitados.has(valor)) {
        const lista = convertirObjetoALista(valor);
        if (Array.isArray(lista)) {
          return lista;
        }
        cola.push(valor);
      }
    }
  }

  return [];
};

// ===========================
// UTILIDADES ADICIONALES PARA USUARIOS
// ===========================

const numberFormatter = new Intl.NumberFormat('es-ES');

const formatearNumero = (valor) => {
  if (valor === null || valor === undefined) return '0';
  const numero = typeof valor === 'number' ? valor : Number(valor);
  if (!Number.isFinite(numero)) return String(valor);
  return numberFormatter.format(numero);
};

const extraerValorFecha = (valor) => {
  if (!valor) return null;
  if (valor instanceof Date) return valor.toISOString();
  const tipo = typeof valor;
  if (tipo === 'string' || tipo === 'number') return valor;
  if (tipo === 'object') {
    const posiblesClaves = [
      'fecha',
      'fecha_presentacion',
      'fechaPresentacion',
      'fecha_creacion',
      'fechaCreacion',
      'creada_en',
      'creadaEn',
      'created_at',
      'createdAt',
      'actualizada_en',
      'actualizadaEn',
      'updated_at',
      'updatedAt',
      'fechaRegistro',
      'fecha_registro',
      'ultimo_acceso',
      'ultimoAcceso',
      'ultimo_login',
      'ultimoLogin',
      'momento',
    ];
    for (const clave of posiblesClaves) {
      if (valor[clave]) return valor[clave];
    }
  }
  return null;
};

const normalizarValorFecha = (...valores) => {
  for (const valor of valores) {
    const fecha = extraerValorFecha(valor);
    if (fecha) return fecha;
  }
  return null;
};

const obtenerUsuarioId = (usuario) =>
  usuario?.id ??
  usuario?.usuarioId ??
  usuario?.usuario_id ??
  usuario?.uuid ??
  usuario?.codigo ??
  null;

const obtenerUsuarioEmail = (usuario) =>
  usuario?.email ??
  usuario?.correo ??
  usuario?.mail ??
  usuario?.user_email ??
  null;

const obtenerRolUsuarioNormalizado = (usuario) => {
  const raw = usuario?.rol ?? usuario?.role ?? usuario?.tipo ?? null;
  return raw ? raw.toString().toLowerCase() : '';
};

const esUsuarioFinal = (usuario) => obtenerRolUsuarioNormalizado(usuario) === 'usuario';

const obtenerEstadoUsuarioNormalizado = (usuario) => {
  const raw = usuario?.estado ?? usuario?.status ?? usuario?.userStatus ?? null;
  return raw ? raw.toString().toLowerCase() : '';
};

const obtenerUltimaActividadUsuario = (usuario) =>
  normalizarValorFecha(
    usuario?.ultimaActividad,
    usuario?.ultima_actividad,
    usuario?.ultimaActividadFecha,
    usuario?.ultima_actividad_fecha,
    usuario?.ultimoAcceso,
    usuario?.ultimo_acceso,
    usuario?.ultimoLogin,
    usuario?.ultimo_login,
    usuario?.metricas?.ultimaActividad,
    usuario?.metricas?.ultima_actividad,
  );

const obtenerFechaRegistroUsuario = (usuario) =>
  normalizarValorFecha(
    usuario?.fechaRegistro,
    usuario?.fecha_registro,
    usuario?.createdAt,
    usuario?.created_at,
    usuario?.creadoEn,
    usuario?.creado_en,
  );

const obtenerTotalPresentacionesUsuario = (usuario) =>
  usuario?.totalPresentaciones ??
  usuario?.total_presentaciones ??
  usuario?.metricas?.presentaciones ??
  null;

const obtenerFechaPresentacion = (presentacion) =>
  normalizarValorFecha(
    presentacion?.fechaCreacion,
    presentacion?.fecha_creacion,
    presentacion?.creadaEn,
    presentacion?.creada_en,
    presentacion?.createdAt,
    presentacion?.created_at,
    presentacion?.fecha,
    presentacion?.actualizadaEn,
    presentacion?.actualizada_en,
    presentacion?.updatedAt,
    presentacion?.updated_at,
  );

const obtenerIdPresentacion = (presentacion) =>
  presentacion?.id ??
  presentacion?.presentacionId ??
  presentacion?.presentacion_id ??
  presentacion?.uuid ??
  null;

const esObjetoPresentacion = (valor) =>
  valor &&
  typeof valor === 'object' &&
  !Array.isArray(valor) &&
  (valor.titulo !== undefined || valor.nombre !== undefined || valor.presentacionId !== undefined || valor.presentacion_id !== undefined);

const toSentence = (texto) => {
  if (!texto) return '';
  const valor = String(texto).trim();
  return valor ? valor.charAt(0).toUpperCase() + valor.slice(1) : '';
};

// ===========================
// COMPONENTE PRINCIPAL
// ===========================

export default function Soporte() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState('reportes');

  // Estados generales
  const [mensaje, setMensaje] = useState(null);

  // Estados de reportes
  const [reportes, setReportes] = useState([]);
  const [reportesOcultos, setReportesOcultos] = useState(0);
  const [errorReportes, setErrorReportes] = useState('');
  const [busquedaReportes, setBusquedaReportes] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [actualizandoId, setActualizandoId] = useState(null);

  // Estados de usuarios
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [busquedaUsuarios, setBusquedaUsuarios] = useState('');
  const [rolFiltroUsuarios, setRolFiltroUsuarios] = useState('todos');
  const [estadoFiltroUsuarios, setEstadoFiltroUsuarios] = useState('todos');
  const [usuarioSeleccionadoEmail, setUsuarioSeleccionadoEmail] = useState(null);
  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState(null);
  const [usuarioDetalle, setUsuarioDetalle] = useState(null);
  const [cargandoUsuarioDetalle, setCargandoUsuarioDetalle] = useState(false);
  const [presentacionesUsuario, setPresentacionesUsuario] = useState([]);
  const [presentacionesUsuarioTotal, setPresentacionesUsuarioTotal] = useState(0);
  const [cargandoPresentacionesUsuario, setCargandoPresentacionesUsuario] = useState(false);
  const [mensajePresentacionesUsuario, setMensajePresentacionesUsuario] = useState(null);
  const [eliminandoPresentacionId, setEliminandoPresentacionId] = useState(null);
  const [mensajeUsuarios, setMensajeUsuarios] = useState(null);
  const [actualizandoEstadoUsuarioId, setActualizandoEstadoUsuarioId] = useState(null);

  // Estados de mantenimiento
  const [mantenimiento, setMantenimiento] = useState(null);
  const [cargandoMantenimiento, setCargandoMantenimiento] = useState(false);
  const [activandoMantenimiento, setActivandoMantenimiento] = useState(false);
  const [mostrarModalMantenimiento, setMostrarModalMantenimiento] = useState(false);
  const [mensajeMantenimiento, setMensajeMantenimiento] = useState('');

  // Estados de historial
  const [historialMantenimientos, setHistorialMantenimientos] = useState([]);
  const [historialReportes, setHistorialReportes] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Estados de notificaciones
  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [paginaNotificaciones, setPaginaNotificaciones] = useState(0);
  const NOTIFICACIONES_POR_PAGINA = 5;

  // Estados de paginación para tablas
  const [paginaReportes, setPaginaReportes] = useState(0);
  const [paginaUsuarios, setPaginaUsuarios] = useState(0);
  const [paginaMantenimiento, setPaginaMantenimiento] = useState(0);
  const [paginaHistorial, setPaginaHistorial] = useState(0);
  const ITEMS_POR_PAGINA = 5;

  // Estados de comentarios
  const [reporteComentarios, setReporteComentarios] = useState(null);
  const [comentarioMensaje, setComentarioMensaje] = useState('');
  const [comentarioTipo, setComentarioTipo] = useState('interno');
  const [comentarioError, setComentarioError] = useState('');
  const [comentariosAviso, setComentariosAviso] = useState(null);

  const queryClient = useQueryClient();

  const reportesQuery = useQuery({
    queryKey: ['soporte', 'reportes', { estadoFiltro, categoriaFiltro, busqueda: busquedaReportes.trim() }],
    enabled: !!usuario,
    queryFn: async () => {
      console.log('[Soporte] 🚀 queryFn reportes ejecutándose...');
      console.log('[Soporte] Usuario activo:', usuario);
      
      const params = {};
      if (estadoFiltro !== 'todos') params.estado = estadoFiltro;
      if (categoriaFiltro !== 'todas') params.categoria = categoriaFiltro;
      const busqueda = busquedaReportes.trim();
      if (busqueda) params.search = busqueda;

      console.log('[Soporte] Params de búsqueda:', params);

      const response = await obtenerReportesSoporte(params);
      console.log('[Soporte] Response completo:', response);
      
      const payload = response?.data || {};
      console.log('[Soporte] Payload extraído:', payload);
      
      const { ok = true, data: dataLista, message } = payload;

      if (!ok) {
        const error = new Error(message || 'Respuesta inválida del backend');
        error.response = { data: payload };
        throw error;
      }

      const listaDetectada = Array.isArray(dataLista) ? dataLista : extraerListaReportes(payload);
      const listaRaw = Array.isArray(listaDetectada) ? listaDetectada : [];

      console.log('[Soporte] ✅ Lista detectada:', listaRaw.length, 'reportes');
      console.log('[Soporte] Primeros 2 reportes:', listaRaw.slice(0, 2));

      if (process.env.NODE_ENV !== 'production') {
        console.debug('[Soporte] Payload reportes bruto:', payload);
        console.debug('[Soporte] Lista detectada:', Array.isArray(listaRaw) ? listaRaw.length : 0);
      }

      const lista = listaRaw.filter((item) => !estaEliminado(item));

      const categoriasUnicas = new Map();
      lista.forEach((reporte, index) => {
        const key = obtenerCategoriaKey(reporte) || `categoria-${index}`;
        if (!key) return;
        const label = obtenerCategoriaLabel(reporte);
        if (!categoriasUnicas.has(key)) {
          categoriasUnicas.set(key, { value: key, label });
        }
      });

      const categoriasOrdenadas = Array.from(categoriasUnicas.values()).sort((a, b) =>
        a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }),
      );

      const resultado = {
        lista,
        categorias: categoriasOrdenadas,
        ocultos: Math.max(0, listaRaw.length - lista.length),
      };

      console.log('[Soporte] 📦 Retornando resultado:', resultado);

      return resultado;
    },
  });

  const metricasQuery = useQuery({
    queryKey: ['soporte', 'metricas'],
    enabled: !!usuario,
    queryFn: async () => {
      const data = await obtenerMetricasReportesSoporte();
      const payload = data || {};

      if (payload.ok === false) {
        const error = new Error(payload.message || 'Respuesta inválida del backend');
        error.response = { data: payload };
        throw error;
      }

      return payload.data ?? payload.metricas ?? payload;
    },
  });

  const metricas = metricasQuery.data ?? null;
  const cargandoReportes = reportesQuery.isLoading;
  const consultandoReportes = reportesQuery.isFetching;

  // Actualizar estado cuando React Query tenga datos
  useEffect(() => {
    if (reportesQuery.data) {
      const { lista, categorias, ocultos } = reportesQuery.data;
      console.log('[Soporte] 🔄 useEffect actualizando estado con:', lista?.length, 'reportes');
      setErrorReportes('');
      setReportes(lista || []);
      setCategoriasDisponibles(categorias || []);
      setReportesOcultos(ocultos || 0);
    }
  }, [reportesQuery.data]);

  // Manejar errores
  useEffect(() => {
    if (reportesQuery.error) {
      console.error('[Soporte] ❌ Error detectado:', reportesQuery.error);
      const mensajeError =
        reportesQuery.error?.response?.data?.message ||
        reportesQuery.error?.response?.data?.error ||
        reportesQuery.error?.message ||
        'No fue posible cargar los reportes.';
      setErrorReportes(mensajeError);
      setReportes([]);
      setCategoriasDisponibles([]);
      setReportesOcultos(0);
    }
  }, [reportesQuery.error]);

  const { refetch: refetchReportes } = reportesQuery;
  const { refetch: refetchMetricas } = metricasQuery;

  const handleRefrescarReportes = useCallback(async () => {
    await Promise.all([refetchReportes(), refetchMetricas()]);
  }, [refetchMetricas, refetchReportes]);

  const {
    data: comentariosData,
    isLoading: cargandoComentarios,
    isFetching: consultandoComentarios,
    error: errorComentarios,
    refetch: refetchComentarios,
  } = useQuery({
    queryKey: ['soporte', 'reportes', 'comentarios', reporteComentarios?.id],
    enabled: !!reporteComentarios?.id,
    queryFn: async () => {
      if (!reporteComentarios?.id) return [];

      const data = await obtenerComentariosReporteSoporte(reporteComentarios.id);
      const payload = data || {};

      if (payload.ok === false) {
        const error = new Error(payload.message || 'No fue posible cargar los comentarios.');
        error.response = { data: payload };
        throw error;
      }

      const lista = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.comentarios)
          ? payload.comentarios
          : Array.isArray(payload)
            ? payload
            : [];

      return lista.map((comentario, index) => normalizarComentario(comentario, index));
    },
  });

  const comentarios = comentariosData || [];

  const estadosDisponibles = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_proceso', label: 'En proceso' },
    { value: 'resuelto', label: 'Resuelto' },
  ];

  const tiposComentarioDisponibles = [
    { value: 'interno', label: 'Interno' },
    { value: 'respuesta', label: 'Respuesta' },
    { value: 'nota', label: 'Nota' },
  ];

  // ===========================
  // FETCH FUNCTIONS
  // ===========================

  const fetchUsuarios = useCallback(async () => {
    setCargandoUsuarios(true);
    try {
      const params = {};
      if (rolFiltroUsuarios !== 'todos') params.rol = rolFiltroUsuarios;
      if (estadoFiltroUsuarios !== 'todos') params.estado = estadoFiltroUsuarios;
      if (busquedaUsuarios.trim()) params.search = busquedaUsuarios.trim();

      const data = await obtenerUsuariosSoporte(params);
      const payload = data || {};
      if (payload.ok === false) {
        throw new Error(payload.message || 'Respuesta inválida del backend');
      }
      const lista = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.usuarios)
          ? payload.usuarios
          : Array.isArray(payload)
            ? payload
            : [];
      setUsuarios(lista);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setUsuarios([]);
    } finally {
      setCargandoUsuarios(false);
    }
  }, [rolFiltroUsuarios, estadoFiltroUsuarios, busquedaUsuarios]);

  const fetchPresentacionesUsuarioSoporte = useCallback(
    async ({ usuarioId, email, limit = 20 } = {}) => {
      const id = usuarioId ?? null;
      const correo = email ?? null;

      if (!id) {
        setPresentacionesUsuario([]);
        setPresentacionesUsuarioTotal(0);
        setMensajePresentacionesUsuario({
          tipo: 'info',
          texto: correo
            ? `No se pudo obtener el historial de presentaciones para ${correo} porque falta el identificador interno.`
            : 'No se pudo obtener el historial de presentaciones porque falta el identificador interno del usuario seleccionado.',
        });
        return;
      }

      setCargandoPresentacionesUsuario(true);
      setMensajePresentacionesUsuario(null);
      try {
        const rolActual = usuario?.rol ? usuario.rol.toString().toLowerCase() : '';
        const esAdmin = rolActual === 'admin';

        const resolverPayload = (data) => data || {};

        const cargarDesdeAdmin = async () => resolverPayload(await obtenerPresentacionesUsuarioAdmin(id, { limit }));
        const cargarDesdeSoporte = async () => resolverPayload(await obtenerPresentacionesUsuarioSoporte(id, { limit }));

        let payload;

        if (esAdmin) {
          payload = await cargarDesdeAdmin();
        } else {
          try {
            payload = await cargarDesdeSoporte();
          } catch (errorSoporte) {
            const codigo = errorSoporte?.response?.status;
            const mensajeError = errorSoporte?.response?.data?.message || errorSoporte?.message || '';
            const notFound = codigo === 404 || /no[\s-]?encontrad[oa]/i.test(mensajeError);
            const forbidden = codigo === 403;

            if (forbidden) {
              setPresentacionesUsuario([]);
              setPresentacionesUsuarioTotal(0);
              setMensajePresentacionesUsuario({
                tipo: 'error',
                texto: 'Tu rol soporte no tiene permisos para revisar las presentaciones del usuario seleccionado.',
              });
              return;
            }

            if (notFound) {
              console.warn('Ruta /soporte/usuarios/:id/presentaciones no disponible, usando fallback admin');
              try {
                payload = await cargarDesdeAdmin();
                setMensajePresentacionesUsuario({
                  tipo: 'info',
                  texto: 'El backend no expone /soporte/usuarios/:id/presentaciones. Se usó el endpoint admin como respaldo.',
                });
              } catch (errorAdminFallback) {
                const codigoFallback = errorAdminFallback?.response?.status;
                if (codigoFallback === 403) {
                  setPresentacionesUsuario([]);
                  setPresentacionesUsuarioTotal(0);
                  setMensajePresentacionesUsuario({
                    tipo: 'error',
                    texto: 'El backend bloquea el acceso a las presentaciones para rol soporte. Solicita al admin que habilite el endpoint dedicado.',
                  });
                  return;
                }
                throw errorAdminFallback;
              }
            } else {
              throw errorSoporte;
            }
          }
        }

        const listaBase = Array.isArray(payload.presentaciones)
          ? payload.presentaciones
          : Array.isArray(payload.data)
            ? payload.data
            : Array.isArray(payload.lista)
              ? payload.lista
              : extraerListaReportes(payload);
        const lista = Array.isArray(listaBase) ? listaBase : [];

        setPresentacionesUsuario(lista);
        setPresentacionesUsuarioTotal(Number.isFinite(payload.total) ? payload.total : lista.length);
      } catch (error) {
        console.error('Error al obtener presentaciones para soporte', error);
        const mensaje =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'No fue posible cargar las presentaciones del usuario.';
        setPresentacionesUsuario([]);
        setPresentacionesUsuarioTotal(0);
        setMensajePresentacionesUsuario({ tipo: 'error', texto: mensaje });
      } finally {
        setCargandoPresentacionesUsuario(false);
      }
    },
    [usuario?.rol],
  );

  const fetchUsuarioDetalleSoporte = useCallback(
    async (email, { skipPresentaciones = false } = {}) => {
      if (!email) return;
      setCargandoUsuarioDetalle(true);
      try {
        const data = await obtenerUsuarioSoportePorEmail(email);
        const payload = data || {};
        if (payload.ok === false) {
          throw new Error(payload.message || 'No se pudo obtener la información del usuario.');
        }

        const detalle =
          payload.data?.usuario ??
          payload.data ??
          payload.usuario ??
          payload.detalle ??
          payload;

        setUsuarioDetalle(detalle);
        const id = obtenerUsuarioId(detalle);
        if (id) {
          setUsuarioSeleccionadoId(id);
        }

        if (skipPresentaciones) {
          return;
        }

        const candidatas = [
          detalle?.presentaciones,
          detalle?.presentacionesRecientes,
          detalle?.historialPresentaciones,
          detalle?.historial_presentaciones,
          detalle?.metricas?.presentacionesDetalle,
        ];

        let lista = [];
        for (const candidata of candidatas) {
          if (Array.isArray(candidata) && candidata.length) {
            lista = candidata;
            break;
          }
        }

        if (!lista.length) {
          const posibleLista = extraerListaReportes(detalle);
          if (Array.isArray(posibleLista) && posibleLista.some(esObjetoPresentacion)) {
            lista = posibleLista;
          }
        }

        if (lista.length) {
          setPresentacionesUsuario(lista);
          setPresentacionesUsuarioTotal(lista.length);
          setMensajePresentacionesUsuario(null);
        } else {
          await fetchPresentacionesUsuarioSoporte({ usuarioId: id, email });
        }
      } catch (error) {
        console.error('Error al cargar detalle de usuario para soporte', error);
        const mensaje =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'No fue posible obtener la información del usuario seleccionado.';
        setUsuarioDetalle(null);
        setUsuarioSeleccionadoId(null);
        setPresentacionesUsuario([]);
        setPresentacionesUsuarioTotal(0);
        setMensajePresentacionesUsuario({ tipo: 'error', texto: mensaje });
      } finally {
        setCargandoUsuarioDetalle(false);
      }
    },
    [fetchPresentacionesUsuarioSoporte],
  );

  const limpiarSeleccionUsuario = useCallback(() => {
    setUsuarioSeleccionadoEmail(null);
    setUsuarioSeleccionadoId(null);
    setUsuarioDetalle(null);
    setPresentacionesUsuario([]);
    setPresentacionesUsuarioTotal(0);
    setMensajePresentacionesUsuario(null);
    setMensajeUsuarios(null);
  }, []);

  const seleccionarUsuario = useCallback(
    (usuarioSeleccionado) => {
      const email = obtenerUsuarioEmail(usuarioSeleccionado);
      if (!email) {
        console.warn('No se encontró un correo válido para el usuario seleccionado.');
        setMensajePresentacionesUsuario({
          tipo: 'error',
          texto: 'No se pudo identificar el correo del usuario seleccionado.',
        });
        return;
      }
      const id = obtenerUsuarioId(usuarioSeleccionado);
      const emailNormalizado = email.toString().toLowerCase();
      const emailActualNormalizado = usuarioSeleccionadoEmail
        ? usuarioSeleccionadoEmail.toString().toLowerCase()
        : '';

      if (emailNormalizado === emailActualNormalizado) {
        setMensajePresentacionesUsuario(null);
        setMensajeUsuarios(null);
        if (id) {
          setUsuarioSeleccionadoId(id);
        }
        fetchUsuarioDetalleSoporte(email);
        return;
      }

      setMensajePresentacionesUsuario(null);
      setMensajeUsuarios(null);
      setUsuarioDetalle(null);
      setPresentacionesUsuario([]);
      setPresentacionesUsuarioTotal(0);
      setUsuarioSeleccionadoEmail(email);
      if (id) {
        setUsuarioSeleccionadoId(id);
      } else {
        setUsuarioSeleccionadoId(null);
      }
    },
    [usuarioSeleccionadoEmail, fetchUsuarioDetalleSoporte],
  );

  useEffect(() => {
    if (!usuarioSeleccionadoEmail) {
      return;
    }

    fetchUsuarioDetalleSoporte(usuarioSeleccionadoEmail);
  }, [usuarioSeleccionadoEmail, fetchUsuarioDetalleSoporte]);

  useEffect(() => {
    if (!mensajePresentacionesUsuario) {
      return undefined;
    }

    const timeout = setTimeout(() => setMensajePresentacionesUsuario(null), 4000);
    return () => clearTimeout(timeout);
  }, [mensajePresentacionesUsuario]);

  useEffect(() => {
    if (!mensajeUsuarios) {
      return undefined;
    }

    const timeout = setTimeout(() => setMensajeUsuarios(null), 4000);
    return () => clearTimeout(timeout);
  }, [mensajeUsuarios]);

  const actualizarEstadoUsuarioSoporte = useCallback(
    async (usuarioObjetivo, nuevoEstado) => {
      const id = obtenerUsuarioId(usuarioObjetivo);
      if (!id) {
        setMensajeUsuarios({
          tipo: 'error',
          texto: 'No se pudo identificar el usuario para actualizar su estado.',
        });
        return;
      }

      const rolObjetivo = obtenerRolUsuarioNormalizado(usuarioObjetivo);
      if (rolObjetivo !== 'usuario') {
        setMensajeUsuarios({
          tipo: 'error',
          texto: 'Solo puedes ajustar el estado de cuentas con rol "usuario".',
        });
        return;
      }

      const estadoNormalizado = (nuevoEstado || '').toString().toLowerCase();
      const estadosPermitidos = ['activo', 'inactivo', 'suspendido'];
      if (!estadosPermitidos.includes(estadoNormalizado)) {
        setMensajeUsuarios({ tipo: 'error', texto: 'Selecciona un estado válido.' });
        return;
      }

      setActualizandoEstadoUsuarioId(id);
      setMensajeUsuarios(null);

      try {
        await actualizarEstadoUsuarioAdmin(id, estadoNormalizado);

        setUsuarios((prevUsuarios) =>
          prevUsuarios.map((usuarioItem) =>
            obtenerUsuarioId(usuarioItem) === id
              ? { ...usuarioItem, estado: estadoNormalizado }
              : usuarioItem,
          ),
        );

        setUsuarioDetalle((prevDetalle) =>
          prevDetalle && obtenerUsuarioId(prevDetalle) === id
            ? { ...prevDetalle, estado: estadoNormalizado }
            : prevDetalle,
        );

        setMensajeUsuarios({
          tipo: 'success',
          texto: `Estado actualizado a ${toLabel(estadoNormalizado)}.`,
        });
      } catch (error) {
        console.error('Error al actualizar estado del usuario como soporte', error);
        const mensajeError =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'No fue posible actualizar el estado del usuario.';
        setMensajeUsuarios({ tipo: 'error', texto: mensajeError });
      } finally {
        setActualizandoEstadoUsuarioId(null);
      }
    },
    [],
  );

  const eliminarPresentacionSoporte = useCallback(
    async (presentacion) => {
      if (!usuarioDetalle) {
        setMensajePresentacionesUsuario({
          tipo: 'error',
          texto: 'Selecciona un usuario antes de administrar sus presentaciones.',
        });
        return;
      }

      if (!esUsuarioFinal(usuarioDetalle)) {
        setMensajePresentacionesUsuario({
          tipo: 'error',
          texto: 'Solo se pueden eliminar presentaciones de usuarios con rol "usuario".',
        });
        return;
      }

      const presentacionId = obtenerIdPresentacion(presentacion);
      if (!presentacionId) {
        setMensajePresentacionesUsuario({
          tipo: 'error',
          texto: 'No se pudo identificar la presentación seleccionada.',
        });
        return;
      }

      const confirmado = window.confirm('¿Eliminar esta presentación? Esta acción no se puede deshacer.');
      if (!confirmado) return;

      setMensajePresentacionesUsuario(null);
      setEliminandoPresentacionId(presentacionId);

      try {
        await eliminarPresentacion(presentacionId);
        await fetchPresentacionesUsuarioSoporte({
          usuarioId: obtenerUsuarioId(usuarioDetalle),
          email: usuarioSeleccionadoEmail,
        });
        setMensajePresentacionesUsuario({ tipo: 'success', texto: 'Presentación eliminada correctamente.' });
        await fetchUsuarioDetalleSoporte(usuarioSeleccionadoEmail, { skipPresentaciones: true });
      } catch (error) {
        console.error('Error al eliminar presentación como soporte', error);
        const mensaje =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'No fue posible eliminar la presentación seleccionada.';
        setMensajePresentacionesUsuario({ tipo: 'error', texto: mensaje });
      } finally {
        setEliminandoPresentacionId(null);
      }
    },
    [
      usuarioDetalle,
      usuarioSeleccionadoEmail,
      fetchPresentacionesUsuarioSoporte,
      fetchUsuarioDetalleSoporte,
    ],
  );

  const fetchMantenimiento = useCallback(async () => {
    setCargandoMantenimiento(true);
    try {
      const data = await obtenerEstadoMantenimientoSoporte();
      setMantenimiento(data?.data || data || null);
    } catch (err) {
      console.error('Error al cargar estado de mantenimiento:', err);
    } finally {
      setCargandoMantenimiento(false);
    }
  }, []);

  const fetchHistorialMantenimientos = useCallback(async () => {
    setCargandoHistorial(true);
    try {
  const data = await obtenerHistorialMantenimientoSoporte({ limit: 20 });
      const payload = data || {};
      if (payload.ok === false) {
        throw new Error(payload.message || 'Respuesta inválida del backend');
      }
      const lista = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.historial)
        ? payload.historial
        : Array.isArray(payload)
        ? payload
        : [];
  setHistorialMantenimientos(lista);
    } catch (err) {
      console.error('Error al cargar historial de mantenimientos:', err);
      setHistorialMantenimientos([]);
    } finally {
      setCargandoHistorial(false);
    }
  }, []);

  const fetchHistorialReportes = useCallback(async () => {
    setCargandoHistorial(true);
    try {
  const data = await obtenerHistorialReportesSoporte({ limit: 50 });
      const payload = data || {};
      if (payload.ok === false) {
        throw new Error(payload.message || 'Respuesta inválida del backend');
      }
      const lista = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.historial)
        ? payload.historial
        : Array.isArray(payload)
        ? payload
        : [];
  setHistorialReportes(lista);
    } catch (err) {
      console.error('Error al cargar historial de reportes:', err);
      setHistorialReportes([]);
    } finally {
      setCargandoHistorial(false);
    }
  }, []);

  const fetchNotificaciones = useCallback(async () => {
    try {
  const data = await obtenerNotificacionesSoporte({ limit: 20 });
      const payload = data || {};
      if (payload.ok === false) {
        throw new Error(payload.message || 'Respuesta inválida del backend');
      }
      const lista = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.notificaciones)
        ? payload.notificaciones
        : Array.isArray(payload)
        ? payload
        : [];
  setNotificaciones(lista);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
      setNotificaciones([]);
    }
  }, []);

  const actualizarEstadoMutation = useMutation({
    mutationFn: async ({ id, estado }) => {
      const respuesta = await actualizarEstadoReporte(id, estado);
      if (respuesta?.ok === false) {
        const error = new Error(respuesta?.message || 'No se pudo actualizar el estado del reporte.');
        error.response = { data: respuesta };
        throw error;
      }
      return respuesta;
    },
    onMutate: ({ displayId }) => {
      setActualizandoId(displayId);
      setMensaje(null);
    },
    onSuccess: (respuesta) => {
      const texto =
        respuesta?.message ||
        'Estado actualizado correctamente.';
      setMensaje({ tipo: 'success', texto });
      queryClient.invalidateQueries({ queryKey: ['soporte', 'reportes'] });
      queryClient.invalidateQueries({ queryKey: ['soporte', 'metricas'] });
    },
    onError: (error) => {
      const mensajeError =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'No fue posible actualizar el estado. Intenta nuevamente.';
      setMensaje({ tipo: 'error', texto: mensajeError });
    },
    onSettled: () => {
      setActualizandoId(null);
    },
  });

  const eliminarReporteMutation = useMutation({
    mutationFn: async ({ id }) => {
      const respuesta = await eliminarReporteSoporte(id);
      if (respuesta?.ok === false) {
        const error = new Error(respuesta?.message || 'No se pudo eliminar el reporte.');
        error.response = { data: respuesta };
        throw error;
      }
      return respuesta;
    },
    onMutate: ({ displayId }) => {
      setEliminandoId(displayId);
      setMensaje(null);
    },
    onSuccess: (respuesta, variables) => {
      const texto =
        respuesta?.message ||
        'Reporte eliminado correctamente.';
      setMensaje({ tipo: 'success', texto });
      setReportes((prev) =>
        prev.filter((item, idx) => {
          const idAccion = obtenerIdReporteParaAccion(item);
          if (idAccion !== null && idAccion !== undefined) {
            return idAccion !== variables.id;
          }
          return obtenerIdReporte(item, idx) !== variables.displayId;
        }),
      );
      queryClient.invalidateQueries({ queryKey: ['soporte', 'reportes'] });
      queryClient.invalidateQueries({ queryKey: ['soporte', 'metricas'] });
    },
    onError: (error) => {
      const mensajeError =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'No se pudo eliminar el reporte.';
      const esEliminado = mensajeError.toLowerCase().includes('eliminado');
      setMensaje({
        tipo: esEliminado ? 'info' : 'error',
        texto: esEliminado
          ? 'Este reporte ya había sido eliminado anteriormente.'
          : mensajeError,
      });
    },
    onSettled: () => {
      setEliminandoId(null);
    },
  });

  const crearComentarioMutation = useMutation({
    mutationFn: async ({ reporteId, payload }) => {
      const respuesta = await crearComentarioReporteSoporte(reporteId, payload);
      if (respuesta?.ok === false) {
        const error = new Error(respuesta?.message || 'No se pudo agregar el comentario.');
        error.response = { data: respuesta };
        throw error;
      }
      return respuesta;
    },
    onMutate: () => {
      setComentarioError('');
      setComentariosAviso(null);
    },
    onSuccess: (respuesta) => {
      const nuevoComentario = respuesta?.data ?? respuesta?.comentario ?? respuesta;
      const normalizado = normalizarComentario(nuevoComentario, (comentarios?.length ?? 0) + 1);
      queryClient.setQueryData(
        ['soporte', 'reportes', 'comentarios', reporteComentarios?.id],
        (prev = []) => [...prev, normalizado],
      );
      setComentarioMensaje('');
      setComentariosAviso({
        tipo: 'success',
        texto: respuesta?.message || 'Comentario agregado correctamente.',
      });
    },
    onError: (error) => {
      const mensajeError =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'No se pudo agregar el comentario.';
      setComentarioError(mensajeError);
    },
  });

  const creandoComentario = crearComentarioMutation.isPending;

  // ===========================
  // ACCIONES
  // ===========================

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/';
  };

  const cambiarEstadoReporte = (reporte, nuevoEstado, fallbackIndex = 0) => {
    if (!nuevoEstado) return;

    const accionId = obtenerIdReporteParaAccion(reporte);
    const displayId = obtenerIdReporte(reporte, fallbackIndex);

    if (!accionId) {
      setMensaje({ tipo: 'error', texto: 'No se pudo determinar el identificador del reporte.' });
      return;
    }

    actualizarEstadoMutation.mutate({ id: accionId, estado: nuevoEstado, displayId });
  };

  const exportarReportesCSV = async () => {
    try {
      const params = {};
      if (estadoFiltro !== 'todos') params.estado = estadoFiltro;
      if (categoriaFiltro !== 'todas') params.categoria = categoriaFiltro;

      const respuesta = await exportarReportesSoporte(params);

      let blobGenerado = null;
      let nombreArchivo = `reportes_soporte_${new Date().toISOString().split('T')[0]}.csv`;

      if (respuesta instanceof Blob) {
        blobGenerado = respuesta;
      } else {
        const payload = respuesta || {};

        if (payload.ok === false) {
          throw new Error(payload.message || 'Respuesta inválida del backend.');
        }

        const dataExport = payload.data ?? payload;
        const base64Contenido = dataExport.base64 || dataExport.archivo || dataExport.contenidoBase64;

        if (!base64Contenido) {
          throw new Error('La respuesta del backend no incluye datos para exportar.');
        }

        const mimeType = dataExport.mimeType || 'text/csv';
        nombreArchivo = dataExport.filename || nombreArchivo;

        try {
          const bytes = Uint8Array.from(atob(base64Contenido), (char) => char.charCodeAt(0));
          blobGenerado = new Blob([bytes], { type: mimeType });
        } catch (decodeError) {
          console.error('Error al decodificar el contenido base64:', decodeError);
          throw new Error('No se pudo decodificar el archivo exportado.');
        }
      }

      if (!blobGenerado) {
        throw new Error('No se pudo generar el archivo para exportar.');
      }

      if (!nombreArchivo.toLowerCase().endsWith('.csv')) {
        nombreArchivo = `${nombreArchivo}.csv`;
      }

      const url = window.URL.createObjectURL(blobGenerado);
      const enlaceDescarga = document.createElement('a');
      enlaceDescarga.href = url;
      enlaceDescarga.download = nombreArchivo;
      document.body.appendChild(enlaceDescarga);
      enlaceDescarga.click();
      document.body.removeChild(enlaceDescarga);
      window.URL.revokeObjectURL(url);

      setMensaje({ tipo: 'success', texto: `Reportes exportados correctamente (${nombreArchivo}).` });
    } catch (err) {
      console.error('Error al exportar reportes:', err);
      const mensajeError =
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'No se pudo exportar el archivo CSV.';
      setMensaje({ tipo: 'error', texto: mensajeError });
    }
  };

  const abrirComentarios = (reporte, fallbackIndex = 0) => {
    if (!reporte) return;

    const accionId = obtenerIdReporteParaAccion(reporte);
    const displayId = obtenerIdReporte(reporte, fallbackIndex);

    if (!accionId) {
      setMensaje({ tipo: 'error', texto: 'No se pudo determinar el identificador del reporte para cargar los comentarios.' });
      return;
    }

    setReporteComentarios({
      id: accionId,
      displayId,
      categoria: obtenerCategoriaLabel(reporte),
      resumen:
        reporte?.titulo ||
        reporte?.resumen ||
        reporte?.detalle ||
        reporte?.descripcion ||
        'Reporte de soporte',
      estado: obtenerEstadoKey(reporte),
      resuelto_en: obtenerResueltoEn(reporte),
      creado_en: obtenerFechaReporte(reporte),
      contacto: {
        nombre: reporte?.nombreContacto ?? reporte?.nombre ?? 'Anónimo',
        correo: reporte?.correoContacto ?? reporte?.correo ?? null,
      },
    });

    setComentarioMensaje('');
    setComentarioTipo('interno');
    setComentarioError('');
    setComentariosAviso(null);
  };

  const cerrarComentarios = () => {
    setReporteComentarios(null);
    setComentarioMensaje('');
    setComentarioTipo('interno');
    setComentarioError('');
    setComentariosAviso(null);
  };

  const eliminarReporte = (reporte, fallbackIndex = 0) => {
    if (!reporte) return;

    const accionId = obtenerIdReporteParaAccion(reporte);
    const displayId = obtenerIdReporte(reporte, fallbackIndex);

    if (!accionId) {
      setMensaje({ tipo: 'error', texto: 'No se pudo determinar el identificador del reporte.' });
      return;
    }

    const confirmado = window.confirm(
      '¿Deseas eliminar este reporte? Se ocultará del panel pero permanecerá registrado para auditoría.',
    );
    if (!confirmado) return;

    eliminarReporteMutation.mutate({ id: accionId, displayId });
  };

  const handleSubmitComentario = (event) => {
    event.preventDefault();

    if (!reporteComentarios?.id) {
      setComentarioError('Selecciona un reporte antes de agregar comentarios.');
      return;
    }

    const mensajeLimpio = comentarioMensaje.trim();
    if (!mensajeLimpio) {
      setComentarioError('Escribe un mensaje antes de enviar.');
      return;
    }

    crearComentarioMutation.mutate({
      reporteId: reporteComentarios.id,
      payload: { mensaje: mensajeLimpio, tipo: comentarioTipo },
    });
  };

  // ===========================
  // EFECTOS INICIALES
  // ===========================

  useEffect(() => {
    const usuarioRaw = localStorage.getItem('usuario');
    const usuarioData = usuarioRaw ? JSON.parse(usuarioRaw) : null;

    console.log('[Soporte] 🔐 Verificando usuario:', usuarioData);

    if (!usuarioData || !['admin', 'soporte'].includes(usuarioData.rol?.toLowerCase())) {
      console.log('[Soporte] ❌ Usuario no autorizado, redirigiendo...');
      navigate('/perfil');
      return;
    }
    
    console.log('[Soporte] ✅ Usuario autorizado, configurando estado...');
    setUsuario(usuarioData);
  }, [navigate]);

  useEffect(() => {
    if (usuario) {
      fetchNotificaciones();
    }
  }, [usuario, fetchNotificaciones]);

  useEffect(() => {
    if (!reporteComentarios?.id) return;
    refetchComentarios();
  }, [reporteComentarios?.id, refetchComentarios]);

  useEffect(() => {
    if (!usuario) return;

    if (seccionActiva === 'usuarios') {
      fetchUsuarios();
    } else if (seccionActiva === 'mantenimiento') {
      fetchMantenimiento();
      fetchHistorialMantenimientos();
    } else if (seccionActiva === 'historial') {
      fetchHistorialReportes();
    }
  }, [usuario, seccionActiva, fetchUsuarios, fetchMantenimiento, fetchHistorialMantenimientos, fetchHistorialReportes]);

  // Auto-ocultar mensajes
  useEffect(() => {
    if (!mensaje) return undefined;
    const timeout = setTimeout(() => setMensaje(null), 4000);
    return () => clearTimeout(timeout);
  }, [mensaje]);

  useEffect(() => {
    if (!comentariosAviso) return undefined;
    const timeout = setTimeout(() => setComentariosAviso(null), 3000);
    return () => clearTimeout(timeout);
  }, [comentariosAviso]);

  const toggleMantenimiento = async () => {
    if (activandoMantenimiento) return;

    const nuevoEstado = !mantenimiento?.activo;
    
    if (nuevoEstado) {
      // Si va a activar, mostrar modal
      setMensajeMantenimiento('Sistema en mantenimiento programado.');
      setMostrarModalMantenimiento(true);
    } else {
      // Si va a desactivar, hacerlo directamente
      setActivandoMantenimiento(true);
      try {
        await actualizarEstadoMantenimientoSoporte({ activo: false, mensaje: '' });
        await fetchMantenimiento();
        await fetchHistorialMantenimientos();
        setMensaje({
          tipo: 'success',
          texto: 'Modo mantenimiento desactivado.',
        });
      } catch (err) {
        console.error('Error al actualizar mantenimiento:', err);
        setMensaje({ tipo: 'error', texto: 'No se pudo actualizar el modo mantenimiento.' });
      } finally {
        setActivandoMantenimiento(false);
      }
    }
  };

  const confirmarMantenimiento = async () => {
    setActivandoMantenimiento(true);
    try {
      await actualizarEstadoMantenimientoSoporte({ 
        activo: true, 
        mensaje: mensajeMantenimiento || 'Sistema en mantenimiento programado.' 
      });
      await fetchMantenimiento();
      await fetchHistorialMantenimientos();
      setMensaje({
        tipo: 'success',
        texto: 'Modo mantenimiento activado.',
      });
      setMostrarModalMantenimiento(false);
      setMensajeMantenimiento('');
    } catch (err) {
      console.error('Error al actualizar mantenimiento:', err);
      setMensaje({ tipo: 'error', texto: 'No se pudo actualizar el modo mantenimiento.' });
    } finally {
      setActivandoMantenimiento(false);
    }
  };

  const cancelarMantenimiento = () => {
    setMostrarModalMantenimiento(false);
    setMensajeMantenimiento('');
  };

  const marcarNotificacionLeida = async (id) => {
    try {
      await marcarNotificacionSoporteLeida(id);
      await fetchNotificaciones();
    } catch (err) {
      console.error('Error al marcar notificación:', err);
    }
  };

  // ===========================
  // FILTROS Y ESTADÍSTICAS
  // ===========================

  const reportesFiltrados = useMemo(() => {
    // Validación defensiva: asegurar que reportes sea un array
    const reportesArray = Array.isArray(reportes) ? reportes : [];

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[Soporte] reportes es array:', Array.isArray(reportes));
      console.debug('[Soporte] reportes.length antes de filtrar:', reportesArray.length);
      console.debug('[Soporte] Filtros activos:', { estadoFiltro, categoriaFiltro, busquedaReportes });
    }

    const busquedaNormalizada = busquedaReportes.trim().toLowerCase();
    const filtrados = reportesArray.filter((reporte) => {
      const estadoActual = obtenerEstadoKey(reporte);
      const categoriaActual = obtenerCategoriaKey(reporte);

      if (estadoFiltro !== 'todos' && estadoActual !== estadoFiltro) return false;
      if (categoriaFiltro !== 'todas' && categoriaActual !== categoriaFiltro) return false;

      if (!busquedaNormalizada) return true;

      const campos = [
        reporte?.titulo,
        reporte?.detalle,
        reporte?.resumen,
        reporte?.descripcion,
        reporte?.mensaje,
        reporte?.nombreContacto,
        reporte?.correoContacto,
        reporte?.email,
        reporte?.categoria,
        obtenerIdReporte(reporte),
      ];

      return campos.some((campo) => campo && campo.toString().toLowerCase().includes(busquedaNormalizada));
    });

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[Soporte] reportesFiltrados.length:', filtrados.length);
    }

    return filtrados;
  }, [busquedaReportes, categoriaFiltro, estadoFiltro, reportes]);

  const notificacionesNoLeidas = useMemo(
    () => notificaciones.filter((n) => !n.leido).length,
    [notificaciones],
  );

  // ===========================
  // MENÚ LATERAL
  // ===========================

  const menuItems = [
    {
      id: 'reportes',
      label: 'Reportes',
      icon: DocumentTextIcon,
      badge: metricas?.pendientes || null,
      badgeClass: 'bg-red-100 text-red-700',
    },
    { id: 'usuarios', label: 'Usuarios', icon: UserGroupIcon },
    { id: 'mantenimiento', label: 'Mantenimiento', icon: WrenchScrewdriverIcon },
    { id: 'historial', label: 'Historial', icon: ClockIcon },
  ];

  // ===========================
  // RENDERIZADO DE SECCIONES
  // ===========================

  const renderReportes = () => (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total', value: metricas?.total || 0, icon: DocumentTextIcon, gradient: 'from-teal-500 to-sky-500', bg: 'from-teal-50 to-sky-50' },
          { label: 'Pendientes', value: metricas?.pendientes || 0, icon: ClockIcon, gradient: 'from-amber-500 to-orange-500', bg: 'from-amber-50 to-orange-50' },
          { label: 'En proceso', value: metricas?.en_proceso || 0, icon: ExclamationTriangleIcon, gradient: 'from-sky-500 to-blue-500', bg: 'from-sky-50 to-blue-50' },
          { label: 'Resueltos', value: metricas?.resueltos || 0, icon: CheckCircleIcon, gradient: 'from-emerald-500 to-teal-500', bg: 'from-emerald-50 to-teal-50' }
        ].map((metric, index) => (
          <div key={metric.label} className="group relative animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
            <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0 group-hover:opacity-10 rounded-2xl blur-xl transition-all duration-500`} />
            <div className={`relative bg-gradient-to-br ${metric.bg} backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-20 rounded-full blur-2xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">{metric.label}</p>
                  <p className={`text-4xl font-bold bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent`}>{metric.value}</p>
                </div>
                <div className={`p-4 bg-gradient-to-br ${metric.gradient} rounded-xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-12`}>
                  <metric.icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="grid gap-4 md:grid-cols-[2fr,1fr,1fr] mb-6">
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-sky-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-teal-100/50 p-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500" />
              <input
                type="text"
                placeholder="Buscar por categoría, contacto o detalle..."
                value={busquedaReportes}
                onChange={(e) => setBusquedaReportes(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-teal-200/50 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white/50 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-teal-100/50 p-4 flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-600 flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-teal-500" />
            Estado
          </span>
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="w-full border-2 border-teal-200/50 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white/50 backdrop-blur-sm font-semibold"
          >
            <option value="todos">Todos</option>
            {estadosDisponibles.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-teal-100/50 p-4 flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-600 flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4 text-teal-500" />
            Categoría
          </span>
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="w-full border-2 border-teal-200/50 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white/50 backdrop-blur-sm font-semibold"
          >
            <option value="todas">Todas</option>
            {categoriasDisponibles.map((categoria) => (
              <option key={categoria.value} value={categoria.value}>
                {categoria.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleRefrescarReportes}
          disabled={consultandoReportes}
          className="group inline-flex items-center gap-3 bg-gradient-to-r from-teal-500 to-sky-500 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-60 transform hover:scale-105 font-semibold"
        >
          <ArrowPathIcon className={`w-5 h-5 ${consultandoReportes ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          {consultandoReportes ? 'Actualizando…' : 'Actualizar'}
        </button>

        <button
          onClick={exportarReportesCSV}
          className="group inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-semibold"
        >
          <ArrowDownTrayIcon className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
          Exportar CSV
        </button>
      </div>

      {reportesOcultos > 0 && !errorReportes && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          Se ocultaron {reportesOcultos} reportes marcados como eliminados. Puedes consultarlos desde las herramientas de auditoría si necesitas revisarlos.
        </div>
      )}

      {/* Tabla de reportes */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-teal-100/50 overflow-hidden">
        {errorReportes ? (
          <div className="py-12 px-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h3 className="font-bold text-red-900 mb-2">❌ Error al cargar reportes</h3>
                    <p className="text-red-700 text-sm mb-4">{errorReportes}</p>
                    <button
                      onClick={handleRefrescarReportes}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition transform hover:scale-105 shadow-lg"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                      Reintentar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : cargandoReportes ? (
          <div className="py-16 text-center">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-sky-500 rounded-full animate-spin animation-delay-150" />
              </div>
              <p className="text-gray-600 font-semibold">Cargando reportes...</p>
            </div>
          </div>
        ) : !reportesFiltrados || reportesFiltrados.length === 0 ? (
          <div className="py-12 px-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 text-center shadow-lg">
                <DocumentTextIcon className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h3 className="font-bold text-amber-900 mb-2 text-lg">📋 No hay reportes disponibles</h3>
                <p className="text-amber-700 text-sm">
                  {!reportes || reportes.length === 0 
                    ? 'No se encontraron reportes en la base de datos.'
                    : 'No hay reportes que coincidan con los filtros aplicados.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-teal-100/50">
              <thead className="bg-gradient-to-r from-teal-50 to-sky-50">
                <tr>
                  {['Reporte', 'Detalle', 'Estado', 'Contacto', 'Atendido por', 'Creado', 'Acciones'].map((header) => (
                    <th
                      key={header}
                      className={`px-6 py-4 text-xs font-bold uppercase text-gray-700 tracking-wider ${
                        header === 'Acciones' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
                </thead>
              <tbody className="divide-y divide-teal-50/50 bg-white/50">
                {Array.isArray(reportesFiltrados) && reportesFiltrados
                  .slice(paginaReportes * ITEMS_POR_PAGINA, (paginaReportes + 1) * ITEMS_POR_PAGINA)
                  .map((reporte, index) => {
                  const id = obtenerIdReporte(reporte, index);
                  const categoriaLabel = obtenerCategoriaLabel(reporte);
                  const categoriaKey = obtenerCategoriaKey(reporte);
                  const estadoActualKey = obtenerEstadoKey(reporte);
                  const estadoDisplay =
                    reporte?.estado ?? reporte?.status ?? (estadoActualKey ? toLabel(estadoActualKey) : 'Sin estado');
                  const estadoBadgeClass = getEstadoBadgeClass(estadoActualKey);
                  const estadoIcon = getEstadoIcon(estadoActualKey);
                  const fechaReporte = obtenerFechaReporte(reporte);
                  const fechaFormateada = formatearFecha(fechaReporte);
                  const resueltoEn = obtenerResueltoEn(reporte);
                  const resueltoFormateado = resueltoEn ? formatearFecha(resueltoEn) : null;
                  const eliminadoEn = reporte?.eliminado_en ?? reporte?.eliminadoEn ?? null;
                  const contactoNombre = reporte?.nombreContacto ?? reporte?.nombre ?? 'Sin nombre';
                  const contactoCorreo = reporte?.correoContacto ?? reporte?.correo ?? 'Sin correo';
                  const resumenVisible = reporte?.resumen || reporte?.detalle || reporte?.titulo || 'Sin resumen';
                  const mensajeVisible = reporte?.mensaje || reporte?.descripcion || reporte?.detalle || 'Sin descripción';
                  const atendidoPor = reporte?.atendido_por || reporte?.atendidoPor || 'Sin asignar';
                  const actualizando = actualizandoId === id;
                  const eliminando = eliminandoId === id;
                  const comentariosActivos = reporteComentarios?.displayId === id;
                  const comentarioEnProgreso = comentariosActivos && (cargandoComentarios || consultandoComentarios);

                  return (
                    <tr key={id} className="hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-sky-50/50 transition-all duration-200 align-top">
                      <td className="px-6 py-5 text-sm text-gray-900">
                        <div className="font-bold text-teal-700 mb-1">{categoriaLabel}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 bg-teal-400 rounded-full" />
                          ID: {id}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-700">
                        <div className="text-gray-900 font-semibold mb-1">{acortar(resumenVisible, 80)}</div>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line text-xs">
                          {acortar(mensajeVisible, 160)}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-700">
                        <select
                          value={estadoActualKey}
                          onChange={(e) => cambiarEstadoReporte(reporte, e.target.value, index)}
                          disabled={actualizando}
                          className="border-2 border-teal-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-60 font-semibold text-sm transition-all"
                        >
                          {estadosDisponibles.map((estado) => (
                            <option key={estado.value} value={estado.value}>
                              {estado.label}
                            </option>
                          ))}
                        </select>
                        {actualizando && <p className="text-xs text-teal-600 mt-1 font-semibold animate-pulse">Actualizando...</p>}
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${estadoBadgeClass}`}>
                            {estadoIcon}
                            {estadoDisplay}
                          </span>
                        </div>
                        {resueltoFormateado && (
                          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
                            <CheckCircleIcon className="w-4 h-4" />
                            Resuelto {resueltoFormateado}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-700">
                        <div className="font-bold text-gray-900 mb-1">{contactoNombre}</div>
                        <div className="text-xs text-teal-600 break-all font-medium">{contactoCorreo}</div>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-600">
                        <div className="font-semibold">{atendidoPor}</div>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-500 font-medium">{fechaFormateada}</td>
                      <td className="px-6 py-5 text-sm text-right">
                        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:justify-end">
                          <button
                            type="button"
                            onClick={() => abrirComentarios(reporte, index)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-teal-300 px-4 py-2 text-xs font-bold text-teal-700 transition hover:bg-gradient-to-r hover:from-teal-50 hover:to-sky-50 transform hover:scale-105 shadow-sm"
                            disabled={comentarioEnProgreso}
                          >
                            <ChatBubbleOvalLeftEllipsisIcon className={`w-4 h-4 ${comentarioEnProgreso ? 'animate-pulse' : ''}`} />
                            {comentarioEnProgreso ? 'Cargando…' : 'Comentarios'}
                          </button>
                          <button
                            type="button"
                            onClick={() => eliminarReporte(reporte, index)}
                            disabled={eliminando}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 transform hover:scale-105"
                          >
                            {eliminando ? 'Eliminando…' : 'Eliminar'}
                          </button>
                        </div>
                        {eliminadoEn && (
                          <p className="mt-2 text-[11px] text-amber-600 font-semibold">
                            Eliminado {formatearFecha(eliminadoEn)}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación de Reportes */}
      {reportesFiltrados && reportesFiltrados.length > ITEMS_POR_PAGINA && (
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg border border-teal-100/50">
          <button
            onClick={() => setPaginaReportes(Math.max(0, paginaReportes - 1))}
            disabled={paginaReportes === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-teal-500 to-sky-500 text-white shadow-lg hover:shadow-xl"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            Anterior
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-700">
              Página <span className="text-teal-600 text-lg">{paginaReportes + 1}</span> de{' '}
              <span className="text-sky-600 text-lg">{Math.ceil(reportesFiltrados.length / ITEMS_POR_PAGINA)}</span>
            </span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            <span className="text-xs text-gray-600 bg-teal-50 px-3 py-1.5 rounded-full font-semibold">
              {reportesFiltrados.length} reportes
            </span>
          </div>

          <button
            onClick={() => setPaginaReportes(Math.min(Math.ceil(reportesFiltrados.length / ITEMS_POR_PAGINA) - 1, paginaReportes + 1))}
            disabled={paginaReportes >= Math.ceil(reportesFiltrados.length / ITEMS_POR_PAGINA) - 1}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-sky-500 to-purple-500 text-white shadow-lg hover:shadow-xl"
          >
            Siguiente
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="mt-6 text-center text-sm font-semibold">
        <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-teal-100/50">
          <span className="text-gray-700">
            Mostrando <span className="text-teal-600 font-bold">{reportesFiltrados?.length || 0}</span> de <span className="text-sky-600 font-bold">{reportes?.length || 0}</span> reportes
          </span>
          {reportesOcultos > 0 && (
            <>
              <span className="w-1 h-1 bg-gray-400 rounded-full" />
              <span className="text-amber-600">{reportesOcultos} ocultos</span>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderUsuarios = () => {
    const emailSeleccionadoNormalizado = usuarioSeleccionadoEmail?.toLowerCase() ?? '';
    const rolSeleccionado = usuarioDetalle ? obtenerRolUsuarioNormalizado(usuarioDetalle) : '';
    const estadoSeleccionado = usuarioDetalle ? obtenerEstadoUsuarioNormalizado(usuarioDetalle) : '';
    const fechaRegistroDetalle = usuarioDetalle ? obtenerFechaRegistroUsuario(usuarioDetalle) : null;
    const ultimaActividadDetalle = usuarioDetalle ? obtenerUltimaActividadUsuario(usuarioDetalle) : null;
    const totalPresentacionesDetalle = usuarioDetalle ? obtenerTotalPresentacionesUsuario(usuarioDetalle) : null;
    const totalPresentacionesVisibles =
      totalPresentacionesDetalle ?? presentacionesUsuarioTotal;
    const puedeGestionarPresentaciones = usuarioDetalle ? esUsuarioFinal(usuarioDetalle) : false;
    const puedeEditarEstadoDetalle = rolSeleccionado === 'usuario';

    return (
      <div className="space-y-6">
        {mensajeUsuarios && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              mensajeUsuarios.tipo === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            {mensajeUsuarios.texto}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-[1.4fr,1fr,1fr]">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={busquedaUsuarios}
                onChange={(e) => setBusquedaUsuarios(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <select
              value={rolFiltroUsuarios}
              onChange={(e) => setRolFiltroUsuarios(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos los roles</option>
              <option value="admin">Admin</option>
              <option value="soporte">Soporte</option>
              <option value="usuario">Usuario</option>
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <select
              value={estadoFiltroUsuarios}
              onChange={(e) => setEstadoFiltroUsuarios(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchUsuarios}
          disabled={cargandoUsuarios}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition disabled:opacity-60"
        >
          <ArrowPathIcon className={`w-5 h-5 ${cargandoUsuarios ? 'animate-spin' : ''}`} />
          Actualizar
        </button>

        <div className="grid gap-6 lg:grid-cols-[2fr,1.05fr]">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {cargandoUsuarios ? (
              <div className="py-12 text-center text-gray-500">Cargando usuarios...</div>
            ) : usuarios.length === 0 ? (
              <div className="py-12 text-center text-gray-500">No se encontraron usuarios.</div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Usuario', 'Email', 'Rol', 'Estado', 'Registrado', 'Acciones'].map((header) => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {usuarios
                      .slice(paginaUsuarios * ITEMS_POR_PAGINA, (paginaUsuarios + 1) * ITEMS_POR_PAGINA)
                      .map((user, index) => {
                    const correoBase = obtenerUsuarioEmail(user) || user.email || '';
                    const correoNormalizado = correoBase ? correoBase.toString().toLowerCase() : '';
                    const esSeleccionado =
                      emailSeleccionadoNormalizado && correoNormalizado === emailSeleccionadoNormalizado;
                    const userId = obtenerUsuarioId(user);
                    const estadoUsuario = (user.estado || '').toString().toLowerCase() || 'activo';
                    const rolUsuario = obtenerRolUsuarioNormalizado(user);
                    const puedeGestionarEstado = rolUsuario === 'usuario';

                    return (
                      <tr
                        key={user.id || correoBase || index}
                        className={`transition-colors hover:bg-gray-50 ${esSeleccionado ? 'bg-blue-50/70' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={obtenerAvatarUrl(user?.foto, user?.nombre)}
                              alt={user?.nombre || 'Usuario'}
                              className="w-9 h-9 rounded-full object-cover border"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = obtenerAvatarUrl(null, user?.nombre);
                              }}
                            />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{user.nombre || 'Sin nombre'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-blue-600 break-all">{correoBase || 'Sin correo'}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 capitalize">{user.rol || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            {puedeGestionarEstado ? (
                              <select
                                value={estadoUsuario}
                                onChange={(event) => actualizarEstadoUsuarioSoporte(user, event.target.value)}
                                disabled={!userId || actualizandoEstadoUsuarioId === userId}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-auto"
                              >
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                                <option value="suspendido">Suspendido</option>
                              </select>
                            ) : (
                              <span className="text-xs font-semibold text-gray-600">
                                {toLabel(estadoUsuario || 'N/A')}
                              </span>
                            )}
                            <span
                              className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                                estadoUsuario === 'activo'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : estadoUsuario === 'inactivo'
                                    ? 'bg-gray-200 text-gray-700'
                                    : estadoUsuario === 'suspendido'
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {toLabel(estadoUsuario || 'N/A')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.fecha_registro ? formatearFecha(user.fecha_registro) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            type="button"
                            onClick={() => seleccionarUsuario(user)}
                            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                              esSeleccionado
                                ? 'border-blue-300 bg-blue-50 text-blue-700'
                                : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                            }`}
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Paginación de Usuarios */}
              {usuarios && usuarios.length > ITEMS_POR_PAGINA && (
                <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-teal-50 to-sky-50 px-6 py-4 rounded-xl border border-teal-100/50">
                  <button
                    onClick={() => setPaginaUsuarios(Math.max(0, paginaUsuarios - 1))}
                    disabled={paginaUsuarios === 0}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-teal-500 to-sky-500 text-white shadow-lg hover:shadow-xl"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                    Anterior
                  </button>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-700">
                      Página <span className="text-teal-600 text-lg">{paginaUsuarios + 1}</span> de{' '}
                      <span className="text-sky-600 text-lg">{Math.ceil(usuarios.length / ITEMS_POR_PAGINA)}</span>
                    </span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    <span className="text-xs text-gray-600 bg-white px-3 py-1.5 rounded-full font-semibold">
                      {usuarios.length} usuarios
                    </span>
                  </div>

                  <button
                    onClick={() => setPaginaUsuarios(Math.min(Math.ceil(usuarios.length / ITEMS_POR_PAGINA) - 1, paginaUsuarios + 1))}
                    disabled={paginaUsuarios >= Math.ceil(usuarios.length / ITEMS_POR_PAGINA) - 1}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-sky-500 to-purple-500 text-white shadow-lg hover:shadow-xl"
                  >
                    Siguiente
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Detalle del usuario</h3>
                  <p className="text-sm text-gray-500">Consulta la información sin modificar permisos.</p>
                </div>
                {usuarioSeleccionadoEmail && (
                  <button
                    type="button"
                    onClick={limpiarSeleccionUsuario}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="mt-4">
                {!usuarioSeleccionadoEmail ? (
                  <p className="text-sm text-gray-500">Selecciona un usuario de la tabla para ver el detalle.</p>
                ) : cargandoUsuarioDetalle ? (
                  <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Cargando detalle…
                  </div>
                ) : !usuarioDetalle ? (
                  <p className="text-sm text-red-600">No se pudo cargar la información del usuario seleccionado.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={obtenerAvatarUrl(usuarioDetalle?.foto, usuarioDetalle?.nombre)}
                        alt={usuarioDetalle?.nombre || 'Usuario'}
                        className="w-12 h-12 rounded-full object-cover border"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = obtenerAvatarUrl(null, usuarioDetalle?.nombre);
                        }}
                      />
                      <div>
                        <p className="text-base font-semibold text-gray-900">{usuarioDetalle?.nombre || 'Sin nombre'}</p>
                        <p className="text-sm text-blue-600 break-all">{usuarioSeleccionadoEmail}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Rol</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{toLabel(rolSeleccionado || 'Sin rol')}</p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Estado</p>
                        {usuarioDetalle ? (
                          puedeEditarEstadoDetalle ? (
                            <select
                              value={estadoSeleccionado || 'activo'}
                              onChange={(event) => actualizarEstadoUsuarioSoporte(usuarioDetalle, event.target.value)}
                              disabled={actualizandoEstadoUsuarioId === obtenerUsuarioId(usuarioDetalle)}
                              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            >
                              <option value="activo">Activo</option>
                              <option value="inactivo">Inactivo</option>
                              <option value="suspendido">Suspendido</option>
                            </select>
                          ) : (
                            <p className="mt-1 text-sm font-semibold text-gray-900">{toLabel(estadoSeleccionado || 'Sin estado')}</p>
                          )
                        ) : (
                          <p className="mt-1 text-sm font-semibold text-gray-900">{toLabel(estadoSeleccionado || 'Sin estado')}</p>
                        )}
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Registrado</p>
                        <p className="mt-1 text-sm text-gray-900">{fechaRegistroDetalle ? formatearFecha(fechaRegistroDetalle) : 'Sin registro'}</p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Última actividad</p>
                        <p className="mt-1 text-sm text-gray-900">{ultimaActividadDetalle ? formatearFecha(ultimaActividadDetalle) : 'Sin actividad'}</p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Presentaciones registradas</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {totalPresentacionesVisibles !== null && totalPresentacionesVisibles !== undefined
                            ? formatearNumero(totalPresentacionesVisibles)
                            : 'Sin dato'}
                        </p>
                      </div>
                      {usuarioDetalle?.empresa && (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:col-span-2">
                          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Empresa</p>
                          <p className="mt-1 text-sm text-gray-900">{usuarioDetalle.empresa}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Presentaciones</h3>
                  <p className="text-sm text-gray-500">
                    {puedeGestionarPresentaciones
                      ? 'Puedes eliminar presentaciones si detectas contenido indebido.'
                      : 'Solo disponible para usuarios con rol "usuario".'}
                  </p>
                </div>
                {usuarioDetalle && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      puedeGestionarPresentaciones
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {toLabel(rolSeleccionado || 'Sin rol')}
                  </span>
                )}
              </div>

              {mensajePresentacionesUsuario && (
                <div
                  className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                    mensajePresentacionesUsuario.tipo === 'error'
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : mensajePresentacionesUsuario.tipo === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-blue-200 bg-blue-50 text-blue-700'
                  }`}
                >
                  {mensajePresentacionesUsuario.texto}
                </div>
              )}

              <div className="mt-4 space-y-4">
                {!usuarioSeleccionadoEmail ? (
                  <p className="text-sm text-gray-500">Selecciona un usuario para revisar sus presentaciones.</p>
                ) : cargandoPresentacionesUsuario ? (
                  <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Cargando presentaciones…
                  </div>
                ) : presentacionesUsuario.length === 0 ? (
                  <p className="text-sm text-gray-500">No se encontraron presentaciones registradas para este usuario.</p>
                ) : (
                  presentacionesUsuario.map((presentacion, index) => {
                    const idPresentacion = obtenerIdPresentacion(presentacion) || `presentacion-${index}`;
                    const tituloPresentacion =
                      presentacion?.titulo ?? presentacion?.nombre ?? `Presentación ${index + 1}`;
                    const fechaPresentacion = formatearFecha(obtenerFechaPresentacion(presentacion));
                    const eliminando = eliminandoPresentacionId === idPresentacion;

                    return (
                      <div
                        key={idPresentacion}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{tituloPresentacion}</p>
                            <p className="text-xs text-gray-500">{fechaPresentacion}</p>
                          </div>
                          {puedeGestionarPresentaciones && (
                            <button
                              type="button"
                              onClick={() => eliminarPresentacionSoporte(presentacion)}
                              disabled={eliminando}
                              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <TrashIcon className="w-4 h-4" />
                              {eliminando ? 'Eliminando…' : 'Eliminar'}
                            </button>
                          )}
                        </div>
                        {presentacion?.descripcion && (
                          <p className="mt-2 text-sm text-gray-600">{acortar(presentacion.descripcion, 160)}</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {usuarioSeleccionadoEmail &&
                !cargandoPresentacionesUsuario &&
                presentacionesUsuarioTotal > presentacionesUsuario.length && (
                  <p className="mt-4 text-xs text-gray-500">
                    Mostrando {presentacionesUsuario.length} de {presentacionesUsuarioTotal} presentaciones registradas.
                  </p>
                )}

              {usuarioSeleccionadoEmail && usuarioDetalle && !puedeGestionarPresentaciones && (
                <p className="mt-4 text-xs text-gray-500">
                  Las presentaciones de usuarios con rol {toLabel(rolSeleccionado || 'Sin rol')} se consultan en modo lectura.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">Total: {usuarios.length} usuarios</div>
      </div>
    );
  };

  const renderMantenimiento = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <WrenchScrewdriverIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Modo Mantenimiento</h3>
              <p className="text-sm text-gray-500">Controla el acceso al sistema durante mantenimiento</p>
            </div>
          </div>
          {cargandoMantenimiento && <span className="text-sm text-blue-600">Cargando...</span>}
        </div>

        <div className="bg-gray-50 rounded-lg p-5 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">Estado actual</p>
              <p
                className={`text-2xl font-bold ${
                  mantenimiento?.activo ? 'text-orange-600' : 'text-green-600'
                }`}
              >
                {mantenimiento?.activo ? 'ACTIVO' : 'DESACTIVADO'}
              </p>
              {mantenimiento?.mensaje && (
                <p className="text-sm text-gray-600 mt-2">Mensaje: {mantenimiento.mensaje}</p>
              )}
            </div>
            <button
              onClick={toggleMantenimiento}
              disabled={activandoMantenimiento}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold shadow-lg transition disabled:opacity-60 ${
                mantenimiento?.activo
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {activandoMantenimiento ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="w-5 h-5" />
                  {mantenimiento?.activo ? 'Desactivar' : 'Activar'}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p className="flex items-center gap-2">
            <strong>Activado por:</strong> {mantenimiento?.activado_por || 'N/A'}
          </p>
          <p className="flex items-center gap-2">
            <strong>Fecha de activación:</strong>{' '}
            {mantenimiento?.fecha_activacion ? formatearFecha(mantenimiento.fecha_activacion) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Historial de mantenimientos */}
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Historial de activaciones</h4>
        {cargandoHistorial ? (
          <div className="py-8 text-center text-gray-500">Cargando historial...</div>
        ) : historialMantenimientos.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No hay historial disponible.</div>
        ) : (
          <>
            <div className="space-y-3">
              {historialMantenimientos
                .slice(paginaMantenimiento * ITEMS_POR_PAGINA, (paginaMantenimiento + 1) * ITEMS_POR_PAGINA)
                .map((item, idx) => {
              const accionText = item?.activo === true ? 'Modo mantenimiento activado' : 'Modo mantenimiento desactivado';
              const resumen = item?.mensaje || item?.detalle || 'Sin mensaje configurado';
              const agente = item?.activado_por || item?.soporte_email || 'N/A';
              const fechaRaw = item?.fecha_activacion || item?.fecha || item?.created_at || item?.createdAt || null;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{accionText}</p>
                    <p className="text-xs text-gray-500">{resumen}</p>
                    <p className="text-xs text-gray-400">Por: {agente}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {fechaRaw ? formatearFecha(fechaRaw) : 'N/A'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginación de Mantenimiento */}
          {historialMantenimientos && historialMantenimientos.length > ITEMS_POR_PAGINA && (
            <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-teal-50 to-sky-50 px-6 py-4 rounded-xl border border-teal-100/50">
              <button
                onClick={() => setPaginaMantenimiento(Math.max(0, paginaMantenimiento - 1))}
                disabled={paginaMantenimiento === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-teal-500 to-sky-500 text-white shadow-lg hover:shadow-xl"
              >
                <ChevronLeftIcon className="w-5 h-5" />
                Anterior
              </button>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-700">
                  Página <span className="text-teal-600 text-lg">{paginaMantenimiento + 1}</span> de{' '}
                  <span className="text-sky-600 text-lg">{Math.ceil(historialMantenimientos.length / ITEMS_POR_PAGINA)}</span>
                </span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                <span className="text-xs text-gray-600 bg-white px-3 py-1.5 rounded-full font-semibold">
                  {historialMantenimientos.length} registros
                </span>
              </div>

              <button
                onClick={() => setPaginaMantenimiento(Math.min(Math.ceil(historialMantenimientos.length / ITEMS_POR_PAGINA) - 1, paginaMantenimiento + 1))}
                disabled={paginaMantenimiento >= Math.ceil(historialMantenimientos.length / ITEMS_POR_PAGINA) - 1}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-sky-500 to-purple-500 text-white shadow-lg hover:shadow-xl"
              >
                Siguiente
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );

  const renderHistorial = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Historial de acciones de soporte</h3>
        {cargandoHistorial ? (
          <div className="py-12 text-center text-gray-500">Cargando historial...</div>
        ) : historialReportes.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No hay historial de acciones.</div>
        ) : (
          <>
            <div className="space-y-3">
              {historialReportes
                .slice(paginaHistorial * ITEMS_POR_PAGINA, (paginaHistorial + 1) * ITEMS_POR_PAGINA)
                .map((item, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between border-b border-gray-100 pb-3 last:border-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{item.accion || 'Acción'}</p>
                  <p className="text-sm text-gray-600">{item.detalle || 'Sin detalles'}</p>
                  <p className="text-xs text-gray-400 mt-1">Realizado por: {item.soporte_email || 'N/A'}</p>
                </div>
                <div className="text-right text-xs text-gray-500 ml-4">
                  {item.fecha ? formatearFecha(item.fecha) : 'N/A'}
                </div>
              </div>
            ))}
          </div>

          {/* Paginación de Historial */}
          {historialReportes && historialReportes.length > ITEMS_POR_PAGINA && (
            <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-teal-50 to-sky-50 px-6 py-4 rounded-xl border border-teal-100/50">
              <button
                onClick={() => setPaginaHistorial(Math.max(0, paginaHistorial - 1))}
                disabled={paginaHistorial === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-teal-500 to-sky-500 text-white shadow-lg hover:shadow-xl"
              >
                <ChevronLeftIcon className="w-5 h-5" />
                Anterior
              </button>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-700">
                  Página <span className="text-teal-600 text-lg">{paginaHistorial + 1}</span> de{' '}
                  <span className="text-sky-600 text-lg">{Math.ceil(historialReportes.length / ITEMS_POR_PAGINA)}</span>
                </span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                <span className="text-xs text-gray-600 bg-white px-3 py-1.5 rounded-full font-semibold">
                  {historialReportes.length} acciones
                </span>
              </div>

              <button
                onClick={() => setPaginaHistorial(Math.min(Math.ceil(historialReportes.length / ITEMS_POR_PAGINA) - 1, paginaHistorial + 1))}
                disabled={paginaHistorial >= Math.ceil(historialReportes.length / ITEMS_POR_PAGINA) - 1}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-sky-500 to-purple-500 text-white shadow-lg hover:shadow-xl"
              >
                Siguiente
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );

  // ===========================
  // RENDER PRINCIPAL
  // ===========================

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-100 to-blue-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No autorizado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-teal-50 via-sky-50 to-purple-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-sky-400/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-br from-sky-400/20 to-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-teal-400/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
      
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-xl shadow-2xl flex flex-col justify-between relative z-10 border-r border-teal-100/50">
        <div>
          <div className="p-6 border-b border-teal-100/50 bg-gradient-to-br from-white/90 to-teal-50/30">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 via-sky-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-glow transform hover:scale-110 transition-transform duration-300">
                <ShieldCheckIcon className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-teal-600 via-sky-600 to-purple-600 bg-clip-text text-transparent tracking-tight">CONTROL</h1>
                <p className="text-xs text-gray-600 font-semibold">Centro de Supervisión</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map(({ id, label, icon: Icon, badge, badgeClass }) => (
              <button
                key={id}
                onClick={() => setSeccionActiva(id)}
                className={`group w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-[1.03] ${
                  seccionActiva === id
                    ? 'bg-gradient-to-r from-teal-500 via-sky-500 to-purple-500 text-white shadow-2xl shadow-teal-300/50 scale-[1.02]'
                    : 'hover:bg-gradient-to-r hover:from-teal-50 hover:to-sky-50 text-gray-700 hover:shadow-lg border border-transparent hover:border-teal-200/50'
                }`}
              >
                <Icon className={`w-6 h-6 transition-transform duration-300 ${seccionActiva === id ? 'animate-pulse scale-110' : 'group-hover:scale-110'}`} />
                <span className="flex-1 text-left">{label}</span>
                {badge !== null && badge !== undefined && (
                  <span className={`text-xs px-3 py-1.5 rounded-full font-bold animate-pulse shadow-md ${seccionActiva === id ? 'bg-white/30 text-white backdrop-blur-sm' : badgeClass || 'bg-teal-100 text-teal-800'}`}>
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {usuario && (
          <div className="p-4 border-t border-teal-100/50 flex items-center gap-3 bg-gradient-to-r from-teal-50/50 to-sky-50/50">
            <img
              src={obtenerAvatarUrl(usuario?.foto, usuario?.nombre)}
              alt={usuario.nombre}
              className="w-11 h-11 rounded-full object-cover border-2 border-teal-300 shadow-md"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = obtenerAvatarUrl(null, usuario?.nombre);
              }}
            />
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">{usuario.nombre}</p>
              <span className="text-xs bg-gradient-to-r from-teal-500 to-sky-500 text-white px-2.5 py-1 rounded-full capitalize font-semibold shadow-sm">{usuario.rol}</span>
            </div>
            <button
              onClick={cerrarSesion}
              className="text-red-500 hover:text-red-700 transition transform hover:scale-110 hover:rotate-12 p-1 rounded-lg hover:bg-red-50"
              title="Cerrar sesión"
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 pt-10 overflow-y-auto relative">
        {/* Hero Section */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-sky-500/10 to-purple-500/10 rounded-3xl blur-2xl" />
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-teal-100/50 p-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-400/20 to-sky-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-teal-400/20 rounded-full blur-3xl" />
            
            <div className="relative flex justify-between items-center">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500/10 to-sky-500/10 backdrop-blur-sm border border-teal-200/50 rounded-full px-4 py-1.5 mb-4">
                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-teal-700">Sistema Activo</span>
                </div>
                <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-teal-600 via-sky-600 to-purple-600 bg-clip-text text-transparent animate-text-shimmer">
                  {menuItems.find((m) => m.id === seccionActiva)?.label || 'Centro de Control'}
                </h2>
                <p className="text-gray-600 text-lg">Sistema de gestión y supervisión integral</p>
              </div>

              {/* Botón Notificaciones */}
              <div className="relative">
                <button
                  onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
                  className="relative p-3 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-sky-50 transition transform hover:scale-110 shadow-lg bg-white border border-teal-200/50"
                >
                  <BellIcon className="w-7 h-7 text-gray-700" />
                  {notificacionesNoLeidas > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce shadow-lg">
                      {notificacionesNoLeidas}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mensajes globales */}
        {mensaje && (
          <div
            className={`rounded-lg border px-4 py-3 mb-6 ${
              mensaje.tipo === 'success'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {mensaje.texto}
          </div>
        )}

        {/* (Depuración removida) */}

        {/* Contenido dinámico */}
        {seccionActiva === 'reportes' && renderReportes()}
        {seccionActiva === 'usuarios' && renderUsuarios()}
        {seccionActiva === 'mantenimiento' && renderMantenimiento()}
        {seccionActiva === 'historial' && renderHistorial()}
      </main>

      {reporteComentarios && (
        <div className="fixed inset-0 z-50 flex animate-fadeIn">
          <div
            className="absolute inset-0 bg-gradient-to-br from-teal-900/40 via-sky-900/40 to-purple-900/40 backdrop-blur-md"
            onClick={cerrarComentarios}
            aria-hidden="true"
          />
          <aside className="relative ml-auto flex h-full w-full max-w-2xl flex-col bg-white/95 backdrop-blur-xl shadow-2xl border-l-4 border-gradient-to-b from-teal-500 via-sky-500 to-purple-500 animate-slideInRight">
            <header className="flex items-start justify-between border-b-2 border-gradient-to-r from-teal-100 to-sky-100 p-7 bg-gradient-to-r from-teal-50/50 to-sky-50/50">
              <div className="space-y-2 flex-1">
                <p className="text-xs uppercase tracking-wider font-bold text-teal-600 flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" />
                  Reporte {reporteComentarios.displayId}
                </p>
                <h3 className="text-xl font-bold bg-gradient-to-r from-teal-700 via-sky-700 to-purple-700 bg-clip-text text-transparent">{reporteComentarios.resumen}</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-teal-100 to-sky-100 px-3 py-1.5 text-teal-700 font-bold shadow-sm">
                    {toLabel(reporteComentarios.categoria)}
                  </span>
                  {reporteComentarios.estado && (
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1.5 text-gray-700 font-bold shadow-sm">
                      Estado {toLabel(reporteComentarios.estado)}
                    </span>
                  )}
                  {reporteComentarios.resuelto_en && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-1.5 text-emerald-700 font-bold shadow-sm">
                      <CheckCircleIcon className="h-4 w-4" />
                      Resuelto {formatearFecha(reporteComentarios.resuelto_en)}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={cerrarComentarios}
                className="rounded-xl p-2 text-gray-500 transition hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transform hover:scale-110 hover:rotate-90"
                aria-label="Cerrar panel de comentarios"
              >
                <XMarkIcon className="h-7 w-7" />
              </button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto p-6 bg-gradient-to-br from-gray-50/50 to-teal-50/20">
              {errorComentarios ? (
                <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 p-5 text-sm text-red-700 shadow-lg animate-fadeIn">
                  <ExclamationTriangleIcon className="w-6 h-6 inline mr-2 animate-pulse" />
                  {errorComentarios.message || 'No se pudieron cargar los comentarios.'}
                </div>
              ) : cargandoComentarios && comentarios.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-sky-500 rounded-full animate-spin animation-delay-150" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-gray-600">Cargando conversación…</p>
                </div>
              ) : comentarios.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-teal-200 bg-gradient-to-br from-teal-50/50 to-sky-50/50 p-8 text-center shadow-inner">
                  <ChatBubbleOvalLeftEllipsisIcon className="w-16 h-16 mx-auto mb-4 text-teal-300" />
                  <p className="text-sm font-semibold text-gray-600">Aún no hay comentarios en este reporte.</p>
                </div>
              ) : (
                comentarios.map((comentario, idx) => {
                  const badgeClass =
                    comentario.tipo === 'interno'
                      ? 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700'
                      : comentario.tipo === 'respuesta'
                        ? 'bg-gradient-to-r from-teal-100 to-sky-100 text-teal-700'
                        : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700';

                  return (
                    <div key={comentario.id} className="rounded-2xl border border-teal-100/50 bg-white/80 backdrop-blur-sm p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] animate-fadeIn" style={{ animationDelay: `${idx * 50}ms` }}>
                      <div className="flex items-start gap-4">
                        <img
                          src={obtenerAvatarUrl(comentario.autor_foto, comentario.autor_nombre)}
                          alt={comentario.autor_nombre}
                          className="h-11 w-11 flex-shrink-0 rounded-full object-cover border-2 border-teal-200 shadow-md"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = obtenerAvatarUrl(null, comentario.autor_nombre);
                          }}
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-gray-900">{comentario.autor_nombre}</p>
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold shadow-sm ${badgeClass}`}>
                              {toLabel(comentario.tipo)}
                            </span>
                            {comentario.creado_en && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                {formatearFecha(comentario.creado_en)}
                              </span>
                            )}
                          </div>
                          <p className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">{comentario.mensaje}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <footer className="border-t-2 border-gradient-to-r from-teal-100 to-sky-100 p-6 bg-gradient-to-r from-teal-50/50 to-sky-50/50">
              {comentariosAviso && (
                <div className="mb-4 rounded-xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 text-sm text-emerald-700 font-semibold shadow-md animate-fadeIn">
                  <CheckCircleIcon className="w-5 h-5 inline mr-2" />
                  {comentariosAviso.texto}
                </div>
              )}
              {comentarioError && (
                <div className="mb-4 rounded-xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-pink-50 px-4 py-3 text-sm text-red-700 font-semibold shadow-md animate-fadeIn">
                  <ExclamationTriangleIcon className="w-5 h-5 inline mr-2" />
                  {comentarioError}
                </div>
              )}
              <form className="space-y-4" onSubmit={handleSubmitComentario}>
                <div>
                  <label
                    htmlFor="nuevo-comentario"
                    className="text-xs font-bold uppercase tracking-widest text-gray-700 flex items-center gap-2 mb-2"
                  >
                    <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4 text-teal-500" />
                    Nuevo comentario
                  </label>
                  <textarea
                    id="nuevo-comentario"
                    value={comentarioMensaje}
                    onChange={(e) => {
                      setComentarioMensaje(e.target.value);
                      if (comentarioError) {
                        setComentarioError('');
                      }
                    }}
                    rows={4}
                    className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-200/50 transition-all bg-white/80 backdrop-blur-sm shadow-inner"
                    placeholder="Comparte una actualización o deja una nota interna…"
                  ></textarea>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <select
                    value={comentarioTipo}
                    onChange={(e) => setComentarioTipo(e.target.value)}
                    className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-sm font-semibold focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-200/50 sm:w-52 transition-all bg-white/80 backdrop-blur-sm shadow-sm"
                  >
                    {tiposComentarioDisponibles.map((opcion) => (
                      <option key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={creandoComentario || !comentarioMensaje.trim()}
                    className="inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-teal-500 via-sky-500 to-purple-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60 transform hover:scale-105"
                  >
                    {creandoComentario && <ArrowPathIcon className="h-5 w-5 animate-spin" />}
                    {creandoComentario ? 'Enviando…' : 'Agregar comentario'}
                  </button>
                </div>
              </form>
            </footer>
          </aside>
        </div>
      )}

      {/* Panel de Notificaciones - Posicionamiento fijo fuera del flujo */}
      {mostrarNotificaciones && (
        <>
          {/* Overlay para cerrar al hacer click fuera */}
          <div 
            className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-sm"
            onClick={() => {
              setMostrarNotificaciones(false);
              setPaginaNotificaciones(0);
            }}
          />
          {/* Panel de notificaciones */}
          <div className="fixed right-8 top-24 w-[420px] bg-white backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-teal-200/50 z-[9999] overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="p-5 border-b-2 border-teal-100/50 bg-gradient-to-r from-teal-50/80 to-sky-50/80">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <BellIcon className="w-5 h-5 text-teal-600" />
                  Notificaciones
                </h3>
                <div className="flex items-center gap-2">
                  {notificacionesNoLeidas > 0 && (
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                      {notificacionesNoLeidas} nuevas
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setMostrarNotificaciones(false);
                      setPaginaNotificaciones(0);
                    }}
                    className="p-1 hover:bg-red-50 rounded-lg transition text-gray-500 hover:text-red-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido */}
            {notificaciones.length === 0 ? (
              <div className="p-8 text-center">
                <BellIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-sm font-semibold text-gray-600">No hay notificaciones</p>
                <p className="text-xs text-gray-500 mt-1">Aquí verás las actualizaciones importantes</p>
              </div>
            ) : (
              <>
                {/* Lista de notificaciones paginadas */}
                <div className="divide-y divide-teal-50/50 min-h-[300px] max-h-[400px]">
                  {notificaciones
                    .slice(
                      paginaNotificaciones * NOTIFICACIONES_POR_PAGINA,
                      (paginaNotificaciones + 1) * NOTIFICACIONES_POR_PAGINA
                    )
                    .map((notif, idx) => (
                      <div
                        key={notif.id}
                        className={`p-4 hover:bg-gradient-to-r hover:from-teal-50 hover:to-sky-50 cursor-pointer transition-all duration-200 animate-fadeIn ${notif.leido ? 'opacity-60' : 'bg-teal-50/50'}`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                        onClick={() => !notif.leido && marcarNotificacionLeida(notif.id)}
                      >
                        <div className="flex items-start gap-3">
                          {!notif.leido && (
                            <div className="flex-shrink-0 mt-1">
                              <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 font-semibold leading-snug mb-1">
                              {notif.mensaje || 'Sin mensaje'}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <ClockIcon className="w-3 h-3 flex-shrink-0" />
                              <span>{notif.creado_en ? formatearFecha(notif.creado_en) : 'N/A'}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Controles de paginación */}
                {notificaciones.length > NOTIFICACIONES_POR_PAGINA && (
                  <div className="p-4 border-t-2 border-teal-100/50 bg-gradient-to-r from-teal-50/50 to-sky-50/50">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setPaginaNotificaciones((prev) => Math.max(0, prev - 1))}
                        disabled={paginaNotificaciones === 0}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border-2 border-teal-200 text-teal-700 font-semibold text-sm hover:bg-teal-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md transform hover:scale-105 disabled:transform-none"
                      >
                        <ChevronLeftIcon className="w-4 h-4" />
                        Anterior
                      </button>

                      <div className="text-xs font-semibold text-gray-600">
                        <span className="text-teal-600">{paginaNotificaciones + 1}</span> de{' '}
                        <span className="text-sky-600">
                          {Math.ceil(notificaciones.length / NOTIFICACIONES_POR_PAGINA)}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          setPaginaNotificaciones((prev) =>
                            Math.min(
                              Math.ceil(notificaciones.length / NOTIFICACIONES_POR_PAGINA) - 1,
                              prev + 1
                            )
                          )
                        }
                        disabled={
                          paginaNotificaciones >= Math.ceil(notificaciones.length / NOTIFICACIONES_POR_PAGINA) - 1
                        }
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border-2 border-teal-200 text-teal-700 font-semibold text-sm hover:bg-teal-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md transform hover:scale-105 disabled:transform-none"
                      >
                        Siguiente
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Modal de Mantenimiento */}
      {mostrarModalMantenimiento && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center animate-fadeIn">
          <div
            className="absolute inset-0 bg-gradient-to-br from-teal-900/50 via-sky-900/50 to-purple-900/50 backdrop-blur-md"
            onClick={cancelarMantenimiento}
            aria-hidden="true"
          />
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-gradient-to-br from-teal-500 via-sky-500 to-purple-500 w-full max-w-2xl mx-4 animate-slideInRight overflow-hidden">
            {/* Header con gradiente */}
            <div className="relative bg-gradient-to-r from-teal-500 via-sky-500 to-purple-500 p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <div className="relative flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-glow">
                  <WrenchScrewdriverIcon className="w-9 h-9 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-extrabold text-white mb-1 tracking-tight">
                    Activar Modo Mantenimiento
                  </h3>
                  <p className="text-white/90 text-sm font-semibold">
                    Configure el mensaje que verán los usuarios
                  </p>
                </div>
                <button
                  onClick={cancelarMantenimiento}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition transform hover:scale-110 hover:rotate-90"
                >
                  <XMarkIcon className="w-7 h-7" />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-8 space-y-6">
              {/* Aviso */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 shadow-lg">
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h4 className="font-bold text-amber-900 mb-1">¡Atención!</h4>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      Al activar el modo mantenimiento, los usuarios no podrán acceder al sistema. 
                      Solo los administradores y personal de soporte mantendrán acceso.
                    </p>
                  </div>
                </div>
              </div>

              {/* Campo de mensaje */}
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                    <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-teal-600" />
                    Mensaje para usuarios (opcional)
                  </span>
                  <p className="text-xs text-gray-500 mt-1 mb-3">
                    Este mensaje se mostrará a los usuarios durante el mantenimiento
                  </p>
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-sky-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <textarea
                    value={mensajeMantenimiento}
                    onChange={(e) => setMensajeMantenimiento(e.target.value)}
                    placeholder="Ej: Sistema en mantenimiento programado. Volveremos pronto..."
                    rows={4}
                    className="relative w-full px-5 py-4 border-2 border-teal-200/50 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white/80 backdrop-blur-sm resize-none font-medium text-gray-700 placeholder:text-gray-400"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-semibold bg-white/80 px-2 py-1 rounded-lg">
                    {mensajeMantenimiento.length} caracteres
                  </div>
                </div>
              </div>

              {/* Vista previa */}
              {mensajeMantenimiento && (
                <div className="bg-gradient-to-br from-teal-50 to-sky-50 border-2 border-teal-200/50 rounded-2xl p-5 shadow-lg animate-fadeIn">
                  <p className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4" />
                    Vista previa
                  </p>
                  <p className="text-sm text-gray-700 italic leading-relaxed">
                    "{mensajeMantenimiento}"
                  </p>
                </div>
              )}
            </div>

            {/* Footer con botones */}
            <div className="bg-gradient-to-r from-gray-50 to-teal-50/30 border-t-2 border-teal-100/50 p-6 flex items-center justify-end gap-3">
              <button
                onClick={cancelarMantenimiento}
                disabled={activandoMantenimiento}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 hover:border-gray-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                <XMarkIcon className="w-5 h-5" />
                Cancelar
              </button>
              <button
                onClick={confirmarMantenimiento}
                disabled={activandoMantenimiento}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-bold text-sm hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-2xl transform hover:scale-105 disabled:transform-none"
              >
                {activandoMantenimiento ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Activando...
                  </>
                ) : (
                  <>
                    <WrenchScrewdriverIcon className="w-5 h-5" />
                    Activar Mantenimiento
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
