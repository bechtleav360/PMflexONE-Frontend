import { describe, expect, it } from 'vitest'

import type { WorkItemLinkNode } from '@/entities/work-item'

import { denormalizeEdgeType, normalizeWorkItemLink, validateWorkItemLink } from './linkNormalizer'

const A = 'work-item-A'
const B = 'work-item-B'

describe('normalizeWorkItemLink', () => {
  it('parent(A→B) normalizes to child(B→A)', () => {
    const result = normalizeWorkItemLink({ fromWorkItemId: A, toWorkItemId: B, linkType: 'parent' })
    expect(result).toEqual({ fromWorkItemId: B, toWorkItemId: A, linkType: 'child' })
  })

  it('previous(A→B) normalizes to next(B→A)', () => {
    const result = normalizeWorkItemLink({
      fromWorkItemId: A,
      toWorkItemId: B,
      linkType: 'previous',
    })
    expect(result).toEqual({ fromWorkItemId: B, toWorkItemId: A, linkType: 'next' })
  })

  it('child(A→B) passes through unchanged', () => {
    const result = normalizeWorkItemLink({ fromWorkItemId: A, toWorkItemId: B, linkType: 'child' })
    expect(result).toEqual({ fromWorkItemId: A, toWorkItemId: B, linkType: 'child' })
  })

  it('next(A→B) passes through unchanged', () => {
    const result = normalizeWorkItemLink({ fromWorkItemId: A, toWorkItemId: B, linkType: 'next' })
    expect(result).toEqual({ fromWorkItemId: A, toWorkItemId: B, linkType: 'next' })
  })

  it('related(A→B) passes through unchanged', () => {
    const result = normalizeWorkItemLink({
      fromWorkItemId: A,
      toWorkItemId: B,
      linkType: 'related',
    })
    expect(result).toEqual({ fromWorkItemId: A, toWorkItemId: B, linkType: 'related' })
  })

  it('normalized output never contains parent or previous as linkType', () => {
    const parent = normalizeWorkItemLink({ fromWorkItemId: A, toWorkItemId: B, linkType: 'parent' })
    const previous = normalizeWorkItemLink({
      fromWorkItemId: A,
      toWorkItemId: B,
      linkType: 'previous',
    })
    expect(parent.linkType).not.toBe('parent')
    expect(previous.linkType).not.toBe('previous')
  })
})

// ─── validateWorkItemLink ────────────────────────────────────────────────────

function makeLink(itemId: string, edgeTypeName: string): WorkItemLinkNode {
  return { edgeTypeName, metadata: null, item: { id: itemId } as never }
}

describe('validateWorkItemLink', () => {
  it('returns SELF_LINK when from and to are the same', () => {
    expect(
      validateWorkItemLink({ fromWorkItemId: A, toWorkItemId: A, linkType: 'child' }, []),
    ).toBe('SELF_LINK')
  })

  it('returns null when target is not yet linked', () => {
    expect(
      validateWorkItemLink({ fromWorkItemId: A, toWorkItemId: B, linkType: 'child' }, []),
    ).toBeNull()
  })

  it('returns DUPLICATE_LINK when same target + same type already exists', () => {
    const links = [makeLink(B, 'child')]
    expect(
      validateWorkItemLink({ fromWorkItemId: A, toWorkItemId: B, linkType: 'child' }, links),
    ).toBe('DUPLICATE_LINK')
  })

  it('returns OPPOSITE_DIRECTION for parent vs child', () => {
    const links = [makeLink(B, 'child')]
    expect(
      validateWorkItemLink({ fromWorkItemId: A, toWorkItemId: B, linkType: 'parent' }, links),
    ).toBe('OPPOSITE_DIRECTION')
  })

  it('returns OPPOSITE_DIRECTION for child vs parent', () => {
    const links = [makeLink(B, 'parent')]
    expect(
      validateWorkItemLink({ fromWorkItemId: A, toWorkItemId: B, linkType: 'child' }, links),
    ).toBe('OPPOSITE_DIRECTION')
  })

  it('returns OPPOSITE_DIRECTION for next vs previous', () => {
    const links = [makeLink(B, 'previous')]
    expect(
      validateWorkItemLink({ fromWorkItemId: A, toWorkItemId: B, linkType: 'next' }, links),
    ).toBe('OPPOSITE_DIRECTION')
  })

  it('returns OPPOSITE_DIRECTION for previous vs next', () => {
    const links = [makeLink(B, 'next')]
    expect(
      validateWorkItemLink({ fromWorkItemId: A, toWorkItemId: B, linkType: 'previous' }, links),
    ).toBe('OPPOSITE_DIRECTION')
  })

  it('returns ALREADY_LINKED when same target exists with unrelated type', () => {
    const links = [makeLink(B, 'related')]
    expect(
      validateWorkItemLink({ fromWorkItemId: A, toWorkItemId: B, linkType: 'child' }, links),
    ).toBe('ALREADY_LINKED')
  })

  it('returns null for unrelated target item', () => {
    const links = [makeLink('other-item', 'child')]
    expect(
      validateWorkItemLink({ fromWorkItemId: A, toWorkItemId: B, linkType: 'child' }, links),
    ).toBeNull()
  })
})

describe('denormalizeEdgeType', () => {
  it.each(['parent', 'child', 'next', 'previous', 'related'] as const)(
    'passes through known type "%s"',
    (type) => {
      expect(denormalizeEdgeType(type)).toBe(type)
    },
  )

  it('falls back to "related" for unknown types', () => {
    expect(denormalizeEdgeType('unknown-type')).toBe('related')
  })

  it('falls back to "related" for null', () => {
    expect(denormalizeEdgeType(null)).toBe('related')
  })
})
