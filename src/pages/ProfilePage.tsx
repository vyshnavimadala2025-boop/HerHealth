import ProfileInfoForm from '@/features/account/ProfileInfoForm'
import ChangePasswordForm from '@/features/account/ChangePasswordForm'
import AccountSection from '@/features/account/AccountSection'
import DataPrivacySection from '@/features/dataPrivacy/DataPrivacySection'
import PageHeader from '@/components/shared/PageHeader'
import PrivacyBadge from '@/components/shared/PrivacyBadge'

function ProfilePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <PageHeader
        title="Profile & Account"
        captions={[
          'Your profile information is private to your account. HerHealth does not expose your profile information publicly, and sensitive account details are only shown here.',
        ]}
      />
      <PrivacyBadge label="Visible only to you — never shared or made public" />

      <div id="account-settings" className="flex scroll-mt-24 flex-col gap-6">
        <ProfileInfoForm />
        <ChangePasswordForm />
        <AccountSection />
      </div>
      <div id="privacy" className="scroll-mt-24">
        <DataPrivacySection />
      </div>
    </main>
  )
}

export default ProfilePage
