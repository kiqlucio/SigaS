// assets/js/auth.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Impede a página de recarregar
            
            // Aqui você poderia pegar os valores dos inputs se quisesse validar algo
            // const email = document.getElementById('email').value;
            // const password = document.getElementById('password').value;

            // Simula um delay de rede (opcional, dá um efeito legal) e redireciona
            const btn = loginForm.querySelector('button');
            btn.textContent = 'ENTRANDO...';
            btn.style.opacity = '0.7';

            setTimeout(() => {
                // Redireciona para o Dashboard
                window.location.href = 'dashboard.html';
            }, 800); 
        });
    }
});