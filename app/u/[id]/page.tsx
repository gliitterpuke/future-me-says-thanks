import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProfileView from "@/components/ProfileView";
import type { Entry, Gender } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, gender, avatar")
    .eq("id", id)
    .maybeSingle();
  if (!profile) notFound();

  // Public activity only — notes live in a private table we can't read here.
  const { data: entries } = await supabase
    .from("entries")
    .select("date, eat, workout, walk, exempt, exempt_reason")
    .eq("user_id", id);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <Link
        href="/leaderboard"
        className="text-sm text-ink/50 underline-offset-2 hover:underline"
      >
        ‹ Leaderboard
      </Link>
      <ProfileView
        name={profile.display_name}
        avatar={profile.avatar}
        gender={profile.gender as Gender}
        isMe={user.id === id}
        entries={(entries ?? []) as Entry[]}
      />
    </div>
  );
}
