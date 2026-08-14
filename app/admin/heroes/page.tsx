'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToastNotification } from '@/components/ui/toast';
import type { HeroSectionData } from '@/lib/hero/types';

export default function AdminHeroesPage() {
  const [sections, setSections] = useState<HeroSectionData[]>([]);
  const [loading, setLoading] = useState(true);

  const { error } = useToastNotification() || {
    error: (msg: string) => alert(msg),
  };

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/heroes');
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        console.error('[Admin heroes] Échec de l’API', { status: res.status, response: data });
        throw new Error(data?.error || 'Erreur de chargement');
      }
      setSections(
        (data?.heroes || []).filter((s: HeroSectionData) => s.pageKey?.toLowerCase() !== 'galerie')
      );
    } catch (err) {
      console.error('[Admin heroes] Impossible de charger les sections Hero:', err);
      error("Impossible de charger les sections Hero.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-blue-900 to-indigo-600 bg-clip-text text-transparent">
            Gestion des Images Hero
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez les images d'arrière-plan et le contenu des bannières (Hero) pour chaque page du site.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <span>Chargement des sections...</span>
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <span className="text-4xl">🖼️</span>
            <p className="text-sm mt-3">Aucune section trouvée.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sections.map((section) => (
              <div
                key={section.id}
                className="group flex flex-col bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="relative h-40 bg-slate-200 w-full overflow-hidden">
                  {section.imageUrl || section.defaultImageUrl ? (
                    <img
                      src={section.imageUrl || section.defaultImageUrl || ''}
                      alt={section.imageAlt || section.pageKey}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      Sans image
                    </div>
                  )}
                  {section.carouselEnabled && (section.slides?.filter((slide) => slide.isActive).length || 0) > 1 && (
                    <div className="absolute top-3 right-3 bg-blue-900/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      Carrousel ({section.slides?.length || 0})
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-slate-900 capitalize">
                      {section.pageKey === 'home' ? 'Accueil' : section.pageKey}
                    </h2>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${section.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                      {section.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-2">
                    {section.descriptionFr || 'Pas de description'}
                  </p>
                  
                  <Link
                    href={`/admin/heroes/${section.id}`}
                    className="mt-auto block text-center px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 hover:text-blue-900 transition-colors"
                  >
                    Gérer la bannière
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
