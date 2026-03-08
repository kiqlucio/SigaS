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
    const grupoId = urlParams.get('id');

    if (!grupoId) {
        alert('Grupo não especificado!');
        window.location.href = 'atendimento-grupo.html';
        return;
    }

    let grupoData = null;

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

    carregarGrupoDetalhe();
    carregarMembros();
    carregarEncontros();
    carregarListaBeneficiarios();

    // ==========================================
    // CARREGAR DADOS
    // ==========================================

    async function carregarGrupoDetalhe() {
        try {
            const response = await fetch(`${API_URL}/grupos/${grupoId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401 || response.status === 403) {
                if (window.Auth) window.Auth.logout();
                return;
            }
            if (response.ok) {
                grupoData = await response.json();
                document.getElementById('grupoNome').textContent = grupoData.nome;
                document.getElementById('grupoId').textContent = `GRP-${grupoData.id.toString().padStart(4, '0')}`;
                document.getElementById('grupoTecnico').textContent = grupoData.tecnico_nome || 'N/A';
                
                const spanTipo = document.getElementById('grupoTipo');
                let tipoColor = "#3B82F6", tipoBg = "#EFF6FF", tipoLabel = grupoData.tipo;
                if (grupoData.tipo === "Serviço de Convivência (SCFV)") {
                    tipoLabel = "SCFV";
                    tipoColor = "#8B5CF6"; tipoBg = "#F5F3FF";
                } else if (grupoData.tipo === "PAIF") {
                    tipoColor = "#D97706"; tipoBg = "#FEF3C7";
                }
                spanTipo.textContent = tipoLabel;
                spanTipo.style.color = tipoColor;
                spanTipo.style.background = tipoBg;

                const spanStatus = document.getElementById('grupoStatus');
                spanStatus.textContent = grupoData.status;
                if(grupoData.status === 'Ativo') {
                    spanStatus.style.background = '#DCFCE7';
                    spanStatus.style.color = '#22C55E';
                } else {
                    spanStatus.style.background = '#F3F4F6';
                    spanStatus.style.color = 'var(--text-muted)';
                }
            } else {
                alert('Erro ao carregar os detalhes do grupo.');
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function carregarMembros() {
        try {
            const response = await fetch(`${API_URL}/grupos/${grupoId}/membros`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401 || response.status === 403) {
                if (window.Auth) window.Auth.logout();
                return;
            }
            if (response.ok) {
                const membros = await response.json();
                renderizarMembros(membros);
            }
        } catch (error) {
            console.error(error);
        }
    }

    function renderizarMembros(membros) {
        const tb = document.getElementById('tabelaMembros');
        tb.innerHTML = '';
        
        let capacidade = grupoData && grupoData.capacidade ? grupoData.capacidade : 0;
        let capText = capacidade > 0 ? capacidade : '-';
        document.getElementById('contagemParticipantes').textContent = `${membros.length}/${capText}`;

        if (membros.length === 0) {
            tb.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:16px;">Nenhum participante nesse grupo ainda.</td></tr>';
            return;
        }

        membros.forEach(m => {
            const dataIngre = m.data_ingresso ? new Date(m.data_ingresso).toLocaleDateString('pt-BR') : '-';
            const linha = `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 16px; color: var(--text-main); font-weight: 500;">
                        <a href="prontuario.html?id=${m.beneficiario_id}" style="color:var(--text-main); text-decoration:none;">${m.nome}</a>
                    </td>
                    <td style="padding: 16px; color: var(--text-muted);">${m.nis || 'Não inf.'}</td>
                    <td style="padding: 16px; color: var(--text-muted);">${dataIngre}</td>
                    <td style="padding: 16px; text-align: center;">
                        <button style="background:transparent; border:none; color:var(--danger); cursor:pointer;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                        </button>
                    </td>
                </tr>
            `;
            tb.insertAdjacentHTML('beforeend', linha);
        });
    }

    async function carregarEncontros() {
        try {
            const response = await fetch(`${API_URL}/grupos/${grupoId}/encontros`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401 || response.status === 403) {
                if (window.Auth) window.Auth.logout();
                return;
            }
            if (response.ok) {
                const encontros = await response.json();
                renderizarEncontros(encontros);
            }
        } catch (error) {
            console.error(error);
        }
    }

    function renderizarEncontros(encontros) {
        const divTimeline = document.getElementById('timelineEncontros');
        divTimeline.innerHTML = '';

        if (encontros.length === 0) {
            divTimeline.innerHTML = '<p style="color:var(--text-muted);">Nenhum encontro registrado no histórico.</p>';
            return;
        }

        encontros.forEach(enc => {
            const dateParts = enc.data.split('-');
            const df = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
            
            const html = `
                <div style="display:flex; gap:16px;">
                    <div style="display:flex; flex-direction:column; align-items:center;">
                        <div style="width:12px; height:12px; background:#22C55E; border-radius:50%; margin-top:6px;"></div>
                        <div style="width:2px; height:100%; background:var(--border-color); margin-top:8px;"></div>
                    </div>
                    <div style="flex:1; background:#F9FAFB; border:1px solid var(--border-color); border-radius:8px; padding:16px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <strong style="font-size:15px; color: var(--text-main);">${enc.tema}</strong>
                            <span style="font-size:12px; color:var(--text-muted); font-weight:600;">${df}</span>
                        </div>
                        <p style="font-size:14px; color:var(--text-muted); line-height:1.5; margin-bottom:12px;">${enc.resumo || 'Sem resumo cadastrado.'}</p>
                    </div>
                </div>
            `;
            divTimeline.insertAdjacentHTML('beforeend', html);
        });
    }

    // ==========================================
    // ADICIONAR MEMBROS
    // ==========================================
    
    async function carregarListaBeneficiarios() {
        const select = document.getElementById('selectBeneficiario');
        try {
            const res = await fetch(`${API_URL}/beneficiarios`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(res.ok) {
                const bnfs = await res.json();
                select.innerHTML = '<option value="">Selecione um beneficiário...</option>';
                bnfs.forEach(b => {
                    const opt = document.createElement('option');
                    opt.value = b.id;
                    opt.textContent = `${b.nome} (CPF: ${b.cpf})`;
                    select.appendChild(opt);
                });
            }
        } catch(e) {
            console.error(e);
        }
    }

    const modalAdd = document.getElementById('modalAddMembro');
    const formAdd = document.getElementById('formAddMembro');
    document.getElementById('btnAbrirModalAddMembro').addEventListener('click', () => modalAdd.classList.add('active'));
    document.getElementById('btnFecharModalAddMembro').addEventListener('click', () => modalAdd.classList.remove('active'));
    document.getElementById('btnCancelarModalAddMembro').addEventListener('click', () => modalAdd.classList.remove('active'));

    formAdd.addEventListener('submit', async (e) => {
        e.preventDefault();
        const benId = document.getElementById('selectBeneficiario').value;
        const btnSalvar = modalAdd.querySelector('.btn-apply');

        btnSalvar.disabled = true;
        btnSalvar.textContent = 'Adicionando...';

        try {
            const response = await fetch(`${API_URL}/grupos/${grupoId}/membros`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ beneficiario_id: benId })
            });
            if(response.ok) {
                modalAdd.classList.remove('active');
                carregarMembros(); // recarrega a tabela e contadores
            } else {
                const err = await response.json();
                alert(err.error || 'Erro ao adicionar membro');
            }
        } catch(error) {
            console.error(error);
        } finally {
            btnSalvar.disabled = false;
            btnSalvar.textContent = 'Adicionar ao Grupo';
        }
    });

    // ==========================================
    // CADASTRAR ENCONTRO
    // ==========================================
    const formEnc = document.getElementById('formNovoEncontro');
    formEnc.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            data: document.getElementById('dataEncontroInput').value,
            tema: document.getElementById('temaEncontroInput').value,
            resumo: document.getElementById('resumoEncontroInput').value
        };

        const btnSalvar = formEnc.querySelector('button[type="submit"]');
        btnSalvar.disabled = true;
        btnSalvar.textContent = 'Salvando...';

        try {
            const response = await fetch(`${API_URL}/grupos/${grupoId}/encontros`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if(response.ok) {
                formEnc.reset();
                tabBtns[2].click(); // Vai pra aba historico
                carregarEncontros();
            } else {
                const err = await response.json();
                alert(err.error || 'Erro ao criar encontro');
            }
        } catch(error) {
            console.error(error);
        } finally {
            btnSalvar.disabled = false;
            btnSalvar.textContent = 'Salvar Encontro';
        }
    });

    // Modal Encerramento visualmente apenas
    const modalEncGrp = document.getElementById('modalEncerrarGrupo');
    document.getElementById('btnAbrirModalEncerrarGrupo').addEventListener('click', () => modalEncGrp.classList.add('active'));
    document.getElementById('btnFecharModalEncerrarGrupo').addEventListener('click', () => modalEncGrp.classList.remove('active'));
    document.getElementById('btnCancelarModalEncerrarGrupo').addEventListener('click', () => modalEncGrp.classList.remove('active'));
    document.getElementById('btnConfirmarEncerramento').addEventListener('click', () => {
        alert('Encerramento de grupos indisponível no MVP.');
        modalEncGrp.classList.remove('active');
    });

});