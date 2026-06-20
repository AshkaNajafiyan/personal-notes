const jwt = require('jsonwebtoken');
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET env var is required');
const SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log('[authMiddleware] checking token');

    if (!authHeader?.startsWith('Bearer ')) {
        console.log('[authMiddleware] no Bearer token found');
        return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const user = jwt.verify(token, SECRET);
        console.log('[authMiddleware] token verified for user:', user.id);
        req.user = user;
        next ();
    } catch (err) {
        console.error('[authMiddleware] token verification failed:', err.message);
        return res.status(401).json({ error: 'invalid token' });
    }
}

module.exports = { authMiddleware, SECRET}
