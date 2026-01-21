'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Article {
    id: number
    title: string
    slug: string
    excerpt: string | null
    content: string
    imageUrl: string | null
    published: boolean
    createdAt: string
}

export default function RecentArticles() {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchArticles() {
            try {
                const res = await fetch('/api/articles?limit=3&published=true')
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()
                setArticles(data)
            } catch (err) {
                console.error('Error fetching articles:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchArticles()
    }, [])

    if (loading) {
        return (
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto mb-4 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 animate-pulse">
                                <div className="w-full h-48 bg-gray-200"></div>
                                <div className="p-6 space-y-4">
                                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                    <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (articles.length === 0) {
        return null
    }

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-cjblue mb-4">
                        Nos Dernières Actualités
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Restez informé des dernières nouvelles, tendances et annonces du Centre CJ DTC.
                    </p>
                </div>

                {/* Articles Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {articles.map((article) => {
                        const excerpt = article.excerpt || article.content.substring(0, 150)
                        const date = new Date(article.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })

                        return (
                            <Link
                                key={article.id}
                                href={`/fr/actualites/${article.slug}`}
                                className="group"
                            >
                                <article className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                                    {/* Image Container */}
                                    <div className="relative w-full h-48 bg-gradient-to-br from-cjblue to-blue-600 overflow-hidden">
                                        {article.imageUrl ? (
                                            <Image
                                                src={article.imageUrl}
                                                alt={article.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-white text-5xl">📰</span>
                                            </div>
                                        )}
                                        {/* Category Badge */}
                                        <div className="absolute top-3 left-3 bg-[var(--cj-red)] text-white px-3 py-1 rounded-full text-xs font-semibold">
                                            Actualité
                                        </div>
                                    </div>

                                    {/* Content Container */}
                                    <div className="p-6 flex flex-col h-72">
                                        {/* Date */}
                                        <time className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                                            {date}
                                        </time>

                                        {/* Title */}
                                        <h3 className="text-xl font-bold text-cjblue mb-3 group-hover:text-[var(--cj-red)] transition-colors line-clamp-2">
                                            {article.title}
                                        </h3>

                                        {/* Excerpt */}
                                        <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-4">
                                            {excerpt}
                                            {excerpt.length >= 150 && '...'}
                                        </p>

                                        {/* Footer - Read More Link */}
                                        <div className="mt-auto pt-4 border-t border-gray-200">
                                            <button className="w-full text-[var(--cj-blue)] font-semibold py-2 rounded-lg hover:bg-blue-50 transition-colors group-hover:text-[var(--cj-red)] flex items-center justify-center gap-2">
                                                Lire l'article
                                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        )
                    })}
                </div>

                {/* CTA Button */}
                <div className="text-center mt-12">
                    <Link
                        href="/fr/actualites"
                        className="inline-block bg-[var(--cj-blue)] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[var(--cj-red)] transition-colors"
                    >
                        Voir tous les articles
                    </Link>
                </div>
            </div>
        </section>
    )
}
