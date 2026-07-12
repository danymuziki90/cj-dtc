/**
 * Composant pour afficher les statistiques du catalogue
 */

'use client'

import { TrendingUp, Users, Star, Award } from 'lucide-react'
import type { CatalogStats } from '@/lib/types/formation'

interface FormationStatsProps {
  stats: CatalogStats
}

export default function FormationStats({ stats }: FormationStatsProps) {
  const statsItems = [
    {
      label: 'Formations',
      value: stats.totalFormations,
      icon: Award,
      color: 'text-blue-600'
    },
    {
      label: 'Étudiants',
      value: stats.totalStudents.toLocaleString('fr-FR'),
      icon: Users,
      color: 'text-green-600'
    },
    {
      label: 'Note moyenne',
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      label: 'Taux de réussite',
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {statsItems.map((item, index) => (
        <div key={index} className="text-center">
          <div className="flex justify-center mb-2">
            <div className={`w-12 h-12 rounded-full bg-white/20 flex items-center justify-center ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {item.value}
          </div>
          <div className="text-sm text-blue-100">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}
