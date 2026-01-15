/**
 * 🎬 CineWorld - Recomendações de Filmes • Desenvolvido por Alabaster Developer
 * 🌍 Agora com TODOS os países do mundo!
 */

console.log('%c🌍 CineWorld - Recomendações de Filmes', 'color: #d32f2f; font-weight: bold; font-size: 16px;');

// =========== CONFIGURAÇÃO ===========
const API_BASE = 'http://localhost:3001/api';

// =========== ESTADO DA APLICAÇÃO ===========
let estado = {
    temaAtivo: 'cinema-brasileiro',
    filmes: {},
    temas: [],
    paises: [], // NOVO: Lista de países
    modo: 'temas', // 'temas' ou 'paises'
    elementos: {}
};

// =========== QUANDO A PÁGINA CARREGAR ===========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌐 DOM carregado - INICIANDO APP GLOBAL');
    
    inicializarElementos();
    iniciarTema();
    carregarDadosIniciais();
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

// =========== CARREGAR DADOS INICIAIS ===========
async function carregarDadosIniciais() {
    console.log('🌐 Iniciando carregamento...');
    
    try {
        // 1. Carrega os temas FIXOS (Brasil + Internacionais)
        console.log('1. Carregando temas fixos...');
        const respostaTemas = await fetch('data/temas.json');
        const temasData = await respostaTemas.json();
        estado.temas = temasData.temas || [];
        
        // 2. Carrega filmes brasileiros da API
        console.log('2. Carregando filmes brasileiros...');
        const respostaBR = await fetch(`${API_BASE}/filmes/brasileiros`);
        const dadosBR = await respostaBR.json();
        
        if (dadosBR.sucesso) {
            estado.filmes['cinema-brasileiro'] = dadosBR.filmes || [];
        }
        
        // 3. Carrega filmes internacionais da API
        console.log('3. Carregando filmes internacionais...');
        const respostaINT = await fetch(`${API_BASE}/filmes/internacionais`);
        const dadosINT = await respostaINT.json();
        
        if (dadosINT.sucesso) {
            estado.filmes['amores-proibidos'] = dadosINT.filmes || [];
        }
        
        // 4. Carrega lista de países da API
        console.log('4. Carregando lista de países...');
        await carregarListaPaises();
        
        // 5. Mostra navegação completa
        estado.elementos.navTemas.style.display = 'block';
        renderizarNavegacaoCompleta();
        
        // 6. Carrega o tema ativo
        carregarFilmesTemaAtivo();
        
        // 7. Esconde loading, mostra app
        estado.elementos.loading.style.display = 'none';
        estado.elementos.app.style.display = 'block';
        
        console.log('✅ Sistema global carregado!');
        console.log(`   🎭 Temas: ${estado.temas.length}`);
        console.log(`   🌍 Países: ${estado.paises.length}`);
        
    } catch (erro) {
        console.error('❌ Erro inicial:', erro);
        mostrarErro(`
            <h3>⚠️ Problema de conexão</h3>
            <p>Não foi possível conectar ao servidor.</p>
            <p><strong>Dica:</strong> Certifique-se que o backend está rodando na porta 3001</p>
            <button onclick="location.reload()" class="btn-detalhes">
                🔄 Tentar novamente
            </button>
        `);
    }
}

// =========== CARREGAR LISTA DE PAÍSES ===========
async function carregarListaPaises() {
    try {
        const resposta = await fetch(`${API_BASE}/paises`);
        const dados = await resposta.json();
        
        if (dados.sucesso) {
            estado.paises = dados.paises || [];
            console.log(`✅ ${estado.paises.length} países carregados`);
        } else {
            console.warn('⚠️ Não foi possível carregar países');
            estado.paises = [];
        }
    } catch (erro) {
        console.warn('⚠️ Erro ao carregar países:', erro);
        estado.paises = [];
    }
}

// =========== RENDERIZAR NAVEGAÇÃO COMPLETA ===========
function renderizarNavegacaoCompleta() {
    console.log('🎨 Renderizando navegação completa...');
    
    const container = estado.elementos.temasBotoes;
    container.innerHTML = '';
    
    // 1. CABEÇALHO DA SEÇÃO
    const cabecalho = document.createElement('div');
    cabecalho.className = 'navegacao-cabecalho';
    cabecalho.innerHTML = `
        <h3 style="margin-bottom: 10px;">🎭 Explorar por:</h3>
        <div class="modo-botoes" style="display: flex; gap: 10px; margin-bottom: 20px;">
            <button class="btn-modo ${estado.modo === 'temas' ? 'ativo' : ''}" 
                    data-modo="temas" 
                    style="padding: 8px 16px; border-radius: 20px; border: 2px solid var(--vermelho); background: ${estado.modo === 'temas' ? 'var(--vermelho)' : 'transparent'}; color: ${estado.modo === 'temas' ? 'white' : 'var(--text-primary)'};">
                🎬 Temas
            </button>
            <button class="btn-modo ${estado.modo === 'paises' ? 'ativo' : ''}" 
                    data-modo="paises"
                    style="padding: 8px 16px; border-radius: 20px; border: 2px solid var(--azul); background: ${estado.modo === 'paises' ? 'var(--azul)' : 'transparent'}; color: ${estado.modo === 'paises' ? 'white' : 'var(--text-primary)'};">
                🌍 Países (${estado.paises.length})
            </button>
        </div>
    `;
    container.appendChild(cabecalho);
    
    // 2. CONTAINER DINÂMICO
    const conteudoContainer = document.createElement('div');
    conteudoContainer.id = 'navegacaoConteudo';
    container.appendChild(conteudoContainer);
    
    // 3. ADICIONAR EVENTOS AOS BOTÕES DE MODO
    document.querySelectorAll('.btn-modo').forEach(botao => {
        botao.addEventListener('click', function() {
            const novoModo = this.dataset.modo;
            console.log(`🔄 Mudando modo: ${estado.modo} → ${novoModo}`);
            estado.modo = novoModo;
            
            document.querySelectorAll('.btn-modo').forEach(b => {
                b.classList.toggle('ativo', b.dataset.modo === novoModo);
            });
            
            if (novoModo === 'temas') {
                renderizarBotoesTemas();
            } else {
                renderizarBotoesPaises();
            }
        });
    });
    
    // 4. RENDERIZAR CONTEÚDO INICIAL
    if (estado.modo === 'temas') {
        renderizarBotoesTemas();
    } else {
        renderizarBotoesPaises();
    }
}

// =========== RENDERIZAR BOTÕES DE TEMAS ===========
function renderizarBotoesTemas() {
    const container = document.getElementById('navegacaoConteudo');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (estado.temas.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Nenhum tema encontrado</p>';
        return;
    }
    
    const grid = document.createElement('div');
    grid.className = 'temas-grid';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
    grid.style.gap = '15px';
    
    estado.temas.forEach(tema => {
        const qtdFilmes = estado.filmes[tema.id]?.length || 0;
        
        if (qtdFilmes > 0) {
            const botao = document.createElement('button');
            botao.className = `btn-tema ${tema.id === estado.temaAtivo ? 'ativo' : ''}`;
            botao.dataset.tema = tema.id;
            botao.dataset.tipo = 'tema';
            
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
            
            grid.appendChild(botao);
        }
    });
    
    container.appendChild(grid);
}

// =========== RENDERIZAR BOTÕES DE PAÍSES ===========
function renderizarBotoesPaises() {
    const container = document.getElementById('navegacaoConteudo');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (estado.paises.length === 0) {
        container.innerHTML = `
            <p style="color: var(--text-secondary); text-align: center; padding: 20px;">
                🌍 Carregando países...
                <br><small>Conectando à CineWorld - Recomendações de Filmes</small>
            </p>
        `;
        
        setTimeout(() => carregarListaPaises().then(() => {
            if (estado.paises.length > 0) {
                renderizarBotoesPaises();
            }
        }), 1000);
        return;
    }
    
    // CABEÇALHO DE PAÍSES
    const cabecalhoPaises = document.createElement('div');
    cabecalhoPaises.innerHTML = `
        <p style="color: var(--text-secondary); margin-bottom: 15px; font-size: 0.9rem;">
            <strong>${estado.paises.length} países</strong> disponíveis • Clique para explorar
        </p>
    `;
    container.appendChild(cabecalhoPaises);
    
    // GRADE DE PAÍSES
    const grid = document.createElement('div');
    grid.className = 'paises-grid';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(120px, 1fr))';
    grid.style.gap = '12px';
    grid.style.maxHeight = '300px';
    grid.style.overflowY = 'auto';
    grid.style.padding = '10px';
    grid.style.borderRadius = '8px';
    grid.style.background = 'var(--card-bg)';
    
    estado.paises.forEach((pais) => {
        const botao = document.createElement('button');
        botao.className = `btn-pais ${estado.temaAtivo === `pais-${pais.codigo}` ? 'ativo' : ''}`;
        botao.dataset.pais = pais.codigo;
        botao.dataset.tipo = 'pais';
        botao.title = `Explorar filmes de ${pais.nome}`;
        
        botao.innerHTML = `
            <div style="font-size: 1.8rem; margin-bottom: 5px;">${pais.bandeira}</div>
            <div style="font-size: 0.8rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${pais.nome}
            </div>
        `;
        
        botao.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 15px 5px;
            border: 2px solid var(--border-color);
            border-radius: 10px;
            background: var(--card-bg);
            cursor: pointer;
            transition: all 0.3s ease;
            min-height: 90px;
        `;
        
        botao.addEventListener('mouseenter', () => {
            botao.style.transform = 'translateY(-3px)';
            botao.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            botao.style.borderColor = 'var(--azul)';
        });
        
        botao.addEventListener('mouseleave', () => {
            if (!botao.classList.contains('ativo')) {
                botao.style.transform = 'translateY(0)';
                botao.style.boxShadow = 'none';
                botao.style.borderColor = 'var(--border-color)';
            }
        });
        
        botao.addEventListener('click', () => {
            console.log(`🌍 Clicou no país: ${pais.codigo} - ${pais.nome}`);
            carregarFilmesPorPais(pais.codigo, pais.nome, pais.bandeira);
        });
        
        grid.appendChild(botao);
    });
    
    container.appendChild(grid);
    
    // FOOTER INFORMATIVO
    const footer = document.createElement('div');
    footer.innerHTML = `
        <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 15px; text-align: center;">
            ⚡ Dica: Use os botões acima para alternar entre <strong>Temas</strong> e <strong>Países</strong>
        </p>
    `;
    container.appendChild(footer);
}

// =========== CARREGAR FILMES POR PAÍS ===========
async function carregarFilmesPorPais(codigoPais, nomePais, bandeiraPais) {
    console.log(`🎬 Carregando filmes do país: ${codigoPais} (${nomePais})`);
    
    estado.elementos.app.innerHTML = `
        <div style="text-align: center; padding: 50px;">
            <div style="font-size: 3rem; margin-bottom: 20px;">${bandeiraPais}</div>
            <h2>Carregando filmes de ${nomePais}...</h2>
            <p style="color: var(--text-secondary);">Buscando na CineWorld - Recomendações de Filmes</p>
        </div>
    `;
    
    try {
        const resposta = await fetch(`${API_BASE}/filmes/pais/${codigoPais}`);
        const dados = await resposta.json();
        
        if (dados.sucesso) {
            estado.temaAtivo = `pais-${codigoPais}`;
            
            const temaVirtual = {
                id: `pais-${codigoPais}`,
                nome: `${bandeiraPais} Cinema ${nomePais}`,
                descricao: `Filmes populares de ${nomePais}. ${dados.total_filmes} filmes disponíveis.`,
                cor: '#1976d2',
                icone: bandeiraPais
            };
            
            renderizarApp(dados.filmes, temaVirtual);
            atualizarBotoesAtivos(`pais-${codigoPais}`);
            
            console.log(`✅ ${dados.filmes.length} filmes carregados de ${nomePais}`);
        } else {
            throw new Error(dados.erro || 'Erro ao carregar filmes do país');
        }
        
    } catch (erro) {
        console.error(`❌ Erro ao carregar filmes do país ${codigoPais}:`, erro);
        mostrarErro(`
            <h3>⚠️ Não foi possível carregar filmes de ${nomePais}</h3>
            <p>${erro.message}</p>
            <button onclick="carregarFilmesTemaAtivo()" class="btn-detalhes">
                ↩️ Voltar para temas
            </button>
        `);
    }
}

// =========== ATUALIZAR BOTÕES ATIVOS ===========
function atualizarBotoesAtivos(temaId) {
    document.querySelectorAll('[data-tema]').forEach(botao => {
        botao.classList.toggle('ativo', botao.dataset.tema === temaId);
    });
    
    document.querySelectorAll('[data-pais]').forEach(botao => {
        const paisId = `pais-${botao.dataset.pais}`;
        botao.classList.toggle('ativo', paisId === temaId);
        botao.style.borderColor = paisId === temaId ? 'var(--azul)' : 'var(--border-color)';
        botao.style.background = paisId === temaId ? 'var(--azul-10)' : 'var(--card-bg)';
    });
}

// =========== MUDAR TEMA ===========
function mudarTema(novoTema) {
    console.log(`🔄 Mudando tema: ${estado.temaAtivo} → ${novoTema}`);
    
    if (novoTema.startsWith('pais-')) {
        return;
    }
    
    if (!estado.filmes[novoTema]) {
        console.error(`❌ Tema ${novoTema} não encontrado!`);
        return;
    }
    
    estado.temaAtivo = novoTema;
    atualizarBotoesAtivos(novoTema);
    carregarFilmesTemaAtivo();
}

// =========== CARREGAR FILMES DO TEMA ATIVO ===========
function carregarFilmesTemaAtivo() {
    if (estado.temaAtivo.startsWith('pais-')) {
        return;
    }
    
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
        botao.addEventListener('click', () => mostrarDetalhesFilme(index, filmesLista, temaInfo));
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
function mostrarDetalhesFilme(index, filmesLista, temaInfo) {
    const filme = filmesLista[index];
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

// =========== MOSTRAR ERRO ===========
function mostrarErro(mensagem) {
    estado.elementos.loading.style.display = 'none';
    estado.elementos.app.style.display = 'none';
    estado.elementos.error.style.display = 'block';
    estado.elementos.error.innerHTML = mensagem;
}

// =========== ADICIONAR ESTILOS DINÂMICOS ===========
function adicionarEstilosPaises() {
    const estilo = document.createElement('style');
    estilo.textContent = `
        .btn-pais.ativo {
            border-color: var(--azul) !important;
            background: var(--azul-10) !important;
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(25, 118, 210, 0.2);
        }
        
        .btn-pais:hover:not(.ativo) {
            border-color: var(--azul) !important;
        }
        
        .paises-grid::-webkit-scrollbar {
            width: 6px;
        }
        
        .paises-grid::-webkit-scrollbar-track {
            background: var(--card-bg);
            border-radius: 3px;
        }
        
        .paises-grid::-webkit-scrollbar-thumb {
            background: var(--text-secondary);
            border-radius: 3px;
        }
        
        .btn-modo {
            transition: all 0.3s ease;
            cursor: pointer;
            border: 2px solid;
            font-weight: 500;
        }
        
        .btn-modo:hover:not(.ativo) {
            opacity: 0.8;
        }
        
        :root {
            --azul-10: rgba(25, 118, 210, 0.1);
            --border-color: #e0e0e0;
            --card-bg: #ffffff;
            --text-primary: #2c3e50;
            --text-secondary: #666;
            --text-muted: #888;
        }
        
        [data-theme="dark"] {
            --border-color: #444;
            --card-bg: #2c3e50;
            --text-primary: #ffffff;
            --text-secondary: #b0b0b0;
            --text-muted: #888;
        }
    `;
    document.head.appendChild(estilo);
}

// =========== INICIALIZAÇÃO FINAL ===========
adicionarEstilosPaises();

// Exportar funções globais
window.mostrarDetalhesFilme = mostrarDetalhesFilme;
window.mudarTema = mudarTema;
window.carregarFilmesTemaAtivo = carregarFilmesTemaAtivo;
window.fecharModal = fecharModal;

console.log('✅ Sistema global carregado!');
console.log('%c✨ CineWorld - Recomendações de Filmes PRONTA! ✨', 'font-size: 18px; color: #1976d2; font-weight: bold;');
console.log('%cAgora com TODOS os países do mundo! 🌍', 'color: #666;');
