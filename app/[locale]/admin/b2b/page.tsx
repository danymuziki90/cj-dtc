"use client";

import { useEffect, useState } from 'react';
import { useToastNotification } from '@/components/ui/toast';

interface B2BRequest {
  id: number;
  company: string;
  contactName: string;
  position: string | null;
  email: string;
  phone: string | null;
  sector: string | null;
  employees: string | null;
  needType: string;
  message: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

export default function AdminB2BPage() {
  const [requests, setRequests] = useState<B2BRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<B2BRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [internalNotes, setInternalNotes] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { success, error, info } = useToastNotification() || {
    success: (msg: string) => alert(msg),
    error: (msg: string) => alert(msg),
    info: (msg: string) => alert(msg)
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/marketing/b2b?status=${statusFilter}&page=${page}&limit=8`);
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const data = await res.json();
      setRequests(data.requests || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
      error("Impossible de charger les demandes B2B.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, page]);

  const updateRequest = async (id: number, payload: Partial<B2BRequest>) => {
    try {
      const res = await fetch(`/api/admin/marketing/b2b/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Erreur de mise à jour");
      const updated = await res.json();
      
      setRequests(prev => prev.map(req => req.id === id ? updated : req));
      if (selectedRequest?.id === id) {
        setSelectedRequest(updated);
      }
      success("Demande mise à jour.");
    } catch (err) {
      console.error(err);
      error("Erreur de mise à jour.");
    }
  };

  const deleteRequest = async (id: number) => {
    if (!confirm("Voulez-vous supprimer définitivement cette demande ?")) return;
    try {
      const res = await fetch(`/api/admin/marketing/b2b/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Erreur de suppression");
      
      setRequests(prev => prev.filter(req => req.id !== id));
      if (selectedRequest?.id === id) {
        setSelectedRequest(null);
      }
      success("Demande supprimée.");
    } catch (err) {
      console.error(err);
      error("Erreur lors de la suppression.");
    }
  };

  const handleSaveNotes = () => {
    if (!selectedRequest) return;
    updateRequest(selectedRequest.id, { notes: internalNotes });
  };

  const handleSelectRequest = (req: B2BRequest) => {
    setSelectedRequest(req);
    setInternalNotes(req.notes || '');
  };

  // KPI calculations
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const contactedCount = requests.filter(r => r.status === 'contacted').length;
  const qualifiedCount = requests.filter(r => r.status === 'qualified').length;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-blue-900 to-indigo-600 bg-clip-text text-transparent">
            Prospects & Demandes B2B
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez et suivez les demandes de formation corporate et services intra-entreprises.
          </p>
        </div>
      </div>

      {/* CRM Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total demandes</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl font-bold">
            🏢
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">En attente</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl font-bold">
            ⏳
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contactés</p>
            <p className="text-3xl font-bold text-sky-600 mt-1">{contactedCount}</p>
          </div>
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center text-xl font-bold">
            📞
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Qualifiés / Signés</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{qualifiedCount}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl font-bold">
            🤝
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* B2B Requests List Column */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          {/* Header Filters */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
            <span className="text-sm font-semibold text-slate-700">Demandes d'entreprises</span>
            <div className="flex gap-2">
              {['all', 'pending', 'contacted', 'qualified', 'archived'].map((status) => (
                <button
                  key={status}
                  onClick={() => { setStatusFilter(status); setPage(1); }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    statusFilter === status
                      ? 'bg-blue-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {status === 'all' ? 'Tous' : status === 'pending' ? 'Nouveau' : status === 'contacted' ? 'Contacté' : status === 'qualified' ? 'Qualifié' : 'Archivé'}
                </button>
              ))}
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center h-64 text-slate-400">
                <span>Chargement des demandes...</span>
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <span className="text-3xl">🏢</span>
                <span className="text-sm mt-2">Aucune demande trouvée.</span>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => handleSelectRequest(req)}
                  className={`p-6 cursor-pointer transition-all hover:bg-slate-50/80 ${
                    selectedRequest?.id === req.id ? 'bg-blue-50/30 border-l-4 border-blue-900' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {req.company}
                      </h3>
                      <p className="text-xs text-slate-500">Besoin: <span className="font-semibold text-slate-700">{req.needType}</span></p>
                      <p className="text-xs text-slate-400 mt-0.5">Par: {req.contactName} ({req.email})</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                      req.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      req.status === 'contacted' ? 'bg-sky-100 text-sky-800' :
                      req.status === 'qualified' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {req.status === 'pending' ? 'Nouveau' : req.status === 'contacted' ? 'Contacté' : req.status === 'qualified' ? 'Qualifié' : 'Archivé'}
                    </span>
                  </div>
                  {req.message && <p className="text-xs text-slate-500 line-clamp-2 mt-1">{req.message}</p>}
                  <p className="text-[10px] text-slate-400 mt-2">Reçu le: {new Date(req.createdAt).toLocaleString('fr-FR')}</p>
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

        {/* CRM Detail / Tracking Column */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col gap-6">
          {selectedRequest ? (
            <>
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedRequest.company}</h2>
                  <p className="text-xs text-slate-500 mt-1">Reçu le {new Date(selectedRequest.createdAt).toLocaleString('fr-FR')}</p>
                </div>
                <button
                  onClick={() => deleteRequest(selectedRequest.id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all text-sm"
                  title="Supprimer la demande B2B"
                >
                  🗑️
                </button>
              </div>

              {/* Organization and Contact Data */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Informations Générales</p>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5">
                    <p><span className="text-slate-500">Secteur:</span> <span className="font-medium text-slate-800">{selectedRequest.sector || '—'}</span></p>
                    <p><span className="text-slate-500">Collaborateurs:</span> <span className="font-medium text-slate-800">{selectedRequest.employees || '—'}</span></p>
                    <p><span className="text-slate-500">Type de besoin:</span> <span className="font-bold text-blue-900">{selectedRequest.needType}</span></p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Point de Contact</p>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5">
                    <p><span className="text-slate-500">Nom complet:</span> <span className="font-bold text-slate-800">{selectedRequest.contactName}</span></p>
                    <p><span className="text-slate-500">Fonction:</span> <span className="font-medium text-slate-800">{selectedRequest.position || '—'}</span></p>
                    <p><span className="text-slate-500">Email:</span> <a href={`mailto:${selectedRequest.email}`} className="text-blue-600 hover:underline">{selectedRequest.email}</a></p>
                    {selectedRequest.phone && <p><span className="text-slate-500">Téléphone:</span> <span className="font-medium text-slate-800">{selectedRequest.phone}</span></p>}
                  </div>
                </div>
              </div>

              {selectedRequest.message && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description du besoin</p>
                  <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap max-h-[150px] overflow-y-auto">
                    {selectedRequest.message}
                  </div>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Suivi Commercial</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateRequest(selectedRequest.id, { status: 'pending' })}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                      selectedRequest.status === 'pending'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    En attente
                  </button>
                  <button
                    onClick={() => updateRequest(selectedRequest.id, { status: 'contacted' })}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                      selectedRequest.status === 'contacted'
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Contacté
                  </button>
                  <button
                    onClick={() => updateRequest(selectedRequest.id, { status: 'qualified' })}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                      selectedRequest.status === 'qualified'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Qualifié
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <label htmlFor="crm-notes" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes administratives internes</label>
                <textarea
                  id="crm-notes"
                  rows={4}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Écrire les avancées de la négociation corporate..."
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
              <span className="text-4xl">🏢</span>
              <p className="text-sm font-medium mt-3">Sélectionnez un prospect dans la liste pour voir sa fiche et documenter le suivi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
