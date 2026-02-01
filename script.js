/**
 *  CineWorld - Recomendações de Filmes • Desenvolvido por Alabaster Developer */
// CONFIGURAÇÃO
const API_BASE = 'http://localhost:3001/api';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// ESTADO
let state = {
    currentGenre: '0',
    currentPage: 1,
    totalPages: 1,
    movies: [],
    genres: [],
    searchQuery: '',
    isLoading: false
};

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', function() {
    console.log('CineWorld iniciando...');
    
    // Setup dos eventos
    setupEventListeners();
    
    // Carrega dados
    loadData();
    
    // Fallback: esconde loading após 3 segundos
    setTimeout(() => {
        const loading = document.getElementById('loading');
        const app = document.getElementById('app');
        if (loading && app && loading.style.display !== 'none') {
            loading.style.display = 'none';
            app.style.display = 'block';
        }
    }, 3000);
});

// CONFIGURAÇÃO EVENT LISTENERS
function setupEventListeners() {
    // Busca
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Paginação
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                loadMovies();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (state.currentPage < state.totalPages) {
                state.currentPage++;
                loadMovies();
            }
        });
    }
    
    // Modal
    const modal = document.getElementById('movieModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this || e.target.classList.contains('close-modal')) {
                closeModal();
            }
        });
        
        // Fechar com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
            }
        });
    }
}

// EXECUTAR BUSCA
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const query = searchInput.value.trim();
    state.searchQuery = query;
    state.currentPage = 1;
    state.currentGenre = '0'; // Reset genre when searching
    
    // Update UI
    const titleEl = document.getElementById('currentTitle');
    if (titleEl) {
        titleEl.textContent = query ? `Busca: "${query}"` : 'Filmes Populares';
    }
    
    loadMovies();
}

// CARREGAR DADOS
async function loadData() {
    try {
        console.log('Conectando ao backend...');
        
        // 1. Carrega gêneros
        const genresRes = await fetch(API_BASE + '/genres');
        const genresData = await genresRes.json();
        
        if (genresData.success) {
            state.genres = genresData.genres;
            console.log(state.genres.length + ' gêneros carregados');
            renderGenres();
        }
        
        // 2. Carrega filmes
        await loadMovies();
        
        // 3. Mostra app
        document.getElementById('loading').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        console.log('App pronto!');
        
        // 4. Atualiza status
        updateBackendStatus(true);
        
    } catch (error) {
        console.error('Erro ao carregar:', error);
        showError();
        updateBackendStatus(false);
    }
}

// CARREGAR FILMES
async function loadMovies() {
    if (state.isLoading) return;
    state.isLoading = true;
    
    console.log('Carregando filmes... Gênero: ' + state.currentGenre + ', Página: ' + state.currentPage);
    
    // Mostra loading
    showLoading(true);
    
    try {
        let url = API_BASE + '/movies?page=' + state.currentPage;
        
        if (state.searchQuery) {
            url += '&query=' + encodeURIComponent(state.searchQuery);
        } else if (state.currentGenre !== '0') {
            url += '&genre=' + state.currentGenre;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            state.movies = data.movies || [];
            state.totalPages = data.totalPages || 1;
            
            console.log(state.movies.length + ' filmes carregados');
            
            renderMovies();
            updateUI();
            updatePagination();
        }
        
    } catch (error) {
        console.error('Erro ao carregar filmes:', error);
        state.movies = getMockMovies();
        renderMovies();
    }
    
    state.isLoading = false;
    showLoading(false);
}

// RENDERIZAR GÊNEROS
function renderGenres() {
    const container = document.getElementById('genresList');
    if (!container) return;
    
    container.innerHTML = '';
    
    state.genres.forEach(genre => {
        const div = document.createElement('div');
        div.className = 'genre-item';
        if (genre.id.toString() === state.currentGenre) {
            div.classList.add('active');
        }
        
        // Extrair ícone do nome (se houver)
        const genreName = genre.name;
        let icon = '🎬';
        let name = genreName;
        
        // Tenta extrair emoji do início do nome
        const emojiMatch = genreName.match(/^(\p{Emoji})/u);
        if (emojiMatch) {
            icon = emojiMatch[0];
            name = genreName.substring(emojiMatch[0].length).trim();
        }
        
        div.innerHTML = `
            <span class="genre-icon">${icon}</span>
            <span class="genre-name">${name}</span>
        `;
        
        div.addEventListener('click', () => {
            selectGenre(genre);
        });
        
        container.appendChild(div);
    });
}

// SELECIONAR GÊNERO
function selectGenre(genre) {
    console.log('Selecionando gênero:', genre.name);
    
    state.currentGenre = genre.id.toString();
    state.currentPage = 1;
    state.searchQuery = '';
    
    // Limpa busca
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    // Atualiza título
    const titleEl = document.getElementById('currentTitle');
    const descEl = document.getElementById('currentDescription');
    
    if (titleEl) titleEl.textContent = genre.name;
    if (descEl) descEl.textContent = genre.description || 'Descubra os melhores filmes deste gênero.';
    
    // Atualiza gêneros ativos
    document.querySelectorAll('.genre-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Carrega filmes
    loadMovies();
}

// RENDERIZAR FILMES
function renderMovies() {
    const container = document.getElementById('moviesGrid');
    if (!container) return;
    
    if (state.movies.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🎬</div>
                <h3>Nenhum filme encontrado</h3>
                <p>Tente outro gênero ou termo de busca.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    state.movies.forEach(movie => {
        const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const overview = movie.overview || 'Sinopse não disponível.';
        const shortOverview = overview.length > 100 ? overview.substring(0, 100) + '...' : overview;
        const posterUrl = movie.poster_path ? TMDB_IMAGE_BASE + movie.poster_path : null;
        
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <div class="movie-poster">
                ${posterUrl ? 
                    '<img src="' + posterUrl + '" alt="' + movie.title + '" loading="lazy">' :
                    '<div class="poster-placeholder"><i class="fas fa-film"></i></div>'
                }
                ${rating !== 'N/A' ? 
                    '<div class="movie-rating"><i class="fas fa-star"></i> ' + rating + '</div>' : 
                    ''
                }
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title || 'Sem título'}</h3>
                <div class="movie-meta">
                    ${year !== 'N/A' ? '<span class="movie-year">' + year + '</span>' : ''}
                    ${movie.production_country ? '<span class="movie-country">' + movie.production_country + '</span>' : ''}
                    ${movie.language_name ? '<span class="movie-language">' + movie.language_name + '</span>' : ''}
                </div>
                <p class="movie-overview">${shortOverview}</p>
                <div class="movie-actions">
                    <button class="details-btn" onclick="showMovieDetails(${movie.id})">
                        <i class="fas fa-info-circle"></i> Detalhes
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// MOSTRAR DETALHES DO FILME
window.showMovieDetails = async function(movieId) {
    try {
        const response = await fetch(API_BASE + '/movie/' + movieId);
        const data = await response.json();
        
        if (data.success) {
            showModal(data.movie);
        } else {
            alert('Erro ao carregar detalhes do filme.');
        }
    } catch (error) {
        console.error('Erro:', error);
        // Tenta encontrar nos filmes carregados
        const movie = state.movies.find(m => m.id === movieId);
        if (movie) {
            showModal(movie);
        } else {
            alert('Não foi possível carregar os detalhes.');
        }
    }
};

// MOSTRAR MODAL
function showModal(movie) {
    const modal = document.getElementById('movieModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const posterUrl = movie.poster_path ? TMDB_IMAGE_BASE + movie.poster_path : null;
    
    modalTitle.textContent = movie.title;
    
    modalBody.innerHTML = `
        <div class="modal-movie-content">
            <div class="modal-poster">
                ${posterUrl ? 
                    '<img src="' + posterUrl + '" alt="' + movie.title + '">' :
                    '<div class="modal-poster-placeholder"><i class="fas fa-film"></i></div>'
                }
            </div>
            <div class="modal-info">
                <div class="modal-meta">
                    ${rating !== 'N/A' ? '<span class="modal-rating"><i class="fas fa-star"></i> ' + rating + '/10</span>' : ''}
                    ${year !== 'N/A' ? '<span class="modal-year">' + year + '</span>' : ''}
                    ${movie.production_country ? '<span class="modal-country">' + movie.production_country + '</span>' : ''}
                    ${movie.language_name ? '<span class="modal-language">' + movie.language_name + '</span>' : ''}
                </div>
                
                <h3>Sinopse</h3>
                <p class="modal-overview">${movie.overview || 'Sinopse não disponível.'}</p>
                
                ${movie.original_title && movie.original_title !== movie.title ? 
                    '<p><strong>Título original:</strong> ' + movie.original_title + '</p>' : 
                    ''
                }
                
                <div class="modal-actions">
                    <button class="modal-close-btn" onclick="closeModal()">
                        <i class="fas fa-times"></i> Fechar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}

// FECHAR MODAL
function closeModal() {
    const modal = document.getElementById('movieModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// ATUALIZAR UI
function updateUI() {
    // Atualiza contador
    const countEl = document.getElementById('moviesCount');
    if (countEl) {
        countEl.textContent = state.movies.length + ' filmes';
    }
    
    // Atualiza página
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) {
        pageInfo.textContent = 'Página ' + state.currentPage;
    }
}

// ATUALIZAR PAGINAÇÃO
function updatePagination() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageIndicator = document.getElementById('pageIndicator');
    
    if (prevBtn && nextBtn && pageIndicator) {
        prevBtn.disabled = state.currentPage <= 1;
        nextBtn.disabled = state.currentPage >= state.totalPages;
        pageIndicator.textContent = 'Página ' + state.currentPage + ' de ' + state.totalPages;
    }
}

// ATUALIZAR STATUS BACKEND
function updateBackendStatus(connected) {
    const statusEl = document.getElementById('backendStatus');
    if (statusEl) {
        if (connected) {
            statusEl.textContent = 'Conectado ✓';
            statusEl.style.color = '#2ecc71';
        } else {
            statusEl.textContent = 'Desconectado ✗';
            statusEl.style.color = '#e74c3c';
        }
    }
}

// MOSTRAR/ESCONDER LOADING
function showLoading(show) {
    // Você pode adicionar um loading spinner específico aqui
    const moviesGrid = document.getElementById('moviesGrid');
    if (moviesGrid && show) {
        moviesGrid.innerHTML = '<div class="loading">Carregando filmes...</div>';
    }
}

// MOSTRAR ERRO
function showError() {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `
            <div class="error-screen">
                <div class="error-icon">⚠️</div>
                <h2>Erro de Conexão</h2>
                <p>Não foi possível conectar ao servidor.</p>
                <p class="error-details">
                    Verifique se o backend está rodando em localhost:3001
                </p>
                <div class="error-actions">
                    <button onclick="location.reload()" class="error-btn">
                        Recarregar
                    </button>
                    <button onclick="testBackend()" class="error-btn secondary">
                        Testar Backend
                    </button>
                </div>
            </div>
        `;
    }
}

// FILMES MOCK (fallback)
function getMockMovies() {
    return [
        {
            id: 1,
            title: 'Filme de Exemplo 1',
            overview: 'Esta é uma descrição de exemplo para testar o frontend.',
            release_date: '2023-01-01',
            vote_average: 7.5,
            original_language: 'pt',
            production_country: 'Brasil',
            language_name: 'Português'
        },
        {
            id: 2,
            title: 'Exemplo de Filme Internacional',
            overview: 'Outro filme de exemplo para demonstração.',
            release_date: '2023-05-15',
            vote_average: 8.0,
            original_language: 'en',
            production_country: 'EUA',
            language_name: 'Inglês'
        }
    ];
}

// TESTAR BACKEND
window.testBackend = async function() {
    try {
        const response = await fetch(API_BASE + '/health');
        const data = await response.json();
        alert('Backend: ' + data.status + '\nTMDB: ' + (data.tmdb || 'N/A'));
    } catch (error) {
        alert('Backend OFFLINE!\nErro: ' + error.message);
    }
};

// ADICIONAR CSS PARA COMPONENTES EXTRAS
const extraStyles = document.createElement('style');
extraStyles.textContent = `
    .no-results {
        grid-column: 1/-1;
        text-align: center;
        padding: 50px;
        color: #8d99ae;
    }
    
    .no-results-icon {
        font-size: 4rem;
        margin-bottom: 20px;
    }
    
    .loading {
        grid-column: 1/-1;
        text-align: center;
        padding: 50px;
        color: #8d99ae;
    }
    
    .error-screen {
        text-align: center;
        padding: 50px;
    }
    
    .error-icon {
        font-size: 3rem;
        color: #e74c3c;
        margin-bottom: 20px;
    }
    
    .error-details {
        color: #666;
        font-size: 0.9rem;
        margin: 20px 0;
    }
    
    .error-actions {
        margin-top: 30px;
    }
    
    .error-btn {
        background: #4361ee;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        margin: 0 10px;
        cursor: pointer;
        font-size: 1rem;
    }
    
    .error-btn.secondary {
        background: #2ecc71;
    }
    
    .modal-movie-content {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 30px;
    }
    
    .modal-poster img {
        width: 100%;
        border-radius: 10px;
        box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    }
    
    .modal-poster-placeholder {
        height: 400px;
        background: linear-gradient(45deg, #2a3d66, #415a77);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 4rem;
        color: rgba(255,255,255,0.2);
    }
    
    .modal-meta {
        display: flex;
        gap: 15px;
        margin-bottom: 25px;
        flex-wrap: wrap;
    }
    
    .modal-rating, .modal-year, .modal-country, .modal-language {
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
    }
    
    .modal-rating {
        background: rgba(255,215,0,0.15);
        color: #FFD700;
    }
    
    .modal-year {
        background: rgba(67, 97, 238, 0.15);
        color: #4361ee;
    }
    
    .modal-country {
        background: rgba(76, 201, 240, 0.15);
        color: #4cc9f0;
    }
    
    .modal-language {
        background: rgba(233, 196, 106, 0.15);
        color: #e9c46a;
    }
    
    .modal-overview {
        line-height: 1.7;
        margin: 20px 0;
        font-size: 1.1rem;
    }
    
    .modal-actions {
        margin-top: 30px;
    }
    
    .modal-close-btn {
        background: #e74c3c;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    @media (max-width: 768px) {
        .modal-movie-content {
            grid-template-columns: 1fr;
        }
        
        .modal-poster {
            max-width: 300px;
            margin: 0 auto;
        }
    }
`;
document.head.appendChild(extraStyles);

console.log('Frontend carregado!');
