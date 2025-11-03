import React, { useMemo, useState, useEffect } from 'react';
import { calcularClassificacao, calcularRankingsIndividuais } from '../utils/calculadora';

// Helper de Posição (Pode ficar fora do componente)
const getPositionElement = (index) => {
    const position = index + 1;
    if (position >= 1 && position <= 2) {
        return <span className="pos-badge pos-top2">{position}</span>;
    } else if (position >= 3 && position <= 6) {
        return <span className="pos-badge pos-next4">{position}</span>;
    } else {
        return <span className="pos-normal">{position}</span>;
    }
};

// Helper de Resultado (Pode ficar fora do componente)
const getResultElement = (resultado, index) => {
    let className = '';
    let title = '';
    switch (resultado) {
        case 'V': className = 'result-win'; title = 'Vitória'; break;
        case 'E': className = 'result-draw'; title = 'Empate'; break;
        case 'D': className = 'result-loss'; title = 'Derrota'; break;
        default: className = 'result-draw'; title = 'Indefinido';
    }
    return (
        <span key={index} className={`result-badge ${className}`} title={title}>
            {resultado}
        </span>
    );
};

// Helper de Cabeçalho (Pode ficar fora do componente)
const renderHeader = (headers) => (
    <thead>
        <tr>
            {headers.map((h, i) => (<th key={i}>{h}</th>))}
        </tr>
    </thead>
);


// --- COMPONENTE PRINCIPAL ---
export default function Tabela() {
    
    // --- 1. TODOS OS HOOKS DECLARADOS AQUI ---
    
    // Estados de dados e carregamento
    const [dadosCampeonato, setDadosCampeonato] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estado da rodada (também é um Hook)
    const [rodadaSelecionada, setRodadaSelecionada] = useState(1);

    // Hook de Efeito para buscar dados
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Usa a API de teste 'bypass' ainda
                const response = await fetch('/api/json-handler'); 
                if (!response.ok) {
                    throw new Error(`Falha ao buscar dados: ${response.statusText}`);
                }
                const data = await response.json();
                setDadosCampeonato(data); 
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false); 
            }
        };
        fetchData();
    }, []); // Array vazio, roda uma vez

    // Hooks 'useMemo' para cálculos (com 'guardas' internas)
    const tabelaClassificacao = useMemo(() => {
        if (!dadosCampeonato) return []; // Guarda
        return calcularClassificacao(dadosCampeonato);
    }, [dadosCampeonato]);

    const rankings = useMemo(() => {
        if (!dadosCampeonato) return { artilharia: [], assistencias: [], cartoesAmarelos: [], cartoesVermelhos: [] }; // Guarda
        return calcularRankingsIndividuais(dadosCampeonato);
    }, [dadosCampeonato]);

    const timesMap = useMemo(() => {
        if (!dadosCampeonato) return {}; // Guarda
        return dadosCampeonato.times.reduce((acc, time) => {
            acc[time.id] = {
                nome: time.nome,
                emblema_url: time.emblema_url || 'img/emblemas/default.png'
            };
            return acc;
        }, {});
    }, [dadosCampeonato]);

    const totalRodadas = useMemo(() => {
        if (!dadosCampeonato || dadosCampeonato.partidas.length === 0) return 1; // Guarda
        return Math.max(...dadosCampeonato.partidas.map(p => p.rodada));
    }, [dadosCampeonato]);
    
    const partidasDaRodada = useMemo(() => {
        if (!dadosCampeonato) return []; // Guarda
        return dadosCampeonato.partidas
            .filter(p => p.rodada === rodadaSelecionada)
            .sort((a, b) => a.id - b.id);
    }, [rodadaSelecionada, dadosCampeonato]);


    // --- 2. RETORNOS CONDICIONAIS ---
    if (loading) {
        return <div className="container" style={{ textAlign: 'center', color: '#00bcd4' }}><h2>Carregando dados do campeonato...</h2></div>;
    }
    if (error) {
        return <div className="container" style={{ textAlign: 'center', color: '#ff5252' }}><h2>Erro ao carregar: {error}</h2></div>;
    }
    if (!dadosCampeonato) {
         return <div className="container" style={{ textAlign: 'center', color: '#777' }}><h2>Dados não encontrados.</h2></div>;
    }

    // --- 3. Handlers de Botão (Não são Hooks) ---
    const handleProximaRodada = () => {
        setRodadaSelecionada(prev => Math.min(prev + 1, totalRodadas));
    };
    const handleRodadaAnterior = () => {
        setRodadaSelecionada(prev => Math.max(prev - 1, 1));
    };
    

    // --- 4. RENDERIZAÇÃO PRINCIPAL ---
    return (
        <div className="container">
            <h1 style={{ textAlign: 'center', borderBottom: '3px solid #00bcd4', paddingBottom: '10px', color: '#00bcd4' }}>
                🏆 Wakanta League EAFC 26 - Classificação
            </h1>

            {/* --- Seção de Tabela de Classificação --- */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Tabela de Classificação</h2>
                <div className="table-responsive-wrapper">
                    <table className="score-table">
                        {renderHeader(['Pos', 'Time', 'P', 'J', 'V', 'E', 'D', 'GP', 'GC', 'SG', 'Últimos 5'])}
                        <tbody>
                            {tabelaClassificacao.map((time, index) => (
                                <tr key={time.id}>
                                    <td className="col-pos">{getPositionElement(index)}</td>
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
                                    <td className="col-form">
                                        <div className="recent-form-container">
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
            </div>

            {/* --- Seção de Rodadas --- */}
            <div style={{ marginBottom: '40px' }}>
                
                {/* Navegador de Rodadas */}
                <div className="round-navigator">
                    <button 
                        className="round-btn" 
                        onClick={handleRodadaAnterior}
                        disabled={rodadaSelecionada === 1}
                    >
                        &lt; Anterior
                    </button>
                    
                    <h3>Rodada {rodadaSelecionada}</h3>
                    
                    <button 
                        className="round-btn" 
                        onClick={handleProximaRodada}
                        disabled={rodadaSelecionada === totalRodadas}
                    >
                        Próxima &gt;
                    </button>
                </div>
                
                {/* Container dos Cards de Partida */}
                <div className="recent-matches-container">
                    {partidasDaRodada.length > 0 ? (
                        partidasDaRodada.map(match => (
                            <div key={match.id} className="match-card">
                                <div className="team-home">
                                    <span>{timesMap[match.time_casa_id]?.nome || 'N/A'}</span>
                                    <img 
                                        src={timesMap[match.time_casa_id]?.emblema_url} 
                                        alt="" 
                                        className="match-emblem" 
                                    />
                                </div>
                                <span className={`score ${match.gols_casa === null ? 'score-scheduled' : ''}`}>
                                    {match.gols_casa !== null
                                        ? `${match.gols_casa} - ${match.gols_visitante}`
                                        : 'vs'
                                    }
                                </span>
                                <div className="team-away">
                                    <img 
                                        src={timesMap[match.time_visitante_id]?.emblema_url} 
                                        alt="" 
                                        className="match-emblem" 
                                    />
                                    <span>{timesMap[match.time_visitante_id]?.nome || 'N/A'}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ color: '#888', textAlign: 'center', gridColumn: '1 / -1' }}>
                            Nenhuma partida registrada para esta rodada.
                        </div>
                    )}
                </div>
            </div>

            {/* --- Rankings de Gols e Assistências --- */}
            <div className="rankings-grid" style={{ display: 'flex', justifyContent: 'space-between', gap: '30px' }}>
                
                {/* Artilharia */}
                <div style={{ flex: 1 }}>
                    <h2>⚽ Artilharia (Top 10)</h2>
                    <table className="score-table">
                        {renderHeader(['Pos', 'Jogador', 'Time', 'Gols'])}
                        <tbody>
                            {rankings.artilharia.slice(0, 10).map((jogador, index) => (
                                <tr key={jogador.jogadorId}>
                                    <td>{index + 1}</td>
                                    <td>{jogador.nome}</td>
                                    <td className="col-ranking-emblem">
                                        <img 
                                            src={jogador.timeEmblema} 
                                            alt={jogador.timeNome}
                                            title={jogador.timeNome}
                                            className="ranking-emblem"
                                        />
                                    </td>
                                    <td style={{ color: '#e67e22', fontWeight: 'bold' }}>{jogador.gols}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Assistências */}
                <div style={{ flex: 1 }}>
                    <h2>👟 Rei das Assistências (Top 10)</h2>
                    <table className="score-table">
                        {renderHeader(['Pos', 'Jogador', 'Time', 'ast'])}
                        <tbody>
                            {rankings.assistencias.slice(0, 10).map((jogador, index) => (
                                <tr key={jogador.jogadorId}>
                                    <td>{index + 1}</td>
                                    <td>{jogador.nome}</td>
                                    <td className="col-ranking-emblem">
                                        <img 
                                            src={jogador.timeEmblema} 
                                            alt={jogador.timeNome}
                                            title={jogador.timeNome}
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

            {/* --- Rankings de Cartões --- */}
            <div className="rankings-grid" style={{ display: 'flex', justifyContent: 'space-between', gap: '30px', marginTop: '40px' }}>
                
                {/* Cartões Amarelos */}
                <div style={{ flex: 1 }}>
                    <h2>🟨 Cartões Amarelos</h2>
                    <table className="score-table">
                        {renderHeader(['Pos', 'Jogador', 'Time', 'CA'])}
                        <tbody>
                            {rankings.cartoesAmarelos.slice(0, 10).map((jogador, index) => (
                                <tr key={jogador.jogadorId}>
                                    <td>{index + 1}</td>
                                    <td>{jogador.nome}</td>
                                    <td className="col-ranking-emblem">
                                        <img 
                                            src={jogador.timeEmblema} 
                                            alt={jogador.timeNome}
                                            title={jogador.timeNome}
                                            className="ranking-emblem"
                                        />
                                    </td>
                                    <td className="col-yellow-cards">
                                        {jogador.cartoesAmarelos}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Cartões Vermelhos */}
                <div style={{ flex: 1 }}>
                    <h2>🟥 Cartões Vermelhos</h2>
                    <table className="score-table">
                        {renderHeader(['Pos', 'Jogador', 'Time', 'CV'])}
                        <tbody>
                            {rankings.cartoesVermelhos.slice(0, 10).map((jogador, index) => (
                                <tr key={jogador.jogadorId}>
                                    <td>{index + 1}</td>
                                    <td>{jogador.nome}</td>
                                    <td className="col-ranking-emblem">
                                        <img 
                                            src={jogador.timeEmblema} 
                                            alt={jogador.timeNome}
                                            title={jogador.timeNome}
                                            className="ranking-emblem"
                                        />
                                    </td>
                                    <td className="col-red-cards">
                                        {jogador.cartoesVermelhos}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}