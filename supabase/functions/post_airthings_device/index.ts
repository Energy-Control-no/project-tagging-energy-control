import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import airthingsAuth from './_shared/airthings_auth.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

serve(async (req) => {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // Adjust in production
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type"
  });

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  try {
    const requestData = await req.json();
    const { fw_id, deviceInfo } = requestData;

    // Validate required deviceInfo fields
    const requiredFields = ['serialNumber', 'deviceId', 'deviceName']; // Adjust these fields as necessary
    for (const field of requiredFields) {
      if (!deviceInfo[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Fetch project data from Supabase
    const { data: projectData, error } = await supabase
      .from('project')
      .select('*')
      .eq('fw_id', fw_id)
      .single();

    if (error) throw new Error('Failed to fetch project data');

    // Combine locationId from the database with deviceInfo
    deviceInfo.locationId = projectData.at_locationId;

    // Authenticate with Airthings
    const accessToken = await airthingsAuth({
      clientId: projectData.at_client_id,
      clientSecret: projectData.at_client_secret,
      accountId: projectData.at_accountId
    });

    // Post device information to Airthings API
    const airthingsResponse = await fetch('https://api.airthings.com/v1/devices', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deviceInfo)
    });

    if (!airthingsResponse.ok) {
      throw new Error('Failed to post device information to Airthings API');
    }

    const airthingsData = await airthingsResponse.json();

    return new Response(JSON.stringify({ message: "Device processed successfully", airthingsData }), { headers });
  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
});
