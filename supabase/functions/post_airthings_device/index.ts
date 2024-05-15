// @supabase/functions/post_airthings_device/index.ts

import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import airthingsAuth from './_shared/airthings_auth.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("Initializing Airthings post_device function");

Deno.serve(async (req) => {
  const accountId = "c08fc819-13cf-4c7b-82ee-3212e338c5f1"; // Solstrand Hotel
  console.log("Received request with method:", req.method);
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // For development only, specify domains in production
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type"
  });

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: headers });
  }

  if (req.method !== "POST") {
    console.log("Method not allowed");
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: headers
    });
  }

  try {
    
    const requestBody = await req.text(); // Get raw request body
    console.log("Raw request body:", requestBody);

    const { deviceId, serialNumber, locationId, deviceName } = JSON.parse(requestBody);
    console.log("Parsed JSON:", { deviceId, serialNumber, locationId, deviceName });

    const token = await airthingsAuth();
    if (!token) {
      console.log("Failed to get auth token");
      return new Response(JSON.stringify({ error: "Failed to get auth token" }), {
        status: 401,
        headers: headers,
      });
    }
    console.log("Auth token:", token);

    const apiUrl = `https://ext-api.airthings.com/v1/locations/${locationId}/devices?accountId=${accountId}`;
    console.log("apiUrl:", apiUrl);
    console.log("apiBody:", {
      id: deviceId,
      name: deviceName,
      serialNumber: serialNumber,
    });
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: deviceId,
        name: deviceName,
        serialNumber: serialNumber,
      }),
    });
    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);
    console.log("Response body:", response.body);
    if (!response.ok) {
      const errorData = await response.text(); // Get raw response body for error
      console.log("API error response:", errorData);
      return new Response(errorData, {
        status: response.status,
        headers: headers,
      });
    }

    const data = await response.json();
    console.log("API success response:", data);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error("Error processing request:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: headers,
    });
  }
});
