// assets/js/relatorios.js
document.addEventListener('DOMContentLoaded', () => {

    if(window.Auth && window.Auth.checkAuth) {
        window.Auth.checkAuth();
    }
    const token = window.Auth ? window.Auth.getToken() : null;
    const user = window.Auth ? window.Auth.getUser() : null;

    const headerUserAvatar = document.getElementById('topbarUserAvatar');
    const headerUserName = document.getElementById('topbarUserName');
    
    if(user) {
        if(headerUserName) headerUserName.textContent = user.nome;
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

    // Seta mês atual como default
    const inputMes = document.getElementById('filtroMes');
    const hoje = new Date();
    const mm = String(hoje.getMonth() + 1).padStart(2, '0');
    const yyyy = hoje.getFullYear();
    inputMes.value = `${yyyy}-${mm}`;

    const btnGerar = document.getElementById('btnGerarRelatorio');
    const btnImprimir = document.getElementById('btnImprimir');

    btnGerar.addEventListener('click', carregarRelatorio);
    btnImprimir.addEventListener('click', () => window.print());

    carregarRelatorio();

    async function carregarRelatorio() {
        const mes = document.getElementById('filtroMes').value;
        const tecnico = document.getElementById('filtroTecnico').value;

        try {
            btnGerar.textContent = 'Gerando...';
            btnGerar.disabled = true;

            const res = await fetch(`${API_URL}/dashboard/relatorio?mes=${mes}&tecnico=${tecnico}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if(res.status === 401 || res.status === 403) {
                if(window.Auth) window.Auth.logout();
                return;
            }

            if(res.ok) {
                const data = await res.json();
                preencherCards(data.metricas);
                preencherProgressoStatus(data.statusCadastros);
                preencherTabela(data.atendimentosDetalhados);
                renderizarGraficoBarras(data.historicoMeses);
            } else {
                alert('Falha ao gerar o relatório.');
            }
        } catch(error) {
            console.error(error);
        } finally {
            btnGerar.textContent = 'Gerar Relatório';
            btnGerar.disabled = false;
        }
    }

    function preencherCards(metricas) {
        document.getElementById('resTotalAtendimentos').textContent = metricas.atendimentos || 0;
        document.getElementById('resTotalCadastros').textContent = metricas.novosCadastros || 0;
        document.getElementById('resTotalAcompanhamentos').textContent = metricas.ativos || 0;
        document.getElementById('resTotalEncontros').textContent = metricas.encontrosGrupo || 0;
    }

    function preencherProgressoStatus(status) {
        const total = status.ativo + status.cadastrado + status.inativo;
        const percAtivo = total > 0 ? (status.ativo / total) * 100 : 0;
        const percCad = total > 0 ? (status.cadastrado / total) * 100 : 0;
        const percInat = total > 0 ? (status.inativo / total) * 100 : 0;

        document.getElementById('progAtivoNum').textContent = status.ativo;
        document.getElementById('progCadNum').textContent = status.cadastrado;
        document.getElementById('progInatNum').textContent = status.inativo;

        document.getElementById('progAtivoBar').style.width = `${percAtivo}%`;
        document.getElementById('progCadBar').style.width = `${percCad}%`;
        document.getElementById('progInatBar').style.width = `${percInat}%`;
    }

    function preencherTabela(lista) {
        const tbody = document.getElementById('tabelaRelatorioBody');
        tbody.innerHTML = '';

        if(!lista || lista.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:32px;">Nenhum atendimento encontrado para os filtros selecionados.</td></tr>';
            return;
        }

        lista.forEach(item => {
            const tr = document.createElement('tr');
            
            // Formatando Data YYYY-MM-DD para DD/MM/YYYY
            let df = item.data;
            if(df && df.includes('-')) {
                const parts = df.split('-');
                df = `${parts[2]}/${parts[1]}/${parts[0]}`;
            }

            tr.innerHTML = `
                <td>${df}</td>
                <td><span style="background:#EFF6FF; color:#3B82F6; padding: 4px 8px; border-radius: 4px; font-size:11px; font-weight:600;">${item.modalidade}</span></td>
                <td><strong style="color:var(--text-main);">${item.alvo}</strong></td>
                <td style="color:var(--text-muted);">${item.tecnico || 'N/A'}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderizarGraficoBarras(historico) {
        const container = document.getElementById('chartAtendimentos');
        container.innerHTML = '';

        if(!historico || historico.length === 0) return;

        // Acha o maior valor pra escalar as alturas do Bar Chart
        const maxValue = Math.max(...historico.map(h => h.quantidade));
        
        historico.forEach(mesData => {
            let altura = 0;
            if(maxValue > 0) {
                altura = (mesData.quantidade / maxValue) * 100;
            }

            const col = document.createElement('div');
            col.className = 'bar-column';
            col.innerHTML = `
                <div style="flex:1; display:flex; align-items:flex-end; width:100%; position:relative;">
                    <div class="bar-fill" style="height:${altura}%; width:40%; margin:0 auto;">
                        <span class="bar-value">${mesData.quantidade}</span>
                    </div>
                </div>
                <div class="bar-label">${mesData.mes}</div>
            `;
            container.appendChild(col);
        });
    }

});
