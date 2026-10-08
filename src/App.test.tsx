import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { invitationTypes } from './config/invitations'
import { Rsvp } from './features/rsvp/Rsvp'
beforeEach(() => {
  vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-10-01T12:00:00-03:00'))
})
describe('rendering all invitation variants', () => {
  it.each(invitationTypes)(
    'renders exactly the sections permitted by %s',
    (type) => {
      window.history.replaceState({}, '', `/?preview=${type}`)
      const { container } = render(<App />)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Pili&Jose',
      )
      const text = container.textContent!
      if (type.startsWith('party')) {
        expect(text).not.toMatch(
          /Iglesia|Ceremonia|Cóctel|17:30|19:00|Restricción alimentaria/i,
        )
      } else {
        expect(text).toMatch(/Iglesia San Francisco/)
        expect(text).toMatch(/17:30/)
        expect(text).toMatch(/19:00/)
        expect(
          screen.getByLabelText(/Restricción alimentaria/),
        ).toBeInTheDocument()
      }
      expect(text).toContain('22:00')
      expect(text.includes('¿Vendrás acompañado/a?')).toBe(
        type.endsWith('couple'),
      )
      expect(text).not.toMatch(/TODO|PLACEHOLDER|imagen pendiente|Dress code/)
      expect(
        screen.getByRole('heading', { name: 'Lista de novios' }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', {
          name: 'Algunos recuerdos de nosotros',
        }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: 'Contacto' }),
      ).toBeInTheDocument()
    },
  )
  it('hides all event details on invalid invitation', () => {
    window.history.replaceState({}, '', '/?i=bad')
    const { container } = render(<App />)
    expect(container.textContent).toContain(
      'Esta invitación necesita un enlace válido.',
    )
    expect(container.textContent).not.toMatch(/2027|Alto|Iglesia|Confirmar/)
  })
  it('scrolls to an initial section hash after React renders it', async () => {
    window.history.replaceState(
      {},
      '',
      '/?preview=party_single#ubicaciones',
    )
    const scrollIntoView = vi.fn()
    const originalScrollIntoView = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = scrollIntoView

    render(<App />)
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled())

    Element.prototype.scrollIntoView = originalScrollIntoView
  })
  it('clears companion inputs when changed to no', async () => {
    render(<Rsvp type="ceremony_couple" inviteToken="" />)
    fireEvent.click(screen.getByLabelText('Sí'))
    fireEvent.change(
      screen.getByLabelText('Nombre y apellido del acompañante *'),
      { target: { value: 'María González' } },
    )
    fireEvent.click(screen.getByLabelText('No'))
    expect(
      screen.queryByLabelText('Nombre y apellido del acompañante *'),
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Sí'))
    await waitFor(() =>
      expect(
        screen.getByLabelText('Nombre y apellido del acompañante *'),
      ).toHaveValue(''),
    )
  })
  it('renders dietary detail only for allergy/other', () => {
    render(<Rsvp type="ceremony_single" inviteToken="" />)
    fireEvent.change(screen.getByLabelText('Restricción alimentaria *'), {
      target: { value: 'allergy' },
    })
    expect(screen.getByLabelText('Cuéntanos cuál *')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Restricción alimentaria *'), {
      target: { value: 'none' },
    })
    expect(screen.queryByLabelText('Cuéntanos cuál *')).not.toBeInTheDocument()
  })
  it('closes the form on the deadline', () => {
    vi.spyOn(Date, 'now').mockReturnValue(
      Date.parse('2026-12-10T00:00:00-03:00'),
    )
    render(<Rsvp type="party_single" inviteToken="" />)
    expect(
      screen.getByText('El período de confirmación online ha finalizado.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText('Nombre y apellido *'),
    ).not.toBeInTheDocument()
  })
})
