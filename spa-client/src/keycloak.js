import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    url: 'http://localhost:8080',
    realm: 'myrealm',
    clientId: 'my-react-client',
});

export default keycloak;
