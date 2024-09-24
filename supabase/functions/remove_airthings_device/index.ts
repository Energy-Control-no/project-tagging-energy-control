import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyUserAuth } from "../_shared/auth_utils.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

Deno.serve(async (req) => {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // Adjust in production
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  });

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  if (req.method !== "DELETE") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  const isAuthenticated = await verifyUserAuth(req);
  if (!isAuthenticated) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers,
    });
  }

  try {
    const requestData = await req.json();
    const { fw_id, deviceInfo } = requestData;

    // Validate required deviceInfo fields
    const requiredFields = ["serialNumber", "deviceId", "deviceName"]; // Adjust these fields as necessary
    for (const field of requiredFields) {
      if (!deviceInfo[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Delete device data from Supabase 'devices' table
    const { data: deleteData, error: deleteError } = await supabase.from("devices").delete().match({ fw_id: fw_id, at_serialNumber: deviceInfo.serialNumber });

    if (deleteError) {
      throw new Error(`Failed to delete device data from Supabase: ${deleteError.message}`);
    }

    return new Response(JSON.stringify({ message: "Device removed successfully" }), { headers });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
});
