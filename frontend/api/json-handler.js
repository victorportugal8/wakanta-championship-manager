import { put, get } from '@vercel/blob';

// A Vercel automaticamente detecta este arquivo como um endpoint de API
// que ficará acessível em /api/json-handler

export default async function handler(request, response) {
  
  const blobPath = 'campeonato.json'; // O nome do arquivo no Vercel Blob

  // --- MÉTODO POST: Usado pelo AdminTool para SALVAR ---
  if (request.method === 'POST') {
    try {
      // 1. Pega o JSON enviado pelo AdminTool (como string)
      const novoJsonString = request.body;

      // 2. Validação básica
      if (!novoJsonString) {
        return response.status(400).json({ error: 'Corpo do JSON está vazio.' });
      }
      
      // 3. Tenta parsear para garantir que é um JSON válido
      JSON.parse(novoJsonString);

      // 4. Sobrescreve o 'campeonato.json' no Vercel Blob
      const blob = await put(blobPath, novoJsonString, {
        access: 'public', // Torna o arquivo publicamente legível
        contentType: 'application/json',
        // O token é lido automaticamente das variáveis de ambiente pela Vercel
      });

      // 5. Retorna o sucesso
      return response.status(200).json({ message: 'JSON salvo com sucesso', blob });

    } catch (error) {
      console.error("ERRO AO SALVAR NO BLOB:", error);
      return response.status(500).json({ error: 'Falha ao salvar o JSON.', details: error.message });
    }
  }

  // --- MÉTODO GET: Usado pelo Tabela.jsx e AdminTool para LER ---
  if (request.method === 'GET') {
    try {
      // 1. Busca o 'campeonato.json' do Vercel Blob
      const blob = await get(blobPath); // O token é lido automaticamente

      if (!blob) {
        return response.status(404).json({ error: 'Arquivo JSON não encontrado no Blob.' });
      }
      
      // 2. Retorna o conteúdo do JSON
      const dados = await blob.json();
      return response.status(200).json(dados);

    } catch (error) {
      console.error("ERRO AO LER DO BLOB:", error);
      return response.status(500).json({ error: 'Falha ao ler o JSON do Blob.', details: error.message });
    }
  }

  // --- Outros Métodos ---
  return response.status(405).json({ error: 'Método não permitido.' });
}