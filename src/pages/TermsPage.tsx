import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'

function TermsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-14 sm:px-6">
      <div className="flex flex-col items-start gap-4 animate-in fade-in slide-in-from-bottom-1 duration-500 motion-reduce:animate-none">
        <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <FileText className="size-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-caption font-medium tracking-wide text-primary uppercase">Terms</p>
          <h1 className="text-title font-display text-foreground">Terms of Use</h1>
          <p className="text-body text-muted-foreground">
            These terms describe your use of SIRILA as a personal wellness tracking tool.
          </p>
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-lg text-foreground">1. Acceptance of these terms</h2>
        <p className="text-body text-muted-foreground">
          By creating an account and using SIRILA, you agree to these terms. If you do not agree,
          please do not use the platform.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-lg text-foreground">2. What SIRILA is</h2>
        <p className="text-body text-muted-foreground">
          SIRILA is a personal wellness tracking and organization tool. It is not a medical
          device, a medical provider, or a substitute for professional healthcare. It records the
          information you choose to enter and presents it back to you as summaries and reports.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-lg text-foreground">3. Your account</h2>
        <p className="text-body text-muted-foreground">
          You are responsible for keeping your login credentials secure and for the accuracy of the
          information you choose to record. You must be able to provide a valid email address to
          create an account.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-lg text-foreground">4. Acceptable use</h2>
        <p className="text-body text-muted-foreground">
          You agree to use SIRILA only for its intended purpose — recording and reviewing your
          own personal wellness information — and not to attempt to access another user&apos;s
          account or data.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-lg text-foreground">5. No medical advice</h2>
        <p className="text-body text-muted-foreground">
          Nothing in SIRILA constitutes medical advice, diagnosis, or treatment. See our{' '}
          <Link to="/medical-disclaimer" className="text-primary underline underline-offset-2">
            Medical Disclaimer
          </Link>{' '}
          for details.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-lg text-foreground">6. Changes to these terms</h2>
        <p className="text-body text-muted-foreground">
          We may update these terms from time to time. Continued use of SIRILA after an update
          means you accept the revised terms.
        </p>
      </section>

      <section className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-4">
        <p className="text-caption text-muted-foreground">
          This page is a general description of terms of use and does not constitute legal advice.
        </p>
      </section>
    </main>
  )
}

export default TermsPage
