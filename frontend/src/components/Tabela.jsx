// src/components/Tabela.jsx
import React, { useMemo, useState } from 'react';
import dadosCampeonato from '../data/campeonato.json'; 
import { calcularClassificacao, calcularRankingsIndividuais } from '../utils/calculadora';

// Componente de Tabela
export default function Tabela() {
    
    // Cálculos existentes
    const tabelaClassificacao = useMemo(() => calcularClassificacao(dadosCampeonato), [dadosCampeonato]);
    const rankings = useMemo(() => calcularRankingsIndividuais(dadosCampeonato), [dadosCampeonato]);
    
    // --- NOVO: Lógica dos Resultados Recentes ---
    
    // 1. Criar um mapa de times (ID -> Objeto) para consulta rápida
    const timesMap = useMemo(() => {
        return dadosCampeonato.times.reduce((acc, time) => {
            // Agora armazenamos o nome E o emblema (com um padrão)
            acc[time.id] = {
                nome: time.nome, // Ex: {1: "Barcelona", 2: "Real Madrid"}
                emblema_url: time.emblema_url || 'img/emblemas/default.png'
            };
            return acc;
        }, {});
    }, [dadosCampeonato.times]); // Depende apenas dos times

    // // 2. Obter as últimas 5 partidas (as mais recentes)
    // const recentMatches = useMemo(() => {
    //     // Clonamos o array, invertemos (para os mais novos virem primeiro) e pegamos 5
    //     return [...dadosCampeonato.partidas].reverse().slice(0, 5);
    // }, [dadosCampeonato.partidas]); // Depende das partidas

    // --- NOVO: Lógica das Rodadas ---
    
    // 1. Encontrar o número total de rodadas registradas
    const totalRodadas = useMemo(() => {
        if (dadosCampeonato.partidas.length === 0) return 1;
        // Encontra o maior número de rodada no JSON
        return Math.max(...dadosCampeonato.partidas.map(p => p.rodada));
    }, [dadosCampeonato.partidas]);

    // 2. Estado para controlar a rodada selecionada (começa na 1)
    const [rodadaSelecionada, setRodadaSelecionada] = useState(1);

    // 3. Filtrar as partidas SOMENTE da rodada selecionada
    const partidasDaRodada = useMemo(() => {
        return dadosCampeonato.partidas
            .filter(p => p.rodada === rodadaSelecionada)
            .sort((a, b) => a.id - b.id); // Ordena pela ordem de cadastro
    }, [rodadaSelecionada, dadosCampeonato.partidas]);

    // --- NOVO: Função Helper para Destaque da Posição ---
    /**
     * Retorna o elemento JSX (span) correto para a posição,
     * aplicando o estilo de círculo e cor apropriado.
     */
    const getPositionElement = (index) => {
        const position = index + 1; // Converte índice (0-based) para posição (1-based)
        
        if (position >= 1 && position <= 2) {
            // Zona Verde (Pos 1-2)
            return <span className="pos-badge pos-top2">{position}</span>;
        
        } else if (position >= 3 && position <= 6) {
            // Zona Azul (Pos 3-6)
            return <span className="pos-badge pos-next4">{position}</span>;
        
        } else {
            // Posições normais (sem destaque)
            return <span className="pos-normal">{position}</span>;
        }
    };

    // --- NOVO: Função Helper para Resultados Recentes ---
    /**
     * Retorna o elemento JSX (span) para um resultado (V, E, D),
     * aplicando o estilo de círculo e cor apropriado.
     */
    const getResultElement = (resultado, index) => {
        let className = '';
        let title = '';

        switch (resultado) {
            case 'V':
                className = 'result-win'; // Verde
                title = 'Vitória';
                break;
            case 'E':
                className = 'result-draw'; // Cinza
                title = 'Empate';
                break;
            case 'D':
                className = 'result-loss'; // Vermelho
                title = 'Derrota';
                break;
            default:
                className = 'result-draw'; // Padrão cinza
                title = 'Indefinido';
        }

        // Usa 'result-badge' como classe base, similar ao .pos-badge
        return (
            <span key={index} className={`result-badge ${className}`} title={title}>
                {resultado}
            </span>
        );
    };

    // 4. Handlers para os botões
    const handleProximaRodada = () => {
        setRodadaSelecionada(prev => Math.min(prev + 1, totalRodadas));
    };
    const handleRodadaAnterior = () => {
        setRodadaSelecionada(prev => Math.max(prev - 1, 1));
    };

    // --- Renderização do Cabeçalho da Tabela ---
    const renderHeader = (headers) => (
        <thead>
            <tr>
                {headers.map((h, i) => (
                    // As classes serão aplicadas automaticamente pelo CSS global
                    <th key={i}>{h}</th> 
                ))}
            </tr>
        </thead>
    );

    return (
        <div className="container"> {/* Usa a classe container para centralizar */}
            <h1 style={{ textAlign: 'center', borderBottom: '3px solid #00bcd4', paddingBottom: '10px', color: '#00bcd4' }}>
                🏆 Wakanta League EAFC 26 - Classificação
            </h1>

            {/* --- Seção de Tabela de Classificação --- */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Tabela de Classificação</h2>
                <table className="score-table"> {/* Aplica a classe de tabela */}
                    {renderHeader(['Pos', 'Time', 'P', 'J', 'V', 'E', 'D', 'GP', 'GC', 'SG', 'Últimos 5'])}
                    <tbody>
                        {tabelaClassificacao.map((time, index) => (
                            <tr key={time.id}>
                                <td className="col-pos">{getPositionElement(index)}</td>
                                {/* --- ALTERAÇÃO AQUI --- */}
                                <td className="col-time">
                                    <div className="team-cell-container">
                                        <img 
                                            src={time.emblema_url} 
                                            alt={`Emblema do ${time.nome}`}
                                            className="team-emblem" 
                                        />
                                        <span>{time.nome}</span>
                                    </div>
                                </td>
                                {/* --- FIM DA ALTERAÇÃO --- */}
                                {/* <td className="col-time">{time.nome}</td> */}
                                <td className="col-points">{time.P}</td>
                                <td>{time.J}</td>
                                <td>{time.V}</td>
                                <td>{time.E}</td>
                                <td>{time.D}</td>
                                <td>{time.GP}</td>
                                <td>{time.GC}</td>
                                <td className={`col-sg ${time.SG > 0 ? 'positive-sg' : (time.SG < 0 ? 'negative-sg' : '')}`}>
                                    {time.SG}
                                </td>
                                {/* 2. NOVA CÉLULA (TD) PARA OS CÍRCULOS */}
                                <td className="col-form">
                                    <div className="recent-form-container">
                                        {/* Mapeia os últimos 5 resultados.
                                          Usamos .slice(-5) para garantir que sejam APENAS os 5 últimos.
                                        */}
                                        {time.ultimosResultados && time.ultimosResultados.slice(-5).map((res, i) => (
                                            getResultElement(res, i)
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- SUBSTITUÍDO: Seção de Rodadas (no lugar de "Últimos Resultados") --- */}
            <div style={{ marginBottom: '40px' }}>
                
                {/* Navegador de Rodadas */}
                <div className="round-navigator">
                    <button 
                        className="round-btn" 
                        onClick={handleRodadaAnterior}
                        disabled={rodadaSelecionada === 1} // Desabilita no início
                    >
                        &lt; Anterior
                    </button>
                    
                    <h3>Rodada {rodadaSelecionada}</h3>
                    
                    <button 
                        className="round-btn" 
                        onClick={handleProximaRodada}
                        disabled={rodadaSelecionada === totalRodadas} // Desabilita no fim
                    >
                        Próxima &gt;
                    </button>
                </div>
                
                {/* Container dos Cards de Partida (reutilizando o CSS anterior) */}
                <div className="recent-matches-container">
                    {partidasDaRodada.length > 0 ? (
                        partidasDaRodada.map(match => (
                            <div key={match.id} className="match-card">
                                {/* Time da Casa (agora é uma DIV com IMG) */}
                                <div className="team-home">
                                    {/* Usamos ?.nome para segurança */}
                                    <span>{timesMap[match.time_casa_id]?.nome || 'N/A'}</span>
                                    <img 
                                        src={timesMap[match.time_casa_id]?.emblema_url} 
                                        alt="" 
                                        className="match-emblem" 
                                    />
                                </div>
                                
                                <span className="score">
                                    {match.gols_casa} - {match.gols_visitante}
                                </span>
                                
                                {/* Time Visitante (agora é uma DIV com IMG) */}
                                <div className="team-away">
                                    <img 
                                        src={timesMap[match.time_visitante_id]?.emblema_url} 
                                        alt="" 
                                        className="match-emblem" 
                                    />
                                    {/* Usamos ?.nome para segurança */}
                                    <span>{timesMap[match.time_visitante_id]?.nome || 'N/A'}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Mensagem para rodadas futuras (sem jogos cadastrados)
                        <div style={{ color: '#888', textAlign: 'center', gridColumn: '1 / -1' }}>
                            Nenhuma partida registrada para esta rodada.
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '30px' }}>
                
                {/* --- Seção de Artilharia --- */}
                <div style={{ flex: 1 }}>
                    <h2>⚽ Artilharia (Top 10)</h2>
                    <table className="score-table">
                        {renderHeader(['Pos', 'Jogador', 'Time', 'Gols'])}
                        <tbody>
                            {rankings.artilharia.slice(0, 10).map((jogador, index) => (
                                <tr key={jogador.jogadorId}>
                                    <td>{index + 1}</td>
                                    <td>{jogador.nome}</td>
                                    
                                    {/* --- CÉLULA DO EMBLEMA --- */}
                                    <td className="col-ranking-emblem">
                                        <img 
                                            src={jogador.timeEmblema} 
                                            alt={jogador.timeNome}
                                            title={jogador.timeNome} /* Tooltip com nome do time */
                                            className="ranking-emblem"
                                        />
                                    </td>
                                    
                                    <td style={{ color: '#e67e22', fontWeight: 'bold' }}>{jogador.gols}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- Seção de Assistências --- */}
                <div style={{ flex: 1 }}>
                    <h2>👟 Rei das Assistências (Top 10)</h2>
                    <table className="score-table">
                        {renderHeader(['Pos', 'Jogador', 'Time', 'Assists'])}
                        <tbody>
                            {rankings.assistencias.slice(0, 10).map((jogador, index) => (
                                <tr key={jogador.jogadorId}>
                                    <td>{index + 1}</td>
                                    <td>{jogador.nome}</td>
                                    
                                    {/* --- CÉLULA DO EMBLEMA --- */}
                                    <td className="col-ranking-emblem">
                                        <img 
                                            src={jogador.timeEmblema} 
                                            alt={jogador.timeNome}
                                            title={jogador.timeNome} /* Tooltip com nome do time */
                                            className="ranking-emblem"
                                        />
                                    </td>
                                    
                                    <td style={{ color: '#3498db', fontWeight: 'bold' }}>{jogador.assistencias}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}