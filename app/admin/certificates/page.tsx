'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AdminShell from '@/components/admin-portal/AdminShell'
import {
  Award,
  Download,
  Trash2,
  Edit,
  Plus,
  Search,
  Filter,
  Loader2,
  X,
  ChevronDown,
  Check,
  AlertCircle,
  Eye,
  Archive,
  RefreshCw,
  FileUp,
  FileText,
  CheckSquare,
  CheckCircle2,
  XCircle
} from 'lucide-react'

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface Formation {
  id: number
  title: string
}

interface Session {
  id: number
  startDate: string
  endDate: string
  formationId: number
  format: string
}

interface Certificate {
  id: number
  code: string
  type: string
  holderName: string
  status: string
  fileUrl: string | null
  issuedAt: string
  issuedBy: string | null
  studentId: string | null
  student?: Student | null
  formationId: number | null
  formation?: Formation | null
  sessionId: number | null
  session?: Session | null
}

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
const selectClassName = `${inputClassName} appearance-none`
const primaryButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 shadow-md shadow-blue-200'
const secondaryButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [formations, setFormations] = useState<Formation[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  // Toast notifications
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [formationFilter, setFormationFilter] = useState('all')
  const [sessionFilter, setSessionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Form / Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingCert, setEditingCert] = useState<Certificate | null>(null)
  
  // Add/Edit Form fields
  const [formStudentId, setFormStudentId] = useState('')
  const [formFormationId, setFormFormationId] = useState('')
  const [formSessionId, setFormSessionId] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formHolderName, setFormHolderName] = useState('')
  const [formStatus, setFormStatus] = useState('actif')
  const [formType, setFormType] = useState('completion')
  const [formIssuedAt, setFormIssuedAt] = useState('')
  const [formFile, setFormFile] = useState<File | null>(null)
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(false)

  // Fetch initial data
  const loadData = async () => {
    try {
      setLoading(true)
      setErrorMsg('')
      
      // Load certificates
      const certsRes = await fetch('/api/admin/certificates')
      if (!certsRes.ok) throw new Error('Erreur lors du chargement des certificats.')
      const certsData = await certsRes.json()
      setCertificates(certsData)

      // Load metadata
      const metaRes = await fetch('/api/admin/certificates?meta=true')
      if (!metaRes.ok) throw new Error('Erreur lors du chargement des métadonnées.')
      const metaData = await metaRes.json()
      setStudents(metaData.students || [])
      setFormations(metaData.formations || [])
      setSessions(metaData.sessions || [])

    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Auto-fill Holder Name when Student is selected
  useEffect(() => {
    if (formStudentId) {
      const stud = students.find((s) => s.id === formStudentId)
      if (stud && !editingCert) {
        setFormHolderName(`${stud.firstName} ${stud.lastName}`)
      }
    }
  }, [formStudentId, students, editingCert])

  // Filtered certificates list
  const filteredCertificates = useMemo(() => {
    return certificates.filter((c) => {
      const studentName = c.holderName || `${c.student?.firstName || ''} ${c.student?.lastName || ''}`
      const matchesSearch =
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.student?.email || '').toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFormation = formationFilter === 'all' || c.formationId === parseInt(formationFilter)
      const matchesSession = sessionFilter === 'all' || c.sessionId === parseInt(sessionFilter)
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter

      return matchesSearch && matchesFormation && matchesSession && matchesStatus
    })
  }, [certificates, searchQuery, formationFilter, sessionFilter, statusFilter])

  // Filter sessions by selected formation
  const filteredSessionsForForm = useMemo(() => {
    if (!formFormationId) return []
    return sessions.filter((s) => s.formationId === parseInt(formFormationId))
  }, [formFormationId, sessions])

  const handleOpenAddModal = () => {
    setEditingCert(null)
    setFormStudentId('')
    setFormFormationId('')
    setFormSessionId('')
    setFormCode('')
    setFormHolderName('')
    setFormStatus('actif')
    setFormType('completion')
    setFormIssuedAt(new Date().toISOString().split('T')[0])
    setFormFile(null)
    setExistingFileUrl(null)
    setShowModal(true)
  }

  const handleOpenEditModal = (cert: Certificate) => {
    setEditingCert(cert)
    setFormStudentId(cert.studentId || '')
    setFormFormationId(cert.formationId ? String(cert.formationId) : '')
    setFormSessionId(cert.sessionId ? String(cert.sessionId) : '')
    setFormCode(cert.code)
    setFormHolderName(cert.holderName)
    setFormStatus(cert.status)
    setFormType(cert.type)
    setFormIssuedAt(cert.issuedAt ? cert.issuedAt.split('T')[0] : '')
    setFormFile(null)
    setExistingFileUrl(cert.fileUrl)
    setShowModal(true)
  }

  // Handle unique ID auto-generation click
  const handleGenerateCode = () => {
    const timestamp = Date.now().toString().slice(-4)
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    const typePrefix = formType === 'completion' ? 'COMP' : formType === 'attendance' ? 'ATT' : 'EXC'
    const formationSuffix = formFormationId ? formFormationId : '0'
    setFormCode(`${typePrefix}-${formationSuffix}-${timestamp}-${random}`)
  }

  // Handle file upload & form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formStudentId || !formFormationId) {
      showNotification('Veuillez remplir les champs obligatoires.', 'error')
      return
    }

    setSubmitting(true)
    setUploadProgress(true)

    try {
      let finalFileUrl = existingFileUrl

      // If a new PDF file is uploaded
      if (formFile) {
        const fileFormData = new FormData()
        fileFormData.append('file', formFile)
        fileFormData.append('folder', 'certificates')

        const uploadRes = await fetch('/api/admin/certificates/upload', {
          method: 'POST',
          body: fileFormData
        })

        if (!uploadRes.ok) {
          let errMsg = 'Erreur lors du téléversement du fichier.'
          try {
            const uploadError = await uploadRes.json()
            errMsg = uploadError.error || errMsg
          } catch (jsonErr) {
            const text = await uploadRes.text().catch(() => '')
            errMsg = `Erreur serveur R2 (${uploadRes.status}): ${uploadRes.statusText || 'Internal Server Error'}. ${text.slice(0, 150)}`
          }
          console.error("[Certificates] Échec de l'upload du PDF:", errMsg)
          throw new Error(errMsg)
        }

        const uploadData = await uploadRes.json()
        finalFileUrl = uploadData.url
      }

      const payload = {
        code: formCode,
        studentId: formStudentId,
        formationId: parseInt(formFormationId),
        sessionId: formSessionId ? parseInt(formSessionId) : null,
        holderName: formHolderName,
        status: formStatus,
        fileUrl: finalFileUrl,
        type: formType,
        issuedAt: formIssuedAt
      }

      const method = editingCert ? 'PUT' : 'POST'
      const url = editingCert ? `/api/admin/certificates/${editingCert.id}` : '/api/admin/certificates'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde du certificat.')
      }

      showNotification(
        editingCert
          ? 'Certificat mis à jour avec succès !'
          : 'Certificat créé et associé avec succès !',
        'success'
      )
      setShowModal(false)
      loadData()
    } catch (err: any) {
      console.error(err)
      showNotification(err.message || 'Une erreur est survenue.', 'error')
    } finally {
      setUploadProgress(false)
      setSubmitting(false)
    }
  }

  // Delete certificate
  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce certificat ?')) return

    try {
      const response = await fetch(`/api/admin/certificates/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression.')
      }

      showNotification('Certificat supprimé définitivement.', 'success')
      loadData()
    } catch (err: any) {
      console.error(err)
      showNotification(err.message || 'Erreur lors de la suppression.', 'error')
    }
  }

  return (
    <AdminShell title="Gestion des Certificats Académiques">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-6 top-20 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold shadow-xl transition-all animate-fade-in-up ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
          {toast.msg}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-[280px] flex-1 md:flex-initial">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, ID ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={formationFilter}
              onChange={(e) => setFormationFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300"
            >
              <option value="all">Toutes les formations</option>
              {formations.map((f) => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300"
            >
              <option value="all">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="archive">Archivé</option>
              <option value="revoque">Révoqué</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className={primaryButtonClassName}
        >
          <Plus className="h-4 w-4" />
          Téléverser un certificat
        </button>
      </div>

      {/* Main Content List */}
      <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm">Chargement des certificats...</p>
          </div>
        ) : errorMsg ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
            <h3 className="font-bold text-slate-900">Erreur de chargement</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">{errorMsg}</p>
            <button onClick={loadData} className="mt-4 px-4 py-2 text-xs font-bold text-blue-600 hover:underline">
              Réessayer
            </button>
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Award className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="font-bold text-slate-700 text-lg">Aucun certificat trouvé</h3>
            <p className="text-sm text-slate-400 max-w-sm mt-1">
              Aucun certificat ne correspond à vos critères de recherche ou de filtre.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">ID Number / Code</th>
                  <th className="px-6 py-4">Étudiant</th>
                  <th className="px-6 py-4">Formation & Session</th>
                  <th className="px-6 py-4">Délivré le</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCertificates.map((cert) => {
                  const studentName = cert.holderName || `${cert.student?.firstName || ''} ${cert.student?.lastName || ''}`
                  return (
                    <tr key={cert.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🏆</span>
                          <div>
                            <span className="font-bold text-slate-900 block">{cert.code}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">{cert.type}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-semibold text-slate-900 block">{studentName}</span>
                          <span className="text-xs text-slate-500">{cert.student?.email || 'Non associé'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <span className="font-medium text-slate-900 block truncate">{cert.formation?.title || 'Formation Générale'}</span>
                          {cert.session && (
                            <span className="text-xs text-slate-500 block truncate">
                              Session: {new Date(cert.session.startDate).toLocaleDateString('fr-FR')} - {new Date(cert.session.endDate).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(cert.issuedAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                            cert.status === 'actif'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : cert.status === 'archive'
                              ? 'border-slate-200 bg-slate-50 text-slate-600'
                              : 'border-red-200 bg-red-50 text-red-700'
                          }`}
                        >
                          {cert.status === 'actif' ? 'Actif' : cert.status === 'archive' ? 'Archivé' : 'Révoqué'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {cert.fileUrl && (
                            <a
                              href={`/api/certificates/download/${cert.id}`}
                              className="rounded-xl p-2 hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition"
                              title="Télécharger le fichier PDF"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleOpenEditModal(cert)}
                            className="rounded-xl p-2 hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cert.id)}
                            className="rounded-xl p-2 hover:bg-red-50 text-slate-600 hover:text-red-600 transition"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span>{editingCert ? 'Modifier le certificat' : 'Téléverser un nouveau certificat'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Student selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Étudiant associé *
                </label>
                <select
                  required
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className={selectClassName}
                >
                  <option value="">Sélectionner un étudiant...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.lastName} {s.firstName} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Holder Name input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Nom complet du titulaire * (tel qu'il apparaîtra sur le document)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nom complet"
                  value={formHolderName}
                  onChange={(e) => setFormHolderName(e.target.value)}
                  className={inputClassName}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Formation selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Formation *
                  </label>
                  <select
                    required
                    value={formFormationId}
                    onChange={(e) => {
                      setFormFormationId(e.target.value)
                      setFormSessionId('') // reset session when formation changes
                    }}
                    className={selectClassName}
                  >
                    <option value="">Sélectionner...</option>
                    {formations.map((f) => (
                      <option key={f.id} value={f.id}>{f.title}</option>
                    ))}
                  </select>
                </div>

                {/* Session selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Session
                  </label>
                  <select
                    value={formSessionId}
                    disabled={!formFormationId}
                    onChange={(e) => setFormSessionId(e.target.value)}
                    className={selectClassName}
                  >
                    <option value="">Sélectionner (optionnel)...</option>
                    {filteredSessionsForForm.map((s) => (
                      <option key={s.id} value={s.id}>
                        {new Date(s.startDate).toLocaleDateString('fr-FR')} ({s.format})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Type selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Type de document
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className={selectClassName}
                  >
                    <option value="completion">Completion / Réussite</option>
                    <option value="attendance">Présence / Participation</option>
                    <option value="excellence">Excellence</option>
                  </select>
                </div>

                {/* Status selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Statut du certificat
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className={selectClassName}
                  >
                    <option value="actif">Actif (Visible étudiant)</option>
                    <option value="archive">Archivé</option>
                    <option value="revoque">Révoqué / Invalide</option>
                  </select>
                </div>
              </div>

              {/* ID Number Input with Auto Generation */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Numéro d'identification unique (ID Number) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Numéro unique (ex: CERT-1-XXXX)"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className={inputClassName}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="px-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-blue-600 font-semibold text-xs transition"
                  >
                    Générer
                  </button>
                </div>
              </div>

              {/* Issue Date & PDF Upload */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Date de délivrance *
                  </label>
                  <input
                    type="date"
                    required
                    value={formIssuedAt}
                    onChange={(e) => setFormIssuedAt(e.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Fichier PDF associé
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      id="cert-file-input"
                      onChange={(e) => setFormFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label
                      htmlFor="cert-file-input"
                      className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-3 text-xs font-semibold text-slate-600 hover:bg-white hover:border-blue-500 transition cursor-pointer"
                    >
                      <FileUp className="h-4 w-4 text-slate-400" />
                      {formFile ? formFile.name : (existingFileUrl ? 'Remplacer le PDF' : 'Sélectionner le PDF')}
                    </label>
                  </div>
                  {existingFileUrl && !formFile && (
                    <span className="text-[10px] text-slate-400 mt-1 block truncate">
                      Fichier actuel : {existingFileUrl.split('/').pop()}
                    </span>
                  )}
                </div>
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="mt-6 border-t pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className={secondaryButtonClassName}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={primaryButtonClassName}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {uploadProgress ? 'Téléversement...' : 'Sauvegarde...'}
                    </>
                  ) : (
                    'Enregistrer le certificat'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
