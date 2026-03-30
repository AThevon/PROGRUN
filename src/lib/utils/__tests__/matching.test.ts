import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Drizzle DB et schema avant l'import
const mockFindFirstPlan = vi.fn()
const mockFindFirstPlanWeek = vi.fn()
const mockFindManyPlanSessions = vi.fn()
const mockFindFirstActivity = vi.fn()
const mockUpdate = vi.fn().mockReturnValue({
  set: vi.fn().mockReturnValue({
    where: vi.fn(),
  }),
})

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      plans: { findFirst: (...args: unknown[]) => mockFindFirstPlan(...args) },
      planWeeks: { findFirst: (...args: unknown[]) => mockFindFirstPlanWeek(...args) },
      planSessions: { findMany: (...args: unknown[]) => mockFindManyPlanSessions(...args) },
      activities: { findFirst: (...args: unknown[]) => mockFindFirstActivity(...args) },
    },
    update: (...args: unknown[]) => mockUpdate(...args),
  },
}))

vi.mock('@/lib/db/schema', () => ({
  plans: {},
  planWeeks: {},
  planSessions: {},
  activities: {},
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  isNull: vi.fn(),
}))

import { autoMatchActivity } from '@/lib/utils/matching'

describe('autoMatchActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retourne false si pas de plan actif', async () => {
    mockFindFirstPlan.mockResolvedValue(null)

    const result = await autoMatchActivity(
      'act-1', 'user-1', new Date('2024-06-17T08:00:00Z'), 10
    )
    expect(result).toBe(false)
  })

  it('retourne false si le plan n\'a pas de startDate', async () => {
    mockFindFirstPlan.mockResolvedValue({ id: 'plan-1', startDate: null, isActive: true })

    const result = await autoMatchActivity(
      'act-1', 'user-1', new Date('2024-06-17T08:00:00Z'), 10
    )
    expect(result).toBe(false)
  })

  it('retourne false si l\'activité est avant la date de début du plan', async () => {
    mockFindFirstPlan.mockResolvedValue({
      id: 'plan-1',
      startDate: new Date('2024-07-01'),
      isActive: true,
    })

    const result = await autoMatchActivity(
      'act-1', 'user-1', new Date('2024-06-15T08:00:00Z'), 10
    )
    expect(result).toBe(false)
  })

  it('retourne false si la semaine n\'existe pas dans le plan', async () => {
    mockFindFirstPlan.mockResolvedValue({
      id: 'plan-1',
      startDate: new Date('2024-06-10'),
      isActive: true,
    })
    mockFindFirstPlanWeek.mockResolvedValue(null)

    const result = await autoMatchActivity(
      'act-1', 'user-1', new Date('2024-06-17T08:00:00Z'), 10
    )
    expect(result).toBe(false)
  })

  it('retourne false si aucune session ne matche (distance hors tolérance)', async () => {
    mockFindFirstPlan.mockResolvedValue({
      id: 'plan-1',
      startDate: new Date('2024-06-10'), // Lundi
      isActive: true,
    })
    mockFindFirstPlanWeek.mockResolvedValue({ id: 'week-1' })
    // La date 2024-06-17 est un lundi (dayOfWeek = 1)
    mockFindManyPlanSessions.mockResolvedValue([
      { id: 'sess-1', type: 'run', dayOfWeek: 1, targetDistanceKm: 5 },
    ])

    // 10km est hors tolérance de ±20% de 5km (4-6)
    const result = await autoMatchActivity(
      'act-1', 'user-1', new Date('2024-06-17T08:00:00Z'), 10
    )
    expect(result).toBe(false)
  })

  it('retourne false si la session est déjà matchée', async () => {
    mockFindFirstPlan.mockResolvedValue({
      id: 'plan-1',
      startDate: new Date('2024-06-10'),
      isActive: true,
    })
    mockFindFirstPlanWeek.mockResolvedValue({ id: 'week-1' })
    mockFindManyPlanSessions.mockResolvedValue([
      { id: 'sess-1', type: 'run', dayOfWeek: 1, targetDistanceKm: 10 },
    ])
    // Session déjà matchée
    mockFindFirstActivity.mockResolvedValue({ id: 'act-existing' })

    const result = await autoMatchActivity(
      'act-1', 'user-1', new Date('2024-06-17T08:00:00Z'), 10
    )
    expect(result).toBe(false)
  })

  it('retourne true et met à jour l\'activité si match trouvé', async () => {
    mockFindFirstPlan.mockResolvedValue({
      id: 'plan-1',
      startDate: new Date('2024-06-10'),
      isActive: true,
    })
    mockFindFirstPlanWeek.mockResolvedValue({ id: 'week-1' })
    mockFindManyPlanSessions.mockResolvedValue([
      { id: 'sess-1', type: 'run', dayOfWeek: 1, targetDistanceKm: 10 },
    ])
    // Pas de match existant
    mockFindFirstActivity.mockResolvedValue(null)

    const result = await autoMatchActivity(
      'act-1', 'user-1', new Date('2024-06-17T08:00:00Z'), 10
    )
    expect(result).toBe(true)
    expect(mockUpdate).toHaveBeenCalled()
  })

  it('ignore les sessions de type rest', async () => {
    mockFindFirstPlan.mockResolvedValue({
      id: 'plan-1',
      startDate: new Date('2024-06-10'),
      isActive: true,
    })
    mockFindFirstPlanWeek.mockResolvedValue({ id: 'week-1' })
    mockFindManyPlanSessions.mockResolvedValue([
      { id: 'sess-1', type: 'rest', dayOfWeek: 1, targetDistanceKm: 10 },
    ])

    const result = await autoMatchActivity(
      'act-1', 'user-1', new Date('2024-06-17T08:00:00Z'), 10
    )
    expect(result).toBe(false)
  })
})
