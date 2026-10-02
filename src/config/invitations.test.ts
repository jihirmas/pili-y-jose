import { describe, expect, it } from 'vitest'
import { invitationTypes, resolveInvitation } from './invitations'
const tokens = {
  ceremony_single: 'a',
  ceremony_couple: 'b',
  party_single: 'c',
  party_couple: 'd',
}
describe('invitation links', () => {
  it.each(invitationTypes)('maps %s', (type) => {
    expect(resolveInvitation(`?i=${tokens[type]}`, tokens, false)).toBe(type)
  })
  it.each([
    '',
    '?i=bad',
    '?type=ceremony_couple',
    '?i=a&i=b',
    '?preview=ceremony_couple',
  ])('rejects production URL %s', (search) => {
    expect(resolveInvitation(search, tokens, false)).toBeNull()
  })
  it.each(invitationTypes)('permits preview %s only in development', (type) => {
    expect(resolveInvitation(`?preview=${type}`, tokens, true)).toBe(type)
  })
  it('rejects ambiguous duplicate configured tokens', () => {
    expect(
      resolveInvitation('?i=a', { ...tokens, party_single: 'a' }, false),
    ).toBeNull()
  })
})
