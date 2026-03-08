// dashboard_stats.js
document.addEventListener('DOMContentLoaded', () => {
    const token = window.Auth ? window.Auth.getToken() : null;
    const API_URL = (window.location.hostname === '' || window.location.hostname === '127.0.0.1') 
                     ? 'http://localhost:3000/api' 
                     : `${window.location.origin}/api`;

    // ==========================================
    // LÓGICA DO DASHBOARD KPI
    // ==========================================
    const kpiFamilias = document.getElementById('kpiFamilias');
    if (kpiFamilias) {
        carregarDashboard();
    }

    async function carregarDashboard() {
        try {
            const response = await fetch(`${API_URL}/dashboard/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.status === 401 || response.status === 403) {
                if (typeof window.Auth !== 'undefined') window.Auth.logout();
                return;
            }

            if(response.ok) {
                const stats = await response.json();
                document.getElementById('kpiFamilias').textContent = stats.familias.toLocaleString('pt-BR');
                document.getElementById('kpiIndividuos').textContent = stats.individuos.toLocaleString('pt-BR');
                document.getElementById('kpiAtendInd').textContent = stats.atendimentos_ind.toLocaleString('pt-BR');
                document.getElementById('kpiAtendGrupo').textContent = stats.atendimentos_grupo.toLocaleString('pt-BR');
                document.getElementById('kpiAcompanhamentos').textContent = stats.acompanhamentos.toLocaleString('pt-BR');
                document.getElementById('kpiAlertas').textContent = stats.alertas.toLocaleString('pt-BR');
                
                if(stats.alertas > 0) {
                    const alertBanner = document.getElementById('dashboardAlerts');
                    if(alertBanner) {
                        alertBanner.style.display = 'flex';
                        document.getElementById('alertDesc').textContent = `Existem ${stats.alertas} avaliações multidimensionais com prazo expirado.`;
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao carregar stats do dashboard:', error);
        }
    }

    // ==========================================
    // LÓGICA DE LEMBRETES E WIDGET CALENDÁRIO
    // ==========================================
    const containerLembretes = document.getElementById('listaLembretesContainer');
    if (containerLembretes) {
        carregarLembretes();
    }

    const modalLembrete = document.getElementById('modalNovoLembrete');
    const btnAbrirLembrete = document.getElementById('btnAbrirModalLembrete');
    const btnFecharLembrete = document.getElementById('btnFecharModalLembrete');
    const btnCancelarLembrete = document.getElementById('btnCancelarModalLembrete');
    const formLembrete = document.getElementById('formNovoLembrete');

    if (modalLembrete && btnAbrirLembrete) {
        const fecharLemb = () => modalLembrete.classList.remove('active');
        btnAbrirLembrete.addEventListener('click', () => modalLembrete.classList.add('active'));
        if(btnFecharLembrete) btnFecharLembrete.addEventListener('click', fecharLemb);
        if(btnCancelarLembrete) btnCancelarLembrete.addEventListener('click', fecharLemb);

        formLembrete?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const texto = document.getElementById('lembreteTextoInput').value;
            const data_limite = document.getElementById('lembreteDataInput').value;

            const btnSalvar = modalLembrete.querySelector('.btn-apply');
            btnSalvar.textContent = 'Salvando...';
            btnSalvar.disabled = true;

            try {
                const res = await fetch(`${API_URL}/dashboard/lembretes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ texto, data_limite })
                });
                if(res.ok) {
                    fecharLemb();
                    formLembrete.reset();
                    carregarLembretes();
                } else {
                    alert('Erro ao criar lembrete');
                }
            } catch(e) { console.error(e); } 
            finally { btnSalvar.textContent = 'Salvar Lembrete'; btnSalvar.disabled = false; }
        });
    }

    async function carregarLembretes() {
        if (!containerLembretes) return;
        
        try {
            const response = await fetch(`${API_URL}/dashboard/lembretes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.status === 401 || response.status === 403) {
                if (typeof window.Auth !== 'undefined') window.Auth.logout();
                return;
            }
            
            if (response.ok) {
                const data = await response.json();
                renderizarLembretes(data);
                const calContainer = document.getElementById('miniCalendarContainer');
                if (calContainer) renderMiniCalendar(data);
            }
        } catch (error) { console.error('Erro ao carregar lembretes:', error); }
    }

    function renderizarLembretes(lista) {
        containerLembretes.innerHTML = '';
        if (lista.length === 0) {
            containerLembretes.innerHTML = '<p style="text-align:center; font-size:13px; color:var(--text-muted); padding:10px;">Sem compromissos pendentes.</p>';
            return;
        }

        lista.forEach(lembrete => {
            let dataHtml = '';
            if (lembrete.data_limite) {
                const parts = lembrete.data_limite.split('-');
                dataHtml = `<span style="font-size: 11px; color: var(--text-muted); display:block; margin-top:4px;">📅 Limite: ${parts[2]}/${parts[1]}/${parts[0]}</span>`;
            }

            let mainColor = lembrete.concluido ? "var(--text-muted)" : "var(--primary)";
            let bgLight = lembrete.concluido ? "#E5E7EB" : "#F3F4F6";
            let opacidade = lembrete.concluido ? "0.6" : "1";
            let textDecoration = lembrete.concluido ? "line-through" : "none";

            const div = document.createElement('div');
            div.style = `border-left: 3px solid ${mainColor}; background: ${bgLight}; padding: 12px 16px; border-radius: 4px; margin-bottom: 12px; display:flex; justify-content:space-between; align-items:flex-start; opacity: ${opacidade};`;
            
            div.innerHTML = `
                <div style="flex:1; padding-right:12px;">
                    <strong style="font-size: 14px; display:block; margin-bottom:2px; color:var(--text-main); text-decoration: ${textDecoration};">${lembrete.texto}</strong>
                    ${dataHtml}
                </div>
            `;

            if (!lembrete.concluido) {
                const btnCheck = document.createElement('button');
                btnCheck.style = `background:none; border:none; color:var(--text-placeholder); cursor:pointer; padding:4px; display:flex; align-items:center;`;
                btnCheck.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                btnCheck.title = "Marcar como concluído";
                btnCheck.onclick = () => concluirLembrete(lembrete.id);
                div.appendChild(btnCheck);
            }

            containerLembretes.appendChild(div);
        });
    }

    async function concluirLembrete(id) {
        try {
            const res = await fetch(`${API_URL}/dashboard/lembretes/${id}/concluir`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(res.ok) carregarLembretes();
        } catch(e) { console.error(e); }
    }

    let currentCalMonth = new Date().getMonth();
    let currentCalYear = new Date().getFullYear();
    let ultimaListaLembretes = [];

    function renderMiniCalendar(lembretesList = null) {
        if (lembretesList !== null) {
            ultimaListaLembretes = lembretesList;
        } else {
            lembretesList = ultimaListaLembretes;
        }

        const today = new Date();
        const currentMonth = currentCalMonth;
        const currentYear = currentCalYear;
        const currentDate = today.getDate();
        const isCurrentMonthActual = (today.getMonth() === currentMonth && today.getFullYear() === currentYear);

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const dayNames = ["D", "S", "T", "Q", "Q", "S", "S"];

        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
                <span style="font-weight: 600; color: var(--text-main); font-size: 14px;">${monthNames[currentMonth]} ${currentYear}</span>
                <div style="display:flex; gap: 8px;">
                    <button onclick="window.mudarMesCalendario(-1)" style="border:none; background:transparent; cursor:pointer; color:var(--text-muted);">&lt;</button>
                    <button onclick="window.mudarMesCalendario(1)" style="border:none; background:transparent; cursor:pointer; color:var(--text-muted);">&gt;</button>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; margin-bottom: 8px;">
        `;

        dayNames.forEach(d => {
            html += `<div style="font-size: 11px; font-weight: 600; color: var(--text-muted);">${d}</div>`;
        });
        html += `</div><div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center;">`;

        for (let i = 0; i < firstDayOfMonth; i++) {
            html += `<div></div>`;
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = isCurrentMonthActual && (i === currentDate);
            const isDayString = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
            const pendenteHoje = lembretesList.filter(l => l.data_limite === isDayString && !l.concluido).length;

            let extraDots = '';
            if(pendenteHoje > 0) {
                extraDots = `<span style="position:absolute; bottom:1px; right:1px; width:6px; height:6px; background-color:#EF4444; border-radius:50%; border:1px solid white;"></span>`;
            }

            const todayStyle = isToday 
                ? `background: var(--primary); color: white; border-radius: 50%; width: 28px; height: 28px; display:inline-flex; align-items:center; justify-content:center; margin:0 auto; font-weight:600; box-shadow: 0 4px 6px rgba(13, 138, 188, 0.2); position:relative; cursor:pointer;` 
                : `color: var(--text-main); font-size: 13px; width: 28px; height: 28px; display:inline-flex; align-items:center; justify-content:center; margin:0 auto; font-weight:500; cursor:pointer; position:relative;`;
            
            html += `<div style="${todayStyle}" onclick="window.abrirLembreteEm('${isDayString}')">${i}${extraDots}</div>`;
        }
        
        html += `</div>`;
        
        const calContainer = document.getElementById('miniCalendarContainer');
        if(calContainer) calContainer.innerHTML = html;
    }

    window.mudarMesCalendario = function(direction) {
        currentCalMonth += direction;
        if (currentCalMonth > 11) {
            currentCalMonth = 0;
            currentCalYear++;
        } else if (currentCalMonth < 0) {
            currentCalMonth = 11;
            currentCalYear--;
        }
        renderMiniCalendar(null);
    };

    window.abrirLembreteEm = function(dataLimit) {
        if(modalLembrete && btnAbrirLembrete) {
            document.getElementById('lembreteDataInput').value = dataLimit;
            modalLembrete.classList.add('active');
        }
    };
});
