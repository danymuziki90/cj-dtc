"use client";

import { useEffect, useState } from 'react';
import { useToastNotification } from '@/components/ui/toast';

interface Testimonial {
  id: number;
  name: string;
  location: string | null;
  quote: string;
  approved: boolean;
  order: number;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formQuote, setFormQuote] = useState('');
  const [formApproved, setFormApproved] = useState(false);
  const [formOrder, setFormOrder] = useState(0);

  const { success, error, info } = useToastNotification() || {
    success: (msg: string) => alert(msg),
    error: (msg: string) => alert(msg),
    info: (msg: string) => alert(msg)
  };

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/marketing/testimonials');
      if (!res.ok) throw new Error('Erreur de chargement');
      const data = await res.json();
      setTestimonials(data || []);
    } catch (err) {
      console.error(err);
      error("Impossible de charger les témoignages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setFormName('');
    setFormLocation('');
    setFormQuote('');
    setFormApproved(false);
    setFormOrder(0);
    setShowForm(true);
  };

  const openEdit = (item: Testimonial) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormLocation(item.location || '');
    setFormQuote(item.quote);
    setFormApproved(item.approved);
    setFormOrder(item.order);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formQuote.trim()) {
      error("Veuillez remplir les champs obligatoires.");
      return;
    }

    const payload = {
      name: formName,
      location: formLocation || null,
      quote: formQuote,
      approved: formApproved,
      order: formOrder
    };

    try {
      if (editingItem) {
        // Edit testimonial
        const res = await fetch(`/api/admin/marketing/testimonials/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Erreur de mise à jour");
        const updated = await res.json();
        setTestimonials(prev => prev.map(item => item.id === editingItem.id ? updated : item));
        success("Témoignage modifié avec succès.");
      } else {
        // Create testimonial
        const res = await fetch('/api/admin/marketing/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Erreur de création");
        const created = await res.json();
        setTestimonials(prev => [created, ...prev]);
        success("Témoignage ajouté avec succès.");
      }
      setShowForm(false);
    } catch (err) {
      console.error(err);
      error("Erreur lors de la sauvegarde.");
    }
  };

  const toggleApproval = async (item: Testimonial) => {
    try {
      const res = await fetch(`/api/admin/marketing/testimonials/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: !item.approved })
      });
      if (!res.ok) throw new Error("Erreur");
      const updated = await res.json();
      setTestimonials(prev => prev.map(t => t.id === item.id ? updated : t));
      success(updated.approved ? "Témoignage approuvé pour affichage public." : "Témoignage désactivé.");
    } catch (err) {
      console.error(err);
      error("Impossible de modifier l'approbation.");
    }
  };

  const deleteTestimonial = async (id: number) => {
    if (!confirm("Voulez-vous supprimer ce témoignage ?")) return;
    try {
      const res = await fetch(`/api/admin/marketing/testimonials/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Erreur");
      setTestimonials(prev => prev.filter(t => t.id !== id));
      success("Témoignage supprimé.");
    } catch (err) {
      console.error(err);
      error("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-blue-900 to-indigo-600 bg-clip-text text-transparent">
            Témoignages Étudiants
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez et ordonnez les avis affichés en page d'accueil de la plateforme.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
        >
          + Ajouter un témoignage
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            {editingItem ? "Modifier le témoignage" : "Nouveau témoignage"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="student-name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nom de l'étudiant *</label>
              <input
                id="student-name"
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="ex. Marie Mwamba"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent bg-slate-50/30"
                required
              />
            </div>
            <div>
              <label htmlFor="student-location" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Provenance / Rôle</label>
              <input
                id="student-location"
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="ex. Kinshasa, RDC ou Alumni"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent bg-slate-50/30"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="student-quote" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Citation / Témoignage *</label>
              <textarea
                id="student-quote"
                rows={3}
                value={formQuote}
                onChange={(e) => setFormQuote(e.target.value)}
                placeholder="Écrire le témoignage..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent bg-slate-50/30"
                required
              />
            </div>
            <div>
              <label htmlFor="student-order" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ordre d'affichage</label>
              <input
                id="student-order"
                type="number"
                value={formOrder}
                onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent bg-slate-50/30"
              />
            </div>
            <div className="flex items-center gap-2 mt-8">
              <input
                id="student-approved"
                type="checkbox"
                checked={formApproved}
                onChange={(e) => setFormApproved(e.target.checked)}
                className="rounded text-blue-900 focus:ring-blue-900 w-4 h-4"
              />
              <label htmlFor="student-approved" className="text-xs font-semibold text-slate-700 select-none">Approuver directement pour affichage public</label>
            </div>

            <div className="md:col-span-2 flex gap-2 justify-end mt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-xs"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-900 text-white rounded-xl hover:bg-blue-800 font-bold text-xs shadow-sm"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Testimonials */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <span>Chargement des témoignages...</span>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <span className="text-4xl">💬</span>
            <p className="text-sm mt-3">Aucun témoignage enregistré. Cliquez sur "+ Ajouter" pour en créer un.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                      {item.location && <p className="text-xs text-slate-400">{item.location}</p>}
                    </div>
                    <span className="text-xs font-semibold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                      Ordre: {item.order}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 italic whitespace-pre-wrap mb-4">
                    "{item.quote}"
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200/50 pt-4 mt-2">
                  <button
                    onClick={() => toggleApproval(item)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase transition-all ${
                      item.approved
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }`}
                  >
                    {item.approved ? '✅ Public' : '❌ Masqué'}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteTestimonial(item.id)}
                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-xl text-xs"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
