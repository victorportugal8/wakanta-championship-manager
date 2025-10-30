import { useState } from 'react';
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
        timeCasaId: '',       // Alterado (de times[0]?.id...)
        timeVisitanteId: '',  // Alterado (de times[1]?.id...)
        golsCasa: '',         // Alterado (de 0)
        golsVisitante: '',    // Alterado (de 0)
        eventos: [],
    });

    // Estados para a saída e pré-visualização
    const [jsonGerado, setJsonGerado] = useState('');
    const [tabelaTeste, setTabelaTeste] = useState(null);
    const [novoEvento, setNovoEvento] = useState({ 
        jogadorId: '',        // Alterado (de jogadores[0]?.id...)
        tipo: '', // Alterado de 'gol' para ''
        minuto: ''             // Alterado (de 45)
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
            // Usamos Number() para garantir que o resultado seja um número ou NaN
            time_casa_id: Number(newMatch.timeCasaId), 
            time_visitante_id: Number(newMatch.timeVisitanteId),
            gols_casa: Number(newMatch.golsCasa), 
            gols_visitante: Number(newMatch.golsVisitante), 
            data_partida: new Date().toISOString().slice(0, 10),
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
        
        // --- MUDANÇA AQUI ---
        // Validação atualizada para incluir os IDs dos times
        if (!matchData.timeCasaId || !matchData.timeVisitanteId || matchData.golsCasa === '' || matchData.golsVisitante === '') {
            alert('Por favor, preencha todos os campos da partida (Times e Placar) antes de gerar o JSON.');
            return; // Sai da função se a validação falhar
        }
        
        if (matchData.timeCasaId === matchData.timeVisitanteId) {
            alert('O Time da Casa não pode ser igual ao Time Visitante.');
            return;
        }
        
        try {
            // 1. Gera a nova string JSON
            const novaStringJson = generateNewJson(matchData);
            
            // Se a geração falhar, o código pula direto para o catch.
            setJsonGerado(novaStringJson);
            
            // 2. Pré-visualiza o resultado (apenas para teste)
            const novosDadosObjeto = JSON.parse(novaStringJson);
            const tabelaCalculada = calcularClassificacao(novosDadosObjeto);
            setTabelaTeste(tabelaCalculada);

            alert('✅ NOVO JSON GERADO! Role para baixo e copie o conteúdo da caixa.');
            
        } catch (error) {
            // Se houver um erro em qualquer ponto acima (JSON inválido, erro de cálculo)
            console.error("ERRO FATAL NA GERAÇÃO DO JSON:", error);
            alert('❌ Erro na Geração/Cálculo do JSON. Verifique o console para detalhes.');
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

    // --- Renderização do Componente ---
    return (
        <div className="container" style={{ maxWidth: '900px' }}>
            <h1>⚽ Ferramenta de Administração (EAFC 26)</h1>
            <p><strong>Atenção:</strong> Esta ferramenta *não* salva dados no servidor. Ela gera o novo arquivo JSON para você copiar e substituir.</p>
            
            <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px', marginTop: '30px', color: '#00bcd4' }}>1. Registrar Nova Partida</h2>
            
            <form onSubmit={handleSubmit}>
                
                {/* Detalhes da Partida (Grupo 1) - MELHORIA DE ALINHAMENTO */}
                <div className="admin-form-group">
                    <h3 style={{ marginTop: 0, color: '#e0e0e0', borderBottom: '1px solid #333', paddingBottom: '10px' }}>Times e Placar</h3>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        
                        {/* 1. Time da Casa */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontWeight: 'bold', color: '#e0e0e0', marginBottom: '5px' }}>Time da Casa:</label>
                            <select className="admin-select" name="timeCasaId" value={matchData.timeCasaId} onChange={handleMatchChange}>
                                {/* --- MUDANÇA AQUI --- */}
                                <option value="" disabled>-- Selecione um Time --</option>
                                {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                            </select>
                        </div>

                        <h3 style={{ margin: '25px 20px 0', color: '#e0e0e0' }}>VS</h3>

                        {/* 2. Time Visitante */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontWeight: 'bold', color: '#e0e0e0', marginBottom: '5px' }}>Time Visitante:</label>
                            <select className="admin-select" name="timeVisitanteId" value={matchData.timeVisitanteId} onChange={handleMatchChange}>
                                {/* --- MUDANÇA AQUI --- */}
                                <option value="" disabled>-- Selecione um Time --</option>
                                {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                            </select>
                        </div>
                        
                        {/* 3. Placar Final */}
                        <div style={{ marginLeft: '40px' }}>
                            <label style={{ fontWeight: 'bold', color: '#e0e0e0', display: 'block', marginBottom: '5px' }}>Placar Final:</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                {/* --- MUDANÇA AQUI --- */}
                                <input className="admin-input" type="number" name="golsCasa" value={matchData.golsCasa} onChange={handleMatchChange} min="0" style={{ width: '40px', textAlign: 'center' }} placeholder="0" />
                                <span style={{ color: '#e0e0e0' }}>-</span>
                                <input className="admin-input" type="number" name="golsVisitante" value={matchData.golsVisitante} onChange={handleMatchChange} min="0" style={{ width: '40px', textAlign: 'center' }} placeholder="0" />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Seção de Eventos (Grupo 2) - ALINHAMENTO CENTRALIZADO */}
                <div className="admin-form-group">
                    <h3 style={{ marginTop: 0, color: '#e0e0e0', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                        Eventos (Gols, Assistências, Cartões)
                    </h3>
                    
                    {/* Linha de Adição de Evento com centralização vertical */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}> 
                        
                        {/* Jogador */}
                        <select className="admin-select" name="jogadorId" value={novoEvento.jogadorId} onChange={handleNewEventChange} style={{ flex: 2 }}>
                            {/* --- MUDANÇA AQUI --- */}
                            <option value="" disabled>-- Selecione o Jogador --</option>
                            {jogadores.map(j => <option key={j.id} value={j.id}>{j.nome} ({times.find(t => t.id === j.time_id)?.nome})</option>)}
                        </select>
                        
                        {/* Tipo de Evento */}
                        <select className="admin-select" name="tipo" value={novoEvento.tipo} onChange={handleNewEventChange} style={{ flex: 1.5 }}>
                            <option value="" disabled>-- Selecione o Evento --</option>
                            <option value="gol">Gol</option>
                            <option value="assistencia">Assistência</option>
                            <option value="cartao_amarelo">Cartão Amarelo</option>
                            <option value="cartao_vermelho">Cartão Vermelho</option>
                        </select>
                        
                        {/* Minuto */}
                        <input 
                            className="admin-input" 
                            type="number" 
                            name="minuto" 
                            placeholder="Min" 
                            value={novoEvento.minuto} 
                            onChange={handleNewEventChange} 
                            style={{ width: '70px', textAlign: 'center' }} 
                        />

                        {/* Botão de Adicionar */}
                        <button 
                            type="button" 
                            onClick={handleAddEvent} 
                            className="btn-primary" 
                            style={{ backgroundColor: '#69f0ae', color: '#121212', fontSize: '1em', flex: 1, minWidth: '100px' }}
                        >
                            + Adicionar
                        </button>
                    </div>

                    {/* Lista de Eventos Cadastrados */}
                    <ul style={{ listStyleType: 'none', paddingLeft: '0', fontSize: '0.9em' }}>
                        {matchData.eventos.map((e, index) => (
                            <li key={index} style={{ padding: '5px 0', borderBottom: '1px dotted #333' }}>
                                **{e.tipo.toUpperCase()}** em **{e.minuto || '??'}**' por **{jogadores.find(j => j.id === e.jogadorId)?.nome}**
                            </li>
                        ))}
                    </ul>
                </div>

                <button type="submit" className="btn-primary">
                    GERAR NOVO ARQUIVO JSON PARA DEPLOY
                </button>
            </form>

            {/* --- Saída do JSON Gerado --- */}
            {jsonGerado && (
                <div style={{ marginTop: '40px' }}>
                    <h2>2. Salvar e Publicar</h2>
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
                    <table className="score-table">
                        <thead>
                            <tr style={{ backgroundColor: '#eee' }}><th>Time</th><th>J</th><th>P</th><th>V</th><th>E</th><th>D</th><th>SG</th></tr>
                        </thead>
                        <tbody>
                            {tabelaTeste && tabelaTeste.map(time => (
                                <tr key={time.id}>
                                    <td>{time.nome}</td>
                                    <td>{time.J}</td>
                                    <td>{time.P}</td>
                                    <td>{time.V}</td> {/* Exibe o número de vitórias */}
                                    <td>{time.E}</td> {/* Exibe o número de empates */}
                                    <td>{time.D}</td> {/* Exibe o número de derrotas */}
                                    <td>{time.SG}</td> {/* Exibe o saldo de gols */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}