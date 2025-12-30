import { createPool } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }
    
    const { username, password } = req.body;
    const pool = createPool({
        connectionString: process.env.POSTGRES_URL,
    });
    
    try {
        const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        }
        
        const admin = result.rows[0];
        const isValid = await bcrypt.compare(password, admin.password_hash);
        
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        }
        
        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            process.env.JWT_SECRET || 'sua-chave-secreta',
            { expiresIn: '24h' }
        );
        
        res.json({ success: true, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro no servidor' });
    } finally {
        await pool.end();
    }
}
