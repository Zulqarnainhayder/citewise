const colors = ["bg-red-400", "bg-amber-400", "bg-lime-400", "bg-emerald-400"];
const labels = ["Too weak", "Weak", "Okay", "Strong"];

function score(password: string) {
  return [
    password.length >= 8,
    /[A-Z]/.test(password) && /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
}

/** A visual hint only. Supabase accepts any password of 6+ characters. */
export function PasswordStrength({ password }: { password: string }) {
  if (password.length === 0) return null;
  const strength = score(password);

  return (
    <div className="mt-2.5">
      <div className="flex gap-1.5">
        {colors.map((color, i) => (
          <span
            key={color}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < strength ? color : "bg-brand-200 dark:bg-brand-800"
            }`}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-brand-600 dark:text-brand-300">
        Password strength: {labels[Math.max(strength - 1, 0)]}
      </p>
    </div>
  );
}
