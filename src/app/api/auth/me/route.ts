import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ user: null });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (error) {
      return NextResponse.json({ user: null, error: error.message });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null, error: "Internal error" });
  }
}
