import simpleOauthModule from 'npm:simple-oauth2@2.5.2';
import process from 'node:process';

// Environment variables for client credentials
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

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
      scope: ['read:device'],
      fetch: { allow_redirects: false }
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
