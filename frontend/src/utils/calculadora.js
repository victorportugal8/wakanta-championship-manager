// ====================================================================
// FUNÇÃO AUXILIAR: Confronto Direto (Head-to-Head)
// ====================================================================
function compareHeadToHead(teamA, teamB, partidas) {
    let scoreA = 0;
    let scoreB = 0;

    // 1. Filtra apenas as partidas JOGADAS (não nulas) entre os times A e B
    const h2hMatches = partidas.filter(p => 
        p.gols_casa !== null &&
        (
            (p.time_casa_id === teamA.id && p.time_visitante_id === teamB.id) ||
            (p.time_casa_id === teamB.id && p.time_visitante_id === teamA.id)
        )
    );

    // 2. Calcula os pontos apenas nesses jogos (Vitória = 3, Empate = 1)
    h2hMatches.forEach(p => {
        const isAHome = p.time_casa_id === teamA.id;
        
        const golsA = isAHome ? p.gols_casa : p.gols_visitante;
        const golsB = isAHome ? p.gols_visitante : p.gols_casa;

        if (golsA > golsB) {
            scoreA += 3;
        } else if (golsA < golsB) {
            scoreB += 3;
        } else {
            scoreA += 1;
            scoreB += 1;
        }
    });

    return scoreA - scoreB; 
}


// ====================================================================
// FUNÇÃO PRINCIPAL: Cálculo da Classificação
// ====================================================================
export function calcularClassificacao(dados) {
    const timesMap = {};

    // 1. Inicializa as estatísticas e mapeia
    dados.times.forEach(time => {
        timesMap[time.id] = {
            id: time.id,
            nome: time.nome,
            emblema_url: time.emblema_url || 'img/emblemas/default.png',
            P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0,
            ultimosResultados: []
        };
    });

    const partidasOrdenadas = [...dados.partidas].sort((a, b) => {
        if (a.rodada !== b.rodada) {
            return a.rodada - b.rodada; // Ordena pela rodada
        }
        return a.id - b.id; // Desempata pela ID da partida
    });

    // Filtra apenas as partidas que já aconteceram ---
    const partidasJogadas = partidasOrdenadas.filter(p => p.gols_casa !== null);

    // 2. Itera sobre as partidas (ORDENADAS) para somar os resultados
    partidasJogadas.forEach(partida => {
        const casa = timesMap[partida.time_casa_id];
        const visitante = timesMap[partida.time_visitante_id];
        
        if (casa && visitante) {
            casa.J += 1; visitante.J += 1;
            casa.GP += partida.gols_casa; casa.GC += partida.gols_visitante;
            visitante.GP += partida.gols_visitante; visitante.GC += partida.gols_casa;
            
            // Adicionando V, E, D ao array 'ultimosResultados' ---
            if (partida.gols_casa > partida.gols_visitante) {
                casa.V += 1; casa.P += 3; 
                visitante.D += 1; visitante.P += 0;
                
                // Adiciona o resultado da partida
                casa.ultimosResultados.push('V');
                visitante.ultimosResultados.push('D');

            } else if (partida.gols_casa < partida.gols_visitante) {
                visitante.V += 1; visitante.P += 3; 
                casa.D += 1; casa.P += 0;
                
                // Adiciona o resultado da partida
                casa.ultimosResultados.push('D');
                visitante.ultimosResultados.push('V');

            } else {
                casa.E += 1; casa.P += 1; 
                visitante.E += 1; visitante.P += 1;
                
                // Adiciona o resultado da partida
                casa.ultimosResultados.push('E');
                visitante.ultimosResultados.push('E');
            }
        }
    });

    // 3. Finaliza os cálculos (Saldo de Gols e "Fatiar" os últimos 5)
    let tabela = Object.values(timesMap).map(stats => ({
        ...stats,
        SG: stats.GP - stats.GC,
        // Pega APENAS os 5 últimos resultados ---
        ultimosResultados: stats.ultimosResultados.slice(-5) 
    }));

    // 4. Implementação da ordenação
    tabela.sort((a, b) => {
        // 1º CRITÉRIO: Ponto (P)
        if (a.P !== b.P) {
            return b.P - a.P;
        }
        // 2º CRITÉRIO: Confronto Direto (H2H) - SÓ se os pontos forem iguais
        // Usamos 'partidasJogadas' para garantir que H2H não conte jogos futuros
        const h2hResult = compareHeadToHead(a, b, partidasJogadas);
        if (h2hResult !== 0) {
            return h2hResult * -1;
        }
        // 3º CRITÉRIO: Vitórias (V)
        if (a.V !== b.V) {
            return b.V - a.V;
        }
        // 4º CRITÉRIO: Saldo de Gols (SG)
        if (a.SG !== b.SG) {
            return b.SG - a.SG;
        }
        // 5º CRITÉRIO: Gols Pró (GP)
        if (a.GP !== b.GP) {
            return b.GP - a.GP;
        }
        // Último critério
        return a.nome.localeCompare(b.nome);
    });

    return tabela;
}

// ====================================================================
// FUNÇÃO DE RANKING INDIVIDUAL
// ====================================================================
export function calcularRankingsIndividuais(dados) {
    const contagem = {};
    const jogadoresMap = dados.jogadores.reduce((acc, j) => {
        // 1. Encontra o time completo do jogador
        const timeDoJogador = dados.times.find(t => t.id === j.time_id);
        acc[String(j.id)] = { 
            nome: j.nome, 
            timeNome: timeDoJogador?.nome || 'N/A',
            timeEmblema: timeDoJogador?.emblema_url || 'img/emblemas/default.png'
        };
        return acc;
    }, {});

    dados.partidas.forEach(partida => {
        partida.eventos.forEach(evento => {
            const jogadorIdStr = String(evento.jogadorId);
            if (!contagem[jogadorIdStr]) {
                contagem[jogadorIdStr] = { gols: 0, assistencias: 0, cartoesAmarelos: 0, cartoesVermelhos: 0 };
            }
            if (evento.tipo === 'gol') {
                contagem[jogadorIdStr].gols += 1;
            } else if (evento.tipo === 'assistencia') {
                contagem[jogadorIdStr].assistencias += 1;
            } else if (evento.tipo === 'cartao_amarelo') {
                contagem[jogadorIdStr].cartoesAmarelos += 1;
            } else if (evento.tipo === 'cartao_vermelho') {
                contagem[jogadorIdStr].cartoesVermelhos += 1;
            }
        });
    });

    const rankings = Object.keys(contagem).map(jogadorId => ({
        jogadorId,
        ...jogadoresMap[jogadorId],
        gols: contagem[jogadorId].gols,
        assistencias: contagem[jogadorId].assistencias,
        cartoesAmarelos: contagem[jogadorId].cartoesAmarelos,
        cartoesVermelhos: contagem[jogadorId].cartoesVermelhos
    }));

    // Filtra e ordena a artilharia (APENAS jogadores com gols > 0)
    const artilharia = [...rankings]
        .filter(j => j.gols > 0)
        .sort((a, b) => b.gols - a.gols);

    // Filtra e ordena as assistências (APENAS jogadores com assistências > 0)
    const assistencias = [...rankings]
        .filter(j => j.assistencias > 0)
        .sort((a, b) => b.assistencias - a.assistencias);
    
    // Filtra e ordena os cartões amarelos (APENAS jogadores com CA > 0)
    const cartoesAmarelos = [...rankings]
        .filter(j => j.cartoesAmarelos > 0)
        .sort((a, b) => b.cartoesAmarelos - a.cartoesAmarelos);

    // Filtra e ordena os cartões vermelhos (APENAS jogadores com CV > 0)
    const cartoesVermelhos = [...rankings]
        .filter(j => j.cartoesVermelhos > 0)
        .sort((a, b) => b.cartoesVermelhos - a.cartoesVermelhos);

    return { artilharia, assistencias, cartoesAmarelos, cartoesVermelhos };
}