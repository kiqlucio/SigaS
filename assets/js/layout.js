// assets/js/layout.js
(function() {
    // Aplica o dark mode de forma imediata
    if (localStorage.getItem('sigas_dark_mode') === 'enabled') {
        if(document.body) document.body.classList.add('dark-mode');
        else document.addEventListener('DOMContentLoaded', () => document.body.classList.add('dark-mode'));
    }
})();
