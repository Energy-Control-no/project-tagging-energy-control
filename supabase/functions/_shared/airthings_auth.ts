import simpleOauthModule from 'npm:simple-oauth2@2.5.2';

// Environment variables for client credentials
//const CLIENT_ID = Deno.env.get("AIRTHINGS_CLIENT_ID");
//const CLIENT_SECRET = Deno.env.get("AIRTHINGS_CLIENT_SECRET");

// Solstrand Hotel
const CLIENT_ID = "07c3687b-a630-4444-a9c5-c770f7bcb664";
const CLIENT_SECRET = "e0d9d342-fe87-40e2-97e1-fe546da60e8c";



const airthingsAuth = async () => {
  const oauth2 = simpleOauthModule.create({
    client: {
      id: CLIENT_ID,
      secret: CLIENT_SECRET,
    },
    auth: {
        tokenHost: 'https://accounts-api.airthings.com', // Host for token endpoint
        tokenPath: '/v1/token', // Specific path to the token endpoint
      },
  });

  try {
    const tokenConfig = {
      grant_type: 'client_credentials',
      scope: ['read:device', 'write:device', 'profile']
    };


    const result = await oauth2.clientCredentials.getToken(tokenConfig);

    // Use access_token to make API calls
    return result.access_token;
  } catch (error) {
    console.error('Error authorizing with Airthings API:', error.message);
    return null;
  }
};

export default airthingsAuth;
