// // ====================================================================
// // FUNÇÃO AUXILIAR: Confronto Direto (Head-to-Head)
// // Compara dois times com base apenas nos jogos que fizeram entre si.
// // Retorna um valor: A > B (> 0), B > A (< 0), Empate (= 0)
// // ====================================================================
// function compareHeadToHead(teamA, teamB, partidas) {
//     let scoreA = 0;
//     let scoreB = 0;

//     // 1. Filtra apenas as partidas jogadas entre os times A e B
//     const h2hMatches = partidas.filter(p => 
//         (p.time_casa_id === teamA.id && p.time_visitante_id === teamB.id) ||
//         (p.time_casa_id === teamB.id && p.time_visitante_id === teamA.id)
//     );

//     // 2. Calcula os pontos apenas nesses jogos (Vitória = 3, Empate = 1)
//     h2hMatches.forEach(p => {
//         const isAHome = p.time_casa_id === teamA.id;
        
//         // Define os gols de A e B, independentemente se A jogou em casa ou fora
//         const golsA = isAHome ? p.gols_casa : p.gols_visitante;
//         const golsB = isAHome ? p.gols_visitante : p.gols_casa;

//         if (golsA > golsB) {
//             scoreA += 3; // Vitória de A
//         } else if (golsA < golsB) {
//             scoreB += 3; // Vitória de B
//         } else {
//             scoreA += 1; // Empate
//             scoreB += 1; // Empate
//         }
//     });

//     // Retorna a diferença de pontos H2H (b.score - a.score é feito na função sort)
//     return scoreA - scoreB; 
// }


// // ====================================================================
// // FUNÇÃO PRINCIPAL: Cálculo da Classificação
// // ====================================================================
// export function calcularClassificacao(dados) {
//     const timesMap = {};

//     // 1. Inicializa as estatísticas e mapeia
//     dados.times.forEach(time => {
//         timesMap[time.id] = {
//             id: time.id,
//             nome: time.nome,
//             P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0
//         };
//     });

//     // 2. Itera sobre as partidas para somar os resultados
//     dados.partidas.forEach(partida => {
//         const casa = timesMap[partida.time_casa_id];
//         const visitante = timesMap[partida.time_visitante_id];
        
//         if (casa && visitante) {
//             // ... (Lógica de contagem de J, GP, GC, V, E, D e PONTOS permanece inalterada) ...
//             casa.J += 1; visitante.J += 1;
//             casa.GP += partida.gols_casa; casa.GC += partida.gols_visitante;
//             visitante.GP += partida.gols_visitante; visitante.GC += partida.gols_casa;
            
//             if (partida.gols_casa > partida.gols_visitante) {
//                 casa.V += 1; casa.P += 3; visitante.D += 1; visitante.P += 0;
//             } else if (partida.gols_casa < partida.gols_visitante) {
//                 visitante.V += 1; visitante.P += 3; casa.D += 1; casa.P += 0;
//             } else {
//                 casa.E += 1; casa.P += 1; visitante.E += 1; visitante.P += 1;
//             }
//         }
//     });

//     // 3. Finaliza os cálculos (Saldo de Gols)
//     let tabela = Object.values(timesMap).map(stats => ({
//         ...stats,
//         SG: stats.GP - stats.GC 
//     }));

//     // 4. Implementação da NOVA regra de ordenação
//     tabela.sort((a, b) => {
//         // 1º CRITÉRIO: Ponto (P)
//         if (a.P !== b.P) {
//             return b.P - a.P; // Descendente (Maior pontuação primeiro)
//         }

//         // 2º CRITÉRIO: Confronto Direto (H2H) - SÓ se os pontos forem iguais
//         const h2hResult = compareHeadToHead(a, b, dados.partidas);
//         if (h2hResult !== 0) {
//             return h2hResult * -1; // Multiplicamos por -1 para ordenar descendente (A > B se h2hResult > 0)
//         }
//         // Nota: Em ligas com mais de 2 times empatados, a regra H2H é mais complexa,
//         // mas para o .sort() de 2 times, esta lógica é suficiente.

//         // 3º CRITÉRIO: Vitórias (V)
//         if (a.V !== b.V) {
//             return b.V - a.V;
//         }

//         // 4º CRITÉRIO: Saldo de Gols (SG)
//         if (a.SG !== b.SG) {
//             return b.SG - a.SG;
//         }

//         // 5º CRITÉRIO: Gols Pró (GP)
//         if (a.GP !== b.GP) {
//             return b.GP - a.GP;
//         }
        
//         // Último critério (desempate final)
//         return a.nome.localeCompare(b.nome);
//     });

//     return tabela;
// }


// // ====================================================================
// // FUNÇÃO DE RANKING INDIVIDUAL (Permanece inalterada)
// // ====================================================================
// export function calcularRankingsIndividuais(dados) {
//     // ... (Código original para Artilharia e Assistências)
//     const contagem = {};

//     const jogadoresMap = dados.jogadores.reduce((acc, j) => {
//         acc[j.id] = { nome: j.nome, time: dados.times.find(t => t.id === j.time_id)?.nome || 'N/A' };
//         return acc;
//     }, {});

//     dados.partidas.forEach(partida => {
//         partida.eventos.forEach(evento => {
//             if (!contagem[evento.jogadorId]) {
//                 contagem[evento.jogadorId] = { gols: 0, assistencias: 0 };
//             }

//             if (evento.tipo === 'gol') {
//                 contagem[evento.jogadorId].gols += 1;
//             } else if (evento.tipo === 'assistencia') {
//                 contagem[evento.jogadorId].assistencias += 1;
//             }
//         });
//     });

//     const rankings = Object.keys(contagem).map(jogadorId => ({
//         jogadorId,
//         ...jogadoresMap[jogadorId],
//         gols: contagem[jogadorId].gols,
//         assistencias: contagem[jogadorId].assistencias
//     }));

//     const artilharia = [...rankings].sort((a, b) => b.gols - a.gols);
//     const assistencias = [...rankings].sort((a, b) => b.assistencias - a.assistencias);

//     return { artilharia, assistencias };
// }

// ====================================================================
// FUNÇÃO AUXILIAR: Confronto Direto (Head-to-Head)
// (Esta função permanece 100% INALTERADA)
// ====================================================================
function compareHeadToHead(teamA, teamB, partidas) {
    let scoreA = 0;
    let scoreB = 0;

    // 1. Filtra apenas as partidas jogadas entre os times A e B
    const h2hMatches = partidas.filter(p => 
        (p.time_casa_id === teamA.id && p.time_visitante_id === teamB.id) ||
        (p.time_casa_id === teamB.id && p.time_visitante_id === teamA.id)
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
            P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0,
            ultimosResultados: [] // <-- MUDANÇA 1: Array inicializado
        };
    });

    // --- MUDANÇA 2: Ordenar as partidas cronologicamente ---
    // Isso garante que os "últimos resultados" sejam adicionados na ordem correta
    const partidasOrdenadas = [...dados.partidas].sort((a, b) => {
        if (a.rodada !== b.rodada) {
            return a.rodada - b.rodada; // Ordena pela rodada
        }
        return a.id - b.id; // Desempata pela ID da partida
    });


    // 2. Itera sobre as partidas (ORDENADAS) para somar os resultados
    //    (Usamos 'partidasOrdenadas' em vez de 'dados.partidas')
    partidasOrdenadas.forEach(partida => { // <-- MUDANÇA 3: Usando o array ordenado
        const casa = timesMap[partida.time_casa_id];
        const visitante = timesMap[partida.time_visitante_id];
        
        if (casa && visitante) {
            // ... (Lógica de J, GP, GC permanece inalterada) ...
            casa.J += 1; visitante.J += 1;
            casa.GP += partida.gols_casa; casa.GC += partida.gols_visitante;
            visitante.GP += partida.gols_visitante; visitante.GC += partida.gols_casa;
            
            // --- MUDANÇA 4: Adicionando V, E, D ao array 'ultimosResultados' ---
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
        // --- MUDANÇA 5: Pega APENAS os 5 últimos resultados ---
        // Assim, o React não precisa fazer o .slice()
        ultimosResultados: stats.ultimosResultados.slice(-5) 
    }));

    // 4. Implementação da ordenação (INALTERADA)
    tabela.sort((a, b) => {
        // 1º CRITÉRIO: Ponto (P)
        if (a.P !== b.P) {
            return b.P - a.P;
        }
        // 2º CRITÉRIO: Confronto Direto (H2H)
        const h2hResult = compareHeadToHead(a, b, dados.partidas);
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
// FUNÇÃO DE RANKING INDIVIDUAL (Permanece 100% INALTERADA)
// ====================================================================
export function calcularRankingsIndividuais(dados) {
    // ... (Código original para Artilharia e Assistências)
    const contagem = {};

    const jogadoresMap = dados.jogadores.reduce((acc, j) => {
        acc[j.id] = { nome: j.nome, time: dados.times.find(t => t.id === j.time_id)?.nome || 'N/A' };
        return acc;
    }, {});

    dados.partidas.forEach(partida => {
        partida.eventos.forEach(evento => {
            if (!contagem[evento.jogadorId]) {
                contagem[evento.jogadorId] = { gols: 0, assistencias: 0 };
            }

            if (evento.tipo === 'gol') {
                contagem[evento.jogadorId].gols += 1;
            } else if (evento.tipo === 'assistencia') {
                contagem[evento.jogadorId].assistencias += 1;
            }
        });
    });

    const rankings = Object.keys(contagem).map(jogadorId => ({
        jogadorId,
        ...jogadoresMap[jogadorId],
        gols: contagem[jogadorId].gols,
        assistencias: contagem[jogadorId].assistencias
    }));

    const artilharia = [...rankings].sort((a, b) => b.gols - a.gols);
    const assistencias = [...rankings].sort((a, b) => b.assistencias - a.assistencias);

    return { artilharia, assistencias };
}