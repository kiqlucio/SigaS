document.addEventListener('DOMContentLoaded', () => {

    if(window.Auth && window.Auth.checkAuth) {
        window.Auth.checkAuth();
    }
    const token = window.Auth ? window.Auth.getToken() : null;
    const user = window.Auth ? window.Auth.getUser() : null;

    if(user && user.perfil !== 'Administrador') {
        alert('Atenção: Apenas Administradores devem adicionar ou excluir novos técnicos/usuários. O seu acesso neste painel é somente de visualização.');
    }

    const headerUserName = document.getElementById('topbarUserName');
    const headerUserRole = document.getElementById('topbarUserRole');
    const headerUserAvatar = document.getElementById('topbarUserAvatar');
    if(headerUserName && user) {
        headerUserName.textContent = user.nome;
        headerUserRole.textContent = user.perfil;
        const splitted = user.nome.split(' ');
        headerUserAvatar.textContent = splitted.length > 1 
            ? `${splitted[0][0]}${splitted[1][0]}`.toUpperCase()
            : user.nome.substring(0, 2).toUpperCase();
    }

    const BASE_URL = window.location.hostname === '' || window.location.hostname === '127.0.0.1' 
                     ? 'http://localhost:3000' 
                     : window.location.origin;
    const API_URL = `${BASE_URL}/api`;

    // ==========================================
    // CARREGAR USUARIOS
    // ==========================================
    const tabelaUsuarios = document.getElementById('tabelaUsuarios');
    
    if (tabelaUsuarios) {
        carregarListaUsuarios();
    }

    async function carregarListaUsuarios() {
        try {
            const resp = await fetch(`${API_URL}/usuarios`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (resp.status === 401 || resp.status === 403) {
                if(window.Auth) window.Auth.logout();
                return;
            }

            if(resp.ok) {
                const lista = await resp.json();
                renderizarUsuarios(lista);
            }
        } catch(e) {
            console.error(e);
        }
    }

    function renderizarUsuarios(lista) {
        tabelaUsuarios.innerHTML = '';
        if(lista.length === 0) {
            tabelaUsuarios.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 24px; color: var(--text-muted);">Nenhum usuário cadastrado.</td></tr>';
            return;
        }

        lista.forEach(usu => {
            let color = "#3B82F6";
            let bg = "#EFF6FF";
            
            if(usu.perfil === 'Administrador') { color = "#D97706"; bg = "#FEF3C7"; }
            else if(usu.perfil === 'Coordenador') { color = "#8B5CF6"; bg = "#F5F3FF"; }

            const isInactivateBtn = usu.id !== 1 ? `<button class="btn-excluir-usuario" data-id="${usu.id}" style="border:none; background:transparent; color:#EF4444; cursor:pointer;" title="Excluir Usuário" aria-label="Excluir usuário ${usu.nome}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>` : `<span style="font-size:11px; color:#9CA3AF;">Base SysAdmin</span>`;

            const tr = `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 16px 24px;"><strong>${usu.nome}</strong></td>
                    <td style="padding: 16px 24px; color:var(--text-muted);">${usu.email}</td>
                    <td style="padding: 16px 24px;">
                        <span style="background: ${bg}; color: ${color}; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">${usu.perfil}</span>
                    </td>
                    <td style="padding: 16px 24px; text-align: center;">
                        ${isInactivateBtn}
                    </td>
                </tr>
            `;
            tabelaUsuarios.insertAdjacentHTML('beforeend', tr);
        });
    }

    // Delegação de Eventos: Excluir Usuário a partir de cliques na tabela
    tabelaUsuarios.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-excluir-usuario');
        if (!btn) return;
        
        const id = btn.getAttribute('data-id');
        if(!confirm('Tem certeza que deseja excluir este Acesso? Esta ação não pode ser desfeita.')) return;
        
        try {
            const res = await fetch(`${API_URL}/usuarios/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if(res.ok) {
                carregarListaUsuarios();
            } else {
                const err = await res.json();
                alert(err.error || 'Erro ao excluir usuário.');
            }
        } catch(err) { console.error(err); }
    });

    // ==========================================
    // MODAL DE INSERÇÃO
    // ==========================================
    const modalUsu = document.getElementById('modalNovoUsuario');
    const btnAbrirUsu = document.getElementById('btnAbrirModalUsuario');
    const btnFecharUsu = document.getElementById('btnFecharModalUsuario');
    const btnCancelaUsu = document.getElementById('btnCancelarModalUsuario');
    const formUsu = document.getElementById('formNovoUsuario');

    if(modalUsu && btnAbrirUsu) {
        const closeModal = () => modalUsu.classList.remove('active');
        btnAbrirUsu.addEventListener('click', () => modalUsu.classList.add('active'));
        if(btnFecharUsu) btnFecharUsu.addEventListener('click', closeModal);
        if(btnCancelaUsu) btnCancelaUsu.addEventListener('click', closeModal);

        formUsu.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                nome: document.getElementById('usuNome').value,
                email: document.getElementById('usuEmail').value,
                senha: document.getElementById('usuSenha').value,
                perfil: document.getElementById('usuPerfil').value
            };

            const btnCreate = document.querySelector('#formNovoUsuario .btn-apply');
            btnCreate.textContent = 'Autenticando e Criando...';
            btnCreate.disabled = true;

            try {
                const res = await fetch(`${API_URL}/usuarios`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });

                const out = await res.json();

                if(res.ok) {
                    closeModal();
                    formUsu.reset();
                    carregarListaUsuarios();
                } else {
                    alert('Problema: ' + (out.error || 'Houve um erro'));
                }
            } catch(err) {
                console.error(err);
                alert('Falha em processar conexão com BD.');
            } finally {
                btnCreate.textContent = 'Criar Conta do Técnico';
                btnCreate.disabled = false;
            }
        });
    }

    // ==========================================
    // DARK MODE TOGGLE
    // ==========================================
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        // Inicializa o state no toggle
        if (localStorage.getItem('sigas_dark_mode') === 'enabled') {
            darkModeToggle.checked = true;
        }

        darkModeToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('sigas_dark_mode', 'enabled');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.removeItem('sigas_dark_mode');
            }
        });
    }

});
