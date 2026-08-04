import { AlertTriangle } from 'lucide-react'

function MedicalDisclaimerPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-14 sm:px-6">
      <div className="flex flex-col items-start gap-4 animate-in fade-in slide-in-from-bottom-1 duration-500 motion-reduce:animate-none">
        <div className="flex size-12 items-center justify-center rounded-full bg-attention text-attention-foreground">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-caption font-medium tracking-wide text-primary uppercase">Medical Disclaimer</p>
          <h1 className="text-title font-display text-foreground">Not a Substitute for Medical Care</h1>
          <p className="text-body text-muted-foreground">
            Please read this page carefully before relying on HerHealth for any health-related
            decision.
          </p>
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-lg text-foreground">HerHealth is a tracking tool, not a medical provider</h2>
        <p className="text-body text-muted-foreground">
          HerHealth records the information you choose to enter — check-ins, cycle dates, journal
          entries, optional PCOS/PCOD observations, goals, and progress — and presents it back to
          you as summaries, trends, and reports. These summaries describe patterns in what you
          recorded. They are not medical advice or a medical diagnosis.
        </p>
      </section>

      <section className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-display text-lg text-foreground">HerHealth does not</h2>
        <ul className="flex flex-col gap-1.5 text-body text-muted-foreground">
          <li>Diagnose PCOS, PCOD, or any other medical condition</li>
          <li>Predict illness, fertility, or pregnancy</li>
          <li>Assess or score medical risk</li>
          <li>Recommend treatment or medication</li>
          <li>Replace advice from a qualified healthcare professional</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-lg text-foreground">Cycle estimates</h2>
        <p className="text-body text-muted-foreground">
          Estimated cycle length and estimated next period dates are calculated only from the dates
          you have recorded. They are not medical predictions and may not be accurate.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-lg text-foreground">If you have a medical concern</h2>
        <p className="text-body text-muted-foreground">
          Please consult a qualified healthcare professional for any medical concern, symptom, or
          question. HerHealth is not equipped to respond to medical emergencies — if you are
          experiencing a medical emergency, contact emergency services in your area immediately.
        </p>
      </section>
    </main>
  )
}

export default MedicalDisclaimerPage
