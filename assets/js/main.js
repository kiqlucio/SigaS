document.addEventListener('DOMContentLoaded', () => {
    
    // Pegando os elementos do Modal
    const modalBeneficiario = document.getElementById('modalNovoBeneficiario');
    const btnAbrir = document.getElementById('btnAbrirModal');
    const btnFechar = document.getElementById('btnFecharModal');
    const btnCancelar = document.getElementById('btnCancelarModal');
    const formBeneficiario = document.getElementById('formNovoBeneficiario');
    const tabelaBody = document.getElementById('tabelaBeneficiarios');

    if (modalBeneficiario && btnAbrir) {
        
        // Funções de abrir e fechar a janelinha
        const fecharModal = () => modalBeneficiario.classList.remove('active');
        btnAbrir.addEventListener('click', () => modalBeneficiario.classList.add('active'));
        btnFechar.addEventListener('click', fecharModal);
        btnCancelar.addEventListener('click', fecharModal);

        // O que acontece quando clica em SALVAR
        formBeneficiario.addEventListener('submit', (evento) => {
            evento.preventDefault(); 
            
            // Pega o que você digitou
            const nome = document.getElementById('nomeInput').value;
            const cpf = document.getElementById('cpfInput').value;
            const bairro = document.getElementById('bairroInput').value || 'Não informado';
            const inicial = nome.charAt(0).toUpperCase();

            // Simula que está salvando
            const btnSalvar = modalBeneficiario.querySelector('.btn-apply');
            btnSalvar.textContent = 'Salvando...';

            setTimeout(() => {
                // Cria a nova linha na tabela
                const novaLinha = `
                    <tr>
                        <td class="td-beneficiario">
                            <div class="avatar-circle" style="background:#3B82F6;">${inicial}</div>
                            <div class="td-beneficiario-info">
                                <strong>${nome}</strong>
                                <span>Bairro: ${bairro}</span>
                            </div>
                        </td>
                        <td>${cpf}<br><span style="font-size:11px; color:#9CA3AF;">NIS: Pendente</span></td>
                        <td>#PAIF-NOVO</td>
                        <td>Hoje</td>
                        <td>Ana Silva</td>
                        <td><span class="status-pill pill-ativo">Ativo</span></td>
                        <td>🗂️ ✏️</td>
                    </tr>
                `;

                // Coloca a linha na tela, limpa tudo e fecha
                tabelaBody.insertAdjacentHTML('afterbegin', novaLinha);
                btnSalvar.textContent = 'Salvar Cadastro';
                formBeneficiario.reset(); 
                fecharModal();

            }, 800);
        });
    }
});