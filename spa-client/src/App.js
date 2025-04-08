import { useEffect, useState } from 'react';
import keycloak from './keycloak';

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    keycloak.init({ onLoad: 'login-required' }).then(auth => {
      setAuthenticated(auth);
    });
  }, []);

  if (!authenticated) return <div>Loading...</div>;

  return (
    <div>
      <h1>Добро пожаловать, {keycloak.tokenParsed?.preferred_username}</h1>
      <button onClick={() => keycloak.logout()}>Выход</button>
    </div>
  );
}

export default App;
