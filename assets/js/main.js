// assets/js/main.js
document.addEventListener('DOMContentLoaded', () => {

    // 1. Verificar autenticação
    if(window.Auth && window.Auth.checkAuth) {
        window.Auth.checkAuth();
    }
    const user = window.Auth ? window.Auth.getUser() : null;

    // Atualiza nome do usuário no Header (se existir o elemento)
    const headerUserName = document.getElementById('topbarUserName');
    const headerUserRole = document.getElementById('topbarUserRole');
    const headerUserAvatar = document.getElementById('topbarUserAvatar');
    
    if(headerUserName && user) {
        headerUserName.textContent = user.nome;
        if(headerUserRole) headerUserRole.textContent = user.perfil;
        if(headerUserAvatar) {
            const splitted = user.nome.split(' ');
            headerUserAvatar.textContent = splitted.length > 1 
                ? `${splitted[0][0]}${splitted[1][0]}`.toUpperCase()
                : user.nome.substring(0, 2).toUpperCase();
        }
    }

    // Configuração de URL base da API
    const BASE_URL = window.location.hostname === '' || window.location.hostname === '127.0.0.1' 
                     ? 'http://localhost:3000' 
                     : window.location.origin;
    const API_URL = `${BASE_URL}/api`;

    // Global Search Logic
    const searchBarInput = document.querySelector('.search-bar input');

    // Se houver uma busca na URL, preenche o campo
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchBarInput && searchQuery) {
        searchBarInput.value = searchQuery;
    }

    if (searchBarInput) {
        searchBarInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const term = e.target.value.trim();
                let params = new URLSearchParams(window.location.search);
                if (term) {
                    params.set('search', term);
                } else {
                    params.delete('search');
                }
                
                // Se já estiver na página de cadastros, recarrega a própria página com o parâmetro
                if (window.location.pathname.includes('cadastros.html')) {
                    window.location.search = params.toString();
                } else {
                    window.location.href = `cadastros.html?search=${encodeURIComponent(term)}`;
                }
            }
        });
    }

    // Lógica do Sino de Notificações Global
    const btnNotification = document.getElementById('btnNotification');
    if (btnNotification) {
        btnNotification.addEventListener('click', async () => {
             // Tenta buscar no Dashboard se houver alertas, caso contrario um fallback
             try {
                const res = await fetch(`${API_URL}/dashboard`);
                if (res.ok) {
                    const data = await res.json();
                    if(data.alertas && data.alertas.length > 0) {
                        alert(`Você possui ${data.alertas.length} nova(s) notificação(ões) do sistema!`);
                        return;
                    }
                }
             } catch(err) {}

             alert('Não há novas notificações no momento.');
        });
    }

    // ==========================================
    // Interatividade: Botão de Ajuda
    // ==========================================
    const topbarActions = document.querySelector('.topbar-actions');
    if (topbarActions) {
        // Pega todos os icones que nao sejam o de notificação
        const btnAjuda = topbarActions.querySelector('.icon-btn:not(#btnNotification)');
        if (btnAjuda) {
            btnAjuda.addEventListener('click', () => {
                alert('=== MISSÃO DO SIGAS ===\n\nNosso objetivo é facilitar a gestão de assistência social, conectando dados de forma clara e segura para que os técnicos tenham o melhor acompanhamento da população vulnerável.');
            });
        }
    }

    // ==========================================
    // Interatividade: Painel de Perfil
    // ==========================================
    const userProfile = document.querySelector('.user-profile');
    if (userProfile && user) {
        userProfile.style.cursor = 'pointer';
        userProfile.addEventListener('click', () => {
            alert(`👤 Dados do Perfil Atual:\n\nNome: ${user.nome}\nPerfil: ${user.perfil}\nEmail Cadastrado: ${user.email}\n\n(A edição do seu próprio perfil pelo app será liberada nos próximos ciclos do MVP.)`);
        });
    }

});