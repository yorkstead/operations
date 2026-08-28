import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PasskeySetup } from "@/components/auth/passkey-setup";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Passkeys | Yorkstead Operations",
  description: "Manage passwordless access to Yorkstead Operations.",
};

function safeNextPath(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate?.startsWith("/") && !candidate.startsWith("//") ? candidate : "/jobs";
}

export default async function PasskeysPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?next=/account/passkeys");

  const params = await searchParams;
  return <PasskeySetup nextPath={safeNextPath(params.next)} />;
}
