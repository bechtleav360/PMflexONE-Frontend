import { describe, expect, it } from 'vitest'

import { getRiskLevelSrLabel, getRiskLevelToken, getRiskLevelTokenClass } from './riskLevelColor'

// Minimal TFunction stub — real translation is tested in component tests via i18n.
const t = (key: string, opts?: Record<string, unknown>) => {
  if (opts?.level !== undefined) return `${key}:${String(opts.level)}`
  return key
}

describe('getRiskLevelToken', () => {
  describe('Risk type scale (normal)', () => {
    it('returns gray for null riskLevel', () => {
      expect(getRiskLevelToken(null, 'RISK')).toBe('gray')
    })

    it('returns green for level 1 (risk ≤2 → green)', () => {
      expect(getRiskLevelToken(1, 'RISK')).toBe('green')
    })

    it('returns green for level 2 (boundary: risk ≤2 → green)', () => {
      expect(getRiskLevelToken(2, 'RISK')).toBe('green')
    })

    it('returns yellow for level 3 (boundary: risk 3–19 → yellow)', () => {
      expect(getRiskLevelToken(3, 'RISK')).toBe('yellow')
    })

    it('returns yellow for level 19 (boundary: risk 3–19 → yellow)', () => {
      expect(getRiskLevelToken(19, 'RISK')).toBe('yellow')
    })

    it('returns red for level 20 (boundary: risk ≥20 → red)', () => {
      expect(getRiskLevelToken(20, 'RISK')).toBe('red')
    })

    it('returns red for level 25', () => {
      expect(getRiskLevelToken(25, 'RISK')).toBe('red')
    })
  })

  describe('Opportunity type scale (inverted)', () => {
    it('returns gray for null riskLevel', () => {
      expect(getRiskLevelToken(null, 'OPPORTUNITY')).toBe('gray')
    })

    it('returns red for level 1 (boundary: opportunity ≤2 → red)', () => {
      expect(getRiskLevelToken(1, 'OPPORTUNITY')).toBe('red')
    })

    it('returns red for level 2 (boundary: opportunity ≤2 → red)', () => {
      expect(getRiskLevelToken(2, 'OPPORTUNITY')).toBe('red')
    })

    it('returns yellow for level 3 (boundary: opportunity 3–19 → yellow)', () => {
      expect(getRiskLevelToken(3, 'OPPORTUNITY')).toBe('yellow')
    })

    it('returns yellow for level 19 (boundary: opportunity 3–19 → yellow)', () => {
      expect(getRiskLevelToken(19, 'OPPORTUNITY')).toBe('yellow')
    })

    it('returns green for level 20 (boundary: opportunity ≥20 → green)', () => {
      expect(getRiskLevelToken(20, 'OPPORTUNITY')).toBe('green')
    })

    it('returns green for level 25', () => {
      expect(getRiskLevelToken(25, 'OPPORTUNITY')).toBe('green')
    })
  })
})

describe('getRiskLevelTokenClass', () => {
  it('returns green token class', () => {
    expect(getRiskLevelTokenClass('green')).toBe('bg-risk-level-green')
  })

  it('returns yellow token class', () => {
    expect(getRiskLevelTokenClass('yellow')).toBe('bg-risk-level-yellow')
  })

  it('returns red token class', () => {
    expect(getRiskLevelTokenClass('red')).toBe('bg-risk-level-red')
  })

  it('returns gray token class for gray', () => {
    expect(getRiskLevelTokenClass('gray')).toBe('bg-risk-level-gray')
  })
})

describe('getRiskLevelSrLabel', () => {
  it('returns notCalculated label when riskLevel is null', () => {
    expect(getRiskLevelSrLabel(null, 'gray', t as never)).toBe(
      'pages.riskManagement.riskLevel.notCalculated',
    )
  })

  it('returns notCalculated label when token is gray (level present but uncalculated)', () => {
    expect(getRiskLevelSrLabel(3, 'gray', t as never)).toBe(
      'pages.riskManagement.riskLevel.notCalculated',
    )
  })

  it('returns green label with level', () => {
    expect(getRiskLevelSrLabel(2, 'green', t as never)).toBe(
      'pages.riskManagement.riskLevel.green:2',
    )
  })

  it('returns yellow label for level 3 (boundary)', () => {
    expect(getRiskLevelSrLabel(3, 'yellow', t as never)).toBe(
      'pages.riskManagement.riskLevel.yellow:3',
    )
  })

  it('returns yellow label for level 19 (boundary)', () => {
    expect(getRiskLevelSrLabel(19, 'yellow', t as never)).toBe(
      'pages.riskManagement.riskLevel.yellow:19',
    )
  })

  it('returns red label for level 20 (boundary)', () => {
    expect(getRiskLevelSrLabel(20, 'red', t as never)).toBe('pages.riskManagement.riskLevel.red:20')
  })

  it('returns red label for level 25', () => {
    expect(getRiskLevelSrLabel(25, 'red', t as never)).toBe('pages.riskManagement.riskLevel.red:25')
  })
})
