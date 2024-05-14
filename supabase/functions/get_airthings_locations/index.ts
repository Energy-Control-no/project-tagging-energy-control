import airthingsAuth from '../_shared/airthings_auth.ts';

async function fetchAirthingsLocations(token: string, account_id: string) {
    const locationsUrl = `https://ext-api.airthings.com/v1/locations?accountId=${account_id}`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            authorization: `Bearer ${token}`,
        }
    };

    try {
        const response = await fetch(locationsUrl, options);
        return await response.json();
    } catch (error) {
        throw new Error(`Failed to fetch locations for account ${account_id}, ${error}`);
    }
}

Deno.serve(async (req) => {
    const accountId = "499bdcd1-43a8-4d05-8ab4-40750cbbfb79";

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

        const token = await airthingsAuth();
        if (!token) {
            return new Response(JSON.stringify({ error: "Failed to get auth token" }), {
                status: 401,
                headers,
                });
        }
        console.log("token", token)
        const response = await fetchAirthingsLocations(token, accountId);

        return new Response(JSON.stringify(response), {
            status: 200,
            headers,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers,
        });
    }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/get_airthings_locations' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json'

*/
