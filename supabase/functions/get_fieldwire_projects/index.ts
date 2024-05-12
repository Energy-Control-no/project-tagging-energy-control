async function generateFieldwireToken() {
  const apiUrl = 'https://client-api.super.fieldwire.com/api_keys/jwt';
  const apiToken = 'VVajjxDlt6r6q51S4Mpv8tWS51zibcnYWidB95WflJosdtQzjAepgx2mY8cM7njj';

  const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ api_token: apiToken })
  });

  const responseData = await response.json();
  if (responseData && responseData.access_token) {
      return responseData.access_token;
  } else {
      throw new Error('No access token found in the response');
  }
}

async function getFieldwireProjects(token: string) {
  const projectsUrl = 'https://client-api.us.fieldwire.com/api/v3/account/projects';
  const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        'Fieldwire-Version': '2024-01-01',
        'Fieldwire-Per-Page': '1000',
        authorization: `Bearer ${token}`,
    },
};
  const response = await fetch(projectsUrl, options)

  if (!response.ok) {
      throw new Error('Failed to fetch projects');
  }

  return await response.json();
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
          })
    }

    const token = await generateFieldwireToken();
    const projects = await getFieldwireProjects(token);
    return new Response(JSON.stringify({ projects: projects }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
} catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
}
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/get_fieldwire_projects' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' 


*/
