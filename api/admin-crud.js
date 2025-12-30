import { createPool } from '@vercel/postgres';
import jwt from 'jsonwebtoken';

function authenticate(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    
    const token = authHeader.split(' ')[1];
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'sua-chave-secreta');
    } catch (error) {
        return null;
    }
}

export default async function handler(req, res) {
    const auth = authenticate(req);
    if (!auth) {
        return res.status(401).json({ success: false, message: 'Não autorizado' });
    }
    
    const pool = createPool({
        connectionString: process.env.POSTGRES_URL,
    });
    
    const { table } = req.query;
    
    try {
        switch (req.method) {
            case 'GET':
                const { id } = req.query;
                if (id) {
                    const result = await pool.query(`SELECT * FROM ${table}_content WHERE id = $1`, [id]);
                    res.json(result.rows[0] || {});
                } else {
                    const result = await pool.query(`SELECT * FROM ${table}_content ORDER BY titulo`);
                    res.json(result.rows);
                }
                break;
                
            case 'POST':
                const data = req.body;
                if (data.id) {
                    // Update
                    const result = await pool.query(
                        `UPDATE ${table}_content SET 
                         tmdb_id = $1, titulo = $2, tipo = $3, patrocinador = $4,
                         episodios_patrocinados = $5, episodios_assistidos = $6,
                         nota_lorena = $7, updated_at = CURRENT_TIMESTAMP
                         WHERE id = $8 RETURNING *`,
                        [data.tmdb_id, data.titulo, data.tipo, data.patrocinador,
                         data.episodios_patrocinados, data.episodios_assistidos,
                         data.nota_lorena, data.id]
                    );
                    res.json({ success: true, data: result.rows[0] });
                } else {
                    // Insert
                    const result = await pool.query(
                        `INSERT INTO ${table}_content 
                         (tmdb_id, titulo, tipo, patrocinador, episodios_patrocinados, 
                          episodios_assistidos, nota_lorena) 
                         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                        [data.tmdb_id, data.titulo, data.tipo, data.patrocinador,
                         data.episodios_patrocinados, data.episodios_assistidos,
                         data.nota_lorena]
                    );
                    res.json({ success: true, data: result.rows[0] });
                }
                break;
                
            case 'DELETE':
                const { id: deleteId } = req.query;
                await pool.query(`DELETE FROM ${table}_content WHERE id = $1`, [deleteId]);
                res.json({ success: true });
                break;
                
            default:
                res.status(405).json({ error: 'Método não permitido' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro no banco de dados' });
    } finally {
        await pool.end();
    }
}
