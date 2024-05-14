import airthingsAuth from '../_shared/airthings_auth.ts';

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />


Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { deviceId, serialNumber, locationId, deviceName } = await req.json();
    const token = await airthingsAuth();
    if (!token) {
      return new Response(JSON.stringify({ error: "Failed to get auth token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiUrl = `https://ext-api.airthings.com/v1/locations/${locationId}/devices`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id: deviceId,
        name: deviceName,
        serialNumber: serialNumber
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(JSON.stringify(errorData), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Error adding Airthings device:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
