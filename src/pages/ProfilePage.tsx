import ProfileInfoForm from '@/features/account/ProfileInfoForm'
import ChangePasswordForm from '@/features/account/ChangePasswordForm'
import AccountSection from '@/features/account/AccountSection'

function ProfilePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 sm:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Profile &amp; Account</h1>
        <p className="text-caption text-muted-foreground">
          Your profile information is private to your account. HerHealth does not expose your
          profile information publicly, and sensitive account details are only shown here.
        </p>
      </div>

      <ProfileInfoForm />
      <ChangePasswordForm />
      <AccountSection />
    </main>
  )
}

export default ProfilePage
