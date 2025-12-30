import { createPool } from '@vercel/postgres';

export default async function handler(req, res) {
    const pool = createPool({
        connectionString: process.env.POSTGRES_URL,
    });
    
    try {
        const result = await pool.query('SELECT * FROM nudez_list ORDER BY created_at DESC');
        const ids = result.rows.map(row => row.tmdb_id.toString());
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json(ids);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro no banco de dados' });
    } finally {
        await pool.end();
    }
}
