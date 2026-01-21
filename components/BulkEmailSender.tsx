'use client'

import { useState } from 'react'

interface BulkEmailSenderProps {
    acceptedEnrollments: (any & { formation: { id: number; title: string; slug: string } })[]
}

export default function BulkEmailSender({ acceptedEnrollments }: BulkEmailSenderProps) {
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!subject.trim() || !message.trim()) {
            setResult({ type: 'error', message: 'Le sujet et le message sont obligatoires' })
            return
        }

        if (acceptedEnrollments.length === 0) {
            setResult({ type: 'error', message: 'Aucune inscription acceptée à traiter' })
            return
        }

        setIsLoading(true)
        setResult(null)

        try {
            const response = await fetch('/api/enrollments/send-bulk-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientIds: acceptedEnrollments.map(e => e.id),
                    subject,
                    message
                })
            })

            const data = await response.json()

            if (response.ok) {
                setResult({
                    type: 'success',
                    message: `✅ Email envoyé à ${data.sent} destinataire${data.sent > 1 ? 's' : ''}`
                })
                setSubject('')
                setMessage('')
                setShowForm(false)
            } else {
                setResult({
                    type: 'error',
                    message: data.error || 'Erreur lors de l\'envoi des emails'
                })
            }
        } catch (error) {
            setResult({
                type: 'error',
                message: 'Erreur de connexion au serveur'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="mb-8 p-6 bg-white border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-xl font-semibold text-cjblue mb-1">📧 Envoyer un email en masse</h3>
                    <p className="text-sm text-gray-600">
                        Destinataires: <span className="font-semibold text-cjblue">{acceptedEnrollments.length}</span> inscription{acceptedEnrollments.length > 1 ? 's' : ''} acceptée{acceptedEnrollments.length > 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`px-4 py-2 rounded font-semibold transition ${showForm
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-cjblue text-white hover:bg-blue-700'
                        }`}
                >
                    {showForm ? 'Annuler' : 'Composer un email'}
                </button>
            </div>

            {result && (
                <div
                    className={`p-4 rounded mb-4 ${result.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                        }`}
                >
                    {result.message}
                </div>
            )}

            {showForm && acceptedEnrollments.length > 0 && (
                <form onSubmit={handleSend} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Objet du mail
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Ex: Félicitations pour votre acceptation!"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cjblue"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Tapez votre message ici... Vous pouvez utiliser {firstName}, {lastName}, {email}, {formationTitle} comme variables"
                            rows={8}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cjblue font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            📝 Variables disponibles: {'{'} firstName {'}'}, {'{'} lastName {'}'}, {'{'} email {'}'}, {'{'} formationTitle {'}'}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {isLoading ? 'Envoi en cours...' : `Envoyer à ${acceptedEnrollments.length} destinataire${acceptedEnrollments.length > 1 ? 's' : ''}`}
                        </button>
                    </div>
                </form>
            )}

            {showForm && acceptedEnrollments.length === 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                    ⚠️ Aucune inscription acceptée. Les emails ne peuvent être envoyés qu'aux inscriptions avec le statut "accepté".
                </div>
            )}
        </div>
    )
}
