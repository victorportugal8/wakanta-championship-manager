const PONTOS_VITORIA = 3;
const PONTOS_EMPATE = 1;
const PONTOS_DERROTA = 0;

export function calcularClassificacao(dados){
    const timesMap = {};

    // 1. Inicializa as estatísticas de todos os times
    dados.times.forEach(time => {
        timesMap[time.id] = {
            id: time.id,
            nome: time.nome,
            P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0
        };
    });

    // 2. Itera sobre as partidas para somar os resultados
    dados.partidas.forEach(partida => {
        const casa = timesMap[partida.time_casa_id];
        const visitante = timesMap[partida.time_visitante_id];
        
        // Atualiza jogos, gols pró e contra
        casa.J += 1;
        visitante.J += 1;
        casa.GP += partida.gols_casa;
        casa.GC += partida.gols_visitante;
        visitante.GP += partida.gols_visitante;
        visitante.GC += partida.gols_casa;
        
        // Define V, E, D e PONTOS
        if (partida.gols_casa > partida.gols_visitante) {
            // Vitória Casa
            casa.V += 1; casa.P += PONTOS_VITORIA;
            visitante.D += 1; visitante.P += PONTOS_DERROTA;
        } else if (partida.gols_casa < partida.gols_visitante) {
            // Vitória Visitante
            visitante.V += 1; visitante.P += PONTOS_VITORIA;
            casa.D += 1; casa.P += PONTOS_DERROTA;
        } else {
            // Empate
            casa.E += 1; casa.P += PONTOS_EMPATE;
            visitante.E += 1; visitante.P += PONTOS_EMPATE;
        }
    });

    // 3. Finaliza os cálculos (Saldo de Gols) e converte para lista
    let tabela = Object.values(timesMap).map(stats => ({
        ...stats,
        SG: stats.GP - stats.GC 
    }));

    // 4. Ordena a tabela: 1º Pontos, 2º Saldo, 3º Gols Pró
    tabela.sort((a, b) => {
        if (a.P !== b.P) return b.P - a.P; // Pontos (maior para menor)
        if (a.V !== b.V) return b.V - a.V; // Vitórias
        if (a.SG !== b.SG) return b.SG - a.SG; // Saldo de Gols
        return b.GP - a.GP; // Gols Pró
    });

    return tabela; 
}

// Função para simplificar a exibição dos eventos (ex: "3 Gols (PlayerA)")
export function calcularEventos(dados) {
    const eventos = {};
    dados.partidas.forEach(partida => {
        partida.eventos.forEach(evento => {
            eventos[evento.jogador_id] = (eventos[evento.jogador_id] || 0) + 1;
        });
    });
    return eventos;
}