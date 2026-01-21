'use client'

import { useState } from 'react'

interface Progress {
  enrollmentId: number
  studentName: string
  email: string
  modulesCompleted: number
  totalModules: number
  assignmentsSubmitted: number
  totalAssignments: number
  attendanceRate: number
  overallProgress: number
  lastActivity?: string
}

interface StudentProgressTrackerProps {
  sessionId: number
  progresses: Progress[]
}

export default function StudentProgressTracker({ sessionId, progresses }: StudentProgressTrackerProps) {
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'attendance'>('progress')
  const [filter, setFilter] = useState<'all' | 'on-track' | 'behind'>('all')

  const sortedProgresses = [...progresses].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.studentName.localeCompare(b.studentName)
      case 'progress':
        return b.overallProgress - a.overallProgress
      case 'attendance':
        return b.attendanceRate - a.attendanceRate
      default:
        return 0
    }
  })

  const filteredProgresses = sortedProgresses.filter(p => {
    if (filter === 'on-track') return p.overallProgress >= 70
    if (filter === 'behind') return p.overallProgress < 70
    return true
  })

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Suivi de Progression</h3>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="progress">Trier par progression</option>
            <option value="name">Trier par nom</option>
            <option value="attendance">Trier par présence</option>
          </select>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Tous</option>
            <option value="on-track">En bonne voie (≥70%)</option>
            <option value="behind">En retard (&lt;70%)</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredProgresses.map((progress) => (
          <div key={progress.enrollmentId} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold">{progress.studentName}</h4>
                <p className="text-sm text-gray-600">{progress.email}</p>
                {progress.lastActivity && (
                  <p className="text-xs text-gray-500 mt-1">
                    Dernière activité: {new Date(progress.lastActivity).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-cjblue">
                  {progress.overallProgress}%
                </div>
                <div className="text-xs text-gray-600">Progression globale</div>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Modules complétés</span>
                  <span className="font-medium">
                    {progress.modulesCompleted}/{progress.totalModules}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(progress.modulesCompleted / progress.totalModules) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Travaux soumis</span>
                  <span className="font-medium">
                    {progress.assignmentsSubmitted}/{progress.totalAssignments}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(progress.assignmentsSubmitted / progress.totalAssignments) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Taux de présence</span>
                  <span className="font-medium">{progress.attendanceRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      progress.attendanceRate >= 80
                        ? 'bg-green-500'
                        : progress.attendanceRate >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${progress.attendanceRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProgresses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucun étudiant trouvé pour ce filtre.
        </div>
      )}
    </div>
  )
}
