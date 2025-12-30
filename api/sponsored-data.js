import { createPool } from '@vercel/postgres';

export default async function handler(req, res) {
    const pool = createPool({
        connectionString: process.env.POSTGRES_URL,
    });
    
    try {
        const result = await pool.query('SELECT * FROM sponsored_content ORDER BY titulo');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro no banco de dados' });
    } finally {
        await pool.end();
    }
}
