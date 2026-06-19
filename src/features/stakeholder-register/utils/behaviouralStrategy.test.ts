import { describe, expect, it } from 'vitest'

import type { MatrixPosition } from '@/entities/stakeholder'

import { deriveBehaviouralStrategy } from './behaviouralStrategy'

// Coordinate system: x = affectedness [0,1], y = influence [0,1]. Threshold = 0.5.
const pos = (x: number, y: number): MatrixPosition => ({ x, y })

describe('deriveBehaviouralStrategy', () => {
  describe('MONITOR — x < 0.5 && y < 0.5', () => {
    it('(0.0, 0.0)', () => expect(deriveBehaviouralStrategy(pos(0.0, 0.0))).toBe('MONITOR'))
    it('(0.4, 0.4)', () => expect(deriveBehaviouralStrategy(pos(0.4, 0.4))).toBe('MONITOR'))
    it('(0.2, 0.3)', () => expect(deriveBehaviouralStrategy(pos(0.2, 0.3))).toBe('MONITOR'))
  })

  describe('KEEP_INFORMED — x >= 0.5 && y < 0.5', () => {
    it('(0.5, 0.0)', () => expect(deriveBehaviouralStrategy(pos(0.5, 0.0))).toBe('KEEP_INFORMED'))
    it('(1.0, 0.4)', () => expect(deriveBehaviouralStrategy(pos(1.0, 0.4))).toBe('KEEP_INFORMED'))
    it('(0.8, 0.2)', () => expect(deriveBehaviouralStrategy(pos(0.8, 0.2))).toBe('KEEP_INFORMED'))
  })

  describe('KEEP_SATISFIED — x < 0.5 && y >= 0.5', () => {
    it('(0.0, 0.5)', () => expect(deriveBehaviouralStrategy(pos(0.0, 0.5))).toBe('KEEP_SATISFIED'))
    it('(0.4, 1.0)', () => expect(deriveBehaviouralStrategy(pos(0.4, 1.0))).toBe('KEEP_SATISFIED'))
    it('(0.2, 0.8)', () => expect(deriveBehaviouralStrategy(pos(0.2, 0.8))).toBe('KEEP_SATISFIED'))
  })

  describe('MANAGE_CLOSELY — x >= 0.5 && y >= 0.5', () => {
    it('(0.5, 0.5)', () => expect(deriveBehaviouralStrategy(pos(0.5, 0.5))).toBe('MANAGE_CLOSELY'))
    it('(1.0, 1.0)', () => expect(deriveBehaviouralStrategy(pos(1.0, 1.0))).toBe('MANAGE_CLOSELY'))
    it('(0.8, 0.6)', () => expect(deriveBehaviouralStrategy(pos(0.8, 0.6))).toBe('MANAGE_CLOSELY'))
  })

  describe('boundary at 0.5', () => {
    it('(0.49, 0.49) → MONITOR', () =>
      expect(deriveBehaviouralStrategy(pos(0.49, 0.49))).toBe('MONITOR'))
    it('(0.5, 0.49) → KEEP_INFORMED', () =>
      expect(deriveBehaviouralStrategy(pos(0.5, 0.49))).toBe('KEEP_INFORMED'))
    it('(0.49, 0.5) → KEEP_SATISFIED', () =>
      expect(deriveBehaviouralStrategy(pos(0.49, 0.5))).toBe('KEEP_SATISFIED'))
    it('(0.5, 0.5) → MANAGE_CLOSELY', () =>
      expect(deriveBehaviouralStrategy(pos(0.5, 0.5))).toBe('MANAGE_CLOSELY'))
  })
})
