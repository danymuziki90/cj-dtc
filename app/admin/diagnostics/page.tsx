'use client'

import { useState } from 'react'
import AdminShell from '@/components/admin-portal/AdminShell'
import { Loader2, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'

function StatusIcon({ ok }: { ok: boolean | null | undefined }) {
  if (ok === null || ok === undefined) return <AlertTriangle className="h-4 w-4 text-amber-500" />
  return ok
    ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    : <XCircle className="h-4 w-4 text-red-500" />
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean | null }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
      <div className="mt-0.5 shrink-0"><StatusIcon ok={ok} /></div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-700">{label}</p>
        <p className="text-xs text-slate-500 break-all mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function DiagnosticsPage() {
  const [r2Data,  setR2Data]  = useState<any>(null)
  const [jwtData, setJwtData] = useState<any>(null)
  const [r2Loading,  setR2Loading]  = useState(false)
  const [jwtLoading, setJwtLoading] = useState(false)
  const [r2Error,  setR2Error]  = useState<string | null>(null)
  const [jwtError, setJwtError] = useState<string | null>(null)

  async function runR2() {
    setR2Loading(true); setR2Error(null)
    try {
      const res = await fetch('/api/admin/r2-diagnostic', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
      setR2Data(json)
    } catch (e: any) { setR2Error(e.message) }
    finally { setR2Loading(false) }
  }

  async function runJwt() {
    setJwtLoading(true); setJwtError(null)
    try {
      const res = await fetch('/api/admin/security-overview', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
      setJwtData(json)
    } catch (e: any) { setJwtError(e.message) }
    finally { setJwtLoading(false) }
  }

  return (
    <AdminShell title="Diagnostics système">
      <div className="max-w-4xl space-y-6">

        {/* ── R2 Section ── */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">☁️ Cloudflare R2 — Stockage fichiers</h2>
              <p className="text-xs text-slate-500 mt-0.5">Vérifie la connexion, l'écriture, la lecture et l'URL publique du bucket R2.</p>
            </div>
            <button onClick={runR2} disabled={r2Loading}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--cj-blue)] px-4 py-2 text-sm font-bold text-white hover:bg-blue-900 disabled:opacity-50">
              {r2Loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Tester R2
            </button>
          </div>

          {r2Error && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700 font-semibold">⚠️ {r2Error}</div>
          )}

          {r2Data && (
            <div className="p-6 space-y-5">
              {/* Summary banner */}
              <div className={`rounded-xl px-4 py-3 font-bold text-sm border ${r2Data.summary?.status?.startsWith('✅') ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                {r2Data.summary?.status}
              </div>

              {/* Env vars */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Variables d'environnement</h3>
                <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                  {r2Data.envCheck && Object.entries(r2Data.envCheck).map(([key, val]: [string, any]) => (
                    <Row key={key} label={key} value={val.value} ok={val.present} />
                  ))}
                </div>
              </div>

              {/* Tests */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Tests de connexion</h3>
                <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                  {r2Data.bucketAccess && <Row label="Accès bucket"   value={r2Data.bucketAccess.message}  ok={r2Data.bucketAccess.ok} />}
                  {r2Data.writeTest   && <Row label="Écriture"        value={r2Data.writeTest.message}      ok={r2Data.writeTest.ok} />}
                  {r2Data.readTest    && <Row label="Lecture"         value={r2Data.readTest.message}       ok={r2Data.readTest.ok} />}
                  {r2Data.deleteTest  && <Row label="Suppression"     value={r2Data.deleteTest.message}     ok={r2Data.deleteTest.ok} />}
                  {r2Data.publicUrlTest && (
                    <Row
                      label={`URL publique${r2Data.publicUrlTest.url ? ` (${r2Data.publicUrlTest.url})` : ''}`}
                      value={r2Data.publicUrlTest.message}
                      ok={r2Data.publicUrlTest.ok}
                    />
                  )}
                </div>
              </div>

              {/* Recent uploads */}
              {r2Data.recentUploads && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                    Fichiers récents dans travaux/remises/ ({r2Data.recentUploads.count})
                  </h3>
                  {r2Data.recentUploads.files?.length > 0 ? (
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-xs text-slate-600">
                        <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                          <tr>
                            <th className="px-3 py-2 text-left">Clé</th>
                            <th className="px-3 py-2 text-left">Taille</th>
                            <th className="px-3 py-2 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {r2Data.recentUploads.files.map((f: any) => (
                            <tr key={f.key}>
                              <td className="px-3 py-2 font-mono text-slate-700 max-w-xs truncate">{f.key}</td>
                              <td className="px-3 py-2 text-slate-500">{f.size ? `${(f.size / 1024).toFixed(1)} Ko` : '—'}</td>
                              <td className="px-3 py-2 text-slate-400">{f.lastModified ? new Date(f.lastModified).toLocaleString('fr-FR') : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Aucun fichier trouvé dans travaux/remises/ — aucun dépôt étudiant enregistré sur R2.</p>
                  )}
                </div>
              )}

              {r2Data.recommendation && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 font-semibold">
                  💡 {r2Data.recommendation}
                </div>
              )}
            </div>
          )}

          {!r2Data && !r2Loading && (
            <div className="px-6 py-10 text-center text-slate-400 text-sm">
              Cliquez sur "Tester R2" pour lancer le diagnostic.
            </div>
          )}
        </div>

        {/* ── JWT / Auth section ── */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">🔐 Sécurité JWT — Authentification</h2>
              <p className="text-xs text-slate-500 mt-0.5">Vérifie les secrets JWT admin et étudiant utilisés en production.</p>
            </div>
            <button onClick={runJwt} disabled={jwtLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--cj-blue)] px-4 py-2 text-sm font-bold text-white hover:bg-blue-900 disabled:opacity-50">
              {jwtLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Tester JWT
            </button>
          </div>

          {jwtError && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700 font-semibold">⚠️ {jwtError}</div>
          )}

          {jwtData && (
            <div className="p-6 space-y-4">
              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                <Row label="Environnement"              value={jwtData.environment}                                     ok={true} />
                <Row label="Secret JWT Admin — Source"  value={jwtData.adminJwt?.source}                               ok={jwtData.adminJwt?.valid} />
                <Row label="Secret JWT Admin — Fort"    value={jwtData.adminJwt?.strong ? 'Oui ✅' : 'Non ⚠️'}         ok={jwtData.adminJwt?.strong} />
                <Row label="Admin — Fallback actif"     value={jwtData.adminJwt?.usingFallback ? 'Oui ⚠️' : 'Non ✅'}  ok={!jwtData.adminJwt?.usingFallback} />
                <Row label="Message admin"              value={jwtData.adminJwt?.message}                              ok={jwtData.adminJwt?.valid} />
                <Row label="Secret JWT Étudiant — Source" value={jwtData.studentJwt?.source}                           ok={jwtData.studentJwt?.valid} />
                <Row label="Secret JWT Étudiant — Fort"   value={jwtData.studentJwt?.strong ? 'Oui ✅' : 'Non ⚠️'}     ok={jwtData.studentJwt?.strong} />
                <Row label="Étudiant — Fallback actif"    value={jwtData.studentJwt?.usingFallback ? 'Oui ⚠️ (STUDENT_JWT_SECRET absent ou trop court — utilise NEXTAUTH_SECRET)' : 'Non ✅'} ok={!jwtData.studentJwt?.usingFallback} />
                <Row label="Message étudiant"             value={jwtData.studentJwt?.message}                          ok={jwtData.studentJwt?.valid} />
              </div>

              {(jwtData.studentJwt?.usingFallback || !jwtData.studentJwt?.strong) && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 font-semibold space-y-1">
                  <p>🚨 <strong>STUDENT_JWT_SECRET est faible ou absent.</strong></p>
                  <p>Les tokens étudiants utilisent NEXTAUTH_SECRET comme fallback. Si ce secret diffère entre déploiements, toutes les sessions étudiantes existantes sont invalidées.</p>
                  <p className="mt-2">
                    <strong>Correction :</strong> Dans Vercel → Settings → Environment Variables, ajoutez :<br />
                    <code className="bg-red-100 px-1 rounded">STUDENT_JWT_SECRET</code> = une chaîne aléatoire de 64 caractères minimum, identique en tous environnements.
                  </p>
                </div>
              )}
            </div>
          )}

          {!jwtData && !jwtLoading && (
            <div className="px-6 py-10 text-center text-slate-400 text-sm">
              Cliquez sur "Tester JWT" pour lancer le diagnostic.
            </div>
          )}
        </div>

      </div>
    </AdminShell>
  )
}
