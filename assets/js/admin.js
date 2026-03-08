document.addEventListener('DOMContentLoaded', async () => {

    if(window.Auth && window.Auth.checkAuth) {
        window.Auth.checkAuth();
    }

    const token = window.Auth ? window.Auth.getToken() : null;
    const BASE_URL = window.location.hostname === '' || window.location.hostname === '127.0.0.1' 
                     ? 'http://localhost:3000' 
                     : window.location.origin;
    const API_URL = `${BASE_URL}/api`;

    const elUptime = document.getElementById('sysUptime');
    const elMemory = document.getElementById('sysMemory');
    const elNode = document.getElementById('sysNode');
    const toggleMaintenance = document.getElementById('toggleMaintenance');

    async function loadSysInfo() {
        try {
            const res = await fetch(`${API_URL}/admin/sysinfo`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if(res.ok) {
                const data = await res.json();
                elUptime.textContent = data.uptime;
                elMemory.textContent = `${data.memory.used} / ${data.memory.total}`;
                elNode.textContent = data.nodeVersion;
                toggleMaintenance.checked = data.maintenanceMode;
            } else {
                const err = await res.json();
                alert('Erro de Acesso: ' + err.error);
                window.location.href = 'dashboard.html';
            }
        } catch(e) {
            console.error(e);
            elUptime.textContent = 'Indisponível';
        }
    }

    toggleMaintenance.addEventListener('change', async (e) => {
        const isActive = e.target.checked;
        
        try {
            const res = await fetch(`${API_URL}/admin/maintenance`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ active: isActive })
            });

            if(res.ok) {
                const data = await res.json();
                // Opcional: mostrar um toast
                console.log(data.message);
            } else {
                e.target.checked = !isActive; // Reverte se falhou
                alert('Falha ao alterar o status do servidor.');
            }
        } catch (err) {
            console.error(err);
            e.target.checked = !isActive;
        }
    });

    loadSysInfo();
});
