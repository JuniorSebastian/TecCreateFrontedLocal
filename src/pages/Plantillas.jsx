import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { obtenerPlantillas } from '../services/api';

const normalizeColor = (color) => {
  if (!color) return null;
  if (typeof color === 'string') return color;
  if (typeof color === 'object') {
    return color.hex || color.value || color.codigo || color.code || null;
  }
  return null;
};

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
  template?.description || template?.descripcion || template?.summary || 'Plantilla optimizada para darle coherencia visual a tu historia.';

const resolveTemplateColors = (template) => {
  if (Array.isArray(template?.palette)) return template.palette.map(normalizeColor).filter(Boolean);
  if (Array.isArray(template?.colors)) return template.colors.map(normalizeColor).filter(Boolean);
  if (Array.isArray(template?.colores)) return template.colores.map(normalizeColor).filter(Boolean);
  return [];
};

export default function Plantillas() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [catalogo, setCatalogo] = useState([]);
  const [defaultKey, setDefaultKey] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchPlantillas = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await obtenerPlantillas();
        if (!isMounted) return;
        const templates = Array.isArray(data?.templates) ? data.templates : [];
        setCatalogo(templates);
        setDefaultKey(data?.default || (templates[0]?.key ?? templates[0]?.id ?? templates[0]?.slug ?? ''));
      } catch (err) {
        console.error('No se pudo obtener el catálogo de plantillas', err);
        if (!isMounted) return;
        setError('No pudimos cargar las plantillas en este momento. Intenta nuevamente más tarde.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPlantillas();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalPlantillas = useMemo(() => catalogo.length, [catalogo]);

  const handleUsarPlantilla = (selectionKey) => {
    const value = selectionKey?.toString() || '';
    navigate('/crear-presentacion', { state: { plantilla: value } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4">
      <div className="mx-auto max-w-6xl space-y-10">
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
              <SparklesIcon className="h-4 w-4" /> Catálogo TecCreate
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Plantillas listas para usar</h1>
            <p className="max-w-3xl text-base text-white/80 md:text-lg">
              Explora las plantillas disponibles y llévalas directo al generador de presentaciones. Cuando elijas una, te enviaremos al flujo de creación con esa visual seleccionada por defecto.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
            <span className="rounded-full bg-white/15 px-3 py-1 font-semibold uppercase tracking-[0.35em] text-white/70">Plantillas disponibles</span>
            <span className="rounded-full bg-white/10 px-3 py-1 font-semibold">{totalPlantillas}</span>
            {defaultKey && (
              <span className="rounded-full bg-white/10 px-3 py-1 font-semibold">
                Predeterminada: {defaultKey}
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
                Aún no hay plantillas públicas. Mantendremos TecCreate Clásico como opción predeterminada.
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {catalogo.map((template, index) => {
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
                  const name = resolveTemplateName(template);
                  const description = resolveTemplateDescription(template);
                  const colors = resolveTemplateColors(template).slice(0, 4);
                  const categoria = template?.category || template?.categoria || 'Diseño';

                  return (
                    <div
                      key={selectionKey}
                      className="group flex h-full flex-col justify-between rounded-3xl border border-blue-100 bg-white px-5 py-5 shadow-[0_12px_30px_rgba(59,130,246,0.12)] transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(59,130,246,0.18)]"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-blue-500">
                            {categoria}
                          </span>
                          {selectionKey.toLowerCase() === (defaultKey || '').toString().toLowerCase() && (
                            <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-emerald-600">
                              Predeterminada
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <h2 className="text-lg font-semibold text-blue-700">{name}</h2>
                          <p className="text-sm text-blue-500/80">{description}</p>
                        </div>
                      </div>
                      <div className="mt-5 space-y-4">
                        {colors.length ? (
                          <div className="flex items-center gap-2">
                            {colors.map((color, colorIndex) => (
                              <span
                                key={`${selectionKey}-color-${colorIndex}`}
                                className="h-9 w-9 rounded-2xl border border-white shadow"
                                style={{ background: color }}
                              ></span>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-blue-400/90">
                            <span className="inline-block h-2 w-2 rounded-full bg-blue-300"></span>
                            <span className="inline-block h-2 w-2 rounded-full bg-sky-300"></span>
                            <span className="inline-block h-2 w-2 rounded-full bg-cyan-300"></span>
                            <span>Colores definidos automáticamente</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleUsarPlantilla(selectionKey)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition hover:border-blue-300 hover:bg-blue-50"
                        >
                          Usar en generador
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        </button>
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
