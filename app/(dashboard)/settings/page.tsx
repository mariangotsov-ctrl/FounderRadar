import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/shared/PageHeader";
import { SettingsForm } from "@/components/auth/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  return (
    <div className="max-w-xl space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account"
      />
      <SettingsForm
        initialName={session?.user?.name ?? ""}
        initialEmail={session?.user?.email ?? ""}
      />
    </div>
  );
}
