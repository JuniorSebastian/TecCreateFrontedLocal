import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AdjustmentsHorizontalIcon,
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  GlobeAltIcon,
  PresentationChartBarIcon,
  SparklesIcon,
  TagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { obtenerPlantillas, obtenerTemas, exportarTema, obtenerFuentes } from '../services/api';

const normalizeColor = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.hex || value.value || value.codigo || value.code || null;
  }
  return null;
};

const resolveFontKey = (font) => {
  if (!font) return '';
  if (typeof font === 'string' || typeof font === 'number') {
    return font.toString();
  }
  const key = font.key ?? font.id ?? font.slug ?? font.value ?? font.codigo ?? '';
  return key ? key.toString() : '';
};

const resolveFontName = (font) => {
  if (!font) return 'Fuente TecCreate';
  if (typeof font === 'string' || typeof font === 'number') {
    const value = font.toString();
    if (!value) return 'Fuente TecCreate';
    return value.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }
  if (font.name) return font.name;
  if (font.title) return font.title;
  if (font.label) return font.label;
  const key = resolveFontKey(font);
  if (!key) return 'Fuente TecCreate';
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

const resolveTemplateKey = (template) => {
  if (!template) return '';
  if (typeof template === 'string' || typeof template === 'number') {
    return template.toString();
  }
  const key =
    template.key ??
    template.id ??
    template.slug ??
    template.value ??
    template.codigo ??
    template.name ??
    template.title ??
    '';
  return key ? key.toString() : '';
};

const resolveTemplateName = (template) => {
  if (!template) return 'Plantilla TecCreate';
  if (typeof template === 'string' || typeof template === 'number') {
    const value = template.toString();
    if (!value) return 'Plantilla TecCreate';
    if (value.toLowerCase() === 'default') return 'TecCreate Clásico';
    return value
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
  if (template.name) return template.name;
  if (template.title) return template.title;
  if (template.label) return template.label;
  const key = resolveTemplateKey(template);
  if (!key) return 'Plantilla TecCreate';
  if (key.toLowerCase() === 'default') return 'TecCreate Clásico';
  return key
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const resolveTemplateDescription = (template) =>
  template?.description ||
  template?.descripcion ||
  template?.summary ||
  'Mantiene una narrativa visual consistente en toda la presentación.';

const resolveTemplateColors = (template) => {
  if (Array.isArray(template?.palette)) {
    return template.palette.map(normalizeColor).filter(Boolean);
  }
  if (Array.isArray(template?.colors)) {
    return template.colors.map(normalizeColor).filter(Boolean);
  }
  if (Array.isArray(template?.colores)) {
    return template.colores.map(normalizeColor).filter(Boolean);
  }
  return [];
};

const ensureStringArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item) {
        return item.name || item.label || item.value || item.key || null;
      }
      return null;
    })
    .filter((item) => typeof item === 'string' && item.trim().length)
    .map((item) => item.trim());
};

const sanitizeFileName = (raw) =>
  (raw || 'presentacion')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '-');

function TopicModal({
  topic,
  onClose,
  onConfirm,
  busy,
  globalTemplates,
  defaultTemplateKey,
  globalFonts,
  defaultFontKey,
  languageOptions,
}) {
  const categoryTemplates = useMemo(() => {
    if (!topic?.__categoryTemplates) return [];
    return Array.isArray(topic.__categoryTemplates) ? topic.__categoryTemplates : [];
  }, [topic]);

  const categoryFonts = useMemo(() => {
    if (!topic?.__categoryFonts) return [];
    return Array.isArray(topic.__categoryFonts) ? topic.__categoryFonts : [];
  }, [topic]);

  const availableFontKeys = useMemo(() => {
    if (!topic?.availableFonts) return [];
    if (Array.isArray(topic.availableFonts)) {
      return topic.availableFonts
        .map((value) => (value != null ? value.toString() : ''))
        .filter(Boolean);
    }
    return [];
  }, [topic]);

  const combinedTemplates = useMemo(() => {
    const map = new Map();
    const pushTemplate = (tpl) => {
      if (!tpl) return;
      const key = resolveTemplateKey(tpl);
      if (!key || map.has(key)) return;
      map.set(key, {
        key,
        name: resolveTemplateName(tpl),
        description: resolveTemplateDescription(tpl),
        colors: resolveTemplateColors(tpl).slice(0, 4),
      });
    };
    pushTemplate(topic?.plantilla);
    categoryTemplates.forEach(pushTemplate);
    globalTemplates.forEach(pushTemplate);
    const items = Array.from(map.values());
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [categoryTemplates, globalTemplates, topic]);

  const combinedFonts = useMemo(() => {
    const map = new Map();
    const allowed = availableFontKeys.length ? new Set(availableFontKeys.map((key) => key.toString())) : null;
    const pushFont = (font) => {
      const option = normalizeFontOption(font);
      if (!option) return;
      if (allowed && !allowed.has(option.key)) return;
      if (map.has(option.key)) return;
      map.set(option.key, option);
    };

    pushFont(topic?.font);
    if (Array.isArray(topic?.fonts)) {
      topic.fonts.forEach(pushFont);
    }
    categoryFonts.forEach(pushFont);
    globalFonts.forEach(pushFont);

    if (allowed) {
      allowed.forEach((key) => {
        if (!map.has(key)) {
          map.set(key, {
            key,
            name: resolveFontName(key),
            description: '',
            category: '',
            pairing: '',
          });
        }
      });
    }

    const items = Array.from(map.values());
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [availableFontKeys, categoryFonts, globalFonts, topic]);

  const baseTemplateKey = useMemo(() => {
    const topicTemplateKey = resolveTemplateKey(topic?.plantilla);
    if (topicTemplateKey) return topicTemplateKey;
    const categoryDefault = resolveTemplateKey(topic?.__categoryDefaultTemplate);
    if (categoryDefault) return categoryDefault;
    return defaultTemplateKey || (combinedTemplates[0]?.key ?? '');
  }, [combinedTemplates, defaultTemplateKey, topic]);

  const baseFontKey = useMemo(() => {
    if (topic?.fontKey) return topic.fontKey;
    const topicFont = resolveFontKey(topic?.font);
    if (topicFont) return topicFont;
    const categoryDefault = resolveFontKey(topic?.__categoryDefaultFont);
    if (categoryDefault) return categoryDefault;
    return defaultFontKey || (combinedFonts[0]?.key ?? '');
  }, [combinedFonts, defaultFontKey, topic]);

  const [selectedTemplate, setSelectedTemplate] = useState(baseTemplateKey);
  const [slidesValue, setSlidesValue] = useState(topic?.slides || '');
  const [idiomaValue, setIdiomaValue] = useState(topic?.idioma || 'Español');
  const [selectedFont, setSelectedFont] = useState(baseFontKey);

  useEffect(() => {
    setSelectedTemplate(baseTemplateKey);
    setSlidesValue(topic?.slides || '');
    setIdiomaValue(topic?.idioma || 'Español');
    setSelectedFont(baseFontKey);
  }, [baseTemplateKey, baseFontKey, topic]);

  const topicTags = useMemo(() => ensureStringArray(topic?.tags), [topic]);
  const palette = useMemo(() => resolveTemplateColors(topic?.plantilla).slice(0, 5), [topic]);
  const topicDescription = topic?.descripcion || topic?.description;
  const fontPreview = useMemo(() => {
    const match = combinedFonts.find((font) => font.key === selectedFont);
    if (match) return match;
    if (selectedFont) {
      return {
        key: selectedFont,
        name: resolveFontName(selectedFont),
        description: '',
        category: '',
        pairing: '',
      };
    }
    return null;
  }, [combinedFonts, selectedFont]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!topic?.key) return;
    const overrides = {};
    const slidesNumber = Number.parseInt(slidesValue, 10);
    if (selectedTemplate && selectedTemplate !== baseTemplateKey) {
      overrides.plantilla = selectedTemplate;
    }
    if (!Number.isNaN(slidesNumber) && slidesNumber > 0 && slidesNumber !== Number(topic?.slides)) {
      overrides.numeroSlides = slidesNumber;
    }
    if (idiomaValue && idiomaValue !== topic?.idioma) {
      overrides.idioma = idiomaValue;
    }
    if (selectedFont && selectedFont !== baseFontKey) {
      overrides.fuente = selectedFont;
    }
    onConfirm(overrides, {
      selectedTemplateKey: selectedTemplate || baseTemplateKey,
      selectedFontKey: selectedFont || baseFontKey,
      selectedIdioma: idiomaValue,
      slides: slidesNumber,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm px-4 py-6">
      <div className="relative w-full max-w-4xl rounded-3xl border border-blue-100 bg-white/95 shadow-[0_30px_65px_rgba(37,99,235,0.22)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-blue-100 text-blue-500 transition hover:bg-blue-50"
          aria-label="Cerrar"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <form onSubmit={handleSubmit} className="grid gap-6 p-8 lg:grid-cols-[2.2fr_1.3fr]">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-blue-500">
                {topic?.__categoryName || 'Tema TecCreate'}
              </span>
              <h2 className="text-3xl font-bold text-blue-700 leading-tight">{topic?.title}</h2>
              {topicDescription && (
                <p className="text-sm text-blue-500/80">{topicDescription}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">
                  <PresentationChartBarIcon className="h-4 w-4" /> Diapositivas
                </div>
                <p className="mt-2 text-lg font-semibold text-blue-700">{topic?.slides || 'Auto'}</p>
              </div>
              <div className="rounded-2xl border border-cyan-100 bg-cyan-50/50 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-500">
                  <GlobeAltIcon className="h-4 w-4" /> Idioma
                </div>
                <p className="mt-2 text-lg font-semibold text-cyan-700">{topic?.idioma || 'Español'}</p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
                  <TagIcon className="h-4 w-4" /> Tags
                </div>
                <p className="mt-2 text-sm font-semibold text-sky-700 line-clamp-2">
                  {topicTags.length ? topicTags.join(', ') : 'Sin etiquetas'}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-white/80 p-5 shadow-inner">
              <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-[0.3em]">Paleta base</h3>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {palette.length ? (
                  palette.map((color, index) => (
                    <span
                      key={`${topic?.key}-color-${index}`}
                      className="h-10 w-10 rounded-2xl border border-white shadow"
                      style={{ background: color }}
                      title={color}
                    ></span>
                  ))
                ) : (
                  <span className="text-xs font-medium text-blue-400">
                    La paleta se definirá automáticamente al exportar.
                  </span>
                )}
              </div>
            </div>

            {fontPreview && (
              <div className="rounded-3xl border border-indigo-100 bg-white/85 p-5 shadow-inner">
                <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-[0.3em]">Fuente sugerida</h3>
                <div className="mt-3 space-y-2 text-indigo-700">
                  <p className="text-lg font-semibold">{fontPreview.name}</p>
                  {fontPreview.description && (
                    <p className="text-sm text-indigo-500/80">{fontPreview.description}</p>
                  )}
                  {(fontPreview.category || fontPreview.pairing) && (
                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-indigo-400">
                      {fontPreview.category && <span>Categoría: {fontPreview.category}</span>}
                      {fontPreview.pairing && <span>Combina con: {fontPreview.pairing}</span>}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5 rounded-3xl border border-blue-50 bg-blue-50/60 p-6">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-blue-700">Personaliza antes de generar</h3>
              <p className="text-xs text-blue-500">
                Cambia la plantilla visual o ajusta idioma y número de diapositivas antes de exportar.
              </p>
            </div>

            <label className="space-y-2 text-sm">
              <span className="font-semibold text-blue-600">Plantilla</span>
              <select
                value={selectedTemplate}
                onChange={(event) => setSelectedTemplate(event.target.value)}
                className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm focus:border-blue-400 focus:outline-none"
              >
                {combinedTemplates.map((template) => (
                  <option key={template.key} value={template.key}>
                    {template.name}
                  </option>
                ))}
                {!combinedTemplates.length && (
                  <option value="">Sin plantillas disponibles</option>
                )}
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-semibold text-blue-600">Fuente</span>
              <select
                value={selectedFont}
                onChange={(event) => setSelectedFont(event.target.value)}
                className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm focus:border-blue-400 focus:outline-none"
              >
                {combinedFonts.map((font) => (
                  <option key={font.key} value={font.key}>
                    {font.name}
                  </option>
                ))}
                {!combinedFonts.length && <option value="">Fuentes globales</option>}
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-semibold text-blue-600">Número de diapositivas</span>
              <input
                type="number"
                min="1"
                value={slidesValue}
                onChange={(event) => setSlidesValue(event.target.value)}
                placeholder="Autodetectar"
                className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm focus:border-blue-400 focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-semibold text-blue-600">Idioma</span>
              <select
                value={idiomaValue}
                onChange={(event) => setIdiomaValue(event.target.value)}
                className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm focus:border-blue-400 focus:outline-none"
              >
                {languageOptions.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
                {!languageOptions.length && <option value="Español">Español</option>}
              </select>
            </label>

            <div className="mt-auto space-y-3">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy ? (
                  <>
                    <SparklesIcon className="h-4 w-4 animate-spin" /> Generando…
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="h-4 w-4" /> Generar PPTX
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-blue-200 px-5 py-3 text-sm font-semibold text-blue-600 transition hover:border-blue-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Temas() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [catalogoPlantillas, setCatalogoPlantillas] = useState([]);
  const [defaultTemplateKey, setDefaultTemplateKey] = useState('');
  const [catalogoFuentes, setCatalogoFuentes] = useState([]);
  const [defaultFontKey, setDefaultFontKey] = useState('');
  const [temasResponse, setTemasResponse] = useState({
    categories: [],
    totalTopics: 0,
    defaultTemplateKey: '',
    defaultTemplateName: '',
    defaultFontKey: '',
    defaultFontName: '',
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTags, setActiveTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalTopic, setModalTopic] = useState(null);
  const [generatingKey, setGeneratingKey] = useState('');
  const [toast, setToast] = useState(null);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const [plantillasData, temasData, fuentesData] = await Promise.all([
          obtenerPlantillas(),
          obtenerTemas(),
          obtenerFuentes(),
        ]);
        if (!isMounted) return;
        const templates = Array.isArray(plantillasData?.templates) ? plantillasData.templates : [];
        const resolvedPlantillaDefault = resolveTemplateKey(plantillasData?.default) || resolveTemplateKey(templates[0]);
        setCatalogoPlantillas(templates);
        setDefaultTemplateKey(resolvedPlantillaDefault || '');

        const fonts = Array.isArray(fuentesData?.fonts) ? fuentesData.fonts : [];
        const resolvedFontDefault = resolveFontKey(fuentesData?.default) || resolveFontKey(fonts[0]);
        setCatalogoFuentes(fonts);
        setDefaultFontKey(resolvedFontDefault || '');

        const categorias = Array.isArray(temasData?.categories) ? temasData.categories : [];
        const resolvedTemasDefaultKey = resolveTemplateKey(temasData?.defaultTemplate);
        const resolvedTemasDefaultName = temasData?.defaultTemplate
          ? resolveTemplateName(temasData.defaultTemplate)
          : '';
        const resolvedTemasFontKey = resolveFontKey(temasData?.defaultFont);
        const resolvedTemasFontName = temasData?.defaultFont
          ? resolveFontName(temasData.defaultFont)
          : '';

        setTemasResponse({
          categories: categorias,
          totalTopics: temasData?.totalTopics || 0,
          defaultTemplateKey: resolvedTemasDefaultKey || resolvedPlantillaDefault || '',
          defaultTemplateName: resolvedTemasDefaultName,
          defaultFontKey: resolvedTemasFontKey || resolvedFontDefault || '',
          defaultFontName: resolvedTemasFontName,
        });
      } catch (err) {
        console.error('No se pudieron cargar los temas', err);
        if (!isMounted) return;
        setError('No pudimos cargar las sugerencias en este momento. Intenta nuevamente más tarde.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const categories = useMemo(() => temasResponse.categories, [temasResponse]);

  const allTopics = useMemo(() => {
    const list = [];
    categories.forEach((category) => {
      const catKey = resolveTemplateKey({ key: category?.key ?? category?.id ?? category?.slug ?? '' }) || (category?.name || 'categoria');
      const catName = category?.name || category?.title || 'Categoría TecCreate';
      const catDescription = category?.description || category?.descripcion || '';
  const catDefaultTemplate = resolveTemplateKey(category?.defaultTemplate || category?.plantillaDefault || null);
      const catTemplates = Array.isArray(category?.templates) ? category.templates : [];
      const catDefaultFont = resolveFontKey(category?.defaultFont || category?.fuenteDefault || category?.fontDefault || null);
      const catFonts = Array.isArray(category?.fonts) ? category.fonts : [];
      const topics = Array.isArray(category?.topics) ? category.topics : [];
      topics.forEach((topic) => {
        const topicKey = resolveTemplateKey(topic) || resolveTemplateKey({ key: topic?.key ?? topic?.id ?? topic?.slug ?? '' });
        const finalTopicKey =
          topicKey ||
          (typeof topic?.key === 'number' || typeof topic?.key === 'string' ? topic.key : null) ||
          (typeof topic?.id === 'number' || typeof topic?.id === 'string' ? topic.id : null) ||
          (typeof topic?.slug === 'number' || typeof topic?.slug === 'string' ? topic.slug : null) ||
          `topic-${list.length}`;
        const topicFontKey = resolveFontKey(topic?.font);
        const topicAvailableFonts = Array.isArray(topic?.availableFonts) ? topic.availableFonts : [];
        list.push({
          ...topic,
          key: finalTopicKey.toString(),
          __categoryKey: catKey.toString(),
          __categoryName: catName,
          __categoryDescription: catDescription,
          __categoryDefaultTemplate: catDefaultTemplate,
          __categoryTemplates: catTemplates,
          __categoryDefaultFont: catDefaultFont,
          __categoryFonts: catFonts,
          fontKey: topicFontKey,
          availableFonts: topicAvailableFonts,
        });
      });
    });
    return list;
  }, [categories]);

  const totalTopics = useMemo(() => {
    if (temasResponse.totalTopics) return temasResponse.totalTopics;
    return allTopics.length;
  }, [allTopics.length, temasResponse.totalTopics]);

  const categoryFilters = useMemo(() => {
    const base = [
      {
        key: 'all',
        label: 'Todas las categorías',
        count: allTopics.length,
      },
    ];
    categories.forEach((category) => {
      const catKey = resolveTemplateKey({ key: category?.key ?? category?.id ?? category?.slug ?? '' }) || (category?.name || 'categoria');
      const topicsCount = Array.isArray(category?.topics) ? category.topics.length : 0;
      base.push({
        key: catKey.toString(),
        label: category?.name || category?.title || 'Categoría TecCreate',
        count: topicsCount,
      });
    });
    return base;
  }, [allTopics.length, categories]);

  const availableTags = useMemo(() => {
    const tagsSet = new Set();
    allTopics.forEach((topic) => {
      ensureStringArray(topic?.tags).forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort((a, b) => a.localeCompare(b));
  }, [allTopics]);

  const languageOptions = useMemo(() => {
    const langs = new Set(['Español']);
    allTopics.forEach((topic) => {
      if (topic?.idioma) {
        langs.add(topic.idioma);
      }
    });
    return Array.from(langs);
  }, [allTopics]);

  const defaultTemplateLabel = useMemo(() => {
    if (temasResponse.defaultTemplateName) return temasResponse.defaultTemplateName;
    const key = temasResponse.defaultTemplateKey || defaultTemplateKey;
    if (key) return resolveTemplateName(key);
    return '';
  }, [defaultTemplateKey, temasResponse.defaultTemplateKey, temasResponse.defaultTemplateName]);

  const defaultFontLabel = useMemo(() => {
    if (temasResponse.defaultFontName) return temasResponse.defaultFontName;
    const key = temasResponse.defaultFontKey || defaultFontKey;
    if (key) return resolveFontName(key);
    return '';
  }, [defaultFontKey, temasResponse.defaultFontKey, temasResponse.defaultFontName]);

  const filteredTopics = useMemo(() => {
    return allTopics
      .filter((topic) => {
        if (selectedCategory === 'all') return true;
        return topic.__categoryKey?.toString() === selectedCategory;
      })
      .filter((topic) => {
        if (!activeTags.length) return true;
        const topicTags = ensureStringArray(topic?.tags).map((tag) => tag.toLowerCase());
        return activeTags.every((tag) => topicTags.includes(tag.toLowerCase()));
      })
      .filter((topic) => {
        if (!searchTerm.trim()) return true;
        const query = searchTerm.trim().toLowerCase();
        const title = (topic?.title || '').toLowerCase();
        const description = (topic?.descripcion || topic?.description || '').toLowerCase();
        return title.includes(query) || description.includes(query);
      });
  }, [activeTags, allTopics, searchTerm, selectedCategory]);

  const toggleTag = (tag) => {
    setActiveTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((item) => item !== tag);
      }
      return [...prev, tag];
    });
  };

  const openTopicModal = (topic) => {
    setModalTopic(topic);
    setExportError('');
  };

  const closeTopicModal = () => {
    setModalTopic(null);
    setExportError('');
  };

  const handleGenerateTopic = async (topic, overrides, meta) => {
    if (!topic) return;
    const topicKey = resolveTemplateKey(topic) || topic.key;
    if (!topicKey) return;
    setGeneratingKey(topicKey);
    setExportError('');
    try {
      const response = await exportarTema(topicKey, overrides);
      const headers = response.headers || {};
      const plantillaHeader = headers['x-presentacion-plantilla'];
      const plantillaNameHeader = headers['x-presentacion-plantilla-name'];
      const topicHeader = headers['x-presentacion-topic'];
      const categoriaHeader = headers['x-presentacion-categoria'];
      const selectedTemplateKey = meta?.selectedTemplateKey || plantillaHeader;
      const fontHeader = headers['x-presentacion-fuente'];
      const fontNameHeader = headers['x-presentacion-fuente-name'] || headers['x-presentacion-fuente-label'];
      const selectedFontKey = meta?.selectedFontKey || fontHeader;
      const contentType =
        headers['content-type'] ||
        'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      const blob = new Blob([response.data], { type: contentType });
      const disposition = headers['content-disposition'];
      let filename = '';
      if (disposition) {
        const match = disposition.match(/filename\*=UTF-8''(.+)$|filename="?([^";]+)"?/i);
        const raw = match?.[1] || match?.[2];
        if (raw) {
          try {
            filename = decodeURIComponent(raw);
          } catch (err) {
            filename = raw;
          }
        }
      }
      if (!filename) {
        const safeTitle = sanitizeFileName(topic?.title);
        const safeTemplate = sanitizeFileName(selectedTemplateKey || plantillaNameHeader || 'TecCreate');
        filename = `TecCreate-${safeTitle}-${safeTemplate}.pptx`;
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setToast({
        title: 'Presentación generada',
        detail: `${topic.title || 'Presentación TecCreate'} lista para usar.`,
        plantilla: plantillaNameHeader || resolveTemplateName({ key: selectedTemplateKey }) || 'Plantilla TecCreate',
        categoria: categoriaHeader || topic.__categoryName,
        fuente:
          fontNameHeader ||
          (selectedFontKey ? resolveFontName(selectedFontKey) : '') ||
          '',
        topicKey: topicHeader || topicKey,
      });
      closeTopicModal();
    } catch (err) {
      console.error('Error al exportar tema', err);
      const status = err?.response?.status;
      let message = 'No pudimos generar la presentación. Intenta nuevamente.';
      if (status === 401) {
        message = 'Tu sesión expiró. Inicia sesión otra vez para generar la presentación.';
      } else if (status === 404) {
        message = 'El tema seleccionado ya no está disponible.';
      } else if (status >= 500) {
        message = 'El servicio de generación tuvo un problema. Intenta más tarde.';
      }
      setExportError(message);
    } finally {
      setGeneratingKey('');
    }
  };

  const handleConfirmModal = (overrides, meta) => {
    if (!modalTopic) return;
    handleGenerateTopic(modalTopic, overrides, meta);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-3xl border border-blue-100 bg-blue-50/60"
            ></div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-red-600 shadow-inner">
          {error}
        </div>
      );
    }

    if (!filteredTopics.length) {
      return (
        <div className="rounded-3xl border border-blue-100 bg-white/80 px-8 py-10 text-center text-blue-600 shadow-lg">
          <p className="text-lg font-semibold">No encontramos temas con los filtros seleccionados.</p>
          <p className="mt-2 text-sm">
            Intenta limpiar los filtros o busca con otra palabra clave.
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTopics.map((topic) => {
          const palette = resolveTemplateColors(topic?.plantilla).slice(0, 4);
          const topicTags = ensureStringArray(topic?.tags).slice(0, 4);
          const description = topic?.descripcion || topic?.description;
          const topicKey = resolveTemplateKey(topic) || topic?.key;
          const isGenerating = generatingKey && generatingKey === topicKey;
          const quickTemplateKey =
            resolveTemplateKey(topic?.plantilla) ||
            resolveTemplateKey(topic?.__categoryDefaultTemplate) ||
            temasResponse.defaultTemplateKey ||
            defaultTemplateKey;
          const topicFontKey = topic?.fontKey || resolveFontKey(topic?.font);
          const quickFontKey =
            topicFontKey ||
            resolveFontKey(topic?.__categoryDefaultFont) ||
            temasResponse.defaultFontKey ||
            defaultFontKey;
          const availableFontKeys = Array.isArray(topic?.availableFonts)
            ? topic.availableFonts.map((key) => key && key.toString()).filter(Boolean)
            : [];
          const fontLabel = quickFontKey ? resolveFontName(quickFontKey) : null;

          return (
            <article
              key={topicKey}
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-blue-100 bg-white px-5 py-6 shadow-[0_15px_45px_rgba(59,130,246,0.12)] transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_22px_55px_rgba(59,130,246,0.18)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-transparent to-cyan-50/60 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-blue-500">
                    {topic.__categoryName}
                  </span>
                  <span className="text-xs font-semibold text-blue-400">
                    {topic.slides ? `${topic.slides} diapositivas` : 'Auto'}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-blue-700 line-clamp-2 leading-tight">{topic.title}</h3>
                {description && (
                  <p className="text-sm text-blue-500/80 line-clamp-3 min-h-[60px]">{description}</p>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-blue-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 font-semibold">
                    <GlobeAltIcon className="h-3.5 w-3.5" /> {topic.idioma || 'Español'}
                  </span>
                  {topicTags.map((tag) => (
                    <span
                      key={`${topicKey}-tag-${tag}`}
                      className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 font-semibold text-sky-600"
                    >
                      <TagIcon className="h-3.5 w-3.5" /> {tag}
                    </span>
                  ))}
                  {fontLabel && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-600">
                      Fuente · {fontLabel}
                    </span>
                  )}
                </div>
              </div>
              <div className="relative mt-5 space-y-4">
                <div className="flex items-center gap-2">
                  {palette.length ? (
                    palette.map((color, index) => (
                      <span
                        key={`${topicKey}-palette-${index}`}
                        className="h-8 w-8 rounded-xl border border-white shadow"
                        style={{ background: color }}
                      ></span>
                    ))
                  ) : (
                    <span className="text-[11px] font-medium text-blue-300">
                      Paleta automática
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                        navigate('/crear-presentacion', {
                          state: {
                            topicKey,
                            plantilla: quickTemplateKey,
                            font: quickFontKey,
                            idioma: topic.idioma || 'Español',
                            slides: topic.slides || null,
                            tags: ensureStringArray(topic.tags),
                            title: topic.title,
                            category: topic.__categoryName,
                            description: description,
                            availableFonts: availableFontKeys,
                          },
                        })
                    }
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    Abrir en editor
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleGenerateTopic(
                        topic,
                        quickFontKey ? { fuente: quickFontKey } : {},
                        {
                          selectedTemplateKey: quickTemplateKey,
                          selectedFontKey: quickFontKey,
                        }
                      )
                    }
                    disabled={isGenerating}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isGenerating ? (
                      <>
                        <SparklesIcon className="h-4 w-4 animate-spin" /> Generando…
                      </>
                    ) : (
                      <>
                        <DocumentArrowDownIcon className="h-4 w-4" /> Exportar
                      </>
                    )}
                  </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => openTopicModal(topic)}
                    className="self-start text-xs font-semibold text-blue-400 underline-offset-2 transition hover:text-blue-600 hover:underline"
                  >
                    Configurar antes de exportar
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="flex flex-col gap-6 rounded-3xl border border-white/40 bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 p-8 text-white shadow-[0_25px_60px_rgba(14,165,233,0.3)]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/perfil')}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/20"
            >
              <ArrowLeftIcon className="h-4 w-4" /> Regresar al perfil
            </button>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur">
              <SparklesIcon className="h-4 w-4" /> Inspiración instantánea
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Temas sugeridos listos para presentar</h1>
            <p className="max-w-3xl text-base text-white/80 md:text-lg">
              Explora ideas agrupadas por categoría, descubre la plantilla recomendada para cada tema y genera un PPT con un clic. Puedes personalizar idioma y número de diapositivas antes de descargar.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
            <span className="rounded-full bg-white/15 px-3 py-1 font-semibold uppercase tracking-[0.35em] text-white/70">Temas disponibles</span>
            <span className="rounded-full bg-white/10 px-3 py-1 font-semibold">{totalTopics}</span>
            {defaultTemplateLabel && (
              <span className="rounded-full bg-white/10 px-3 py-1 font-semibold">
                Plantilla sugerida: {defaultTemplateLabel}
              </span>
            )}
            {defaultFontLabel && (
              <span className="rounded-full bg-white/10 px-3 py-1 font-semibold">
                Fuente sugerida: {defaultFontLabel}
              </span>
            )}
          </div>
        </header>

        <section className="space-y-6 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_18px_45px_rgba(59,130,246,0.12)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {categoryFilters.map((category) => {
                const isActive = selectedCategory === category.key;
                return (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => setSelectedCategory(category.key)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'border-blue-400 bg-blue-50 text-blue-600 shadow'
                        : 'border-blue-100 bg-white text-blue-500 hover:border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <AdjustmentsHorizontalIcon className="h-4 w-4" />
                    {category.label}
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-600">
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar tema por título o palabra clave"
                  className="w-full rounded-full border border-blue-100 bg-white py-2.5 pl-10 pr-4 text-sm text-blue-700 shadow focus:border-blue-300 focus:outline-none"
                />
                <FunnelIcon className="absolute left-3 top-2.5 h-5 w-5 text-blue-300" />
              </div>
            </div>
          </div>

          {availableTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {availableTags.map((tag) => {
                const isActive = activeTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-sky-500 text-white shadow'
                        : 'bg-sky-50 text-sky-600 hover:bg-sky-100'
                    }`}
                  >
                    <TagIcon className="h-3.5 w-3.5" /> {tag}
                    {isActive && <CheckCircleIcon className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
              {activeTags.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTags([])}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-600"
                >
                  Limpiar tags
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </section>

        {exportError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600 shadow-inner">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5" />
              {exportError}
            </div>
          </div>
        )}

        {renderContent()}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[65] flex max-w-sm items-start gap-3 rounded-2xl border border-blue-100 bg-white/95 p-4 shadow-[0_18px_45px_rgba(59,130,246,0.2)]">
          <div className="rounded-full bg-blue-100 p-2 text-blue-600">
            <CheckCircleIcon className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-sm text-blue-700">
            <p className="font-semibold">{toast.title}</p>
            <p className="text-blue-500/80">{toast.detail}</p>
            <p className="text-xs text-blue-400">
              Plantilla: {toast.plantilla} • Categoría: {toast.categoria}
              {toast.fuente ? ` • Fuente: ${toast.fuente}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-auto text-blue-400 transition hover:text-blue-600"
            aria-label="Cerrar notificación"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {modalTopic && (
        <TopicModal
          topic={modalTopic}
          onClose={closeTopicModal}
          onConfirm={handleConfirmModal}
          busy={Boolean(generatingKey)}
          globalTemplates={catalogoPlantillas}
          defaultTemplateKey={temasResponse.defaultTemplateKey || defaultTemplateKey}
          globalFonts={catalogoFuentes}
          defaultFontKey={temasResponse.defaultFontKey || defaultFontKey}
          languageOptions={languageOptions}
        />
      )}
    </div>
  );
}
