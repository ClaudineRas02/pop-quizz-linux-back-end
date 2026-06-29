import { timingSafeEqual } from 'node:crypto';
import { env } from '../../config/env.js';

// Middleware de protection des routes admin.
// Aujourd'hui on utilise un token serveur simple.
// Plus tard, on pourra remplacer ce fichier par une verification JWT/session
// sans toucher aux controllers ni aux use cases.
export function requireAdmin(req, res, next) {
  if (!env.adminToken) {
    res.status(500).json({ message: 'ADMIN_TOKEN non configure.' });
    return;
  }

  const token = extractAdminToken(req);

  if (!token || !safeCompare(token, env.adminToken)) {
    res.status(401).json({ message: 'Acces admin non autorise.' });
    return;
  }

  next();
}

function extractAdminToken(req) {
  const authorization = req.get('Authorization');

  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim();
  }

  return req.get('X-Admin-Token');
}

function safeCompare(firstValue, secondValue) {
  const firstBuffer = Buffer.from(firstValue);
  const secondBuffer = Buffer.from(secondValue);

  if (firstBuffer.length !== secondBuffer.length) {
    return false;
  }

  return timingSafeEqual(firstBuffer, secondBuffer);
}
