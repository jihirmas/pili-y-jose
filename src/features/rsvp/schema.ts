import { z } from 'zod'
import { copy, dietOptions } from '../../config/event'
import { invitationFlags, type InvitationType } from '../../config/invitations'

export const needsDietDetail = (value?: string) =>
  value === 'allergy' || value === 'other'
export const normalizePhone = (value: string) => {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  return /^9\d{8}$/.test(digits) ? `56${digits}` : digits
}
export function createRsvpSchema(type: InvitationType) {
  const { ceremony, couple } = invitationFlags(type)
  return z
    .object({
      guestName: z
        .string()
        .trim()
        .min(3, copy.validation.name)
        .max(120, copy.validation.long)
        .refine((v) => v.split(/\s+/).length >= 2, copy.validation.name),
      email: z
        .string()
        .trim()
        .toLowerCase()
        .email(copy.validation.email)
        .max(254, copy.validation.long),
      phone: z
        .string()
        .trim()
        .max(40, copy.validation.phone)
        .refine(
          (v) =>
            /^[+\d\s().-]+$/.test(v) && /^\d{7,15}$/.test(normalizePhone(v)),
          copy.validation.phone,
        ),
      song: z.string().trim().max(200, copy.validation.long).optional(),
      guestDietType: z.string().optional(),
      guestDietDetail: z.string().optional(),
      companionAttending: z.enum(['yes', 'no']).optional(),
      companionName: z.string().optional(),
      companionDietType: z.string().optional(),
      companionDietDetail: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const issue = (path: keyof typeof data, message: string) =>
        ctx.addIssue({ code: 'custom', path: [path], message })
      const diet = (
        key: 'guestDietType' | 'companionDietType',
        detail: 'guestDietDetail' | 'companionDietDetail',
      ) => {
        if (!dietOptions.some((d) => d.value === data[key]))
          issue(key, copy.validation.diet)
        if (needsDietDetail(data[key])) {
          if (!data[detail]?.trim()) issue(detail, copy.validation.required)
          else if (data[detail]!.trim().length > 500)
            issue(detail, copy.validation.long)
        }
      }
      if (ceremony) diet('guestDietType', 'guestDietDetail')
      if (couple && !data.companionAttending)
        issue('companionAttending', copy.validation.companion)
      if (couple && data.companionAttending === 'yes') {
        const name = data.companionName?.trim() || ''
        if (name.length < 3 || name.split(/\s+/).length < 2)
          issue('companionName', copy.validation.name)
        if (name.length > 120) issue('companionName', copy.validation.long)
        if (ceremony) diet('companionDietType', 'companionDietDetail')
      }
    })
}
export type RsvpValues = z.infer<ReturnType<typeof createRsvpSchema>>

export function cleanRsvp(type: InvitationType, values: RsvpValues) {
  const { ceremony, couple } = invitationFlags(type)
  const companionAttending = couple && values.companionAttending === 'yes'
  return {
    guestName: values.guestName.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim(),
    song: values.song?.trim() || '',
    companionAttending,
    guestDietType: ceremony ? values.guestDietType || '' : '',
    guestDietDetail:
      ceremony && needsDietDetail(values.guestDietType)
        ? values.guestDietDetail?.trim() || ''
        : '',
    companionName: companionAttending ? values.companionName?.trim() || '' : '',
    companionDietType:
      companionAttending && ceremony ? values.companionDietType || '' : '',
    companionDietDetail:
      companionAttending &&
      ceremony &&
      needsDietDetail(values.companionDietType)
        ? values.companionDietDetail?.trim() || ''
        : '',
  }
}
export const guestCount = (type: InvitationType, values: RsvpValues) =>
  cleanRsvp(type, values).companionAttending ? 2 : 1
