import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import airthingsAuth from "../_shared/airthings_auth.ts";
import { verifyUserAuth } from "../_shared/auth_utils.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

serve(async (req) => {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // Adjust in production
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  });
  const isAuthenticated = await verifyUserAuth(req)
  if (!isAuthenticated) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers,
    })
  }
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  try {
    const requestData = await req.json();
    const { fw_id, deviceInfo, fw_task_id } = requestData;

    // Validate required deviceInfo fields
    const requiredFields = ["serialNumber", "deviceId", "deviceName"]; // Adjust these fields as necessary
    for (const field of requiredFields) {
      if (!deviceInfo[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Fetch project data from Supabase
    const { data: projectData, error } = await supabase.from("project").select("*").eq("fw_id", fw_id).single();

    if (error) throw new Error("Failed to fetch project data");

    // Combine locationId from the database with deviceInfo
    // deviceInfo.locationId = projectData.at_locationId;

    // Authenticate with Airthings
    const accessToken = await airthingsAuth({
      clientId: projectData.at_client_id,
      clientSecret: projectData.at_client_secret,
      accountId: projectData.at_accountId,
    });
    // https://ext-api.airthings.com/v1/locations/{locationId}/devices
    // Post device information to Airthings API
    const airthingsUrl = `https://ext-api.airthings.com/v1/locations/${projectData.at_locationId}/devices?accountId=${projectData.at_accountId}`;
    console.log("deviceInfo", deviceInfo);
    console.log(`POST ${airthingsUrl}`);
    const airthingsPOSTbody = {
      id: deviceInfo.deviceId,
      name: deviceInfo.deviceName,
      serialNumber: deviceInfo.serialNumber,
    };
    console.log("airthingsPOSTbody", airthingsPOSTbody);
    const airthingsResponse = await fetch(airthingsUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(airthingsPOSTbody),
    });
    console.log("airthingsResponse", airthingsResponse);
    console.log("airthingsResponse.code", airthingsResponse.status);
    console.log("airthingsResponse.data", airthingsResponse.data);
    console.log("airthingsResponse.ok", airthingsResponse.ok);


    if (!airthingsResponse.ok) {
      throw new Error("Failed to post device information to Airthings API");
    }
    console.log("Inserting device data into Supabase...");
    const airthingsData = await airthingsResponse.json();
       // Insert device data into Supabase 'devices' table
       const { insertData, insertError } = await supabase
       .from('devices')
       .insert([
         {
           fw_id: fw_id,
           created_at: new Date().toISOString(),
           fw_task_id: fw_task_id,
           at_serialNumber: deviceInfo.serialNumber,
           at_deviceName: deviceInfo.deviceName
         }
       ]);
       console.log("insertData", insertData);
       console.log("insertError", insertError);
 
     if (insertError) {
       throw new Error(`Failed to insert device data into Supabase: ${insertError.message}`);
     }

    return new Response(JSON.stringify({ message: "Device processed successfully", airthingsData }), { headers });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
});
