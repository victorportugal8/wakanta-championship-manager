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

## ✨ Funcionalidades do Projeto

O sistema é dividido em duas áreas: uma **Área Pública (Vitrine)** para todos os participantes e uma **Ferramenta de Admin** para o gerenciador do campeonato.

1. **Área Pública (Visualização)**

    * **Tabela de Classificação:** Tabela completa e ordenada, calculada com base nos resultados do JSON. Exibição de: Posição, Time, Pontos (P), Jogos (J), Vitórias (V), Empates (E), Derrotas (D), Gols Pró (GP), Gols Contra (GC) e Saldo de Gols (SG).

    * **Artilharia:** Lista dos principais goleadores do campeonato, mostrando o total de gols e o time de cada jogador.

    * **Rei das Assistências:** Lista dos jogadores com o maior número de passes para gol.

    * **Resultados Recentes:** Visualização do placar final e dos eventos (gols/assistências) das últimas partidas cadastradas.

2. **Ferramenta de Admin (Gerenciamento Manual)**

    A Ferramenta de Admin é uma seção do React acessível apenas ao administrador, que permite:

    * **Entrada de Resultados:** Formulário para registrar novos resultados de partidas, gols, assistências e cartões.

    * **Geração do JSON:** Após inserir um novo resultado, a ferramenta utiliza a lógica JavaScript para:

        1. Ler o JSON atual.

        2. Adicionar o novo resultado ao histórico.

        3. **Gerar a nova string JSON completa e atualizada.**

    * **Atualização do Site:** O Administrador deve copiar a string JSON gerada e **colar manualmente** no arquivo `src/data/dadosCampeonato.json` do projeto local, seguido de um commit e deploy para atualizar o site para o público.

## 🚀 Primeiros Passos (Para Desenvolvedores)

1. Clone este repositório.

2. Instale as dependências: `npm install`

3. Inicie o ambiente de desenvolvimento: `npm run dev`

4. Acesse e edite o arquivo `src/data/dadosCampeonato.json` com os dados iniciais dos times.

5. Para atualizar o site, utilize a Ferramenta de Admin localmente, obtenha o novo JSON e faça o *deploy* para o seu serviço de hospedagem (Vercel/Netlify).