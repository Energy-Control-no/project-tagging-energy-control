import simpleOauthModule from 'npm:simple-oauth2@2.5.2';
// airthings_auth.ts
const airthingsAuth = async ({ clientId, clientSecret, accountId }) => {
  const oauth2 = simpleOauthModule.create({
    client: {
      id: clientId,
      secret: clientSecret,
    },
    auth: {
      tokenHost: 'https://accounts-api.airthings.com',
      tokenPath: '/v1/token',
    },
  });

  try {
    const tokenConfig = {
      grant_type: 'client_credentials',
      scope: ['read:device', 'write:device', 'profile']
    };

    const result = await oauth2.clientCredentials.getToken(tokenConfig);
    return result.access_token;
  } catch (error) {
    console.error('Error authorizing with Airthings API:', error.message);
    throw error;
  }
};

export default airthingsAuth;
