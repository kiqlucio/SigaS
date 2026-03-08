document.addEventListener('DOMContentLoaded', () => {

    if(window.Auth && window.Auth.checkAuth) {
        window.Auth.checkAuth();
    }
    const token = window.Auth ? window.Auth.getToken() : null;
    const user = window.Auth ? window.Auth.getUser() : null;

    const headerUserAvatar = document.getElementById('topbarUserAvatar');
    if(headerUserAvatar && user) {
        const splitted = user.nome.split(' ');
        headerUserAvatar.textContent = splitted.length > 1 
            ? `${splitted[0][0]}${splitted[1][0]}`.toUpperCase()
            : user.nome.substring(0, 2).toUpperCase();
    }

    const BASE_URL = window.location.hostname === '' || window.location.hostname === '127.0.0.1' 
                     ? 'http://localhost:3000' 
                     : window.location.origin;
    const API_URL = `${BASE_URL}/api`;
    const urlParams = new URLSearchParams(window.location.search);
    const beneficiarioId = urlParams.get('id');

    if (!beneficiarioId) {
        alert('Beneficiário não especificado!');
        window.location.href = 'atendimento-individual.html';
        return;
    }

    // Inicializar abas
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.style.color = 'var(--text-muted)';
                b.style.borderBottom = 'none';
            });
            tabPanes.forEach(p => p.style.display = 'none');

            btn.classList.add('active');
            btn.style.color = 'var(--primary)';
            btn.style.borderBottom = '2px solid var(--primary)';
            
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).style.display = 'block';
        });
    });

    carregarBeneficiarioDetalhe();
    carregarHistoricoAtendimentos();

    // ==========================================
    // CARREGAR DADOS
    // ==========================================

    async function carregarBeneficiarioDetalhe() {
        try {
            const response = await fetch(`${API_URL}/beneficiarios/${beneficiarioId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401 || response.status === 403) {
                if (window.Auth) window.Auth.logout();
                return;
            }
            if (response.ok) {
                const bnf = await response.json();
                document.getElementById('prontuarioNome').textContent = bnf.nome;
                document.getElementById('prontuarioAvatar').textContent = bnf.nome.charAt(0).toUpperCase();
                document.getElementById('prontuarioCpf').textContent = bnf.cpf;
                document.getElementById('prontuarioNis').textContent = bnf.nis || 'Não informado';
                document.getElementById('prontuarioId').textContent = bnf.id.toString().padStart(4, '0');

                const spanStatus = document.getElementById('prontuarioStatus');
                spanStatus.textContent = bnf.status;
                if(bnf.status === 'Acompanhamento Ativo') {
                    spanStatus.style.background = '#DCFCE7';
                    spanStatus.style.color = '#22C55E';
                } else {
                    spanStatus.style.background = '#F3F4F6';
                    spanStatus.style.color = 'var(--text-muted)';
                }
            } else {
                alert('Erro ao carregar dados do beneficiário.');
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function carregarHistoricoAtendimentos() {
        try {
            const response = await fetch(`${API_URL}/beneficiarios/${beneficiarioId}/atendimentos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401 || response.status === 403) {
                if (window.Auth) window.Auth.logout();
                return;
            }
            if (response.ok) {
                const atendimentos = await response.json();
                renderizarTimeline(atendimentos);
            }
        } catch (error) {
            console.error(error);
        }
    }

    function renderizarTimeline(atendimentos) {
        const divTimeline = document.getElementById('timelineAtendimentos');
        divTimeline.innerHTML = '';

        if (atendimentos.length === 0) {
            divTimeline.innerHTML = '<p style="color:var(--text-muted);">Nenhum atendimento registrado no histórico.</p>';
            return;
        }

        atendimentos.forEach(at => {
            const dateParts = at.data.split('-'); // 2024-05-12
            const df = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
            
            const html = `
                <div style="display:flex; gap:16px;">
                    <div style="display:flex; flex-direction:column; align-items:center;">
                        <div style="width:12px; height:12px; background:var(--primary); border-radius:50%; margin-top:6px;"></div>
                        <div style="width:2px; height:100%; background:var(--border-color); margin-top:8px;"></div>
                    </div>
                    <div style="flex:1; background:#F9FAFB; border:1px solid var(--border-color); border-radius:8px; padding:16px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <strong style="font-size:15px; color: var(--text-main);">${at.modalidade}</strong>
                            <span style="font-size:12px; color:var(--text-muted); font-weight:600;">${df}</span>
                        </div>
                        <p style="font-size:14px; color:var(--text-muted); line-height:1.5; margin-bottom:12px;">${at.descricao}</p>
                        <span style="font-size:12px; color:var(--text-muted); font-weight:600;">Técnico: <span style="color: var(--text-main);">${at.tecnico_nome}</span></span>
                    </div>
                </div>
            `;
            divTimeline.insertAdjacentHTML('beforeend', html);
        });
    }

    // ==========================================
    // SALVAR NOVO ATENDIMENTO
    // ==========================================

    const formNovoAtendimento = document.getElementById('formNovoAtendimento');
    if(formNovoAtendimento) {
        formNovoAtendimento.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btnSalvar = formNovoAtendimento.querySelector('button[type="submit"]');
            btnSalvar.disabled = true;
            btnSalvar.textContent = 'Aguarde...';

            const payload = {
                data: document.getElementById('dataAtendInput').value,
                modalidade: document.getElementById('modalidadeInput').value,
                descricao: document.getElementById('descricaoInput').value
            };

            try {
                const response = await fetch(`${API_URL}/beneficiarios/${beneficiarioId}/atendimentos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    formNovoAtendimento.reset();
                    // Voltar para a tab histórico
                    tabBtns[0].click();
                    // Recarregar os dados
                    carregarHistoricoAtendimentos();
                    carregarBeneficiarioDetalhe(); // Para atualizar o status caso tenha mudado
                } else {
                    const errorJson = await response.json();
                    alert(errorJson.error || 'Erro ao registrar atendimento');
                }
            } catch (error) {
                console.error(error);
                alert('Erro de conexão ao salvar atendimento');
            } finally {
                btnSalvar.disabled = false;
                btnSalvar.textContent = 'Salvar Atendimento';
            }
        });
    }

    // Modal Encerrar (Apenas visual para MVP)
    const btnAbrirEncerrar = document.getElementById('btnAbrirModalEncerrar');
    const modalEncerrar = document.getElementById('modalEncerrarCaso');
    if(btnAbrirEncerrar && modalEncerrar) {
        btnAbrirEncerrar.addEventListener('click', () => modalEncerrar.classList.add('active'));
        document.getElementById('btnFecharModalEncerrar').addEventListener('click', () => modalEncerrar.classList.remove('active'));
        document.getElementById('btnCancelarModalEncerrar').addEventListener('click', () => modalEncerrar.classList.remove('active'));
        
        document.getElementById('formEncerrarCaso').addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Ação de encerramento temporariamente desativada (MVP).');
            modalEncerrar.classList.remove('active');
        });
    }

    // ==========================================
    // ENCAMINHAMENTOS
    // ==========================================

    const btnAbrirEncaminhamento = document.getElementById('btnAbrirModalEncaminhamento');
    const modalEncaminhamento = document.getElementById('modalNovoEncaminhamento');
    const btnFecharEncaminhamento = document.getElementById('btnFecharModalEncaminhamento');
    const btnCancelarEncaminhamento = document.getElementById('btnCancelarModalEncaminhamento');
    const formNovoEncaminhamento = document.getElementById('formNovoEncaminhamento');

    if(btnAbrirEncaminhamento) {
        btnAbrirEncaminhamento.addEventListener('click', () => modalEncaminhamento.classList.add('active'));
        btnFecharEncaminhamento.addEventListener('click', () => modalEncaminhamento.classList.remove('active'));
        btnCancelarEncaminhamento.addEventListener('click', () => modalEncaminhamento.classList.remove('active'));
    }

    const modalRetorno = document.getElementById('modalRetornoEncaminhamento');
    const btnFecharRetorno = document.getElementById('btnFecharModalRetorno');
    const btnCancelarRetorno = document.getElementById('btnCancelarModalRetorno');
    const formRetornoEncaminhamento = document.getElementById('formRetornoEncaminhamento');

    if(modalRetorno) {
        btnFecharRetorno.addEventListener('click', () => modalRetorno.classList.remove('active'));
        btnCancelarRetorno.addEventListener('click', () => modalRetorno.classList.remove('active'));
    }

    // Ao carregar a página e se clicar na aba Encaminhamentos...
    const tabEncaminhamentosBtn = document.querySelector('.tab-btn[data-target="tab-encaminhamentos"]');
    if(tabEncaminhamentosBtn) {
        tabEncaminhamentosBtn.addEventListener('click', carregarEncaminhamentos);
    }

    async function carregarEncaminhamentos() {
        try {
            const response = await fetch(`${API_URL}/beneficiarios/${beneficiarioId}/encaminhamentos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const lista = await response.json();
                renderizarTabelaEncaminhamentos(lista);
            }
        } catch (error) {
            console.error('Erro ao buscar encaminhamentos', error);
        }
    }

    function renderizarTabelaEncaminhamentos(lista) {
        const tbody = document.getElementById('tabelaEncaminhamentosBody');
        tbody.innerHTML = '';

        if(lista.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 24px; color: var(--text-muted);">Nenhum encaminhamento registrado.</td></tr>';
            return;
        }

        lista.forEach(enc => {
            const isAguardando = enc.status !== 'Retorno Registrado';
            
            // Formatando datas
            let dataArr = enc.data_encaminhamento.split('-');
            const dataEncFmt = dataArr.length === 3 ? `${dataArr[2]}/${dataArr[1]}/${dataArr[0]}` : enc.data_encaminhamento;
            
            let htmlTr = `
                <tr>
                    <td>${dataEncFmt}</td>
                    <td><strong>${enc.destino}</strong></td>
                    <td style="color:var(--text-muted);">${enc.motivo}</td>
                    <td>
                        <span style="padding:4px 8px; border-radius:4px; font-size:11px; font-weight:600; 
                            background:${isAguardando ? '#FEF3C7' : '#DCFCE7'}; 
                            color:${isAguardando ? '#D97706' : '#16A34A'}">
                            ${enc.status}
                        </span>
                    </td>
                    <td style="text-align:center;">
            `;

            if(isAguardando) {
                htmlTr += `
                        <button class="btn-outline btn-registrar-retorno" data-id="${enc.id}" style="padding:6px 10px; font-size:12px;">Registrar Retorno</button>
                    </td>
                </tr>
                `;
            } else {
                htmlTr += `
                        <div style="font-size:11px; color:var(--text-muted);" title="${enc.resultado_retorno}">Ver Retorno</div>
                    </td>
                </tr>
                `;
            }

            tbody.insertAdjacentHTML('beforeend', htmlTr);
        });

        // Binds do botão registrar retorno
        document.querySelectorAll('.btn-registrar-retorno').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                document.getElementById('retornoEncaminhamentoId').value = id;
                document.getElementById('retornoData').value = new Date().toISOString().substring(0,10);
                document.getElementById('retornoObs').value = '';
                modalRetorno.classList.add('active');
            });
        });
    }

    // POST NOVO ENCAMINHAMENTO
    if(formNovoEncaminhamento) {
        formNovoEncaminhamento.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                destino: document.getElementById('encaminhamentoDestino').value,
                motivo: document.getElementById('encaminhamentoMotivo').value,
                data_encaminhamento: document.getElementById('encaminhamentoData').value
            };

            try {
                const res = await fetch(`${API_URL}/beneficiarios/${beneficiarioId}/encaminhamentos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });

                if(res.ok) {
                    formNovoEncaminhamento.reset();
                    modalEncaminhamento.classList.remove('active');
                    carregarEncaminhamentos();
                } else {
                    alert('Erro ao registrar encaminhamento');
                }
            } catch(error) { console.error(error); }
        });
    }

    // PUT RETORNO
    if(formRetornoEncaminhamento) {
        formRetornoEncaminhamento.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('retornoEncaminhamentoId').value;
            const payload = {
                data_retorno: document.getElementById('retornoData').value,
                resultado_retorno: document.getElementById('retornoObs').value
            };

            try {
                const res = await fetch(`${API_URL}/beneficiarios/${beneficiarioId}/encaminhamentos/${id}/retorno`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });

                if(res.ok) {
                    formRetornoEncaminhamento.reset();
                    modalRetorno.classList.remove('active');
                    carregarEncaminhamentos();
                } else {
                    alert('Erro ao registrar retorno do encaminhamento');
                }
            } catch(error) { console.error(error); }
        });
    }

});