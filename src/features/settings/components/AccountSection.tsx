import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SignOutButton } from "@/features/auth/components/SignOutButton";
import { SettingsSection } from "./SettingsSection";

type Props = {
  email: string;
  createdAt: string | null;
};

const dateFormat = new Intl.DateTimeFormat("en", { year: "numeric", month: "long", day: "numeric" });

export function AccountSection({ email, createdAt }: Props) {
  return (
    <SettingsSection title="Account" description="The email you sign in with.">
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-brand-600 dark:text-brand-300">Email</dt>
          <dd className="mt-0.5 break-all font-medium text-brand-900 dark:text-white" data-testid="account-email">
            {email}
          </dd>
        </div>
        {createdAt && (
          <div>
            <dt className="text-brand-600 dark:text-brand-300">Member since</dt>
            <dd className="mt-0.5 font-medium text-brand-900 dark:text-white">
              {dateFormat.format(new Date(createdAt))}
            </dd>
          </div>
        )}
      </dl>
      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-brand-100 pt-5 dark:border-brand-800">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-brand-800 dark:text-brand-100">Theme</span>
          <ThemeToggle className="w-44" />
        </div>
        <div className="ml-auto w-36">
          <SignOutButton fullWidth />
        </div>
      </div>
    </SettingsSection>
  );
}
