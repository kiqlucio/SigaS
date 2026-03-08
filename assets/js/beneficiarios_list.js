// beneficiarios_list.js
document.addEventListener('DOMContentLoaded', () => {
    const token = window.Auth ? window.Auth.getToken() : null;
    const API_URL = (window.location.hostname === '' || window.location.hostname === '127.0.0.1') 
                     ? 'http://localhost:3000/api' 
                     : `${window.location.origin}/api`;

    // ==========================================
    // LÓGICA DE BENEFICIÁRIOS (ATENDIMENTO INDIVIDUAL)
    // ==========================================
    const modalBeneficiario = document.getElementById('modalNovoBeneficiario');
    const btnAbrir = document.getElementById('btnAbrirModal');
    const btnFechar = document.getElementById('btnFecharModal');
    const btnCancelar = document.getElementById('btnCancelarModal');
    const formBeneficiario = document.getElementById('formNovoBeneficiario');
    const tabelaBeneficiariosBody = document.getElementById('tabelaBeneficiarios');

    if (tabelaBeneficiariosBody) {
        carregarBeneficiarios();
    }

    if (modalBeneficiario && btnAbrir) {
        const fecharModal = () => modalBeneficiario.classList.remove('active');
        btnAbrir.addEventListener('click', () => modalBeneficiario.classList.add('active'));
        if (btnFechar) btnFechar.addEventListener('click', fecharModal);
        if (btnCancelar) btnCancelar.addEventListener('click', fecharModal);
    }

    if (formBeneficiario) {
        formBeneficiario.addEventListener('submit', async (evento) => {
            evento.preventDefault(); 
            
            const payload = {
                nome: document.getElementById('nomeInput')?.value,
                cpf: document.getElementById('cpfInput')?.value,
                data_nascimento: document.getElementById('nascimentoInput')?.value,
                nis: document.getElementById('nisInput')?.value,
                sexo: document.getElementById('sexoInput')?.value,
                telefone: document.getElementById('telefoneInput')?.value,
                bairro: document.getElementById('bairroInput')?.value || 'Não informado',
                situacao_trabalho: document.getElementById('trabalhoInput')?.value
            };

            const btnSalvar = formBeneficiario.querySelector('.btn-apply') || document.querySelector('#modalNovoBeneficiario .btn-apply');
            const textoOriginal = btnSalvar ? btnSalvar.textContent : 'Salvando...';
            if(btnSalvar) {
                btnSalvar.textContent = 'Salvando...';
                btnSalvar.disabled = true;
            }

            try {
                const response = await fetch(`${API_URL}/beneficiarios`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (response.ok) {
                    if (modalBeneficiario) modalBeneficiario.classList.remove('active');
                    formBeneficiario.reset();
                    alert('Cadastro salvo com sucesso!');
                    if (tabelaBeneficiariosBody) carregarBeneficiarios();
                    else window.location.href = 'cadastros.html';
                } else {
                    alert('Erro: ' + (data.error || 'Falha ao cadastrar'));
                }
            } catch (error) {
                console.error(error);
                alert('Erro de rede ao salvar beneficiário');
            } finally {
                if(btnSalvar) {
                    btnSalvar.textContent = textoOriginal;
                    btnSalvar.disabled = false;
                }
            }
        });
    }

    async function carregarBeneficiarios() {
        if (!tabelaBeneficiariosBody) return;
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = urlParams.get('search');
            const endpoint = searchQuery 
                ? `${API_URL}/beneficiarios?search=${encodeURIComponent(searchQuery)}`
                : `${API_URL}/beneficiarios`;

            tabelaBeneficiariosBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px;">Carregando Base...</td></tr>';
            
            const response = await fetch(endpoint, {
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
                renderizarTabelaBeneficiarios(data);
            }
        } catch (error) {
            console.error('Erro ao carregar beneficiarios:', error);
        }
    }

    function renderizarTabelaBeneficiarios(lista) {
        tabelaBeneficiariosBody.innerHTML = '';
        if(lista.length === 0) {
            tabelaBeneficiariosBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px;">Nenhum beneficiário cadastrado.</td></tr>';
            return;
        }

        lista.forEach(item => {
            const inicial = item.nome.charAt(0).toUpperCase();
            
            let dataAtendimento = item.data_cadastro;
            if (dataAtendimento) {
                const dateObj = new Date(dataAtendimento);
                dataAtendimento = dateObj.toLocaleDateString('pt-BR');
            } else {
                dataAtendimento = 'Sem registro';
            }

            const tecnico = item.tecnico_nome || 'Não atribuído';
            const statusColor = item.status === 'Acompanhamento Ativo' ? '#22C55E' : '#3B82F6';
            const statusBg = item.status === 'Acompanhamento Ativo' ? '#DCFCE7' : '#EFF6FF';

            const linha = `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 16px 24px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: #E5E7EB; display: flex; align-items: center; justify-content: center; font-weight: bold; color: var(--text-muted);">${inicial}</div>
                            <div>
                                <a href="prontuario.html?id=${item.id}" style="color: var(--text-main); font-weight: 600; text-decoration: none; display: block;">${item.nome}</a>
                                <span style="font-size: 12px; color: var(--text-muted);">Bairro: ${item.bairro}</span>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 16px 24px;">
                        <span style="display: block;">${item.cpf}</span>
                        <span style="font-size: 12px; color: var(--text-placeholder);">NIS: ${item.nis || 'Não inf.'}</span>
                    </td>
                    <td style="padding: 16px 24px; color: var(--text-muted);">#PAIF-${item.id.toString().padStart(4, '0')}/24</td>
                    <td style="padding: 16px 24px; color: var(--text-muted);">${dataAtendimento}</td>
                    <td style="padding: 16px 24px; color: var(--text-muted);">${tecnico}</td>
                    <td style="padding: 16px 24px;">
                        <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600;">${item.status}</span>
                    </td>
                    <td style="padding: 16px 24px; text-align: center; color: var(--text-placeholder);">
                        <a href="prontuario.html?id=${item.id}" style="text-decoration:none; margin-right:8px; display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:4px; background:#F3F4F6; color:var(--text-muted);">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                        </a>
                    </td>
                </tr>
            `;
            tabelaBeneficiariosBody.insertAdjacentHTML('beforeend', linha);
        });
    }
});
