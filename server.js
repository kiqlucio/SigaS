const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./src/database');

const authRoutes = require('./src/routes/auth');
const beneficiariosRoutes = require('./src/routes/beneficiarios');
const gruposRoutes = require('./src/routes/grupos');
const dashboardRoutes = require('./src/routes/dashboard');
const usuariosRoutes = require('./src/routes/usuarios');
const adminRoutes = require('./src/routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Estado Global de Manutenção
app.locals.maintenanceMode = false;

// Middlewares
app.use(cors());
app.use(express.json()); // Parse JSON body
app.use(express.static(path.join(__dirname))); // Serve frontend files

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/beneficiarios', beneficiariosRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/admin', adminRoutes);

// Rota principal (Serve o index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Tratamento de rotas não encontradas da API vs Frontend
app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({ message: 'API route not found' });
    }
    // Para rotas do frontend (histórico HTML5/SPA se necessário futuramente)
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});
