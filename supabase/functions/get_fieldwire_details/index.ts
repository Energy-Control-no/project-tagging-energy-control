import { verifyUserAuth } from '../_shared/auth_utils.ts';
import { generateFieldwireToken } from '../_shared/fieldwire_api.ts';

async function fetchFieldwireProjectDetails(token: string, project_id: string) {
    const categoriesUrl = `https://client-api.us.fieldwire.com/api/v3/account/project_attributes/${project_id}`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'Fieldwire-Version': '2024-01-01',
            authorization: `Bearer ${token}`,
        },
    };

    const response = await fetch(categoriesUrl, options);

    if (!response.ok) {
        throw new Error(`Failed to fetch details for project ${project_id}`);
    }
    return await response.json();
}

Deno.serve(async (req) => {
    const headers = new Headers({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // This allows all domains. For production, specify your domain instead.
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      });
      const isAuthenticated = await verifyUserAuth(req)
      if (!isAuthenticated) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers,
        })
      }
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

        const url = new URL(req.url);
        const project_id = url.searchParams.get('project_id');

        if (!project_id) {
            return new Response(JSON.stringify({ error: 'Project ID is required' }), {
                status: 400,
                headers,
            });
        }

        const token = await generateFieldwireToken();
        const projectDetails = await fetchFieldwireProjectDetails(token, project_id);
        return new Response(JSON.stringify({ details: projectDetails }), {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers,
        });
    }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/get_fieldwire_details?project_id=b3a5fec3-0b77-49bf-b48a-7492d7652d81' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json'

*/
