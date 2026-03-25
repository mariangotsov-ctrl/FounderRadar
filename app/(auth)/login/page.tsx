import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  if (session) redirect(sp.callbackUrl ?? "/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">FR</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Founder Radar</span>
          </div>
          <p className="text-gray-500">Track emerging AI startups</p>
        </div>
        <LoginForm
          callbackUrl={sp.callbackUrl}
          error={sp.error}
        />
      </div>
    </div>
  );
}
