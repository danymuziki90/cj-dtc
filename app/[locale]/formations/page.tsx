'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  GraduationCap,
  HelpCircle,
  Layers3,
  MessageCircle,
  Search,
  Target,
  Users2,
} from 'lucide-react'
import Breadcrumbs from '../../../components/Breadcrumbs'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'
import { isE2EFormationFixture } from '@/lib/formations/public'

interface Formation {
  id: number
  title: string
  slug: string
  description: string
  objectifs?: string
  duree?: string
  modules?: string
  methodes?: string
  certification?: string
  categorie?: string
  statut: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

const copy = publicMessages.formations

function normalizeText(value?: string | null) {
  return value?.trim() || ''
}

function summarize(value: string | null | undefined, fallback: string, max = 140) {
  const text = normalizeText(value)
  if (!text) return fallback
  return text.length <= max ? text : `${text.slice(0, max).trimEnd()}…`
}

function toItems(value?: string | null, max = 4): string[] {
  const text = normalizeText(value)
  if (!text) return []
  return text
    .split(/\r?\n|,|;/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max)
}
