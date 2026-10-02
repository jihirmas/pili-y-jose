import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Rsvp } from './Rsvp'
import { submitRsvp, SubmitError } from './submit'
vi.mock('../../config/runtime', () => ({
  runtime: {
    appsScriptUrl: 'https://script.google.com/macros/s/test/exec',
    recaptchaSiteKey: 'test-key',
  },
  isAppsScriptUrl: () => true,
}))
vi.mock('./Recaptcha', () => ({
  Recaptcha: ({ onToken }: { onToken: (s: string) => void }) => (
    <button type="button" onClick={() => onToken('verified')}>
      Test captcha
    </button>
  ),
}))
vi.mock('./submit', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./submit')>()),
  submitRsvp: vi.fn(),
}))
beforeEach(() => {
  vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-10-01T00:00:00-03:00'))
  vi.mocked(submitRsvp).mockReset()
})
function fill() {
  fireEvent.change(screen.getByLabelText('Nombre y apellido *'), {
    target: { value: 'Juan Pérez' },
  })
  fireEvent.change(screen.getByLabelText('Email *'), {
    target: { value: 'juan@example.com' },
  })
  fireEvent.change(screen.getByLabelText('Teléfono *'), {
    target: { value: '+56 9 1234 5678' },
  })
  fireEvent.click(screen.getByText('Test captcha'))
}
describe('submission UI', () => {
  it('focuses first invalid field and never calls backend', async () => {
    render(<Rsvp type="party_single" inviteToken="test" />)
    fireEvent.click(
      screen.getByRole('button', { name: /Confirmar asistencia/ }),
    )
    await waitFor(() =>
      expect(screen.getByLabelText('Nombre y apellido *')).toHaveFocus(),
    )
    expect(submitRsvp).not.toHaveBeenCalled()
  })
  it('blocks repeat submissions until ACK and focuses the boarding pass after success', async () => {
    let resolve!: (value: Awaited<ReturnType<typeof submitRsvp>>) => void
    vi.mocked(submitRsvp).mockReturnValue(
      new Promise((r) => {
        resolve = r
      }),
    )
    const { container } = render(
      <Rsvp type="party_couple" inviteToken="test" />,
    )
    fill()
    fireEvent.click(screen.getByLabelText('Sí'))
    fireEvent.change(
      screen.getByLabelText('Nombre y apellido del acompañante *'),
      { target: { value: 'María González' } },
    )
    fireEvent.submit(container.querySelector('form')!)
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => expect(submitRsvp).toHaveBeenCalledOnce())
    expect(
      screen.queryByText('¡Confirmación recibida!'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Guardando tu confirmación/ }),
    ).toBeDisabled()
    resolve({
      source: 'pili-jose-rsvp',
      nonce: 'test',
      success: true,
      code: 'RSVP_CREATED',
    })
    await waitFor(() =>
      expect(screen.getByText('¡Confirmación recibida!')).toHaveFocus(),
    )
    expect(screen.getByText(/Check-in completado/)).toBeInTheDocument()
    expect(
      screen.getByText('Gracias por confirmar. ¡Te esperamos!'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Pili & Jose')).not.toBeInTheDocument()
    expect(screen.queryByText('Nos acompañan')).not.toBeInTheDocument()
    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument()
    expect(screen.queryByText('María González')).not.toBeInTheDocument()
    expect(container.querySelector('form')).toBeNull()
  })
  it.each([
    'TIMEOUT',
    'DUPLICATE_RSVP',
    'CAPTCHA_FAILED',
    'SERVER_ERROR',
  ] as const)('preserves data after %s without false success', async (code) => {
    vi.mocked(submitRsvp).mockRejectedValue(new SubmitError(code))
    render(<Rsvp type="party_single" inviteToken="test" />)
    fill()
    fireEvent.click(
      screen.getByRole('button', { name: /Confirmar asistencia/ }),
    )
    await waitFor(() =>
      expect(screen.getByRole('alert')).not.toBeEmptyDOMElement(),
    )
    expect(screen.getByLabelText('Nombre y apellido *')).toHaveValue(
      'Juan Pérez',
    )
    expect(
      screen.queryByText('¡Confirmación recibida!'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Confirmar asistencia/ }),
    ).toBeEnabled()
  })
  it('honors server deadline even with an earlier browser clock', async () => {
    vi.mocked(submitRsvp).mockRejectedValue(new SubmitError('DEADLINE_CLOSED'))
    render(<Rsvp type="party_single" inviteToken="test" />)
    fill()
    fireEvent.click(
      screen.getByRole('button', { name: /Confirmar asistencia/ }),
    )
    await screen.findByText('El período de confirmación online ha finalizado.')
    expect(
      screen.queryByLabelText('Nombre y apellido *'),
    ).not.toBeInTheDocument()
  })
})
