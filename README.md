# SigaS
Desenvolvimento de sistema web voltado para a área de Assistência Social, com uso de banco de dados relacional e versionamento de código.

# 📄 SigaS - Sistema Integrado de Gestão de Assistência Social

> **Status do Projeto:** MVP (Produto Mínimo Viável) - Protótipo de Alta Fidelidade

O **SigaS** é um sistema web desenvolvido como projeto académico para o curso de Engenharia de Computadores. O seu objetivo principal é modernizar, organizar e facilitar a rotina dos técnicos de assistência social (como CRAS), permitindo a gestão eficiente de famílias, indivíduos e grupos em situação de vulnerabilidade.

## 🎯 Funcionalidades do MVP

O protótipo atual contempla o fluxo completo de navegação do utilizador e a manipulação de dados na interface (DOM), possuindo os seguintes módulos:

* **Autenticação:** Tela de login seguro para técnicos e assistentes sociais.
* **Dashboard Central:** Painel com indicadores-chave (KPIs) de atendimentos e grupos ativos.
* **Atendimento Individual:**
    * Listagem de beneficiários com filtros de pesquisa.
    * Criação de novos registos via Modal dinâmico.
    * **Prontuário Eletrónico:** Visão detalhada do beneficiário com separadores (tabs) para Histórico, Registo de Novo Atendimento, Encaminhamentos e Plano de Acompanhamento.
    * Fluxo de encerramento e transferência de casos.
* **Atendimento em Grupo:**
    * Listagem e monitorização de serviços coletivos (PAIF, SCFV, etc.).
    * Criação de novos grupos.
    * Gestão interna do grupo (controlo de participantes, registo de encontros e histórico).

## 💻 Tecnologias Utilizadas

Este MVP foi construído focando nos fundamentos do desenvolvimento Front-end, garantindo um código limpo, semântico e sem dependência de bibliotecas externas complexas:

* **HTML5:** Estruturação semântica e acessibilidade.
* **CSS3:** Estilização responsiva, variáveis nativas para o tema (Design System próprio) e animações suaves (modais e transições).
* **JavaScript (Vanilla):** Lógica de interface, manipulação do DOM em tempo real, navegação entre separadores (tabs) e simulação de submissão de formulários de registo.

## 📂 Estrutura de Ficheiros

```text
SigaS/
 ┣ 📁 assets/
 ┃ ┣ 📁 css/
 ┃ ┃ ┣ 📄 dashboard.css
 ┃ ┃ ┣ 📄 layout.css
 ┃ ┃ ┣ 📄 login.css
 ┃ ┃ ┣ 📄 prontuario.css
 ┃ ┃ ┗ 📄 telas.css
 ┃ ┗ 📁 js/
 ┃   ┣ 📄 detalhe-grupo.js
 ┃   ┣ 📄 main.js
 ┃   ┗ 📄 prontuario.js
 ┣ 📄 index.html (Login)
 ┣ 📄 dashboard.html
 ┣ 📄 atendimento-individual.html
 ┣ 📄 atendimento-grupo.html
 ┣ 📄 detalhe-grupo.html
 ┣ 📄 prontuario.html
 ┣ 📄 SigaS_Requisitos_MVP.md
 ┗ 📄 README.md