"use client";

import { useEffect, useState } from 'react';
import { useToastNotification } from '@/components/ui/toast';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

export default function AdminContactsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [internalNotes, setInternalNotes] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // We destructure toast notification handlers
  const { success, error, info } = useToastNotification() || {
    success: (msg: string) => alert(msg),
    error: (msg: string) => alert(msg),
    info: (msg: string) => alert(msg)
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/marketing/contacts?status=${statusFilter}&page=${page}&limit=8`);
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const data = await res.json();
      setMessages(data.messages || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
      error("Impossible de charger les messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter, page]);

  const updateMessage = async (id: number, payload: Partial<ContactMessage>) => {
    try {
      const res = await fetch(`/api/admin/marketing/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Erreur de mise à jour");
      const updated = await res.json();
      
      setMessages(prev => prev.map(msg => msg.id === id ? updated : msg));
      if (selectedMessage?.id === id) {
        setSelectedMessage(updated);
      }
      success("Message mis à jour avec succès.");
    } catch (err) {
      console.error(err);
      error("Erreur lors de la mise à jour.");
    }
  };

  const deleteMessage = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce message ?")) return;
    try {
      const res = await fetch(`/api/admin/marketing/contacts/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Erreur de suppression");
      
      setMessages(prev => prev.filter(msg => msg.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      success("Message supprimé.");
    } catch (err) {
      console.error(err);
      error("Erreur lors de la suppression.");
    }
  };

  const handleSaveNotes = () => {
    if (!selectedMessage) return;
    updateMessage(selectedMessage.id, { notes: internalNotes });
  };

  const handleSelectMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setInternalNotes(msg.notes || '');
    if (msg.status === 'unread') {
      updateMessage(msg.id, { status: 'read' });
    }
  };

  // Stats counters
  const totalCount = messages.length;
  const unreadCount = messages.filter(m => m.status === 'unread').length;
  const repliedCount = messages.filter(m => m.status === 'replied').length;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-blue-900 to-indigo-600 bg-clip-text text-transparent">
            Messages de Contact
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Consultez et suivez les messages reçus depuis le formulaire de contact public.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total des messages</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl font-bold">
            ✉️
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Non lus</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{unreadCount}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl font-bold">
            🔔
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Répondus</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{repliedCount}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl font-bold">
            ✅
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Messages List Column */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          {/* Filters header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
            <span className="text-sm font-semibold text-slate-700">Messages reçus</span>
            <div className="flex gap-2">
              {['all', 'unread', 'read', 'replied', 'archived'].map((status) => (
                <button
                  key={status}
                  onClick={() => { setStatusFilter(status); setPage(1); }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    statusFilter === status
                      ? 'bg-blue-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {status === 'all' ? 'Tous' : status === 'unread' ? 'Non lus' : status === 'read' ? 'Lus' : status === 'replied' ? 'Répondus' : 'Archivés'}
                </button>
              ))}
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center h-64 text-slate-400">
                <span>Chargement des messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <span className="text-3xl">📭</span>
                <span className="text-sm mt-2">Aucun message trouvé.</span>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-6 cursor-pointer transition-all hover:bg-slate-50/80 ${
                    selectedMessage?.id === msg.id ? 'bg-blue-50/30 border-l-4 border-blue-900' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className={`text-sm font-bold ${msg.status === 'unread' ? 'text-slate-900' : 'text-slate-600'}`}>
                        {msg.subject}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">De: {msg.name} ({msg.email})</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                      msg.status === 'unread' ? 'bg-amber-100 text-amber-800' :
                      msg.status === 'replied' ? 'bg-emerald-100 text-emerald-800' :
                      msg.status === 'archived' ? 'bg-slate-100 text-slate-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {msg.status === 'unread' ? 'Nouveau' : msg.status === 'replied' ? 'Répondu' : msg.status === 'archived' ? 'Archivé' : 'Lu'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{msg.message}</p>
                  <p className="text-[10px] text-slate-400 mt-2">Reçu le: {new Date(msg.createdAt).toLocaleString('fr-FR')}</p>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <span className="text-xs text-slate-500 font-medium">Page {page} sur {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>

        {/* Message Details / CRM Column */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col gap-6">
          {selectedMessage ? (
            <>
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedMessage.subject}</h2>
                  <p className="text-xs text-slate-500 mt-1">Reçu le {new Date(selectedMessage.createdAt).toLocaleString('fr-FR')}</p>
                </div>
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all text-sm"
                  title="Supprimer le message"
                >
                  🗑️
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Expéditeur</p>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs">
                  <p className="font-bold text-slate-800">{selectedMessage.name}</p>
                  <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline mt-0.5 block">{selectedMessage.email}</a>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Message</p>
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap min-h-[150px]">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Statut de traitement</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateMessage(selectedMessage.id, { status: 'replied' })}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                      selectedMessage.status === 'replied'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Marquer répondu
                  </button>
                  <button
                    onClick={() => updateMessage(selectedMessage.id, { status: 'archived' })}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                      selectedMessage.status === 'archived'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Archiver
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <label htmlFor="notes" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes administratives internes</label>
                <textarea
                  id="notes"
                  rows={4}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Ajouter un mémo de suivi..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent bg-slate-50/30"
                />
                <button
                  onClick={handleSaveNotes}
                  className="w-full mt-2 py-2 bg-blue-900 text-white font-bold text-xs rounded-xl hover:bg-blue-800 transition-all"
                >
                  Enregistrer les notes
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center py-12">
              <span className="text-4xl">🔍</span>
              <p className="text-sm font-medium mt-3">Sélectionnez un message dans la liste pour voir les détails et administrer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
