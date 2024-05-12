// @supabase/functions/_shared/fieldwire_api.ts

export async function generateFieldwireToken(): Promise<string> {
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
