import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import Tracker from "@/components/Tracker";
import type { Gender } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, gender, avatar")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding");

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <Nav
        active="today"
        name={profile.display_name}
        userId={user.id}
        avatar={profile.avatar}
      />
      <Tracker
        userId={user.id}
        gender={profile.gender as Gender}
        name={profile.display_name}
        avatar={profile.avatar}
      />
    </div>
  );
}
