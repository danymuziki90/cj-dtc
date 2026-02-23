import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'student') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Simuler des cours (en réalité, viendraient de la base de données)
    const courses = [
      {
        id: 1,
        title: 'Introduction à JavaScript',
        description: 'Apprenez les bases de JavaScript avec ce cours complet',
        content: `# Introduction à JavaScript

## Objectifs
Ce cours vous permettra de maîtriser les fondamentaux du langage JavaScript.

## Contenu
1. Variables et types de données
2. Fonctions et portée
3. Conditions et boucles
4. Tableaux et objets
5. Manipulation du DOM
6. Événements et interactions

## Exercices pratiques
- Créer une calculatrice simple
- Gérer un formulaire interactif
- Construire un mini-jeu

## Ressources
- Documentation MDN
- Tutoriels interactifs
- Projets pratiques`,
        type: 'video',
        formationId: 1,
        formation: { title: 'Développement Web', categorie: 'Programmation' },
        order: 1,
        duration: 45,
        videoUrl: 'https://example.com/video1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'HTML5 et CSS3',
        description: 'Maîtrisez la structure des pages web modernes',
        content: `# HTML5 et CSS3

## Objectifs
Apprendre à créer des pages web structurées et stylisées.

## Contenu
1. Structure HTML5 sémantique
2. CSS3 et sélecteurs avancés
3. Flexbox et Grid Layout
4. Responsive Design
5. Animations CSS
6. Intégration JavaScript

## Projets
- Portfolio personnel
- Site responsive complet
- Interface utilisateur moderne`,
        type: 'text',
        formationId: 1,
        formation: { title: 'Développement Web', categorie: 'Design Web' },
        order: 2,
        duration: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        title: 'Quiz JavaScript',
        description: 'Testez vos connaissances avec ce quiz interactif',
        content: `# Quiz JavaScript

## Instructions
Répondez aux questions suivantes pour tester votre compréhension.

## Questions
1. Qu'est-ce qu'une variable en JavaScript ?
2. Comment déclare-t-on une fonction ?
3. Qu'est-ce que le DOM ?
4. Comment ajouter un écouteur d'événement ?
5. Quelle est la différence entre == et === ?`,
        type: 'quiz',
        formationId: 1,
        formation: { title: 'Développement Web', categorie: 'Évaluation' },
        order: 3,
        duration: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 4,
        title: 'Projet Portfolio',
        description: 'Créez votre portfolio personnel en utilisant HTML, CSS et JavaScript',
        content: `# Projet Portfolio

## Objectifs
Mettre en pratique toutes les compétences acquises.

## Spécifications
- Page d'accueil avec présentation
- Section projets avec galerie
- Formulaire de contact fonctionnel
- Design responsive et moderne
- Animations et interactions subtiles

## Livrables attendus
- Code source complet
- Documentation technique
- Démo en ligne`,
        type: 'assignment',
        formationId: 1,
        formation: { title: 'Développement Web', categorie: 'Projets' },
        order: 4,
        duration: 120,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Erreur lors du chargement des cours:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
