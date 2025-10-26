// src/pages/CrearPresentacion.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  AdjustmentsHorizontalIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useLocation, useNavigate } from 'react-router-dom';
import { crearPresentacion, obtenerPlantillas, obtenerFuentes } from '../services/api';

const estilos = ['Default', 'Modern', 'Minimal'];
const idiomasBase = ['Español', 'English', 'French'];
const textLengthOptions = ['Brief', 'Medium', 'Detailed'];
const slideOptions = [8, 10, 12, 14, 16];
const FALLBACK_TOPIC = 'Tu tema principal';

const formatSegment = (segment, index) => {
  const cleaned = segment.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return `Sección ${index + 1}`;
  }
  const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return capitalized.length > 140 ? `${capitalized.slice(0, 137)}...` : capitalized;
};

const dedupeSegments = (items) => {
  const uniques = [];
  items.forEach((raw) => {
    const cleaned = raw.replace(/\s+/g, ' ').trim();
    if (!cleaned) return;
    if (uniques.some((existing) => existing.toLowerCase() === cleaned.toLowerCase())) return;
    uniques.push(cleaned);
  });
  return uniques;
};
const STOP_WORDS = new Set([
  'el', 'la', 'los', 'las', 'de', 'del', 'y', 'o', 'que', 'en', 'para', 'con', 'por', 'sobre', 'desde', 'hasta',
  'a', 'un', 'una', 'unos', 'unas', 'se', 'su', 'sus', 'al', 'lo', 'es', 'son', 'como', 'más', 'menos', 'the',
  'and', 'for', 'from', 'into', 'onto', 'about', 'of', 'to', 'in', 'on', 'by', 'an', 'or', 'at', 'this', 'that',
  'these', 'those', 'it', 'its', 'be', 'are', 'was', 'were', 'etc', 'etc.', 'u'
]);

const normalizeTopic = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return FALLBACK_TOPIC;
  const firstSegment = trimmed.split(/[.?!\n]/).find(Boolean) || trimmed;
  const cleaned = firstSegment.replace(/\s+/g, ' ').trim();
  const limited = cleaned.length > 90 ? `${cleaned.slice(0, 87)}...` : cleaned;
  return limited
    .split(' ')
    .map((word) => {
      const lower = word.toLowerCase();
      if (STOP_WORDS.has(lower)) return lower;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

const extractKeywords = (text, max = 6) => {
  const cleanedTokens = text
    .toLowerCase()
    .replace(/[^a-záéíóúüñ0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const phrases = [];
  let current = [];
  cleanedTokens.forEach((token) => {
    if (STOP_WORDS.has(token) || token.length <= 2) {
      if (current.length) {
        phrases.push(current.join(' '));
        current = [];
      }
    } else {
      current.push(token);
      if (current.length >= 3) {
        phrases.push(current.join(' '));
        current = [];
      }
    }
  });
  if (current.length) {
    phrases.push(current.join(' '));
  }

  let candidates = dedupeSegments(phrases);

  if (!candidates.length) {
    const frequency = new Map();
    cleanedTokens.forEach((token) => {
      if (token.length <= 2 || STOP_WORDS.has(token)) return;
      frequency.set(token, (frequency.get(token) || 0) + 1);
    });
    candidates = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);
  }

  return candidates
    .map((phrase) =>
      phrase
        .split(' ')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    )
    .filter(Boolean)
    .slice(0, max);
};

const BASE_STRUCTURE = [
  (topic) => `Portada y título principal: ${topic}`,
  () => 'Índice general de la presentación',
  (topic) => `Introducción al tema: ${topic}`,
  (topic) => `Contexto histórico y antecedentes de ${topic}`,
  (topic) => `Puntos clave y características principales de ${topic}`,
  (topic) => `Impacto, beneficios o relevancia de ${topic}`,
  (topic) => `Ejemplos, casos de estudio o evidencias sobre ${topic}`,
  (topic) => `Conclusiones y mensajes clave de ${topic}`,
];

const FALLBACK_STRUCTURE = [
  (topic) => `Cronograma o evolución de ${topic}`,
  (topic) => `Retos y oportunidades relacionados con ${topic}`,
  (topic) => `Recursos, herramientas o recomendaciones para profundizar en ${topic}`,
  () => 'Preguntas para la audiencia o espacio para discusión',
  () => 'Fuentes consultadas, agradecimientos y créditos finales',
];

const buildKeywordSections = (topic, keywords) =>
  keywords.map((keyword, index) => `Subtema ${index + 1}: ${keyword} en el contexto de ${topic}`);

const ensureLength = (sections, count, topic) => {
  const result = [...sections];
  let fallbackIndex = 0;
  while (result.length < count) {
    const fallbackGenerator = FALLBACK_STRUCTURE[fallbackIndex % FALLBACK_STRUCTURE.length];
    result.push(fallbackGenerator(topic));
    fallbackIndex += 1;
  }
  return result.slice(0, count);
};

const buildPromptFromNavigation = (state) => {
  if (!state) return '';
  const sections = [];
  if (state.title) sections.push(`Tema: ${state.title}`);
  if (state.description) sections.push(`Descripción: ${state.description}`);
  if (Array.isArray(state.tags) && state.tags.length) {
    sections.push(`Palabras clave: ${state.tags.join(', ')}`);
  }
  if (state.category) sections.push(`Categoría: ${state.category}`);
  if (state.topicKey) sections.push(`Referencia interna: ${state.topicKey}`);
  return sections.join('\n');
};

const resolveFontKey = (font) => {
  if (!font) return '';
  if (typeof font === 'string' || typeof font === 'number') return font.toString();
  const key = font.key ?? font.id ?? font.slug ?? font.value ?? font.codigo ?? '';
  return key ? key.toString() : '';
};

const resolveFontName = (font) => {
  if (!font) return 'Fuente TecCreate';
  if (typeof font === 'string' || typeof font === 'number') {
    const value = font.toString();
    const normalized = value.toLowerCase();
    if (normalized === 'default' || normalized === 'teccreate') {
      return 'TecCreate Clásica';
    }
    return value.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }
  if (font.name) return font.name;
  if (font.title) return font.title;
  if (font.label) return font.label;
  const key = resolveFontKey(font);
  if (!key) return 'Fuente TecCreate';
  const normalized = key.toLowerCase();
  if (normalized === 'default' || normalized === 'teccreate') {
    return 'TecCreate Clásica';
  }
  return key.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeFontOption = (font) => {
  const key = resolveFontKey(font);
  if (!key) return null;
  return {
    key,
    name: resolveFontName(font),
    description: font?.description || font?.descripcion || '',
    category: font?.category || font?.categoria || '',
    pairing: font?.pairing || font?.combinacion || font?.combina || '',
  };
};

const generateOutline = (promptText, slideCount) => {
  const trimmedPrompt = promptText.trim();
  const topic = normalizeTopic(trimmedPrompt || FALLBACK_TOPIC);
  const base = BASE_STRUCTURE.map((section) => section(topic));

  if (slideCount <= base.length) {
    return base.slice(0, slideCount).map((segment, index) => formatSegment(segment, index));
  }

  const keywords = trimmedPrompt ? extractKeywords(trimmedPrompt, slideCount) : [];
  const keywordSections = buildKeywordSections(topic, keywords);
  const combined = dedupeSegments([...base, ...keywordSections]);
  const completed = ensureLength(combined, slideCount, topic);
  return completed.map((segment, index) => formatSegment(segment, index));
};

const arraysEqual = (a, b) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export default function CrearPresentacion() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState = location.state || {};
  const promptSeed = buildPromptFromNavigation(navigationState);
  const slidesSeedRaw = Number.parseInt(navigationState.slides, 10);
  const slidesSeed = !Number.isNaN(slidesSeedRaw) && slidesSeedRaw > 0 ? slidesSeedRaw : 8;

  const [prompt, setPrompt] = useState(() => promptSeed);
  const [slides, setSlides] = useState(() => slidesSeed);
  const [estilo, setEstilo] = useState('Default');
  const [idioma, setIdioma] = useState(() => navigationState.idioma || 'English');
  const [textLength, setTextLength] = useState('Medium');
  const [outline, setOutline] = useState(() => generateOutline(promptSeed, slidesSeed));
  const [loading, setLoading] = useState(false);
  const [plantillas, setPlantillas] = useState([]);
  const [plantillasLoading, setPlantillasLoading] = useState(true);
  const [plantillasError, setPlantillasError] = useState('');
  const [plantillaDefaultKey, setPlantillaDefaultKey] = useState('');
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState('');
  const plantillaDesdeNavegacion = useMemo(() => {
    const value = navigationState.plantilla;
    return value ? value.toString() : '';
  }, [navigationState.plantilla]);
  const fuenteDesdeNavegacion = useMemo(() => {
    const value = navigationState.font || navigationState.fuente;
    return value ? value.toString() : '';
  }, [navigationState.font, navigationState.fuente]);
  const availableFontKeysFromNav = useMemo(() => {
    if (!Array.isArray(navigationState.availableFonts)) return [];
    return navigationState.availableFonts.map((value) => value.toString());
  }, [navigationState.availableFonts]);
  const [fuentes, setFuentes] = useState([]);
  const [fuentesLoading, setFuentesLoading] = useState(true);
  const [fuentesError, setFuentesError] = useState('');
  const [fuenteDefaultKey, setFuenteDefaultKey] = useState('');
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState(() => fuenteDesdeNavegacion);
  const idiomaOptions = useMemo(() => {
    const set = new Set(idiomasBase);
    if (navigationState.idioma) {
      set.add(navigationState.idioma);
    }
    return Array.from(set);
  }, [navigationState.idioma]);

  useEffect(() => {
    const generated = generateOutline(prompt, slides);
    setOutline((prev) => (arraysEqual(prev, generated) ? prev : generated));
  }, [prompt, slides]);


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
          const fallbackPlantilla =
            data?.default || (templates[0]?.key ?? templates[0]?.id ?? templates[0]?.slug ?? '');
          setPlantillaDefaultKey(fallbackPlantilla || '');
          setPlantillaSeleccionada((prev) => {
            if (plantillaDesdeNavegacion) return plantillaDesdeNavegacion;
            if (prev) return prev;
            return fallbackPlantilla || '';
          });
        } else {
          console.error('No se pudo cargar el catálogo de plantillas', plantillasResult.reason);
          setPlantillas([]);
          setPlantillasError('No pudimos cargar las plantillas en este momento. Usa TecCreate Clásico mientras tanto.');
          setPlantillaDefaultKey('');
          setPlantillaSeleccionada((prev) => (plantillaDesdeNavegacion ? plantillaDesdeNavegacion : prev));
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

          const normalizedFonts = fonts
            .map(normalizeFontOption)
            .filter(Boolean);

          const allowedSet = new Set(availableFontKeysFromNav.map((key) => key.toLowerCase()));
          const defaultFromPayload = payload?.default || payload?.porDefecto || payload?.predeterminada;

          const firstAllowed = availableFontKeysFromNav.length
            ? normalizedFonts.find((font) => allowedSet.has(font.key.toLowerCase()))
            : normalizedFonts[0];

          let fallbackFontKey = resolveFontKey(defaultFromPayload);
          if (!fallbackFontKey && firstAllowed) fallbackFontKey = firstAllowed.key;
          if (!fallbackFontKey && availableFontKeysFromNav.length) fallbackFontKey = availableFontKeysFromNav[0];

          setFuenteDefaultKey(fallbackFontKey || '');
          setFuenteSeleccionada((prev) => {
            if (fuenteDesdeNavegacion) return fuenteDesdeNavegacion;
            if (prev) return prev;
            return '';
          });
        } else {
          console.error('No se pudo cargar el catálogo de fuentes', fuentesResult.reason);
          setFuentes([]);
          setFuentesError('No pudimos cargar las fuentes tipográficas. Usaremos la fuente predeterminada de TecCreate.');
          setFuenteDefaultKey('');
          setFuenteSeleccionada((prev) => (fuenteDesdeNavegacion ? fuenteDesdeNavegacion : prev));
        }
      } catch (err) {
        console.error('Error al cargar catálogos de presentación', err);
        if (!isMounted) return;
        setPlantillas([]);
        setFuentes([]);
        setPlantillasError('Tuvimos problemas para cargar los catálogos. Intenta más tarde.');
        setFuentesError('No pudimos cargar las fuentes tipográficas. Usaremos la fuente predeterminada de TecCreate.');
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
  }, [plantillaDesdeNavegacion, fuenteDesdeNavegacion, availableFontKeysFromNav]);

  const handleOutlineChange = (index, value) => {
    setOutline((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      alert('Por favor ingresa un tema para tu presentación');
      return;
    }

    try {
      setLoading(true);
      const sanitizedOutline = outline
        .slice(0, slides)
        .map((item, index) => formatSegment(item, index));

      const plantillaKey = plantillaSeleccionada || plantillaDefaultKey || estilo;
      const fontKey = (fuenteSeleccionada || fuenteDefaultKey || '').toString().trim();

      const payload = {
        titulo: prompt.trim(),
        contenido: JSON.stringify(sanitizedOutline),
        idioma,
        plantilla: plantillaKey,
        estilo,
        detalle: textLength,
        nivel_detalle: textLength,
        numero_slides: slides,
      };

      if (fontKey) {
        payload.fuente = fontKey;
      }

      const response = await crearPresentacion(payload);
      const data = response?.data || response;
      const headers = response?.headers || {};
      const headersLower = {};
      Object.keys(headers).forEach((key) => {
        headersLower[key.toLowerCase()] = headers[key];
      });
      const presentacionId = data?.id || data?._id;
      if (presentacionId) {
        const fontFromResponse = headersLower['x-presentacion-fuente'] || data?.fuente || fontKey || fuenteDefaultKey || '';
        navigate(`/presentacion/${presentacionId}`, {
          state: {
            font: fontFromResponse,
            plantilla: plantillaKey,
            idioma,
          },
        });
      } else {
        throw new Error('No se recibió ID de presentación');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Hubo un problema al crear la presentación');
    } finally {
      setLoading(false);
    }
  };

  const totalCharacters = prompt.length;
  const topicPreview = useMemo(() => normalizeTopic(prompt || FALLBACK_TOPIC), [prompt]);
  const plantillaActiva = useMemo(() => {
    const clave = (plantillaSeleccionada || plantillaDefaultKey || '').toString();
    if (!clave) return null;
    const normalized = clave.toLowerCase();
    const match = plantillas.find((tpl) => {
      const candidatos = [tpl?.key, tpl?.id, tpl?.slug, tpl?.value, tpl?.codigo]
        .filter(Boolean)
        .map((candidate) => candidate.toString().toLowerCase());
      return candidatos.includes(normalized);
    });
    if (match) return match;
    return { key: clave, name: clave };
  }, [plantillas, plantillaDefaultKey, plantillaSeleccionada]);

  const fuentesDisponibles = useMemo(() => {
    const deduped = [];
    const seen = new Set();

    fuentes.forEach((font) => {
      const normalized = normalizeFontOption(font);
      if (!normalized) return;
      const key = normalized.key.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      deduped.push(normalized);
    });

    if (!availableFontKeysFromNav.length) {
      return deduped;
    }

    const allowedSet = new Set(availableFontKeysFromNav.map((key) => key.toLowerCase()));
    const filtered = deduped.filter((font) => allowedSet.has(font.key.toLowerCase()));
    const missing = availableFontKeysFromNav
      .filter((key) => !filtered.some((font) => font.key.toLowerCase() === key.toLowerCase()))
      .map((key) => ({
        key,
        name: resolveFontName(key),
        description: 'Fuente sugerida por el tema seleccionado.',
        category: '',
        pairing: '',
      }));

    if (filtered.length || missing.length) {
      return [...filtered, ...missing];
    }

    return deduped;
  }, [fuentes, availableFontKeysFromNav]);

  const fuentesOrdenadas = useMemo(() => {
    const arr = [...fuentesDisponibles];
    arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [fuentesDisponibles]);

  const fuenteActiva = useMemo(() => {
    const clave = (fuenteSeleccionada || fuenteDefaultKey || '').toString();
    if (!clave) return null;
    const normalized = clave.toLowerCase();
    const match = fuentesDisponibles.find((font) => font.key.toLowerCase() === normalized);
    if (match) return match;
    return {
      key: clave,
      name: resolveFontName(clave),
      description: 'Fuente predeterminada de TecCreate.',
      category: '',
      pairing: '',
    };
  }, [fuenteSeleccionada, fuenteDefaultKey, fuentesDisponibles]);

  const defaultFontLabel = useMemo(() => resolveFontName(fuenteDefaultKey || 'TecCreate'), [fuenteDefaultKey]);

  const resolveTemplateName = (template) => {
    if (template?.name) return template.name;
    if (template?.title) return template.title;
    if (template?.label) return template.label;
    if (template?.displayName) return template.displayName;

    const fallback = template?.key || template?.slug || template?.id || template?.value || template?.codigo;
    if (typeof fallback === 'string') {
      if (fallback.toLowerCase() === 'default') return 'TecCreate Clásico';
      return fallback
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    return 'Plantilla TecCreate';
  };

  const resolveTemplateDescription = (template) =>
    template?.description || template?.descripcion || template?.summary || 'Plantilla optimizada para un flujo rápido de generación.';

  const normalizeColor = (color) => {
    if (!color) return null;
    if (typeof color === 'string') return color;
    if (typeof color === 'object') {
      return color.hex || color.value || color.codigo || color.code || null;
    }
    return null;
  };

  const resolveTemplateColors = (template) => {
    if (Array.isArray(template?.palette)) return template.palette.map(normalizeColor).filter(Boolean);
    if (Array.isArray(template?.colors)) return template.colors.map(normalizeColor).filter(Boolean);
    if (Array.isArray(template?.colores)) return template.colores.map(normalizeColor).filter(Boolean);
    return [];
  };

  const activeTemplateColors = plantillaActiva ? resolveTemplateColors(plantillaActiva).slice(0, 4) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-14 px-4">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 p-10 text-white shadow-[0_25px_60px_rgba(14,165,233,0.3)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_55%)]"></div>
          <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"></div>
          <div className="absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-cyan-200/35 blur-[120px]"></div>
          <div className="relative z-10 grid gap-10 md:grid-cols-[1.4fr,1fr] md:items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur">
                <SparklesIcon className="h-5 w-5" /> TecCreate logo
              </span>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                  Crea presentaciones con IA en minutos
                </h1>
                <p className="text-base text-white/80 md:text-lg">
                  Describe tu idea, elige estilo e idioma, y deja que TecCreate construya un esquema listo para {slides}{' '}
                  diapositivas. Edita cada sección antes de generar y personaliza todo a tu ritmo.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-start gap-3 rounded-2xl bg-white/15 px-4 py-3 shadow-lg backdrop-blur">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
                    <ClipboardDocumentCheckIcon className="h-6 w-6" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Esquema inteligente</p>
                    <p className="text-xs text-white/80">Genera títulos claros, ideas clave y contexto listo para presentar.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-white/15 px-4 py-3 shadow-lg backdrop-blur">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
                    <AdjustmentsHorizontalIcon className="h-6 w-6" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Personalización total</p>
                    <p className="text-xs text-white/80">Modifica cada sección, idioma o estilo sin perder la guía original.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-white/15 px-4 py-3 shadow-lg backdrop-blur">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
                    <ClockIcon className="h-6 w-6" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Listo en instantes</p>
                    <p className="text-xs text-white/80">Obtén resultados al momento y comparte tu progreso con tu equipo.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative mx-auto flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl border border-white/40 bg-white/90 p-6 text-blue-700 shadow-[0_18px_45px_rgba(59,130,246,0.25)]">
              <div className="flex h-36 w-36 items-center justify-center rounded-2xl bg-white shadow-inner ring-4 ring-blue-100">
                <img
                  src="https://i.ibb.co/Q3JXxDPY/Chat-GPT-Image-13-jun-2025-22-14-04-removebg-preview-Photoroom.png"
                  alt="TecCreate logo"
                  className="h-full object-contain"
                />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-400">Tema en curso</p>
                <p className="text-lg font-semibold text-blue-700 line-clamp-3">{topicPreview}</p>
                <p className="text-xs text-blue-500">Diapositivas planificadas: {slides}</p>
              </div>
              <div className="flex w-full items-center justify-between rounded-2xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                <span>Caracteres actuales</span>
                <span>{totalCharacters}</span>
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-8 rounded-3xl border border-blue-100 bg-white/90 p-8 shadow-[0_20px_45px_rgba(59,130,246,0.12)] backdrop-blur sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-4">
              <label htmlFor="prompt" className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">
                Tema o prompt principal
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej. El impacto de la inteligencia artificial en la educación"
                className="w-full min-h-[170px] resize-y rounded-2xl border border-blue-100 bg-white px-5 py-4 text-gray-800 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
              <div className="flex flex-wrap items-center justify-between text-xs font-medium text-blue-500/70">
                <span>{totalCharacters} caracteres escritos</span>
                <span>{slides} diapositivas planificadas · {topicPreview}</span>
              </div>
            </div>

            <aside className="space-y-6 rounded-3xl border border-blue-100 bg-white px-6 py-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-blue-700">Configuración rápida</h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-500">Ajusta al instante</span>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium uppercase tracking-wide text-blue-500/80">Número de slides</label>
                <select
                  value={slides}
                  onChange={(e) => setSlides(Number(e.target.value))}
                  className="w-full rounded-xl border border-blue-100 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {slideOptions.map((value) => (
                    <option key={value} value={value}>
                      {value} diapositivas
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium uppercase tracking-wide text-blue-500/80">Estilo</label>
                <select
                  value={estilo}
                  onChange={(e) => setEstilo(e.target.value)}
                  className="w-full rounded-xl border border-blue-100 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {estilos.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium uppercase tracking-wide text-blue-500/80">Idioma</label>
                <select
                  value={idioma}
                  onChange={(e) => setIdioma(e.target.value)}
                  className="w-full rounded-xl border border-blue-100 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {idiomaOptions.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium uppercase tracking-wide text-blue-500/80">Fuente tipográfica</label>
                {fuentesLoading ? (
                  <div className="h-10 w-full animate-pulse rounded-xl bg-blue-50/70"></div>
                ) : fuentesError ? (
                  <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
                    {fuentesError}
                  </div>
                ) : fuentesOrdenadas.length ? (
                  <select
                    value={fuenteSeleccionada || ''}
                    onChange={(e) => setFuenteSeleccionada(e.target.value)}
                    className="w-full rounded-xl border border-blue-100 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Automático · {defaultFontLabel}</option>
                    {fuentesOrdenadas.map((font) => (
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

              <div className="space-y-3">
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

              {plantillaActiva && (
                <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Plantilla activa</p>
                  <p className="text-sm font-semibold text-blue-700">{resolveTemplateName(plantillaActiva)}</p>
                  <div className="flex items-center gap-1">
                    {activeTemplateColors.map((color, colorIndex) => (
                      <span
                        key={`active-template-color-${colorIndex}`}
                        className="h-4 w-4 rounded-full border border-white shadow"
                        style={{ background: color }}
                      ></span>
                    ))}
                    {!activeTemplateColors.length && (
                      <span className="text-[11px] text-blue-500/70">Colores automáticos</span>
                    )}
                  </div>
                </div>
              )}
              {fuenteActiva && (
                <div className="space-y-1 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
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
            </aside>
          </div>

          <div className="space-y-5 rounded-3xl border border-blue-100 bg-white/95 p-6 shadow-inner">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-blue-700">Elige una plantilla visual</h2>
                <p className="text-sm text-blue-500/75">
                  Combina el estilo general con una plantilla específica para exportar tu presentación.
                </p>
              </div>
              {plantillaActiva && (
                <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-blue-500">
                  <span className="hidden sm:inline">Plantilla actual:</span>
                  <span>{resolveTemplateName(plantillaActiva)}</span>
                </div>
              )}
            </div>

            {plantillasLoading && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="h-32 animate-pulse rounded-2xl border border-blue-100 bg-blue-50/60"
                  ></div>
                ))}
              </div>
            )}

            {!plantillasLoading && plantillasError && (
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                {plantillasError}
              </div>
            )}

            {!plantillasLoading && !plantillasError && (
              <>
                {plantillas.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {plantillas.map((template, index) => {
                      const selectionKey = (
                        template?.key ??
                        template?.id ??
                        template?.slug ??
                        template?.value ??
                        template?.codigo ??
                        template?.name ??
                        template?.title ??
                        `template-${index}`
                      ).toString();
                      const activeKey = (plantillaSeleccionada || plantillaDefaultKey || '').toString().toLowerCase();
                      const isActive = selectionKey.toLowerCase() === activeKey;
                      const colors = resolveTemplateColors(template).slice(0, 4);
                      const templateName = resolveTemplateName(template);
                      const templateDescription = resolveTemplateDescription(template);

                      return (
                        <button
                          key={selectionKey}
                          type="button"
                          onClick={() => setPlantillaSeleccionada(selectionKey)}
                          className={`group flex h-full flex-col justify-between rounded-2xl border px-4 py-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                            isActive
                              ? 'border-blue-500 bg-gradient-to-br from-blue-50 via-white to-sky-50 shadow-lg'
                              : 'border-blue-100 bg-white hover:border-blue-200 hover:shadow'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-blue-500">
                                {template.category || template.categoria || 'Diseño' }
                              </span>
                              {selectionKey.toLowerCase() === (plantillaDefaultKey || '').toString().toLowerCase() && (
                                <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-emerald-600">
                                  Predeterminada
                                </span>
                              )}
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-blue-700">{templateName}</h3>
                              <p className="text-sm text-blue-500/80">{templateDescription}</p>
                            </div>
                          </div>
                          {colors.length > 0 && (
                            <div className="mt-4 flex items-center gap-2">
                              {colors.map((color, colorIndex) => (
                                <span
                                  key={`${selectionKey}-color-${colorIndex}`}
                                  className="h-8 w-8 rounded-xl border border-white shadow-sm"
                                  style={{ background: color }}
                                ></span>
                              ))}
                            </div>
                          )}
                          {!colors.length && (
                            <div className="mt-4 flex items-center gap-1 text-xs text-blue-400/90">
                              <span className="inline-block h-2 w-2 rounded-full bg-blue-300"></span>
                              <span className="inline-block h-2 w-2 rounded-full bg-sky-300"></span>
                              <span className="inline-block h-2 w-2 rounded-full bg-cyan-300"></span>
                              <span>Colores definidos automáticamente</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-5 text-sm text-blue-600">
                    Aún no hay plantillas públicas. Conservamos el estilo TecCreate Clásico para tu exportación.
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-blue-700">Esquema sugerido</h2>
              <span className="text-sm text-blue-500/80">Edita cualquier sección antes de generar</span>
            </div>

            <div className="space-y-3">
              {outline.map((item, index) => (
                <div
                  key={index}
                  className="flex items-stretch gap-3 rounded-2xl border border-blue-50 bg-white px-4 py-3 shadow-sm transition hover:border-blue-200"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 font-semibold text-blue-600">
                    {index + 1}
                  </div>
                  <textarea
                    rows={2}
                    value={item}
                    onChange={(e) => handleOutlineChange(index, e.target.value)}
                    className="flex-1 resize-y rounded-xl border border-transparent bg-transparent px-2 py-1 text-sm text-gray-700 focus:border-blue-300 focus:outline-none focus:ring-0"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-blue-50 pt-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-blue-500/80">
              La generación respetará el orden y la cantidad de secciones mostradas arriba.
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 px-8 py-3 text-base font-semibold text-white shadow-[0_15px_35px_rgba(59,130,246,0.35)] transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Generando...' : 'Generar presentación'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
