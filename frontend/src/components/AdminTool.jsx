import { useState, useMemo, useEffect } from 'react';
// Importa as funções de cálculo, mas NÃO os dados
// import { calcularClassificacao, calcularRankingsIndividuais } from '../utils/calculadora';

// Componente principal da ferramenta de administração
export default function AdminTool() {
    
    // --- ESTADOS DE DADOS E CARREGAMENTO ---
    const [dadosCampeonato, setDadosCampeonato] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false); // Para desabilitar botões durante o salvamento

    // --- ESTADOS DOS FORMULÁRIOS ---
    // (Seção 1: Agendador)
    const [rodadaAgendada, setRodadaAgendada] = useState(1);
    const [partidasParaAgendar, setPartidasParaAgendar] = useState([
        { id: 0, timeCasaId: '', timeVisitanteId: '' }
    ]);
    const [nextPartidaId, setNextPartidaId] = useState(1);
    
    // (Seção 2: Resultados)
    const [selectedMatchId, setSelectedMatchId] = useState('');
    const [matchResults, setMatchResults] = useState({ golsCasa: '0', golsVisitante: '0' });
    const [matchEventos, setMatchEventos] = useState([]);
    const [novoEvento, setNovoEvento] = useState({ jogadorId: '', tipo: 'gol', minuto: '' });

    // (Seção 3: Times)
    const [novoTime, setNovoTime] = useState({
        nome: '',
        emblema_url: 'img/emblemas/default.png'
    });

    // (Seção 4: Jogadores)
    const [novoJogador, setNovoJogador] = useState({
        id: '',
        nome: '',
        time_id: ''
    });

    // --- 1. BUSCAR DADOS (useEffect) ---
    // Busca os dados da API quando o componente carrega
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/json-handler');
                if (!response.ok) {
                    throw new Error(`Falha ao buscar dados: ${response.statusText}`);
                }
                const data = await response.json();
                setDadosCampeonato(data);
                
                // Define o jogador padrão para o formulário de eventos (se houver jogadores)
                if (data.jogadores && data.jogadores.length > 0) {
                    setNovoEvento(prev => ({ ...prev, jogadorId: data.jogadores[0].id }));
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Roda uma vez

    // --- 2. DADOS DERIVADOS (useMemo) ---
    // Os dados agora vêm do 'dadosCampeonato' do estado
    
    // Listas principais (usadas em todos os formulários)
    const times = useMemo(() => {
        if (!dadosCampeonato) return [];
        return dadosCampeonato.times;
    }, [dadosCampeonato]);

    const jogadores = useMemo(() => {
        if (!dadosCampeonato) return [];
        return dadosCampeonato.jogadores;
    }, [dadosCampeonato]);

    // (Seção 2: Lista de partidas agendadas)
    const scheduledMatches = useMemo(() => {
        if (!dadosCampeonato) return [];
        const timesMap = times.reduce((acc, t) => {
            acc[t.id] = t.nome;
            return acc;
        }, {});
        return dadosCampeonato.partidas
            .filter(p => p.gols_casa === null)
            .map(p => ({
                id: p.id,
                label: `Rodada ${p.rodada}: ${timesMap[p.time_casa_id]} vs ${timesMap[p.time_visitante_id]}`
            }))
            .sort((a, b) => a.id - b.id);
    }, [dadosCampeonato, times]);

    // (Seção 4: Lista de jogadores agrupados)
    const jogadoresPorTime = useMemo(() => {
        if (!dadosCampeonato) return [];
        const timesMap = times.reduce((acc, t) => {
            acc[t.id] = { nome: t.nome, emblema_url: t.emblema_url, jogadores: [] };
            return acc;
        }, {});
        jogadores.forEach(j => {
            if (timesMap[j.time_id]) {
                timesMap[j.time_id].jogadores.push(j);
            }
        });
        return Object.values(timesMap).filter(t => t.jogadores.length > 0);
    }, [times, jogadores]);


    // --- 3. FUNÇÃO DE SALVAMENTO (GENÉRICA) ---
    
    /**
     * Função 'Core' que envia o NOVO objeto JSON para a API.
     */
    const salvarDados = async (novosDados, mensagemSucesso) => {
        setIsSaving(true);
        setError(null);
        try {
            const novaStringJson = JSON.stringify(novosDados, null, 2);
            
            // Envia o JSON completo para a API sobrescrever
            const response = await fetch('/api/json-handler', {
                method: 'POST',
                body: novaStringJson,
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.details || `Falha na API: ${response.statusText}`);
            }

            // SUCESSO!
            // Atualiza o estado local para que a UI reflita a mudança instantaneamente.
            setDadosCampeonato(novosDados);
            alert(`✅ ${mensagemSucesso}`);
            
            // Limpa formulários
            setPartidasParaAgendar([{ id: 0, timeCasaId: '', timeVisitanteId: '' }]);
            setSelectedMatchId('');
            setMatchEventos([]);
            setNovoTime({ nome: '', emblema_url: 'img/emblemas/default.png' });
            setNovoJogador({ id: '', nome: '', time_id: '' });

        } catch (err) {
            console.error("ERRO AO SALVAR DADOS:", err);
            setError(`Erro ao salvar: ${err.message}. Tente novamente.`);
            alert(`❌ Erro ao salvar: ${err.message}.`);
        } finally {
            setIsSaving(false);
        }
    };

    // --- 4. HANDLERS DE FORMULÁRIO ---

    // (Seção 1: Agendar Rodada)
    const handleAgendarRodada = (e) => {
        e.preventDefault();
        // Validação
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

        // Lógica de salvar:
        const novosDados = JSON.parse(JSON.stringify(dadosCampeonato));
        let ultimoId = novosDados.partidas.length > 0
            ? Math.max(...novosDados.partidas.map(p => p.id))
            : 0;
        
        const novasPartidasJSON = partidasParaAgendar.map(partida => {
            ultimoId++;
            return {
                id: ultimoId,
                rodada: Number(rodadaAgendada),
                time_casa_id: Number(partida.timeCasaId),
                time_visitante_id: Number(partida.timeVisitanteId),
                gols_casa: null,
                gols_visitante: null,
                data_partida: null,
                eventos: []
            };
        });
        
        novosDados.partidas.push(...novasPartidasJSON);
        
        // Chama a função de salvamento
        salvarDados(novosDados, `Rodada ${rodadaAgendada} agendada com ${novasPartidasJSON.length} jogos!`);
        setRodadaAgendada(prev => Number(prev) + 1);
    };

    // (Seção 2: Salvar Resultado)
    const handleSalvarResultado = (e) => {
        e.preventDefault();
        if (!selectedMatchId) {
            alert('Nenhuma partida selecionada.');
            return;
        }
        if (matchResults.golsCasa === '' || matchResults.golsVisitante === '') {
            alert('Preencha o placar final.');
            return;
        }

        // Lógica de salvar:
        const novosDados = JSON.parse(JSON.stringify(dadosCampeonato));
        const matchIndex = novosDados.partidas.findIndex(p => p.id == selectedMatchId);

        if (matchIndex === -1) {
            alert('Erro: Partida não encontrada.');
            return;
        }

        novosDados.partidas[matchIndex] = {
            ...novosDados.partidas[matchIndex],
            gols_casa: Number(matchResults.golsCasa),
            gols_visitante: Number(matchResults.golsVisitante),
            eventos: matchEventos.map(e => ({ 
                jogadorId: e.jogadorId,
                tipo: e.tipo, 
                minuto: Number(e.minuto) || null,
                partida_id: Number(selectedMatchId) 
            }))
        };
        
        salvarDados(novosDados, "Resultado da partida salvo com sucesso!");
    };
    
    // (Seção 3: Adicionar Time)
    const handleAdicionarTime = (e) => {
        e.preventDefault();
        if (!novoTime.nome.trim()) {
            alert('Por favor, preencha o nome do time.');
            return;
        }
        if (!novoTime.emblema_url.trim()) {
            alert('Por favor, preencha a URL do emblema.');
            return;
        }

        // Lógica de salvar:
        const novosDados = JSON.parse(JSON.stringify(dadosCampeonato));
        
        if (novosDados.times.find(t => t.nome.toLowerCase() === novoTime.nome.trim().toLowerCase())) {
            alert('Erro: Um time com este nome já existe.');
            return;
        }

        const ultimoId = novosDados.times.length > 0
            ? Math.max(...novosDados.times.map(t => t.id))
            : 0;
        
        const novoTimeObjeto = {
            id: ultimoId + 1,
            nome: novoTime.nome.trim(),
            emblema_url: novoTime.emblema_url.trim(),
            dono: ""
        };

        novosDados.times.push(novoTimeObjeto);
        
        salvarDados(novosDados, `Time "${novoTimeObjeto.nome}" adicionado!`);
    };

    // (Seção 4: Adicionar Jogador)
    const handleAdicionarJogador = (e) => {
        e.preventDefault();
        if (!novoJogador.id.trim()) {
            alert('Por favor, preencha o ID do Jogador (ex: "PlayerG").');
            return;
        }
        if (!novoJogador.nome.trim()) {
            alert('Por favor, preencha o Nome do Jogador.');
            return;
        }
        if (!novoJogador.time_id) {
            alert('Por favor, selecione um time para o jogador.');
            return;
        }

        // Lógica de salvar:
        const novosDados = JSON.parse(JSON.stringify(dadosCampeonato));
        
        if (novosDados.jogadores.find(j => j.id === novoJogador.id.trim())) {
            alert('Erro: Um jogador com este ID já existe.');
            return;
        }

        const novoJogadorObjeto = {
            id: novoJogador.id.trim(),
            nome: novoJogador.nome.trim(),
            time_id: Number(novoJogador.time_id)
        };

        novosDados.jogadores.push(novoJogadorObjeto);
        
        salvarDados(novosDados, `Jogador "${novoJogadorObjeto.nome}" adicionado!`);
    };

    // --- Handlers da Seção 5: Zona de Perigo ---

    /**
     * Limpa completamente o JSON, resetando o campeonato.
     */
    const handleLimparBase = () => {
        // Primeira Confirmação
        const confirm1 = window.confirm(
            "ATENÇÃO: AÇÃO IRREVERSÍVEL!\n\nVocê tem certeza que deseja apagar TODOS os dados do campeonato?\n\n(Times, Jogadores, Partidas e Resultados serão perdidos.)"
        );
        if (!confirm1) {
            alert("Ação cancelada.");
            return;
        }

        // Segunda Confirmação (para evitar cliques acidentais)
        const confirm2 = window.confirm(
            "CONFIRMAÇÃO FINAL:\n\nTem certeza ABSOLUTA? Os dados não podem ser recuperados."
        );
        if (!confirm2) {
            alert("Ação cancelada.");
            return;
        }

        // Define o JSON Vazio
        const emptyData = {
          "times": [],
          "partidas": [],
          "jogadores": []
        };

        // Chama a função de salvamento existente
        salvarDados(emptyData, "Base de dados limpa com sucesso! O campeonato foi reiniciado.");
    };

    // --- 5. HANDLERS DE EVENTOS ---
    
    const handleAgendamentoChange = (index, field, value) => {
        const novasPartidas = [...partidasParaAgendar];
        novasPartidas[index][field] = value;
        setPartidasParaAgendar(novasPartidas);
    };
    const handleAdicionarSlotPartida = () => {
        setPartidasParaAgendar(prev => [
            ...prev,
            { id: nextPartidaId, timeCasaId: '', timeVisitanteId: '' }
        ]);
        setNextPartidaId(prev => prev + 1);
    };
    const handleRemoverSlotPartida = (index) => {
        if (partidasParaAgendar.length <= 1) return; 
        const novasPartidas = partidasParaAgendar.filter((_, i) => i !== index);
        setPartidasParaAgendar(novasPartidas);
    };

    /**
     * Atualiza o estado do placar (golsCasa, golsVisitante)
     */
    const handleResultChange = (e) => {
        const { name, value } = e.target;
        setMatchResults(prev => ({ ...prev, [name]: value }));
    };
    
    const handleNewEventChange = (e) => {
        const { name, value } = e.target;
        setNovoEvento(prev => ({ ...prev, [name]: value }));
    };
    const handleAddEvent = () => {
        if (!selectedMatchId) {
            alert('Primeiro, selecione uma partida agendada.');
            return;
        }
        if (novoEvento.jogadorId && novoEvento.tipo) {
            setMatchEventos(prev => [...prev, novoEvento]); 
            setNovoEvento({ jogadorId: jogadores[0]?.id || '', tipo: 'gol', minuto: '' });
        } else {
            alert('Preencha o Jogador e o Tipo do evento.');
        }
    };
    const handleNovoTimeChange = (e) => {
        const { name, value } = e.target;
        setNovoTime(prev => ({ ...prev, [name]: value }));
    };
    const handleNovoJogadorChange = (e) => {
        const { name, value } = e.target;
        setNovoJogador(prev => ({ ...prev, [name]: value }));
    };


    // --- 6. RENDERIZAÇÃO ---
    
    // (Tratamento de Loading e Error)
    if (loading) {
        return <div className="container" style={{ textAlign: 'center', color: '#00bcd4' }}><h2>Carregando Admin...</h2></div>;
    }
    
    // Mostra um erro principal no topo se houver
    const renderError = () => {
        if (!error) return null;
        return (
            <div style={{ backgroundColor: '#ff5252', color: '#121212', padding: '15px', borderRadius: '8px', fontWeight: 'bold' }}>
                ERRO: {error}
            </div>
        )
    }

    return (
        <div className="container" style={{ maxWidth: '900px' }}>
            <h1>🛠️ Ferramenta de Administração (EAFC 26)</h1>
            <p><strong>Atenção:</strong> Alterações feitas aqui são salvas "ao vivo" e afetam o site público imediatamente.</p>
            {renderError()}

            {/* --- SEÇÃO 1: AGENDADOR DE RODADAS --- */}
            <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px', marginTop: '30px', color: '#00bcd4' }}>
                1. Agendar Rodada (Modo Múltiplo)
            </h2>
            <form onSubmit={handleAgendarRodada}>
                <div className="admin-form-group form-row-flex">
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
                            disabled={isSaving}
                        />
                    </div>
                    
                    {partidasParaAgendar.map((partida, index) => (
                        <div key={partida.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <select 
                                className="admin-select" 
                                value={partida.timeCasaId} 
                                onChange={(e) => handleAgendamentoChange(index, 'timeCasaId', e.target.value)}
                                disabled={isSaving}
                                style={{ flex: 1 }}
                            >
                                <option value="" disabled>-- Time da Casa --</option>
                                {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                            </select>
                            
                            <span style={{ color: '#e0e0e0' }}>VS</span>

                            <select 
                                className="admin-select" 
                                value={partida.timeVisitanteId} 
                                onChange={(e) => handleAgendamentoChange(index, 'timeVisitanteId', e.target.value)}
                                disabled={isSaving}
                                style={{ flex: 1 }}
                            >
                                <option value="" disabled>-- Time Visitante --</option>
                                {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                            </select>
                            
                            <button 
                                type="button"
                                onClick={() => handleRemoverSlotPartida(index)}
                                disabled={partidasParaAgendar.length <= 1 || isSaving}
                                className="btn-remove"
                            >X</button>
                        </div>
                    ))}
                    
                    <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                        <button 
                            type="button" 
                            onClick={handleAdicionarSlotPartida}
                            className="btn-primary"
                            style={{ backgroundColor: '#00bcd4', flex: 1 }}
                            disabled={isSaving}
                        >
                            + Adicionar Jogo
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary"
                            style={{ backgroundColor: '#69f0ae', color: '#121212', flex: 2, fontWeight: 'bold' }}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Agendando...' : `Agendar Rodada ${rodadaAgendada}`}
                        </button>
                    </div>
                </div>
            </form>

            {/* --- SEÇÃO 2: LANÇAR RESULTADOS --- */}
            <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px', marginTop: '30px', color: '#00bcd4' }}>
                2. Lançar Resultado da Partida
            </h2>
            <form onSubmit={handleSalvarResultado}>
                <div className="admin-form-group form-row-flex">
                    <h3 style={{ marginTop: 0, color: '#e0e0e0' }}>Selecione a Partida Agendada</h3>
                    <select 
                        className="admin-select"
                        value={selectedMatchId}
                        onChange={(e) => setSelectedMatchId(e.target.value)}
                        style={{ width: '100%' }}
                        disabled={isSaving}
                    >
                        <option value="" disabled>-- Selecione um jogo (Apenas agendados) --</option>
                        {scheduledMatches.map(match => (
                            <option key={match.id} value={match.id}>{match.label}</option>
                        ))}
                    </select>
                </div>

                {selectedMatchId && (
                    <>
                        <div className="admin-form-group form-row-flex">
                            <label style={{ fontWeight: 'bold', color: '#e0e0e0', display: 'block', marginBottom: '5px' }}>
                                Placar Final:
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                                <input 
                                    className="admin-input" 
                                    type="number" 
                                    name="golsCasa" 
                                    value={matchResults.golsCasa} 
                                    onChange={handleResultChange} 
                                    min="0" style={{ width: '60px', textAlign: 'center', margin: 0 }} 
                                    disabled={isSaving}
                                />
                                <span style={{ color: '#e0e0e0' }}>-</span>
                                <input 
                                    className="admin-input" 
                                    type="number" 
                                    name="golsVisitante" 
                                    value={matchResults.golsVisitante} 
                                    onChange={handleResultChange} 
                                    min="0" style={{ width: '60px', textAlign: 'center', margin: 0 }} 
                                    disabled={isSaving}
                                />
                            </div>
                        </div>

                        <div className="admin-form-group form-row-flex">
                            <h3 style={{ marginTop: 0, color: '#e0e0e0', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                                Eventos (Gols, Assistências, Cartões)
                            </h3>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}> 
                                <select className="admin-select" name="jogadorId" value={novoEvento.jogadorId} onChange={handleNewEventChange} style={{ flex: 2 }} disabled={isSaving}>
                                    <option value="" disabled>-- Selecione o Jogador --</option>
                                    {jogadores.map(j => <option key={j.id} value={j.id}>{j.nome} ({times.find(t => t.id === j.time_id)?.nome})</option>)}
                                </select>
                                
                                <select className="admin-select" name="tipo" value={novoEvento.tipo} onChange={handleNewEventChange} style={{ flex: 1.5 }} disabled={isSaving}>
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
                                    disabled={isSaving}
                                />

                                <button 
                                    type="button" 
                                    onClick={handleAddEvent} 
                                    className="btn-primary" 
                                    style={{ backgroundColor: '#69f0ae', color: '#121212', fontSize: '1em', flex: 1, minWidth: '100px' }}
                                    disabled={isSaving}
                                >
                                    + Adicionar
                                </button>
                            </div>

                            <ul style={{ listStyleType: 'none', paddingLeft: '0', fontSize: '0.9em' }}>
                                {matchEventos.map((e, index) => (
                                    <li key={index} style={{ padding: '5px 0', borderBottom: '1px dotted #333' }}>
                                        <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{e.tipo}</span> em {e.minuto || '??'}' por {jogadores.find(j => j.id == e.jogadorId)?.nome}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button type="submit" className="btn-primary" disabled={isSaving}>
                            {isSaving ? 'Salvando Resultado...' : 'SALVAR RESULTADO DA PARTIDA'}
                        </button>
                    </>
                )}
            </form>

            {/* --- SEÇÃO 3: GERENCIAR TIMES --- */}
            <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px', marginTop: '30px', color: '#00bcd4' }}>
                3. Gerenciar Times
            </h2>
            <p>Adicione novos times ao campeonato. (Para removê-los, você ainda precisa editar o JSON manualmente).</p>

            <div className="admin-form-group form-row-flex">
                <h3 style={{ marginTop: 0, color: '#e0e0e0' }}>Times Atuais no Sistema ({times.length})</h3>
                <ul style={{ maxHeight: '150px', overflowY: 'auto', paddingLeft: '20px', margin: 0, fontSize: '0.9em' }}>
                    {times.map(t => <li key={t.id} style={{ marginBottom: '5px' }}>
                        <img src={t.emblema_url} alt="" style={{ width: '16px', height: '16px', marginRight: '8px', verticalAlign: 'middle' }} />
                        {t.nome} (ID: {t.id})
                    </li>)}
                </ul>
            </div>

            <form onSubmit={handleAdicionarTime}>
                <div className="admin-form-group form-row-flex">
                    <h3 style={{ marginTop: 0, color: '#e0e0e0' }}>Adicionar Novo Time</h3>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', color: '#e0e0e0', display: 'block', marginBottom: '5px' }}>Nome do Time:</label>
                        <input 
                            className="admin-input" 
                            type="text" 
                            name="nome" 
                            value={novoTime.nome} 
                            onChange={handleNovoTimeChange} 
                            placeholder="Ex: Inter de Milão" 
                            style={{ width: '100%' }}
                            disabled={isSaving}
                        />
                    </div>
                    <div>
                        <label style={{ fontWeight: 'bold', color: '#e0e0e0', display: 'block', marginBottom: '5px' }}>URL do Emblema:</label>
                        <input 
                            className="admin-input" 
                            type="text" 
                            name="emblema_url" 
                            value={novoTime.emblema_url} 
                            onChange={handleNovoTimeChange} 
                            placeholder="Ex: img/emblemas/inter.png" 
                            style={{ width: '100%' }}
                            disabled={isSaving}
                        />
                        <small style={{ color: '#999', display: 'block', marginTop: '5px' }}>
                            <strong>Aviso:</strong> Você deve fazer o upload do arquivo (`.png` ou `.svg`) para a pasta <code>public/img/emblemas/</code> manualmente.
                        </small>
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: '20px' }} disabled={isSaving}>
                        {isSaving ? 'Adicionando...' : '+ Adicionar Time'}
                    </button>
                </div>
            </form>

            {/* --- SEÇÃO 4: GERENCIAR JOGADORES --- */}
            <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px', marginTop: '30px', color: '#00bcd4' }}>
                4. Gerenciar Jogadores
            </h2>
            <p>Adicione novos jogadores e associe-os a um time existente.</p>

            <div className="admin-form-group form-row-flex">
                <h3 style={{ marginTop: 0, color: '#e0e0e0' }}>Jogadores Atuais ({jogadores.length})</h3>
                <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '10px', backgroundColor: '#121212', borderRadius: '4px' }}>
                    {jogadoresPorTime.map(time => (
                        <div key={time.nome} style={{ marginBottom: '10px' }}>
                            <strong style={{ color: '#00bcd4' }}>
                                <img src={time.emblema_url} alt="" style={{ width: '16px', height: '16px', marginRight: '8px', verticalAlign: 'middle' }} />
                                {time.nome}
                            </strong>
                            <ul style={{ listStyleType: 'none', paddingLeft: '25px', margin: '5px 0 0 0', fontSize: '0.9em' }}>
                                {time.jogadores.map(j => (
                                    <li key={j.id} style={{ color: '#ccc' }}>{j.nome} (ID: <code>{j.id}</code>)</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleAdicionarJogador}>
                <div className="admin-form-group form-row-flex">
                    <h3 style={{ marginTop: 0, color: '#e0e0e0' }}>Adicionar Novo Jogador</h3>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', color: '#e0e0e0', display: 'block', marginBottom: '5px' }}>ID do Jogador (String):</label>
                        <input 
                            className="admin-input" 
                            type="text" 
                            name="id" 
                            value={novoJogador.id} 
                            onChange={handleNovoJogadorChange} 
                            placeholder="Ex: PlayerG (usado nos eventos)" 
                            style={{ width: '100%' }}
                            disabled={isSaving}
                        />
                        <small style={{ color: '#999', display: 'block', marginTop: '5px' }}>
                            <strong>Importante:</strong> Use o ID de string (ex: "KylianM") que você usará nos eventos.
                        </small>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', color: '#e0e0e0', display: 'block', marginBottom: '5px' }}>Nome do Jogador:</label>
                        <input 
                            className="admin-input" 
                            type="text" 
                            name="nome" 
                            value={novoJogador.nome} 
                            onChange={handleNovoJogadorChange} 
                            placeholder="Ex: Kylian Mbappé" 
                            style={{ width: '100%' }}
                            disabled={isSaving}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', color: '#e0e0e0', display: 'block', marginBottom: '5px' }}>Time:</label>
                        <select 
                            className="admin-select" 
                            name="time_id" 
                            value={novoJogador.time_id} 
                            onChange={handleNovoJogadorChange} 
                            style={{ width: '100%' }}
                            disabled={isSaving}
                        >
                            <option value="" disabled>-- Selecione um time --</option>
                            {times.map(t => (
                                <option key={t.id} value={t.id}>{t.nome}</option>
                            ))}
                        </select>
                    </div>
                    
                    <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={isSaving}>
                        {isSaving ? 'Adicionando...' : '+ Adicionar Jogador'}
                    </button>
                </div>
            </form>

            {/* --- SEÇÃO 5: ZONA DE PERIGO --- */}
            <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px', marginTop: '30px', color: '#dc3545' }}>
                5. Zona de Perigo
            </h2>
            <div className="admin-form-group">
                <h3 style={{ marginTop: 0, color: '#e0e0e0' }}>Reiniciar Campeonato</h3>
                <p style={{ color: '#ccc', fontSize: '0.9em' }}>
                    Isto irá apagar permanentemente todos os times, jogadores e resultados do seu <code>campeonato.json</code>.
                    Use esta função apenas se quiser começar um campeonato totalmente novo do zero.
                </p>
                <button 
                    type="button" 
                    className="btn-primary" 
                    style={{ backgroundColor: '#dc3545', color: '#ffffff', border: '1px solid #ff5252' }}
                    onClick={handleLimparBase}
                    disabled={isSaving}
                >
                    {isSaving ? 'Aguarde...' : 'Limpar Base de Dados (Ação Irreversível)'}
                </button>
            </div>
        </div>
    );
}