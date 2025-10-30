import React, { useState } from 'react';
// Importa os dados antigos diretamente (pode ser o que está na sua pasta data/)
import dadosAntigos from '../data/campeonato.json'; 
import { calcularClassificacao } from '../utils/calculadora';

// Componente principal da ferramenta de administração
export default function AdminTool() {
    
    // Lista de times e jogadores para popular os selects
    const times = dadosAntigos.times;
    const jogadores = dadosAntigos.jogadores;

    // Estado para os dados da nova partida (Formulário)
    const [matchData, setMatchData] = useState({
        timeCasaId: times[0]?.id.toString() || '',
        timeVisitanteId: times[1]?.id.toString() || '',
        golsCasa: 0,
        golsVisitante: 0,
        eventos: [], // Array de objetos {jogadorId, tipo, minuto}
    });

    // Estados para a saída e pré-visualização
    const [jsonGerado, setJsonGerado] = useState('');
    const [tabelaTeste, setTabelaTeste] = useState(null);
    const [novoEvento, setNovoEvento] = useState({ 
        jogadorId: jogadores[0]?.id || '', 
        tipo: 'gol', 
        minuto: 45 
    });

    // --- Lógica de Geração do Novo JSON ---
    const generateNewJson = (newMatch) => {
        // 1. Clonar os dados antigos para evitar modificá-los diretamente
        const novosDados = JSON.parse(JSON.stringify(dadosAntigos));
        
        // 2. Definir o ID da nova partida (último ID + 1)
        const ultimoId = novosDados.partidas.length > 0
            ? novosDados.partidas[novosDados.partidas.length - 1].id
            : 0;
        const proximoId = ultimoId + 1;
        
        // 3. Montar o objeto da nova partida
        const novoMatchObjeto = {
            id: proximoId,
            time_casa_id: parseInt(newMatch.timeCasaId),
            time_visitante_id: parseInt(newMatch.timeVisitanteId),
            gols_casa: parseInt(newMatch.golsCasa),
            gols_visitante: parseInt(newMatch.golsVisitante),
            data_partida: new Date().toISOString().slice(0, 10),
            // Adicionar o ID da partida aos eventos
            eventos: newMatch.eventos.map(e => ({ ...e, partida_id: proximoId }))
        };
        
        // 4. Adicionar a nova partida ao histórico
        novosDados.partidas.push(novoMatchObjeto);
        
        // 5. Retornar a string JSON formatada (indentação de 2 espaços)
        return JSON.stringify(novosDados, null, 2);
    };

    // --- Handlers de Formulário ---

    const handleMatchChange = (e) => {
        const { name, value } = e.target;
        setMatchData(prev => ({ ...prev, [name]: value }));
    };

    const handleNewEventChange = (e) => {
        const { name, value } = e.target;
        setNovoEvento(prev => ({ ...prev, [name]: value }));
    };

    const handleAddEvent = () => {
        if (novoEvento.jogadorId && novoEvento.tipo) {
            setMatchData(prev => ({ 
                ...prev, 
                eventos: [...prev.eventos, novoEvento] 
            }));
            // Resetar o formulário de evento para o próximo
            setNovoEvento({ 
                jogadorId: jogadores[0]?.id || '', 
                tipo: 'gol', 
                minuto: '' 
            });
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // 1. Gera a nova string JSON
        const novaStringJson = generateNewJson(matchData);
        setJsonGerado(novaStringJson);
        
        // 2. Pré-visualiza o resultado (apenas para teste)
        try {
            const novosDadosObjeto = JSON.parse(novaStringJson);
            const tabelaCalculada = calcularClassificacao(novosDadosObjeto);
            setTabelaTeste(tabelaCalculada);
        } catch (error) {
            console.error("Erro na pré-visualização:", error);
            setTabelaTeste([{ nome: "Erro ao Calcular", J: 0, P: 0 }]);
        }

        alert('✅ NOVO JSON GERADO! Copie o conteúdo abaixo.');
    };

    // --- Renderização do Componente ---
    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1>⚽ Ferramenta de Administração (EAFC 26)</h1>
            <p><strong>Atenção:</strong> Esta ferramenta *não* salva dados no servidor. Ela gera o novo arquivo JSON para você copiar e substituir manualmente no seu projeto.</p>
            
            <h2>1. Registrar Nova Partida</h2>
            <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                
                {/* Detalhes da Partida */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Time da Casa:</label>
                    <select name="timeCasaId" value={matchData.timeCasaId} onChange={handleMatchChange}>
                        {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                    </select>
                    vs. 
                    <label style={{ marginLeft: '20px' }}>Time Visitante:</label>
                    <select name="timeVisitanteId" value={matchData.timeVisitanteId} onChange={handleMatchChange}>
                        {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Placar Final:</label>
                    <input type="number" name="golsCasa" value={matchData.golsCasa} onChange={handleMatchChange} min="0" style={{ width: '50px' }} />
                    -
                    <input type="number" name="golsVisitante" value={matchData.golsVisitante} onChange={handleMatchChange} min="0" style={{ width: '50px' }} />
                </div>
                
                {/* Seção de Eventos */}
                <h3>Eventos (Gols, Assistências, Cartões)</h3>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', borderBottom: '1px dotted #eee', paddingBottom: '10px' }}>
                    <select name="jogadorId" value={novoEvento.jogadorId} onChange={handleNewEventChange}>
                        <option value="">-- Jogador --</option>
                        {jogadores.map(j => <option key={j.id} value={j.id}>{j.nome} ({times.find(t => t.id === j.time_id)?.nome})</option>)}
                    </select>
                    
                    <select name="tipo" value={novoEvento.tipo} onChange={handleNewEventChange}>
                        <option value="gol">Gol</option>
                        <option value="assistencia">Assistência</option>
                        <option value="cartao_amarelo">Cartão Amarelo</option>
                        <option value="cartao_vermelho">Cartão Vermelho</option>
                    </select>
                    
                    <input type="number" name="minuto" placeholder="Minuto" value={novoEvento.minuto} onChange={handleNewEventChange} style={{ width: '80px' }} />

                    <button type="button" onClick={handleAddEvent}>+ Adicionar Evento</button>
                </div>

                <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                    {matchData.eventos.map((e, index) => (
                        <li key={index}>
                            {e.tipo.toUpperCase()}: **{e.jogadorId}** ({e.minuto}')
                        </li>
                    ))}
                </ul>

                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', marginTop: '20px' }}>
                    GERAR NOVO ARQUIVO JSON
                </button>
            </form>

            {/* --- Saída do JSON Gerado --- */}
            {jsonGerado && (
                <div style={{ marginTop: '40px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '5px' }}>
                    <h2>2. Copiar e Publicar</h2>
                    <p style={{ fontWeight: 'bold', color: '#CC0000' }}>
                        PASSO CRÍTICO: Copie TODO o conteúdo da caixa de texto abaixo e SUBSTITUA o arquivo 
                        <code>src/data/campeonato.json</code> do seu projeto local.
                    </p>
                    <p>Em seguida, faça o commit e deploy.</p>

                    <textarea 
                        value={jsonGerado} 
                        readOnly 
                        rows="25" 
                        cols="80"
                        style={{ width: '100%', whiteSpace: 'pre', overflowWrap: 'normal', fontFamily: 'monospace', fontSize: '12px' }}
                        onClick={(e) => e.target.select()} // Facilita a seleção do texto
                    />
                    
                    <h3>Pré-visualização da Tabela (Teste Rápido)</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#eee' }}><th>Time</th><th>J</th><th>P</th><th>...</th></tr>
                        </thead>
                        <tbody>
                            {tabelaTeste && tabelaTeste.map(time => (
                                <tr key={time.id}>
                                    <td>{time.nome}</td>
                                    <td>{time.J}</td>
                                    <td>{time.P}</td>
                                    <td>...</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}