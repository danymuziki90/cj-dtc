"use client";

import { useEffect, useState } from 'react';
import { useToastNotification } from '@/components/ui/toast';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export default function AdminFAQPage() {
  const [faqList, setFaqList] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);

  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formOrder, setFormOrder] = useState(0);

  const { success, error, info } = useToastNotification() || {
    success: (msg: string) => alert(msg),
    error: (msg: string) => alert(msg),
    info: (msg: string) => alert(msg)
  };

  const fetchFAQ = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/marketing/faq');
      if (!res.ok) throw new Error('Erreur de chargement');
      const data = await res.json();
      setFaqList(data || []);
    } catch (err) {
      console.error(err);
      error("Impossible de charger la FAQ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQ();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setFormQuestion('');
    setFormAnswer('');
    setFormCategory('General');
    setFormOrder(0);
    setShowForm(true);
  };

  const openEdit = (item: FAQItem) => {
    setEditingItem(item);
    setFormQuestion(item.question);
    setFormAnswer(item.answer);
    setFormCategory(item.category);
    setFormOrder(item.order);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formAnswer.trim()) {
      error("Veuillez remplir la question et la réponse.");
      return;
    }

    const payload = {
      question: formQuestion,
      answer: formAnswer,
      category: formCategory,
      order: formOrder
    };

    try {
      if (editingItem) {
        // Edit
        const res = await fetch(`/api/admin/marketing/faq/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Erreur de modification");
        const updated = await res.json();
        setFaqList(prev => prev.map(item => item.id === editingItem.id ? updated : item));
        success("FAQ modifiée avec succès.");
      } else {
        // Create
        const res = await fetch('/api/admin/marketing/faq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Erreur de création");
        const created = await res.json();
        setFaqList(prev => [...prev, created]);
        success("Question ajoutée à la FAQ.");
      }
      setShowForm(false);
    } catch (err) {
      console.error(err);
      error("Erreur lors de la sauvegarde.");
    }
  };

  const deleteFAQ = async (id: number) => {
    if (!confirm("Voulez-vous supprimer cette question de la FAQ ?")) return;
    try {
      const res = await fetch(`/api/admin/marketing/faq/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Erreur");
      setFaqList(prev => prev.filter(item => item.id !== id));
      success("Question de la FAQ supprimée.");
    } catch (err) {
      console.error(err);
      error("Erreur lors de la suppression.");
    }
  };

  // Group FAQ items by category
  const categories = Array.from(new Set(faqList.map(item => item.category)));

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-blue-900 to-indigo-600 bg-clip-text text-transparent">
            FAQ Dynamique
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez les questions fréquemment posées affichées sur les espaces publics de la plateforme.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
        >
          + Ajouter une FAQ
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            {editingItem ? "Modifier la FAQ" : "Nouvelle question FAQ"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="faq-question" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Question *</label>
              <input
                id="faq-question"
                type="text"
                value={formQuestion}
                onChange={(e) => setFormQuestion(e.target.value)}
                placeholder="ex. Comment s'inscrire à une formation ?"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent bg-slate-50/30"
                required
              />
            </div>
            <div>
              <label htmlFor="faq-category" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Catégorie</label>
              <select
                id="faq-category"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent bg-slate-50/30 font-medium text-slate-700"
              >
                <option value="General">Général</option>
                <option value="Inscriptions">Inscriptions</option>
                <option value="Formations">Formations</option>
                <option value="Technique">Support Technique</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="faq-answer" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Réponse *</label>
              <textarea
                id="faq-answer"
                rows={4}
                value={formAnswer}
                onChange={(e) => setFormAnswer(e.target.value)}
                placeholder="Rédiger la réponse détaillée..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent bg-slate-50/30"
                required
              />
            </div>
            <div>
              <label htmlFor="faq-order" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ordre de tri</label>
              <input
                id="faq-order"
                type="number"
                value={formOrder}
                onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent bg-slate-50/30"
              />
            </div>

            <div className="md:col-span-3 flex gap-2 justify-end mt-4">
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

      {/* Accordion / List display */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <span>Chargement de la FAQ...</span>
          </div>
        ) : faqList.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <span className="text-4xl">❓</span>
            <p className="text-sm mt-3">Aucune FAQ disponible. Cliquez sur "+ Ajouter" pour créer des questions-réponses.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category} className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                  📂 {category}
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {faqList
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between gap-4"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-extrabold text-slate-900 text-sm">{item.question}</h3>
                            <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap leading-relaxed">{item.answer}</p>
                          </div>
                          <span className="text-xs font-semibold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shrink-0">
                            Ordre: {item.order}
                          </span>
                        </div>
                        <div className="flex gap-2 justify-end border-t border-slate-200/40 pt-3">
                          <button
                            onClick={() => openEdit(item)}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => deleteFAQ(item.id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-xl text-xs font-bold"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
