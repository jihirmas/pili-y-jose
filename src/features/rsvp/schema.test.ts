import { describe, expect, it } from 'vitest'
import {
  cleanRsvp,
  createRsvpSchema,
  guestCount,
  normalizePhone,
} from './schema'
import { countdown, isRsvpClosed } from '../../lib/time'
import { event } from '../../config/event'
import { invitationTypes } from '../../config/invitations'
const base = {
  guestName: 'Juan Pérez',
  email: ' JUAN@example.com ',
  phone: '+56 9 1234 5678',
}
describe('RSVP rules', () => {
  it.each(invitationTypes)('validates minimum fields for %s', (type) => {
    const values = {
      ...base,
      ...(type.startsWith('ceremony') ? { guestDietType: 'none' } : {}),
      ...(type.endsWith('couple') ? { companionAttending: 'no' } : {}),
    }
    expect(createRsvpSchema(type).safeParse(values).success).toBe(true)
  })
  it.each(['', 'invalid@', 'x @example.com'])(
    'rejects invalid email %s',
    (email) => {
      expect(
        createRsvpSchema('party_single').safeParse({ ...base, email }).success,
      ).toBe(false)
    },
  )
  it('rejects missing data and missing ceremony diet', () => {
    expect(createRsvpSchema('party_single').safeParse({}).success).toBe(false)
    expect(createRsvpSchema('ceremony_single').safeParse(base).success).toBe(
      false,
    )
  })
  it.each(['allergy', 'other'])('requires detail for %s', (guestDietType) => {
    expect(
      createRsvpSchema('ceremony_single').safeParse({ ...base, guestDietType })
        .success,
    ).toBe(false)
    expect(
      createRsvpSchema('ceremony_single').safeParse({
        ...base,
        guestDietType,
        guestDietDetail: 'Maní',
      }).success,
    ).toBe(true)
  })
  it('requires an explicit companion choice', () => {
    expect(createRsvpSchema('party_couple').safeParse(base).success).toBe(false)
  })
  it('requires companion name only when attending', () => {
    expect(
      createRsvpSchema('party_couple').safeParse({
        ...base,
        companionAttending: 'yes',
      }).success,
    ).toBe(false)
    expect(
      createRsvpSchema('party_couple').safeParse({
        ...base,
        companionAttending: 'no',
      }).success,
    ).toBe(true)
  })
  it('requires companion diet and detail for ceremony', () => {
    const values = {
      ...base,
      guestDietType: 'none',
      companionAttending: 'yes',
      companionName: 'María González',
      companionDietType: 'allergy',
    }
    expect(createRsvpSchema('ceremony_couple').safeParse(values).success).toBe(
      false,
    )
    expect(
      createRsvpSchema('ceremony_couple').safeParse({
        ...values,
        companionDietDetail: 'Nueces',
      }).success,
    ).toBe(true)
  })
  it('clears fields outside the invitation scope and calculates guest count', () => {
    const values = {
      ...base,
      companionAttending: 'yes' as const,
      companionName: 'María González',
      guestDietType: 'allergy',
      guestDietDetail: 'Maní',
      companionDietType: 'none',
    }
    expect(cleanRsvp('party_single', values)).toMatchObject({
      guestDietType: '',
      guestDietDetail: '',
      companionName: '',
      companionAttending: false,
    })
    expect(guestCount('party_single', values)).toBe(1)
    expect(guestCount('party_couple', values)).toBe(2)
    expect(
      cleanRsvp('ceremony_couple', { ...values, companionAttending: 'no' }),
    ).toMatchObject({
      companionAttending: false,
      companionName: '',
      companionDietType: '',
    })
    expect(
      guestCount('ceremony_couple', { ...values, companionAttending: 'no' }),
    ).toBe(1)
  })
  it.each(['+56 9 1234 5678', '912345678', '9 1234 5678', '0056 9 1234 5678'])(
    'normalizes Chilean phone %s',
    (value) => {
      expect(normalizePhone(value)).toBe('56912345678')
    },
  )
  it('supports international phones', () => {
    expect(
      createRsvpSchema('party_single').safeParse({
        ...base,
        phone: '+44 (20) 7946-0958',
      }).success,
    ).toBe(true)
  })
})
describe('event clock', () => {
  it('closes at midnight Santiago, not at the start of December 9', () => {
    expect(isRsvpClosed(Date.parse('2026-12-09T23:59:59-03:00'))).toBe(false)
    expect(isRsvpClosed(Date.parse('2026-12-10T00:00:00-03:00'))).toBe(true)
  })
  it('counts to the specified instant and clamps at zero', () => {
    expect(
      countdown(
        event.ceremonyStart,
        Date.parse(event.ceremonyStart) - 90061000,
      ),
    ).toEqual([1, 1, 1, 1])
    expect(
      countdown(event.ceremonyStart, Date.parse(event.ceremonyStart) + 1000),
    ).toEqual([0, 0, 0, 0])
  })
})
