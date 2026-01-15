const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// DEBUG: Mostra se .env está carregando
console.log('🔍 DEBUG DO .env:');
console.log('- PORT:', process.env.PORT);
console.log('- TMDB_API_KEY existe?', !!process.env.TMDB_API_KEY);
console.log('- TMDB_API_KEY valor:', TMDB_API_KEY ? '***' + TMDB_API_KEY.slice(-4) : 'NÃO DEFINIDA');
console.log('- NODE_ENV:', process.env.NODE_ENV);

// Se não carregou, usa chave direta
const API_KEY_FINAL = TMDB_API_KEY || '08d264815baddc8059d7a7bd88e18057';
console.log('- API Key que será usada:', '***' + API_KEY_FINAL.slice(-4));

app.use(cors());
app.use(express.json());

// =========== ROTAS EXISTENTES (MANTIDAS) ===========

// ROTA 1: Teste de conexão
app.get('/api/teste', (req, res) => {
  res.json({ 
    message: '✅ Backend funcionando!',
    tmdb: TMDB_API_KEY ? 'Conectado' : 'Não conectado',
    timestamp: new Date().toISOString()
  });
});

// ROTA 2: Filmes populares (substitui "Amores Impossíveis")
app.get('/api/filmes/internacionais', async (req, res) => {
  try {
    console.log('🌍 Buscando filmes internacionais...');
    
    const response = await axios.get('https://api.themoviedb.org/3/movie/popular', {
      params: {
        api_key: API_KEY_FINAL,
        language: 'pt-BR',
        page: 1,
        region: 'US'
      }
    });

    // Formata para SEU formato
    const filmesFormatados = response.data.results.slice(0, 4).map(filme => ({
      id: filme.id,
      titulo_pt: filme.title,
      titulo_original: filme.original_title,
      pais: getPaisPorIdioma(filme.original_language),
      bandeira: getBandeiraPorIdioma(filme.original_language),
      ano: filme.release_date ? filme.release_date.split('-')[0] : 'N/A',
      diretor: 'A carregar...', // TMDB precisa de outra chamada
      sinopse: filme.overview || 'Sinopse não disponível.',
      avaliacao_imdb: filme.vote_average.toFixed(1),
      cartaz_url: filme.poster_path 
        ? `https://image.tmdb.org/t/p/w500${filme.poster_path}`
        : null,
      onde_assistir: ['Netflix', 'Prime Video', 'HBO Max'], // Exemplo
      curiosidade: 'Filme internacional recomendado pelo TMDB.'
    }));

    res.json({
      sucesso: true,
      quantidade: filmesFormatados.length,
      filmes: filmesFormatados
    });

  } catch (error) {
    console.error('❌ Erro TMDB:', error.message);
    res.status(500).json({ 
      sucesso: false, 
      erro: 'Falha ao buscar filmes internacionais',
      detalhe: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// ROTA 3: Filmes brasileiros (substitui "Cinema Brasileiro")
app.get('/api/filmes/brasileiros', async (req, res) => {
  try {
    console.log('🇧🇷 Buscando filmes brasileiros...');
    
    const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
      params: {
        api_key: API_KEY_FINAL,
        language: 'pt-BR',
        with_original_language: 'pt',
        region: 'BR',
        sort_by: 'popularity.desc',
        page: 1
      }
    });

    const filmesFormatados = response.data.results.slice(0, 3).map(filme => ({
      id: filme.id,
      titulo_pt: filme.title,
      titulo_original: filme.original_title,
      pais: 'Brasil',
      bandeira: '🇧🇷',
      ano: filme.release_date ? filme.release_date.split('-')[0] : 'N/A',
      diretor: 'A carregar...',
      sinopse: filme.overview || 'Filme brasileiro recomendado.',
      avaliacao_imdb: filme.vote_average.toFixed(1),
      cartaz_url: filme.poster_path 
        ? `https://image.tmdb.org/t/p/w500${filme.poster_path}`
        : null,
      onde_assistir: ['Telecine', 'Looke', 'Prime Video'],
      curiosidade: 'Produção cinematográfica brasileira.'
    }));

    res.json({
      sucesso: true,
      quantidade: filmesFormatados.length,
      filmes: filmesFormatados
    });

  } catch (error) {
    console.error('❌ Erro TMDB:', error.message);
    res.status(500).json({ 
      sucesso: false, 
      erro: 'Falha ao buscar filmes brasileiros' 
    });
  }
});

// ROTA 4: Detalhes de um filme específico
app.get('/api/filme/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
      params: {
        api_key: API_KEY_FINAL,
        language: 'pt-BR'
      }
    });

    res.json({
      sucesso: true,
      filme: response.data
    });

  } catch (error) {
    res.status(500).json({ 
      sucesso: false, 
      erro: 'Filme não encontrado' 
    });
  }
});

// =========== NOVAS ROTAS PARA PAÍSES ===========

// ROTA 5: Lista de países suportados
app.get('/api/paises', async (req, res) => {
  try {
    console.log('🌍 Buscando lista de países do TMDB...');
    
    // Países mais populares (prioridade)
    const paisesPopulares = [
      { codigo: 'US', nome: 'Estados Unidos', bandeira: '🇺🇸' },
      { codigo: 'BR', nome: 'Brasil', bandeira: '🇧🇷' },
      { codigo: 'FR', nome: 'França', bandeira: '🇫🇷' },
      { codigo: 'JP', nome: 'Japão', bandeira: '🇯🇵' },
      { codigo: 'KR', nome: 'Coreia do Sul', bandeira: '🇰🇷' },
      { codigo: 'IN', nome: 'Índia', bandeira: '🇮🇳' },
      { codigo: 'DE', nome: 'Alemanha', bandeira: '🇩🇪' },
      { codigo: 'IT', nome: 'Itália', bandeira: '🇮🇹' },
      { codigo: 'ES', nome: 'Espanha', bandeira: '🇪🇸' },
      { codigo: 'RU', nome: 'Rússia', bandeira: '🇷🇺' },
      { codigo: 'MX', nome: 'México', bandeira: '🇲🇽' },
      { codigo: 'AR', nome: 'Argentina', bandeira: '🇦🇷' },
      { codigo: 'GB', nome: 'Reino Unido', bandeira: '🇬🇧' },
      { codigo: 'CN', nome: 'China', bandeira: '🇨🇳' },
      { codigo: 'CA', nome: 'Canadá', bandeira: '🇨🇦' },
      { codigo: 'AU', nome: 'Austrália', bandeira: '🇦🇺' },
      { codigo: 'PT', nome: 'Portugal', bandeira: '🇵🇹' },
      { codigo: 'SE', nome: 'Suécia', bandeira: '🇸🇪' },
      { codigo: 'NO', nome: 'Noruega', bandeira: '🇳🇴' },
      { codigo: 'DK', nome: 'Dinamarca', bandeira: '🇩🇰' }
    ];

    res.json({
      sucesso: true,
      total: paisesPopulares.length,
      paises: paisesPopulares,
      mensagem: `Carregados ${paisesPopulares.length} países populares`
    });

  } catch (error) {
    console.error('❌ Erro ao buscar países:', error);
    res.status(500).json({ 
      sucesso: false, 
      erro: 'Falha ao buscar lista de países' 
    });
  }
});

// ROTA 6: Filmes por país (GENÉRICA - funciona para QUALQUER país)
app.get('/api/filmes/pais/:codigoPais', async (req, res) => {
  try {
    const { codigoPais } = req.params;
    const { pagina = 1 } = req.query;
    
    console.log(`🎬 Buscando filmes do país: ${codigoPais} (página ${pagina})`);
    
    const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
      params: {
        api_key: API_KEY_FINAL,
        language: 'pt-BR',
        region: codigoPais,
        sort_by: 'popularity.desc',
        page: pagina,
        with_original_language: getIdiomaPrincipal(codigoPais)
      }
    });

    // Formata os filmes
    const filmesFormatados = response.data.results.map(filme => ({
      id: filme.id,
      titulo_pt: filme.title || filme.original_title,
      titulo_original: filme.original_title,
      pais: getNomePais(codigoPais),
      bandeira: getBandeira(codigoPais),
      ano: filme.release_date ? filme.release_date.split('-')[0] : 'N/A',
      diretor: 'A carregar...',
      sinopse: filme.overview || `Filme ${getNomePais(codigoPais).toLowerCase()} popular.`,
      avaliacao: filme.vote_average.toFixed(1),
      cartaz_url: filme.poster_path 
        ? `https://image.tmdb.org/t/p/w500${filme.poster_path}`
        : null,
      total_paginas: response.data.total_pages,
      total_filmes: response.data.total_results
    }));

    res.json({
      sucesso: true,
      pais: {
        codigo: codigoPais,
        nome: getNomePais(codigoPais),
        bandeira: getBandeira(codigoPais)
      },
      pagina: parseInt(pagina),
      total_paginas: response.data.total_pages,
      total_filmes: response.data.total_results,
      filmes: filmesFormatados
    });

  } catch (error) {
    console.error(`❌ Erro ao buscar filmes do país ${req.params.codigoPais}:`, error.message);
    res.status(500).json({ 
      sucesso: false, 
      erro: `Falha ao buscar filmes do país ${req.params.codigoPais}`,
      detalhe: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// ROTA 7: Buscar filmes por gênero (PARA FUTURO)
app.get('/api/filmes/genero/:idGenero', async (req, res) => {
  try {
    const { idGenero } = req.params;
    
    const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
      params: {
        api_key: API_KEY_FINAL,
        language: 'pt-BR',
        with_genres: idGenero,
        sort_by: 'popularity.desc',
        page: 1
      }
    });

    const filmesFormatados = response.data.results.slice(0, 10).map(filme => ({
      id: filme.id,
      titulo_pt: filme.title,
      avaliacao: filme.vote_average.toFixed(1),
      cartaz_url: filme.poster_path ? `https://image.tmdb.org/t/p/w500${filme.poster_path}` : null
    }));

    res.json({
      sucesso: true,
      genero: idGenero,
      filmes: filmesFormatados
    });

  } catch (error) {
    res.status(500).json({ sucesso: false, erro: 'Falha ao buscar filmes por gênero' });
  }
});

// =========== FUNÇÕES AUXILIARES ===========

// Funções originais (mantidas)
function getPaisPorIdioma(idioma) {
  const paises = {
    'en': 'Estados Unidos',
    'es': 'Espanha',
    'fr': 'França',
    'it': 'Itália',
    'de': 'Alemanha',
    'ja': 'Japão',
    'ko': 'Coreia do Sul',
    'hi': 'Índia',
    'pt': 'Brasil'
  };
  return paises[idioma] || 'Internacional';
}

function getBandeiraPorIdioma(idioma) {
  const bandeiras = {
    'en': '🇺🇸',
    'es': '🇪🇸',
    'fr': '🇫🇷',
    'it': '🇮🇹',
    'de': '🇩🇪',
    'ja': '🇯🇵',
    'ko': '🇰🇷',
    'hi': '🇮🇳',
    'pt': '🇧🇷'
  };
  return bandeiras[idioma] || '🎬';
}

// Novas funções para países
function getNomePais(codigo) {
  const paises = {
    'US': 'Estados Unidos', 'BR': 'Brasil', 'FR': 'França', 'JP': 'Japão',
    'KR': 'Coreia do Sul', 'IN': 'Índia', 'DE': 'Alemanha', 'IT': 'Itália',
    'ES': 'Espanha', 'RU': 'Rússia', 'MX': 'México', 'AR': 'Argentina',
    'GB': 'Reino Unido', 'CN': 'China', 'CA': 'Canadá', 'AU': 'Austrália',
    'PT': 'Portugal', 'SE': 'Suécia', 'NO': 'Noruega', 'DK': 'Dinamarca'
  };
  return paises[codigo] || `País ${codigo}`;
}

function getBandeira(codigo) {
  const bandeiras = {
    'US': '🇺🇸', 'BR': '🇧🇷', 'FR': '🇫🇷', 'JP': '🇯🇵', 'KR': '🇰🇷',
    'IN': '🇮🇳', 'DE': '🇩🇪', 'IT': '🇮🇹', 'ES': '🇪🇸', 'RU': '🇷🇺',
    'MX': '🇲🇽', 'AR': '🇦🇷', 'GB': '🇬🇧', 'CN': '🇨🇳', 'CA': '🇨🇦',
    'AU': '🇦🇺', 'PT': '🇵🇹', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰'
  };
  return bandeiras[codigo] || '🎬';
}

function getIdiomaPrincipal(codigoPais) {
  const idiomas = {
    'US': 'en', 'GB': 'en', 'BR': 'pt', 'PT': 'pt',
    'FR': 'fr', 'ES': 'es', 'MX': 'es', 'AR': 'es',
    'DE': 'de', 'IT': 'it', 'JP': 'ja', 'KR': 'ko',
    'CN': 'zh', 'IN': 'hi', 'RU': 'ru'
  };
  return idiomas[codigoPais] || null;
}

// =========== INICIAR SERVIDOR ===========

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🎬 BACKEND TMDB CONFIGURADO COM SUCESSO!');
  console.log('='.repeat(60));
  console.log(`📡 URL Local: http://localhost:${PORT}`);
  console.log(`🔑 TMDB Key: ${TMDB_API_KEY ? '✅ CONECTADA' : '❌ FALTANDO'}`);
  console.log('\n📋 ENDPOINTS DISPONÍVEIS:');
  console.log('   • http://localhost:' + PORT + '/api/teste');
  console.log('   • http://localhost:' + PORT + '/api/filmes/brasileiros');
  console.log('   • http://localhost:' + PORT + '/api/filmes/internacionais');
  console.log('   • http://localhost:' + PORT + '/api/filme/550 (exemplo)');
  console.log('\n🌍 NOVOS ENDPOINTS PARA PAÍSES:');
  console.log('   • http://localhost:' + PORT + '/api/paises');
  console.log('   • http://localhost:' + PORT + '/api/filmes/pais/BR');
  console.log('   • http://localhost:' + PORT + '/api/filmes/pais/US');
  console.log('   • http://localhost:' + PORT + '/api/filmes/pais/JP');
  console.log('='.repeat(60));
  console.log('\n⚡ DICA: Teste no navegador: http://localhost:' + PORT + '/api/paises');
  console.log('='.repeat(60) + '\n');
});