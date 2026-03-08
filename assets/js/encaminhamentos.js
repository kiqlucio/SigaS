// assets/js/encaminhamentos.js
document.addEventListener('DOMContentLoaded', () => {

    if(window.Auth && window.Auth.checkAuth) {
        window.Auth.checkAuth();
    }
    const token = window.Auth ? window.Auth.getToken() : null;
    const user = window.Auth ? window.Auth.getUser() : null;

    const headerUserAvatar = document.getElementById('topbarUserAvatar');
    const headerUserName = document.getElementById('topbarUserName');
    const headerUserRole = document.getElementById('topbarUserRole');
    
    if(user) {
        if(headerUserName) headerUserName.textContent = user.nome;
        if(headerUserRole) headerUserRole.textContent = user.perfil;
        if(headerUserAvatar) {
            const splitted = user.nome.split(' ');
            headerUserAvatar.textContent = splitted.length > 1 
                ? `${splitted[0][0]}${splitted[1][0]}`.toUpperCase()
                : user.nome.substring(0, 2).toUpperCase();
        }
    }

    const BASE_URL = window.location.hostname === '' || window.location.hostname === '127.0.0.1' 
                     ? 'http://localhost:3000' 
                     : window.location.origin;
    const API_URL = `${BASE_URL}/api`;

    const tabelaEncaminhamentosBody = document.getElementById('tabelaEncaminhamentos');

    if (tabelaEncaminhamentosBody) {
        carregarEncaminhamentosGlobais();
    }

    async function carregarEncaminhamentosGlobais() {
        try {
            tabelaEncaminhamentosBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px;">Carregando Base...</td></tr>';
            
            const response = await fetch(`${API_URL}/dashboard/encaminhamentos`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 401 || response.status === 403) {
                if (typeof window.Auth !== 'undefined') window.Auth.logout();
                return;
            }
            
            const data = await response.json();

            if (response.ok) {
                renderizarTabelaEncaminhamentos(data);
            }
        } catch (error) {
            console.error('Erro ao carregar encaminhamentos:', error);
            tabelaEncaminhamentosBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px; color:red;">Erro ao carregar os dados.</td></tr>';
        }
    }

    function renderizarTabelaEncaminhamentos(lista) {
        tabelaEncaminhamentosBody.innerHTML = '';
        if(lista.length === 0) {
            tabelaEncaminhamentosBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px;">Nenhum encaminhamento registrado na rede.</td></tr>';
            return;
        }

        lista.forEach(item => {
            const inicial = item.beneficiario_nome.charAt(0).toUpperCase();
            
            // Formatando data para dd/mm/aaaa
            let dataRegistro = item.data_registro;
            if (dataRegistro) {
                const dateObj = new Date(dataRegistro);
                dataRegistro = dateObj.toLocaleDateString('pt-BR');
            } else {
                dataRegistro = 'Sem registro';
            }

            const tecnico = item.tecnico_nome || 'Não atribuído';
            let statusColor = '#3B82F6';
            let statusBg = '#EFF6FF';
            if(item.status === 'Retorno Registrado') {
                 statusColor = '#22C55E';
                 statusBg = '#DCFCE7';
            } else if(item.status === 'Cancelado') {
                 statusColor = '#EF4444';
                 statusBg = '#FEE2E2';
            }

            const linha = `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 16px 24px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: #E5E7EB; display: flex; align-items: center; justify-content: center; font-weight: bold; color: var(--text-muted);">${inicial}</div>
                            <div>
                                <a href="prontuario.html?id=${item.beneficiario_id}" style="color: var(--text-main); font-weight: 600; text-decoration: none; display: block;">${item.beneficiario_nome}</a>
                                <span style="font-size: 12px; color: var(--text-placeholder);">NIS: ${item.nis || 'Não inf.'}</span>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 16px 24px;">
                        <strong style="color:var(--text-main); display:block;">${item.destino}</strong>
                    </td>
                    <td style="padding: 16px 24px; color: var(--text-muted); font-size:13px; max-width:250px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${item.motivo}">
                        ${item.motivo}
                    </td>
                    <td style="padding: 16px 24px; color: var(--text-muted);">${dataRegistro}</td>
                    <td style="padding: 16px 24px;">
                        <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600;">${item.status}</span>
                    </td>
                    <td style="padding: 16px 24px; color: var(--text-muted);">${tecnico}</td>
                    <td style="padding: 16px 24px; text-align: center;">
                        <button onclick="alert('Visualização do prontuário em breve!')" style="border:none; background:transparent; color:#3B82F6; cursor:pointer; margin-right:8px;" title="Detalhes"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                        <button onclick="alert('Cancelamento manual requer permissão VIP!')" style="border:none; background:transparent; color:#EF4444; cursor:pointer;" title="Cancelar Solicitação"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                    </td>
                </tr>
            `;
            tabelaEncaminhamentosBody.insertAdjacentHTML('beforeend', linha);
        });
    }

    const btnNovoEncaminhamento = document.getElementById('btnNovoEncaminhamento');
    if (btnNovoEncaminhamento) {
        btnNovoEncaminhamento.addEventListener('click', () => {
            alert('A funcionalidade de Criar Novo Encaminhamento estará disponível na próxima atualização do sistema.');
        });
    }

});
