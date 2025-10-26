import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  SparklesIcon,
  TrashIcon,
  PlusCircleIcon,
  ArrowUturnLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  obtenerPresentacionPorId,
  actualizarPresentacion,
  eliminarPresentacion,
  obtenerPlantillas,
  obtenerFuentes,
} from '../services/api';

const FALLBACK_OUTLINE = ['Nueva sección'];
const estilosDisponibles = ['Default', 'Modern', 'Minimal'];
const idiomasBase = ['Español', 'English', 'French'];
const textLengthOptions = ['Brief', 'Medium', 'Detailed'];
const slideOptions = [8, 10, 12, 14, 16];

const formatSegment = (segment, index) => {
  const cleaned = (segment || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return `Sección ${index + 1}`;
  return cleaned.length > 160 ? `${cleaned.slice(0, 157)}...` : cleaned;
};

const ensureSlideLength = (sections, count) => {
  const result = [...sections].filter(Boolean);
  while (result.length < count) {
    result.push(`Nueva sección ${result.length + 1}`);
  }
  return result.slice(0, count).map((item, index) => formatSegment(item, index));
};

const resolveFontKey = (font) => {
  if (!font) return '';
  if (typeof font === 'string' || typeof font === 'number') return font.toString();
  const key = font.key ?? font.id ?? font.slug ?? font.value ?? font.codigo ?? '';
  return key ? key.toString() : '';
};

const resolveFontName = (font) => {
  if (!font) return 'TecCreate Clásica';
  if (typeof font === 'string' || typeof font === 'number') {
    const value = font.toString();
    const normalized = value.toLowerCase();
    if (normalized === 'default' || normalized === 'teccreate') return 'TecCreate Clásica';
    return value.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }
  if (font.name) return font.name;
  if (font.title) return font.title;
  if (font.label) return font.label;
  const key = resolveFontKey(font);
  if (!key) return 'TecCreate Clásica';
  const normalized = key.toLowerCase();
  if (normalized === 'default' || normalized === 'teccreate') return 'TecCreate Clásica';
  return key.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeFontOption = (font) => {
  const key = resolveFontKey(font);
  if (!key) return null;
  return {
    key,
    name: resolveFontName(font),
    description: font?.description || font?.descripcion || font?.resumen || '',
    category: font?.category || font?.categoria || font?.familia || '',
    pairing: font?.pairing || font?.combinacion || font?.combina || '',
    cssFamily: font?.cssFamily || font?.fontFamily || font?.family || font?.fuente || '',
  };
};

const normalizeColor = (color) => {
  if (!color) return null;
  if (typeof color === 'string') return color;
  if (typeof color === 'object') return color.hex || color.value || color.codigo || color.code || null;
  return null;
};

const resolveTemplateColors = (template) => {
  if (Array.isArray(template?.palette)) return template.palette.map(normalizeColor).filter(Boolean);
  if (Array.isArray(template?.colors)) return template.colors.map(normalizeColor).filter(Boolean);
  if (Array.isArray(template?.colores)) return template.colores.map(normalizeColor).filter(Boolean);
  return [];
};

const resolveTemplateKey = (template) => {
  if (!template) return '';
  if (typeof template === 'string' || typeof template === 'number') return template.toString();
  const key = template.key ?? template.id ?? template.slug ?? template.value ?? template.codigo ?? '';
  return key ? key.toString() : '';
};

const resolveTemplateName = (template) => {
  if (template?.name) return template.name;
  if (template?.title) return template.title;
  if (template?.label) return template.label;
  if (template?.displayName) return template.displayName;
  const fallback = template?.key || template?.slug || template?.id || template?.value || template?.codigo;
  if (typeof fallback === 'string') {
    if (fallback.toLowerCase() === 'default') return 'TecCreate Clásico';
    return fallback.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return 'Plantilla TecCreate';
};

const resolveTemplateDescription = (template) =>
  template?.description || template?.descripcion || template?.summary || 'Plantilla optimizada para mantener coherencia visual.';

const normalizeOutline = (raw) => {
  if (!raw) return [...FALLBACK_OUTLINE];

  if (typeof raw === 'string') {
    try {
      return normalizeOutline(JSON.parse(raw));
    } catch {
      return [raw];
    }
  }

  if (Array.isArray(raw)) {
    const parsed = raw.map((item, index) => {
      if (typeof item === 'string') return item;
      if (item == null) return `Sección ${index + 1}`;
      return String(item);
    });
    return parsed.length ? parsed : [...FALLBACK_OUTLINE];
  }

  if (typeof raw === 'object' && Array.isArray(raw.outline)) {
    return normalizeOutline(raw.outline);
  }

  return [...FALLBACK_OUTLINE];
};

const sanitizeOutline = (items) =>
  items.map((item, index) => {
    const cleaned = (item || '').replace(/\s+/g, ' ').trim();
    return cleaned || `Sección ${index + 1}`;
  });

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [outline, setOutline] = useState(FALLBACK_OUTLINE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [slideTarget, setSlideTarget] = useState(1);
  const [idioma, setIdioma] = useState('English');
  const [estilo, setEstilo] = useState('Default');
  const [textLength, setTextLength] = useState('Medium');
  const [plantillas, setPlantillas] = useState([]);
  const [plantillasLoading, setPlantillasLoading] = useState(true);
  const [plantillasError, setPlantillasError] = useState('');
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState('');
  const [plantillaDefaultKey, setPlantillaDefaultKey] = useState('');
  const [fuentes, setFuentes] = useState([]);
  const [fuentesLoading, setFuentesLoading] = useState(true);
  const [fuentesError, setFuentesError] = useState('');
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState('');
  const [fuenteDefaultKey, setFuenteDefaultKey] = useState('');
  const plantillaInicialRef = useRef('');
  const fuenteInicialRef = useRef('');

  useEffect(() => {
    const fetchPresentacion = async () => {
      try {
        const data = await obtenerPresentacionPorId(id);
        setTitulo(data?.titulo || '');

        const contenido = normalizeOutline(data?.contenido);
        setOutline(contenido);
        setSlideTarget(contenido.length || 1);

        const idiomaRecibido = data?.idioma || 'English';
        setIdioma(idiomaRecibido);

        const estiloRecibido = data?.estilo || 'Default';
        setEstilo(estiloRecibido);

        const detalleRaw = data?.detalle || data?.nivel_detalle || '';
        const detalleNormalizado = textLengthOptions.includes(detalleRaw) ? detalleRaw : 'Medium';
        setTextLength(detalleNormalizado);

        const plantillaKey = resolveTemplateKey(data?.plantilla);
        if (plantillaKey) {
          plantillaInicialRef.current = plantillaKey;
          setPlantillaSeleccionada(plantillaKey);
        }

        const fuenteKey = resolveFontKey(data?.fuente);
        if (fuenteKey) {
          fuenteInicialRef.current = fuenteKey;
          setFuenteSeleccionada(fuenteKey);
        }
      } catch (err) {
        console.error(err);
        alert('No se pudo cargar la presentación');
        navigate('/perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchPresentacion();
  }, [id, navigate]);

  useEffect(() => {
    let isMounted = true;
    const fetchCatalogos = async () => {
      try {
        setPlantillasLoading(true);
        setFuentesLoading(true);
        setPlantillasError('');
        setFuentesError('');

        const [plantillasResult, fuentesResult] = await Promise.allSettled([
          obtenerPlantillas(),
          obtenerFuentes(),
        ]);

        if (!isMounted) return;

        if (plantillasResult.status === 'fulfilled') {
          const data = plantillasResult.value;
          const templates = Array.isArray(data?.templates) ? data.templates : [];
          setPlantillas(templates);
          const fallback = resolveTemplateKey(data?.default) || resolveTemplateKey(templates[0]) || '';
          setPlantillaDefaultKey(fallback);
          setPlantillaSeleccionada((prev) => {
            if (prev) return prev;
            if (plantillaInicialRef.current) return plantillaInicialRef.current;
            return fallback;
          });
        } else {
          console.error('No se pudo cargar el catálogo de plantillas', plantillasResult.reason);
          setPlantillas([]);
          setPlantillasError('No pudimos cargar las plantillas en este momento. Usa TecCreate Clásico mientras tanto.');
          setPlantillaDefaultKey('');
        }

        if (fuentesResult.status === 'fulfilled') {
          const payload = fuentesResult.value || {};
          let fonts = [];
          if (Array.isArray(payload)) {
            fonts = payload;
          } else if (Array.isArray(payload?.fonts)) {
            fonts = payload.fonts;
          } else if (Array.isArray(payload?.fuentes)) {
            fonts = payload.fuentes;
          }
          setFuentes(fonts);
          const fallbackFont = resolveFontKey(payload?.default || payload?.porDefecto || payload?.predeterminada) || resolveFontKey(fonts[0]) || '';
          setFuenteDefaultKey(fallbackFont);
          setFuenteSeleccionada((prev) => {
            if (prev) return prev;
            if (fuenteInicialRef.current) return fuenteInicialRef.current;
            return '';
          });
        } else {
          console.error('No se pudo cargar el catálogo de fuentes', fuentesResult.reason);
          setFuentes([]);
          setFuentesError('No pudimos cargar las fuentes. Mantendremos la tipografía predeterminada.');
          setFuenteDefaultKey('');
        }
      } catch (err) {
        console.error('Error al cargar catálogos de plantillas o fuentes', err);
        if (!isMounted) return;
        setPlantillas([]);
        setFuentes([]);
        setPlantillasError('Tuvimos problemas para cargar las plantillas.');
        setFuentesError('Tuvimos problemas para cargar las fuentes.');
        setPlantillaDefaultKey('');
        setFuenteDefaultKey('');
      } finally {
        if (isMounted) {
          setPlantillasLoading(false);
          setFuentesLoading(false);
        }
      }
    };

    fetchCatalogos();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalSlides = outline.length;
  const slidesLabel = totalSlides === 1 ? 'diapositiva' : 'diapositivas';

  const outlinePreview = useMemo(() => sanitizeOutline(outline).slice(0, 3).join(' • '), [outline]);
  const idiomaOptions = useMemo(() => {
    const set = new Set(idiomasBase);
    if (idioma) set.add(idioma);
    return Array.from(set);
  }, [idioma]);

  const plantillaActiva = useMemo(() => {
    const key = (plantillaSeleccionada || plantillaDefaultKey || '').toString();
    if (!key) return null;
    const normalized = key.toLowerCase();
    const match = plantillas.find((tpl) => resolveTemplateKey(tpl).toLowerCase() === normalized);
    if (match) return match;
    return { key, name: resolveTemplateName({ key }) };
  }, [plantillaSeleccionada, plantillaDefaultKey, plantillas]);

  const activeTemplateColors = useMemo(
    () => (plantillaActiva ? resolveTemplateColors(plantillaActiva).slice(0, 4) : []),
    [plantillaActiva],
  );

  const plantillaDescripcionActiva = useMemo(
    () => (plantillaActiva ? resolveTemplateDescription(plantillaActiva) : ''),
    [plantillaActiva],
  );

  const fuentesNormalizadas = useMemo(() => {
    const seen = new Set();
    const list = [];
    fuentes.forEach((font) => {
      const normalized = normalizeFontOption(font);
      if (!normalized) return;
      const key = normalized.key.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      list.push(normalized);
    });
    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [fuentes]);

  const fuenteActiva = useMemo(() => {
    const key = (fuenteSeleccionada || fuenteDefaultKey || '').toString();
    if (!key) return null;
    const normalized = key.toLowerCase();
    const match = fuentesNormalizadas.find((font) => font.key.toLowerCase() === normalized);
    if (match) return match;
    return {
      key,
      name: resolveFontName(key),
      description: 'Usaremos la tipografía predeterminada de TecCreate.',
      category: '',
      pairing: '',
      cssFamily: '',
    };
  }, [fuenteSeleccionada, fuenteDefaultKey, fuentesNormalizadas]);

  const defaultFontLabel = useMemo(() => resolveFontName(fuenteDefaultKey || 'TecCreate'), [fuenteDefaultKey]);
  const slideSelectOptions = useMemo(() => {
    const set = new Set(slideOptions);
    if (slideTarget > 0) set.add(slideTarget);
    if (outline.length > 0) set.add(outline.length);
    return Array.from(set).sort((a, b) => a - b);
  }, [outline.length, slideTarget]);
  const plantillaOpciones = useMemo(() => {
    const list = [...plantillas];
    const selectedKey = (plantillaSeleccionada || plantillaDefaultKey || '').toString();
    if (selectedKey) {
      const exists = list.some((tpl) => resolveTemplateKey(tpl).toLowerCase() === selectedKey.toLowerCase());
      if (!exists) {
        list.push({ key: selectedKey });
      }
    }
    return list;
  }, [plantillas, plantillaSeleccionada, plantillaDefaultKey]);
  const plantillaDefaultLabel = useMemo(() => {
    if (!plantillaDefaultKey) return 'TecCreate Clásico';
    const match = plantillas.find((tpl) => resolveTemplateKey(tpl).toLowerCase() === plantillaDefaultKey.toLowerCase());
    return resolveTemplateName(match || { key: plantillaDefaultKey });
  }, [plantillas, plantillaDefaultKey]);

  const handleOutlineChange = (index, value) => {
    setOutline((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleRemoveSlide = (index) => {
    setOutline((prev) => {
      if (prev.length === 1) {
        setSlideTarget(1);
        return [...FALLBACK_OUTLINE];
      }
      const next = prev.filter((_, i) => i !== index);
      setSlideTarget(next.length);
      return next;
    });
  };

  const handleAddSlide = () => {
    setOutline((prev) => {
      const next = [...prev, `Nueva sección ${prev.length + 1}`];
      setSlideTarget(next.length);
      return next;
    });
  };

  const handleSlideTargetSelect = (value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed <= 0) return;
    setSlideTarget(parsed);
    setOutline((prev) => ensureSlideLength(sanitizeOutline(prev), parsed));
  };

  const handleGuardarCambios = async () => {
    if (!titulo.trim()) {
      alert('El título no puede estar vacío');
      return;
    }

    setSaving(true);
    setStatus({ type: null, message: '' });

    try {
      const sanitized = sanitizeOutline(outline);
      const plantillaKey = (plantillaSeleccionada || plantillaDefaultKey || 'Default').toString();
      const fontKey = (fuenteSeleccionada || fuenteDefaultKey || '').toString().trim();
      const payload = {
        titulo: titulo.trim(),
        contenido: JSON.stringify(sanitized),
        idioma,
        plantilla: plantillaKey,
        estilo,
        detalle: textLength,
        nivel_detalle: textLength,
        numero_slides: sanitized.length,
      };
      if (fontKey) {
        payload.fuente = fontKey;
      }

      await actualizarPresentacion(id, payload);

    setOutline(sanitized);
    setSlideTarget(sanitized.length);
      setStatus({ type: 'success', message: 'Cambios guardados con éxito.' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Error al guardar los cambios.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async () => {
    const confirmar = window.confirm('¿Deseas eliminar esta presentación?');
    if (!confirmar) return;

    try {
      await eliminarPresentacion(id);
      alert('Presentación eliminada');
      navigate('/perfil');
    } catch (err) {
      console.error(err);
      alert('Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="bg-white/80 px-6 py-4 rounded-2xl shadow text-blue-600 font-medium">
          Cargando presentación...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-100 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold shadow-sm">
            <SparklesIcon className="w-5 h-5" />
            Editor asistido
          </span>
          <h1 className="text-4xl font-bold text-gray-900">Refina tu presentación</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Ajusta el contenido de tus diapositivas con una experiencia profesional. Actualmente tienes {totalSlides} {slidesLabel} en esta presentación.
          </p>
        </header>

        {!!status.message && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-sm text-sm font-medium ${
              status.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        <section className="bg-white/80 backdrop-blur border border-blue-100 shadow-xl rounded-3xl p-8 space-y-10">
          <div className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
            <div className="space-y-3">
              <label htmlFor="titulo" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Título de la presentación
              </label>
              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ingresa un título memorable"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-800 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="space-y-5">
              <div className="space-y-4 rounded-3xl border border-blue-100 bg-white px-5 py-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-[0.3em]">Configuración rápida</h2>
                    <p className="text-xs text-blue-500/70">Ajusta al instante</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-500">
                    Editor TecCreate
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-blue-500/80">Número de slides</label>
                    <select
                      value={slideTarget}
                      onChange={(e) => handleSlideTargetSelect(e.target.value)}
                      className="w-full rounded-xl border border-blue-100 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      {slideSelectOptions.map((option) => (
                        <option key={option} value={option}>
                          {option} diapositivas
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-blue-500/80">Estilo</label>
                    <select
                      value={estilo}
                      onChange={(e) => setEstilo(e.target.value)}
                      className="w-full rounded-xl border border-blue-100 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      {estilosDisponibles.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-blue-500/80">Idioma</label>
                    <select
                      value={idioma}
                      onChange={(e) => setIdioma(e.target.value)}
                      className="w-full rounded-xl border border-blue-100 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      {idiomaOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-blue-500/80">Fuente tipográfica</label>
                    {fuentesLoading ? (
                      <div className="h-10 w-full animate-pulse rounded-xl bg-blue-50/70" />
                    ) : fuentesError ? (
                      <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
                        {fuentesError}
                      </div>
                    ) : fuentesNormalizadas.length ? (
                      <select
                        value={fuenteSeleccionada || ''}
                        onChange={(e) => setFuenteSeleccionada(e.target.value)}
                        className="w-full rounded-xl border border-blue-100 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Automático · {defaultFontLabel}</option>
                        {fuentesNormalizadas.map((font) => (
                          <option key={font.key} value={font.key}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs text-blue-500/80">
                        No hay fuentes disponibles. Usaremos la tipografía predeterminada.
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-blue-500/80">Nivel de detalle</label>
                    <div className="flex items-center gap-2">
                      {textLengthOptions.map((option) => {
                        const isActive = textLength === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setTextLength(option)}
                            className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                              isActive
                                ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-inner'
                                : 'border-blue-100 bg-white text-gray-600 hover:border-blue-200'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {plantillasLoading ? (
                    <div className="h-12 w-full animate-pulse rounded-xl bg-blue-50/70" />
                  ) : plantillasError ? (
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
                      {plantillasError}
                    </div>
                  ) : plantillaActiva ? (
                    <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-blue-400">
                        <span>Plantilla activa</span>
                        <select
                          value={plantillaSeleccionada || ''}
                          onChange={(e) => setPlantillaSeleccionada(e.target.value)}
                          className="rounded-lg border border-blue-100 bg-white px-2 py-1 text-[11px] font-semibold text-blue-600 focus:border-blue-300 focus:outline-none"
                        >
                          <option value="">Automático · {plantillaDefaultLabel}</option>
                          {plantillaOpciones.map((template, index) => {
                            const selectionKey = resolveTemplateKey(template) || `template-${index}`;
                            return (
                              <option key={selectionKey} value={selectionKey}>
                                {resolveTemplateName(template)}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <p className="text-sm font-semibold text-blue-700">{resolveTemplateName(plantillaActiva)}</p>
                      <p className="text-xs text-blue-500/80">{plantillaDescripcionActiva}</p>
                      <div className="flex items-center gap-2">
                        {activeTemplateColors.length ? (
                          activeTemplateColors.map((color, colorIndex) => (
                            <span
                              key={`editor-template-color-${colorIndex}`}
                              className="h-5 w-5 rounded-full border border-white shadow"
                              style={{ background: color }}
                            />
                          ))
                        ) : (
                          <span className="text-[11px] text-blue-400/80">Colores automáticos</span>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {fuenteActiva && (
                    <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Fuente activa</p>
                      <p className="text-sm font-semibold text-blue-700">{fuenteActiva.name}</p>
                      {fuenteActiva.category && (
                        <p className="text-xs text-blue-500/80">Familia: {fuenteActiva.category}</p>
                      )}
                      {fuenteActiva.pairing && (
                        <p className="text-xs text-blue-500/70">Sugerida con: {fuenteActiva.pairing}</p>
                      )}
                      {fuenteActiva.description && (
                        <p className="text-xs text-blue-500/70">{fuenteActiva.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-5 space-y-4">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Resumen rápido</h2>
                <p className="text-sm text-gray-500">
                  <strong className="text-blue-600">{totalSlides}</strong> {slidesLabel} activas
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {outlinePreview || 'Edita o agrega diapositivas para completar tu historia.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Diapositivas</h2>
                <p className="text-sm text-gray-500">Edita, reorganiza o elimina secciones según lo que necesites.</p>
              </div>
              <button
                type="button"
                onClick={handleAddSlide}
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm transition hover:border-blue-300 hover:-translate-y-0.5"
              >
                <PlusCircleIcon className="w-5 h-5" />
                Añadir diapositiva
              </button>
            </div>

            <div className="space-y-4">
              {outline.map((card, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm transition hover:border-blue-300"
                >
                  <div className="absolute -top-6 -left-6 h-20 w-20 rounded-full bg-blue-100/60"></div>
                  <div className="pointer-events-none absolute top-3 left-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 font-bold text-white shadow">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlide(index)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-600 transition"
                    title="Eliminar diapositiva"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                  <textarea
                    rows={3}
                    value={card}
                    onChange={(e) => handleOutlineChange(index, e.target.value)}
                    className="w-full resize-y rounded-3xl border border-transparent bg-white px-6 py-6 pl-20 text-sm text-gray-700 focus:border-blue-300 focus:outline-none focus:ring-0"
                    placeholder={`Contenido para la diapositiva ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGuardarCambios}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button
                type="button"
                onClick={handleEliminar}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-50 px-6 py-3 text-sm font-semibold text-red-600 border border-red-200 shadow-sm transition hover:bg-red-100"
              >
                Eliminar presentación
              </button>
            </div>
            <button
              type="button"
              onClick={() => navigate('/perfil')}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-semibold text-blue-600 shadow-sm transition hover:border-blue-300"
            >
              <ArrowUturnLeftIcon className="w-5 h-5" />
              Volver al panel
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
