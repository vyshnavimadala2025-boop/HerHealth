import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import DeleteCategoryDialog from '@/features/dataPrivacy/DeleteCategoryDialog'
import DeleteAllDataDialog from '@/features/dataPrivacy/DeleteAllDataDialog'
import { useDataDeletion } from '@/features/dataPrivacy/useDataDeletion'
import { DATA_CATEGORIES } from '@/features/dataPrivacy/types'

function DataPrivacySection() {
  const { deleteCategory, deleteAllData } = useDataDeletion()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-attention text-attention-foreground">
            <ShieldAlert className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Data &amp; Privacy</CardTitle>
        </div>
        <CardDescription>
          Permanently delete your recorded HerHealth data. This does not close your account or
          remove your login — see the Account section below.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-caption text-muted-foreground">
          Deletion is permanent and cannot be undone. If you&apos;d like to keep a copy first, you
          can{' '}
          <Link to="/reports" className="underline underline-offset-2">
            export your data from Reports
          </Link>{' '}
          before deleting it.
        </p>

        <ul className="flex flex-col gap-2">
          {DATA_CATEGORIES.map((category) => (
            <li
              key={category.value}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
            >
              <span className="text-sm">{category.label}</span>
              <DeleteCategoryDialog
                label={category.label}
                onConfirmDelete={() => deleteCategory(category.value)}
              />
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 rounded-lg border border-destructive/40 p-3">
          <p className="text-sm font-medium">Delete everything</p>
          <p className="text-caption text-muted-foreground">
            Permanently deletes all categories above at once. This cannot be undone.
          </p>
          <DeleteAllDataDialog onConfirmDeleteAll={deleteAllData} />
        </div>
      </CardContent>
    </Card>
  )
}

export default DataPrivacySection
