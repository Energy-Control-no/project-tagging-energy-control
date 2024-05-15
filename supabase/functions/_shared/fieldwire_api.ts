// @supabase/functions/_shared/fieldwire_api.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function generateFieldwireToken(): Promise<string> {
  // Check for existing valid token
  const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");

  const ttlAge = new Date(new Date().getTime() - 3 * 60 * 60 * 1000);

  let { data: tokens, error } = await supabaseClient.from("fieldwire").select("token").gt("created_at", ttlAge.toISOString()).order("created_at", { ascending: false }).limit(1);

  console.log("Error from fieldwire token DB call:", error);
  if (tokens && tokens.length > 0 && tokens[0].token) {
    return tokens[0].token;
  }
  // If no valid token, generate a new one
  console.log("Generating new token");
  const apiUrl = "https://client-api.super.fieldwire.com/api_keys/jwt";
  const apiToken = "VVajjxDlt6r6q51S4Mpv8tWS51zibcnYWidB95WflJosdtQzjAepgx2mY8cM7njj";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ api_token: apiToken }),
  });

  const responseData = await response.json();
  if (responseData && responseData.access_token) {
    // Store the new token in the database
    let { data, insertError } = await supabaseClient.from("fieldwire").insert([{ token: responseData.access_token }]);
    console.log("Inserted new token into DB");
    if (insertError) {
      console.error("Error inserting new token:", insertError.message);
      throw insertError;
    }

    return responseData.access_token;
  } else {
    throw new Error("No access token found in the response");
  }
}
