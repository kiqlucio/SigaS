const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('./auth');

// Listar beneficiários
router.get('/', verifyToken, (req, res) => {
    const search = req.query.search;
    let query = `
        SELECT b.*, u.nome as tecnico_nome 
        FROM beneficiarios b
        LEFT JOIN usuarios u ON b.tecnico_id = u.id
    `;
    let params = [];

    if (search) {
        query += ` WHERE b.nome LIKE ? OR b.cpf LIKE ? OR b.nis LIKE ?`;
        const likeSearch = `%${search}%`;
        params = [likeSearch, likeSearch, likeSearch];
    }

    query += ` ORDER BY b.id DESC`;
    
    console.log("EXEC GET /beneficiarios", { query, params, search });

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Cadastrar novo beneficiário
router.post('/', verifyToken, (req, res) => {
    const { nome, cpf, data_nascimento, nis, sexo, telefone, bairro, situacao_trabalho } = req.body;
    const tecnico_id = req.userId;

    if (!nome || !cpf) {
        return res.status(400).json({ error: 'Nome e CPF são obrigatórios' });
    }

    const query = `INSERT INTO beneficiarios (nome, cpf, data_nascimento, nis, sexo, telefone, bairro, situacao_trabalho, tecnico_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [nome, cpf, data_nascimento, nis, sexo, telefone, bairro, situacao_trabalho, tecnico_id], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'CPF já cadastrado no sistema.' });
            }
            return res.status(500).json({ error: err.message });
        }
        
        db.get('SELECT * FROM beneficiarios WHERE id = ?', [this.lastID], (err, row) => {
            res.status(201).json(row);
        });
    });
});

// Detalhes do beneficiário
router.get('/:id', verifyToken, (req, res) => {
    db.get('SELECT b.*, u.nome as tecnico_nome FROM beneficiarios b LEFT JOIN usuarios u ON b.tecnico_id = u.id WHERE b.id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Beneficiário não encontrado' });
        res.json(row);
    });
});

// ----------------------------------------------------
// ATENDIMENTOS INDIVIDUAIS DO BENEFICIÁRIO
// ----------------------------------------------------

// Listar histórico de atendimentos de um beneficiário
router.get('/:id/atendimentos', verifyToken, (req, res) => {
    db.all(`
        SELECT a.*, u.nome as tecnico_nome 
        FROM atendimentos a
        JOIN usuarios u ON a.tecnico_id = u.id
        WHERE a.beneficiario_id = ?
        ORDER BY a.data DESC, a.id DESC
    `, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Registrar um novo atendimento
router.post('/:id/atendimentos', verifyToken, (req, res) => {
    const beneficiario_id = req.params.id;
    const { data, modalidade, descricao } = req.body;
    const tecnico_id = req.userId;

    if (!data || !modalidade) {
        return res.status(400).json({ error: 'Data e modalidade são obrigatórias' });
    }

    db.run(
        `INSERT INTO atendimentos (beneficiario_id, tecnico_id, data, modalidade, descricao) VALUES (?, ?, ?, ?, ?)`,
        [beneficiario_id, tecnico_id, data, modalidade, descricao],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            // Atualizar o status do beneficiário e "último atendimento"
            db.run(`UPDATE beneficiarios SET status = 'Acompanhamento Ativo' WHERE id = ?`, [beneficiario_id]);

            db.get('SELECT * FROM atendimentos WHERE id = ?', [this.lastID], (err, row) => {
                res.status(201).json(row);
            });
        }
    );
});

// ----------------------------------------------------
// ENCAMINHAMENTOS DO BENEFICIÁRIO
// ----------------------------------------------------

// Listar histórico de encaminhamentos
router.get('/:id/encaminhamentos', verifyToken, (req, res) => {
    db.all(`
        SELECT e.*, u.nome as tecnico_nome 
        FROM encaminhamentos e
        JOIN usuarios u ON e.tecnico_id = u.id
        WHERE e.beneficiario_id = ?
        ORDER BY e.data_registro DESC
    `, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Registrar um novo encaminhamento
router.post('/:id/encaminhamentos', verifyToken, (req, res) => {
    const beneficiario_id = req.params.id;
    const { destino, motivo, data_encaminhamento } = req.body;
    const tecnico_id = req.userId;

    if (!destino || !motivo || !data_encaminhamento) {
        return res.status(400).json({ error: 'Destino, motivo e data são obrigatórios' });
    }

    db.run(
        `INSERT INTO encaminhamentos (beneficiario_id, tecnico_id, destino, motivo, data_encaminhamento) VALUES (?, ?, ?, ?, ?)`,
        [beneficiario_id, tecnico_id, destino, motivo, data_encaminhamento],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            db.get('SELECT * FROM encaminhamentos WHERE id = ?', [this.lastID], (err, row) => {
                res.status(201).json(row);
            });
        }
    );
});

// Registrar o Retorno do encaminhamento (Atualização de Status)
router.put('/:id/encaminhamentos/:enc_id/retorno', verifyToken, (req, res) => {
    const { enc_id } = req.params;
    const { data_retorno, resultado_retorno } = req.body;

    if (!data_retorno || !resultado_retorno) {
        return res.status(400).json({ error: 'Data e resultado do retorno são obrigatórios' });
    }

    db.run(
        `UPDATE encaminhamentos 
         SET status = 'Retorno Registrado', data_retorno = ?, resultado_retorno = ? 
         WHERE id = ? AND beneficiario_id = ?`,
        [data_retorno, resultado_retorno, enc_id, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Encaminhamento não encontrado ou você não tem acesso a ele.' });
            
            res.json({ success: true });
        }
    );
});

module.exports = router;
