'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Image as ImageIcon,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Check,
  Clock,
  Sparkles,
  Layers,
  UploadCloud,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useToastNotification } from '@/components/ui/toast';
import type { HeroSectionData, HeroSlideData } from '@/lib/hero/types';

export default function AdminHeroEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();

  const [section, setSection] = useState<HeroSectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSlideId, setSavingSlideId] = useState<string | null>(null);

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

  const uploadErrorMessage = (caughtError: unknown, fallback: string) => {
    if (caughtError instanceof TypeError && /fetch/i.test(caughtError.message)) {
      return 'Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.';
    }
    return caughtError instanceof Error ? caughtError.message : fallback;
  };

  const fetchSection = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/heroes/${id}`);
      if (!res.ok) throw new Error('Introuvable');
      const data = await res.json();
      setSection(data);

      setIsActive(data.isActive !== false);
      setIsDynamic(data.carouselEnabled !== false);
      setSlideDuration(data.slideDuration || 6000);
      setCompact(Boolean(data.compact));
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
      error('Impossible de charger cette section.');
      router.push('/admin/heroes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSection();
  }, [id]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        }),
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

      success('Bannière mise à jour avec succès.');
      fetchSection();
    } catch (err: any) {
      error(err.message || 'Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('Veuillez sélectionner une image valide.');
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
        let errorMsg = "Erreur d'upload";
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const d = await res.json();
          errorMsg = d.error || errorMsg;
        } else if (res.status === 413) {
          errorMsg = "L'image est trop volumineuse pour être envoyée (max 4.5 Mo).";
        } else {
          errorMsg = `Erreur serveur (${res.status})`;
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      setImageUrl(data.url || data.imageUrl);
      success('Image uploadée et sauvegardée avec succès.');
    } catch (err: unknown) {
      error(uploadErrorMessage(err, "Impossible de téléverser l'image."));
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAddSlide = async () => {
    try {
      const res = await fetch(`/api/admin/heroes/${id}/slides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: slides.length }),
      });
      if (!res.ok) {
        let errorMsg = "Erreur d'ajout";
        if (res.headers.get('content-type')?.includes('application/json')) {
          const d = await res.json();
          errorMsg = d.error || errorMsg;
        }
        throw new Error(errorMsg);
      }
      success('Nouveau slide ajouté.');
      await fetchSection();
    } catch (err: any) {
      error(err?.message || "Erreur d'ajout de slide");
    }
  };

  const handleUpdateSlideField = (slideId: string, field: string, value: any) => {
    setSlides((prev) => prev.map((s) => (s.id === slideId ? { ...s, [field]: value } : s)));
  };

  const saveCarouselSettings = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/heroes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carouselEnabled: isDynamic, slideDuration }),
      });
      if (!res.ok) {
        let errorMsg = 'Impossible d’enregistrer les paramètres du slider.';
        try {
          const d = await res.json();
          if (d.error) errorMsg = d.error;
        } catch {}
        throw new Error(errorMsg);
      }
      success('Paramètres du slider enregistrés.');
      await fetchSection();
    } catch (err: any) {
      error(err?.message || 'Impossible d’enregistrer les paramètres du slider.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSlide = async (slide: HeroSlideData) => {
    try {
      setSavingSlideId(slide.id);
      const res = await fetch(`/api/admin/heroes/${id}/slides/${slide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slide),
      });
      if (!res.ok) {
        let errorMsg = 'Erreur de mise à jour';
        if (res.headers.get('content-type')?.includes('application/json')) {
          const d = await res.json();
          errorMsg = d.error || errorMsg;
        }
        throw new Error(errorMsg);
      }
      success('Slide mis à jour.');
    } catch (err: any) {
      error(err?.message || 'Erreur lors de la mise à jour du slide.');
    } finally {
      setSavingSlideId(null);
    }
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce slide ?')) return;
    try {
      const res = await fetch(`/api/admin/heroes/${id}/slides/${slideId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        let errorMsg = 'Erreur de suppression';
        if (res.headers.get('content-type')?.includes('application/json')) {
          const d = await res.json();
          errorMsg = d.error || errorMsg;
        }
        throw new Error(errorMsg);
      }
      success('Slide supprimé.');
      setSlides((prev) => prev.filter((s) => s.id !== slideId));
    } catch (err: any) {
      error(err?.message || 'Erreur lors de la suppression.');
    }
  };

  const handleMultipleSlideUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    try {
      for (const file of files) {
        if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
          throw new Error('Chaque image doit être valide et inférieure à 5 Mo.');
        }
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`/api/admin/heroes/${id}/slides`, { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Impossible d’ajouter une des images.');
      }
      await fetchSection();
      success(`${files.length} image(s) ajoutée(s) au slider.`);
    } catch (err: unknown) {
      error(uploadErrorMessage(err, "Erreur lors de l'ajout des images."));
    } finally {
      event.target.value = '';
    }
  };

  const handleSlideImageUpload = async (slideId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      error('Choisissez une image de moins de 5 Mo.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/admin/heroes/${id}/slides/${slideId}`, { method: 'PUT', body: formData });
      if (!res.ok) throw new Error('Upload impossible');
      const { slide } = await res.json();
      setSlides((prev) =>
        prev.map((item) => (item.id === slideId ? { ...item, imageUrl: slide.imageUrl } : item))
      );
      success('Image du slide téléversée.');
    } catch {
      error("Erreur lors du téléversement de l'image.");
    } finally {
      event.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3 p-8">
        <Loader2 className="w-8 h-8 text-blue-900 animate-spin" />
        <span className="text-sm font-medium text-slate-500">Chargement de la section Hero...</span>
      </div>
    );
  }

  if (!section) return null;

  return (
    <div className="w-full min-h-screen pb-28 sm:pb-32">
      {/* ── EN-TÊTE RESPONSIVE ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <Link
            href="/admin/heroes"
            className="shrink-0 p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            aria-label="Retour à la liste des bannières"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 capitalize truncate">
                {section.pageKey === 'home' ? 'Accueil' : section.pageKey} — Bannière
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600 animate-pulse' : 'bg-slate-500'}`}
                />
                {isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Personnalisez l'image d'arrière-plan, les textes et les options d'affichage.
            </p>
          </div>
        </div>

        {/* Boutons d'action rapides pour desktop */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <Link
            href="/admin/heroes"
            className="px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
          >
            Annuler
          </Link>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-900 text-white font-bold text-sm rounded-xl hover:bg-blue-800 active:scale-95 transition-all shadow-md shadow-blue-900/20 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>

      {/* ── GRILLE PRINCIPALE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Colonne gauche : Formulaire principal + Carrousel */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {/* Formulaire des Paramètres et Textes */}
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-6 space-y-6"
          >
            {/* Header du bloc paramètres */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-900" />
                  Paramètres de la bannière
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Configuration générale et visibilité.</p>
              </div>

              {/* Options sous forme de badges commutables */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <label
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold cursor-pointer select-none transition-colors ${
                    isActive
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  />
                  <span>Actif</span>
                </label>

                <label
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold cursor-pointer select-none transition-colors ${
                    compact
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={compact}
                    onChange={(e) => setCompact(e.target.checked)}
                    className="w-4 h-4 text-blue-900 border-slate-300 rounded focus:ring-blue-900"
                  />
                  <span>Compact</span>
                </label>

                <label
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold cursor-pointer select-none transition-colors ${
                    isDynamic
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isDynamic}
                    onChange={(e) => setIsDynamic(e.target.checked)}
                    className="w-4 h-4 text-indigo-900 border-indigo-300 rounded focus:ring-indigo-900"
                  />
                  <span>Défilement auto</span>
                </label>
              </div>
            </div>

            {/* Avertissement carrousel */}
            {isDynamic && (
              <div className="bg-indigo-50/80 text-indigo-900 text-xs sm:text-sm p-3.5 rounded-xl border border-indigo-100 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  Le mode carrousel est actif. Les slides définis ci-dessous sont diffusés en priorité. L'image
                  principale et les textes ci-dessous servent de fallback.
                </p>
              </div>
            )}

            {/* Champs Textes (FR / EN) */}
            <div className="space-y-5">
              {/* Eyebrow FR / EN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Surtitre / Eyebrow (FR)
                  </label>
                  <input
                    type="text"
                    value={eyebrowFr}
                    onChange={(e) => setEyebrowFr(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/40 transition-colors"
                    placeholder={section.defaultEyebrowFr || 'Ex : Centre de formation'}
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Surtitre / Eyebrow (EN)
                  </label>
                  <input
                    type="text"
                    value={eyebrowEn}
                    onChange={(e) => setEyebrowEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/40 transition-colors"
                    placeholder={section.defaultEyebrowEn || 'Ex: Training Center'}
                  />
                </div>
              </div>

              {/* Titre FR / EN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Titre Principal (FR)
                  </label>
                  <input
                    type="text"
                    value={titleFr}
                    onChange={(e) => setTitleFr(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/40 transition-colors"
                    placeholder={section.defaultTitleFr || 'Ex : Formations Professionnelles'}
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Titre Principal (EN)
                  </label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/40 transition-colors"
                    placeholder={section.defaultTitleEn || 'Ex: Professional Training'}
                  />
                </div>
              </div>

              {/* Description FR / EN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Description (FR)
                  </label>
                  <textarea
                    rows={3}
                    value={descriptionFr}
                    onChange={(e) => setDescriptionFr(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/40 transition-colors resize-y"
                    placeholder={section.defaultDescriptionFr || 'Description en français...'}
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Description (EN)
                  </label>
                  <textarea
                    rows={3}
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/40 transition-colors resize-y"
                    placeholder={section.defaultDescriptionEn || 'Description in English...'}
                  />
                </div>
              </div>
            </div>

            {/* Boutons d'action dans le formulaire */}
            <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <Link
                href="/admin/heroes"
                className="w-full sm:w-auto text-center px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-900 text-white font-bold text-sm rounded-xl hover:bg-blue-800 active:scale-95 transition-all shadow-md shadow-blue-900/20 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
              </button>
            </div>
          </form>

          {/* Section Slides (Carrousel) pour la page d'accueil */}
          {section.pageKey === 'home' && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-6 space-y-6">
              {/* En-tête des slides */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Slides du Carrousel
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Les slides actifs sont diffusés dans l'ordre croissant indiqué.
                  </p>
                </div>

                {/* Actions Carrousel */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Durée</span>
                    <input
                      type="number"
                      min="2"
                      max="30"
                      value={Math.round(slideDuration / 1000)}
                      onChange={(e) =>
                        setSlideDuration(Math.max(2000, Math.min(30000, Number(e.target.value || 6) * 1000)))
                      }
                      className="w-12 text-center rounded-lg border border-slate-200 px-1 py-0.5 text-xs font-bold bg-white"
                    />
                    <span>s</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSlide}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-bold text-blue-900 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter un slide</span>
                  </button>

                  <label className="inline-flex cursor-pointer items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-bold text-indigo-900 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-colors">
                    <UploadCloud className="w-4 h-4" />
                    <span>Ajouter des images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      onChange={handleMultipleSlideUpload}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={saveCarouselSettings}
                    disabled={saving}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Enregistrer</span>
                  </button>
                </div>
              </div>

              {/* Liste des slides */}
              {slides.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Aucun slide personnalisé</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Le carrousel utilise les slides par défaut du site. Ajoutez des slides personnalisés pour les
                    remplacer.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddSlide}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-900 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Créer le premier slide
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 relative space-y-4"
                    >
                      {/* En-tête du slide */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                          <span className="font-extrabold text-sm text-slate-800">Slide #{index + 1}</span>
                          {slide.imageUrl && (
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                              Image configurée
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={slide.isActive !== false}
                              onChange={(e) => handleUpdateSlideField(slide.id, 'isActive', e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                            />
                            <span>Actif</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleDeleteSlide(slide.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Supprimer ce slide"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Aperçu d'image du slide + upload */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                        <div className="relative aspect-video sm:aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center">
                          {slide.imageUrl ? (
                            <img
                              src={slide.imageUrl}
                              alt={slide.imageAlt || `Slide ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="text-center p-2 text-slate-400">
                              <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                              <span className="text-[10px] font-medium">Sans image</span>
                            </div>
                          )}
                        </div>

                        <div className="sm:col-span-2 space-y-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                              URL Image (ou téléversement)
                            </label>
                            <input
                              type="text"
                              value={slide.imageUrl || ''}
                              onChange={(e) => handleUpdateSlideField(slide.id, 'imageUrl', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg bg-white"
                              placeholder="https://..."
                            />
                            <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-900 hover:bg-blue-100 transition-colors">
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Téléverser une image</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/avif"
                                className="hidden"
                                onChange={(e) => handleSlideImageUpload(slide.id, e)}
                              />
                            </label>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Ordre</label>
                              <input
                                type="number"
                                min="0"
                                value={slide.order}
                                onChange={(e) =>
                                  handleUpdateSlideField(slide.id, 'order', Number(e.target.value))
                                }
                                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                Texte alternatif
                              </label>
                              <input
                                type="text"
                                value={slide.imageAlt || ''}
                                onChange={(e) => handleUpdateSlideField(slide.id, 'imageAlt', e.target.value)}
                                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg bg-white"
                                placeholder="Description"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Textes optionnels du slide */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                            Titre Slide (FR)
                          </label>
                          <input
                            type="text"
                            value={slide.titleFr || ''}
                            onChange={(e) => handleUpdateSlideField(slide.id, 'titleFr', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg bg-white"
                            placeholder="Titre du slide"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                            Titre Slide (EN)
                          </label>
                          <input
                            type="text"
                            value={slide.titleEn || ''}
                            onChange={(e) => handleUpdateSlideField(slide.id, 'titleEn', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg bg-white"
                            placeholder="Slide title"
                          />
                        </div>
                      </div>

                      {/* Bouton de sauvegarde du slide */}
                      <div className="flex justify-end pt-2 border-t border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => handleSaveSlide(slide)}
                          disabled={savingSlideId === slide.id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50"
                        >
                          {savingSlideId === slide.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>{savingSlideId === slide.id ? 'Sauvegarde...' : 'Sauvegarder ce slide'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Colonne droite : Gestion de l'image principale */}
        <div className="space-y-6 min-w-0">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-6 lg:sticky lg:top-24 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-900" />
              Image Principale
            </h2>

            {/* Cadre de prévisualisation */}
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden relative group aspect-video flex items-center justify-center">
              {imageUrl || section.defaultImageUrl ? (
                <>
                  <img
                    src={imageUrl || section.defaultImageUrl || ''}
                    alt={imageAlt || 'Hero preview'}
                    className="object-cover w-full h-full"
                  />
                  {/* Overlay avec bouton accessible au hover et sur mobile */}
                  <div className="absolute inset-0 bg-slate-950/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-3">
                    <label className="cursor-pointer bg-white text-slate-900 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 hover:scale-105 transition-transform shadow-lg">
                      <ImageIcon className="w-4 h-4" />
                      <span>Remplacer l'image</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-6 text-slate-400 hover:text-blue-900 hover:bg-blue-50/50 transition-colors">
                  <ImageIcon className="w-10 h-10 mb-2" />
                  <span className="text-xs sm:text-sm font-bold text-slate-700">Ajouter une image</span>
                  <span className="text-[11px] text-slate-400 mt-1">PNG, JPG, WebP jusqu'à 4.5 Mo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              )}

              {uploadingImage && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 gap-2">
                  <Loader2 className="w-6 h-6 text-blue-900 animate-spin" />
                  <span className="text-xs font-bold text-blue-900">Téléversement en cours...</span>
                </div>
              )}
            </div>

            {/* Bouton visible explicite pour téléverser sur mobile sans dépendre du hover */}
            {(imageUrl || section.defaultImageUrl) && (
              <label className="w-full cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                <UploadCloud className="w-4 h-4 text-slate-600" />
                <span>Changer l'image principale</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            )}

            {/* URL directe manuelle */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                URL directe de l'image (optionnel)
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/40"
              />
            </div>

            {/* Balise ALT */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Texte alternatif SEO (ALT)
              </label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Description concise pour les moteurs de recherche"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/40"
              />
            </div>

            {/* Conseil de format */}
            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
              <strong>Conseil d'optimisation :</strong> Privilégiez un ratio 16:9 (ex : 1920×1080 px) en format WebP
              ou JPG pour une netteté maximale et un chargement rapide.
            </div>
          </div>
        </div>
      </div>

      {/* ── BARRE D'ACTIONS FIXE (STICKY BOTTOM ACTION BAR) ── */}
      {/* Toujours visible et accessible, quelle que soit la hauteur ou largeur d'écran */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              Édition Hero · Page : <strong className="capitalize text-slate-800">{section.pageKey}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Link
              href="/admin/heroes"
              className="flex-1 sm:flex-initial text-center px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors min-h-[44px] flex items-center justify-center"
            >
              Annuler
            </Link>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-900 text-white font-bold text-sm rounded-xl hover:bg-blue-800 active:scale-95 transition-all shadow-md shadow-blue-900/20 disabled:opacity-50 min-h-[44px]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
