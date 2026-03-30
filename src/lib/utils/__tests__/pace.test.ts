import { describe, it, expect } from 'vitest'
import {
  paceToSeconds,
  secondsToPace,
  formatDuration,
  calculatePace,
  comparePace,
} from '@/lib/utils/pace'

describe('paceToSeconds', () => {
  it('convertit "5:30" en 330 secondes', () => {
    expect(paceToSeconds('5:30')).toBe(330)
  })

  it('convertit "0:00" en 0', () => {
    expect(paceToSeconds('0:00')).toBe(0)
  })

  it('convertit "6:18" en 378 secondes', () => {
    expect(paceToSeconds('6:18')).toBe(378)
  })

  it('convertit "1:00" en 60 secondes', () => {
    expect(paceToSeconds('1:00')).toBe(60)
  })

  it('convertit "0:45" en 45 secondes', () => {
    expect(paceToSeconds('0:45')).toBe(45)
  })
})

describe('secondsToPace', () => {
  it('convertit 378 secondes en "6:18"', () => {
    expect(secondsToPace(378)).toBe('6:18')
  })

  it('convertit 330 secondes en "5:30"', () => {
    expect(secondsToPace(330)).toBe('5:30')
  })

  it('convertit 0 en "0:00"', () => {
    expect(secondsToPace(0)).toBe('0:00')
  })

  it('convertit 60 en "1:00"', () => {
    expect(secondsToPace(60)).toBe('1:00')
  })

  it('pad les secondes avec un zéro', () => {
    expect(secondsToPace(65)).toBe('1:05')
  })
})

describe('formatDuration', () => {
  it('formate une durée courte en "m:ss"', () => {
    expect(formatDuration(62)).toBe('1:02')
  })

  it('formate une durée avec heures en "h:mm:ss"', () => {
    expect(formatDuration(3922)).toBe('1:05:22')
  })

  it('formate 0 secondes', () => {
    expect(formatDuration(0)).toBe('0:00')
  })

  it('formate exactement 1 heure', () => {
    expect(formatDuration(3600)).toBe('1:00:00')
  })

  it('formate 45:22 (2722s)', () => {
    expect(formatDuration(2722)).toBe('45:22')
  })
})

describe('calculatePace', () => {
  it('calcule la pace pour 10km en 3000s', () => {
    expect(calculatePace(10, 3000)).toBe('5:00')
  })

  it('retourne "--:--" si la distance est 0', () => {
    expect(calculatePace(0, 3000)).toBe('--:--')
  })

  it('retourne "--:--" si la distance est négative', () => {
    expect(calculatePace(-1, 3000)).toBe('--:--')
  })
})

describe('comparePace', () => {
  it('retourne négatif si actual est plus rapide que target', () => {
    expect(comparePace('4:30', '5:00')).toBeLessThan(0)
  })

  it('retourne positif si actual est plus lent que target', () => {
    expect(comparePace('5:30', '5:00')).toBeGreaterThan(0)
  })

  it('retourne 0 si les paces sont identiques', () => {
    expect(comparePace('5:00', '5:00')).toBe(0)
  })
})
