import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  LifebuoyIcon,
  ArrowPathIcon,
  FunnelIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  XMarkIcon,
  CogIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  SparklesIcon,
  BoltIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import {
  actualizarEstadoReporte,
  eliminarReporteSoporte,
  obtenerDashboardResumen,
  obtenerEstadosReportes,
  obtenerReportesSoporte,
  obtenerCatalogosUsuariosAdmin,
  obtenerUsuariosAdmin,
  obtenerUsuarioDetalleAdmin,
  obtenerPresentacionesUsuarioAdmin,
  actualizarRolUsuarioAdmin,
  actualizarEstadoUsuarioAdmin,
  eliminarUsuarioAdmin,
  obtenerComentariosReporteSoporte,
  crearComentarioReporteSoporte,
  obtenerEstadoMantenimientoSoporte,
  actualizarEstadoMantenimientoSoporte,
  obtenerHistorialMantenimientoSoporte,
  obtenerHistorialReportesSoporte,
  eliminarPresentacion,
} from '../services/api';

const ESTADOS_REPORTE_FALLBACK = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'resuelto', label: 'Resuelto' },
];

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

const obtenerIdReporte = (reporte, fallbackIndex) =>
  reporte?.id ??
  reporte?.reporteId ??
  reporte?.reporte_id ??
  reporte?.uuid ??
  reporte?.codigo ??
  reporte?.slug ??
  `reporte-${fallbackIndex}`;

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
    return null;
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

const obtenerIdPresentacion = (presentacion) =>
  presentacion?.id ??
  presentacion?.presentacionId ??
  presentacion?.presentacion_id ??
  presentacion?.uuid ??
  null;

const obtenerUsuarioEmail = (usuario) =>
  usuario?.email ??
  usuario?.correo ??
  usuario?.mail ??
  usuario?.user_email ??
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

const formatearFechaCorta = (valor) => {
  if (!valor) return 'N/A';
  const fechaStr = String(valor);
  const isoBasico = fechaStr.split('T')[0];
  const partes = isoBasico.split('-');
  if (partes.length !== 3) return fechaStr;
  const [, mes, dia] = partes;
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const indiceMes = Number(mes) - 1;
  if (indiceMes < 0 || indiceMes > 11) return fechaStr;
  return `${dia} ${meses[indiceMes]}`;
};

const formatearFechaLarga = (valor) => {
  if (!valor) return 'N/A';
  const valorStr = String(valor);
  if (/^\d{4}-\d{2}-\d{2}$/.test(valorStr)) {
    const [anio, mes, dia] = valorStr.split('-');
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const indiceMes = Number(mes) - 1;
    if (indiceMes < 0 || indiceMes > 11) return valorStr;
    return `${Number(dia)} de ${meses[indiceMes]} de ${anio}`;
  }

  const fecha = new Date(valorStr);
  if (Number.isNaN(fecha.getTime())) return valorStr;
  return fecha.toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const normalizarSerieDiaria = (serie) => {
  if (!Array.isArray(serie)) return [];
  return [...serie]
    .map((item) => ({
      fecha: item?.fecha ?? item?.day ?? item?.date ?? null,
      total: typeof item?.total === 'number' ? item.total : Number(item?.count ?? item?.total) || 0,
    }))
    .filter((item) => typeof item.fecha === 'string' && item.fecha)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
};

const obtenerUsuarioId = (usuario) =>
  usuario?.id ??
  usuario?.usuarioId ??
  usuario?.usuario_id ??
  usuario?.uuid ??
  usuario?.codigo ??
  null;

const obtenerUltimaPresentacionUsuario = (usuario) =>
  normalizarValorFecha(
    usuario?.ultimaPresentacion,
    usuario?.ultima_presentacion,
    usuario?.ultimaPresentacionFecha,
    usuario?.ultima_presentacion_fecha,
    usuario?.metricas?.ultimaPresentacion,
    usuario?.metricas?.ultima_presentacion,
  );

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

const obtenerTotalPresentacionesUsuario = (usuario) =>
  usuario?.totalPresentaciones ??
  usuario?.total_presentaciones ??
  usuario?.metricas?.presentaciones ??
  null;

const obtenerTotalSesionesUsuario = (usuario) =>
  usuario?.totalSesiones ??
  usuario?.total_sesiones ??
  usuario?.metricas?.sesiones ??
  null;

const obtenerRolUsuarioNormalizado = (usuario) => {
  const raw = usuario?.rol ?? usuario?.role ?? usuario?.tipo ?? null;
  return raw ? raw.toString().toLowerCase() : '';
};

const obtenerEstadoUsuarioNormalizado = (usuario) => {
  const raw = usuario?.estado ?? usuario?.status ?? null;
  return raw ? raw.toString().toLowerCase() : '';
};


const obtenerCategoriaKey = (reporte) =>
  reporte?.categoriaKey ??
  reporte?.categoria_key ??
  reporte?.categoriaClave ??
  reporte?.categoriaSlug ??
  (typeof reporte?.categoria === 'string' ? reporte.categoria : null);

const obtenerCategoriaLabel = (reporte) =>
  reporte?.categoria ??
  reporte?.categoriaNombre ??
  reporte?.categoria_label ??
  reporte?.categoriaDescripcion ??
  (obtenerCategoriaKey(reporte) ? toLabel(obtenerCategoriaKey(reporte)) : 'Sin categoria');

const obtenerEstadoKey = (reporte) => {
  const raw =
    reporte?.estadoKey ??
    reporte?.estado_key ??
    reporte?.estadoClave ??
    reporte?.estado ??
    reporte?.status ??
    null;
  if (raw === null || raw === undefined) return null;
  return raw.toString().toLowerCase();
};

const normalizarEstados = (lista) =>
  lista
    .map((item) => {
      if (!item) return null;
      if (typeof item === 'string') {
        return { value: item, label: toLabel(item) };
      }

      const value =
        item.key ??
        item.value ??
        item.estado ??
        item.id ??
        item.codigo ??
        item.slug ??
        item.nombre ??
        null;
      const label =
        item.label ??
        item.nombre ??
        item.descripcion ??
        item.estado ??
        item.value ??
        item.id ??
        null;

      if (!value || !label) return null;
      return { value, label: toLabel(label) };
    })
    .filter(Boolean);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [catalogosUsuarios, setCatalogosUsuarios] = useState({ roles: [], estados: [] });
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [errorUsuarios, setErrorUsuarios] = useState('');
  const [usuariosTotal, setUsuariosTotal] = useState(0);
  const [usuariosPaginacion, setUsuariosPaginacion] = useState({ limit: 20, offset: 0 });
  const [rolFiltroUsuarios, setRolFiltroUsuarios] = useState('todos');
  const [estadoFiltroUsuarios, setEstadoFiltroUsuarios] = useState('todos');
  const [busquedaUsuarios, setBusquedaUsuarios] = useState('');
  const [mensajeUsuarios, setMensajeUsuarios] = useState(null);
  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState(null);
  const [usuarioDetalle, setUsuarioDetalle] = useState(null);
  const [cargandoDetalleUsuario, setCargandoDetalleUsuario] = useState(false);
  const [errorDetalleUsuario, setErrorDetalleUsuario] = useState('');
  const [presentacionesUsuario, setPresentacionesUsuario] = useState([]);
  const [presentacionesUsuarioTotal, setPresentacionesUsuarioTotal] = useState(0);
  const [presentacionesUsuarioPaginacion, setPresentacionesUsuarioPaginacion] = useState({ limit: 10, offset: 0 });
  const [cargandoPresentacionesUsuario, setCargandoPresentacionesUsuario] = useState(false);
  const [errorPresentacionesUsuario, setErrorPresentacionesUsuario] = useState('');
  const [mensajePresentacionesUsuario, setMensajePresentacionesUsuario] = useState(null);
  const [eliminandoPresentacionId, setEliminandoPresentacionId] = useState(null);
  const [accionUsuario, setAccionUsuario] = useState({ id: null, tipo: null });
  const [seccionActiva, setSeccionActiva] = useState('dashboard');
  const { limit: usuariosLimit, offset: usuariosOffset } = usuariosPaginacion;
  const { limit: historialLimit, offset: historialOffset } = presentacionesUsuarioPaginacion;
  const [reportes, setReportes] = useState([]);
  const [estadosReportes, setEstadosReportes] = useState([]);
  const [categoriasReportes, setCategoriasReportes] = useState([]);
  const [busquedaReportes, setBusquedaReportes] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [cargandoReportes, setCargandoReportes] = useState(false);
  const [errorReportes, setErrorReportes] = useState('');
  const [actualizandoReporteId, setActualizandoReporteId] = useState(null);
  const [eliminandoReporteId, setEliminandoReporteId] = useState(null);
  const [mensajeReportes, setMensajeReportes] = useState(null);
  const [dashboardResumen, setDashboardResumen] = useState(null);
  const [cargandoDashboard, setCargandoDashboard] = useState(false);
  const [errorDashboard, setErrorDashboard] = useState('');

  // Estados para comentarios de reportes
  const [reporteComentarios, setReporteComentarios] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [cargandoComentarios, setCargandoComentarios] = useState(false);
  const [comentarioMensaje, setComentarioMensaje] = useState('');
  const [comentarioTipo, setComentarioTipo] = useState('interno');
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  // Estados para mantenimiento
  const [mantenimiento, setMantenimiento] = useState(null);
  const [cargandoMantenimiento, setCargandoMantenimiento] = useState(false);
  const [activandoMantenimiento, setActivandoMantenimiento] = useState(false);
  const [modalMantenimiento, setModalMantenimiento] = useState({ abierto: false, activar: true, mensaje: '' });

  // Estados para historial
  const [historialMantenimientos, setHistorialMantenimientos] = useState([]);
  const [historialReportes, setHistorialReportes] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Estados de paginación para tablas
  const [paginaReportes, setPaginaReportes] = useState(0);
  const [paginaUsuarios, setPaginaUsuarios] = useState(0);
  const [paginaMantenimiento, setPaginaMantenimiento] = useState(0);
  const [paginaHistorial, setPaginaHistorial] = useState(0);
  const ITEMS_POR_PAGINA = 5;

  const formateadorNumeroRef = useRef(null);

  const formatearNumero = useCallback((valor) => {
    if (!formateadorNumeroRef.current) {
      formateadorNumeroRef.current = new Intl.NumberFormat('es-ES');
    }
    const numero = Number(valor) || 0;
    return formateadorNumeroRef.current.format(numero);
  }, []);

  const resolverLabelRanking = useCallback((item) => {
    if (!item) return 'Sin datos';
    if (typeof item === 'string') return item;
    return (
      item.label ??
      item.nombre ??
      item.name ??
      item.titulo ??
      item.prompt ??
      item.descripcion ??
      item.slug ??
      item.id ??
      'Sin datos'
    );
  }, []);

  const resolverTotalRanking = useCallback((item) => {
    if (item === null || item === undefined) return 0;
    if (typeof item === 'number') return item;
    const posible =
      item.total ??
      item.conteo ??
      item.count ??
      item.usos ??
      item.veces ??
      item.cantidad ??
      item.valor ??
      0;
    const numero = Number(posible);
    return Number.isFinite(numero) ? numero : 0;
  }, []);

  const fetchReportes = useCallback(
    async (overrides = {}) => {
      setCargandoReportes(true);
      setErrorReportes('');
      try {
        const paramsBase = {};
        if (estadoFiltro !== 'todos') {
          paramsBase.estadoKey = estadoFiltro;
        }
        if (categoriaFiltro !== 'todas') {
          paramsBase.categoriaKey = categoriaFiltro;
        }
        const params = { ...paramsBase, ...overrides };

        const respuesta = await obtenerReportesSoporte(params);
        const payload = respuesta?.data || respuesta || {};

        if (payload.ok === false) {
          const error = new Error(payload.message || 'Respuesta inválida del backend');
          error.response = { data: payload };
          throw error;
        }

        const lista = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.reportes)
            ? payload.reportes
            : Array.isArray(respuesta)
              ? respuesta
              : [];

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

        setCategoriasReportes(categoriasOrdenadas);
        if (
          categoriaFiltro !== 'todas' &&
          categoriasOrdenadas.length &&
          !categoriasOrdenadas.some((categoria) => categoria.value === categoriaFiltro)
        ) {
          setCategoriaFiltro('todas');
        }

        setReportes(lista);
      } catch (error) {
        console.error('Error al obtener reportes de soporte', error);
        const mensaje =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'No fue posible cargar los reportes.';
        setErrorReportes(mensaje);
        setReportes([]);
        setCategoriasReportes([]);
      } finally {
        setCargandoReportes(false);
      }
    },
    [categoriaFiltro, estadoFiltro],
  );

  const fetchEstados = useCallback(async () => {
    try {
      const respuesta = await obtenerEstadosReportes();
      const lista = Array.isArray(respuesta)
        ? respuesta
        : Array.isArray(respuesta?.data)
          ? respuesta.data
          : Array.isArray(respuesta?.estados)
            ? respuesta.estados
            : [];

      const normalizados = normalizarEstados(lista);
      setEstadosReportes(normalizados.length ? normalizados : ESTADOS_REPORTE_FALLBACK);
    } catch (error) {
      console.error('Error al obtener estados de reportes', error);
      setEstadosReportes(ESTADOS_REPORTE_FALLBACK);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    setCargandoDashboard(true);
    setErrorDashboard('');
    try {
      const data = await obtenerDashboardResumen();
      setDashboardResumen(data || null);
    } catch (error) {
      console.error('Error al obtener el resumen del dashboard admin', error);
      const mensaje =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'No fue posible cargar el resumen del panel.';
      setErrorDashboard(mensaje);
      setDashboardResumen(null);
    } finally {
      setCargandoDashboard(false);
    }
  }, []);

  useEffect(() => {
    if (!mensajeUsuarios) return undefined;
    const timeout = setTimeout(() => setMensajeUsuarios(null), 4000);
    return () => clearTimeout(timeout);
  }, [mensajeUsuarios]);

  useEffect(() => {
    if (!mensajeReportes) return undefined;
    const timeout = setTimeout(() => setMensajeReportes(null), 4000);
    return () => clearTimeout(timeout);
  }, [mensajeReportes]);

  // (moved below after function definitions to avoid no-use-before-define)

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    // Usar window.location.href para forzar recarga completa
    window.location.href = '/';
  };

  const exportarCSV = () => {
    const headers = ['Nombre', 'Email', 'Proyecto', 'Fecha'];
    const csvContent = [
      headers.join(','),
      ...usuarios.map((u) => [
        u.nombre || '',
        obtenerUsuarioEmail(u) || '',
        u.titulo || '',
        u.fecha_creacion ? new Date(u.fecha_creacion).toLocaleDateString() : '',
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usuarios_tec_create.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const gestionarEstadoReporte = async (reporte, nuevoEstado, fallbackIndex = 0) => {
    const idReporte = obtenerIdReporte(reporte, fallbackIndex);
    if (!idReporte || !nuevoEstado) return;

    try {
      setActualizandoReporteId(idReporte);
      await actualizarEstadoReporte(idReporte, nuevoEstado);
  await fetchReportes();
  setMensajeReportes({ tipo: 'success', texto: 'Estado actualizado correctamente.' });
  setTimeout(() => setMensajeReportes(null), 4000);
    } catch (error) {
      console.error('Error al actualizar estado del reporte', error);
      const mensaje =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'No fue posible actualizar el estado. Intenta nuevamente.';
  setMensajeReportes({ tipo: 'error', texto: mensaje });
  setTimeout(() => setMensajeReportes(null), 4000);
    } finally {
      setActualizandoReporteId(null);
    }
  };

  const eliminarReporte = useCallback(
    async (reporte, fallbackIndex = 0) => {
      const idReporte = obtenerIdReporte(reporte, fallbackIndex);
      if (!idReporte) return;

      const confirmado = window.confirm(
        'Deseas eliminar este reporte? Esta accion no se puede deshacer.',
      );

      if (!confirmado) return;

      try {
        setMensajeReportes(null);
        setEliminandoReporteId(idReporte);
        await eliminarReporteSoporte(idReporte);
        await fetchReportes();
        setMensajeReportes({ tipo: 'success', texto: 'Reporte eliminado correctamente.' });
      } catch (error) {
        console.error('Error al eliminar el reporte de soporte', error);
        const mensaje =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'No se pudo eliminar el reporte. Intenta nuevamente.';
        setMensajeReportes({ tipo: 'error', texto: mensaje });
      } finally {
        setEliminandoReporteId(null);
      }
    },
    [fetchReportes],
  );

  // Funciones para manejar comentarios
  const abrirComentarios = async (reporte, fallbackIndex = 0) => {
    const idReporte = obtenerIdReporte(reporte, fallbackIndex);
    if (!idReporte) return;

    setReporteComentarios({ ...reporte, displayId: idReporte });
    setComentarioMensaje('');
    setComentarioTipo('interno');
    setCargandoComentarios(true);

    try {
      const data = await obtenerComentariosReporteSoporte(idReporte);
      const payload = data || {};
      const lista = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.comentarios)
          ? payload.comentarios
          : Array.isArray(payload)
            ? payload
            : [];
      setComentarios(lista);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
      setComentarios([]);
    } finally {
      setCargandoComentarios(false);
    }
  };

  const cerrarComentarios = () => {
    setReporteComentarios(null);
    setComentarios([]);
    setComentarioMensaje('');
    setComentarioTipo('interno');
  };

  const enviarComentario = async (e) => {
    e.preventDefault();

    if (!reporteComentarios?.displayId) return;

    const mensajeLimpio = comentarioMensaje.trim();
    if (!mensajeLimpio) {
      setMensajeReportes({ tipo: 'error', texto: 'Escribe un mensaje antes de enviar.' });
      return;
    }

    setEnviandoComentario(true);

    try {
      await crearComentarioReporteSoporte(reporteComentarios.displayId, {
        mensaje: mensajeLimpio,
        tipo: comentarioTipo,
      });

      // Recargar comentarios
      const data = await obtenerComentariosReporteSoporte(reporteComentarios.displayId);
      const payload = data || {};
      const lista = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.comentarios)
          ? payload.comentarios
          : Array.isArray(payload)
            ? payload
            : [];
      setComentarios(lista);
      setComentarioMensaje('');
      setMensajeReportes({ tipo: 'success', texto: 'Comentario agregado correctamente.' });
    } catch (error) {
      console.error('Error al enviar comentario:', error);
      const mensaje =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'No se pudo agregar el comentario.';
      setMensajeReportes({ tipo: 'error', texto: mensaje });
    } finally {
      setEnviandoComentario(false);
    }
  };

  // Funciones para mantenimiento e historial
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

  const abrirModalMantenimiento = useCallback(
    (activar = true) => {
      if (activandoMantenimiento) return;
      const mensajeBase = activar
        ? (mantenimiento?.mensaje && mantenimiento.mensaje.trim()
            ? mantenimiento.mensaje
            : 'Sistema en mantenimiento programado.')
        : '';
      setModalMantenimiento({ abierto: true, activar, mensaje: mensajeBase });
    },
    [activandoMantenimiento, mantenimiento],
  );

  const cerrarModalMantenimiento = useCallback(() => {
    setModalMantenimiento((prev) => ({ ...prev, abierto: false }));
  }, []);

  const confirmarModalMantenimiento = useCallback(async () => {
    if (activandoMantenimiento) return;
    const { activar, mensaje } = modalMantenimiento;
    const payloadMensaje = activar ? (mensaje || '').trim() : '';

    setActivandoMantenimiento(true);
    try {
      await actualizarEstadoMantenimientoSoporte({ activo: activar, mensaje: payloadMensaje });
      await fetchMantenimiento();
      await fetchHistorialMantenimientos();
      setMensajeReportes({
        tipo: 'success',
        texto: activar ? 'Modo mantenimiento activado.' : 'Modo mantenimiento desactivado.',
      });
      setModalMantenimiento({ abierto: false, activar: true, mensaje: '' });
    } catch (err) {
      console.error('Error al actualizar mantenimiento:', err);
      setMensajeReportes({ tipo: 'error', texto: 'No se pudo actualizar el modo mantenimiento.' });
    } finally {
      setActivandoMantenimiento(false);
    }
  }, [activandoMantenimiento, modalMantenimiento, fetchMantenimiento, fetchHistorialMantenimientos]);

  const toggleMantenimiento = useCallback(() => {
    if (activandoMantenimiento) return;
    const activar = !mantenimiento?.activo;
    abrirModalMantenimiento(activar);
  }, [activandoMantenimiento, mantenimiento, abrirModalMantenimiento]);

  const estadosDisponibles = useMemo(
    () => (estadosReportes.length ? estadosReportes : ESTADOS_REPORTE_FALLBACK),
    [estadosReportes],
  );

  const categoriasDisponibles = useMemo(
    () => categoriasReportes,
    [categoriasReportes],
  );

  const rolesUsuariosDisponibles = useMemo(() => {
    const roles = Array.isArray(catalogosUsuarios?.roles) ? catalogosUsuarios.roles : [];
    return roles.length ? roles : ['admin', 'soporte', 'usuario'];
  }, [catalogosUsuarios]);

  const estadosUsuariosDisponibles = useMemo(() => {
    const estados = Array.isArray(catalogosUsuarios?.estados) ? catalogosUsuarios.estados : [];
    return estados.length ? estados : ['activo', 'inactivo', 'suspendido'];
  }, [catalogosUsuarios]);

  const usuariosQuery = useMemo(() => {
    const params = {
      limit: usuariosLimit,
      offset: usuariosOffset,
    };
    const termino = busquedaUsuarios.trim();
    if (termino) params.search = termino;
    if (rolFiltroUsuarios !== 'todos') params.rol = rolFiltroUsuarios;
    if (estadoFiltroUsuarios !== 'todos') params.estado = estadoFiltroUsuarios;
    return params;
  }, [busquedaUsuarios, rolFiltroUsuarios, estadoFiltroUsuarios, usuariosLimit, usuariosOffset]);

  const fetchCatalogosUsuarios = useCallback(async () => {
    try {
      const data = await obtenerCatalogosUsuariosAdmin();
      const roles = Array.isArray(data?.roles) ? data.roles : [];
      const estados = Array.isArray(data?.estados) ? data.estados : [];
      setCatalogosUsuarios({ roles, estados });
    } catch (error) {
      console.error('Error al obtener catalogos de usuarios admin', error);
    }
  }, []);

  const fetchUsuarios = useCallback(async () => {
    setCargandoUsuarios(true);
    setErrorUsuarios('');
    try {
      const data = await obtenerUsuariosAdmin(usuariosQuery);
      const lista = Array.isArray(data?.usuarios)
        ? data.usuarios
        : Array.isArray(data)
          ? data
          : [];
      const total = Number.isFinite(data?.total) ? data.total : lista.length;
      const limit = Number.isFinite(data?.limit) ? data.limit : usuariosQuery.limit;
      const offset = Number.isFinite(data?.offset) ? data.offset : usuariosQuery.offset;

      if (total > 0 && offset >= total && offset !== 0) {
        const ultimoOffsetDisponible = Math.max(0, Math.floor((total - 1) / limit) * limit);
        if (ultimoOffsetDisponible !== offset) {
          setUsuariosTotal(total);
          setUsuariosPaginacion((prev) => ({ ...prev, offset: ultimoOffsetDisponible }));
          setCargandoUsuarios(false);
          return;
        }
      }

      setUsuarios(lista);
      setUsuariosTotal(total);
      setUsuariosPaginacion((prev) =>
        prev.limit === limit && prev.offset === offset ? prev : { limit, offset },
      );
    } catch (error) {
      console.error('Error al obtener usuarios admin', error);
      const mensaje =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'No fue posible cargar los usuarios.';
      setErrorUsuarios(mensaje);
      setUsuarios([]);
      setUsuariosTotal(0);
    } finally {
      setCargandoUsuarios(false);
    }
  }, [usuariosQuery]);

  const refrescarPanel = useCallback(async () => {
    await Promise.allSettled([fetchDashboard(), fetchUsuarios(), fetchReportes()]);
  }, [fetchDashboard, fetchUsuarios, fetchReportes]);

  const fetchUsuarioDetalle = useCallback(async (usuarioId) => {
    if (!usuarioId) return;
    setCargandoDetalleUsuario(true);
    setErrorDetalleUsuario('');
    try {
      const data = await obtenerUsuarioDetalleAdmin(usuarioId);
      setUsuarioDetalle(data || null);
    } catch (error) {
      console.error('Error al obtener detalle del usuario admin', error);
      const mensaje =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'No fue posible cargar el detalle del usuario.';
      setErrorDetalleUsuario(mensaje);
      setUsuarioDetalle(null);
    } finally {
      setCargandoDetalleUsuario(false);
    }
  }, []);

  const fetchPresentacionesUsuarioDetalle = useCallback(
    async (usuarioId, overrides = {}) => {
      if (!usuarioId) return;
      setCargandoPresentacionesUsuario(true);
      setErrorPresentacionesUsuario('');
  setMensajePresentacionesUsuario(null);
      try {
        const query = {
          limit: overrides.limit ?? historialLimit,
          offset: overrides.offset ?? historialOffset,
        };
        const data = await obtenerPresentacionesUsuarioAdmin(usuarioId, query);
        const lista = Array.isArray(data?.presentaciones)
          ? data.presentaciones
          : Array.isArray(data)
            ? data
            : [];
        const total = Number.isFinite(data?.total) ? data.total : lista.length;

        setPresentacionesUsuario(lista);
        setPresentacionesUsuarioTotal(total);
        setPresentacionesUsuarioPaginacion((prev) =>
          prev.limit === query.limit && prev.offset === query.offset ? prev : query,
        );
      } catch (error) {
        console.error('Error al obtener presentaciones del usuario admin', error);
        const mensaje =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'No fue posible obtener el historial de presentaciones.';
        setErrorPresentacionesUsuario(mensaje);
        setPresentacionesUsuario([]);
        setPresentacionesUsuarioTotal(0);
      } finally {
        setCargandoPresentacionesUsuario(false);
      }
    },
    [historialLimit, historialOffset],
  );

  const eliminarPresentacionUsuario = useCallback(
    async (presentacion) => {
      const presentacionId = obtenerIdPresentacion(presentacion);
      if (!usuarioSeleccionadoId) {
        setMensajePresentacionesUsuario({
          tipo: 'error',
          texto: 'Selecciona un usuario antes de administrar sus presentaciones.',
        });
        return;
      }
      if (!presentacionId) {
        setMensajePresentacionesUsuario({
          tipo: 'error',
          texto: 'No se pudo identificar la presentación a eliminar.',
        });
        return;
      }

      const confirmar = window.confirm('¿Eliminar esta presentación? Esta acción no se puede deshacer.');
      if (!confirmar) return;

      setMensajePresentacionesUsuario(null);
      setEliminandoPresentacionId(presentacionId);

      try {
        await eliminarPresentacion(presentacionId);

        const esUltimoEnPagina = presentacionesUsuario.length === 1;
        const nuevoOffset = esUltimoEnPagina && historialOffset > 0 ? Math.max(historialOffset - historialLimit, 0) : historialOffset;

        await Promise.all([
          fetchPresentacionesUsuarioDetalle(usuarioSeleccionadoId, { offset: nuevoOffset }),
          fetchUsuarioDetalle(usuarioSeleccionadoId),
          fetchUsuarios(),
        ]);

        setMensajePresentacionesUsuario({
          tipo: 'success',
          texto: 'Presentación eliminada correctamente.',
        });
      } catch (error) {
        console.error('Error al eliminar presentacion como admin', error);
        const mensaje =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'No fue posible eliminar la presentación.';
        setMensajePresentacionesUsuario({ tipo: 'error', texto: mensaje });
      } finally {
        setEliminandoPresentacionId(null);
      }
    },
    [
      fetchPresentacionesUsuarioDetalle,
      fetchUsuarioDetalle,
      fetchUsuarios,
      historialLimit,
      historialOffset,
      presentacionesUsuario.length,
      usuarioSeleccionadoId,
    ],
  );

  // Re-added effects after function declarations to avoid no-use-before-define
  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  useEffect(() => {
    if (!usuarioSeleccionadoId) return;
    fetchUsuarioDetalle(usuarioSeleccionadoId);
  }, [fetchUsuarioDetalle, usuarioSeleccionadoId]);

  useEffect(() => {
    if (!usuarioSeleccionadoId) return;
    fetchPresentacionesUsuarioDetalle(usuarioSeleccionadoId);
  }, [fetchPresentacionesUsuarioDetalle, usuarioSeleccionadoId]);

  useEffect(() => {
    setMensajePresentacionesUsuario(null);
  }, [usuarioSeleccionadoId]);

  // Cargar datos según sección activa
  useEffect(() => {
    if (!admin) return;

    if (seccionActiva === 'mantenimiento') {
      fetchMantenimiento();
      fetchHistorialMantenimientos();
    } else if (seccionActiva === 'historial') {
      fetchHistorialReportes();
    }
  }, [admin, seccionActiva, fetchMantenimiento, fetchHistorialMantenimientos, fetchHistorialReportes]);

  // Initial admin check and initial loads (mounted once)
  useEffect(() => {
    const usuarioRaw = localStorage.getItem('usuario');
    const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;

    if (!usuario || usuario.rol !== 'admin') {
      navigate('/perfil');
      return;
    }

    setAdmin(usuario);
    fetchCatalogosUsuarios();
    fetchUsuarios();
    fetchReportes();
    fetchEstados();
    fetchDashboard();
  }, [
    fetchCatalogosUsuarios,
    fetchDashboard,
    fetchEstados,
    fetchReportes,
    fetchUsuarios,
    navigate,
  ]);

  const actualizarRolPanel = useCallback(
    async (usuarioObj, nuevoRol) => {
      const usuarioId = obtenerUsuarioId(usuarioObj);
      if (!usuarioId || !nuevoRol) return;
      if (obtenerRolUsuarioNormalizado(usuarioObj) === nuevoRol.toLowerCase()) return;

      setAccionUsuario({ id: usuarioId, tipo: 'rol' });
      try {
        const respuesta = await actualizarRolUsuarioAdmin(usuarioId, nuevoRol);
        const base = respuesta?.usuario ?? {};
        const actualizado = {
          ...usuarioObj,
          ...base,
          rol: nuevoRol,
          role: nuevoRol,
        };

        setUsuarios((prev) =>
          prev.map((item) => (obtenerUsuarioId(item) === usuarioId ? { ...item, ...actualizado } : item)),
        );
        setUsuarioDetalle((prev) =>
          prev && obtenerUsuarioId(prev) === usuarioId ? { ...prev, ...actualizado } : prev,
        );
        setMensajeUsuarios({
          tipo: 'success',
          texto: respuesta?.mensaje || 'Rol actualizado correctamente.',
        });
      } catch (error) {
        console.error('Error al actualizar rol del usuario admin', error);
        const mensaje =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'No fue posible actualizar el rol.';
        setMensajeUsuarios({ tipo: 'error', texto: mensaje });
      } finally {
        setAccionUsuario({ id: null, tipo: null });
      }
    },
    [],
  );

  const actualizarEstadoPanel = useCallback(
    async (usuarioObj, nuevoEstado) => {
      const usuarioId = obtenerUsuarioId(usuarioObj);
      if (!usuarioId || !nuevoEstado) return;
      if (obtenerEstadoUsuarioNormalizado(usuarioObj) === nuevoEstado.toLowerCase()) return;

      setAccionUsuario({ id: usuarioId, tipo: 'estado' });
      try {
        const respuesta = await actualizarEstadoUsuarioAdmin(usuarioId, nuevoEstado);
        const base = respuesta?.usuario ?? {};
        const actualizado = {
          ...usuarioObj,
          ...base,
          estado: nuevoEstado,
          status: nuevoEstado,
        };

        setUsuarios((prev) =>
          prev.map((item) => (obtenerUsuarioId(item) === usuarioId ? { ...item, ...actualizado } : item)),
        );
        setUsuarioDetalle((prev) =>
          prev && obtenerUsuarioId(prev) === usuarioId ? { ...prev, ...actualizado } : prev,
        );
        
        // Mensaje especial si se suspendió la cuenta
        let mensajeTexto = respuesta?.mensaje || 'Estado actualizado correctamente.';
        if (nuevoEstado.toLowerCase() === 'suspendido') {
          mensajeTexto = `Usuario suspendido. Su próxima petición lo redirigirá a la pantalla de cuenta suspendida.`;
        }
        
        setMensajeUsuarios({
          tipo: 'success',
          texto: mensajeTexto,
        });
        
        // Refrescar la lista de usuarios para reflejar el cambio
        fetchUsuarios();
      } catch (error) {
        console.error('Error al actualizar estado del usuario admin', error);
        const mensaje =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'No fue posible actualizar el estado.';
        setMensajeUsuarios({ tipo: 'error', texto: mensaje });
      } finally {
        setAccionUsuario({ id: null, tipo: null });
      }
    },
    [fetchUsuarios],
  );

  const eliminarUsuarioPanel = useCallback(
    async (usuarioObj) => {
      const usuarioId = obtenerUsuarioId(usuarioObj);
      if (!usuarioId) return;

      const confirmado = window.confirm(
        '¿Deseas eliminar este usuario? Esta accion eliminara tambien sus presentaciones.',
      );
      if (!confirmado) return;

      setAccionUsuario({ id: usuarioId, tipo: 'delete' });
      try {
        const respuesta = await eliminarUsuarioAdmin(usuarioId);
        setMensajeUsuarios({
          tipo: 'success',
          texto: respuesta?.mensaje || 'Usuario eliminado correctamente.',
        });

        setUsuarios((prev) => prev.filter((item) => obtenerUsuarioId(item) !== usuarioId));
        setUsuariosTotal((prev) => Math.max(0, prev - 1));

        if (usuarioSeleccionadoId && usuarioSeleccionadoId === usuarioId) {
          setUsuarioSeleccionadoId(null);
          setUsuarioDetalle(null);
          setPresentacionesUsuario([]);
          setPresentacionesUsuarioTotal(0);
        }

        if (usuariosOffset > 0 && usuarios.length <= 1) {
          const nuevoOffset = Math.max(0, usuariosOffset - usuariosLimit);
          if (nuevoOffset !== usuariosOffset) {
            setUsuariosPaginacion((prev) => ({ ...prev, offset: nuevoOffset }));
            return;
          }
        }

        await fetchUsuarios();
      } catch (error) {
        console.error('Error al eliminar usuario admin', error);
        const mensaje =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'No se pudo eliminar el usuario.';
        setMensajeUsuarios({ tipo: 'error', texto: mensaje });
      } finally {
        setAccionUsuario({ id: null, tipo: null });
      }
    },
    [fetchUsuarios, usuarioSeleccionadoId, usuarios.length, usuariosLimit, usuariosOffset],
  );

  const seleccionarUsuario = useCallback((usuarioObj) => {
    const usuarioId = obtenerUsuarioId(usuarioObj);
    if (!usuarioId) return;
    setUsuarioSeleccionadoId(usuarioId);
    setErrorDetalleUsuario('');
    setErrorPresentacionesUsuario('');
    setPresentacionesUsuario([]);
    setPresentacionesUsuarioTotal(0);
    setPresentacionesUsuarioPaginacion((prev) => (prev.offset === 0 ? prev : { ...prev, offset: 0 }));
    setUsuarioDetalle((prev) => {
      if (prev && obtenerUsuarioId(prev) === usuarioId) {
        return { ...prev, ...usuarioObj };
      }
      return usuarioObj ? { ...usuarioObj } : prev;
    });
  }, []);

  const paginaHistorialActual = historialLimit ? Math.floor(historialOffset / Math.max(1, historialLimit)) + 1 : 1;
  const totalPaginasHistorial = historialLimit
    ? Math.max(1, Math.ceil(presentacionesUsuarioTotal / Math.max(1, historialLimit)))
    : 1;
  const puedeHistorialAnterior = historialOffset > 0;
  const puedeHistorialSiguiente = historialOffset + historialLimit < presentacionesUsuarioTotal;

  const irHistorialAnterior = () => {
    if (!puedeHistorialAnterior) return;
    setPresentacionesUsuarioPaginacion((prev) => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }));
  };

  const irHistorialSiguiente = () => {
    if (!puedeHistorialSiguiente) return;
    setPresentacionesUsuarioPaginacion((prev) => ({ ...prev, offset: prev.offset + prev.limit }));
  };

  const estadoFiltroNormalizado = estadoFiltro.toString().toLowerCase();
  const busquedaReportesNormalizada = busquedaReportes.trim().toLowerCase();

  const reportesFiltrados = useMemo(
    () =>
      reportes.filter((reporte) => {
        const estadoActualKey = obtenerEstadoKey(reporte);
        const categoriaActualKey = obtenerCategoriaKey(reporte);

        if (estadoFiltro !== 'todos' && estadoActualKey !== estadoFiltroNormalizado) {
          return false;
        }

        if (categoriaFiltro !== 'todas' && categoriaActualKey !== categoriaFiltro) {
          return false;
        }

        if (!busquedaReportesNormalizada) return true;

        const campos = [
          reporte?.titulo,
          reporte?.detalle,
          reporte?.resumen,
          reporte?.descripcion,
          reporte?.mensaje,
          reporte?.categoria,
          reporte?.categoriaNombre,
          reporte?.categoria_label,
          reporte?.nombreContacto,
          reporte?.correoContacto,
          reporte?.email,
          obtenerIdReporte(reporte),
          categoriaActualKey,
          estadoActualKey,
        ];

        return campos.some(
          (campo) => campo && campo.toString().toLowerCase().includes(busquedaReportesNormalizada),
        );
      }),
    [busquedaReportesNormalizada, categoriaFiltro, estadoFiltro, estadoFiltroNormalizado, reportes],
  );

  const totalPendientes = useMemo(
    () =>
      reportes.filter((reporte) => {
        const estadoActual = obtenerEstadoKey(reporte);
        return estadoActual === 'pendiente' || estadoActual === 'abierto';
      }).length,
    [reportes],
  );

  const menuItems = useMemo(
    () => [
      { id: 'dashboard', label: 'Panel Principal', icon: DocumentChartBarIcon },
      {
        id: 'usuarios',
        label: 'Usuarios',
        icon: UserGroupIcon,
        badge: usuariosTotal || usuarios.length || null,
        badgeClass: 'bg-blue-100 text-blue-800',
      },
      {
        id: 'reportes',
        label: 'Reportes de soporte',
        icon: LifebuoyIcon,
        badge: totalPendientes || (reportes.length ? reportes.length : null),
        badgeClass: totalPendientes ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-800',
      },
      { id: 'mantenimiento', label: 'Mantenimiento', icon: CogIcon },
  { id: 'historial', label: 'Historial', icon: ClockIcon },
    ],
    [reportes.length, totalPendientes, usuarios.length, usuariosTotal],
  );

  const seccionesMetadata = {
    dashboard: {
      titulo: 'Panel Principal',
      descripcion: 'Resumen general de la actividad y uso de TEC CREATE.',
    },
    usuarios: {
      titulo: 'Gestion de Usuarios',
      descripcion: 'Administra los usuarios de TEC CREATE',
    },
    reportes: {
      titulo: 'Reportes de soporte',
      descripcion: 'Monitorea y da seguimiento a los casos reportados por la comunidad.',
    },
    mantenimiento: {
      titulo: 'Modo Mantenimiento',
      descripcion: 'Activa o desactiva el modo mantenimiento del sistema.',
    },
    historial: {
      titulo: 'Historial de Actividad',
      descripcion: 'Registro completo de acciones y cambios en reportes y mantenimiento.',
    },
  };

  const infoSeccion = seccionesMetadata[seccionActiva] || seccionesMetadata.dashboard;

  const renderAccionesHeader = () => {
    if (seccionActiva === 'dashboard') {
      return (
        <button
          onClick={fetchDashboard}
          disabled={cargandoDashboard}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <ArrowPathIcon className={`w-4 h-4 ${cargandoDashboard ? 'animate-spin' : ''}`} />
          {cargandoDashboard ? 'Actualizando...' : 'Actualizar resumen'}
        </button>
      );
    }

    if (seccionActiva === 'usuarios') {
      return (
        <button
          onClick={exportarCSV}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Exportar CSV
        </button>
      );
    }

    if (seccionActiva === 'reportes') {
      return (
        <button
          onClick={() => fetchReportes()}
          disabled={cargandoReportes}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <ArrowPathIcon className={`w-4 h-4 ${cargandoReportes ? 'animate-spin' : ''}`} />
          {cargandoReportes ? 'Actualizando...' : 'Actualizar lista'}
        </button>
      );
    }

    return null;
  };

  const renderUsuarios = () => (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-cyan-100 bg-white/80 p-6 shadow-[0_20px_60px_rgba(14,165,233,0.18)] backdrop-blur">
        <div className="pointer-events-none absolute -top-20 -left-16 h-48 w-48 rounded-full bg-cyan-300/30 blur-3xl animate-blob"></div>
        <div className="pointer-events-none absolute -bottom-24 right-0 h-60 w-60 rounded-full bg-sky-400/30 blur-[90px] animate-blob-slow"></div>
        <div className="relative space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-500 text-white shadow-lg animate-float">
                <UserGroupIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.45em] text-cyan-600">Usuarios</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Gestiona perfiles y accesos</h2>
                <p className="text-sm text-slate-600">
                  Filtra, busca y toma acciones rápidas sobre la comunidad TEC CREATE.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-cyan-700">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/60 bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.3em]">
                {formatearNumero(usuariosTotal)} usuarios
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/60 bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.3em]">
                {rolesUsuariosDisponibles.length} roles
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/60 bg-white/90 p-4 shadow-lg shadow-cyan-200/40">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-500">
                <MagnifyingGlassIcon className="h-4 w-4 text-cyan-500" />
                Búsqueda
              </div>
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-500" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o correo..."
                  value={busquedaUsuarios}
                  onChange={(e) => {
                    const { value } = e.target;
                    setUsuariosPaginacion((prev) => (prev.offset === 0 ? prev : { ...prev, offset: 0 }));
                    setBusquedaUsuarios(value);
                  }}
                  className="w-full rounded-xl border border-cyan-100 bg-white/90 pl-11 pr-4 py-2.5 text-sm text-slate-700 shadow-inner focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/90 p-4 shadow-lg shadow-cyan-200/40">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-500">
                <FunnelIcon className="h-4 w-4 text-cyan-500" />
                Rol
              </div>
              <select
                value={rolFiltroUsuarios}
                onChange={(e) => {
                  setUsuariosPaginacion((prev) => (prev.offset === 0 ? prev : { ...prev, offset: 0 }));
                  setRolFiltroUsuarios(e.target.value);
                }}
                className="w-full rounded-xl border border-cyan-100 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-200"
              >
                <option value="todos">Todos</option>
                {rolesUsuariosDisponibles.map((rol) => (
                  <option key={rol} value={rol.toString().toLowerCase()}>{toLabel(rol)}</option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/90 p-4 shadow-lg shadow-cyan-200/40">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-500">
                <FunnelIcon className="h-4 w-4 text-cyan-500" />
                Estado
              </div>
              <select
                value={estadoFiltroUsuarios}
                onChange={(e) => {
                  setUsuariosPaginacion((prev) => (prev.offset === 0 ? prev : { ...prev, offset: 0 }));
                  setEstadoFiltroUsuarios(e.target.value);
                }}
                className="w-full rounded-xl border border-cyan-100 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-200"
              >
                <option value="todos">Todos</option>
                {estadosUsuariosDisponibles.map((estado) => (
                  <option key={estado} value={estado.toString().toLowerCase()}>{toLabel(estado)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.7fr,1fr]">
  <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(8,145,178,0.18)]">
          <div className="pointer-events-none absolute -top-20 left-10 h-52 w-52 rounded-full bg-cyan-200/35 blur-3xl animate-blob"></div>
          <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-blue-200/25 blur-[120px] animate-blob-slow"></div>
          <div className="relative p-6">
            {mensajeUsuarios && (
              <div
                className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-medium shadow-inner ${
                  mensajeUsuarios.tipo === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-600'
                }`}
              >
                {mensajeUsuarios.texto}
              </div>
            )}

            {errorUsuarios ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 py-12 text-center text-rose-600">
                {errorUsuarios}
              </div>
            ) : cargandoUsuarios ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-cyan-600">
                <ArrowPathIcon className="h-6 w-6 animate-spin-slow" />
                <span>Cargando usuarios...</span>
              </div>
            ) : usuarios.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                No se encontraron usuarios con los filtros seleccionados.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/60">
                <table className="min-w-full divide-y divide-cyan-100/60">
                  <thead className="bg-gradient-to-r from-cyan-50 via-white to-sky-50 text-left text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                    <tr>
                      {['Usuario', 'Rol', 'Estado', 'Ultima actividad', 'Presentaciones'].map((header) => (
                        <th key={header} className="px-6 py-4 text-xs text-slate-500">
                          {header}
                        </th>
                      ))}
                      <th className="px-6 py-4 text-right text-xs text-slate-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-100/70">
                    {usuarios
                      .slice(paginaUsuarios * ITEMS_POR_PAGINA, (paginaUsuarios + 1) * ITEMS_POR_PAGINA)
                      .map((usuario) => {
                      const emailUsuario = obtenerUsuarioEmail(usuario);
                      const usuarioId = obtenerUsuarioId(usuario) || emailUsuario || usuario.nombre;
                      const seleccionado = usuarioSeleccionadoId && usuarioId === usuarioSeleccionadoId;
                      const rolActual = toLabel(obtenerRolUsuarioNormalizado(usuario) || usuario.rol || 'usuario');
                      const estadoActual = toLabel(obtenerEstadoUsuarioNormalizado(usuario) || usuario.estado || 'activo');
                      const ultimaActividad = obtenerUltimaActividadUsuario(usuario);
                      const ultimaPresentacion = obtenerUltimaPresentacionUsuario(usuario);
                      const totalPresentaciones = obtenerTotalPresentacionesUsuario(usuario);

                      return (
                        <tr
                          key={usuarioId}
                          className={`cursor-pointer transition-colors duration-200 ${
                            seleccionado
                              ? 'bg-cyan-50/80'
                              : 'hover:bg-cyan-50/60'
                          }`}
                          onClick={() => seleccionarUsuario(usuario)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  usuario.foto ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.nombre || 'Usuario')}`
                                }
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.nombre || 'Usuario')}`;
                                }}
                                alt={usuario.nombre}
                                className="h-10 w-10 rounded-full border border-white/80 object-cover shadow"
                              />
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{usuario.nombre || 'Sin nombre'}</p>
                                <p className="text-xs text-cyan-600 break-all">{emailUsuario || 'Sin correo'}</p>
                                <p className="text-[11px] text-slate-400">ID: {usuarioId || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-600">{rolActual}</td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                                estadoActual.toLowerCase() === 'activo'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : estadoActual.toLowerCase() === 'inactivo'
                                    ? 'bg-slate-200 text-slate-700'
                                    : estadoActual.toLowerCase() === 'suspendido'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-cyan-100 text-cyan-700'
                              }`}
                            >
                              {estadoActual}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            <div>
                              <p className="font-medium text-slate-800">
                                {ultimaActividad ? formatearFechaLarga(ultimaActividad) : 'Sin actividad reciente'}
                              </p>
                              <p className="text-xs text-slate-400">
                                Ultima presentacion: {ultimaPresentacion ? formatearFechaLarga(ultimaPresentacion) : 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                            {totalPresentaciones !== null && totalPresentaciones !== undefined
                              ? formatearNumero(totalPresentaciones)
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <select
                                value={obtenerRolUsuarioNormalizado(usuario)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => actualizarRolPanel(usuario, e.target.value)}
                                disabled={accionUsuario.id === usuarioId && accionUsuario.tipo === 'rol'}
                                className="rounded-xl border border-cyan-100 bg-white/90 px-3 py-1.5 text-xs text-slate-600 shadow-inner focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                              >
                                {rolesUsuariosDisponibles.map((rol) => {
                                  const valor = rol.toString().toLowerCase();
                                  return (
                                    <option key={rol} value={valor}>
                                      {toLabel(rol)}
                                    </option>
                                  );
                                })}
                              </select>
                              <select
                                value={obtenerEstadoUsuarioNormalizado(usuario)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => actualizarEstadoPanel(usuario, e.target.value)}
                                disabled={accionUsuario.id === usuarioId && accionUsuario.tipo === 'estado'}
                                className="rounded-xl border border-cyan-100 bg-white/90 px-3 py-1.5 text-xs text-slate-600 shadow-inner focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                              >
                                {estadosUsuariosDisponibles.map((estado) => {
                                  const valor = estado.toString().toLowerCase();
                                  return (
                                    <option key={estado} value={valor}>
                                      {toLabel(estado)}
                                    </option>
                                  );
                                })}
                              </select>
                              <button
                                type="button"
                                className="inline-flex items-center rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:-translate-y-0.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  eliminarUsuarioPanel(usuario);
                                }}
                                disabled={accionUsuario.id === usuarioId && accionUsuario.tipo === 'delete'}
                              >
                                {accionUsuario.id === usuarioId && accionUsuario.tipo === 'delete'
                                  ? 'Eliminando...'
                                  : 'Eliminar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginación de Usuarios */}
            {usuarios && usuarios.length > ITEMS_POR_PAGINA && (
              <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-cyan-50 to-sky-50 px-6 py-4 rounded-2xl border border-cyan-100/50 shadow-lg">
                <button
                  onClick={() => setPaginaUsuarios(Math.max(0, paginaUsuarios - 1))}
                  disabled={paginaUsuarios === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg hover:shadow-xl"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  Anterior
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-700">
                    Página <span className="text-cyan-600 text-lg">{paginaUsuarios + 1}</span> de{' '}
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg hover:shadow-xl"
                >
                  Siguiente
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500">
            </div>
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(59,130,246,0.18)]">
          <div className="pointer-events-none absolute -top-20 left-8 h-44 w-44 rounded-full bg-sky-200/40 blur-3xl animate-blob"></div>
          <div className="pointer-events-none absolute bottom-0 right-0 h-52 w-52 rounded-full bg-cyan-200/40 blur-[110px] animate-blob-slow"></div>
          <div className="relative space-y-5">
            <div className="flex items-center gap-3">
              <IdentificationIcon className="h-8 w-8 rounded-2xl bg-cyan-100/70 p-1.5 text-cyan-600 shadow" />
              <div>
                <h3 className="text-base font-semibold text-slate-900">Detalle del usuario</h3>
                <p className="text-xs text-slate-500">Consulta el resumen y el historial de actividades.</p>
              </div>
            </div>

            {!usuarioSeleccionadoId ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-cyan-200/70 bg-white/60 py-16 text-center text-slate-500">
                <SparklesIcon className="h-8 w-8 text-cyan-400" />
                Selecciona un usuario de la tabla para ver su detalle.
              </div>
            ) : errorDetalleUsuario ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
                {errorDetalleUsuario}
              </div>
            ) : cargandoDetalleUsuario && !usuarioDetalle ? (
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-cyan-100 bg-white/70 py-12 text-cyan-600">
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                <span>Cargando detalle...</span>
              </div>
            ) : (
              <>
                {usuarioDetalle && (
                  <div className="space-y-4 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-inner">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          usuarioDetalle.foto ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioDetalle.nombre || 'Usuario')}`
                        }
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioDetalle.nombre || 'Usuario')}`;
                        }}
                        alt={usuarioDetalle?.nombre}
                        className="h-14 w-14 rounded-full border border-white/80 object-cover shadow-lg"
                      />
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{usuarioDetalle?.nombre}</p>
                        <p className="text-sm text-cyan-600 break-all">{obtenerUsuarioEmail(usuarioDetalle) || 'Sin correo'}</p>
                        <p className="text-xs text-slate-500">
                          Registrado: {usuarioDetalle?.fechaRegistro ? formatearFechaLarga(usuarioDetalle.fechaRegistro) : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-600">Rol actual</p>
                        <p className="text-sm font-semibold text-slate-900">{toLabel(obtenerRolUsuarioNormalizado(usuarioDetalle) || usuarioDetalle?.rol || 'usuario')}</p>
                      </div>
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-emerald-600">Estado actual</p>
                        <p className="text-sm font-semibold text-slate-900">{toLabel(obtenerEstadoUsuarioNormalizado(usuarioDetalle) || usuarioDetalle?.estado || 'activo')}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-white/50 bg-white/70 p-3 text-center shadow-inner">
                        <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">Presentaciones</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {formatearNumero(
                            obtenerTotalPresentacionesUsuario(usuarioDetalle) ?? presentacionesUsuarioTotal ?? 0,
                          )}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/50 bg-white/70 p-3 text-center shadow-inner">
                        <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">Sesiones</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {formatearNumero(obtenerTotalSesionesUsuario(usuarioDetalle) ?? 0)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/50 bg-white/70 p-3 text-center shadow-inner">
                        <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">Ultima actividad</p>
                        <p className="text-xs font-semibold text-slate-800">
                          {obtenerUltimaActividadUsuario(usuarioDetalle)
                            ? formatearFechaLarga(obtenerUltimaActividadUsuario(usuarioDetalle))
                            : 'Sin registro'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-inner">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900">Historial de presentaciones</h4>
                    <span className="text-[11px] uppercase tracking-[0.35em] text-slate-400">
                      {presentacionesUsuarioTotal} totales · Pagina {paginaHistorialActual} de {totalPaginasHistorial}
                    </span>
                  </div>
                  {errorPresentacionesUsuario ? (
                    <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600">
                      {errorPresentacionesUsuario}
                    </div>
                  ) : (
                    <>
                      {mensajePresentacionesUsuario && (
                        <div
                          className={`mt-3 rounded-xl border p-3 text-xs font-medium ${
                            mensajePresentacionesUsuario.tipo === 'success'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-rose-200 bg-rose-50 text-rose-600'
                          }`}
                        >
                          {mensajePresentacionesUsuario.texto}
                        </div>
                      )}
                      {cargandoPresentacionesUsuario && presentacionesUsuario.length === 0 ? (
                        <div className="py-6 text-center text-slate-500">Cargando historial...</div>
                      ) : presentacionesUsuario.length === 0 ? (
                        <div className="py-6 text-center text-slate-500">Sin presentaciones registradas.</div>
                      ) : (
                        <ul className="mt-3 space-y-3">
                          {presentacionesUsuario.map((presentacion, index) => {
                            const presentacionId = obtenerIdPresentacion(presentacion);
                            const id = presentacionId ?? `presentacion-${index}`;
                            const titulo = presentacion?.titulo ?? presentacion?.nombre ?? `Presentacion ${index + 1}`;
                            const fecha = obtenerFechaPresentacion(presentacion);
                            const estaEliminando = presentacionId ? eliminandoPresentacionId === presentacionId : false;
                            return (
                              <li
                                key={id}
                                className="rounded-xl border border-white/70 bg-white/80 p-3 shadow-sm transition hover:bg-cyan-50/40"
                              >
                                <p className="text-sm font-semibold text-slate-900" title={titulo}>{titulo}</p>
                                <p className="text-xs text-slate-500">{fecha ? formatearFechaLarga(fecha) : 'Sin fecha'}</p>
                                <div className="mt-3 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => eliminarPresentacionUsuario(presentacion)}
                                    disabled={estaEliminando || !presentacionId}
                                    className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {estaEliminando ? 'Eliminando...' : presentacionId ? 'Eliminar' : 'ID no disponible'}
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  )}

                  <div className="mt-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                    <button
                      type="button"
                      onClick={irHistorialAnterior}
                      disabled={!puedeHistorialAnterior || cargandoPresentacionesUsuario}
                      className="inline-flex items-center rounded-full border border-cyan-200/60 bg-white/70 px-3 py-1.5 transition disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      onClick={irHistorialSiguiente}
                      disabled={!puedeHistorialSiguiente || cargandoPresentacionesUsuario}
                      className="inline-flex items-center rounded-full border border-cyan-200/60 bg-white/70 px-3 py-1.5 transition disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );

  const renderRankingSection = (titulo, items, descripcion) => {
    const lista = Array.isArray(items) ? items.slice(0, 5) : [];
    return (
      <div className="bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{titulo}</h4>
          {descripcion && <p className="text-xs text-gray-500">{descripcion}</p>}
        </div>
        {lista.length ? (
          <ul className="space-y-3">
            {lista.map((item, index) => {
              const etiqueta = resolverLabelRanking(item);
              const total = resolverTotalRanking(item);
              return (
                <li key={`${titulo}-${etiqueta}-${index}`} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700 truncate max-w-[12rem]" title={etiqueta}>
                      {etiqueta}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatearNumero(total)}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Sin datos disponibles.</p>
        )}
      </div>
    );
  };

  const renderSerieDiaria = (titulo, serie, color = 'bg-indigo-500') => {
    const datos = normalizarSerieDiaria(serie);
    const maxValor = datos.reduce((acc, item) => Math.max(acc, item.total), 0);

    return (
      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{titulo}</h4>
          <p className="text-xs text-gray-500">Ultimos 14 dias</p>
        </div>
        {datos.length ? (
          <div className="space-y-3">
            {datos.map((item) => {
              const ancho = maxValor ? `${(item.total / maxValor) * 100}%` : '0%';
              return (
                <div key={`${titulo}-${item.fecha}`} className="flex items-center gap-3">
                  <span className="w-16 text-xs text-gray-500">{formatearFechaCorta(item.fecha)}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: ancho }}></div>
                  </div>
                  <span className="w-10 text-right text-sm font-semibold text-gray-800">{item.total}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Aun no hay actividad registrada.</p>
        )}
      </div>
    );
  };

  const renderDashboard = () => {
    if (errorDashboard) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl">
          <div className="flex items-center justify-between gap-4">
            <span>{errorDashboard}</span>
            <button
              type="button"
              onClick={fetchDashboard}
              className="rounded-lg border border-red-200 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    if (cargandoDashboard && !dashboardResumen) {
      return (
        <div className="bg-white border rounded-xl p-8 text-center text-gray-500 shadow-sm">
          Cargando resumen del panel...
        </div>
      );
    }

    const totales = dashboardResumen?.totales ?? {};
    const recientes = Array.isArray(dashboardResumen?.recientes?.presentaciones)
      ? dashboardResumen.recientes.presentaciones
      : [];
    const usoIA = dashboardResumen?.usoIA ?? {};
    const actividad = dashboardResumen?.actividad ?? {};
    const soporteStats = dashboardResumen?.soporte ?? {};
    const ticketsPorAgente = Array.isArray(soporteStats?.ticketsResueltosPorAgente)
      ? soporteStats.ticketsResueltosPorAgente
      : Array.isArray(soporteStats?.tickets_resueltos_por_agente)
        ? soporteStats.tickets_resueltos_por_agente
        : [];

    // Debug: ver qué datos llegan
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AdminDashboard] soporteStats completo:', soporteStats);
      console.log('[AdminDashboard] ticketsPorAgente:', ticketsPorAgente);
    }

    const cardsTotales = [
      {
        id: 'usuarios',
        titulo: 'Usuarios totales',
        valor: formatearNumero(totales.usuarios ?? 0),
        descripcion: 'Cuentas con acceso',
        icono: UserGroupIcon,
        fondo: 'from-sky-500 to-cyan-500',
      },
      {
        id: 'presentaciones',
        titulo: 'Presentaciones creadas',
        valor: formatearNumero(totales.presentaciones ?? 0),
        descripcion: 'Documentos generados en la plataforma',
        icono: DocumentChartBarIcon,
        fondo: 'from-indigo-500 to-blue-500',
      },
    ];

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cardsTotales.map(({ id, titulo, valor, descripcion, icono: Icono, fondo }) => (
            <div key={id} className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${fondo}`}></div>
              <div className="p-6 space-y-3">
                <div className="inline-flex items-center justify-center rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Icono className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">{titulo}</p>
                  <p className="text-3xl font-bold text-gray-900">{valor}</p>
                </div>
                <p className="text-sm text-gray-500">{descripcion}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Tickets resueltos por agente</h3>
              <p className="text-sm text-gray-500">Desempeño del equipo de soporte en el período reciente.</p>
            </div>
            {cargandoDashboard && (
              <span className="text-xs text-blue-600">Actualizando…</span>
            )}
          </div>

          {ticketsPorAgente.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
              Aún no hay tickets resueltos registrados por agentes.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Agente', 'Email', 'Resueltos', 'Último resuelto'].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ticketsPorAgente.map((agente, index) => {
                    const nombre =
                      agente?.nombre ?? agente?.agente_nombre ?? agente?.displayName ?? agente?.fullName ?? 'Sin nombre';
                    const correo = agente?.email ?? agente?.correo ?? agente?.agente_email ?? 'Sin correo';
                    const total = agente?.resueltos ?? agente?.total ?? agente?.conteo ?? agente?.cantidad ?? 0;
                    const ultimo =
                      agente?.ultimo_resuelto_en ??
                      agente?.ultimoResueltoEn ??
                      agente?.ultima_resolucion ??
                      agente?.ultimaResolucion ??
                      null;

                    return (
                      <tr key={`${correo}-${index}`} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900 font-semibold">{nombre}</td>
                        <td className="px-4 py-2 text-blue-600 break-all">{correo}</td>
                        <td className="px-4 py-2 text-gray-900 font-semibold">{formatearNumero(total)}</td>
                        <td className="px-4 py-2 text-gray-500">{ultimo ? formatearFechaLarga(ultimo) : 'Sin registro'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Ultimas presentaciones</h3>
                <p className="text-sm text-gray-500">Resumen de las ultimas actividades en la plataforma.</p>
              </div>
              {cargandoDashboard && (
                <span className="text-xs text-blue-600">Actualizando...</span>
              )}
            </div>
            {recientes.length ? (
              <div className="space-y-4">
                {recientes.slice(0, 5).map((presentacion, index) => {
                  const presentaId =
                    presentacion?.id ??
                    presentacion?.presentacionId ??
                    presentacion?.presentacion_id ??
                    `presentacion-${index}`;
                  const titulo = presentacion?.titulo ?? presentacion?.nombre ?? `Presentacion ${index + 1}`;
                  const plantillaRaw =
                    presentacion?.plantilla ??
                    presentacion?.template ??
                    presentacion?.tema ??
                    null;
                  const fuenteRaw = presentacion?.fuente ?? presentacion?.font ?? null;
                  const plantillaLabel =
                    (typeof plantillaRaw === 'string'
                      ? plantillaRaw
                      : plantillaRaw?.label ?? plantillaRaw?.nombre ?? plantillaRaw?.name) || 'Sin plantilla';
                  const plantillaKey =
                    (typeof plantillaRaw === 'string'
                      ? plantillaRaw
                      : plantillaRaw?.key ?? plantillaRaw?.id ?? plantillaRaw?.slug) || 'N/A';
                  const fuenteLabel =
                    (typeof fuenteRaw === 'string'
                      ? fuenteRaw
                      : fuenteRaw?.label ?? fuenteRaw?.nombre ?? fuenteRaw?.name) || 'Sin fuente';
                  const fuenteKey =
                    (typeof fuenteRaw === 'string'
                      ? fuenteRaw
                      : fuenteRaw?.key ?? fuenteRaw?.id ?? fuenteRaw?.slug) || 'N/A';
                  const fechaCreacion = formatearFechaLarga(presentacion?.creadaEn ?? presentacion?.createdAt ?? presentacion?.fecha);

                  return (
                    <div key={presentaId} className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate" title={titulo}>
                            {titulo}
                          </p>
                          <p className="text-xs text-gray-500">{fechaCreacion}</p>
                        </div>
                        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                          ID: {presentaId}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-white border border-blue-100 p-3">
                          <p className="text-xs uppercase tracking-wide text-blue-500">Plantilla</p>
                          <p className="text-sm font-semibold text-gray-900" title={plantillaLabel}>
                            {plantillaLabel}
                          </p>
                          <p className="text-xs text-gray-500">Key: {plantillaKey}</p>
                        </div>
                        <div className="rounded-lg bg-white border border-emerald-100 p-3">
                          <p className="text-xs uppercase tracking-wide text-emerald-500">Fuente</p>
                          <p className="text-sm font-semibold text-gray-900" title={fuenteLabel}>
                            {fuenteLabel}
                          </p>
                          <p className="text-xs text-gray-500">Key: {fuenteKey}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aun no hay presentaciones recientes.</p>
            )}
          </div>

          <div className="grid gap-6">
            {renderRankingSection('Prompts frecuentes', usoIA.promptsFrecuentes, 'Consultas que mas se repiten al usar IA.')}
            {renderRankingSection('Plantillas preferidas', usoIA.plantillasPreferidas, 'Plantillas mas seleccionadas en las presentaciones.')}
            {renderRankingSection('Fuentes preferidas', usoIA.fuentesPreferidas, 'Tipografias preferidas por la comunidad.')}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {renderSerieDiaria('Presentaciones creadas por dia', actividad.presentacionesPorDia, 'bg-indigo-500')}
          {renderSerieDiaria('Usuarios registrados por dia', actividad.usuariosPorDia, 'bg-emerald-500')}
        </div>
      </div>
    );
  };

  const renderReportes = () => {
    if (errorReportes) {
      return (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-lg">
          {errorReportes}
        </div>
      );
    }

    const columnasReportes = ['Reporte', 'Detalle', 'Estado', 'Contacto', 'Creado', 'Acciones'];
    const totalReportesListado = reportesFiltrados.length;

    return (
      <div className="space-y-8">
        {mensajeReportes && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-inner ${
              mensajeReportes.tipo === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-600'
            }`}
          >
            {mensajeReportes.texto}
          </div>
        )}

        <section className="relative overflow-hidden rounded-3xl border border-rose-100 bg-white/80 p-6 shadow-[0_20px_60px_rgba(244,114,182,0.18)] backdrop-blur">
          <div className="pointer-events-none absolute -top-24 -left-14 h-48 w-48 rounded-full bg-rose-300/30 blur-3xl animate-blob"></div>
          <div className="pointer-events-none absolute -bottom-28 right-0 h-64 w-64 rounded-full bg-amber-200/35 blur-[100px] animate-blob-slow"></div>
          <div className="relative space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 text-white shadow-lg animate-float">
                  <LifebuoyIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.45em] text-rose-500">Soporte</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">Monitorea reportes críticos</h2>
                  <p className="text-sm text-slate-600">
                    Atiende tickets pendientes y coordina respuestas con tu equipo.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-rose-600">
                <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/60 bg-white/70 px-3 py-1">
                  {formatearNumero(totalReportesListado)} filtrados
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-white/70 px-3 py-1">
                  {formatearNumero(totalPendientes)} abiertos
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/60 bg-white/90 p-4 shadow-lg shadow-rose-200/40">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-500">
                  <MagnifyingGlassIcon className="h-4 w-4 text-rose-500" />
                  Búsqueda
                </div>
                <div className="relative">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-rose-400" />
                  <input
                    type="text"
                    placeholder="Buscar por categoria, contacto o detalle..."
                    value={busquedaReportes}
                    onChange={(e) => setBusquedaReportes(e.target.value)}
                    className="w-full rounded-xl border border-rose-100 bg-white/90 pl-11 pr-4 py-2.5 text-sm text-slate-700 shadow-inner focus:border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-100"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/90 p-4 shadow-lg shadow-rose-200/40">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-500">
                  <FunnelIcon className="h-4 w-4 text-rose-500" />
                  Estado
                </div>
                <select
                  value={estadoFiltro}
                  onChange={(e) => setEstadoFiltro(e.target.value)}
                  className="w-full rounded-xl border border-rose-100 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-100"
                >
                  <option value="todos">Todos</option>
                  {estadosDisponibles.map((estado) => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/90 p-4 shadow-lg shadow-rose-200/40">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-500">
                  <FunnelIcon className="h-4 w-4 text-rose-500" />
                  Categoria
                </div>
                <select
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                  className="w-full rounded-xl border border-rose-100 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-100"
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
          </div>
        </section>

  <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_60px_rgba(244,114,182,0.15)]">
          <div className="pointer-events-none absolute -top-24 left-12 h-56 w-56 rounded-full bg-rose-200/35 blur-3xl animate-blob"></div>
          <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-amber-200/35 blur-[110px] animate-blob-slow"></div>
          <div className="relative">
            {cargandoReportes ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-rose-500">
                <ArrowPathIcon className="h-6 w-6 animate-spin-slow" />
                <span>Cargando reportes...</span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-2xl border border-white/60">
                  <table className="min-w-full divide-y divide-rose-100/60">
                    <thead className="bg-gradient-to-r from-rose-50 via-white to-amber-50 text-left text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                      <tr>
                        {columnasReportes.map((header, idx) => (
                          <th
                            key={idx}
                            className={`px-6 py-4 text-xs text-slate-500 ${header === 'Acciones' ? 'text-right' : ''}`}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100/70">
                      {reportesFiltrados
                        .slice(paginaReportes * ITEMS_POR_PAGINA, (paginaReportes + 1) * ITEMS_POR_PAGINA)
                        .map((reporte, index) => {
                        const idReporte = obtenerIdReporte(reporte, index);
                        const categoriaLabel = obtenerCategoriaLabel(reporte);
                        const categoriaKey = obtenerCategoriaKey(reporte);
                        const estadosSelect = estadosDisponibles.map((estado) => {
                          const valor = estado.value ?? estado.key ?? '';
                          const valorString = valor.toString();
                          return {
                            value: valorString,
                            label: estado.label,
                            normalizado: valorString.toLowerCase(),
                          };
                        });
                        const estadoActualKey = obtenerEstadoKey(reporte);
                        const opcionActiva = estadoActualKey
                          ? estadosSelect.find((estado) => estado.normalizado === estadoActualKey)
                          : undefined;
                        const valorSelect = opcionActiva?.value || estadoActualKey || estadosSelect[0]?.value || '';
                        const estadoDisplay = reporte?.estado ?? reporte?.status ?? (estadoActualKey ? toLabel(estadoActualKey) : '');
                        const fechaReporte = obtenerFechaReporte(reporte);
                        const contactoNombre = reporte?.nombreContacto ?? reporte?.nombre ?? 'Anónimo';
                        const contactoCorreo = reporte?.correoContacto ?? reporte?.correo ?? 'Sin correo';
                        const resumenVisible =
                          reporte?.resumen ||
                          reporte?.detalle ||
                          reporte?.titulo ||
                          'Sin resumen';
                        const mensajeVisible =
                          reporte?.mensaje ||
                          reporte?.descripcion ||
                          reporte?.detalle ||
                          'Sin descripción';

                        return (
                          <tr key={idReporte} className="align-top transition hover:bg-rose-50/60">
                            <td className="px-6 py-4 text-sm text-slate-900">
                              <div className="font-semibold text-rose-600">{categoriaLabel}</div>
                              <div className="text-xs text-slate-500">ID: {idReporte}</div>
                              <div className="text-[11px] text-slate-400">Categoria key: {categoriaKey || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700">
                              <div className="mb-2 font-semibold text-slate-900">{acortar(resumenVisible, 80)}</div>
                              <p className="text-sm leading-relaxed text-slate-500 whitespace-pre-line">
                                {acortar(mensajeVisible, 160)}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700">
                              <select
                                value={valorSelect}
                                onChange={(e) => gestionarEstadoReporte(reporte, e.target.value, index)}
                                disabled={actualizandoReporteId === idReporte}
                                className="w-full rounded-xl border border-rose-100 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-600 shadow-inner focus:border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {estadosSelect.map((estado) => (
                                  <option key={estado.value} value={estado.value}>
                                    {estado.label}
                                  </option>
                                ))}
                              </select>
                              {actualizandoReporteId === idReporte && (
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-rose-500">
                                  Actualizando...
                                </p>
                              )}
                              <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-slate-400">
                                Estado actual: {estadoDisplay || 'Sin estado'}
                                {estadoActualKey ? ` (${estadoActualKey})` : ''}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700">
                              <div className="font-semibold text-slate-900">{contactoNombre}</div>
                              <div className="text-xs text-rose-500 break-all">{contactoCorreo}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {fechaReporte ? new Date(fechaReporte).toLocaleString('es-ES') : 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => abrirComentarios(reporte, index)}
                                  className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:-translate-y-0.5"
                                  title="Ver comentarios"
                                >
                                  <ChatBubbleOvalLeftEllipsisIcon className="h-4 w-4" />
                                  Comentarios
                                </button>
                                <button
                                  type="button"
                                  onClick={() => eliminarReporte(reporte, index)}
                                  disabled={eliminandoReporteId === idReporte}
                                  className="inline-flex items-center rounded-full border border-rose-300 bg-white/80 px-4 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {eliminandoReporteId === idReporte ? 'Eliminando...' : 'Eliminar'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {reportesFiltrados.length === 0 && (
                  <div className="py-10 text-center text-slate-500">
                    No se encontraron reportes con los filtros aplicados.
                  </div>
                )}

                {/* Paginación de Reportes */}
                {reportesFiltrados && reportesFiltrados.length > ITEMS_POR_PAGINA && (
                  <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-rose-50 to-amber-50 px-6 py-4 rounded-2xl border border-rose-100/50 shadow-lg">
                    <button
                      onClick={() => setPaginaReportes(Math.max(0, paginaReportes - 1))}
                      disabled={paginaReportes === 0}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg hover:shadow-xl"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                      Anterior
                    </button>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-700">
                        Página <span className="text-rose-600 text-lg">{paginaReportes + 1}</span> de{' '}
                        <span className="text-amber-600 text-lg">{Math.ceil(reportesFiltrados.length / ITEMS_POR_PAGINA)}</span>
                      </span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      <span className="text-xs text-gray-600 bg-white px-3 py-1.5 rounded-full font-semibold">
                        {reportesFiltrados.length} reportes
                      </span>
                    </div>

                    <button
                      onClick={() => setPaginaReportes(Math.min(Math.ceil(reportesFiltrados.length / ITEMS_POR_PAGINA) - 1, paginaReportes + 1))}
                      disabled={paginaReportes >= Math.ceil(reportesFiltrados.length / ITEMS_POR_PAGINA) - 1}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl"
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

        <div className="text-center text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
        </div>
      </div>
    );
  };

  const renderMantenimiento = () => (
    <div className="space-y-8">
  <section className="relative overflow-hidden rounded-3xl border border-amber-100 bg-white/80 p-6 shadow-[0_20px_60px_rgba(251,191,36,0.16)] backdrop-blur">
        <div className="pointer-events-none absolute -top-24 -left-16 h-48 w-48 rounded-full bg-amber-200/40 blur-3xl animate-blob"></div>
        <div className="pointer-events-none absolute -bottom-28 right-0 h-60 w-60 rounded-full bg-emerald-200/35 blur-[100px] animate-blob-slow"></div>
        <div className="relative space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-400 to-emerald-400 text-white shadow-lg animate-float">
                <WrenchScrewdriverIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.45em] text-amber-500">Mantenimiento</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Administra ventanas de servicio</h2>
                <p className="text-sm text-slate-600">
                  Activa mensajes personalizados y coordina intervenciones sin perder visibilidad.
                </p>
              </div>
            </div>
            {cargandoMantenimiento && (
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-amber-600">
                <ArrowPathIcon className="h-4 w-4 animate-spin-slow" />
                Actualizando
              </span>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
            <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-inner">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Estado actual</p>
                  <p
                    className={`text-3xl font-black tracking-tight ${
                      mantenimiento?.activo ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  >
                    {mantenimiento?.activo ? 'MODO ACTIVO' : 'MODO DESACTIVADO'}
                  </p>
                  {mantenimiento?.mensaje && (
                    <p className="mt-2 text-sm text-slate-600">Mensaje mostrado: {mantenimiento.mensaje}</p>
                  )}
                </div>
                <button
                  onClick={toggleMantenimiento}
                  disabled={activandoMantenimiento}
                  className={`group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
                    mantenimiento?.activo
                      ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500'
                      : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500'
                  }`}
                >
                  {activandoMantenimiento ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <ShieldCheckIcon className="h-5 w-5" />
                      {mantenimiento?.activo ? 'Desactivar modo' : 'Activar modo'}
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/50 bg-white/70 p-4 shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">Activado por</p>
                  <p className="text-sm font-semibold text-slate-800">{mantenimiento?.activado_por || 'N/A'}</p>
                </div>
                <div className="rounded-xl border border-white/50 bg-white/70 p-4 shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">Fecha</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {mantenimiento?.fecha_activacion ? formatearFechaLarga(mantenimiento.fecha_activacion) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Recordatorio</p>
              <p className="mt-2 text-sm text-slate-600">
                Informa al equipo antes de activar el modo mantenimiento y comparte el mensaje que verán los usuarios.
              </p>
              <p className="mt-4 rounded-xl border border-amber-200/60 bg-amber-50/70 px-3 py-3 text-xs text-amber-600">
                Las activaciones quedan registradas automáticamente en el historial para auditoría y seguimiento.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(59,130,246,0.15)]">
        <div className="pointer-events-none absolute -top-20 left-8 h-48 w-48 rounded-full bg-sky-200/35 blur-3xl animate-blob"></div>
        <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-emerald-200/35 blur-[110px] animate-blob-slow"></div>
        <div className="relative">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-slate-900">Historial de activaciones</h4>
            <span className="text-[11px] uppercase tracking-[0.35em] text-slate-400">
              {historialMantenimientos.length} registros
            </span>
          </div>
          {cargandoHistorial ? (
            <div className="py-10 text-center text-slate-500">Cargando historial...</div>
          ) : historialMantenimientos.length === 0 ? (
            <div className="py-10 text-center text-slate-500">No hay historial disponible.</div>
          ) : (
            <>
              <div className="space-y-4">
                {historialMantenimientos
                  .slice(paginaMantenimiento * ITEMS_POR_PAGINA, (paginaMantenimiento + 1) * ITEMS_POR_PAGINA)
                  .map((item, idx) => {
                const accionText = item?.activo === true ? 'Modo mantenimiento activado' : 'Modo mantenimiento desactivado';
                const resumen = item?.mensaje || item?.detalle || 'Sin mensaje configurado';
                const agente = item?.activado_por || item?.soporte_email || 'N/A';
                const fechaRaw = item?.fecha_activacion || item?.fecha || item?.created_at || item?.createdAt || null;
                const accent = item?.activo ? 'from-amber-500 via-orange-400 to-rose-400' : 'from-emerald-500 via-teal-400 to-sky-400';

                return (
                  <div
                    key={idx}
                    className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm"
                  >
                    <div className={`pointer-events-none absolute inset-y-0 left-0 w-1 rounded-full bg-gradient-to-b ${accent}`}></div>
                    <div className="relative ml-3 flex flex-col gap-2">
                      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                        <p className="text-sm font-semibold text-slate-900">{accionText}</p>
                        <span className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                          {fechaRaw ? formatearFechaLarga(fechaRaw) : 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{resumen}</p>
                      <p className="text-xs text-slate-400">Registrado por: {agente}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginación de Mantenimiento */}
            {historialMantenimientos && historialMantenimientos.length > ITEMS_POR_PAGINA && (
              <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-amber-50 to-emerald-50 px-6 py-4 rounded-2xl border border-amber-100/50 shadow-lg">
                <button
                  onClick={() => setPaginaMantenimiento(Math.max(0, paginaMantenimiento - 1))}
                  disabled={paginaMantenimiento === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  Anterior
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-700">
                    Página <span className="text-amber-600 text-lg">{paginaMantenimiento + 1}</span> de{' '}
                    <span className="text-emerald-600 text-lg">{Math.ceil(historialMantenimientos.length / ITEMS_POR_PAGINA)}</span>
                  </span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <span className="text-xs text-gray-600 bg-white px-3 py-1.5 rounded-full font-semibold">
                    {historialMantenimientos.length} registros
                  </span>
                </div>

                <button
                  onClick={() => setPaginaMantenimiento(Math.min(Math.ceil(historialMantenimientos.length / ITEMS_POR_PAGINA) - 1, paginaMantenimiento + 1))}
                  disabled={paginaMantenimiento >= Math.ceil(historialMantenimientos.length / ITEMS_POR_PAGINA) - 1}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl"
                >
                  Siguiente
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}
            </>
          )}
        </div>
      </section>
    </div>
  );

  const renderHistorial = () => (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white/80 p-6 shadow-[0_20px_60px_rgba(79,70,229,0.15)] backdrop-blur">
        <div className="pointer-events-none absolute -top-24 -left-20 h-52 w-52 rounded-full bg-indigo-300/30 blur-3xl animate-blob"></div>
        <div className="pointer-events-none absolute -bottom-24 right-0 h-60 w-60 rounded-full bg-sky-200/30 blur-[100px] animate-blob-slow"></div>
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-sky-500 text-white shadow-lg animate-float">
              <ClockIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-indigo-500">Historial</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Bitácora de acciones de soporte</h2>
              <p className="text-sm text-slate-600">
                Visualiza cada interacción registrada para mantener el seguimiento transparente.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-600">
            {historialReportes.length} eventos
          </span>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(99,102,241,0.15)]">
        <div className="pointer-events-none absolute -top-16 left-8 h-44 w-44 rounded-full bg-indigo-200/35 blur-3xl animate-blob"></div>
        <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-sky-200/35 blur-[110px] animate-blob-slow"></div>
        <div className="relative">
          {cargandoHistorial ? (
            <div className="py-10 text-center text-slate-500">Cargando historial...</div>
          ) : historialReportes.length === 0 ? (
            <div className="py-10 text-center text-slate-500">No hay historial de acciones.</div>
          ) : (
            <>
              <div className="space-y-4">
                {historialReportes
                  .slice(paginaHistorial * ITEMS_POR_PAGINA, (paginaHistorial + 1) * ITEMS_POR_PAGINA)
                  .map((item, idx) => {
                const descripcion = item.detalle || 'Sin detalles';
                const autor = item.soporte_email || 'N/A';
                const fecha = item.fecha ? formatearFechaLarga(item.fecha) : 'N/A';

                return (
                  <div
                    key={`${item.accion}-${idx}`}
                    className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm"
                  >
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-full bg-gradient-to-b from-indigo-500 via-blue-500 to-sky-500"></div>
                    <div className="relative ml-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{item.accion || 'Acción'}</p>
                        <p className="text-sm text-slate-600">{descripcion}</p>
                        <p className="text-xs text-slate-400">Realizado por: {autor}</p>
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">
                        {fecha}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginación de Historial */}
            {historialReportes && historialReportes.length > ITEMS_POR_PAGINA && (
              <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-sky-50 px-6 py-4 rounded-2xl border border-indigo-100/50 shadow-lg">
                <button
                  onClick={() => setPaginaHistorial(Math.max(0, paginaHistorial - 1))}
                  disabled={paginaHistorial === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg hover:shadow-xl"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  Anterior
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-700">
                    Página <span className="text-indigo-600 text-lg">{paginaHistorial + 1}</span> de{' '}
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-xl"
                >
                  Siguiente
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}
            </>
          )}
        </div>
      </section>
    </div>
  );

  const renderHeroBanner = () => {
    const totalUsuariosHero = formatearNumero(
      dashboardResumen?.totales?.usuarios ?? usuariosTotal ?? usuarios.length,
    );
    const totalPresentacionesHero = formatearNumero(
      dashboardResumen?.totales?.presentaciones ?? dashboardResumen?.totales?.docs ?? 0,
    );
    const reportesPendientesHero = formatearNumero(totalPendientes);
    const ultimaActualizacion =
      dashboardResumen?.actualizado_en ?? dashboardResumen?.actualizadoEn ?? null;
    const actualizacionTexto = ultimaActualizacion
      ? `Actualizado: ${formatearFechaLarga(ultimaActualizacion)}`
      : 'Sincronizado en vivo con tus últimos datos';

    const heroStats = [
      {
        id: 'stats-usuarios',
        icon: UserGroupIcon,
        label: 'Usuarios totales',
        value: totalUsuariosHero,
        description: 'Cuentas registradas en TEC CREATE',
        gradient: 'from-sky-500 to-blue-600',
        glow: 'from-sky-400/20 via-blue-400/10 to-indigo-500/20',
      },
      {
        id: 'stats-presentaciones',
        icon: DocumentChartBarIcon,
        label: 'Presentaciones creadas',
        value: totalPresentacionesHero,
        description: 'Documentos generados por la comunidad',
        gradient: 'from-indigo-500 to-purple-600',
        glow: 'from-indigo-400/20 via-purple-400/10 to-fuchsia-500/20',
      },
      {
        id: 'stats-reportes',
        icon: LifebuoyIcon,
        label: 'Reportes abiertos',
        value: reportesPendientesHero,
        description: 'Casos pendientes de soporte',
        gradient: 'from-rose-500 to-amber-500',
        glow: 'from-rose-400/20 via-amber-400/10 to-orange-400/20',
      },
    ];

    return (
      <section className="relative mb-10 overflow-hidden rounded-3xl border border-white/60 bg-white/80 px-6 py-10 shadow-[0px_25px_60px_rgba(59,130,246,0.25)] backdrop-blur-xl lg:px-10">
        <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-br from-sky-400/40 via-indigo-400/30 to-purple-400/20 blur-3xl animate-blob"></div>
        <div className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-gradient-to-br from-blue-500/30 via-cyan-400/20 to-emerald-400/30 blur-[110px] animate-blob-slow"></div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>

        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-700">
              <SparklesIcon className="h-4 w-4 text-indigo-500" />
              Panel Ejecutivo
            </span>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Bienvenido a{' '}
              <span className="animate-text-shimmer bg-gradient-to-r from-indigo-500 via-sky-500 to-purple-500 bg-clip-text text-transparent">
                TEC CREATE Admin
              </span>
            </h1>
            <p className="text-base leading-relaxed text-slate-600 md:text-lg">
              Gestiona usuarios, monitorea reportes y consulta métricas clave en un espacio visual renovado.
              Mantén cada interacción bajo control con información en tiempo real y accesos rápidos.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={refrescarPanel}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-transform duration-300 hover:-translate-y-1"
              >
                <ArrowPathIcon className="h-4 w-4 animate-spin-slow" />
                Sincronizar panel
              </button>
              <button
                type="button"
                onClick={() => setSeccionActiva('usuarios')}
                className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:shadow-lg"
              >
                <BoltIcon className="h-4 w-4" />
                Gestionar usuarios
              </button>
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
              {actualizacionTexto}
            </p>
          </div>

            <div className="grid w-full gap-4 sm:grid-cols-2 lg:w-auto lg:min-w-[360px] lg:grid-cols-1">
              {heroStats.map(({ id, icon: Icon, label, value, description, gradient, glow }, index) => (
                <div
                  key={id}
                  className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-5 shadow-xl transition-transform duration-300 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 0.4}s` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${glow} opacity-0 transition-opacity duration-300 group-hover:opacity-100 animate-gradient-flight`}></div>
                  <div className="relative flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-indigo-500/20 animate-float`}
                      style={{ animationDelay: `${index * 0.6}s` }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
                      <p className="text-2xl font-bold text-slate-900">{value}</p>
                      <p className="mt-1 text-xs text-slate-500">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </div>
      </section>
    );
  };

  const renderQuickActions = () => {
    const quickActions = [
      {
        id: 'accion-usuarios',
        icon: CogIcon,
        title: 'Gestiona roles y accesos',
        description: 'Actualiza permisos, estados y privilegios en segundos.',
        chip: 'Usuarios',
        highlight: `${formatearNumero(usuariosTotal)} perfiles`,
        accent: 'from-cyan-500 via-sky-500 to-blue-500',
        onClick: () => setSeccionActiva('usuarios'),
      },
      {
        id: 'accion-reportes',
        icon: ShieldCheckIcon,
        title: 'Supervisa reportes críticos',
        description: 'Toma acción inmediata sobre casos pendientes de soporte.',
        chip: 'Soporte',
        highlight: `${formatearNumero(totalPendientes)} abiertos`,
        accent: 'from-blue-500 via-cyan-500 to-emerald-500',
        onClick: () => setSeccionActiva('reportes'),
      },
      {
        id: 'accion-mantenimiento',
        icon: BoltIcon,
        title: 'Orquesta mantenimientos',
        description: 'Activa mensajes y controla las ventanas de servicio.',
        chip: mantenimiento?.activo ? 'Activo' : 'Programar',
        highlight: mantenimiento?.activo ? 'En curso' : 'Listo',
        accent: 'from-sky-500 via-indigo-500 to-purple-500',
        onClick: () => setSeccionActiva('mantenimiento'),
      },
    ];

    return (
      <section className="relative mb-10">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Accesos rápidos</h2>
            <p className="text-sm text-slate-500">
              Inicia tus flujos favoritos con tarjetas dinámicas que responden a tu contexto actual.
            </p>
          </div>
          <button
            type="button"
            onClick={refrescarPanel}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/60 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700 shadow-sm transition hover:border-cyan-400 hover:shadow-lg"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refrescar
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quickActions.map(({ id, icon: Icon, title, description, chip, highlight, accent, onClick }, index) => (
            <div
              key={id}
              className="group relative overflow-hidden rounded-3xl border border-sky-100/70 bg-white/80 p-6 shadow-lg transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
              style={{ animationDelay: `${index * 0.25}s` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition-opacity duration-500 group-hover:opacity-20 animate-gradient-flight`}></div>
              <div className="relative flex flex-col gap-5">
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-[0_12px_30px_rgba(56,189,248,0.35)] animate-float"
                    style={{ animationDelay: `${index * 0.3}s` }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-cyan-600">
                    {chip}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold text-cyan-700">
                  <span>{highlight}</span>
                  <button
                    type="button"
                    onClick={onClick}
                    className="inline-flex items-center gap-1 rounded-full bg-cyan-600/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white shadow-lg transition hover:bg-cyan-500"
                  >
                    Ir ahora
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderContenidoPrincipal = () => {
    if (seccionActiva === 'usuarios') return renderUsuarios();
    if (seccionActiva === 'reportes') return renderReportes();
    if (seccionActiva === 'dashboard') return renderDashboard();
    if (seccionActiva === 'mantenimiento') return renderMantenimiento();
    if (seccionActiva === 'historial') return renderHistorial();

    return (
      <div className="bg-white border border-dashed border-blue-200 rounded-2xl p-10 text-center text-gray-500">
        Funcionalidad en construccion. Selecciona otra seccion del menu.
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <aside className="relative w-72 lg:w-80 overflow-hidden bg-gradient-to-br from-[#071120] via-[#0891b2] to-[#38bdf8] text-white shadow-2xl">
        <div className="pointer-events-none absolute -top-28 -left-20 h-60 w-60 rounded-full bg-cyan-300/45 blur-3xl animate-blob"></div>
        <div className="pointer-events-none absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-sky-400/50 blur-[110px] animate-blob-slow"></div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/50"></div>

        <div className="relative flex min-h-full flex-col justify-between">
          <div className="border-b border-white/15 p-7 pb-6">
            <div className="flex items-center gap-3">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-white via-sky-200 to-cyan-200 text-2xl font-black text-cyan-700 shadow-[0_15px_35px_rgba(56,189,248,0.38)] animate-pulse-soft">
                <span className="tracking-tight">TC</span>
                <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-semibold text-white shadow-lg">
                  ✦
                </span>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-white/70">Tec Create</p>
                <h1 className="mt-1 text-2xl font-black leading-snug">
                  <span className="bg-gradient-to-r from-white via-sky-100 to-cyan-200 bg-clip-text text-transparent animate-text-shimmer">
                    Admin Suite
                  </span>
                </h1>
                <p className="mt-1 text-[11px] text-white/75">
                  Control absoluto con un estilo fresco, listo para tus mejores decisiones.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.35em] text-white/80">
              <SparklesIcon className="h-3.5 w-3.5 text-cyan-100" />
              Panel ejecutivo
            </div>
          </div>

          <nav className="relative flex-1 space-y-3 overflow-y-auto px-6 py-6">
            {menuItems.map(({ id, label, icon: Icon, badge, badgeClass }) => {
              const activo = seccionActiva === id;
              return (
                <button
                  key={id}
                  onClick={() => setSeccionActiva(id)}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold tracking-wide transition-all duration-200 ${
                    activo
                      ? 'bg-white/25 text-white shadow-[0_15px_35px_rgba(8,145,178,0.35)] backdrop-blur'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 transition duration-200 ${
                      activo ? 'bg-white text-cyan-600 shadow-lg' : 'group-hover:border-white/40'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${activo ? 'text-cyan-600' : 'text-white/80'}`} />
                  </span>
                  <span>{label}</span>
                  {badge !== null && badge !== undefined && (
                    <span
                      className={`ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                        badgeClass || (activo ? 'bg-white/95 text-cyan-600' : 'bg-white/20 text-white')
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {admin && (
            <div className="border-t border-white/15 bg-white/10 px-6 py-6 backdrop-blur">
              <div className="flex items-center gap-3">
                <img
                  src={admin.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.nombre)}`}
                  alt={admin.nombre}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.nombre)}`;
                  }}
                  className="h-12 w-12 rounded-full border-2 border-white/60 object-cover shadow-lg"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{admin.nombre}</p>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70">
                    Administrador
                  </span>
                </div>
                <button
                  onClick={cerrarSesion}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                  title="Cerrar sesion"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="relative flex-1 overflow-hidden px-8 py-12 lg:px-12">
        <div className="pointer-events-none absolute -top-32 right-16 h-80 w-80 rounded-full bg-cyan-200/45 blur-[120px] animate-blob"></div>
        <div className="pointer-events-none absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-sky-200/35 blur-[110px] animate-blob-slow"></div>

        <div className="relative mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{infoSeccion.titulo}</h2>
            <p className="text-gray-600">{infoSeccion.descripcion}</p>
          </div>
          {renderAccionesHeader()}
        </div>

        {seccionActiva === 'dashboard' && (
          <>
            {renderHeroBanner()}
            {renderQuickActions()}
          </>
        )}

        {renderContenidoPrincipal()}
      </main>

      {modalMantenimiento.abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-[0_30px_80px_rgba(251,191,36,0.25)]">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500"></div>
            <div className="relative p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-emerald-500 text-white shadow-lg">
                    <WrenchScrewdriverIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-500">
                      {modalMantenimiento.activar ? 'Activar' : 'Desactivar'}
                    </p>
                    <h3 className="text-lg font-bold text-slate-900">Modo mantenimiento</h3>
                    <p className="text-sm text-slate-600">
                      {modalMantenimiento.activar
                        ? 'Comparte el mensaje que verán los usuarios mientras la plataforma está en mantenimiento.'
                        : 'Confirma que deseas restaurar el servicio para todos los usuarios.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={cerrarModalMantenimiento}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  disabled={activandoMantenimiento}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-inner">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] ${
                      modalMantenimiento.activar
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-emerald-100 text-emerald-600'
                    }`}
                  >
                    <ShieldCheckIcon className="h-4 w-4" />
                    {modalMantenimiento.activar ? 'Activación' : 'Desactivación'}
                  </span>
                  {activandoMantenimiento && (
                    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      Procesando
                    </span>
                  )}
                </div>

                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Mensaje mostrado
                </label>
                <textarea
                  value={modalMantenimiento.mensaje}
                  onChange={(event) =>
                    setModalMantenimiento((prev) => ({ ...prev, mensaje: event.target.value }))
                  }
                  placeholder="Detalla el mensaje que verán los usuarios."
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:opacity-60"
                  disabled={!modalMantenimiento.activar || activandoMantenimiento}
                ></textarea>
                {modalMantenimiento.activar && (
                  <p className="text-xs text-slate-500">
                    Procura ser claro con el tiempo estimado y el motivo de la intervención para evitar confusiones.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cerrarModalMantenimiento}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
                  disabled={activandoMantenimiento}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarModalMantenimiento}
                  disabled={
                    activandoMantenimiento ||
                    (modalMantenimiento.activar && !modalMantenimiento.mensaje.trim())
                  }
                  className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60 ${
                    modalMantenimiento.activar
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500'
                      : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500'
                  }`}
                >
                  {activandoMantenimiento ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Procesando...</span>
                    </>
                  ) : (
                    <span>{modalMantenimiento.activar ? 'Confirmar activación' : 'Confirmar desactivación'}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de comentarios */}
      {reporteComentarios && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Comentarios del Reporte</h3>
                  <p className="text-sm text-gray-500">ID: {reporteComentarios.displayId}</p>
                </div>
              </div>
              <button
                onClick={cerrarComentarios}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Lista de comentarios */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cargandoComentarios ? (
                <div className="text-center py-8 text-gray-500">
                  <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto mb-2" />
                  Cargando comentarios...
                </div>
              ) : comentarios.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ChatBubbleOvalLeftEllipsisIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No hay comentarios aún</p>
                  <p className="text-sm">Sé el primero en agregar uno</p>
                </div>
              ) : (
                comentarios.map((comentario, index) => {
                  const autor = comentario.autor_nombre || comentario.autor || 'Anónimo';
                  const foto = comentario.autor_foto || comentario.foto || null;
                  const mensaje = comentario.mensaje || comentario.detalle || comentario.texto || '';
                  const tipo = (comentario.tipo || comentario.tipo_comentario || 'interno').toLowerCase();
                  const fecha = comentario.creado_en || comentario.created_at || comentario.fecha || null;

                  return (
                    <div
                      key={comentario.id || `comentario-${index}`}
                      className={`rounded-lg border p-4 ${
                        tipo === 'respuesta'
                          ? 'bg-blue-50 border-blue-200'
                          : tipo === 'nota'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={
                            foto ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(autor)}&background=random`
                          }
                          alt={autor}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(autor)}&background=random`;
                          }}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{autor}</span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  tipo === 'respuesta'
                                    ? 'bg-blue-100 text-blue-700'
                                    : tipo === 'nota'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-200 text-gray-700'
                                }`}
                              >
                                {toLabel(tipo)}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {fecha ? formatearFechaLarga(fecha) : 'Sin fecha'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{mensaje}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Formulario para agregar comentario */}
            <form onSubmit={enviarComentario} className="border-t p-6 space-y-4">
              <div className="flex gap-2">
                <select
                  value={comentarioTipo}
                  onChange={(e) => setComentarioTipo(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="interno">Interno</option>
                  <option value="respuesta">Respuesta</option>
                  <option value="nota">Nota</option>
                </select>
                <textarea
                  value={comentarioMensaje}
                  onChange={(e) => setComentarioMensaje(e.target.value)}
                  placeholder="Escribe tu comentario..."
                  rows={3}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={enviandoComentario}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cerrarComentarios}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  disabled={enviandoComentario}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviandoComentario || !comentarioMensaje.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviandoComentario ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Agregar Comentario'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
