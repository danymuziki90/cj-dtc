'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Image as ImageIcon, Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { useToastNotification } from '@/components/ui/toast';
import type { HeroSectionData, HeroSlideData } from '@/lib/hero/types';

export default function AdminHeroEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();

  const [section, setSection] = useState<HeroSectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states (Section level)
  const [isActive, setIsActive] = useState(true);
  const [isDynamic, setIsDynamic] = useState(false);
  const [slideDuration, setSlideDuration] = useState(6000);
  const [compact, setCompact] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [eyebrowFr, setEyebrowFr] = useState('');
  const [eyebrowEn, setEyebrowEn] = useState('');
  const [titleFr, setTitleFr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionFr, setDescriptionFr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');

  // Slides states
  const [slides, setSlides] = useState<HeroSlideData[]>([]);

  // File upload state for section image
  const [uploadingImage, setUploadingImage] = useState(false);

  const { success, error } = useToastNotification() || {
    success: (msg: string) => alert(msg),
    error: (msg: string) => alert(msg),
  };

  const fetchSection = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/heroes/${id}`);
      if (!res.ok) throw new Error('Introuvable');
      const data = await res.json();
      setSection(data);
      
      setIsActive(data.isActive);
      setIsDynamic(data.carouselEnabled !== false);
      setSlideDuration(data.slideDuration || 6000);
      setCompact(data.compact);
      setImageUrl(data.imageUrl || '');
      setImageAlt(data.imageAlt || '');
      setEyebrowFr(data.eyebrowFr || '');
      setEyebrowEn(data.eyebrowEn || '');
      setTitleFr(data.titleFr || '');
      setTitleEn(data.titleEn || '');
      setDescriptionFr(data.descriptionFr || '');
      setDescriptionEn(data.descriptionEn || '');
      setSlides(data.slides || []);
    } catch (err) {
      console.error(err);
      error("Impossible de charger cette section.");
      router.push('/admin/heroes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSection();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/heroes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive,
          carouselEnabled: isDynamic,
          slideDuration,
          compact,
          imageUrl,
          imageAlt,
          eyebrowFr,
          eyebrowEn,
          titleFr,
          titleEn,
          descriptionFr,
          descriptionEn,
        })
      });

      if (!res.ok) {
        let errorMsg = 'Erreur de sauvegarde';
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const d = await res.json();
          errorMsg = d.error || errorMsg;
        } else if (res.status === 413) {
          errorMsg = 'Fichier ou données trop volumineux (max 4.5 Mo).';
        } else {
          errorMsg = `Erreur serveur (${res.status})`;
        }
        throw new Error(errorMsg);
      }

      success("Bannière mise à jour avec succès.");
      fetchSection(); // refresh to get latest state
    } catch (err: any) {
      error(err.message || "Erreur de sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error("Veuillez sélectionner une image valide.");
      return;
    }

    if (file.size > 4.5 * 1024 * 1024) {
      error("L'image est trop volumineuse (maximum 4.5 Mo). Veuillez la compresser.");
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/admin/heroes/${id}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let errorMsg = 'Erreur d\'upload';
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const d = await res.json();
          errorMsg = d.error || errorMsg;
        } else if (res.status === 413) {
          errorMsg = 'L\'image est trop volumineuse pour être envoyée (max 4.5 Mo).';
        } else {
          errorMsg = `Erreur serveur (${res.status})`;
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      setImageUrl(data.url || data.imageUrl);
      success("Image uploadée et sauvegardée avec succès.");
    } catch (err: any) {
      error(err.message || "Erreur d'upload");
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = ''; // reset file input
    }
  };

  // Slides Management functions
  const handleAddSlide = async () => {
    try {
      const res = await fetch(`/api/admin/heroes/${id}/slides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleFr: 'Nouveau slide',
          titleEn: 'New slide',
          order: slides.length
        })
      });
      if (!res.ok) {
        let errorMsg = "Erreur d'ajout";
        if (res.headers.get('content-type')?.includes('application/json')) {
          const d = await res.json();
          errorMsg = d.error || errorMsg;
        }
        throw new Error(errorMsg);
      }
      success("Nouveau slide ajouté.");
      fetchSection();
    } catch (err) {
      error("Erreur d'ajout de slide");
    }
  };

  const handleUpdateSlideField = (slideId: string, field: string, value: any) => {
    setSlides(prev => prev.map(s => s.id === slideId ? { ...s, [field]: value } : s));
  };

  const handleSlideImageUpload = async (slideId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      error("Choisissez une image de moins de 5 Mo.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/admin/heroes/${id}/slides/${slideId}`, { method: 'PUT', body: formData });
      if (!res.ok) throw new Error('Upload impossible');
      const { slide } = await res.json();
      setSlides(prev => prev.map(item => item.id === slideId ? { ...item, imageUrl: slide.imageUrl } : item));
      success("Image du slide téléversée.");
    } catch {
      error("Erreur lors du téléversement de l'image.");
    } finally {
      event.target.value = '';
    }
  };

  const handleSaveSlide = async (slide: HeroSlideData) => {
    try {
      const res = await fetch(`/api/admin/heroes/${id}/slides/${slide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slide)
      });
      if (!res.ok) {
        let errorMsg = "Erreur de mise à jour";
        if (res.headers.get('content-type')?.includes('application/json')) {
          const d = await res.json();
          errorMsg = d.error || errorMsg;
        }
        throw new Error(errorMsg);
      }
      success("Slide mis à jour.");
    } catch (err) {
      error("Erreur lors de la mise à jour du slide.");
    }
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce slide ?")) return;
    try {
      const res = await fetch(`/api/admin/heroes/${id}/slides/${slideId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        let errorMsg = "Erreur de suppression";
        if (res.headers.get('content-type')?.includes('application/json')) {
          const d = await res.json();
          errorMsg = d.error || errorMsg;
        }
        throw new Error(errorMsg);
      }
      success("Slide supprimé.");
      setSlides(prev => prev.filter(s => s.id !== slideId));
    } catch (err) {
      error("Erreur lors de la suppression.");
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 min-h-screen flex items-center justify-center">
        <span className="text-slate-400">Chargement...</span>
      </div>
    );
  }

  if (!section) return null;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-slate-50/50 min-h-screen">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/heroes" className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 capitalize">
            {section.pageKey === 'home' ? 'Accueil' : section.pageKey} — Bannière
          </h1>
          <p className="text-sm text-slate-500 mt-1">Personnalisez l'image et le texte de cette page.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne gauche : Formulaire principal */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-lg font-bold text-slate-800">Paramètres de la bannière</h2>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-blue-900 border-slate-300 rounded focus:ring-blue-900"
                  />
                  <span className="text-sm font-semibold text-slate-700">Actif</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={compact}
                    onChange={e => setCompact(e.target.checked)}
                    className="w-4 h-4 text-blue-900 border-slate-300 rounded focus:ring-blue-900"
                  />
                  <span className="text-sm font-semibold text-slate-700">Compact</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                  <input
                    type="checkbox"
                    checked={isDynamic}
                    onChange={e => setIsDynamic(e.target.checked)}
                    className="w-4 h-4 text-blue-900 border-blue-300 rounded focus:ring-blue-900"
                  />
                  <span className="text-sm font-bold text-blue-900">Défilement automatique</span>
                </label>
              </div>
            </div>

            {/* If dynamic, standard fields might be ignored by the frontend, but we let them edit anyway or hide them? Let's show them as fallback */}
            <div className={`space-y-6 ${isDynamic ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
              {isDynamic && (
                <div className="bg-amber-50 text-amber-800 text-sm p-3 rounded-lg border border-amber-200">
                  Le carrousel utilise les slides actifs ci-dessous. L'image principale reste le fallback si aucun slide n'est publié.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Eyebrow (FR)</label>
                  <input type="text" value={eyebrowFr} onChange={e => setEyebrowFr(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/30" placeholder={section.defaultEyebrowFr || ''} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Eyebrow (EN)</label>
                  <input type="text" value={eyebrowEn} onChange={e => setEyebrowEn(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/30" placeholder={section.defaultEyebrowEn || ''} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Titre (FR)</label>
                  <input type="text" value={titleFr} onChange={e => setTitleFr(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/30" placeholder={section.defaultTitleFr || ''} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Titre (EN)</label>
                  <input type="text" value={titleEn} onChange={e => setTitleEn(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/30" placeholder={section.defaultTitleEn || ''} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description (FR)</label>
                  <textarea rows={3} value={descriptionFr} onChange={e => setDescriptionFr(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/30" placeholder={section.defaultDescriptionFr || ''} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description (EN)</label>
                  <textarea rows={3} value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/30" placeholder={section.defaultDescriptionEn || ''} />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-900 text-white font-bold text-sm rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>

          {isDynamic && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Slides du Carrousel</h2>
                  <p className="mt-1 text-xs text-slate-500">Les slides actifs sont diffusés dans l'ordre indiqué.</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-slate-600">
                    Durée (secondes)
                    <input
                      type="number"
                      min="2"
                      max="30"
                      value={Math.round(slideDuration / 1000)}
                      onChange={e => setSlideDuration(Math.max(2000, Math.min(30000, Number(e.target.value || 6) * 1000)))}
                      className="ml-2 w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                    />
                  </label>
                  <button
                    onClick={handleAddSlide}
                    className="flex items-center gap-1 text-sm font-bold text-blue-900 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Ajouter un slide
                  </button>
                </div>
              </div>

              {slides.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Aucun slide.
                </div>
              ) : (
                <div className="space-y-6">
                  {slides.map((slide, index) => (
                    <div key={slide.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative">
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                         <button onClick={() => handleDeleteSlide(slide.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                        <span className="font-bold text-slate-700">Slide #{index + 1}</span>
                        <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <input
                            type="checkbox"
                            checked={slide.isActive !== false}
                            onChange={e => handleUpdateSlideField(slide.id, 'isActive', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-900"
                          />
                          Actif
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Titre (FR)</label>
                          <input type="text" value={slide.titleFr || ''} onChange={e => handleUpdateSlideField(slide.id, 'titleFr', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Titre (EN)</label>
                          <input type="text" value={slide.titleEn || ''} onChange={e => handleUpdateSlideField(slide.id, 'titleEn', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description (FR)</label>
                          <textarea rows={2} value={slide.descriptionFr || ''} onChange={e => handleUpdateSlideField(slide.id, 'descriptionFr', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description (EN)</label>
                          <textarea rows={2} value={slide.descriptionEn || ''} onChange={e => handleUpdateSlideField(slide.id, 'descriptionEn', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">URL Image (optionnel)</label>
                          <input type="text" value={slide.imageUrl || ''} onChange={e => handleUpdateSlideField(slide.id, 'imageUrl', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg" placeholder="https://..." />
                          <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-800 hover:bg-blue-100">
                            Téléverser une image
                            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={e => handleSlideImageUpload(slide.id, e)} />
                          </label>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Texte Bouton (optionnel)</label>
                          <input type="text" value={slide.ctaLabelFr || ''} onChange={e => handleUpdateSlideField(slide.id, 'ctaLabelFr', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg" placeholder="Label FR" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ordre</label>
                          <input type="number" min="0" value={slide.order} onChange={e => handleUpdateSlideField(slide.id, 'order', Number(e.target.value))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Lien Bouton</label>
                          <input type="text" value={slide.ctaHref || ''} onChange={e => handleUpdateSlideField(slide.id, 'ctaHref', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg" placeholder="/formations" />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button onClick={() => handleSaveSlide(slide)} className="px-4 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700">
                          Sauvegarder ce slide
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Colonne droite : Gestion de l'image de fond principale */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sticky top-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Image Principale</h2>
            
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden relative group aspect-video flex items-center justify-center mb-4">
              {imageUrl || section.defaultImageUrl ? (
                <>
                  <img
                    src={imageUrl || section.defaultImageUrl || ''}
                    alt="Hero preview"
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                       <ImageIcon className="w-4 h-4" />
                       Changer l'image
                       <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                     </label>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 transition-colors">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">Ajouter une image</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <span className="text-sm font-bold text-blue-900 animate-pulse">Upload en cours...</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Texte alternatif (SEO)</label>
              <input
                type="text"
                value={imageAlt}
                onChange={e => setImageAlt(e.target.value)}
                placeholder="Description de l'image"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-800 leading-relaxed">
              <strong>Astuce :</strong> Utilisez des images au format paysage (16:9) d'au moins 1920x1080px pour un rendu optimal sur les grands écrans. Formats acceptés: JPG, PNG, WebP (max 5Mo).
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
