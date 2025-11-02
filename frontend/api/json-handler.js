import { put, head } from '@vercel/blob'; // <-- MUDANÇA 1: Trocamos 'get' por 'head'

// O nome do arquivo no Vercel Blob
const blobPath = 'campeonato.json';

export default async function handler(request, response) {
  
  // --- MÉTODO POST (CORRIGIDO) ---
  if (request.method === 'POST') {
    try {
      // 1. O 'request.body' JÁ É UM OBJETO, pois a Vercel fez o parse.
      const novoDadosObjeto = request.body; 

      // 2. Validação (checa se é um objeto e não nulo)
      if (!novoDadosObjeto || typeof novoDadosObjeto !== 'object' || Array.isArray(novoDadosObjeto)) {
        return response.status(400).json({ error: 'Corpo do JSON é inválido ou não é um objeto.' });
      }
      
      // 3. Converte o OBJETO de volta para uma STRING (para salvar no Blob)
      const stringParaSalvar = JSON.stringify(novoDadosObjeto, null, 2);

      // 4. Salva a STRING no Vercel Blob
      const blob = await put(blobPath, stringParaSalvar, {
        access: 'public',
        contentType: 'application/json',
        allowOverwrite: true // <-- A SOLUÇÃO ESTÁ AQUI
      });

      return response.status(200).json({ message: 'JSON salvo com sucesso', blob });

    } catch (error) { // O catch agora lidará com erros do stringify ou put
      console.error("ERRO AO SALVAR (POST) NO BLOB:", error.message);
      return response.status(500).json({ error: 'Falha ao salvar o JSON.', details: error.message });
    }
  }

  // --- MÉTODO GET ---
  if (request.method === 'GET') {
    
    console.log(`API 'GET': Tentando buscar metadados de '${blobPath}'...`);

    try {
      // 1. Tenta buscar os METADADOS do arquivo
      // (Isso verifica se o arquivo existe e nos dá a URL dele)
      const blob = await head(blobPath); // <-- MUDANÇA 2: Usando head()

      if (!blob) {
        console.error("ERRO DE LEITURA: Blob não encontrado (head retornou null).");
        return response.status(404).json({ error: 'Arquivo JSON não encontrado no Blob.' });
      }
      
      console.log(`API 'GET': Blob encontrado. URL: ${blob.url}. Lendo conteúdo...`);

      // 2. USA O FETCH PADRÃO para baixar o conteúdo do arquivo
      const dataResponse = await fetch(blob.url);
      
      if (!dataResponse.ok) {
          throw new Error(`Falha ao baixar o arquivo do Blob. Status: ${dataResponse.status}`);
      }

      // 3. Lê o arquivo como TEXTO
      const jsonText = await dataResponse.text();

      // 4. Tenta fazer o "parse" do texto
      try {
        const dados = JSON.parse(jsonText);
        
        console.log("API 'GET': Parse do JSON feito com sucesso. Retornando dados.");
        return response.status(200).json(dados); // SUCESSO!
      
      } catch (parseError) {
        // Se falhar, o JSON está corrompido!
        console.error("ERRO DE PARSE DO JSON (CONTEÚDO INVÁLIDO):", parseError.message);
        console.error("CONTEÚDO DO ARQUIVO (início):", jsonText.substring(0, 200) + '...');
        
        return response.status(500).json({ 
          error: 'O arquivo JSON no Blob está corrompido ou mal formatado.',
          details: parseError.message,
        });
      }

    } catch (blobError) {
      console.error("ERRO GERAL AO BUSCAR O BLOB (GET):", blobError.message);
      return response.status(500).json({ error: 'Falha ao buscar o arquivo do Blob.', details: blobError.message });
    }
  }

  // --- Outros Métodos ---
  return response.status(405).json({ error: 'Método não permitido.' });
}