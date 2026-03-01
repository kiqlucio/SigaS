# SigaS — Sistema Integrado de Gestão de Assistência Social
## Documento de Requisitos Funcionais — MVP

---

## 1. Visão Geral do Sistema

O **SigaS** é uma plataforma web voltada à gestão de beneficiários, atendimentos e acompanhamentos sociais. O sistema organiza informações de famílias e indivíduos em situação de vulnerabilidade social, permitindo que equipes de assistência social registrem, acompanhem e gerem relatórios de forma integrada.

O MVP abrange quatro telas principais: **Tela Inicial**, **Tela de Login**, **Tela de Atendimento em Grupo** e **Tela de Atendimento Individual**.

---

## 2. Perfis de Usuário

| Perfil | Descrição |
|---|---|
| **Administrador** | Acesso total ao sistema, gerencia usuários e configurações gerais |
| **Técnico Social** | Realiza cadastros, registra atendimentos e acompanhamentos |
| **Gestor** | Visualiza relatórios e dashboards, sem acesso a edição de prontuários |

---

## 3. Tela Inicial (Dashboard)

### 3.1 Descrição
A Tela Inicial é a primeira tela exibida após o login bem-sucedido. Funciona como um painel de controle central com visão consolidada das atividades do serviço.

### 3.2 Requisitos Funcionais

#### RF-TI-01 — Painel de Indicadores (Cards de resumo)
- O sistema deve exibir cards com os seguintes indicadores em tempo real:
  - Total de famílias cadastradas
  - Total de indivíduos cadastrados
  - Atendimentos realizados no mês corrente
  - Atendimentos em grupo realizados no mês corrente
  - Famílias com acompanhamento ativo
  - Alertas de pendências (ex.: prontuários desatualizados há mais de 90 dias)

#### RF-TI-02 — Atalhos de Ações Rápidas
- O sistema deve exibir botões de acesso rápido para:
  - Novo cadastro individual
  - Novo cadastro de família/grupo
  - Registrar atendimento individual
  - Registrar atendimento em grupo
  - Gerar relatório mensal

#### RF-TI-03 — Feed de Atividades Recentes
- Exibir lista cronológica com os últimos atendimentos realizados pelo técnico logado, contendo:
  - Nome do beneficiário ou grupo
  - Tipo de atendimento (individual ou grupo)
  - Data e horário
  - Técnico responsável
  - Status (concluído, pendente, em acompanhamento)

#### RF-TI-04 — Alertas e Notificações
- O sistema deve exibir notificações destacadas para:
  - Beneficiários com data de reavaliação vencida
  - Encaminhamentos sem retorno registrado
  - Atendimentos agendados para o dia atual

#### RF-TI-05 — Calendário de Atendimentos
- Exibir mini-calendário com marcação visual dos dias com atendimentos agendados
- Ao clicar em um dia, exibir listagem dos atendimentos daquela data

#### RF-TI-06 — Barra de Busca Global
- Campo de busca que permita localizar beneficiários (individual ou família) pelo nome, CPF, NIS ou número de prontuário
- Resultados devem apresentar o tipo (pessoa física ou grupo familiar) e link direto para o prontuário

#### RF-TI-07 — Navegação Principal (Menu Lateral)
- Menu lateral persistente com as seções:
  - Dashboard (Tela Inicial)
  - Cadastros (Individual / Grupo / Família)
  - Atendimentos (Individual / Grupo)
  - Encaminhamentos
  - Relatórios
  - Configurações (apenas para Administrador)
  - Sair

---

## 4. Tela de Login

### 4.1 Descrição
Tela de autenticação de usuários do sistema, sendo o ponto de entrada obrigatório antes de qualquer funcionalidade.

### 4.2 Requisitos Funcionais

#### RF-TL-01 — Formulário de Autenticação
- O sistema deve exibir campos para:
  - E-mail ou matrícula funcional do técnico
  - Senha (campo com opção de exibir/ocultar caracteres)
- Botão "Entrar" para submissão do formulário

#### RF-TL-02 — Validação de Credenciais
- O sistema deve validar as credenciais contra a base de usuários cadastrados
- Em caso de credenciais inválidas, exibir mensagem de erro genérica: "E-mail ou senha incorretos"
- Após 5 tentativas consecutivas com falha, bloquear o acesso por 15 minutos e exibir aviso ao usuário

#### RF-TL-03 — Recuperação de Senha
- Link "Esqueci minha senha" que direciona para fluxo de recuperação via e-mail cadastrado
- O sistema envia e-mail com link de redefinição de senha com validade de 1 hora

#### RF-TL-04 — Identificação Visual do Sistema
- Exibir logotipo do SigaS e nome completo do sistema
- Exibir nome da instituição/prefeitura responsável (configurável pelo administrador)
- Exibir versão do sistema no rodapé da tela

#### RF-TL-05 — Segurança de Sessão
- Após login bem-sucedido, o sistema inicia sessão autenticada com tempo de expiração de 8 horas
- Sessão inativa por mais de 30 minutos deve exibir alerta de expiração e redirecionar para o login

#### RF-TL-06 — Acessibilidade
- A tela deve seguir diretrizes básicas de acessibilidade (navegação por teclado, contraste adequado)
- Mensagens de erro devem ser lidas por leitores de tela

---

## 5. Tela de Atendimento em Grupo

### 5.1 Descrição
Tela destinada ao registro, consulta e gestão de atendimentos realizados com grupos de beneficiários, como grupos socioeducativos, grupos de convivência, oficinas e reuniões comunitárias.

### 5.2 Requisitos Funcionais

#### RF-TG-01 — Listagem de Grupos Cadastrados
- O sistema deve exibir lista paginada de todos os grupos ativos, contendo:
  - Nome do grupo
  - Tipo (convivência, socioeducativo, oficina, reunião, outro)
  - Número de participantes ativos
  - Técnico(s) responsável(is)
  - Data do último encontro registrado
  - Status (ativo, encerrado, suspenso)
- Filtros disponíveis: tipo de grupo, técnico responsável, status, período de atividade

#### RF-TG-02 — Cadastro de Novo Grupo
- Formulário com os seguintes campos obrigatórios:
  - Nome do grupo
  - Tipo de grupo (lista predefinida)
  - Objetivo/descrição do grupo
  - Técnico(s) responsável(is) (seleção múltipla de usuários cadastrados)
  - Periodicidade dos encontros (semanal, quinzenal, mensal, eventual)
  - Local de realização
  - Data de início
- Campos opcionais:
  - Data de encerramento prevista
  - Número máximo de participantes
  - Observações gerais

#### RF-TG-03 — Gerenciamento de Participantes do Grupo
- O sistema deve permitir:
  - Adicionar participantes buscando por nome, CPF ou NIS na base de cadastros individuais
  - Registrar data de ingresso de cada participante
  - Registrar data de saída e motivo de desligamento de participantes
  - Visualizar histórico de participação por membro

#### RF-TG-04 — Registro de Encontro/Sessão do Grupo
- Para cada encontro realizado, o sistema deve permitir registrar:
  - Data e horário do encontro
  - Local de realização (podendo diferir do local padrão do grupo)
  - Técnico(s) facilitador(es) presentes
  - Pauta/tema trabalhado
  - Lista de presença: seleção dos participantes presentes entre os membros do grupo, com possibilidade de registrar justificativa de ausência
  - Síntese/relatório narrativo do encontro
  - Encaminhamentos gerados a partir do encontro
  - Anexos (fotos, documentos digitalizados — formatos permitidos: PDF, JPG, PNG)

#### RF-TG-05 — Histórico de Encontros
- Listar cronologicamente todos os encontros registrados de um grupo
- Exibir taxa de frequência por encontro e frequência acumulada por participante
- Permitir edição de registros de encontros anteriores com log de alteração (quem editou e quando)

#### RF-TG-06 — Lista de Presença Digital
- Exibir lista dos participantes do grupo com checkboxes para marcação de presença
- Permitir salvar como rascunho e confirmar posteriormente
- Gerar automaticamente percentual de frequência de cada participante

#### RF-TG-07 — Encerramento de Grupo
- Fluxo para encerramento formal do grupo com preenchimento de:
  - Data de encerramento
  - Motivo do encerramento
  - Relatório final de encerramento
- Grupo encerrado deve ser arquivado e removido da listagem ativa, permanecendo disponível em consultas históricas

#### RF-TG-08 — Relatório do Grupo
- Gerar relatório do grupo contendo:
  - Dados cadastrais do grupo
  - Lista de participantes (ativos e desligados)
  - Frequência por participante por período
  - Resumo dos encontros realizados
  - Encaminhamentos gerados

---

## 6. Tela de Atendimento Individual

### 6.1 Descrição
Tela central do sistema, destinada ao cadastro e gestão de prontuários individuais de beneficiários, registro de atendimentos e acompanhamento sociofamiliar.

### 6.2 Requisitos Funcionais

#### RF-TIN-01 — Listagem de Beneficiários Individuais
- Exibir lista paginada de beneficiários cadastrados com:
  - Foto (se houver)
  - Nome completo
  - CPF ou NIS
  - Número do prontuário
  - Data do último atendimento
  - Técnico de referência
  - Status (ativo, em acompanhamento, encerrado, transferido)
- Filtros disponíveis: técnico de referência, status, faixa etária, bairro, data do último atendimento, tipo de demanda

#### RF-TIN-02 — Cadastro de Novo Beneficiário
- Formulário dividido em seções:

**Seção 1 — Dados Pessoais (obrigatório)**
  - Nome completo
  - Data de nascimento
  - Sexo (lista: masculino, feminino, não-binário, prefiro não informar)
  - Nome social (opcional)
  - Raça/cor (conforme classificação IBGE)
  - CPF (validação de formato e dígitos verificadores)
  - NIS/PIS
  - RG (número, órgão emissor, UF)
  - Certidão de nascimento ou casamento
  - Naturalidade (município e UF)
  - Nacionalidade

**Seção 2 — Contato e Endereço (obrigatório)**
  - Endereço completo (logradouro, número, complemento, bairro, CEP, município, UF)
  - Telefone(s) de contato (ao menos um obrigatório)
  - E-mail (opcional)
  - Ponto de referência do endereço

**Seção 3 — Composição Familiar**
  - Vínculo com família/grupo familiar cadastrado no sistema (busca por nome ou código familiar)
  - Grau de parentesco com o responsável familiar
  - Possibilidade de cadastrar sem vínculo familiar

**Seção 4 — Situação Socioeconômica**
  - Renda individual declarada
  - Situação de trabalho (empregado formal, informal, desempregado, aposentado, outros)
  - Benefícios recebidos (Bolsa Família, BPC, outros — múltipla seleção)
  - Escolaridade
  - Situação de moradia (própria, alugada, cedida, ocupação, outro)

**Seção 5 — Informações Complementares**
  - Pessoa com deficiência (sim/não; se sim, tipo de deficiência)
  - Situação de saúde relevante
  - Pertencimento a grupos específicos (idoso, criança, adolescente, mulher em situação de violência, pessoa em situação de rua, outros — múltipla seleção)
  - Observações gerais

#### RF-TIN-03 — Prontuário Individual
- Exibir visão consolidada do beneficiário com abas:
  - **Dados Cadastrais**: resumo dos dados de cadastro com botão de edição
  - **Histórico de Atendimentos**: lista cronológica de todos os atendimentos registrados
  - **Encaminhamentos**: lista de encaminhamentos realizados e seus retornos
  - **Documentos**: arquivos anexados ao prontuário
  - **Grupos**: grupos dos quais o indivíduo participa ou participou

#### RF-TIN-04 — Registro de Atendimento Individual
- Formulário para cada novo atendimento com:
  - Data e horário do atendimento
  - Técnico responsável (preenchido automaticamente com o técnico logado, editável)
  - Modalidade (presencial, domiciliar, telefônico, online)
  - Tipo de demanda (espontânea, encaminhada, busca ativa, visita domiciliar)
  - Demanda(s) apresentada(s) (lista predefinida + campo aberto para complemento):
    - Benefícios socioassistenciais
    - Violação de direitos
    - Situação de vulnerabilidade econômica
    - Conflito familiar
    - Saúde mental
    - Documentação
    - Habitação
    - Outros
  - Descrição narrativa do atendimento (campo de texto rico)
  - Encaminhamentos realizados (veja RF-TIN-05)
  - Plano de acompanhamento (indicar se o caso requer acompanhamento continuado)
  - Data do próximo atendimento previsto (opcional)
  - Anexos

#### RF-TIN-05 — Registro de Encaminhamentos
- Dentro ou fora de um atendimento, registrar encaminhamentos com:
  - Serviço/equipamento de destino (lista de serviços da rede socioassistencial cadastrada)
  - Motivo do encaminhamento
  - Data do encaminhamento
  - Técnico responsável pelo encaminhamento
  - Status: aguardando retorno / retorno registrado / cancelado
  - Registro de retorno: resultado do encaminhamento, data, observações

#### RF-TIN-06 — Plano de Acompanhamento Individual / Familiar
- Criar plano de acompanhamento contendo:
  - Objetivos do acompanhamento
  - Metas a serem alcançadas (campo de texto com possibilidade de marcar como concluída)
  - Periodicidade dos atendimentos
  - Data de início e previsão de encerramento
  - Técnico de referência
- Registro de evolução do plano a cada atendimento vinculado

#### RF-TIN-07 — Histórico de Atendimentos
- Exibir lista completa e cronológica de todos os atendimentos com:
  - Data, modalidade, técnico
  - Resumo da demanda atendida
  - Encaminhamentos gerados
  - Link para visualização completa do registro
- Opção de filtrar por período, técnico ou tipo de demanda

#### RF-TIN-08 — Anexos e Documentos
- Anexar arquivos ao prontuário em formatos PDF, JPG e PNG
- Cada anexo deve ter: título/descrição, data de inserção e técnico responsável
- Limite de tamanho por arquivo: 10 MB

#### RF-TIN-09 — Encerramento / Transferência de Caso
- Fluxo de encerramento com campos:
  - Data de encerramento
  - Motivo (demanda atendida, encerramento por desistência, transferência de serviço, transferência de município, outros)
  - Relatório de encerramento
  - Em caso de transferência: serviço/técnico de destino

---

## 7. Requisitos Não Funcionais (Gerais do MVP)

### RNF-01 — Segurança e Privacidade
- Todos os dados de beneficiários são sensíveis e devem ser armazenados com criptografia
- O sistema deve seguir a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018)
- Acesso às informações restrito ao perfil do usuário

### RNF-02 — Log de Auditoria
- Toda ação de criação, edição ou exclusão deve ser registrada em log de auditoria, contendo: usuário, data/hora, ação realizada e dado alterado

### RNF-03 — Responsividade
- O sistema deve funcionar adequadamente em dispositivos desktop, tablets e smartphones

### RNF-04 — Acessibilidade
- Interface deve seguir as diretrizes WCAG 2.1 nível AA

### RNF-05 — Desempenho
- As principais telas devem carregar em até 3 segundos em conexão padrão

### RNF-06 — Backup
- O sistema deve realizar backup automático dos dados a cada 24 horas

---

## 8. Fluxo Geral de Navegação (MVP)

```
[Login]
   │
   ▼
[Tela Inicial — Dashboard]
   │
   ├──► [Atendimento Individual]
   │         ├──► Listar beneficiários
   │         ├──► Novo cadastro
   │         ├──► Prontuário
   │         │       ├──► Registrar atendimento
   │         │       ├──► Encaminhamentos
   │         │       └──► Plano de acompanhamento
   │         └──► Encerrar/Transferir caso
   │
   └──► [Atendimento em Grupo]
             ├──► Listar grupos
             ├──► Novo grupo
             ├──► Detalhe do grupo
             │       ├──► Participantes
             │       ├──► Registrar encontro
             │       └──► Histórico de encontros
             └──► Encerrar grupo
```

---

## 9. Glossário

| Termo | Definição |
|---|---|
| **Beneficiário** | Pessoa física atendida pelo serviço de assistência social |
| **Prontuário** | Conjunto de registros de um indivíduo no sistema |
| **Encaminhamento** | Direcionamento formal do beneficiário a outro serviço da rede |
| **Acompanhamento** | Processo sistemático e periódico de apoio a uma família ou indivíduo |
| **NIS** | Número de Identificação Social (utilizado para benefícios federais) |
| **BPC** | Benefício de Prestação Continuada |
| **CRAS/CREAS** | Equipamentos da política de assistência social pública |

---

*Documento elaborado para fins de desenvolvimento do MVP — versão 1.0*
