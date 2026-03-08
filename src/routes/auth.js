const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');

const JWT_SECRET = 'sigas_super_secret_key_2024';

// Endpoint para login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    db.get('SELECT * FROM usuarios WHERE email = ?', [email], async (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro interno no servidor.' });
        }

        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // Bloqueio de Manutenção
        if (req.app.locals.maintenanceMode && user.perfil !== 'Administrador') {
            return res.status(503).json({ message: 'Sistema em Manutenção. Apenas administradores podem efetuar login neste momento.' });
        }

        // Verificar se está bloqueado
        if (user.bloqueado_ate) {
            const blockTime = new Date(user.bloqueado_ate);
            const now = new Date();
            if (now < blockTime) {
                const minutosRestantes = Math.ceil((blockTime - now) / 60000);
                return res.status(403).json({ message: `Conta bloqueada devido a tentativas falhas. Tente novamente em ${minutosRestantes} minuto(s).` });
            }
        }

        const validPassword = await bcrypt.compare(password, user.senha);
        if (!validPassword) {
            let tentativas = (user.tentativas_falhas || 0) + 1;
            let query = 'UPDATE usuarios SET tentativas_falhas = ? WHERE id = ?';
            let params = [tentativas, user.id];
            let msgErro = 'Credenciais inválidas.';

            // Limite de 5 tentativas. Na 5ª, bloqueia a conta por 15 minutos (900000ms)
            if (tentativas >= 5) {
                const bloqueadoAte = new Date(Date.now() + 15 * 60000).toISOString();
                query = 'UPDATE usuarios SET tentativas_falhas = ?, bloqueado_ate = ? WHERE id = ?';
                params = [0, bloqueadoAte, user.id]; // Reseta tentativas pois está bloqueado
                msgErro = 'Conta bloqueada por 15 minutos devido a múltiplas tentativas malsucedidas.';
            }

            db.run(query, params, (errUpd) => {
                if(errUpd) console.error(errUpd);
            });

            return res.status(401).json({ message: msgErro });
        }

        // Se sucesso e tinha tentativas prévias com sucesso, resetamos falhas e block
        if (user.tentativas_falhas > 0 || user.bloqueado_ate) {
            db.run('UPDATE usuarios SET tentativas_falhas = 0, bloqueado_ate = NULL WHERE id = ?', [user.id]);
        }

        // Criar token
        const token = jwt.sign(
            { id: user.id, email: user.email, perfil: user.perfil, nome: user.nome },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            message: 'Login realizado com sucesso',
            token: token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                perfil: user.perfil
            }
        });
    });
});

// Middleware para verificar token (para ser usado por outras rotas)
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) return res.status(403).json({ message: 'Nenhum token fornecido.' });
    
    // Header format: "Bearer <token>"
    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Formato de token inválido.' });
    }

    jwt.verify(tokenParts[1], JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Sessão expirada ou token inválido.' });
        req.userId = decoded.id;
        req.userRole = decoded.perfil;
        next();
    });
};

module.exports = router;
module.exports.verifyToken = verifyToken;
