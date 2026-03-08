// assets/js/auth.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = loginForm.querySelector('button');
            
            if (!email || !password) {
                alert('Por favor, preencha email e senha.');
                return;
            }

            const originalText = btn.textContent;
            btn.textContent = 'ENTRANDO...';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            try {
                // Monta a URL explícita para o caso do usuário ter aberto o HTML arrastando no navegador (file://)
                const BASE_URL = window.location.hostname === '' || window.location.hostname === '127.0.0.1' 
                                 ? 'http://localhost:3000' 
                                 : window.location.origin;

                const response = await fetch(`${BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Salvar o token no LocalStorage e Redirecionar
                    localStorage.setItem('sigas_token', data.token);
                    localStorage.setItem('sigas_user', JSON.stringify(data.user));
                    window.location.href = 'dashboard.html';
                } else {
                    mostrarErroLogin(data.error || data.message || 'Credenciais inválidas. Tente novamente.');
                    btn.textContent = originalText;
                    btn.style.opacity = '1';
                    btn.disabled = false;
                }
            } catch (error) {
                console.error('Erro de rede:', error);
                mostrarErroLogin('Erro de conexão com o servidor. Tente novamente mais tarde.');
                btn.textContent = originalText;
                btn.style.opacity = '1';
                btn.disabled = false;
            }
        });

        function mostrarErroLogin(mensagem) {
            let errorBox = document.getElementById('loginErrorBox');
            if(!errorBox) {
                errorBox = document.createElement('div');
                errorBox.id = 'loginErrorBox';
                errorBox.className = 'login-error-box';
                loginForm.parentNode.insertBefore(errorBox, loginForm);
            }
            errorBox.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>${mensagem}</span>
            `;
            errorBox.style.display = 'flex';
        }
    }

    // Função global (pode ser chamada por outras telas) para ver se tá logado e fazer logoff
    window.Auth = {
        getToken: () => localStorage.getItem('sigas_token'),
        getUser: () => JSON.parse(localStorage.getItem('sigas_user') || '{}'),
        logout: () => {
            localStorage.removeItem('sigas_token');
            localStorage.removeItem('sigas_user');
            window.location.href = 'index.html';
        },
        checkAuth: () => {
            if (!localStorage.getItem('sigas_token') && !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
                window.location.href = 'index.html';
            }
        }
    };
});
