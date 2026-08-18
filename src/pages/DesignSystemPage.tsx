import { CalendarHeart, FlaskConical, HeartPulse } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import ProgressRing from '@/components/shared/ProgressRing'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import PrivacyBadge from '@/components/shared/PrivacyBadge'

const colorTokens = [
  { swatchClass: 'bg-primary', label: 'Primary (plum)' },
  { swatchClass: 'bg-secondary', label: 'Secondary' },
  { swatchClass: 'bg-accent', label: 'Accent' },
  { swatchClass: 'bg-muted', label: 'Muted' },
  { swatchClass: 'bg-support', label: 'Support (sage)' },
  { swatchClass: 'bg-lavender', label: 'Lavender' },
  { swatchClass: 'bg-blush', label: 'Blush' },
  { swatchClass: 'bg-peach', label: 'Peach' },
  { swatchClass: 'bg-attention', label: 'Attention' },
  { swatchClass: 'bg-destructive', label: 'Destructive' },
] as const

const shadowLevels = [
  { shadowClass: 'shadow-xs', label: 'xs' },
  { shadowClass: 'shadow-sm', label: 'sm' },
  { shadowClass: 'shadow-md', label: 'md' },
  { shadowClass: 'shadow-lg', label: 'lg' },
  { shadowClass: 'shadow-xl', label: 'xl' },
] as const

function DesignSystemPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-12 p-6 py-12">
      <section className="flex flex-col gap-2">
        <p className="text-caption text-muted-foreground uppercase tracking-wide">
          Design system
        </p>
        <h1 className="text-display font-display">SIRILA</h1>
        <p className="text-body-lg text-muted-foreground max-w-xl">
          Foundation tokens for color, typography, elevation, and motion used across the
          product.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-display">Color</h2>
        <p className="max-w-xl text-caption text-muted-foreground">
          Deep plum as the primary anchor, with sage, lavender, blush, and peach as restrained
          accent tones — never used as large fills, only for icon circles, badges, and small
          highlights. Page background (<code className="text-foreground">--background</code>, warm
          ivory) is deliberately a different tone than card surfaces (
          <code className="text-foreground">--card</code>, near-white) — that two-tone contrast is
          the elevation system: a card visibly lifts off the page without needing a heavy shadow.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {colorTokens.map((token) => (
            <div key={token.label} className="flex flex-col gap-2">
              <div
                className={`${token.swatchClass} h-16 rounded-lg border border-border shadow-sm`}
              />
              <span className="text-caption text-muted-foreground">{token.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-display">Typography</h2>
        <div className="flex flex-col gap-3">
          <p className="text-display font-display">Display</p>
          <p className="text-heading font-display">Heading</p>
          <p className="text-body-lg">Body large</p>
          <p className="text-body">Body</p>
          <p className="text-caption text-muted-foreground">Caption</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-display">Elevation</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {shadowLevels.map((level) => (
            <div
              key={level.label}
              className={`${level.shadowClass} flex h-16 items-center justify-center rounded-lg bg-card text-caption text-muted-foreground`}
            >
              {level.label}
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-display">Components</h2>

        <div className="flex flex-wrap items-center gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>

        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="size-5 text-primary" />
              Card title
            </CardTitle>
            <CardDescription>Supporting description text.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ds-email">Email</Label>
              <Input id="ds-email" type="email" placeholder="you@example.com" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Continue</Button>
          </CardFooter>
        </Card>
      </section>

      <Separator />

      <section className="flex flex-col gap-6">
        <h2 className="text-heading font-display">Stage 5a — new shared primitives</h2>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">ProgressRing</p>
          <div className="flex flex-wrap items-center gap-6">
            <ProgressRing value={71} label="5 of 7 days, 71%" colorClassName="text-primary">
              <span className="font-sans text-sm font-semibold tabular-nums">5/7</span>
            </ProgressRing>
            <ProgressRing value={60} label="3 of 5 goal sessions, 60%" colorClassName="text-support">
              <span className="font-sans text-sm font-semibold tabular-nums">60%</span>
            </ProgressRing>
            <ProgressRing value={50} label="Day 14 of 28" size={72} strokeWidth={6} colorClassName="text-blush-foreground">
              <span className="font-sans text-xs font-semibold tabular-nums">Day 14</span>
            </ProgressRing>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Skeleton</p>
          <div className="flex flex-col gap-2 max-w-sm">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">EmptyState</p>
          <EmptyState
            icon={CalendarHeart}
            title="No entries yet"
            description="This is a design-system preview of the shared empty-state pattern."
            action={<Button size="sm" variant="outline">Example action</Button>}
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">PrivacyBadge</p>
          <PrivacyBadge />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Notice / alert (left accent bar, not a boxed banner)</p>
          <div className="flex max-w-sm items-start gap-2.5 rounded-xl border-l-2 border-attention bg-attention/[0.07] px-3.5 py-3 text-caption text-attention-foreground">
            <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p className="leading-relaxed">Example notice text using the shared attention treatment.</p>
          </div>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-heading font-display">Motion</h2>
        <p className="max-w-xl text-caption text-muted-foreground">
          Restrained by design — &quot;quiet luxury,&quot; not an animated website. Page-level content
          fades and lifts in once on mount (
          <code className="text-foreground">animate-in fade-in slide-in-from-bottom-2 duration-500</code>
          ), never on every re-render. Every animated element also carries{' '}
          <code className="text-foreground">motion-reduce:animate-none</code>, and the app additionally
          disables all animation/transition duration globally under{' '}
          <code className="text-foreground">prefers-reduced-motion: reduce</code> (see{' '}
          <code className="text-foreground">src/index.css</code>). No page-transition library, no
          parallax, no particle effects.
        </p>
      </section>
    </div>
  )
}

export default DesignSystemPage
