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
    
    // 1. Criar um mapa de times (ID -> Nome) para consulta rápida
    const timesMap = useMemo(() => {
        return dadosCampeonato.times.reduce((acc, time) => {
            acc[time.id] = time.nome; // Ex: {1: "Time Alpha", 2: "Time Beta"}
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
                    {renderHeader(['Pos', 'Time', 'P', 'J', 'V', 'E', 'D', 'GP', 'GC', 'SG'])}
                    <tbody>
                        {tabelaClassificacao.map((time, index) => (
                            <tr key={time.id}>
                                <td className="col-pos">{index + 1}</td>
                                <td className="col-time">{time.nome}</td>
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
                                <span className="team-home">
                                    {timesMap[match.time_casa_id] || 'N/A'}
                                </span>
                                
                                <span className="score">
                                    {match.gols_casa} - {match.gols_visitante}
                                </span>
                                
                                <span className="team-away">
                                    {timesMap[match.time_visitante_id] || 'N/A'}
                                </span>
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
                                    <td>{jogador.time}</td>
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
                                    <td>{jogador.time}</td>
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