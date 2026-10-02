export const invitationTypes = [
  'ceremony_single',
  'ceremony_couple',
  'party_single',
  'party_couple',
] as const
export type InvitationType = (typeof invitationTypes)[number]
export type TokenMap = Record<InvitationType, string | undefined>
export const tokens: TokenMap = {
  ceremony_single: import.meta.env.VITE_TOKEN_CEREMONY_SINGLE,
  ceremony_couple: import.meta.env.VITE_TOKEN_CEREMONY_COUPLE,
  party_single: import.meta.env.VITE_TOKEN_PARTY_SINGLE,
  party_couple: import.meta.env.VITE_TOKEN_PARTY_COUPLE,
}
export const invitationFlags = (type: InvitationType) => ({
  ceremony: type.startsWith('ceremony_'),
  couple: type.endsWith('_couple'),
})

export function resolveInvitation(
  search: string,
  tokenMap: TokenMap = tokens,
  dev = import.meta.env.DEV,
): InvitationType | null {
  const params = new URLSearchParams(search)
  const preview = params.get('preview')
  if (dev && invitationTypes.includes(preview as InvitationType))
    return preview as InvitationType
  const token = params.get('i')
  if (!token || params.getAll('i').length !== 1) return null
  const matches = invitationTypes.filter(
    (type) => !!tokenMap[type] && tokenMap[type] === token,
  )
  return matches.length === 1 ? matches[0] : null
}
