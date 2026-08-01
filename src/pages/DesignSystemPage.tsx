import { HeartPulse } from 'lucide-react'
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

const colorTokens = [
  { swatchClass: 'bg-primary', label: 'Primary' },
  { swatchClass: 'bg-secondary', label: 'Secondary' },
  { swatchClass: 'bg-accent', label: 'Accent' },
  { swatchClass: 'bg-muted', label: 'Muted' },
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
        <h1 className="text-display font-display">HerHealth</h1>
        <p className="text-body-lg text-muted-foreground max-w-xl">
          Foundation tokens for color, typography, and elevation used across the
          product.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-display">Color</h2>
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
    </div>
  )
}

export default DesignSystemPage
