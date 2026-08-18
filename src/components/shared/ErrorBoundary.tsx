import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, HeartPulse, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Top-level render-crash safety net. Without this, an uncaught exception
 * anywhere in the component tree unmounts the whole app and leaves a blank
 * white screen (React's default behavior) — this renders a branded,
 * actionable recovery screen instead.
 *
 * SAFE-LOGGING GUARANTEE: this project has no frontend telemetry/logging
 * pipeline today (verified — no console.error/analytics/Sentry call exists
 * anywhere else in src/), so the minimal, dependency-free choice is a
 * single console.error() call, matching that absence rather than
 * introducing a new logging service as a side effect of a crash-screen
 * task. Only error.name, error.message, and errorInfo.componentStack are
 * logged — never error.stack. componentStack is React's own
 * component-name trail (e.g. "in MessageBubble\n in ConversationList"),
 * never props, state, or rendered text — React's error boundary API
 * structurally does not hand a caught component's props/state to
 * componentDidCatch, so there is no code path here that could leak
 * message content, health information, tokens, or secrets even by
 * accident. error.message is a JS engine/library-authored string (e.g.
 * "Cannot read properties of undefined"), not user input.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Unhandled render error', {
      name: error.name,
      message: error.message,
      componentStack: errorInfo.componentStack,
    })
  }

  handleReset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="flex items-center gap-2 text-primary">
          <HeartPulse className="size-5" aria-hidden="true" />
          <span className="font-display text-lg font-medium">SIRILA</span>
        </div>

        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" aria-hidden="true" />
        </div>

        <div className="flex max-w-sm flex-col gap-1">
          <h1 role="alert" className="text-heading font-display text-foreground">
            Something went wrong
          </h1>
          <p className="text-body text-muted-foreground">
            SIRILA ran into an unexpected problem. Your data is safe — this only affects the current screen.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Button type="button" onClick={this.handleReset} className="rounded-xl">
            <RotateCcw className="size-4" aria-hidden="true" />
            Try Again
          </Button>
          {/* Plain <a>, not react-router's <Link> — a full page load works
              even if the crash is somehow router-state-related, unlike a
              client-side navigation that depends on router context. */}
          <a href="/dashboard" className="text-caption text-muted-foreground hover:text-foreground hover:underline">
            Or reload SIRILA from your dashboard
          </a>
        </div>
      </main>
    )
  }
}

export default ErrorBoundary
