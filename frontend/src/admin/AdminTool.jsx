import dadosAntigos from '../data/campeonato.json';
// Importe a função de cálculo para verificar se o JSON está OK

function generateNewJson(newMatch) {
    // 1. Clonar os dados antigos
    const novosDados = JSON.parse(JSON.stringify(dadosAntigos));
    
    // 2. Definir o ID da nova partida (simplesmente o último ID + 1)
    const ultimoId = novosDados.partidas.length > 0
        ? novosDados.partidas[novosDados.partidas.length - 1].id
        : 0;
    
    const novoMatchObjeto = {
        id: ultimoId + 1,
        time_casa_id: parseInt(newMatch.timeCasaId),
        time_visitante_id: parseInt(newMatch.timeVisitanteId),
        gols_casa: parseInt(newMatch.golsCasa),
        gols_visitante: parseInt(newMatch.golsVisitante),
        data_partida: new Date().toISOString().slice(0, 10), // Data de hoje
        eventos: newMatch.eventos.map(e => ({
            ...e, 
            partida_id: ultimoId + 1
        }))
    };
    
    // 3. Adicionar a nova partida
    novosDados.partidas.push(novoMatchObjeto);
    
    // 4. Transformar em string JSON formatada (para facilitar a leitura/cópia)
    // O 'null, 2' garante a identação, crucial para legibilidade.
    const newJsonString = JSON.stringify(novosDados, null, 2);
    
    return newJsonString;
}

function AdminTool() {
    const [matchData, setMatchData] = useState({ /* ... estado do formulário ... */ });
    const [jsonGerado, setJsonGerado] = useState('');
    const [tabelaTeste, setTabelaTeste] = useState(null); // Para pré-visualizar

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // 1. Gera o novo JSON como string
        const novaStringJson = generateNewJson(matchData);
        setJsonGerado(novaStringJson);
        
        // 2. (OPCIONAL) Pré-visualizar a tabela com os novos dados
        const novosDadosObjeto = JSON.parse(novaStringJson);
        const tabelaCalculada = calcularClassificacao(novosDadosObjeto);
        setTabelaTeste(tabelaCalculada);

        alert('Novo JSON Gerado! Role para baixo e copie o conteúdo da caixa.');
    };

    return (
        <div className="admin-container">
            <h1>Ferramenta de Administração (Gerador de JSON)</h1>
            
            {/* O SEU FORMULÁRIO DE ENTRADA */}
            <form onSubmit={handleSubmit}>
                {/* ... Campos para Time Casa/Visitante, Gols ... */}
                {/* ... Botão de Adicionar Evento ... */}
                <button type="submit">Gerar Novo JSON</button>
            </form>

            <hr />

            {jsonGerado && (
                <div className="json-output">
                    <h2>⚠️ NOVO JSON PARA CÓPIA (PASSO CRÍTICO)</h2>
                    <p>1. Copie todo o conteúdo da caixa de texto abaixo.</p>
                    <p>2. Substitua o conteúdo do arquivo <code>src/data/campeonato.json</code> no seu projeto local.</p>
                    <p>3. Faça o commit e deploy para atualizar o site.</p>
                    
                    {/* A área de texto que você copiará */}
                    <textarea 
                        value={jsonGerado} 
                        readOnly 
                        rows="20" 
                        cols="100"
                        style={{ width: '100%' }}
                    />
                    
                    {/* (Opcional) Pré-visualização para checar se o cálculo está OK */}
                    <h3>Pré-visualização da Tabela</h3>
                    {/* Renderize aqui o componente TabelaClassificacao usando 'tabelaTeste' */}
                </div>
            )}
        </div>
    );
}