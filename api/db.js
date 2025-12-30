import { createPool } from '@vercel/postgres';

const pool = createPool({ connectionString: process.env.POSTGRES_URL });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { nome, tmdb_id, patrocinador, episodios, senha } = req.body;
    if (senha !== process.env.SENHA_ADMIN) return res.status(401).json({ error: 'Senha incorreta' });

    try {
      await pool.sql`
        INSERT INTO cronograma (nome, tmdb_id, patrocinador, episodios)
        VALUES (${nome}, ${tmdb_id}, ${patrocinador}, ${episodios});
      `;
      return res.status(200).json({ success: true });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await pool.sql`SELECT * FROM cronograma ORDER BY id DESC`;
      return res.status(200).json(rows);
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }
}
