import dadosCampeonato from '../data/campeonato.json';
import { calcularClassificacao } from '../utils/calculadora';

function Tabela() {
    // A tabela é calculada uma única vez quando o componente é renderizado
    const tabelaFinal = calcularClassificacao(dadosCampeonato);

    return (
        <table className="tabela-campeonato">
            <thead>
                <tr><th>Pos</th><th>Time</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th></tr>
            </thead>
            <tbody>
                {tabelaFinal.map((time, index) => (
                    <tr key={time.id}>
                        <td>{index + 1}</td>
                        <td>{time.nome}</td>
                        <td>{time.P}</td>
                        <td>{time.J}</td>
                        <td>{time.V}</td>
                        <td>{time.E}</td>
                        <td>{time.D}</td>
                        <td>{time.GP}</td>
                        <td>{time.GC}</td>
                        <td>{time.SG}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
export default Tabela;