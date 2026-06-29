import pg from 'pg';
import { env } from '../../config/env.js';

const { Pool } = pg;

// Pool de connexions PostgreSQL partage par les repositories.
// Un pool evite d'ouvrir une nouvelle connexion a chaque requete HTTP.
export const pool = new Pool({
  connectionString: env.databaseUrl
});

// Fonction utilitaire pour executer une requete SQL.
// Elle garde les repositories simples et centralise l'acces au pool.
export function query(sql, params = []) {
  return pool.query(sql, params);
}

// START TRANSACTION SAFE CLIENT
export async function beginTransaction() {
  const client = await pool.connect();
  await client.query("BEGIN");

  return client;
}
