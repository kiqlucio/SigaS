const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados SQLite:', err.message);
    } else {
        console.log('Banco de dados pronto.');
        db.run('PRAGMA foreign_keys = ON');
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        // Usuários do sistema
        db.run(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                senha TEXT NOT NULL,
                perfil TEXT DEFAULT 'Assistente Social',
                tentativas_falhas INTEGER DEFAULT 0,
                bloqueado_ate DATETIME
            )
        `, (err) => {
            if (err) console.error("Erro ao criar tabela de usuarios:", err.message);
            else insertDefaultUser();
        });

        // Beneficiários
        db.run(`
            CREATE TABLE IF NOT EXISTS beneficiarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                cpf TEXT UNIQUE NOT NULL,
                data_nascimento TEXT,
                nis TEXT,
                sexo TEXT,
                telefone TEXT,
                bairro TEXT,
                situacao_trabalho TEXT,
                status TEXT DEFAULT 'Acompanhamento Ativo',
                tecnico_id INTEGER,
                data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)
            )
        `);

        // Atendimentos Individuais
        db.run(`
            CREATE TABLE IF NOT EXISTS atendimentos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                beneficiario_id INTEGER NOT NULL,
                tecnico_id INTEGER NOT NULL,
                data TEXT NOT NULL,
                modalidade TEXT NOT NULL,
                descricao TEXT,
                data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (beneficiario_id) REFERENCES beneficiarios(id),
                FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)
            )
        `);

        // Tabela de Grupos
        db.run(`
            CREATE TABLE IF NOT EXISTS grupos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                tipo TEXT NOT NULL,
                tecnico_id INTEGER,
                status TEXT DEFAULT 'Ativo',
                capacidade INTEGER,
                data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)
            )
        `);

        // Tabela de Participantes de Grupos
        db.run(`
            CREATE TABLE IF NOT EXISTS grupo_participantes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                grupo_id INTEGER NOT NULL,
                beneficiario_id INTEGER NOT NULL,
                data_ingresso DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (grupo_id) REFERENCES grupos(id),
                FOREIGN KEY (beneficiario_id) REFERENCES beneficiarios(id)
            )
        `);

        // Tabela de Encontros de Grupos
        db.run(`
            CREATE TABLE IF NOT EXISTS grupo_encontros (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                grupo_id INTEGER NOT NULL,
                data TEXT NOT NULL,
                tema TEXT NOT NULL,
                resumo TEXT,
                data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (grupo_id) REFERENCES grupos(id)
            )
        `);

        // Tabela de Lembretes (Dashboard)
        db.run(`
            CREATE TABLE IF NOT EXISTS lembretes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tecnico_id INTEGER NOT NULL,
                texto TEXT NOT NULL,
                data_limite TEXT,
                concluido INTEGER DEFAULT 0,
                data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)
            )
        `);

        // Tabela de Encaminhamentos
        db.run(`
            CREATE TABLE IF NOT EXISTS encaminhamentos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                beneficiario_id INTEGER NOT NULL,
                tecnico_id INTEGER NOT NULL,
                destino TEXT NOT NULL,
                motivo TEXT NOT NULL,
                data_encaminhamento TEXT NOT NULL,
                status TEXT DEFAULT 'Aguardando Retorno',
                data_retorno TEXT,
                resultado_retorno TEXT,
                data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (beneficiario_id) REFERENCES beneficiarios(id),
                FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)
            )
        `);

        // Tabela de Auditoria (Logs de Ações Críticas)
        db.run(`
            CREATE TABLE IF NOT EXISTS auditoria (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER,
                acao TEXT NOT NULL,
                tabela TEXT,
                registro_id INTEGER,
                dados_anteriores TEXT,
                dados_novos TEXT,
                data DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            )
        `);
    });
}

// Cria o admin inicial se não existir
function insertDefaultUser() {
    db.get("SELECT id FROM usuarios WHERE email = ?", ['admin@sigas.com'], async (err, row) => {
        if (!row) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash('admin123', salt);
            
            db.run(
                "INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)",
                ['Caique Lucio', 'admin@sigas.com', hash, 'Administrador'],
                function(err) {
                    if (err) console.error(err);
                    else console.log('Usuário admin padrão criado.');
                }
            );
        }
    });
}

module.exports = db;
