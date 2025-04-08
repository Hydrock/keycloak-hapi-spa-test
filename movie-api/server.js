// movie-api/server.js
const express = require('express');
const jwt = require('jsonwebtoken'); // или keycloak-js / jwks-rsa
const app = express();
const PORT = 3001;

// Простая проверка Bearer-токена
app.get('/movies', (req, res) => {
    const auth = req.headers.authorization;
    console.log('movies auth:', auth);

    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).send('No token');
    }

    const token = auth.split(' ')[1];

    // ТОЛЬКО ДЛЯ ДЕМО: в проде нужно делать проверку подписи JWT
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log('payload:', payload);

    console.log('👤 Запрос от пользователя:', payload.preferred_username);

    res.json([
        { id: 1, title: 'Престиж' },
        { id: 2, title: 'Начало' },
        { id: 3, title: 'Интерстеллар' }
    ]);
});

app.listen(PORT, () => {
    console.log(`🎬 Movie API запущен на http://localhost:${PORT}`);
});
