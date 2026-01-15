/**
 * 🎬 FILMOTECA TMDB • Desenvolvido por Alabaster Developer
 * 📅 2026 • Integração com API TMDB
 * 🐙 github.com/Brenda-Tavares
 */

console.log('%c🎬 Filmoteca TMDB', 'color: #d32f2f; font-weight: bold; font-size: 16px;');
console.log('%cConectando à API TMDB...', 'color: #666;');

// =========== CONFIGURAÇÃO ===========
const API_BASE = 'http://localhost:3001/api';

// =========== ESTADO DA APLICAÇÃO ===========
let estado = {
    temaAtivo: 'cinema-brasileiro',
    filmes: {},
    temas: [],
    elementos: {}
};

// =========== QUANDO A PÁGINA CARREGAR ===========
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - INICIANDO APP TMDB');
    
    // Inicializar elementos
    inicializarElementos();
    
    // Iniciar tema escuro/claro
    iniciarTema();
    
    // Carregar dados da API TMDB
    carregarDados();
});

// =========== INICIALIZAR ELEMENTOS DOM ===========
function inicializarElementos() {
    estado.elementos = {
        loading: document.getElementById('loading'),
        app: document.getElementById('app'),
        error: document.getElementById('error'),
        navTemas: document.getElementById('navTemas'),
        temasBotoes: document.getElementById('temasBotoes'),
        filmesGrid: null,
        secaoTema: null
    };
}

// =========== TEMA ESCURO/CLARO ===========
function iniciarTema() {
    const temaSalvo = localStorage.getItem('tema') || 'auto';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (temaSalvo === 'dark' || (temaSalvo === 'auto' && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

// =========== CARREGAR DADOS DA API TMDB ===========
async function carregarDados() {
    console.log('🎬 Iniciando carregamento de dados da API TMDB...');
    
    try {
        // 1. Carrega filmes brasileiros da API
        console.log('1. Buscando filmes brasileiros...');
        const respostaBR = await fetch(`${API_BASE}/filmes/brasileiros`);
        const dadosBR = await respostaBR.json();
        
        if (!dadosBR.sucesso) {
            throw new Error(`API BR: ${dadosBR.erro || 'Erro desconhecido'}`);
        }
        
        // 2. Carrega filmes internacionais da API
        console.log('2. Buscando filmes internacionais...');
        const respostaINT = await fetch(`${API_BASE}/filmes/internacionais`);
        const dadosINT = await respostaINT.json();
        
        if (!dadosINT.sucesso) {
            throw new Error(`API INT: ${dadosINT.erro || 'Erro desconhecido'}`);
        }
        
        // 3. Carrega temas do JSON local
        console.log('3. Carregando temas locais...');
        const respostaTemas = await fetch('data/temas.json');
        const temasData = await respostaTemas.json();
        
        // 4. Organiza dados no formato que seu app espera
        estado.filmes = {
            'cinema-brasileiro': dadosBR.filmes || [],
            'amores-proibidos': dadosINT.filmes || []
        };
        
        estado.temas = temasData.temas || [];
        
        console.log('✅ Dados carregados com sucesso!');
        console.log(`   🇧🇷 ${dadosBR.filmes?.length || 0} filmes brasileiros`);
        console.log(`   🌍 ${dadosINT.filmes?.length || 0} filmes internacionais`);
        console.log(`   🎭 ${estado.temas.length} temas carregados`);
        
        // 5. Mostra navegação
        estado.elementos.navTemas.style.display = 'block';
        renderizarNavegacaoTemas();
        carregarFilmesTemaAtivo();
        
        // 6. Esconde loading, mostra app
        estado.elementos.loading.style.display = 'none';
        estado.elementos.app.style.display = 'block';
        
    } catch (erro) {
        console.error('❌ Erro ao carregar dados:', erro);
        mostrarErro(`
            <h3>⚠️ Problema de conexão</h3>
            <p>Não foi possível conectar ao servidor de filmes.</p>
            <p><strong>Erro:</strong> ${erro.message}</p>
            <p style="margin-top: 15px;">
                <button onclick="location.reload()" class="btn-detalhes">
                    🔄 Tentar novamente
                </button>
                <button onclick="carregarDadosLocais()" class="btn-detalhes" style="margin-left: 10px;">
                    📂 Usar dados locais
                </button>
            </p>
        `);
    }
}

// =========== FALLBACK: DADOS LOCAIS ===========
async function carregarDadosLocais() {
    console.log('🔄 Usando dados locais de backup...');
    
    try {
        const respostaFilmes = await fetch('data/filmes.json');
        const dadosFilmes = await respostaFilmes.json();
        
        const respostaTemas = await fetch('data/temas.json');
        const dadosTemas = await respostaTemas.json();
        
        estado.filmes = dadosFilmes;
        estado.temas = dadosTemas.temas || [];
        
        estado.elementos.navTemas.style.display = 'block';
        renderizarNavegacaoTemas();
        carregarFilmesTemaAtivo();
        
        estado.elementos.loading.style.display = 'none';
        estado.elementos.app.style.display = 'block';
        estado.elementos.error.style.display = 'none';
        
        console.log('✅ Dados locais carregados');
        
    } catch (erroLocal) {
        console.error('❌ Erro nos dados locais:', erroLocal);
        mostrarErro('Não foi possível carregar nenhum dado. Verifique sua conexão.');
    }
}

// =========== RENDERIZAR NAVEGAÇÃO DE TEMAS ===========
function renderizarNavegacaoTemas() {
    console.log('🎨 Renderizando botões de temas...');
    
    const container = estado.elementos.temasBotoes;
    container.innerHTML = '';
    
    if (estado.temas.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Nenhum tema encontrado</p>';
        return;
    }
    
    estado.temas.forEach(tema => {
        const qtdFilmes = estado.filmes[tema.id]?.length || 0;
        
        if (qtdFilmes > 0) {
            const botao = document.createElement('button');
            botao.className = `btn-tema ${tema.id === estado.temaAtivo ? 'ativo' : ''}`;
            botao.dataset.tema = tema.id;
            botao.title = `Clique para ver ${qtdFilmes} filme(s)`;
            
            botao.innerHTML = `
                <span class="tema-icone">${tema.icone || '🎬'}</span>
                <div class="tema-info">
                    <div class="tema-nome">${tema.nome}</div>
                    <div class="tema-contador">${qtdFilmes} filme${qtdFilmes !== 1 ? 's' : ''}</div>
                </div>
            `;
            
            botao.addEventListener('click', () => {
                console.log(`🖱️ Clicou no tema: ${tema.id}`);
                mudarTema(tema.id);
            });
            
            container.appendChild(botao);
        }
    });
}

// =========== MUDAR TEMA ===========
function mudarTema(novoTema) {
    console.log(`🔄 Mudando tema: ${estado.temaAtivo} → ${novoTema}`);
    
    if (!estado.filmes[novoTema]) {
        console.error(`❌ Tema ${novoTema} não encontrado!`);
        return;
    }
    
    estado.temaAtivo = novoTema;
    
    document.querySelectorAll('.btn-tema').forEach(botao => {
        const isAtivo = botao.dataset.tema === novoTema;
        botao.classList.toggle('ativo', isAtivo);
    });
    
    carregarFilmesTemaAtivo();
}

// =========== CARREGAR FILMES DO TEMA ATIVO ===========
function carregarFilmesTemaAtivo() {
    const filmesTema = estado.filmes[estado.temaAtivo] || [];
    const temaInfo = estado.temas.find(t => t.id === estado.temaAtivo);
    
    console.log(`🎬 Carregando ${filmesTema.length} filmes do tema: ${temaInfo?.nome || estado.temaAtivo}`);
    
    if (filmesTema.length === 0) {
        console.error(`❌ Nenhum filme no tema ${estado.temaAtivo}!`);
        mostrarErro(`Nenhum filme encontrado para "${temaInfo?.nome || estado.temaAtivo}"`);
        return;
    }
    
    renderizarApp(filmesTema, temaInfo);
}

// =========== RENDERIZAR APLICAÇÃO ===========
function renderizarApp(filmesLista, temaInfo) {
    console.log(`🎨 Renderizando ${filmesLista.length} filmes...`);
    
    const corTema = temaInfo?.cor || '#d32f2f';
    
    let html = `
        <div class="secao-tema" id="secaoTema" style="border-left: 5px solid ${corTema};">
            <h2>${temaInfo ? temaInfo.nome : '🎬 Filmes Recomendados'}</h2>
            ${temaInfo ? `<p class="descricao-tema">${temaInfo.descricao}</p>` : ''}
        </div>
        
        <div class="filmes-grid" id="filmesGrid">
    `;
    
    filmesLista.forEach((filme, index) => {
        html += criarCardFilme(filme, index, corTema);
    });
    
    html += `
        </div>
        
        <div class="footer-app" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">
            <p>🎭 ${filmesLista.length} filme${filmesLista.length !== 1 ? 's' : ''} encontrado${filmesLista.length !== 1 ? 's' : ''} em "${temaInfo?.nome || 'este tema'}"</p>
        </div>
    `;
    
    estado.elementos.app.innerHTML = html;
    
    estado.elementos.filmesGrid = document.getElementById('filmesGrid');
    estado.elementos.secaoTema = document.getElementById('secaoTema');
    
    document.querySelectorAll('.btn-detalhes').forEach((botao, index) => {
        botao.addEventListener('click', () => mostrarDetalhesFilme(index));
    });
    
    console.log(`✅ ${filmesLista.length} filmes renderizados`);
}

// =========== CRIAR CARD DE FILME ===========
function criarCardFilme(filme, index, corTema) {
    const temImagem = filme.cartaz_url || filme.cartaz;
    
    return `
        <div class="filme-card" data-index="${index}">
            <div class="filme-imagem" style="
                position: relative;
                height: 200px;
                overflow: hidden;
                ${!temImagem ? `background: linear-gradient(135deg, ${corTema}40, ${corTema}70);` : ''}
            ">
                ${temImagem ? `
                    <img src="${filme.cartaz_url || filme.cartaz}" 
                         alt="${filme.titulo_pt}"
                         style="
                             width: 100%;
                             height: 100%;
                             object-fit: cover;
                             position: absolute;
                             top: 0;
                             left: 0;
                         "
                         onerror="
                             this.style.display='none';
                             this.parentElement.style.background = 'linear-gradient(135deg, ${corTema}40, ${corTema}70)';
                         ">
                    
                    <div style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 90%);
                        z-index: 1;
                    "></div>
                ` : ''}
                
                <div style="
                    position: absolute;
                    bottom: 15px;
                    left: 0;
                    right: 0;
                    text-align: center;
                    color: white;
                    z-index: 2;
                    padding: 0 15px;
                ">
                    <div style="
                        font-size: 2rem;
                        margin-bottom: 5px;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                    ">
                        ${filme.bandeira || '🎬'}
                    </div>
                    <div style="
                        font-size: 1rem;
                        font-weight: bold;
                        background: rgba(0,0,0,0.6);
                        display: inline-block;
                        padding: 5px 15px;
                        border-radius: 15px;
                        backdrop-filter: blur(4px);
                        border: 1px solid rgba(255,255,255,0.2);
                    ">
                        ${filme.pais}
                    </div>
                </div>
            </div>
            
            <div class="filme-info">
                <h3 class="filme-titulo">${filme.titulo_pt}</h3>
                <p class="filme-detalhes">
                    ${filme.diretor || 'Diretor não disponível'} • ${filme.ano}
                </p>
                
                <p class="filme-sinopse">
                    ${filme.sinopse?.substring(0, 120) || 'Sinopse não disponível.'}...
                </p>
                
                <div class="filme-rodape">
                    <div class="avaliacao">
                        <span>⭐</span>
                        <span>${filme.avaliacao_imdb || filme.avaliacao || 'N/A'}/10</span>
                    </div>
                    
                    <button class="btn-detalhes" data-index="${index}">
                        Ver detalhes
                    </button>
                </div>
            </div>
        </div>
    `;
}

// =========== MOSTRAR DETALHES DO FILME ===========
function mostrarDetalhesFilme(index) {
    const filmesTema = estado.filmes[estado.temaAtivo] || [];
    const filme = filmesTema[index];
    const temaInfo = estado.temas.find(t => t.id === estado.temaAtivo);
    const corTema = temaInfo?.cor || '#d32f2f';
    
    const modalHTML = `
        <div class="modal" id="modalDetalhes">
            <div class="modal-content">
                <div class="modal-header" style="background: linear-gradient(135deg, ${corTema} 0%, var(--preto) 100%);">
                    <button class="close-modal" onclick="fecharModal()">×</button>
                    <h2>${filme.titulo_pt}</h2>
                    <p style="opacity: 0.9; margin-top: 5px;">
                        ${filme.bandeira || ''} ${filme.pais} • ${filme.ano}
                    </p>
                </div>
                
                <div class="modal-body">
                    ${(filme.cartaz_url || filme.cartaz) ? `
                        <div style="text-align: center; margin-bottom: 1.5rem;">
                            <img src="${filme.cartaz_url || filme.cartaz}" 
                                 alt="${filme.titulo_pt}" 
                                 style="
                                     max-width: 250px;
                                     border-radius: 8px;
                                     box-shadow: 0 6px 20px rgba(0,0,0,0.2);
                                 "
                                 onerror="this.style.display='none'">
                        </div>
                    ` : ''}
                    
                    <div style="margin-bottom: 2rem;">
                        <h3 style="color: ${corTema}; margin-bottom: 1rem;">📖 Sinopse</h3>
                        <p style="line-height: 1.6; font-size: 1.05rem;">${filme.sinopse || 'Sinopse não disponível.'}</p>
                    </div>
                    
                    <div style="background: ${corTema}10; padding: 1.8rem; border-radius: 10px; margin-bottom: 2rem;">
                        <h3 style="color: ${corTema}; margin-bottom: 1.2rem;">📊 Informações</h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                            <div>
                                <strong style="color: var(--text-secondary);">Avaliação:</strong><br>
                                <span style="color: #f39c12; font-size: 1.4rem; font-weight: bold; display: inline-block; margin-top: 5px;">
                                    ⭐ ${filme.avaliacao_imdb || filme.avaliacao || 'N/A'}/10
                                </span>
                            </div>
                            
                            ${filme.onde_assistir ? `
                                <div>
                                    <strong style="color: var(--text-secondary);">Onde assistir:</strong><br>
                                    <div style="margin-top: 5px;">
                                        ${filme.onde_assistir.map(plataforma => 
                                            `<span style="display: inline-block; background: #e3f2fd; 
                                                      color: #1976d2; padding: 0.4rem 1rem; 
                                                      margin: 0.3rem; border-radius: 6px; 
                                                      font-size: 0.9rem; font-weight: 500;">${plataforma}</span>`
                                        ).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('modalDetalhes').style.display = 'block';
}

// =========== FECHAR MODAL ===========
window.fecharModal = function() {
    const modal = document.getElementById('modalDetalhes');
    if (modal) {
        modal.remove();
    }
};

// Fechar modal ao clicar fora
document.addEventListener('click', function(event) {
    const modal = document.getElementById('modalDetalhes');
    if (modal && event.target === modal) {
        fecharModal();
    }
});

// =========== MOSTRAR ERRO ===========
function mostrarErro(mensagem) {
    estado.elementos.loading.style.display = 'none';
    estado.elementos.app.style.display = 'none';
    estado.elementos.error.style.display = 'block';
    estado.elementos.error.innerHTML = mensagem;
}

// =========== EXPORTAR FUNÇÕES GLOBAIS ===========
window.mostrarDetalhesFilme = mostrarDetalhesFilme;
window.mudarTema = mudarTema;
window.carregarDadosLocais = carregarDadosLocais;

console.log('✅ Script TMDB carregado! Pronto para conectar...');