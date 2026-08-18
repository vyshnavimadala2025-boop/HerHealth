// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import ErrorBoundary from '@/components/shared/ErrorBoundary'

/**
 * Scoped to jsdom via the file-level pragma above only — every other test
 * file in this project intentionally stays on vitest's default (node)
 * environment; this is the one component that genuinely needs a DOM to
 * test rendering/click behavior. jsdom and @testing-library/react were
 * added as devDependencies specifically for this file — no other test in
 * the project uses them.
 */

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Boom: synthetic test failure, not a real bug')
  }
  return <div>Safe child content</div>
}

let consoleErrorSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  // React logs the caught error to console.error on its own (dev-mode
  // noise, separate from our own componentDidCatch call) — silenced here
  // so test output stays clean; still restored and inspectable per test.
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  consoleErrorSpy.mockRestore()
  cleanup()
})

describe('ErrorBoundary — normal rendering', () => {
  it('renders children unchanged when nothing throws', () => {
    render(
      <ErrorBoundary>
        <div>Safe child content</div>
      </ErrorBoundary>,
    )

    expect(screen.getByText('Safe child content')).toBeTruthy()
  })

  it('renders multiple children exactly as passed, with no wrapper chrome visible', () => {
    render(
      <ErrorBoundary>
        <div>First</div>
        <div>Second</div>
      </ErrorBoundary>,
    )

    expect(screen.getByText('First')).toBeTruthy()
    expect(screen.getByText('Second')).toBeTruthy()
    expect(screen.queryByText('Something went wrong')).toBeNull()
  })
})

describe('ErrorBoundary — child throws', () => {
  it('catches the error and renders the fallback instead of crashing the test', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Something went wrong')).toBeTruthy()
    expect(screen.queryByText('Safe child content')).toBeNull()
  })

  it('renders the fallback with an alert role, so assistive tech announces it', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert').textContent).toContain('Something went wrong')
  })

  it('logs only name/message/componentStack — never the raw Error object, props, or state', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    )

    const ownLogCall = consoleErrorSpy.mock.calls.find(
      (call: unknown[]) => call[0] === '[ErrorBoundary] Unhandled render error',
    )
    expect(ownLogCall).toBeTruthy()

    const logged = ownLogCall![1] as Record<string, unknown>
    expect(Object.keys(logged).sort()).toEqual(['componentStack', 'message', 'name'])
    expect(logged.message).toBe('Boom: synthetic test failure, not a real bug')
    expect(logged.name).toBe('Error')
    expect(typeof logged.componentStack).toBe('string')
  })
})

describe('ErrorBoundary — fallback content is safe', () => {
  it('never renders the raw error message or a stack trace to the user', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    )

    const fallbackText = document.body.textContent ?? ''
    expect(fallbackText).not.toContain('Boom: synthetic test failure')
    expect(fallbackText).not.toContain('at Bomb')
    expect(fallbackText).not.toContain('.tsx:')
  })

  it('the fallback DOM contains no <pre> or <code> block (common accidental stack-trace dump patterns)', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(document.querySelector('pre')).toBeNull()
    expect(document.querySelector('code')).toBeNull()
  })
})

describe('ErrorBoundary — Try Again recovery', () => {
  it('clicking Try Again clears the error state and re-renders children when they no longer throw', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Something went wrong')).toBeTruthy()

    // Simulates "whatever caused the crash is now resolved" (e.g. the
    // parent re-rendered with corrected data) — swapping in a non-throwing
    // child alone does NOT clear the boundary's own error state; render()
    // still short-circuits to the fallback until Try Again is clicked.
    rerender(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))

    expect(screen.getByText('Safe child content')).toBeTruthy()
    expect(screen.queryByText('Something went wrong')).toBeNull()
  })

  it('clicking Try Again on a still-broken child re-shows the fallback instead of crashing again', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    )

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))

    // Bomb still throws — the boundary catches it again and shows the
    // fallback again, rather than the app crashing outright.
    expect(screen.getByText('Something went wrong')).toBeTruthy()
  })

  it('provides a plain-link fallback-of-last-resort to /dashboard, not a client-side router Link', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    )

    const link = screen.getByRole('link', { name: /dashboard/i })
    expect(link.getAttribute('href')).toBe('/dashboard')
  })
})
