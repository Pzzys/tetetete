const { createClient } = require('@supabase/supabase-js');

// O Netlify vai puxar estas variáveis das configurações que você fará no painel dele
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

exports.handler = async (event) => {
    // Só aceita requisições do tipo POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Método não permitido" };
    }

    try {
        const body = JSON.parse(event.body);
        const { senha, nome, tmdb_id, patrocinador, tipo, eps } = body;

        // Verifica a senha que você definiu no Netlify
        if (senha !== process.env.SENHA_MOD) {
            return { statusCode: 401, body: "Senha Incorreta" };
        }

        // Insere no Supabase
        const { data, error } = await supabase
            .from('conteudos')
            .insert([{ nome, tmdb_id, patrocinador, tipo, eps }]);

        if (error) throw error;

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Salvo com sucesso!" })
        };
    } catch (error) {
        return { statusCode: 500, body: error.message };
    }
};
