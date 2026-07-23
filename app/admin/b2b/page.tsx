"use client";

import { useEffect, useState, useCallback } from 'react';
import { useToastNotification } from '@/components/ui/toast';
import { RefreshCw, Search, Mail, Phone, Building2, Trash2, CheckCircle, Clock, Archive, UserCheck, MessageSquare, AlertCircle } from 'lucide-react';

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
  updatedAt: string;
}

export default function AdminB2BPage() {
  const [requests, setRequests] = useState<B2BRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<B2BRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const { success, error } = useToastNotification() || {
    success: (msg: string) => alert(msg),
    error: (msg: string) => alert(msg),
  };

  const fetchRequests = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams({
        status: statusFilter,
        page: String(page),
        limit: '10',
      });
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const res = await fetch(`/api/admin/marketing/b2b?${params.toString()}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erreur lors du chargement des demandes');
      }

      const data = await res.json();
      const loadedRequests: B2BRequest[] = Array.isArray(data.requests) ? data.requests : [];
      setRequests(loadedRequests);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || loadedRequests.length);

      // Maintain or set selected request
      if (selectedRequest) {
        const matching = loadedRequests.find(r => r.id === selectedRequest.id);
        if (matching) {
          setSelectedRequest(matching);
        }
      }
    } catch (err: any) {
      console.error('Fetch B2B requests error:', err);
      error(err.message || 'Impossible de charger les demandes B2B.');
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, searchQuery, page, error, selectedRequest]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Auto-refresh every 30 seconds for automatic synchronization with public form submissions
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRequests(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const updateRequest = async (id: number, payload: Partial<B2BRequest>) => {
    try {
      const res = await fetch(`/api/admin/marketing/b2b/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Erreur de mise à jour');
      const updated: B2BRequest = await res.json();

      setRequests(prev => prev.map(req => (req.id === id ? updated : req)));
      if (selectedRequest?.id === id) {
        setSelectedRequest(updated);
      }
      success('Statut de la demande mis à jour.');
    } catch (err) {
      console.error(err);
      error('Erreur lors de la mise à jour de la demande.');
    }
  };

  const handleDeleteRequest = async (id: number) => {
    if (!confirm('Voulez-vous supprimer définitivement cette demande B2B ?')) return;
    try {
      const res = await fetch(`/api/admin/marketing/b2b/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');

      setRequests(prev => prev.filter(req => req.id !== id));
      if (selectedRequest?.id === id) {
        setSelectedRequest(null);
      }
      success('Demande B2B supprimée avec succès.');
    } catch (err) {
      console.error(err);
      error('Erreur lors de la suppression.');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedRequest) return;
    setIsSavingNotes(true);
    await updateRequest(selectedRequest.id, { notes: internalNotes });
    setIsSavingNotes(false);
  };

  const handleSelectRequest = (req: B2BRequest) => {
    setSelectedRequest(req);
    setInternalNotes(req.notes || '');
  };

  // Stats calculation
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const contactedCount = requests.filter(r => r.status === 'contacted').length;
  const qualifiedCount = requests.filter(r => r.status === 'qualified').length;
  const archivedCount = requests.filter(r => r.status === 'archived').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase rounded-full bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3 h-3" /> Nouveau</span>;
      case 'contacted':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase rounded-full bg-sky-100 text-sky-800 border border-sky-200"><Phone className="w-3 h-3" /> Contacté</span>;
      case 'qualified':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle className="w-3 h-3" /> Qualifié</span>;
      case 'archived':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase rounded-full bg-slate-100 text-slate-700 border border-slate-200"><Archive className="w-3 h-3" /> Archivé</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-full bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-slate-50/50 min-h-screen font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-blue-900 via-indigo-800 to-red-600 bg-clip-text text-transparent">
            Demandes Entreprises & B2B
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez, qualifiez et suivez les demandes d'accompagnement corporate envoyées depuis l'Espace Entreprises.
          </p>
        </div>

        <button
          onClick={() => fetchRequests(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-blue-900 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Actualisation...' : 'Actualiser la liste'}
        </button>
      </div>

      {/* KPI CRM Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Demandes</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Nouveaux (En attente)</p>
            <p className="text-3xl font-extrabold text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-sky-600 uppercase tracking-wider">En cours / Contactés</p>
            <p className="text-3xl font-extrabold text-sky-600 mt-1">{contactedCount}</p>
          </div>
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
            <Phone className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Qualifiés / Signés</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{qualifiedCount}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-150 p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher entreprise, nom, email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/50"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'pending', label: 'Nouveau' },
            { id: 'contacted', label: 'Contacté' },
            { id: 'qualified', label: 'Qualifié' },
            { id: 'archived', label: 'Archivé' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setStatusFilter(tab.id); setPage(1); }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                statusFilter === tab.id
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Requests List Column */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Liste des Demandes Corporate ({totalCount})</span>
            {refreshing && <span className="text-[11px] text-blue-900 font-semibold animate-pulse">Mise à jour en cours...</span>}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-[420px] max-h-[650px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-72 text-slate-400 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-900" />
                <span className="text-xs font-semibold">Chargement des demandes B2B...</span>
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-72 text-slate-400 text-center px-4">
                <Building2 className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-700">Aucune demande B2B disponible</p>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  {searchQuery ? "Aucun résultat ne correspond à votre recherche." : "Les nouvelles demandes soumises sur le site s'afficheront automatiquement ici."}
                </p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => handleSelectRequest(req)}
                  className={`p-5 cursor-pointer transition-all hover:bg-slate-50 ${
                    selectedRequest?.id === req.id ? 'bg-blue-50/40 border-l-4 border-blue-900 shadow-inner' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {req.company}
                      </h3>
                      <p className="text-xs font-semibold text-blue-900 mt-0.5">
                        Besoin: <span className="font-bold">{req.needType}</span>
                      </p>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-600 mt-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <p><span className="text-slate-400">Contact:</span> <span className="font-medium text-slate-800">{req.contactName}</span> {req.position ? `(${req.position})` : ''}</p>
                    <p><span className="text-slate-400">Email:</span> <span className="font-medium text-slate-800">{req.email}</span></p>
                  </div>

                  {req.message && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-2 italic font-serif">
                      "{req.message}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                    <span>Reçu le: {new Date(req.createdAt).toLocaleString('fr-FR')}</span>
                    {req.notes && <span className="text-amber-700 font-semibold flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Note interne</span>}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3.5 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              Précédent
            </button>
            <span className="text-xs font-bold text-slate-600">Page {page} sur {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-3.5 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              Suivant
            </button>
          </div>
        </div>

        {/* Selected Request Detail Panel Column */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-150 shadow-sm p-6 flex flex-col justify-between">
          {selectedRequest ? (
            <div className="space-y-6">
              {/* Header & Actions */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{selectedRequest.company}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Reçu le {new Date(selectedRequest.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteRequest(selectedRequest.id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all"
                  title="Supprimer la demande"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Status Selector */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Statut de la demande</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateRequest(selectedRequest.id, { status: 'pending' })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      selectedRequest.status === 'pending'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" /> Nouveau
                  </button>

                  <button
                    onClick={() => updateRequest(selectedRequest.id, { status: 'contacted' })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      selectedRequest.status === 'contacted'
                        ? 'bg-sky-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" /> Contacté
                  </button>

                  <button
                    onClick={() => updateRequest(selectedRequest.id, { status: 'qualified' })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      selectedRequest.status === 'qualified'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Qualifié / Signé
                  </button>

                  <button
                    onClick={() => updateRequest(selectedRequest.id, { status: 'archived' })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      selectedRequest.status === 'archived'
                        ? 'bg-slate-700 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Archive className="w-3.5 h-3.5" /> Archivé
                  </button>
                </div>
              </div>

              {/* Organization info */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Informations Organisation</p>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 space-y-2 text-xs">
                  <p><span className="text-slate-500">Entreprise:</span> <span className="font-bold text-slate-900">{selectedRequest.company}</span></p>
                  <p><span className="text-slate-500">Secteur:</span> <span className="font-semibold text-slate-800">{selectedRequest.sector || 'Non renseigné'}</span></p>
                  <p><span className="text-slate-500">Collaborateurs:</span> <span className="font-semibold text-slate-800">{selectedRequest.employees || 'Non renseigné'}</span></p>
                  <p><span className="text-slate-500">Type de besoin:</span> <span className="font-extrabold text-blue-900">{selectedRequest.needType}</span></p>
                </div>
              </div>

              {/* Point of contact & Quick Actions */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Point de Contact</p>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 space-y-3 text-xs">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{selectedRequest.contactName}</p>
                    {selectedRequest.position && <p className="text-slate-500">{selectedRequest.position}</p>}
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
                    <a
                      href={`mailto:${selectedRequest.email}?subject=CJ DTC — Suite à votre demande de formation B2B (${selectedRequest.company})`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white font-bold rounded-xl shadow-md hover:bg-blue-800 transition-all text-xs"
                    >
                      <Mail className="w-4 h-4" />
                      Répondre directement par Email ({selectedRequest.email})
                    </a>

                    {selectedRequest.phone && (
                      <a
                        href={`tel:${selectedRequest.phone}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-800 font-bold rounded-xl border border-slate-200 hover:bg-slate-200 transition-all text-xs"
                      >
                        <Phone className="w-4 h-4 text-emerald-600" />
                        Appeler ({selectedRequest.phone})
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Message Description */}
              {selectedRequest.message && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description du besoin</p>
                  <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selectedRequest.message}
                  </div>
                </div>
              )}

              {/* Internal Notes */}
              <div className="border-t border-slate-150 pt-4">
                <label htmlFor="b2b-internal-notes" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Notes administratives & suivi interne
                </label>
                <textarea
                  id="b2b-internal-notes"
                  rows={4}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Consignez les avancées de la négociation corporate..."
                  className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50/50"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="w-full mt-2.5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 shadow-sm"
                >
                  {isSavingNotes ? 'Enregistrement...' : 'Enregistrer les notes internes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center py-20">
              <Building2 className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-700">Aucune demande sélectionnée</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Sélectionnez une demande d'entreprise dans la liste de gauche pour afficher l'ensemble de ses détails et documenter le suivi commercial.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
