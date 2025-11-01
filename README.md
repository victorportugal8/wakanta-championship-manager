# 🏆 EAFC 26 Wakanta Championship Manager

## 🌟 Visão Geral

Este projeto é uma aplicação web simples e de código aberto, desenvolvida para gerenciar e acompanhar a classificação e as estatísticas de um campeonato local de EAFC 26 (ou qualquer outro jogo de futebol). A prioridade desta arquitetura é a **simplicidade máxima** e o **custo zero** de hospedagem, utilizando um arquivo JSON como banco de dados estático.

## 🎯 Objetivo do Projeto

O objetivo principal é oferecer uma plataforma centralizada e de fácil acesso para todos os participantes do campeonato, permitindo que eles:

* Visualizem a **Tabela de Classificação** em tempo real (após o *deploy* do Admin).
* Acompanhem as **Estatísticas Individuais** (Artilharia e Assistências).
* Tenham acesso ao **Histórico de Partidas** e resultados.

## 💻 Stacks Utilizadas

Este projeto segue a **Abordagem Simplificada (React + JSON)**, eliminando a necessidade de um servidor de backend ou banco de dados gerenciado.

| Categoria | Tecnologia | Uso no Projeto |
| :--- | :--- | :--- |
| **Frontend/UI** | **React** (via Vite) | Construção da interface do usuário (tabelas, listas, formulários). |
| **Lógica de Dados** | **JavaScript Puro** | Funções no Frontend para fazer todos os cálculos de estatísticas (pontos, saldo, artilharia). |
| **Armazenamento** | **JSON** (Arquivo Estático) | O "banco de dados" do projeto. Armazena times, jogadores e todos os resultados de partidas. |
| **Hospedagem** | **Vercel / Netlify** | Hospedagem de custo zero para o Frontend estático. |

## ✨ Funcionalidades do Projeto

O sistema é dividido em duas áreas: uma **Área Pública (Vitrine)** para todos os participantes e uma **Ferramenta de Admin** para o gerenciador do campeonato.

1. **Área Pública (Visualização)**

    * **Tabela de Classificação:** Tabela completa e ordenada, calculada com base nos resultados do JSON. Exibição de: Posição, Time, Pontos (P), Jogos (J), Vitórias (V), Empates (E), Derrotas (D), Gols Pró (GP), Gols Contra (GC), Saldo de Gols (SG) e Últimos 5. Com critérios de desempate avançados (Ponto, Confronto Direto, Vitórias, etc.).

    * **Artilharia:** Lista dos principais goleadores do campeonato, mostrando o total de gols e o time de cada jogador.

    * **Rei das Assistências:** Lista dos jogadores com o maior número de passes para gol.

    * **Navegador de Rodadas:** Permite ao usuário navegar por todas as rodadas do campeonato (passadas e futuras) e visualizar os resultados de cada partida daquela rodada.

2. **Ferramenta de Admin (Gerenciamento Manual)**

    O Painel de Gerenciamento (`AdminTool.jsx`) é uma ferramenta central para gerenciar todo o ciclo de vida do campeonato. Ela foi estruturada em um fluxo de trabalho profissional dividido em duas seções principais:

    * **Agendador de Rodadas:**
        
        * Permite ao administrador cadastrar rodadas inteiras (múltiplos jogos) de uma só vez (modo "bulk insert").

        * As partidas são salvas no sistema como "agendadas" (com placar `null`), permitindo que a tabela de rodadas do site mostre jogos futuros ("vs").
    
    * **Lançamento de Resultados:**
        
        * O admin seleciona uma partida *previamente agendada* (que ainda não tem placar) em um menu.

        * Permite preencher o placar final e adicionar todos os eventos detalhados da partida (gols, assistências, cartões).

        * O sistema **atualiza** a partida existente em vez de criar uma nova.

    * **Geração de JSON:** Qualquer ação no painel (seja agendar ou lançar resultado) gera uma nova versão do arquivo `campeonato.json`.

    * **Pré-visualização Imediata:** Após gerar o JSON, o admin vê uma pré-visualização completa e estilizada da tabela de classificação e dos rankings (artilharia, assistências), permitindo validar 100% dos dados antes de publicá-los.

    * **Atualização do Site:** O Administrador deve:
        1. Clicar em **"Fazer Download"** para salvar o novo arquivo `campeonato.json` gerado.
        2. **Substituir manualmente** o arquivo `src/data/campeonato.json` no projeto local.
        3. Realizar o *commit* e *deploy* para atualizar o site para o público.

## 🚀 Primeiros Passos (Para Desenvolvedores)

1. Clone este repositório.

2. Instale as dependências: `npm install`

3. Inicie o ambiente de desenvolvimento: `npm run dev`

4. Acesse e edite o arquivo `src/data/campeonato.json` com os dados iniciais dos times.

5. Para atualizar o site, utilize a Ferramenta de Admin localmente, **baixe o novo JSON**, e faça o *deploy* para o seu serviço de hospedagem (Vercel/Netlify).