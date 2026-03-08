const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('./auth');

router.get('/stats', verifyToken, (req, res) => {
    const stats = {
        familias: 0,
        individuos: 0,
        atendimentos_ind: 0,
        atendimentos_grupo: 0,
        acompanhamentos: 0,
        alertas: 12 // Hardcoded por enquanto, pode ser dinâmica futuramente
    };

    // Usaremos Promises para rodar as queries em paralelo
    const promises = [
        new Promise((resolve) => db.get('SELECT COUNT(*) as count FROM beneficiarios', [], (err, row) => resolve(row ? row.count : 0))),
        new Promise((resolve) => db.get('SELECT COUNT(*) as count FROM atendimentos', [], (err, row) => resolve(row ? row.count : 0))),
        new Promise((resolve) => db.get('SELECT COUNT(*) as count FROM grupo_encontros', [], (err, row) => resolve(row ? row.count : 0))),
        new Promise((resolve) => db.get("SELECT COUNT(*) as count FROM beneficiarios WHERE status = 'Acompanhamento Ativo'", [], (err, row) => resolve(row ? row.count : 0)))
    ];

    Promise.all(promises).then(results => {
        stats.individuos = results[0];
        stats.familias = Math.ceil(stats.individuos * 0.8); // Estima que a maioria é de uma familia 
        
        stats.atendimentos_ind = results[1];
        stats.atendimentos_grupo = results[2];
        stats.acompanhamentos = results[3];
        stats.alertas = 0; // Nenhum alerta real implementado ainda no sistema

        res.json(stats);
    }).catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    });
});

// ----------------------------------------------------
// LEMBRETES (DASHBOARD WIDGET)
// ----------------------------------------------------

router.get('/lembretes', verifyToken, (req, res) => {
    db.all(`SELECT * FROM lembretes WHERE tecnico_id = ? ORDER BY concluido ASC, data_limite ASC LIMIT 10`, [req.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/lembretes', verifyToken, (req, res) => {
    const { texto, data_limite } = req.body;
    if (!texto) return res.status(400).json({ error: 'O texto do lembrete é obrigatório.' });

    db.run(
        `INSERT INTO lembretes (tecnico_id, texto, data_limite) VALUES (?, ?, ?)`,
        [req.userId, texto, data_limite || null],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ success: true, id: this.lastID });
        }
    );
});

router.put('/lembretes/:id/concluir', verifyToken, (req, res) => {
    db.run(
        `UPDATE lembretes SET concluido = 1 WHERE id = ? AND tecnico_id = ?`,
        [req.params.id, req.userId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// ----------------------------------------------------
// RELATÓRIOS GERENCIAIS
// ----------------------------------------------------

router.get('/relatorio', verifyToken, async (req, res) => {
    let { mes, tecnico } = req.query; // mes: 'YYYY-MM', tecnico: id ou 'todos'
    
    if(!mes) {
        const d = new Date();
        mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    try {
        const payload = {
            metricas: { atendimentos: 0, novosCadastros: 0, ativos: 0, encontrosGrupo: 0 },
            statusCadastros: { ativo: 0, cadastrado: 0, inativo: 0 },
            historicoMeses: [], // ultimos 6 meses
            atendimentosDetalhados: []
        };

        // Prometificação pra facilitar leitura assíncrona com SQLite
        const runQueryAll = (sql, params = []) => new Promise((resolve, reject) => db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));
        const runQueryGet = (sql, params = []) => new Promise((resolve, reject) => db.get(sql, params, (err, row) => err ? reject(err) : resolve(row)));

        // 1. MÉTRICAS DO MÊS
        let tecFilter = tecnico !== 'todos' && tecnico ? `AND tecnico_id = ${parseInt(tecnico)}` : ''; // simplified for MVP

        const qtAtends = await runQueryGet(`SELECT COUNT(*) as c FROM atendimentos WHERE strftime('%Y-%m', data) = ? ${tecFilter.replace('tecnico_id', 'tecnico_id')}`, [mes]);
        payload.metricas.atendimentos = qtAtends.c;

        const qtNovosCad = await runQueryGet(`SELECT COUNT(*) as c FROM beneficiarios WHERE strftime('%Y-%m', data_cadastro) = ? ${tecFilter}`, [mes]);
        payload.metricas.novosCadastros = qtNovosCad.c;

        const qtAcompanhamentos = await runQueryGet(`SELECT COUNT(*) as c FROM beneficiarios WHERE status = 'Acompanhamento Ativo'`);
        payload.metricas.ativos = qtAcompanhamentos.c;

        const qtEncontros = await runQueryGet(`SELECT COUNT(*) as c FROM grupo_encontros WHERE strftime('%Y-%m', data) = ?`, [mes]);
        payload.metricas.encontrosGrupo = qtEncontros.c;

        // 2. STATUS DOS CADASTROS GERAIS
        const stAtivo = await runQueryGet(`SELECT COUNT(*) as c FROM beneficiarios WHERE status = 'Acompanhamento Ativo'`);
        const stCadastrado = await runQueryGet(`SELECT COUNT(*) as c FROM beneficiarios WHERE status = 'Somente Cadastro' OR status = 'Ativo'`);
        const stInativo = await runQueryGet(`SELECT COUNT(*) as c FROM beneficiarios WHERE status IN ('Inativo', 'Encerrado', 'Transferido')`);

        payload.statusCadastros.ativo = stAtivo.c;
        payload.statusCadastros.cadastrado = stCadastrado.c;
        payload.statusCadastros.inativo = stInativo.c;

        // 3. HISTÓRICO DE ATENDIMENTOS 6 MESES
        // Obtendo os meses retroativos via JS simples
        for(let i=5; i>=0; i--) {
            const dateMes = new Date(`${mes}-01T12:00:00Z`);
            dateMes.setMonth(dateMes.getMonth() - i);
            const mStr = `${dateMes.getFullYear()}-${String(dateMes.getMonth()+1).padStart(2, '0')}`;
            const labelMes = dateMes.toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
            
            const q = await runQueryGet(`SELECT COUNT(*) as c FROM atendimentos WHERE strftime('%Y-%m', data) = ?`, [mStr]);
            payload.historicoMeses.push({ mes: labelMes, quantidade: q.c });
        }

        // 4. DETALHAMENTO DOS ATENDIMENTOS (TABELA)
        // Junta Atendimento Individual + Encontro de Grupos
        const ind = await runQueryAll(`
            SELECT a.data, a.modalidade, b.nome as alvo, u.nome as tecnico 
            FROM atendimentos a 
            JOIN beneficiarios b ON a.beneficiario_id = b.id 
            LEFT JOIN usuarios u ON a.tecnico_id = u.id
            WHERE strftime('%Y-%m', a.data) = ? ${tecFilter.replace('tecnico_id', 'a.tecnico_id')}
        `, [mes]);

        const grp = await runQueryAll(`
            SELECT e.data, 'Grupo' as modalidade, g.nome as alvo, 'Facilitador do Grupo' as tecnico
            FROM grupo_encontros e
            JOIN grupos g ON e.grupo_id = g.id
            WHERE strftime('%Y-%m', e.data) = ?
        `, [mes]);

        payload.atendimentosDetalhados = [...ind, ...grp].sort((a,b) => new Date(b.data) - new Date(a.data));

        res.json(payload);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
});

// ----------------------------------------------------
// ENCAMINHAMENTOS GLOBAIS (REDE)
// ----------------------------------------------------
router.get('/encaminhamentos', verifyToken, (req, res) => {
    db.all(`
        SELECT e.*, b.nome as beneficiario_nome, b.nis, u.nome as tecnico_nome 
        FROM encaminhamentos e
        JOIN beneficiarios b ON e.beneficiario_id = b.id
        JOIN usuarios u ON e.tecnico_id = u.id
        ORDER BY e.data_registro DESC
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;
