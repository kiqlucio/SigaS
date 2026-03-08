const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('./auth');

// Listar grupos
router.get('/', verifyToken, (req, res) => {
    db.all(`
        SELECT g.*, u.nome as tecnico_nome, (SELECT COUNT(*) FROM grupo_participantes gp WHERE gp.grupo_id = g.id) as membros_count
        FROM grupos g
        LEFT JOIN usuarios u ON g.tecnico_id = u.id
        ORDER BY g.id DESC
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Cadastrar novo grupo
router.post('/', verifyToken, (req, res) => {
    const { nome, tipo, capacidade } = req.body;
    const tecnico_id = req.userId; 

    if (!nome || !tipo) {
        return res.status(400).json({ error: 'Nome e tipo são obrigatórios' });
    }

    db.run(
        `INSERT INTO grupos (nome, tipo, capacidade, tecnico_id) VALUES (?, ?, ?, ?)`,
        [nome, tipo, capacidade || null, tecnico_id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            db.get('SELECT * FROM grupos WHERE id = ?', [this.lastID], (err, row) => {
                res.status(201).json(row);
            });
        }
    );
});

// Detalhes do grupo
router.get('/:id', verifyToken, (req, res) => {
    db.get('SELECT g.*, u.nome as tecnico_nome FROM grupos g LEFT JOIN usuarios u ON g.tecnico_id = u.id WHERE g.id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Grupo não encontrado' });
        res.json(row);
    });
});

// ----------------------------------------------------
// MEMBROS (PARTICIPANTES DO GRUPO)
// ----------------------------------------------------

router.get('/:id/membros', verifyToken, (req, res) => {
    db.all(`
        SELECT gp.*, b.nome, b.nis 
        FROM grupo_participantes gp
        JOIN beneficiarios b ON gp.beneficiario_id = b.id
        WHERE gp.grupo_id = ?
    `, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/:id/membros', verifyToken, (req, res) => {
    const { beneficiario_id } = req.body;
    
    // Validar se o beneficiário existe
    db.get('SELECT id FROM beneficiarios WHERE id = ?', [beneficiario_id], (err, bnf) => {
        if (!bnf) return res.status(404).json({ error: 'Beneficiário não existe.' });

        db.run(
            `INSERT INTO grupo_participantes (grupo_id, beneficiario_id) VALUES (?, ?)`,
            [req.params.id, beneficiario_id],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ success: true, id: this.lastID });
            }
        );
    });
});

// ----------------------------------------------------
// ENCONTROS (REUNIÕES DO GRUPO)
// ----------------------------------------------------

router.get('/:id/encontros', verifyToken, (req, res) => {
    db.all(`SELECT * FROM grupo_encontros WHERE grupo_id = ? ORDER BY data DESC`, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/:id/encontros', verifyToken, (req, res) => {
    const { data, tema, resumo } = req.body;
    if (!data || !tema) return res.status(400).json({ error: 'Data e tema exigidos' });

    db.run(
        `INSERT INTO grupo_encontros (grupo_id, data, tema, resumo) VALUES (?, ?, ?, ?)`,
        [req.params.id, data, tema, resumo],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ success: true, id: this.lastID });
        }
    );
});

module.exports = router;
