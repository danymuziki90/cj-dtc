'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Formation {
    id: number
    title: string
    slug: string
    description: string
    imageUrl: string | null
    createdAt: string
}

export default function RecentFormations() {
    const [formations, setFormations] = useState<Formation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchFormations() {
            try {
                const res = await fetch('/api/formations')
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()
                // Get last 3 formations
                setFormations(data.slice(0, 3))
            } catch (err) {
                console.error('Error fetching formations:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchFormations()
    }, [])

    if (loading) {
        return (
            <section className="py-16 bg-gradient-to-b from-white to-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto mb-4 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                                <div className="w-full h-48 bg-gray-200"></div>
                                <div className="p-6 space-y-4">
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (formations.length === 0) {
        return null
    }

    return (
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-cjblue mb-4">
                        Nos Dernières Formations
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Découvrez nos programmes de formation les plus récents, conçus pour développer vos compétences et booster votre carrière.
                    </p>
                </div>

                {/* Formations Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {formations.map((formation) => (
                        <Link
                            key={formation.id}
                            href={`/fr/formations/${formation.slug}`}
                            className="group"
                        >
                            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                {/* Image Container */}
                                <div className="relative w-full h-48 bg-gradient-to-br from-cjblue to-blue-600 overflow-hidden">
                                    {formation.imageUrl ? (
                                        <Image
                                            src={formation.imageUrl}
                                            alt={formation.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-white text-5xl">📚</span>
                                        </div>
                                    )}
                                    {/* Overlay Badge */}
                                    <div className="absolute top-3 right-3 bg-[var(--cj-red)] text-white px-3 py-1 rounded-full text-xs font-semibold">
                                        Nouvelle
                                    </div>
                                </div>

                                {/* Content Container */}
                                <div className="p-6 flex flex-col h-64">
                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-cjblue mb-3 group-hover:text-[var(--cj-red)] transition-colors line-clamp-2">
                                        {formation.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
                                        {formation.description || 'Programme de formation professionnel conçu pour développer vos compétences.'}
                                    </p>

                                    {/* Footer - Learn More Button */}
                                    <div className="mt-auto pt-4 border-t border-gray-200">
                                        <button className="w-full text-[var(--cj-blue)] font-semibold py-2 rounded-lg hover:bg-blue-50 transition-colors group-hover:text-[var(--cj-red)] flex items-center justify-center gap-2">
                                            En savoir plus
                                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* CTA Button */}
                <div className="text-center mt-12">
                    <Link
                        href="/fr/formations"
                        className="inline-block bg-[var(--cj-blue)] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[var(--cj-red)] transition-colors"
                    >
                        Voir toutes les formations
                    </Link>
                </div>
            </div>
        </section>
    )
}
