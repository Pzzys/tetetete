import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Metodo nao permitido');
  
  const { user, pass, nome, tmdb_id, patrocinador, eps_p, eps_a, nota, tipo } = req.body;

  if (user !== process.env.ADMIN_USER || pass !== process.env.ADMIN_PASS) {
    return res.status(401).json({ error: 'Login Incorreto' });
  }

  try {
    await sql`INSERT INTO loryez (nome, tmdb_id, patrocinador, eps_p, eps_a, nota, tipo) 
              VALUES (${nome}, ${tmdb_id}, ${patrocinador}, ${eps_p}, ${eps_a}, ${nota}, ${tipo})`;
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
