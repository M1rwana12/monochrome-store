import { describe, it, expect } from 'vitest'
import { levelFor, nextLevel } from './bonus'

describe('levelFor', () => {
  it('starts at silver', () => {
    expect(levelFor(0).name).toBe('silver')
    expect(levelFor(119).name).toBe('silver')
  })
  it('graphite from $120 lifetime spend', () => {
    expect(levelFor(120).name).toBe('graphite')
    expect(levelFor(479).name).toBe('graphite')
  })
  it('black from $480', () => {
    expect(levelFor(480).name).toBe('black')
    expect(levelFor(10000).name).toBe('black')
  })
})

describe('nextLevel', () => {
  it('shows remaining spend to the next tier', () => {
    expect(nextLevel(0)).toEqual({ level: expect.objectContaining({ name: 'graphite' }), remainingUsd: 120 })
    expect(nextLevel(400)).toEqual({ level: expect.objectContaining({ name: 'black' }), remainingUsd: 80 })
  })
  it('is null at the top tier', () => {
    expect(nextLevel(480)).toBeNull()
  })
})
