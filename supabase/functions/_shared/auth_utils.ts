import { createClient } from "jsr:@supabase/supabase-js@2";

export async function verifyUserAuth(req: Request): Promise<boolean> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return false;
  }
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } });
  try {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error) {
      console.error("Error fetching user:", error.message);
      return false;
    }
    return Boolean(data.user);
  } catch (error) {
    console.error("Unexpected error:", error);
    return false;
  }
}
