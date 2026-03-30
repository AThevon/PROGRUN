import { Globe, GitFork } from "lucide-react";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-10 text-center">
        <h1 className="font-bebas text-6xl tracking-widest leading-none">
          RUN<span className="text-accent">TRACK</span>
        </h1>
        <p className="mt-3 font-dm text-muted text-sm tracking-wide">
          Suis ta progression. Atteins tes objectifs.
        </p>
      </div>

      {/* Auth buttons */}
      <div className="w-full max-w-xs flex flex-col gap-3">
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-surface border border-border rounded-xl px-5 py-3.5 font-dm text-text text-sm font-medium hover:border-accent transition-colors"
          >
            <Globe size={18} />
            Continuer avec Google
          </button>
        </form>

        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-surface border border-border rounded-xl px-5 py-3.5 font-dm text-text text-sm font-medium hover:border-accent transition-colors"
          >
            <GitFork size={18} />
            Continuer avec GitHub
          </button>
        </form>
      </div>
    </main>
  );
}
