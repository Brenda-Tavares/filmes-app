const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'SUA_CHAVE_TMDB_AQUI';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rota de teste
app.get('/', (req, res) => {
    res.json({ 
        message: 'CineWorld API TMDB - FILTRO POR GÊNERO', 
        status: 'online',
        ano: 2026,
        endpoints: {
            genres: '/api/genres',
            movies: '/api/movies?genre=28',
            search: '/api/movies?query=avatar',
            health: '/api/health'
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ONLINE', 
        timestamp: new Date().toISOString(),
        tmdb: TMDB_API_KEY ? 'CONECTADO' : 'SEM CHAVE',
        ano: 2026
    });
});

// Lista de gêneros
app.get('/api/genres', (req, res) => {
    const genres = [
        {
            id: 0,
            name: 'Todos os Filmes',
            description: 'Filmes de todos os gêneros',
            icon: '🎬',
            color: '#4361ee'
        },
        {
            id: 28,
            name: 'Ação',
            description: 'Filmes com muita adrenalina, perseguições e lutas',
            icon: '💥',
            color: '#e63946'
        },
        {
            id: 12,
            name: 'Aventura',
            description: 'Filmes de exploração e jornadas emocionantes',
            icon: '🧭',
            color: '#2a9d8f'
        },
        {
            id: 16,
            name: 'Animação',
            description: 'Filmes animados para todas as idades',
            icon: '🐭',
            color: '#e9c46a'
        },
        {
            id: 35,
            name: 'Comédia',
            description: 'Filmes para rir e se divertir',
            icon: '😂',
            color: '#f4a261'
        },
        {
            id: 80,
            name: 'Crime',
            description: 'Filmes sobre investigações e atividades criminosas',
            icon: '🕵️',
            color: '#264653'
        },
        {
            id: 99,
            name: 'Documentário',
            description: 'Filmes baseados em fatos reais',
            icon: '📽️',
            color: '#457b9d'
        },
        {
            id: 18,
            name: 'Drama',
            description: 'Filmes emocionantes e profundos',
            icon: '🎭',
            color: '#6d6875'
        },
        {
            id: 10751,
            name: 'Família',
            description: 'Filmes para assistir em família',
            icon: '👨‍👩‍👧‍👦',
            color: '#ffafcc'
        },
        {
            id: 14,
            name: 'Fantasia',
            description: 'Filmes com magia e mundos imaginários',
            icon: '🧙',
            color: '#7209b7'
        },
        {
            id: 36,
            name: 'História',
            description: 'Filmes baseados em eventos históricos',
            icon: '📜',
            color: '#bc6c25'
        },
        {
            id: 27,
            name: 'Terror',
            description: 'Filmes assustadores e de suspense',
            icon: '👻',
            color: '#3a0ca3'
        },
        {
            id: 10402,
            name: 'Música',
            description: 'Filmes sobre música e músicos',
            icon: '🎵',
            color: '#ff006e'
        },
        {
            id: 9648,
            name: 'Mistério',
            description: 'Filmes com enigmas e segredos',
            icon: '🔍',
            color: '#0077b6'
        },
        {
            id: 10749,
            name: 'Romance',
            description: 'Filmes de amor e relacionamentos',
            icon: '❤️',
            color: '#e63946'
        },
        {
            id: 878,
            name: 'Ficção Científica',
            description: 'Filmes sobre tecnologia e futuro',
            icon: '🚀',
            color: '#4cc9f0'
        },
        {
            id: 10770,
            name: 'Cinema TV',
            description: 'Filmes feitos para televisão',
            icon: '📺',
            color: '#9d4edd'
        },
        {
            id: 53,
            name: 'Thriller',
            description: 'Filmes de suspense e tensão',
            icon: '😱',
            color: '#003049'
        },
        {
            id: 10752,
            name: 'Guerra',
            description: 'Filmes sobre conflitos militares',
            icon: '⚔️',
            color: '#780000'
        },
        {
            id: 37,
            name: 'Faroeste',
            description: 'Filmes de cowboy e velho oeste',
            icon: '🤠',
            color: '#d4a373'
        }
    ];
    
    res.json({ 
        success: true, 
        genres: genres,
        total: genres.length,
        ano: 2026
    });
});

// BUSCA DE FILMES POR GÊNERO
app.get('/api/movies', async (req, res) => {
    try {
        const { 
            genre = '0', // 0 = todos os filmes
            page = 1, 
            query = '',
            language = 'pt-BR'
        } = req.query;
        
        console.log('REQUEST: genre=' + genre + ', page=' + page + ', query="' + query + '"');
        
        let url, params = {
            api_key: TMDB_API_KEY,
            page: parseInt(page),
            language: language,
            include_adult: false
        };
        
        // Se houver busca por texto
        if (query && query.trim() !== '') {
            console.log('Modo: BUSCA por "' + query + '"');
            url = TMDB_BASE_URL + '/search/movie';
            params.query = query;
        }
        // Se for todos os filmes
        else if (genre === '0' || genre === 'all') {
            console.log('Modo: TODOS OS FILMES');
            url = TMDB_BASE_URL + '/movie/popular';
        }
        // Se for um gênero específico
        else {
            console.log('Modo: GÊNERO ID ' + genre);
            url = TMDB_BASE_URL + '/discover/movie';
            params.with_genres = genre;
            params.sort_by = 'popularity.desc';
        }
        
        const response = await axios.get(url, { params });
        
        // Processar resultados para adicionar informações de país/idioma
        const processedMovies = response.data.results.map(movie => {
            return {
                ...movie,
                production_country: getCountryFromLanguage(movie.original_language),
                language_name: getLanguageName(movie.original_language)
            };
        });
        
        res.json({
            success: true,
            page: response.data.page,
            totalPages: response.data.total_pages > 500 ? 500 : response.data.total_pages,
            totalResults: response.data.total_results,
            movies: processedMovies,
            genre: genre,
            query: query || null,
            ano: 2026
        });
        
    } catch (error) {
        console.error('ERRO TMDB:', error.message);
        
        // Fallback para dados mock organizados por gênero
        const mockMovies = getMockMoviesByGenre(req.query.genre || '0');
        const pageSize = 20;
        const page = parseInt(req.query.page) || 1;
        const startIndex = (page - 1) * pageSize;
        const paginatedMovies = mockMovies.slice(startIndex, startIndex + pageSize);
        
        res.json({
            success: true,
            page: page,
            totalPages: Math.ceil(mockMovies.length / pageSize),
            totalResults: mockMovies.length,
            movies: paginatedMovies,
            genre: req.query.genre || '0',
            query: req.query.query || null,
            warning: 'Usando dados de exemplo - TMDB offline',
            ano: 2026
        });
    }
});

// Função para obter nome do idioma
function getLanguageName(languageCode) {
    const languageNames = {
        'pt': 'Português',
        'en': 'Inglês',
        'es': 'Espanhol',
        'fr': 'Francês',
        'de': 'Alemão',
        'it': 'Italiano',
        'ja': 'Japonês',
        'ko': 'Coreano',
        'zh': 'Chinês',
        'hi': 'Hindi',
        'ru': 'Russo',
        'ar': 'Árabe',
        'nl': 'Holandês',
        'sv': 'Sueco',
        'no': 'Norueguês',
        'da': 'Dinamarquês',
        'fi': 'Finlandês',
        'pl': 'Polonês',
        'cs': 'Tcheco',
        'hu': 'Húngaro',
        'tr': 'Turco',
        'th': 'Tailandês'
    };
    
    return languageNames[languageCode] || 'Outro idioma';
}

// Função para determinar país baseado no idioma
function getCountryFromLanguage(languageCode) {
    const languageToCountry = {
        'pt': 'Brasil/Portugal',
        'en': 'EUA/Reino Unido',
        'es': 'Espanha/México/Argentina',
        'fr': 'França/Canadá',
        'de': 'Alemanha/Áustria',
        'it': 'Itália',
        'ja': 'Japão',
        'ko': 'Coreia do Sul',
        'zh': 'China/Taiwan',
        'hi': 'Índia',
        'ru': 'Rússia',
        'ar': 'Egito/Arábia Saudita',
        'nl': 'Holanda',
        'sv': 'Suécia',
        'no': 'Noruega',
        'da': 'Dinamarca',
        'fi': 'Finlândia',
        'pl': 'Polônia',
        'cs': 'República Tcheca',
        'hu': 'Hungria',
        'tr': 'Turquia',
        'th': 'Tailândia'
    };
    
    return languageToCountry[languageCode] || 'Vários países';
}

// DADOS MOCK ORGANIZADOS POR GÊNERO
function getMockMoviesByGenre(genreId) {
    // Base de dados de filmes por gênero
    const moviesDatabase = {
        // Todos os filmes
        '0': [
            {
                id: 278,
                title: 'Um Sonho de Liberdade',
                overview: 'Um banqueiro é condenado por um crime que não cometeu.',
                release_date: '1994-09-23',
                vote_average: 8.7,
                poster_path: '/hBcY0fE9pfXzvVaY4GKarweriG2.jpg',
                original_language: 'en',
                original_title: 'The Shawshank Redemption',
                production_country: 'EUA',
                language_name: 'Inglês',
                genre_ids: [18, 80],
                popularity: 99.9
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
                production_country: 'EUA',
                language_name: 'Inglês',
                genre_ids: [18, 80],
                popularity: 99.8
            },
            {
                id: 598,
                title: 'Cidade de Deus',
                overview: 'Dois jovens seguem caminhos diferentes na violenta Cidade de Deus no Rio de Janeiro.',
                release_date: '2002-08-30',
                vote_average: 8.6,
                poster_path: '/k7eYdWvhYQyRQoU2TB2A2Xu2TfD.jpg',
                original_language: 'pt',
                original_title: 'Cidade de Deus',
                production_country: 'Brasil',
                language_name: 'Português',
                genre_ids: [18, 80],
                popularity: 95.5
            },
            {
                id: 496243,
                title: 'Parasita',
                overview: 'Uma família pobre se infiltra na vida de uma família rica.',
                release_date: '2019-05-30',
                vote_average: 8.5,
                poster_path: '/igw938inb6M5N2KLeq9KUF6pMOh.jpg',
                original_language: 'ko',
                original_title: '기생충',
                production_country: 'Coreia do Sul',
                language_name: 'Coreano',
                genre_ids: [35, 18, 53],
                popularity: 97.8
            },
            {
                id: 129,
                title: 'A Viagem de Chihiro',
                overview: 'Uma garota entra em um mundo de espíritos.',
                release_date: '2001-07-20',
                vote_average: 8.5,
                poster_path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
                original_language: 'ja',
                original_title: '千と千尋の神隠し',
                production_country: 'Japão',
                language_name: 'Japonês',
                genre_ids: [16, 14, 12],
                popularity: 96.7
            },
            {
                id: 550,
                title: 'Clube da Luta',
                overview: 'Um homem insatisfeito forma um clube secreto de luta.',
                release_date: '1999-10-15',
                vote_average: 8.4,
                poster_path: '/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg',
                original_language: 'en',
                original_title: 'Fight Club',
                production_country: 'EUA',
                language_name: 'Inglês',
                genre_ids: [18, 53],
                popularity: 95.5
            }
        ],
        
        // Ação (28)
        '28': [
            {
                id: 155,
                title: 'O Cavaleiro das Trevas',
                overview: 'Batman enfrenta o Coringa em Gotham City.',
                release_date: '2008-07-18',
                vote_average: 8.5,
                poster_path: '/iGZX91hIqM9Uu0KGhd4MUaJ0Rtm.jpg',
                original_language: 'en',
                original_title: 'The Dark Knight',
                production_country: 'EUA',
                language_name: 'Inglês',
                genre_ids: [28, 18, 80],
                popularity: 98.2
            },
            {
                id: 299534,
                title: 'Vingadores: Ultimato',
                overview: 'Os Vingadores tentam desfazer as ações de Thanos.',
                release_date: '2019-04-24',
                vote_average: 8.3,
                poster_path: '/q6725aR8Zs4IwGMXzZT8aC8lh41.jpg',
                original_language: 'en',
                original_title: 'Avengers: Endgame',
                production_country: 'EUA',
                language_name: 'Inglês',
                genre_ids: [28, 12, 878],
                popularity: 99.5
            },
            {
                id: 680,
                title: 'Pulp Fiction: Tempo de Violência',
                overview: 'Histórias interligadas de criminosos em Los Angeles.',
                release_date: '1994-10-14',
                vote_average: 8.5,
                poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
                original_language: 'en',
                original_title: 'Pulp Fiction',
                production_country: 'EUA',
                language_name: 'Inglês',
                genre_ids: [28, 80, 53],
                popularity: 97.8
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
                production_country: 'Brasil',
                language_name: 'Português',
                genre_ids: [28, 18, 80],
                popularity: 90.2
            }
        ],
        
        // Drama (18)
        '18': [
            {
                id: 278,
                title: 'Um Sonho de Liberdade',
                overview: 'Um banqueiro é condenado por um crime que não cometeu.',
                release_date: '1994-09-23',
                vote_average: 8.7,
                poster_path: '/hBcY0fE9pfXzvVaY4GKarweriG2.jpg',
                original_language: 'en',
                original_title: 'The Shawshank Redemption',
                production_country: 'EUA',
                language_name: 'Inglês',
                genre_ids: [18, 80],
                popularity: 99.9
            },
            {
                id: 598,
                title: 'Cidade de Deus',
                overview: 'Dois jovens seguem caminhos diferentes na violenta Cidade de Deus no Rio de Janeiro.',
                release_date: '2002-08-30',
                vote_average: 8.6,
                poster_path: '/k7eYdWvhYQyRQoU2TB2A2Xu2TfD.jpg',
                original_language: 'pt',
                original_title: 'Cidade de Deus',
                production_country: 'Brasil',
                language_name: 'Português',
                genre_ids: [18, 80],
                popularity: 95.5
            },
            {
                id: 2108,
                title: 'Central do Brasil',
                overview: 'Ex-professora ajuda menino a encontrar seu pai no Nordeste.',
                release_date: '1998-04-03',
                vote_average: 8.0,
                poster_path: '/wN9q5Mf5rCg3C7d5qGqk9k2c2mB.jpg',
                original_language: 'pt',
                original_title: 'Central do Brasil',
                production_country: 'Brasil',
                language_name: 'Português',
                genre_ids: [18],
                popularity: 87.3
            },
            {
                id: 14,
                title: 'A Vida é Bela',
                overview: 'Um pai protege seu filho dos horrores de um campo de concentração.',
                release_date: '1997-12-20',
                vote_average: 8.6,
                poster_path: '/2w0hVQ4dUQ4dUQ4dUQ4dUQ4dUQ.jpg',
                original_language: 'it',
                original_title: 'La vita è bella',
                production_country: 'Itália',
                language_name: 'Italiano',
                genre_ids: [18, 35, 10752],
                popularity: 93.2
            }
        ],
        
        // Comédia (35)
        '35': [
            {
                id: 137113,
                title: 'O Auto da Compadecida',
                overview: 'As aventuras de João Grilo e Chicó no sertão nordestino.',
                release_date: '2000-09-10',
                vote_average: 8.4,
                poster_path: '/tq3klRjKMXJkM86a4CjQFt5cEMC.jpg',
                original_language: 'pt',
                original_title: 'O Auto da Compadecida',
                production_country: 'Brasil',
                language_name: 'Português',
                genre_ids: [35, 12, 14],
                popularity: 92.1
            },
            {
                id: 496243,
                title: 'Parasita',
                overview: 'Uma família pobre se infiltra na vida de uma família rica.',
                release_date: '2019-05-30',
                vote_average: 8.5,
                poster_path: '/igw938inb6M5N2KLeq9KUF6pMOh.jpg',
                original_language: 'ko',
                original_title: '기생충',
                production_country: 'Coreia do Sul',
                language_name: 'Coreano',
                genre_ids: [35, 18, 53],
                popularity: 97.8
            },
            {
                id: 38,
                title: 'Amélie Poulain',
                overview: 'Uma jovem decide mudar a vida das pessoas ao seu redor em Paris.',
                release_date: '2001-04-25',
                vote_average: 7.8,
                poster_path: '/fNOH9f1aA3fPsg7bE6rC0boeY7j.jpg',
                original_language: 'fr',
                original_title: 'Le Fabuleux Destin d\'Amélie Poulain',
                production_country: 'França',
                language_name: 'Francês',
                genre_ids: [35, 10749],
                popularity: 85.4
            }
        ],
        
        // Animação (16)
        '16': [
            {
                id: 129,
                title: 'A Viagem de Chihiro',
                overview: 'Uma garota entra em um mundo de espíritos.',
                release_date: '2001-07-20',
                vote_average: 8.5,
                poster_path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
                original_language: 'ja',
                original_title: '千と千尋の神隠し',
                production_country: 'Japão',
                language_name: 'Japonês',
                genre_ids: [16, 14, 12],
                popularity: 96.7
            },
            {
                id: 346,
                title: 'Os Sete Samurais',
                overview: 'Um grupo de samurais protege uma vila de bandidos.',
                release_date: '1954-04-26',
                vote_average: 8.5,
                poster_path: '/8OKmBV5BUFzmozIC3pPWKHy17kx.jpg',
                original_language: 'ja',
                original_title: '七人の侍',
                production_country: 'Japão',
                language_name: 'Japonês',
                genre_ids: [16, 18, 28],
                popularity: 88.9
            },
            {
                id: 8587,
                title: 'O Rei Leão',
                overview: 'Um leão jovem tenta reaver seu trono de seu tio malvado.',
                release_date: '1994-06-24',
                vote_average: 8.3,
                poster_path: '/bKPtXn9n4M4s8vvZrbw40mYsefB.jpg',
                original_language: 'en',
                original_title: 'The Lion King',
                production_country: 'EUA',
                language_name: 'Inglês',
                genre_ids: [16, 18, 10751],
                popularity: 94.2
            }
        ],
        
        // Ficção Científica (878)
        '878': [
            {
                id: 157336,
                title: 'Interestelar',
                overview: 'Uma equipe de exploradores viaja através de um buraco de minhoca no espaço.',
                release_date: '2014-11-07',
                vote_average: 8.4,
                poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
                original_language: 'en',
                original_title: 'Interstellar',
                production_country: 'EUA',
                language_name: 'Inglês',
                genre_ids: [878, 18, 12],
                popularity: 97.2
            },
            {
                id: 27205,
                title: 'A Origem',
                overview: 'Um ladrão que rouba segredos corporativos usando tecnologia de compartilhamento de sonhos.',
                release_date: '2010-07-16',
                vote_average: 8.4,
                poster_path: '/8IB2e4r4oVhHnANbnm7O3Tj6tF8.jpg',
                original_language: 'en',
                original_title: 'Inception',
                production_country: 'EUA',
                language_name: 'Inglês',
                genre_ids: [878, 28, 53],
                popularity: 96.8
            }
        ],
        
        // Romance (10749)
        '10749': [
            {
                id: 11224,
                title: 'Intocáveis',
                overview: 'Um milionário tetraplégico contrata um jovem problemático para ser seu assistente.',
                release_date: '2011-11-02',
                vote_average: 8.3,
                poster_path: '/4mFsNQwbD0F237Tx7gAPotd0nbJ.jpg',
                original_language: 'fr',
                original_title: 'Intouchables',
                production_country: 'França',
                language_name: 'Francês',
                genre_ids: [10749, 18, 35],
                popularity: 92.1
            },
            {
                id: 194,
                title: 'Amor à Flor da Pele',
                overview: 'História de amor entre dois vizinhos em Hong Kong.',
                release_date: '2000-09-29',
                vote_average: 8.1,
                poster_path: '/5LgC0qBVAHhJ5ZfBq8nFu5YQrHz.jpg',
                original_language: 'fr',
                original_title: 'In the Mood for Love',
                production_country: 'França/Hong Kong',
                language_name: 'Francês',
                genre_ids: [10749, 18],
                popularity: 87.6
            }
        ],
        
        // Terror (27)
        '27': [
            {
                id: 600,
                title: 'Oldboy',
                overview: 'Um homem é mantido preso por 15 anos sem saber o motivo.',
                release_date: '2003-11-21',
                vote_average: 8.3,
                poster_path: '/rIZX6X0MIHYEebk6W4LABT9VP2c.jpg',
                original_language: 'ko',
                original_title: '올드보이',
                production_country: 'Coreia do Sul',
                language_name: 'Coreano',
                genre_ids: [27, 18, 53],
                popularity: 91.4
            },
            {
                id: 11216,
                title: 'O Hospedeiro',
                overview: 'Um monstro emerge do rio Han e sequestra uma garota.',
                release_date: '2006-07-27',
                vote_average: 7.0,
                poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
                original_language: 'ko',
                original_title: '괴물',
                production_country: 'Coreia do Sul',
                language_name: 'Coreano',
                genre_ids: [27, 878, 53],
                popularity: 84.7
            }
        ],
        
        // Crime (80)
        '80': [
            {
                id: 238,
                title: 'O Poderoso Chefão',
                overview: 'História da família mafiosa Corleone.',
                release_date: '1972-03-24',
                vote_average: 8.7,
                poster_path: '/oJagOzBu9Rdd9BrciseCm3U3MCU.jpg',
                original_language: 'en',
                original_title: 'The Godfather',
                production_country: 'EUA',
                language_name: 'Inglês',
                genre_ids: [18, 80],
                popularity: 99.8
            },
            {
                id: 1429,
                title: 'O Segredo dos Seus Olhos',
                overview: 'Um agente judicial investiga um assassinato ocorrido 25 anos antes.',
                release_date: '2009-08-13',
                vote_average: 8.2,
                poster_path: '/2w0hVQ4dUQ4dUQ4dUQ4dUQ4dUQ.jpg',
                original_language: 'es',
                original_title: 'El secreto de sus ojos',
                production_country: 'Argentina',
                language_name: 'Espanhol',
                genre_ids: [80, 18, 10749],
                popularity: 86.9
            }
        ]
    };
    
    // Para gêneros não listados, retornar "todos" ou filtrar
    return moviesDatabase[genreId] || moviesDatabase['0'] || [];
}

// Rota para obter detalhes de um filme específico
app.get('/api/movie/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        
        const response = await axios.get(TMDB_BASE_URL + '/movie/' + movieId, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'pt-BR',
                append_to_response: 'credits'
            }
        });
        
        // Adicionar informações extras
        const movieWithExtras = {
            ...response.data,
            production_country: getCountryFromLanguage(response.data.original_language),
            language_name: getLanguageName(response.data.original_language)
        };
        
        res.json({
            success: true,
            movie: movieWithExtras
        });
        
    } catch (error) {
        console.error('Erro ao buscar filme:', error.message);
        
        // Fallback: buscar nos dados mock
        const allMovies = getMockMoviesByGenre('0');
        const movie = allMovies.find(m => m.id.toString() === req.params.id);
        
        if (movie) {
            res.json({
                success: true,
                movie: movie
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Filme não encontrado'
            });
        }
    }
});

// Rota para obter filmes populares
app.get('/api/movies/popular', async (req, res) => {
    try {
        const page = req.query.page || 1;
        
        const response = await axios.get(TMDB_BASE_URL + '/movie/popular', {
            params: {
                api_key: TMDB_API_KEY,
                language: 'pt-BR',
                page: page
            }
        });
        
        // Processar resultados
        const processedMovies = response.data.results.map(movie => ({
            ...movie,
            production_country: getCountryFromLanguage(movie.original_language),
            language_name: getLanguageName(movie.original_language)
        }));
        
        res.json({
            success: true,
            page: response.data.page,
            totalPages: response.data.total_pages,
            movies: processedMovies
        });
        
    } catch (error) {
        console.error('Erro:', error.message);
        
        const mockMovies = getMockMoviesByGenre('0').slice(0, 20);
        
        res.json({
            success: true,
            page: 1,
            totalPages: 1,
            movies: mockMovies,
            warning: 'Usando dados de exemplo'
        });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(70));
    console.log('CINEWORLD BACKEND - FILTRO POR GÊNERO ATIVADO!');
    console.log('='.repeat(70));
    console.log('URL: http://localhost:' + PORT);
    console.log('API: http://localhost:' + PORT + '/api/genres');
    console.log('TMDB: ' + (TMDB_API_KEY ? '✅ CONECTADO' : '⚠️ SEM CHAVE (usando mock)'));
    console.log('Ano: ' + new Date().getFullYear());
    console.log('='.repeat(70));
    console.log('\n TESTES POR GÊNERO:');
    console.log('Todos: http://localhost:' + PORT + '/api/movies?genre=0');
    console.log('Ação: http://localhost:' + PORT + '/api/movies?genre=28');
    console.log('Drama: http://localhost:' + PORT + '/api/movies?genre=18');
    console.log('Comédia: http://localhost:' + PORT + '/api/movies?genre=35');
    console.log('Animação: http://localhost:' + PORT + '/api/movies?genre=16');
    console.log('Busca: http://localhost:' + PORT + '/api/movies?query=avatar');
    console.log('='.repeat(70) + '\n');
});
