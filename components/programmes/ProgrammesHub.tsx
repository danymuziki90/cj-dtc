'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  HelpCircle,
  Loader2,
  MapPinIcon,
  MessageCircleIcon,
  Users,
  ZapIcon,
} from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import { inferProgramSessionType, type ProgramSessionType } from '@/lib/programmes/session-types'
import { getIntlLocale, resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'
