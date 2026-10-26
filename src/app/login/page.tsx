import { Logo } from "@/components/Logo";
import { ShieldCheckIcon } from "@/components/icons";
import { ThemeButton } from "@/components/theme/ThemeButton";
import { AuthForm } from "@/features/auth/components/AuthForm";
import { BrandPanel } from "@/features/auth/components/BrandPanel";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-1">
      <BrandPanel />

      <main className="relative flex flex-1 items-center justify-center bg-brand-50 px-6 py-12 dark:bg-brand-950 lg:w-[36rem] lg:flex-none xl:w-[40rem]">
        <ThemeButton className="absolute right-4 top-4" />
        <div className="citewise-fade-up w-full max-w-md rounded-2xl border border-brand-200 bg-white p-8 shadow-xl shadow-brand-900/5 dark:border-brand-800 dark:bg-brand-900/60 sm:p-10">
          <Logo className="mb-8 lg:hidden" />
          <AuthForm />
          <p className="mt-6 flex items-center justify-center gap-1.5 border-t border-brand-200 pt-5 text-xs text-brand-600 dark:border-brand-800 dark:text-brand-300">
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            Your documents stay private to your account
          </p>
        </div>
      </main>
    </div>
  );
}
