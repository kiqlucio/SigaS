// grupos_list.js
document.addEventListener('DOMContentLoaded', () => {
    const token = window.Auth ? window.Auth.getToken() : null;
    const API_URL = (window.location.hostname === '' || window.location.hostname === '127.0.0.1') 
                     ? 'http://localhost:3000/api' 
                     : `${window.location.origin}/api`;

    // ==========================================
    // LÓGICA DE GRUPOS (ATENDIMENTO EM GRUPO)
    // ==========================================
    const modalGrupo = document.getElementById('modalNovoGrupo');
    const btnAbrirGrupo = document.getElementById('btnAbrirModalGrupo');
    const btnFecharGrupo = document.getElementById('btnFecharModalGrupo');
    const btnCancelarGrupo = document.getElementById('btnCancelarModalGrupo');
    const formGrupo = document.getElementById('formNovoGrupo');
    const tabelaGruposBody = document.getElementById('tabelaGrupos');

    if (tabelaGruposBody) {
        carregarGrupos();
    }

    if (modalGrupo && btnAbrirGrupo) {
        const fecharModalGrupo = () => modalGrupo.classList.remove('active');
        
        btnAbrirGrupo.addEventListener('click', () => modalGrupo.classList.add('active'));
        if(btnFecharGrupo) btnFecharGrupo.addEventListener('click', fecharModalGrupo);
        if(btnCancelarGrupo) btnCancelarGrupo.addEventListener('click', fecharModalGrupo);
        
        formGrupo?.addEventListener('submit', async (evento) => {
            evento.preventDefault();
            
            const nome = document.getElementById('nomeGrupoInput').value;
            const tipo = document.getElementById('tipoGrupoInput').value;
            const capacidade = document.getElementById('capacidadeGrupoInput').value;
            
            const btnSalvar = modalGrupo.querySelector('.btn-apply');
            const textoOriginal = btnSalvar.textContent;
            btnSalvar.textContent = 'Criando...';
            btnSalvar.disabled = true;

            try {
                const response = await fetch(`${API_URL}/grupos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ nome, tipo, capacidade })
                });

                const data = await response.json();

                if (response.ok) {
                    fecharModalGrupo();
                    formGrupo.reset();
                    carregarGrupos();
                } else {
                    alert('Erro: ' + (data.error || 'Falha ao cadastrar grupo'));
                }
            } catch (error) {
                console.error(error);
                alert('Erro de rede ao salvar grupo');
            } finally {
                btnSalvar.textContent = textoOriginal;
                btnSalvar.disabled = false;
            }
        });
    }

    async function carregarGrupos() {
        if (!tabelaGruposBody) return;
        try {
            const response = await fetch(`${API_URL}/grupos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.status === 401 || response.status === 403) {
                if (typeof window.Auth !== 'undefined') window.Auth.logout();
                return;
            }
            
            const data = await response.json();

            if (response.ok) {
                renderizarTabelaGrupos(data);
            }
        } catch (error) {
            console.error('Erro ao carregar grupos:', error);
        }
    }

    function renderizarTabelaGrupos(lista) {
        tabelaGruposBody.innerHTML = '';
        if(lista.length === 0) {
            tabelaGruposBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px;">Nenhum grupo cadastrado.</td></tr>';
            return;
        }

        lista.forEach(item => {
            let tipoColor = "#3B82F6";
            let tipoBg = "#EFF6FF";
            let tipoLabel = item.tipo;

            if (item.tipo === "Serviço de Convivência (SCFV)") {
                tipoLabel = "SCFV";
                tipoColor = "#8B5CF6";
                tipoBg = "#F5F3FF";
            } else if (item.tipo === "PAIF") {
                tipoColor = "#D97706";
                tipoBg = "#FEF3C7";
            }

            const dataCriacao = new Date(item.data_criacao).toLocaleDateString('pt-BR');
            const tecnico = item.tecnico_nome || 'Não atribuído';
            const membros = item.membros_count || 0;

            const linha = `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 16px 24px;">
                        <a href="detalhe-grupo.html?id=${item.id}" style="color: var(--text-main); font-weight: 600; text-decoration: none; display: block;">
                            ${item.nome}
                        </a>
                        <span style="font-size: 11px; color: var(--text-placeholder);">ID: GRP-${item.id.toString().padStart(4, '0')}</span>
                    </td>
                    <td style="padding: 16px 24px;">
                        <span style="background: ${tipoBg}; color: ${tipoColor}; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">${tipoLabel}</span>
                    </td>
                    <td style="padding: 16px 24px; color: var(--text-main); font-weight: 500;">
                        <span style="display:inline-flex; align-items:center; gap:6px; background:#F3F4F6; padding:4px 10px; border-radius:6px; font-size:12px;">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                           ${membros}
                        </span>
                    </td>
                    <td style="padding: 16px 24px; color: var(--text-muted);">${tecnico}</td>
                    <td style="padding: 16px 24px; color: var(--text-muted);">${dataCriacao}</td>
                    <td style="padding: 16px 24px;">
                        <span style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:600; color:#22C55E;">
                           <span style="width:6px; height:6px; border-radius:50%; background:#22C55E;"></span> ${item.status}
                        </span>
                    </td>
                    <td style="padding: 16px 24px; text-align: center;">
                        <a href="detalhe-grupo.html?id=${item.id}" style="color:var(--text-muted); text-decoration:none; display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:4px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </a>
                    </td>
                </tr>
            `;
            tabelaGruposBody.insertAdjacentHTML('beforeend', linha);
        });
    }
});
