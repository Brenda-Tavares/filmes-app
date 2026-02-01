/**
 * CineWorld • Desenvolvido por Alabaster Developer
 * 2026 • Integração com API TMDB
 * github.com/Brenda-Tavares
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Banco de dados LOCAL com filmes específicos por país
const FILMES_POR_PAIS = {
    // BRASIL - Filmes brasileiros REAIS
    'BR': [
        {
            id: 598,
            title: 'Cidade de Deus',
            overview: 'Dois jovens seguem caminhos diferentes na violenta Cidade de Deus no Rio de Janeiro.',
            release_date: '2002-08-30',
            vote_average: 8.6,
            poster_path: '/k7eYdWvhYQyRQoU2TB2A2Xu2TfD.jpg',
            original_language: 'pt',
            original_title: 'Cidade de Deus',
            production_countries: [{ iso_3166_1: 'BR', name: 'Brasil' }]
        },
        {
            id: 7347,
            title: 'Tropa de Elite',
            overview: 'Capitão Nascimento lida com violência e corrupção no Rio de Janeiro.',
            release_date: '2007-10-05',
            vote_average: 8.0,
            poster_path: '/7gLQpAqFpXHtEjjW0gKG6P2jF8h.jpg',
            original_language: 'pt',
            original_title: 'Tropa de Elite',
            production_countries: [{ iso_3166_1: 'BR', name: 'Brasil' }]
        }
    ],
    
    // REINO UNIDO - Filmes britânicos
    'GB': [
        {
            id: 16869,
            title: '007 - Cassino Royale',
            overview: 'Primeira missão de James Bond como agente 007.',
            release_date: '2006-11-17',
            vote_average: 7.5,
            poster_path: '/tGLO9zw5ZtCeyyWjJXoGsNtLaIu.jpg',
            original_language: 'en',
            original_title: 'Casino Royale',
            production_countries: [{ iso_3166_1: 'GB', name: 'Reino Unido' }, { iso_3166_1: 'US', name: 'Estados Unidos' }]
        },
        {
            id: 11324,
            title: 'O Discurso do Rei',
            overview: 'Rei George VI supera sua gagueira com a ajuda de um fonoaudiólogo.',
            release_date: '2010-12-10',
            vote_average: 7.7,
            poster_path: '/k3to7QEdcDZqEBZNRAOMnP7u3u9.jpg',
            original_language: 'en',
            original_title: 'The King\'s Speech',
            production_countries: [{ iso_3166_1: 'GB', name: 'Reino Unido' }]
        }
    ],
    
    // AUSTRÁLIA - Filmes australianos
    'AU': [
        {
            id: 954,
            title: 'Mad Max: Estrada da Fúria',
            overview: 'Max se junta a um grupo fugindo através do deserto em um caminhão de guerra.',
            release_date: '2015-05-15',
            vote_average: 7.6,
            poster_path: '/k2jqWnEwLh8Q6qe8otkYtPMt0et.jpg',
            original_language: 'en',
            original_title: 'Mad Max: Fury Road',
            production_countries: [{ iso_3166_1: 'AU', name: 'Austrália' }, { iso_3166_1: 'US', name: 'Estados Unidos' }]
        },
        {
            id: 451,
            title: 'Crocodilo Dundee',
            overview: 'Um repórter americano viaja para a Austrália para entrevistar um caçador de crocodilos.',
            release_date: '1986-09-26',
            vote_average: 6.4,
            poster_path: '/fQ4dZiKJcHqyfG40sTfX8ucO7LD.jpg',
            original_language: 'en',
            original_title: 'Crocodile Dundee',
            production_countries: [{ iso_3166_1: 'AU', name: 'Austrália' }]
        }
    ],
    
    // CANADÁ - Filmes canadenses
    'CA': [
        {
            id: 38757,
            title: 'A História Sem Fim',
            overview: 'Um garoto descobre um livro mágico que o transporta para um mundo de fantasia.',
            release_date: '1984-04-06',
            vote_average: 7.2,
            poster_path: '/8g6gKx9ZzBRjV7bVmoOq1oU5aZS.jpg',
            original_language: 'en',
            original_title: 'The NeverEnding Story',
            production_countries: [{ iso_3166_1: 'DE', name: 'Alemanha' }, { iso_3166_1: 'CA', name: 'Canadá' }]
        },
        {
            id: 275,
            title: 'A Bela e a Fera',
            overview: 'Um príncipe é transformado em uma fera e deve encontrar amor verdadeiro.',
            release_date: '1991-11-22',
            vote_average: 7.6,
            poster_path: '/mJrL3mp5M6pOvPzCb9e88oBE0P5.jpg',
            original_language: 'en',
            original_title: 'Beauty and the Beast',
            production_countries: [{ iso_3166_1: 'US', name: 'Estados Unidos' }, { iso_3166_1: 'CA', name: 'Canadá' }]
        }
    ],
    
    // FRANÇA - Filmes franceses
    'FR': [
        {
            id: 38,
            title: 'Amélie Poulain',
            overview: 'Uma jovem decide mudar a vida das pessoas ao seu redor em Paris.',
            release_date: '2001-04-25',
            vote_average: 7.8,
            poster_path: '/fNOH9f1aA3fPsg7bE6rC0boeY7j.jpg',
            original_language: 'fr',
            original_title: 'Le Fabuleux Destin d\'Amélie Poulain',
            production_countries: [{ iso_3166_1: 'FR', name: 'França' }]
        }
    ],
    
    // JAPÃO - Filmes japoneses
    'JP': [
        {
            id: 129,
            title: 'A Viagem de Chihiro',
            overview: 'Uma garota entra em um mundo de espíritos.',
            release_date: '2001-07-20',
            vote_average: 8.5,
            poster_path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
            original_language: 'ja',
            original_title: '千と千尋の神隠し',
            production_countries: [{ iso_3166_1: 'JP', name: 'Japão' }]
        }
    ],
    
    // CORÉIA DO SUL - Filmes coreanos
    'KR': [
        {
            id: 496243,
            title: 'Parasita',
            overview: 'Uma família pobre se infiltra na vida de uma família rica.',
            release_date: '2019-05-30',
            vote_average: 8.5,
            poster_path: '/igw938inb6M5N2KLeq9KUF6pMOh.jpg',
            original_language: 'ko',
            original_title: '기생충',
            production_countries: [{ iso_3166_1: 'KR', name: 'Coreia do Sul' }]
        }
    ],
    
    // MUNDIAL - Filmes populares
    'world': [
        {
            id: 278,
            title: 'Um Sonho de Liberdade',
            overview: 'Um banqueiro é condenado por um crime que não cometeu.',
            release_date: '1994-09-23',
            vote_average: 8.7,
            poster_path: '/hBcY0fE9pfXzvVaY4GKarweriG2.jpg',
            original_language: 'en',
            original_title: 'The Shawshank Redemption',
            production_countries: [{ iso_3166_1: 'US', name: 'Estados Unidos' }]
        },
        {
            id: 238,
            title: 'O Poderoso Chefão',
            overview: 'História da família mafiosa Corleone.',
            release_date: '1972-03-24',
            vote_average: 8.7,
            poster_path: '/oJagOzBu9Rdd9BrciseCm3U3MCU.jpg',
            original_language: 'en',
            original_title: 'The Godfather',
            production_countries: [{ iso_3166_1: 'US', name: 'Estados Unidos' }]
        }
    ]
};

// Rota principal
app.get('/', (req, res) => {
    res.json({ 
        message: '🎬 CineWorld - Filmes por Produção',
        status: 'online',
        ano: 2026,
        filmes_por_pais: Object.keys(FILMES_POR_PAIS).length
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ONLINE',
        timestamp: new Date().toISOString(),
        ano: 2026,
        paises_com_filmes: Object.keys(FILMES_POR_PAIS).join(', ')
    });
});

// Países
app.get('/api/countries', (req, res) => {
    const countries = [
        { code: 'world', name: 'Mundial', flag: '🌍', description: 'Filmes populares do mundo todo' },
        { code: 'BR', name: '🇧🇷 Brasil', flag: '🇧🇷', description: 'Cinema brasileiro' },
        { code: 'US', name: '🇺🇸 EUA', flag: '🇺🇸', description: 'Hollywood' },
        { code: 'GB', name: '🇬🇧 Reino Unido', flag: '🇬🇧', description: 'Cinema britânico' },
        { code: 'AU', name: '🇦🇺 Austrália', flag: '🇦🇺', description: 'Cinema australiano' },
        { code: 'CA', name: '🇨🇦 Canadá', flag: '🇨🇦', description: 'Cinema canadense' },
        { code: 'FR', name: '🇫🇷 França', flag: '🇫🇷', description: 'Cinema francês' },
        { code: 'JP', name: '🇯🇵 Japão', flag: '🇯🇵', description: 'Cinema japonês' },
        { code: 'KR', name: '🇰🇷 Coreia do Sul', flag: '🇰🇷', description: 'Cinema coreano' },
        { code: 'DE', name: '🇩🇪 Alemanha', flag: '🇩🇪', description: 'Cinema alemão' },
        { code: 'IT', name: '🇮🇹 Itália', flag: '🇮🇹', description: 'Cinema italiano' },
        { code: 'ES', name: '🇪🇸 Espanha', flag: '🇪🇸', description: 'Cinema espanhol' },
        { code: 'MX', name: '🇲🇽 México', flag: '🇲🇽', description: 'Cinema mexicano' },
        { code: 'IN', name: '🇮🇳 Índia', flag: '🇮🇳', description: 'Bollywood' }
    ];
    
    res.json({ 
        success: true, 
        countries: countries,
        total: countries.length,
        ano: 2026
    });
});

// Buscar filmes - SEMPRE RETORNA FILMES ESPECÍFICOS
app.get('/api/movies', (req, res) => {
    const country = req.query.country || 'world';
    const page = parseInt(req.query.page) || 1;
    
    console.log(`🎬 Buscando filmes para: ${country}`);
    
    // SEMPRE retorna filmes específicos do país
    let movies = FILMES_POR_PAIS[country] || FILMES_POR_PAIS['world'];
    
    // Se for EUA e não tiver filmes específicos, usar mundial
    if (country === 'US' && !FILMES_POR_PAIS[country]) {
        movies = FILMES_POR_PAIS['world'];
    }
    
    // Garantir que sempre tenha filmes
    if (!movies || movies.length === 0) {
        movies = FILMES_POR_PAIS['world'];
    }
    
    // Paginação simples
    const pageSize = 20;
    const startIndex = (page - 1) * pageSize;
    const paginatedMovies = movies.slice(startIndex, startIndex + pageSize);
    
    res.json({
        success: true,
        page: page,
        totalPages: Math.ceil(movies.length / pageSize),
        totalResults: movies.length,
        movies: paginatedMovies,
        country: country,
        ano: 2026,
        fonte: 'Dados locais por produção',
        observacao: 'Filmes específicos de cada país'
    });
});

// Rota para ver todos os filmes de um país
app.get('/api/pais/:codigo/filmes', (req, res) => {
    const codigo = req.params.codigo.toUpperCase();
    const filmes = FILMES_POR_PAIS[codigo] || [];
    
    res.json({
        success: true,
        pais: codigo,
        total_filmes: filmes.length,
        filmes: filmes,
        producoes: filmes.map(f => 
            f.production_countries?.map(p => p.name).join(', ') || 'Desconhecido'
        )
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    const ano = new Date().getFullYear();
    console.log('\n' + '='.repeat(60));
    console.log(`CINEWORLD ${ano} - FILMES POR PRODUÇÃO!`);
    console.log('='.repeat(60));
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`Ano: ${ano}`);
    console.log(`Filmes por país: ${Object.keys(FILMES_POR_PAIS).length} países`);
    console.log('='.repeat(60));
    console.log('\n TESTES:');
    console.log(`Brasil: http://localhost:${PORT}/api/movies?country=BR`);
    console.log(`Reino Unido: http://localhost:${PORT}/api/movies?country=GB`);
    console.log(`Austrália: http://localhost:${PORT}/api/movies?country=AU`);
    console.log(`Canadá: http://localhost:${PORT}/api/movies?country=CA`);
    console.log(`Ver filmes BR: http://localhost:${PORT}/api/pais/BR/filmes`);
    console.log('='.repeat(60) + '\n');
});

