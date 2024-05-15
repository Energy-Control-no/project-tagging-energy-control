// Import the necessary module for Supabase client
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define the type for the incoming project data
interface ProjectData {
  fw_id: string;
  at_client_id: string;
  at_client_secret: string;
  at_accountId: string;
  at_locationId: string;
}

// Start serving the HTTP requests
Deno.serve(async (req: Request) => {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // For development only, specify domains in production
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  });
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: headers });
  }

  const authHeader = req.headers.get("Authorization")!;
  const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", { global: { headers: { Authorization: authHeader } } });

  try {
    // Parse the request body
    const projectData: ProjectData = await req.json();

    // Insert the data into the 'project' table
    const { data, error } = await supabaseClient.from("project").insert([
      {
        fw_id: projectData.fw_id,
        at_client_id: projectData.at_client_id,
        at_client_secret: projectData.at_client_secret,
        at_accountId: projectData.at_accountId,
        at_locationId: projectData.at_locationId,
      },
    ]);

    // Check for errors during the insert operation
    if (error) {
      throw error;
    }

    // Send the inserted data back as a response
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to process request" }), {
      status: 500,
      headers: headers,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/post_project' \
    --header 'Authorization: Bearer your_token_here' \
    --header 'Content-Type: application/json' \
    --data '{
      "fw_id": "some_fw_id",
      "at_client_id": "some_client_id",
      "at_client_secret": "some_client_secret",
      "at_accountId": "some_account_id",
      "at_locationId": "some_location_id"
    }'
*/
