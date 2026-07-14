"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface SessionEvent {
  id: number;
  sessionId: number;
  title: string;
  description: string | null;
  date: string;
  startTime: string;
  endTime: string;
  type: string; // 'class', 'exam', 'meeting', 'other'
  location: string | null;
  createdAt: string;
}

interface Session {
  id: number;
  formationTitle: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  format: string;
  status: string;
}

export default function SessionEventsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<SessionEvent | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formType, setFormType] = useState('class');
  const [formLocation, setFormLocation] = useState('');

  // Notification state
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch session details
      const sessionRes = await fetch(`/api/sessions/${sessionId}`);
      if (!sessionRes.ok) throw new Error('Impossible de charger la session');
      const sessionData = await sessionRes.json();
      setSession(sessionData);

      // Fetch session events
      const eventsRes = await fetch(`/api/admin/sessions/${sessionId}/events`);
      if (!eventsRes.ok) throw new Error('Impossible de charger les événements');
      const eventsData = await eventsRes.json();
      setEvents(eventsData || []);
    } catch (err) {
      console.error(err);
      showNotification("Erreur lors de la récupération des données", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sessionId]);

  const openCreate = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormDescription('');
    setFormDate('');
    setFormStartTime(session?.startTime || '09:00');
    setFormEndTime(session?.endTime || '17:00');
    setFormType('class');
    setFormLocation(session?.location || '');
    setShowForm(true);
  };

  const openEdit = (item: SessionEvent) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormDescription(item.description || '');
    setFormDate(new Date(item.date).toISOString().split('T')[0]);
    setFormStartTime(item.startTime);
    setFormEndTime(item.endTime);
    setFormType(item.type);
    setFormLocation(item.location || '');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate || !formStartTime || !formEndTime) {
      showNotification("Veuillez remplir tous les champs obligatoires", "error");
      return;
    }

    const payload = {
      title: formTitle,
      description: formDescription || null,
      date: new Date(formDate).toISOString(),
      startTime: formStartTime,
      endTime: formEndTime,
      type: formType,
      location: formLocation || null
    };

    try {
      if (editingItem) {
        // Edit
        const res = await fetch(`/api/admin/sessions/${sessionId}/events/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Erreur lors de la modification");
        const updated = await res.json();
        setEvents(prev => prev.map(item => item.id === editingItem.id ? updated : item));
        showNotification("Événement modifié avec succès!");
      } else {
        // Create
        const res = await fetch(`/api/admin/sessions/${sessionId}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Erreur lors de la création");
        const created = await res.json();
        setEvents(prev => [...prev, created].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        showNotification("Événement ajouté avec succès!");
      }
      setShowForm(false);
    } catch (err) {
      console.error(err);
      showNotification("Erreur de sauvegarde", "error");
    }
  };

  const deleteEvent = async (id: number) => {
    if (!confirm("Voulez-vous supprimer cet événement de l'agenda ?")) return;
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}/events/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Erreur de suppression");
      setEvents(prev => prev.filter(item => item.id !== id));
      showNotification("Événement supprimé!");
    } catch (err) {
      console.error(err);
      showNotification("Erreur lors de la suppression", "error");
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'class': return 'Cours';
      case 'exam': return 'Évaluation / Examen';
      case 'meeting': return 'Visioconférence / Meeting';
      default: return 'Autre';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'class': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'exam': return 'bg-red-50 text-red-700 border-red-100';
      case 'meeting': return 'bg-sky-50 text-sky-700 border-sky-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-slate-50/50 min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border text-sm font-bold shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/admin/sessions/${sessionId}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-2 mb-4"
        >
          ← Retour aux détails de la session
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-blue-900 to-indigo-600 bg-clip-text text-transparent">
              Agenda de la Session
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Planifiez les cours, réunions et examens pour: <span className="font-semibold text-slate-800">{session?.formationTitle}</span>
            </p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
          >
            + Ajouter un événement
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            {editingItem ? "Modifier l'événement" : "Planifier un événement"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="evt-title" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Titre *</label>
              <input
                id="evt-title"
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="ex. Introduction au module RH"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent bg-slate-50/30"
                required
              />
            </div>
            <div>
              <label htmlFor="evt-type" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Type d'événement *</label>
              <select
                id="evt-type"
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent bg-slate-50/30 font-medium text-slate-700"
              >
                <option value="class">Cours</option>
                <option value="exam">Évaluation / Examen</option>
                <option value="meeting">Visioconférence (Zoom/Meet)</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="evt-desc" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
              <input
                id="evt-desc"
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Description rapide ou ordre du jour..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent bg-slate-50/30"
              />
            </div>
            <div>
              <label htmlFor="evt-date" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date *</label>
              <input
                id="evt-date"
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent bg-slate-50/30"
                required
              />
            </div>
            <div>
              <label htmlFor="evt-start" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Heure de début *</label>
              <input
                id="evt-start"
                type="time"
                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent bg-slate-50/30"
                required
              />
            </div>
            <div>
              <label htmlFor="evt-end" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Heure de fin *</label>
              <input
                id="evt-end"
                type="time"
                value={formEndTime}
                onChange={(e) => setFormEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent bg-slate-50/30"
                required
              />
            </div>
            <div>
              <label htmlFor="evt-loc" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Lieu / Lien Zoom</label>
              <input
                id="evt-loc"
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="Salle physique ou lien de réunion"
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

      {/* Events List display */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <span>Chargement des événements...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <span className="text-4xl">📅</span>
            <p className="text-sm mt-3">Aucun événement planifié pour cette session.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:bg-slate-100/50"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg border ${getTypeBadgeColor(evt.type)}`}>
                      {getTypeLabel(evt.type)}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{evt.title}</h3>
                  </div>

                  {evt.description && <p className="text-xs text-slate-600">{evt.description}</p>}

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 font-semibold">
                    <span>📅 {new Date(evt.date).toLocaleDateString('fr-FR')}</span>
                    <span>⏰ {evt.startTime} - {evt.endTime}</span>
                    {evt.location && <span>📍 {evt.location}</span>}
                  </div>
                </div>

                <div className="flex gap-2 self-stretch md:self-auto justify-end border-t md:border-t-0 border-slate-200/50 pt-3 md:pt-0">
                  <button
                    onClick={() => openEdit(evt)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => deleteEvent(evt.id)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-xl text-xs font-bold"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
