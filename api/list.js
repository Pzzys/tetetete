import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  try {
    // Busca todos os conteúdos ordenados pelos mais recentes
    const { rows } = await sql`SELECT * FROM conteudos ORDER BY data_criacao DESC`;
    
    // Retorna a lista como JSON
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
