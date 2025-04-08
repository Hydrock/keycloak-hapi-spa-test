require('dotenv').config();
const Hapi = require('@hapi/hapi');

/**
 * @see https://www.npmjs.com/package/@hapi/yar
 */
const Yar = require('@hapi/yar');
const Path = require('path');
const axios = require('axios');

const PORT = 3000;

const init = async () => {
    const server = Hapi.server({ port: PORT });

    await server.register({
        plugin: Yar,
        options: {
            storeBlank: false,
            cookieOptions: {
                password: process.env.SESSION_SECRET,
                isSecure: false
            }
        }
    });

    await server.register(require('./plugins/keycloakAuth'));

    server.route({
        method: 'GET',
        path: '/',
        // options: { plugins: { 'keycloak-auth': { protect: true } } },
        handler: (req, h) => {
            console.log('req from proxy:', req);
            // const user = req.yar.get('user');
            // return `Привет, ${user.profile.preferred_username}`;
            return 'Привет'
        }
    });

    server.route({
        method: 'GET',
        path: '/wow',
        // options: { plugins: { 'keycloak-auth': { protect: true } } },
        handler: (req, h) => {
            console.log('req from proxy:', req);
            // const user = req.yar.get('user');
            // return `Привет, ${user.profile.preferred_username}`;
            return 'Wow'
        }
    });

    server.route({
        method: 'GET',
        path: '/movies',
        // options: { plugins: { 'keycloak-auth': { protect: true } } },
        handler: async (req, h) => {
            // console.log('req from proxy:', req);
            // const user = req.yar.get('user');
            // console.log('user:', user);
            // const accessToken = user?.access_token;
            // console.log('accessToken:', accessToken);
            // console.log('accessToken:', accessToken);


            console.log('req.headers:', req.headers);
            const accessToken = req.headers['x-forwarded-access-token'];
            console.log('accessToken 22222:', accessToken);

            if (!accessToken) {
                return h.response('Not authorized').code(401);
            }

            try {
                const res = await axios.get('http://node-server-backend:3001/movies', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                return res.data;
            } catch (err) {
                console.error('Error fetching movies:', err.message);
                return h.response('Movie API error').code(502);
            }
        }
    });

    await server.start();
    console.log(`🚀 BFF сервер: http://localhost:${PORT}`);
};

init();
