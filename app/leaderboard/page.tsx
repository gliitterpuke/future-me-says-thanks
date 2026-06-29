import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import Leaderboard from "@/components/Leaderboard";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding");

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <Nav
        active="leaderboard"
        name={profile.display_name}
        userId={user.id}
        avatar={profile.avatar}
      />
      <Leaderboard meId={user.id} />
    </div>
  );
}
