# 🏆 EAFC 26 Wakanta Championship Manager

## 🌟 Visão Geral

Este projeto é uma aplicação web full-stack, desenvolvida para gerenciar e acompanhar a classificação e as estatísticas de um campeonato local de EAFC 26. A arquitetura do projeto foi migrada de um fluxo estático manual para um sistema **"Live Update" dinâmico**, que não requer um banco de dados tradicional.

Utilizando uma **API Serverless** e o **Vercel Blob**, o administrador pode atualizar todos os aspectos do campeonato (times, jogadores, rodadas e resultados) em tempo real, sem a necessidade de novos deploys.

## 🎯 Objetivo do Projeto

O objetivo principal é oferecer uma plataforma centralizada e de fácil acesso para todos os participantes do campeonato, permitindo que eles:

* Visualizem a **Tabela de Classificação** em tempo real.
* Acompanhem as **Estatísticas Individuais** (Artilharia, Assistências e Cartões).
* Tenham acesso ao **Histórico de Partidas** e resultados.

## 💻 Stacks Utilizadas

Este projeto utiliza uma abordagem **"JAMstack"** moderna, combinando um frontend **React** com uma **API Serverless** e um armazenamento em *nuvem*.

| Categoria | Tecnologia | Uso no Projeto |
| :--- | :--- | :--- |
| **Frontend/UI** | **React** (via Vite) | Construção da interface do usuário (tabelas, listas, formulários). |
| **Backend** | **Vercel Serverless** | Uma API Node.js (`api/json-handler.js`) que processa requisições `GET` (leitura) e `POST` (escrita). |
| **Armazenamento** | **Vercel Blob** | O "banco de dados" do projeto. Armazena um único arquivo `campeonato.json` na nuvem. |
| **Hospedagem** | **Vercel** | Hospedagem de custo zero para o aplicativo full-stack (Frontend + API). |

## ✨ Funcionalidades do Projeto

O sistema é dividido em duas áreas: uma **Área Pública (Vitrine)** para todos os participantes e uma **Ferramenta de Admin** para o gerenciador do campeonato.

1. **Área Pública (Visualização)**

    * **Carregamento Dinâmico:** A página busca (`fetch`) os dados mais recentes da API assim que é carregada, garantindo que os dados sejam sempre "ao vivo".

    * 📊 **Tabela de Classificação:** Tabela completa e ordenada. Exibição de: Posição, Time, Pontos (P), Jogos (J), Vitórias (V), Empates (E), Derrotas (D), Gols Pró (GP), Gols Contra (GC), Saldo de Gols (SG) e Últimos 5. Com critérios de desempate avançados (Ponto, Confronto Direto, Vitórias, etc.).

    * ⚽ **Artilharia:** Lista dos principais goleadores do campeonato, mostrando o total de gols e o time de cada jogador.

    * 👟 **Rei das Assistências:** Lista dos jogadores com o maior número de passes para gol.

    * 🟨 **Controle Disciplinar (Cartões Amarelos):** Ranking de jogadores com mais cartões amarelos, facilitando o gerenciamento de suspensões.

    * 🟥 **Controle Disciplinar (Cartões Vermelhos):** Lista de jogadores que receberam cartões vermelhos.

    * **Navegador de Rodadas:** Permite ao usuário navegar por todas as rodadas do campeonato (passadas e futuras) e visualizar os resultados (`3-1`) ou confrontos agendados (`vs`).

2. **Ferramenta de Admin (Gerenciamento "Live Update")**

    O Painel de Gerenciamento (`AdminTool.jsx`) é um **CMS** completo que permite ao administrador controlar 100% do campeonato sem editar arquivos ou fazer novos `deploys`.

    * **Autenticação Segura:** O acesso à rota `/admin` é agora protegido por um sistema de "Segredo Compartilhado" (Shared Secret). O painel só é renderizado após o usuário inserir uma senha mestra, que é armazenada de forma segura nas *Vercel Environment Variables* (`VITE_ADMIN_PASSWORD`). O login persiste no navegador usando `localStorage` para manter o acesso após recarregar a página.

    * **Salvamento Instantâneo:** Qualquer ação no painel (adicionar time, salvar resultado) chama a **API** (`POST /api/json-handler`), que **sobrescreve** o `campeonato.json` no **Vercel Blob**. O site público refletirá as mudanças no próximo recarregamento de página.

    * **Gerenciador de Times:** Permite ao admin **cadastrar novos times** (nome, emblema) diretamente pela interface.

    * **Gerenciador de Jogadores:** Permite ao admin **cadastrar novos jogadores** (ID, nome) e associá-los a um time existente.

    * **Agendador de Rodadas:** Ferramenta para cadastrar rodadas inteiras (múltiplos jogos) de uma só vez. As partidas são salvas como "agendadas" (placar `null`).
    
    * **Lançamento de Resultados:** O admin seleciona uma *partida previamente agendada* em um menu e preenche o placar final e todos os eventos (gols, assistências, cartões).

    * **Reinício do Campeonato:** Uma *"Zona de Perigo"* permite ao administrador **limpar completamente a base de dados** (apagar todos os times, jogadores e partidas) com segurança (após uma dupla confirmação), reiniciando o  `campeonato.json` no Vercel Blob para um estado vazio.

## 🚀 Primeiros Passos (Para Desenvolvedores)

1. Clone este repositório.

2. Instale as dependências: `npm install`

3. **Instale a CLI do Vercel** (necessária para rodar a API localmente): `npm install -g vercel`

4. **Configuração do Vercel:**

    1. Faça o *deploy* inicial do projeto no Vercel.

    2. No painel da Vercel, vá em "Storage" -> "Blob" e crie um novo "Blob Store" (isso irá linkar o token `BLOB_READ_WRITE_TOKEN`).

    3. **Faça o upload manual** do seu `campeonato.json` inicial (pode ser um arquivo com arrays vazios) para o Blob Store.

5. **Inicie o ambiente de desenvolvimento:**

    1. **NÃO** use `npm run dev`.

    2. Execute: `vercel dev`

    3. O `vercel dev` irá rodar o **frontend (Vite)** e o **backend (API)** simultaneamente, conectando-se ao seu Vercel Blob na *nuvem*.

6. Acesse o `localhost` (para ver o `Tabela.jsx`) e o `localhost/admin` (para usar o `AdminTool.jsx`). As alterações feitas no Admin serão salvas "ao vivo" no Blob e refletirão na tabela principal.