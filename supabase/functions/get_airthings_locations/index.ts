import airthingsAuth from "../_shared/airthings_auth.ts";

const getAirthingsLocations = async (accessToken: string, accountId: string) => {
  try {
    const encodedAccountId = encodeURIComponent(accountId);
    const url = `https://ext-api.airthings.com/v1/locations?accountId=${encodedAccountId}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
    return response.json();
} catch (error) {
    throw new Error(`Failed to fetch locations for account ${accountId}, ${error}`);
}}

Deno.serve(async (req: Request) => {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // This allows all domains. For production, specify your domain instead.
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  try {
    if (req.method === "OPTIONS") {
      // Handle CORS preflight request
      return new Response(null, { status: 204, headers });
    }

    if (req.method !== "GET") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers,
      });
    }

    const url = new URL(req.url); // Extract query parameters
    const client_id = url.searchParams.get('client_id');
    const client_secret = url.searchParams.get('client_secret');
    const account_id = url.searchParams.get('account_id');

    if (!client_id || !client_secret || !account_id) {
      return new Response(JSON.stringify({ error: 'Airthings client_id, client_secret and account_id are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Authenticate with Airthings
    const accessToken = await airthingsAuth({
      clientId: client_id,
      clientSecret: client_secret,
      accountId: "", // TODO: remove from function
    });

    const locations = await getAirthingsLocations(accessToken, account_id);
    console.log(`Airthings locations: ${locations}`);
    return new Response(JSON.stringify(locations), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers,
    });
  }
});
