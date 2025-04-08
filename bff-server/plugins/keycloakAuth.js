require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

module.exports = {
    name: 'keycloak-auth',
    register: async function (server) {
        const {
            KEYCLOAK_BASE_URL,
            KEYCLOAK_REALM,
            KEYCLOAK_CLIENT_ID,
            KEYCLOAK_CLIENT_SECRET,
            KEYCLOAK_REDIRECT_URI
        } = process.env;

        server.route([
            {
                method: 'GET',
                path: '/login',
                handler: (req, h) => {
                    const state = crypto.randomBytes(16).toString('hex');
                    req.yar.set('oauth_state', state);

                    const authUrl = `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth?` +
                        `client_id=${KEYCLOAK_CLIENT_ID}` +
                        `&response_type=code` +
                        `&scope=openid profile` +
                        `&redirect_uri=${encodeURIComponent(KEYCLOAK_REDIRECT_URI)}` +
                        `&state=${state}`;

                    return h.redirect(authUrl);
                }
            },

            {
                method: 'GET',
                path: '/callback',
                handler: async (req, h) => {
                    const { code, state } = req.query;
                    const savedState = req.yar.get('oauth_state');

                    if (!state || state !== savedState) {
                        return h.response('Invalid state').code(400);
                    }

                    const tokenRes = await axios.post(
                        `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
                        new URLSearchParams({
                            grant_type: 'authorization_code',
                            code,
                            client_id: KEYCLOAK_CLIENT_ID,
                            client_secret: KEYCLOAK_CLIENT_SECRET,
                            redirect_uri: KEYCLOAK_REDIRECT_URI
                        }),
                        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                    );

                    const { id_token, access_token } = tokenRes.data;

                    const userInfoRes = await axios.get(
                        `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
                        { headers: { Authorization: `Bearer ${access_token}` } }
                    );

                    req.yar.set('user', {
                        access_token,
                        id_token,
                        profile: userInfoRes.data
                    });

                    return h.redirect('/');
                }
            },

            {
                method: 'GET',
                path: '/logout',
                handler: (req, h) => {
                    req.yar.clear('user');
                    return h.redirect('/');
                }
            }
        ]);

        server.ext('onPreHandler', (request, h) => {
            const user = request.yar.get('user');
            const isProtected = request.route.settings.plugins['keycloak-auth']?.protect;

            if (isProtected && !user) {
                return h.redirect('/login').takeover();
            }

            return h.continue;
        });
    }
};
