// src/components/Tabela.jsx
import React, { useMemo } from 'react';
import dadosCampeonato from '../data/campeonato.json'; 
import { calcularClassificacao, calcularRankingsIndividuais } from '../utils/calculadora';

export default function Tabela() {
    
    const tabelaClassificacao = useMemo(() => calcularClassificacao(dadosCampeonato), []);
    const rankings = useMemo(() => calcularRankingsIndividuais(dadosCampeonato), []);
    
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
                🏆 Campeonato EAFC 26 - Classificação
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