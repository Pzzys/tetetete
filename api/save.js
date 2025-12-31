import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  const { user, pass, nome, tmdb_id, patrocinador, tipo, eps_p, eps_a, nota } = req.body;

  // Validação oculta via Vercel Env
  if (user !== process.env.ADMIN_USER || pass !== process.env.ADMIN_PASS) {
    return res.status(401).json({ error: 'Acesso negado' });
  }

  try {
    await sql`
      INSERT INTO conteudos (nome, tmdb_id, patrocinador, tipo, eps_patrocinados, eps_assistidos, nota_lorena)
      VALUES (${nome}, ${tmdb_id}, ${patrocinador}, ${tipo}, ${eps_p}, ${eps_a}, ${nota})
    `;
    return res.status(200).json({ message: 'Sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
