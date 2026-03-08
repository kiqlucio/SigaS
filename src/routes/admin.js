const express = require('express');
const router = express.Router();
const os = require('os');
const { verifyToken } = require('./auth');

// Middleware de autorizacao de perfis
const requireAdmin = (req, res, next) => {
    if (req.userRole !== 'Administrador') {
        return res.status(403).json({ error: 'Acesso negado. Perfil insuficiente.' });
    }
    next();
};

router.get('/sysinfo', verifyToken, requireAdmin, (req, res) => {
    const uptime = os.uptime(); // Segundos
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const isMaintenance = req.app.locals.maintenanceMode;

    res.json({
        uptime: formatUptime(uptime),
        memory: {
            total: (totalMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            free: (freeMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            used: (usedMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            usagePercent: ((usedMem / totalMem) * 100).toFixed(2) + '%'
        },
        nodeVersion: process.version,
        maintenanceMode: isMaintenance
    });
});

router.post('/maintenance', verifyToken, requireAdmin, (req, res) => {
    const { active } = req.body;
    req.app.locals.maintenanceMode = !!active; // Converte string para booleano com precisao
    res.json({ 
        success: true, 
        message: active ? 'Modo de Manutenção Ativado!' : 'Modo de Manutenção Desativado!',
        maintenanceMode: req.app.locals.maintenanceMode 
    });
});

function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
}

module.exports = router;
module.exports.requireAdmin = requireAdmin;
