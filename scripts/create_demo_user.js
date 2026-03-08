const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'src', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao BD:', err.message);
        process.exit(1);
    }
});

async function criarUsuarioVisitante() {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('visita123', salt);
        
        db.get("SELECT id FROM usuarios WHERE email = ?", ['visitante@sigas.com'], (err, row) => {
            if (row) {
                console.log('O usuário visitante@sigas.com já existe.');
                db.close();
                return;
            }
            
            db.run(
                "INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)",
                ['Visitante SigaS', 'visitante@sigas.com', hash, 'Assistente Social'], // Assistente Social é o perfil padrão não-admin
                function(err) {
                    if (err) {
                        console.error('Erro ao criar usuário:', err.message);
                    } else {
                        console.log('Usuário visitante criado com sucesso!');
                    }
                    db.close();
                }
            );
        });
    } catch (error) {
        console.error('Erro na criptografia:', error);
        db.close();
    }
}

db.serialize(() => {
    criarUsuarioVisitante();
});
