// Import the necessary module for Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Start serving the HTTP requests
Deno.serve(async (req: Request) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const authHeader = req.headers.get('Authorization')!;
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  try {
    // Extract query parameters
    const url = new URL(req.url);
    const fw_id = url.searchParams.get('fw_id');

    if (!fw_id) {
      return new Response(JSON.stringify({ error: 'fw_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Retrieve the data from the 'project' table
    const { data, error } = await supabaseClient
      .from('project')
      .select('*')
      .eq('fw_id', fw_id);

    // Check for errors during the retrieval operation
    if (error) {
      throw error;
    }

    // Send the retrieved data back as a response
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/get_project?fw_id=some_fw_id' \
    --header 'Authorization: Bearer your_token_here' \
    --header 'Content-Type: application/json'
*/
