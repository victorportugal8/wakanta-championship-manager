import { useState, useMemo } from 'react';
// Importa os dados antigos diretamente (pode ser o que está na sua pasta data/)
import dadosAntigos from '../data/campeonato.json'; 
import { calcularClassificacao } from '../utils/calculadora';

// Componente principal da ferramenta de administração
export default function AdminTool() {
    
    // Lista de times e jogadores para popular os selects
    const times = dadosAntigos.times;
    const jogadores = dadosAntigos.jogadores;

    // --- NOVOS ESTADOS (Seção 1: Agendador de Rodadas) ---
    const [rodadaAgendada, setRodadaAgendada] = useState(1);
    const [partidasParaAgendar, setPartidasParaAgendar] = useState([
        { id: 0, timeCasaId: '', timeVisitanteId: '' } // Começa com 1 slot
    ]);
    const [nextPartidaId, setNextPartidaId] = useState(1); // Para dar keys únicas

    // // Estado para os dados da nova partida (Formulário)
    // const [matchData, setMatchData] = useState({
    //     timeCasaId: '',       // Alterado (de times[0]?.id...)
    //     timeVisitanteId: '',  // Alterado (de times[1]?.id...)
    //     golsCasa: '0',         // Alterado (de 0)
    //     golsVisitante: '0',    // Alterado (de 0)
    //     rodada: '1',           // Novo campo para rodada
    //     eventos: [],
    // });

    // Estados para a saída e pré-visualização
    const [jsonGerado, setJsonGerado] = useState('');
    const [tabelaTeste, setTabelaTeste] = useState(null);
    // const [rankingsTeste, setRankingsTeste] = useState(null);

    // Estado para o formulário de NOVO EVENTO (Reutilizado)
    const [novoEvento, setNovoEvento] = useState({ 
        jogadorId: jogadores[0]?.id || '', 
        tipo: 'gol', 
        minuto: '' 
    });

    // --- NOVOS ESTADOS (Seção 2: Lançar Resultados) ---
    const [selectedMatchId, setSelectedMatchId] = useState(''); // ID da partida selecionada
    const [matchResults, setMatchResults] = useState({ golsCasa: '0', golsVisitante: '0' });
    const [matchEventos, setMatchEventos] = useState([]); // Eventos da partida selecionada

    /**
     * Cria uma lista de partidas agendadas (gols_casa === null)
     * para popular o <select> da Seção 2.
     */
    const scheduledMatches = useMemo(() => {
        // Mapeia IDs de times para nomes
        const timesMap = dadosAntigos.times.reduce((acc, t) => {
            acc[t.id] = t.nome;
            return acc;
        }, {});

        // Filtra e formata as partidas agendadas
        return dadosAntigos.partidas
            .filter(p => p.gols_casa === null) // Apenas partidas agendadas!
            .map(p => ({
                id: p.id,
                label: `Rodada ${p.rodada}: ${timesMap[p.time_casa_id]} vs ${timesMap[p.time_visitante_id]}`
            }))
            .sort((a, b) => a.id - b.id); // Ordena pela ID/ordem de cadastro
            
    }, [dadosAntigos.partidas, dadosAntigos.times]); // Depende dos dados

    // --- Lógica de Geração do Novo JSON ---
    // const generateNewJson = (newMatch) => {
    //     // 1. Clonar os dados antigos para evitar modificá-los diretamente
    //     const novosDados = JSON.parse(JSON.stringify(dadosAntigos));
        
    //     // 2. Definir o ID da nova partida (último ID + 1)
    //     const ultimoId = novosDados.partidas.length > 0
    //         ? novosDados.partidas[novosDados.partidas.length - 1].id
    //         : 0;
    //     const proximoId = ultimoId + 1;
        
    //     // 3. Montar o objeto da nova partida
    //     const novoMatchObjeto = {
    //         id: proximoId,
    //         rodada: Number(newMatch.rodada),
    //         // Usamos Number() para garantir que o resultado seja um número ou NaN
    //         time_casa_id: Number(newMatch.timeCasaId), 
    //         time_visitante_id: Number(newMatch.timeVisitanteId),
    //         gols_casa: Number(newMatch.golsCasa), 
    //         gols_visitante: Number(newMatch.golsVisitante), 
    //         data_partida: new Date().toISOString().slice(0, 10),
    //         eventos: newMatch.eventos.map(e => ({ ...e, partida_id: proximoId }))
    //     };
        
    //     // 4. Adicionar a nova partida ao histórico
    //     novosDados.partidas.push(novoMatchObjeto);
        
    //     // 5. Retornar a string JSON formatada (indentação de 2 espaços)
    //     return JSON.stringify(novosDados, null, 2);
    // };

    // --- Handlers da Seção 1: Agendador de Rodadas ---

    /**
     * Atualiza um campo (timeCasaId ou timeVisitanteId) de uma partida específica
     * na lista de agendamento.
     */
    const handleAgendamentoChange = (index, field, value) => {
        const novasPartidas = [...partidasParaAgendar];
        novasPartidas[index][field] = value;
        setPartidasParaAgendar(novasPartidas);
    };

    /**
     * Adiciona um novo slot de partida (vazio) à lista de agendamento.
     */
    const handleAdicionarSlotPartida = () => {
        setPartidasParaAgendar(prev => [
            ...prev,
            { id: nextPartidaId, timeCasaId: '', timeVisitanteId: '' }
        ]);
        setNextPartidaId(prev => prev + 1); // Incrementa o ID único
    };

    /**
     * Remove um slot de partida da lista de agendamento.
     */
    const handleRemoverSlotPartida = (index) => {
        // Impede de remover o último slot
        if (partidasParaAgendar.length <= 1) return; 
        
        const novasPartidas = partidasParaAgendar.filter((_, i) => i !== index);
        setPartidasParaAgendar(novasPartidas);
    };

    /**
     * Submete a rodada inteira (lista de partidas) para gerar o JSON.
     */
    const handleAgendarRodada = () => {
        // 1. Validação
        if (!rodadaAgendada) {
            alert('Por favor, informe o número da Rodada.');
            return;
        }
        for (const partida of partidasParaAgendar) {
            if (!partida.timeCasaId || !partida.timeVisitanteId) {
                alert('Preencha todos os times antes de agendar.');
                return;
            }
            if (partida.timeCasaId === partida.timeVisitanteId) {
                alert(`Conflito: ${times.find(t => t.id == partida.timeCasaId)?.nome} não pode jogar contra si mesmo.`);
                return;
            }
        }

        try {
            // 2. Preparar dados para o JSON
            const novosDados = JSON.parse(JSON.stringify(dadosAntigos));
            let ultimoId = novosDados.partidas.length > 0
                ? Math.max(...novosDados.partidas.map(p => p.id))
                : 0;

            // 3. Criar os novos objetos de partida (com placar null)
            const novasPartidasJSON = partidasParaAgendar.map(partida => {
                ultimoId++;
                return {
                    id: ultimoId,
                    rodada: Number(rodadaAgendada),
                    time_casa_id: Number(partida.timeCasaId),
                    time_visitante_id: Number(partida.timeVisitanteId),
                    gols_casa: null, // <-- CHAVE DA NOVA LÓGICA
                    gols_visitante: null, // <-- CHAVE DA NOVA LÓGICA
                    data_partida: null, // (Podemos adicionar um campo de data depois)
                    eventos: []
                };
            });

            // 4. Adicionar ao JSON
            novosDados.partidas.push(...novasPartidasJSON);
            const novaStringJson = JSON.stringify(novosDados, null, 2);
            
            // 5. Atualizar a UI
            setJsonGerado(novaStringJson);
            // --- ADICIONADO (CORRIGE BUG 1 e 2) ---
            // Recalcula a pré-visualização com os novos dados
            const novosDadosObjeto = JSON.parse(novaStringJson);
            const tabelaCalculada = calcularClassificacao(novosDadosObjeto);
            // const rankingsCalculados = calcularRankingsIndividuais(novosDadosObjeto);
            
            setTabelaTeste(tabelaCalculada);
            // setRankingsTeste(rankingsCalculados);
            // --- FIM DA ADIÇÃO ---
            alert(`✅ Rodada ${rodadaAgendada} agendada com ${novasPartidasJSON.length} jogos! Role para baixo e copie o JSON.`);

            // 6. Resetar o formulário
            setRodadaAgendada(prev => Number(prev) + 1); // Sugere a próxima rodada
            setPartidasParaAgendar([{ id: 0, timeCasaId: '', timeVisitanteId: '' }]);
            setNextPartidaId(1);
            
        } catch (error) {
            console.error("ERRO ao agendar rodada:", error);
            alert('❌ Erro no Agendamento. Verifique o console.');
        }
    };

    // --- Handlers de Formulário ---

    // const handleMatchChange = (e) => {
    //     const { name, value } = e.target;
    //     setMatchData(prev => ({ ...prev, [name]: value }));
    // };

    const handleResultChange = (e) => {
        const { name, value } = e.target;
        setMatchResults(prev => ({ ...prev, [name]: value }));
    };

    const handleNewEventChange = (e) => {
        const { name, value } = e.target;
        setNovoEvento(prev => ({ ...prev, [name]: value }));
    };

    // const handleAddEvent = () => {
    //     if (novoEvento.jogadorId && novoEvento.tipo) {
    //         setMatchData(prev => ({ 
    //             ...prev, 
    //             eventos: [...prev.eventos, novoEvento] 
    //         }));
    //         // Resetar o formulário de evento para o próximo
    //         setNovoEvento({ 
    //             jogadorId: jogadores[0]?.id || '', 
    //             tipo: 'gol', 
    //             minuto: '' 
    //         });
    //     }
    // };

    const handleAddEvent = () => {
        // Validação: Garante que uma partida esteja selecionada
        if (!selectedMatchId) {
            alert('Primeiro, selecione uma partida agendada na "Seção 2".');
            return;
        }
        if (novoEvento.jogadorId && novoEvento.tipo) {
            // Adiciona o evento ao NOVO estado 'matchEventos'
            setMatchEventos(prev => [...prev, novoEvento]); 

            // Reseta o formulário de evento
            setNovoEvento({ 
                jogadorId: jogadores[0]?.id || '', 
                tipo: 'gol', 
                minuto: '' 
            });
        } else {
            alert('Preencha o Jogador e o Tipo do evento.');
        }
    };
    
    // const handleSubmit = (e) => {
    //     e.preventDefault();
        
    //     // --- MUDANÇA AQUI ---
    //     // Validação atualizada para incluir os IDs dos times
    //     if (!matchData.timeCasaId || !matchData.timeVisitanteId || matchData.golsCasa === '' || matchData.golsVisitante === ''|| !matchData.rodada) {
    //         alert('Por favor, preencha TODOS os campos da partida (Times, Placar e Rodada) antes de gerar o JSON.');
    //         return; // Sai da função se a validação falhar
    //     }
        
    //     if (matchData.timeCasaId === matchData.timeVisitanteId) {
    //         alert('O Time da Casa não pode ser igual ao Time Visitante.');
    //         return;
    //     }
        
    //     try {
    //         // 1. Gera a nova string JSON
    //         const novaStringJson = generateNewJson(matchData);
            
    //         // Se a geração falhar, o código pula direto para o catch.
    //         setJsonGerado(novaStringJson);
            
    //         // 2. Pré-visualiza o resultado (apenas para teste)
    //         const novosDadosObjeto = JSON.parse(novaStringJson);
    //         const tabelaCalculada = calcularClassificacao(novosDadosObjeto);
    //         setTabelaTeste(tabelaCalculada);

    //         alert('✅ NOVO JSON GERADO! Role para baixo e copie o conteúdo da caixa.');
            
    //     } catch (error) {
    //         // Se houver um erro em qualquer ponto acima (JSON inválido, erro de cálculo)
    //         console.error("ERRO FATAL NA GERAÇÃO DO JSON:", error);
    //         alert('❌ Erro na Geração/Cálculo do JSON. Verifique o console para detalhes.');
    //     }
    // };

    /**
 * Encontra a partida selecionada no JSON e ATUALIZA ela
 * com os placares e eventos preenchidos.
 */
    const handleSalvarResultado = (e) => {
        e.preventDefault();

        // 1. Validação
        if (!selectedMatchId) {
            alert('Nenhuma partida selecionada.');
            return;
        }
        if (matchResults.golsCasa === '' || matchResults.golsVisitante === '') {
            alert('Preencha o placar final.');
            return;
        }

        try {
            // 2. Clonar dados
            const novosDados = JSON.parse(JSON.stringify(dadosAntigos));

            // 3. Encontrar e Atualizar a Partida
            const matchIndex = novosDados.partidas.findIndex(p => p.id == selectedMatchId);

            if (matchIndex === -1) {
                throw new Error('Partida selecionada não encontrada no JSON.');
            }

            // Atualiza a partida encontrada (preservando dados antigos)
            novosDados.partidas[matchIndex] = {
                ...novosDados.partidas[matchIndex], // Mantém rodada, ids, data, etc.
                gols_casa: Number(matchResults.golsCasa),
                gols_visitante: Number(matchResults.golsVisitante),
                // Adiciona os eventos formatados
                eventos: matchEventos.map(e => ({ 
                    jogadorId: e.jogadorId, // <-- CORRIGIDO 
                    tipo: e.tipo, 
                    minuto: Number(e.minuto) || null,
                    partida_id: Number(selectedMatchId) 
                }))
            };

            // 4. Gerar JSON e Tabela de Pré-visualização
            const novaStringJson = JSON.stringify(novosDados, null, 2);
            setJsonGerado(novaStringJson);

            const tabelaCalculada = calcularClassificacao(novosDados);
            setTabelaTeste(tabelaCalculada);

            // --- ADICIONADO (CORRIGE BUG 2) ---
            // const rankingsCalculados = calcularRankingsIndividuais(novosDados);
            
            setTabelaTeste(tabelaCalculada);
            // setRankingsTeste(rankingsCalculados);
            // --- FIM DA ADIÇÃO ---

            alert('✅ Resultado salvo! JSON gerado. Role para baixo e copie.');

            // 5. Resetar formulário
            setSelectedMatchId('');
            setMatchResults({ golsCasa: '0', golsVisitante: '0' });
            setMatchEventos([]);
            // (Não precisa resetar novoEvento, ele já reseta no handleAddEvent)

        } catch (error) {
            console.error("ERRO ao salvar resultado:", error);
            alert('❌ Erro ao salvar o resultado. Verifique o console.');
        }
    };

    /**
     * Recebe o conteúdo JSON como string e força o download como arquivo.
     * @param {string} jsonString - A string JSON completa gerada.
     * @param {string} filename - Nome do arquivo para download.
    */
    const downloadJsonFile = (jsonString, filename = 'campeonato_atualizado.json') => {
        // 1. Cria um objeto Blob (Binary Large Object) com o conteúdo JSON
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // 2. Cria uma URL temporária para o Blob
        const url = URL.createObjectURL(blob);
        
        // 3. Cria um elemento <a> invisível para simular o clique de download
        const link = document.createElement('a');
        link.href = url;
        link.download = filename; // Define o nome do arquivo

        // 4. Dispara o download e remove o elemento
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 5. Limpa a URL do objeto Blob para liberar memória
        URL.revokeObjectURL(url);
        
        alert(`✅ Arquivo ${filename} gerado e pronto para download! Salve e substitua o arquivo no seu projeto.`);
    };

    // --- NOVO: FUNÇÕES HELPER (Copiadas de Tabela.jsx) ---
    // Adicione este bloco inteiro antes do 'return ()'

    /**
     * Retorna o elemento JSX (span) para a posição.
     */
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
    
    /**
     * Retorna o elemento JSX (span) para um resultado (V, E, D).
     */
    const getResultElement = (resultado, index) => {
        let className = '';
        let title = '';

        switch (resultado) {
            case 'V':
                className = 'result-win';
                title = 'Vitória';
                break;
            case 'E':
                className = 'result-draw';
                title = 'Empate';
                break;
            case 'D':
                className = 'result-loss';
                title = 'Derrota';
                break;
            default:
                className = 'result-draw';
                title = 'Indefinido';
        }

        return (
            <span key={index} className={`result-badge ${className}`} title={title}>
                {resultado}
            </span>
        );
    };

    /**
     * Renderiza o cabeçalho da tabela.
     */
    const renderHeader = (headers) => (
        <thead>
            <tr>
                {headers.map((h, i) => (
                    <th key={i}>{h}</th> 
                ))}
            </tr>
        </thead>
    );

    // --- Renderização do Componente ---
    return (
        <div className="container" style={{ maxWidth: '900px' }}>
            <h1>⚽ Ferramenta de Administração (EAFC 26)</h1>
            <p><strong>Atenção:</strong> Esta ferramenta *não* salva dados no servidor. Ela gera o novo arquivo JSON para você copiar e substituir.</p>

            {/* --- SEÇÃO 1: AGENDADOR DE RODADAS --- */}
            <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px', marginTop: '30px', color: '#00bcd4' }}>
                1. Agendar Rodada (Modo Múltiplo)
            </h2>
            <p>Use esta seção para cadastrar todas as partidas de uma rodada (sem placar).</p>
            
            <div className="admin-form-group">
                {/* Input da Rodada */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontWeight: 'bold', color: '#e0e0e0', marginRight: '10px' }}>
                        Agendar Rodada Nº:
                    </label>
                    <input 
                        className="admin-input" 
                        type="number" 
                        value={rodadaAgendada} 
                        onChange={(e) => setRodadaAgendada(e.target.value)} 
                        min="1" 
                        style={{ width: '60px', textAlign: 'center' }} 
                    />
                </div>
                
                {/* Lista dinâmica de partidas */}
                {partidasParaAgendar.map((partida, index) => (
                    <div key={partida.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        {/* Time da Casa */}
                        <select 
                            className="admin-select" 
                            value={partida.timeCasaId} 
                            onChange={(e) => handleAgendamentoChange(index, 'timeCasaId', e.target.value)}
                            style={{ flex: 1 }}
                        >
                            <option value="" disabled>-- Time da Casa --</option>
                            {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                        </select>
                        
                        <span style={{ color: '#e0e0e0' }}>VS</span>

                        {/* Time Visitante */}
                        <select 
                            className="admin-select" 
                            value={partida.timeVisitanteId} 
                            onChange={(e) => handleAgendamentoChange(index, 'timeVisitanteId', e.target.value)}
                            style={{ flex: 1 }}
                        >
                            <option value="" disabled>-- Time Visitante --</option>
                            {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                        </select>
                        
                        {/* Botão de Remover */}
                        <button 
                            type="button"
                            onClick={() => handleRemoverSlotPartida(index)}
                            disabled={partidasParaAgendar.length <= 1} // Não deixa remover o último
                            style={{ /* ... estilo de botão de remoção (vermelho) ... */ }}
                        >
                            X
                        </button>
                    </div>
                ))}
                
                {/* Botões de Ação */}
                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                    <button 
                        type="button" 
                        onClick={handleAdicionarSlotPartida}
                        className="btn-primary"
                        style={{ backgroundColor: '#00bcd4', flex: 1 }}
                    >
                        + Adicionar Jogo
                    </button>
                    <button 
                        type="button" 
                        onClick={handleAgendarRodada}
                        className="btn-primary"
                        style={{ backgroundColor: '#69f0ae', color: '#121212', flex: 2, fontWeight: 'bold' }}
                    >
                        Agendar Rodada {rodadaAgendada}
                    </button>
                </div>
            </div>

            {/* --- SEÇÃO 2: LANÇAR RESULTADOS --- */}
            {/* O seu formulário antigo agora é a Seção 2 */}
            <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px', marginTop: '30px', color: '#00bcd4' }}>
                2. Lançar Resultado da Partida
            </h2>
            <p>Use este formulário para lançar o resultado e eventos de uma partida específica.</p>

            {/* --- NOVO FORMULÁRIO (Seção 2) --- */}
            <form onSubmit={handleSalvarResultado}>
                
                {/* 1. Selecionar a Partida */}
                <div className="admin-form-group">
                    <h3 style={{ marginTop: 0, color: '#e0e0e0' }}>Selecione a Partida Agendada</h3>
                    <select 
                        className="admin-select"
                        value={selectedMatchId}
                        onChange={(e) => setSelectedMatchId(e.target.value)}
                        style={{ width: '100%' }}
                    >
                        <option value="" disabled>-- Selecione um jogo (Apenas agendados) --</option>
                        {scheduledMatches.map(match => (
                            <option key={match.id} value={match.id}>{match.label}</option>
                        ))}
                    </select>
                </div>

                {/* O formulário de resultados SÓ APARECE se uma partida for selecionada */}
                {selectedMatchId && (
                    <>
                        {/* 2. Placar Final */}
                        <div className="admin-form-group">
                            <label style={{ fontWeight: 'bold', color: '#e0e0e0', display: 'block', marginBottom: '5px' }}>
                                Placar Final:
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <input 
                                    className="admin-input" 
                                    type="number" 
                                    name="golsCasa" 
                                    value={matchResults.golsCasa} 
                                    onChange={handleResultChange} 
                                    min="0" style={{ width: '40px', textAlign: 'center' }} 
                                />
                                <span style={{ color: '#e0e0e0' }}>-</span>
                                <input 
                                    className="admin-input" 
                                    type="number" 
                                    name="golsVisitante" 
                                    value={matchResults.golsVisitante} 
                                    onChange={handleResultChange} 
                                    min="0" style={{ width: '40px', textAlign: 'center' }} 
                                />
                            </div>
                        </div>

                        {/* 3. Eventos (JSX antigo reutilizado) */}
                        <div className="admin-form-group">
                            <h3 style={{ marginTop: 0, color: '#e0e0e0', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                                Eventos (Gols, Assistências, Cartões)
                            </h3>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}> 
                                <select className="admin-select" name="jogadorId" value={novoEvento.jogadorId} onChange={handleNewEventChange} style={{ flex: 2 }}>
                                    <option value="" disabled>-- Selecione o Jogador --</option>
                                    {jogadores.map(j => <option key={j.id} value={j.id}>{j.nome} ({times.find(t => t.id === j.time_id)?.nome})</option>)}
                                </select>
                                
                                <select className="admin-select" name="tipo" value={novoEvento.tipo} onChange={handleNewEventChange} style={{ flex: 1.5 }}>
                                    <option value="" disabled>-- Selecione o Evento --</option>
                                    <option value="gol">Gol</option>
                                    <option value="assistencia">Assistência</option>
                                    <option value="cartao_amarelo">Cartão Amarelo</option>
                                    <option value="cartao_vermelho">Cartão Vermelho</option>
                                </select>
                                
                                <input 
                                    className="admin-input" 
                                    type="number" 
                                    name="minuto" 
                                    placeholder="Min" 
                                    value={novoEvento.minuto} 
                                    onChange={handleNewEventChange} 
                                    style={{ width: '70px', textAlign: 'center' }} 
                                />

                                <button 
                                    type="button" 
                                    onClick={handleAddEvent} 
                                    className="btn-primary" 
                                    style={{ backgroundColor: '#69f0ae', color: '#121212', fontSize: '1em', flex: 1, minWidth: '100px' }}
                                >
                                    + Adicionar
                                </button>
                            </div>

                            {/* Lista de Eventos (agora usa 'matchEventos') */}
                            <ul style={{ listStyleType: 'none', paddingLeft: '0', fontSize: '0.9em' }}>
                                {matchEventos.map((e, index) => (
                                    <li key={index} style={{ padding: '5px 0', borderBottom: '1px dotted #333' }}>
                                        **{e.tipo.toUpperCase()}** em **{e.minuto || '??'}**' por **{jogadores.find(j => j.id == e.jogadorId)?.nome}**
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 4. Botão de Salvar */}
                        <button type="submit" className="btn-primary">
                            SALVAR RESULTADO DA PARTIDA
                        </button>
                    </>
                )}
            </form>

            {/* --- Saída do JSON Gerado --- */}
            {jsonGerado && (
                <div style={{ marginTop: '40px' }}>
                    <h2>3. Salvar e Publicar</h2>
                    <p style={{ color: '#e0e0e0' }}>
                        O novo conteúdo JSON foi gerado. Clique no botão abaixo para **baixar o arquivo** e, em seguida, **substitua o arquivo <code>src/data/campeonato.json</code>** do seu projeto local.
                    </p>

                    <button 
                        className="btn-primary"
                        style={{ backgroundColor: '#69f0ae', color: '#121212', fontWeight: 'bold' }}
                        onClick={() => downloadJsonFile(jsonGerado, 'campeonato.json')}
                    >
                        ⬇️ FAZER DOWNLOAD do novo campeonato.json
                    </button>
                    
                    {/* Botão de download é mais seguro que o campo de texto */}
                    <p style={{ marginTop: '20px', fontSize: '0.9em' }}>
                        **Próximo Passo:** Após o download, substitua o arquivo local e faça o commit/deploy.
                    </p>
                    
                    {/* Pré-visualização simplificada */}
                    <h3>Pré-visualização da Tabela (Nova Ordem)</h3>
                    
                    {/* --- TABELA DE PREVIEW ATUALIZADA --- */}
                    <table className="score-table">
                        
                        {/* 1. Cabeçalho completo (usando a função renderHeader) */}
                        {renderHeader(['Pos', 'Time', 'P', 'J', 'V', 'E', 'D', 'GP', 'GC', 'SG', 'Últimos 5'])}
                        
                        <tbody>
                            {tabelaTeste && tabelaTeste.map((time, index) => (
                                <tr key={time.id}>
                                    {/* 2. Coluna Posição (com helper) */}
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
                                    {/* 3. Colunas de dados */}
                                    {/* <td className="col-time">{time.nome}</td> */}
                                    <td className="col-points">{time.P}</td>
                                    <td>{time.J}</td>
                                    <td>{time.V}</td>
                                    <td>{time.E}</td>
                                    <td>{time.D}</td>
                                    <td>{time.GP}</td>
                                    <td>{time.GC}</td>
                                    
                                    {/* 4. Coluna SG (com classes de cor) */}
                                    <td className={`col-sg ${time.SG > 0 ? 'positive-sg' : (time.SG < 0 ? 'negative-sg' : '')}`}>
                                        {time.SG}
                                    </td>

                                    {/* 5. Coluna Forma (com helper) */}
                                    <td className="col-form">
                                        <div className="recent-form-container">
                                            {/* Usamos time.ultimosResultados (que já vem da calculadora) */}
                                            {time.ultimosResultados && time.ultimosResultados.map((res, i) => (
                                                getResultElement(res, i)
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}