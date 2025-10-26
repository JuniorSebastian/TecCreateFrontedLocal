import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  MusicalNoteIcon,
} from '@heroicons/react/24/outline';
import { obtenerFuentes } from '../services/api';

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
    if (normalized === 'default' || normalized === 'teccreate') {
      return 'TecCreate Clásica';
    }
    return value.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }
  if (font.name) return font.name;
  if (font.title) return font.title;
  if (font.label) return font.label;
  const key = resolveFontKey(font);
  if (!key) return 'TecCreate Clásica';
  const normalized = key.toLowerCase();
  if (normalized === 'default' || normalized === 'teccreate') {
    return 'TecCreate Clásica';
  }
  return key.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map((item) => item.toString());
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
};

const normalizeFontOption = (font) => {
  const key = resolveFontKey(font);
  if (!key) return null;
  const tags = normalizeArray(font?.tags || font?.etiquetas);
  const weights = normalizeArray(font?.weights || font?.pesos || font?.variantes);
  const alternates = normalizeArray(font?.alternates || font?.alternativas || font?.compatibles);
  const pairing = font?.pairing || font?.combinacion || font?.combina || (alternates.length ? alternates.join(', ') : '');

  return {
    key,
    name: resolveFontName(font),
    description: font?.description || font?.descripcion || font?.resumen || '',
    category: font?.category || font?.categoria || font?.familia || '',
    pairing,
    cssFamily: font?.cssFamily || font?.fontFamily || font?.family || font?.fuente || '',
    tags,
    weights,
    alternates,
    preview: font?.preview || font?.ejemplo || '',
  };
};

const ensureUnique = (items) => {
  const seen = new Set();
  const result = [];
  items.forEach((item) => {
    const value = item?.key?.toLowerCase();
    if (!value || seen.has(value)) return;
    seen.add(value);
    result.push(item);
  });
  return result;
};

export default function Fuentes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [catalogo, setCatalogo] = useState([]);
  const [defaultFontKey, setDefaultFontKey] = useState('');
  const backDestination = '/perfil';

  useEffect(() => {
    let isMounted = true;
    const fetchFuentes = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await obtenerFuentes();
        if (!isMounted) return;

        let rawFonts = [];
        if (Array.isArray(data)) {
          rawFonts = data;
        } else if (Array.isArray(data?.fonts)) {
          rawFonts = data.fonts;
        } else if (Array.isArray(data?.fuentes)) {
          rawFonts = data.fuentes;
        }

        const normalized = ensureUnique(
          rawFonts
            .map(normalizeFontOption)
            .filter(Boolean)
        );

        const fallbackKey = resolveFontKey(data?.default || data?.porDefecto || data?.predeterminada);
        const defaultKey = fallbackKey || (normalized[0]?.key ?? '');

        setCatalogo(normalized);
        setDefaultFontKey(defaultKey);
      } catch (err) {
        console.error('No se pudo obtener el catálogo de fuentes', err);
        if (!isMounted) return;
        setError('No pudimos cargar las fuentes en este momento. Intenta nuevamente más tarde.');
        setCatalogo([]);
        setDefaultFontKey('');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFuentes();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalFuentes = useMemo(() => catalogo.length, [catalogo]);

  const handleUsarFuente = (font) => {
    const availableKeys = catalogo.map((item) => item.key);
    navigate('/crear-presentacion', {
      state: {
        font: font.key,
        fuente: font.key,
        availableFonts: availableKeys,
        from: 'fuentes',
      },
    });
  };

  const renderTags = (tags) => {
    if (!tags.length) return null;
    return (
      <div className="flex flex-wrap gap-2 text-[11px] text-blue-500/80">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-blue-100 bg-blue-50 px-2 py-1 font-semibold"
          >
            #{tag}
          </span>
        ))}
      </div>
    );
  };

  const renderWeights = (weights) => {
    if (!weights.length) return null;
    return (
      <div className="text-xs text-blue-400">
        Pesos: {weights.join(', ')}
      </div>
    );
  };

  const getPreviewStyle = (font) => {
    const family = font.cssFamily || font.name;
    if (!family) return undefined;
    return { fontFamily: `${family}, 'Poppins', 'Segoe UI', sans-serif` };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-col gap-6 rounded-3xl border border-white/40 bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 p-8 text-white shadow-[0_25px_60px_rgba(14,165,233,0.3)]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(backDestination, { state: { fromFuentes: true } })}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/20"
            >
              <ArrowLeftIcon className="h-4 w-4" /> Regresar
            </button>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur">
              <SparklesIcon className="h-4 w-4" /> Catálogo de fuentes TecCreate
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Fuentes listas para personalizar tus Creates</h1>
            <p className="max-w-3xl text-base text-white/80 md:text-lg">
              Explora las tipografías recomendadas por TecCreate. Al elegir una fuente la enviaremos directo al generador para que continúes tu historia con esa personalidad visual.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
            <span className="rounded-full bg-white/15 px-3 py-1 font-semibold uppercase tracking-[0.35em] text-white/70">Fuentes disponibles</span>
            <span className="rounded-full bg-white/10 px-3 py-1 font-semibold">{totalFuentes}</span>
            {defaultFontKey && (
              <span className="rounded-full bg-white/10 px-3 py-1 font-semibold">
                Predeterminada: {resolveFontName(defaultFontKey)}
              </span>
            )}
          </div>
        </header>

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-3xl border border-blue-100 bg-blue-50/60"
              ></div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-red-600 shadow-inner">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {catalogo.length === 0 ? (
              <div className="rounded-3xl border border-blue-100 bg-white/90 px-6 py-10 text-center text-blue-600 shadow-lg">
                Aún no hay fuentes públicas. Mantendremos TecCreate Clásica como opción predeterminada.
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {catalogo.map((font) => {
                  const isDefault = defaultFontKey && font.key.toLowerCase() === defaultFontKey.toLowerCase();
                  return (
                    <div
                      key={font.key}
                      className="group flex h-full flex-col justify-between rounded-3xl border border-blue-100 bg-white px-5 py-5 shadow-[0_12px_30px_rgba(59,130,246,0.12)] transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(59,130,246,0.18)]"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-blue-500">
                            {font.category || 'Tipografía'}
                          </span>
                          {isDefault && (
                            <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-emerald-600">
                              Predeterminada
                            </span>
                          )}
                          {font.pairing && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-blue-400">
                              <MusicalNoteIcon className="h-3.5 w-3.5" /> {font.pairing}
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-blue-700 shadow-inner" style={getPreviewStyle(font)}>
                            <p className="text-lg font-semibold">{font.name}</p>
                            <p className="text-xs text-blue-500/80">{font.preview || 'La creatividad se siente mejor con buenas fuentes.'}</p>
                          </div>
                          {font.description && (
                            <p className="text-sm text-blue-500/80">{font.description}</p>
                          )}
                          {renderTags(font.tags)}
                          {renderWeights(font.weights)}
                        </div>
                      </div>
                      <div className="mt-5 space-y-2">
                        <button
                          type="button"
                          onClick={() => handleUsarFuente(font)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition hover:border-blue-300 hover:bg-blue-50"
                        >
                          Usar en generador
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        </button>
                        {font.alternates.length > 0 && (
                          <p className="text-[11px] text-blue-400/90">
                            Combina con: {font.alternates.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
