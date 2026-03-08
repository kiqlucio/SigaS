const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcrypt');
const { verifyToken } = require('./auth');
const { requireAdmin } = require('./admin');

// Listar todos os usuários/técnicos
router.get('/', verifyToken, (req, res) => {
    db.all(`SELECT id, nome, email, perfil FROM usuarios ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Cadastrar novo usuário/técnico
router.post('/', verifyToken, requireAdmin, async (req, res) => {
    const { nome, email, senha, perfil } = req.body;

    if (!nome || !email || !senha || !perfil) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(senha, salt);
        
        db.run(
            `INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)`,
            [nome, email, hash, perfil],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'E-mail correspondente já cadastrado.' });
                    }
                    return res.status(500).json({ error: err.message });
                }
                
                db.get('SELECT id, nome, email, perfil FROM usuarios WHERE id = ?', [this.lastID], (err, row) => {
                    res.status(201).json(row);
                });
            }
        );
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Excluir usuário (Admin principal não pode ser excluído)
router.delete('/:id', verifyToken, requireAdmin, (req, res) => {
    if (req.params.id == 1) {
        return res.status(403).json({ error: 'Operação não permitida: não é possível excluir a conta de SysAdmin principal.' });
    }
    
    db.run(`DELETE FROM usuarios WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, changes: this.changes });
    });
});

module.exports = router;
