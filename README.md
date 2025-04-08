# keycloak-hapi-spa-test

Запустить Docker Compose (-d detouch mode)

```sh
docker compose up

или

docker compose up -d
```

✅ Настроим Realm и Client
 • Зайди в <http://localhost:8080>
 • Войди как admin / admin
 • Создай новый Realm: myrealm
 • Создай клиента:
 • client_id: my-react-client
 • Тип: OpenID Connect
 • Доступен: ✅ public client
 • URL перенаправления: <http://localhost:3000/>*
 • Direct Access Grants Enabled: ✅ (если будем логиниться с сервера)
 • Standard Flow Enabled: ✅ (Authorization Code Flow)
 • Создай тестового пользователя с паролем (например: alex / testpass)

В файле `/etc/hosts` необходимо прописать:

```hosts
127.0.0.1 keycloak
```
