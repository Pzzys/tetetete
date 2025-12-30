import { createPool } from '@vercel/postgres';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

export default async function handler(req, res) {
  // 1. Validar Senha
  const senhaAdmin = process.env.SENHA_ADMIN;
  const senhaRecebida = req.headers['x-admin-senha'];

  if (req.method === 'POST') {
    if (senhaRecebida !== senhaAdmin) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const { nome, tmdb_id, patro_eps, assist_eps, patrocinador, tipo } = req.body;
    
    try {
      await pool.sql`
        INSERT INTO conteudos (nome, tmdb_id, patro_eps, assist_eps, patrocinador, tipo)
        VALUES (${nome}, ${tmdb_id}, ${patro_eps}, ${assist_eps}, ${patrocinador}, ${tipo});
      `;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await pool.sql`SELECT * FROM conteudos ORDER BY id DESC`;
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
