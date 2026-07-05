'use client'

import { useEffect, useState } from 'react'

interface FormattedDateProps {
    date: string | Date
    locale?: string
    options?: Intl.DateTimeFormatOptions
}

/**
 * Composant qui formate les dates côté client uniquement
 * pour éviter les erreurs d'hydratation SSR
 */
export function FormattedDate({
    date,
    locale = 'fr-FR',
    options = { year: 'numeric', month: 'long', day: 'numeric' }
}: FormattedDateProps) {
    const [mounted, setMounted] = useState(false)
    const [formatted, setFormatted] = useState('')

    useEffect(() => {
        const dateObj = typeof date === 'string' ? new Date(date) : date
        setFormatted(dateObj.toLocaleString(locale, options))
        setMounted(true)
    }, [date, locale, options])

    // Retourner un placeholder de la même taille pour éviter layout shift
    if (!mounted) {
        return <span className="inline-block w-48 h-6 bg-gray-200 rounded animate-pulse"></span>
    }

    return <span>{formatted}</span>
}

/**
 * Fonction utilitaire pour formater les dates côté client
 * À utiliser uniquement dans les composants 'use client'
 */
export function formatDateClient(
    dateString: string | Date,
    locale: string = 'fr-FR',
    options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
): string {
    try {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString
        return date.toLocaleDateString(locale, options)
    } catch (error) {
        console.error('Erreur formatage date:', error)
        return 'Date invalide'
    }
}
