/**
 * 🎬 ENCONTRE UM FILME PARA ASSISTIR • FIND A MOVIE TO WATCH
 * 👩💻 Desenvolvido por Alabaster Developer
 * 📅 2026 • 
 * 🐙 github.com/Brenda-Tavares
 */

console.log('%c👩💻 Alabaster Developer', 'color: #d32f2f; font-weight: bold; font-size: 14px;');
console.log('%c🎬 App de recomendações de filmes', 'color: #666;');

// =========== ESTADO DA APLICAÇÃO ===========
let estado = {
    temaAtivo: 'cinema-brasileiro', // AGORA COMEÇA COM BRASIL!
    filmes: {},
    temas: [],
    elementos: {}
};

// =========== QUANDO A PÁGINA CARREGAR ===========
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - INICIANDO APP');
    
    // Inicializar elementos
    inicializarElementos();
    
    // Carregar dados
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

// =========== CARREGAR DADOS ===========
async function carregarDados() {
    console.log('📂 Carregando dados JSON...');
    
    try {
        // 1. Carregar filmes.json
        console.log('1. Buscando filmes.json...');
        const respostaFilmes = await fetch('data/filmes.json');
        
        if (!respostaFilmes.ok) {
            throw new Error(`Erro HTTP ${respostaFilmes.status} - filmes.json`);
        }
        
        const dadosFilmes = await respostaFilmes.json();
        console.log('✅ filmes.json carregado');
        console.log('   Temas encontrados:', Object.keys(dadosFilmes));
        
        // 2. Carregar temas.json
        console.log('2. Buscando temas.json...');
        const respostaTemas = await fetch('data/temas.json');
        
        if (!respostaTemas.ok) {
            throw new Error(`Erro HTTP ${respostaTemas.status} - temas.json`);
        }
        
        const dadosTemas = await respostaTemas.json();
        console.log('✅ temas.json carregado');
        console.log('   Temas:', dadosTemas.temas?.map(t => t.id));
        
        // 3. Atualizar estado
        estado.filmes = dadosFilmes;
        estado.temas = dadosTemas.temas || [];
        
        // 4. LOG DETALHADO
        console.log('📊 DETALHES DOS DADOS:');
        estado.temas.forEach(tema => {
            const qtd = estado.filmes[tema.id]?.length || 0;
            console.log(`   ${tema.id}: ${qtd} filme(s) - "${tema.nome}"`);
        });
        
        // 5. Verificar se tema brasileiro existe
        const temaBR = estado.temas.find(t => t.id === 'cinema-brasileiro');
        if (!temaBR) {
            console.error('❌ ERRO CRÍTICO: Tema "cinema-brasileiro" não encontrado!');
            console.log('Temas disponíveis:', estado.temas.map(t => t.id));
        } else {
            console.log('✅ Tema brasileiro encontrado:', temaBR);
        }
        
        // 6. Mostrar navegação
        estado.elementos.navTemas.style.display = 'block';
        
        // 7. Renderizar navegação de temas
        renderizarNavegacaoTemas();
        
        // 8. Carregar filmes do tema ativo
        carregarFilmesTemaAtivo();
        
    } catch (erro) {
        console.error('❌ Erro ao carregar dados:', erro);
        mostrarErro(`Não foi possível carregar os dados: ${erro.message}`);
    }
}

// =========== RENDERIZAR NAVEGAÇÃO DE TEMAS ===========
function renderizarNavegacaoTemas() {
    console.log('🎨 Renderizando botões de temas...');
    
    const container = estado.elementos.temasBotoes;
    container.innerHTML = '';
    
    if (estado.temas.length === 0) {
        container.innerHTML = '<p style="color: #666;">Nenhum tema encontrado</p>';
        return;
    }
    
    estado.temas.forEach(tema => {
        // Contar filmes neste tema
        const qtdFilmes = estado.filmes[tema.id] ? estado.filmes[tema.id].length : 0;
        
        console.log(`   Criando botão: ${tema.id} (${qtdFilmes} filmes)`);
        
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
            
            // Evento de clique
            botao.addEventListener('click', () => {
                console.log(`🖱️ Clicou no tema: ${tema.id} - "${tema.nome}"`);
                mudarTema(tema.id);
            });
            
            container.appendChild(botao);
        } else {
            console.log(`   ⚠️ Tema ${tema.id} ignorado: 0 filmes`);
        }
    });
    
    console.log(`✅ ${container.children.length} botões criados`);
}

// =========== MUDAR TEMA ===========
function mudarTema(novoTema) {
    console.log(`🔄 MUDANDO TEMA: ${estado.temaAtivo} → ${novoTema}`);
    
    // Verificar se o tema existe
    if (!estado.filmes[novoTema]) {
        console.error(`❌ Tema ${novoTema} não existe nos filmes!`);
        return;
    }
    
    // Atualizar estado
    estado.temaAtivo = novoTema;
    
    // Atualizar botões ativos
    document.querySelectorAll('.btn-tema').forEach(botao => {
        const isAtivo = botao.dataset.tema === novoTema;
        botao.classList.toggle('ativo', isAtivo);
    });
    
    // Carregar filmes do novo tema
    carregarFilmesTemaAtivo();
}

// =========== CARREGAR FILMES DO TEMA ATIVO ===========
function carregarFilmesTemaAtivo() {
    const filmesTema = estado.filmes[estado.temaAtivo] || [];
    const temaInfo = estado.temas.find(t => t.id === estado.temaAtivo);
    
    console.log(`🎬 Carregando ${filmesTema.length} filmes do tema: ${temaInfo?.nome || estado.temaAtivo}`);
    
    if (filmesTema.length === 0) {
        console.error(`❌ Nenhum filme no tema ${estado.temaAtivo}!`);
        mostrarErro(`Nenhum filme encontrado para o tema "${temaInfo?.nome || estado.temaAtivo}"`);
        return;
    }
    
    // Renderizar app
    renderizarApp(filmesTema, temaInfo);
    
    // Esconder loading, mostrar app
    estado.elementos.loading.style.display = 'none';
    estado.elementos.app.style.display = 'block';
}

// =========== RENDERIZAR APLICAÇÃO ===========
function renderizarApp(filmesLista, temaInfo) {
    console.log(`🎨 Renderizando ${filmesLista.length} filmes...`);
    
    // Cor do tema
    const corTema = temaInfo?.cor || '#d32f2f';
    
    // Criar HTML do app
    let html = `
        <div class="secao-tema" id="secaoTema" style="border-left: 5px solid ${corTema};">
            <h2>${temaInfo ? temaInfo.nome : '🎬 Filmes Recomendados'}</h2>
            ${temaInfo ? `<p class="descricao-tema">${temaInfo.descricao}</p>` : ''}
        </div>
        
        <div class="filmes-grid" id="filmesGrid">
    `;
    
    // Adicionar cada filme
    filmesLista.forEach((filme, index) => {
        html += criarCardFilme(filme, index, corTema);
    });
    
    html += `
        </div>
        
        <div class="footer-app" style="text-align: center; padding: 1.5rem; color: #666;">
            <p>🎭 ${filmesLista.length} filme${filmesLista.length !== 1 ? 's' : ''} encontrado${filmesLista.length !== 1 ? 's' : ''} em "${temaInfo?.nome || 'este tema'}"</p>
        </div>
    `;
    
    // Atualizar DOM
    estado.elementos.app.innerHTML = html;
    
    // Guardar referências
    estado.elementos.filmesGrid = document.getElementById('filmesGrid');
    estado.elementos.secaoTema = document.getElementById('secaoTema');
    
    // Adicionar eventos aos botões
    document.querySelectorAll('.btn-detalhes').forEach((botao, index) => {
        botao.addEventListener('click', () => mostrarDetalhesFilme(index));
    });
    
    console.log(`✅ ${filmesLista.length} filmes renderizados`);
}

// =========== CRIAR CARD DE FILME ===========
function criarCardFilme(filme, index, corTema) {
    return `
    <div class="filme-card" data-index="${index}">
        <div class="filme-imagem" style="
            background: linear-gradient(45deg, ${corTema}20, ${corTema}40);
            position: relative;
            overflow: hidden;
        ">
            ${filme.cartaz_url ? `
                <img src="${filme.cartaz_url}" 
                     alt="${filme.titulo_pt}"
                     style="
                         width: 100%;
                         height: 100%;
                         object-fit: cover;
                         position: absolute;
                         top: 0;
                         left: 0;
                         opacity: 0.9;
                     "
                     onerror="this.style.display='none'">
            ` : ''}
            
            <div style="
                position: relative;
                z-index: 2;
                text-align: center;
                padding: 20px;
                color: white;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            ">
                <div class="bandeira-grande" style="font-size: 2.5rem; margin-bottom: 10px;">
                    ${filme.bandeira || '🎬'}
                </div>
                <div style="font-size: 1rem; font-weight: bold; background: rgba(0,0,0,0.6); padding: 5px 10px; border-radius: 5px;">
                    ${filme.pais}
                </div>
            </div>
        </div>
        ...
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
                        ${filme.bandeira || ''} ${filme.pais} • ${filme.ano} • Dir. ${filme.diretor}
                    </p>
                </div>
                
                <div class="modal-body">
                    ${filme.cartaz_url ? `
                        <div style="text-align: center; margin-bottom: 1.5rem;">
                            <img src="${filme.cartaz_url}" alt="${filme.titulo_pt}" 
                                style="max-width: 250px; border-radius: 8px; box-shadow: 0 6px 20px rgba(0,0,0,0.2);">
                        </div>
                    ` : ''}
                    
                    <div style="margin-bottom: 2rem;">
                        <h3 style="color: ${corTema}; margin-bottom: 1rem;">📖 Sinopse</h3>
                        <p style="line-height: 1.6; font-size: 1.05rem;">${filme.sinopse}</p>
                    </div>
                    
                    ${filme.analise_cultural ? `
                        <div style="margin-bottom: 2rem;">
                            <h3 style="color: ${corTema}; margin-bottom: 1rem;">🌍 Análise Cultural</h3>
                            <p style="line-height: 1.6; background: ${corTema}10; padding: 1.2rem; border-radius: 8px;">
                                ${filme.analise_cultural}
                            </p>
                        </div>
                    ` : ''}
                    
                    <div style="background: #f8f9fa; padding: 1.8rem; border-radius: 10px; margin-bottom: 2rem;">
                        <h3 style="color: #666; margin-bottom: 1.2rem; border-bottom: 2px solid #eee; padding-bottom: 0.5rem;">📊 Informações</h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                            <div>
                                <strong style="color: #555;">Avaliação IMDb:</strong><br>
                                <span style="color: #f39c12; font-size: 1.4rem; font-weight: bold; display: inline-block; margin-top: 5px;">
                                    ${filme.avaliacao_imdb ? `⭐ ${filme.avaliacao_imdb}/10` : 'N/A'}
                                </span>
                            </div>
                            
                            ${filme.onde_assistir && filme.onde_assistir.length > 0 ? `
                                <div>
                                    <strong style="color: #555;">Onde assistir:</strong><br>
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
                        
                        ${filme.curiosidade ? `
                            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #eee;">
                                <strong style="color: #555;">🎯 Curiosidade:</strong><br>
                                <em style="color: #666; display: block; margin-top: 8px; font-style: italic;">
                                    ${filme.curiosidade}
                                </em>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${filme.temas && filme.temas.length > 0 ? `
                        <div>
                            <h3 style="color: ${corTema}; margin-bottom: 1rem;">🏷️ Temas Relacionados</h3>
                            <div>
                                ${filme.temas.map(tema => 
                                    `<span style="display: inline-block; background: ${corTema}20; 
                                              color: ${corTema}; padding: 0.6rem 1.2rem; 
                                              margin: 0.3rem; border-radius: 20px; 
                                              font-weight: 500;">${tema}</span>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Adicionar modal ao body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Mostrar modal
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
    estado.elementos.error.style.display = 'block';
    estado.elementos.error.innerHTML = `
        <h3>⚠️ Ocorreu um erro</h3>
        <p>${mensagem}</p>
        <button onclick="location.reload()" style="
            background: #d32f2f; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            margin-top: 10px; 
            cursor: pointer;
            font-weight: bold;
        ">
            🔄 Tentar novamente
        </button>
    `;
}

// =========== EXPORTAR FUNÇÕES GLOBAIS ===========
window.mostrarDetalhesFilme = mostrarDetalhesFilme;
window.mudarTema = mudarTema;

console.log('✅ Script carregado com sucesso! Pronto para iniciar...');

/* ======= FORMATAÇÃO PARA APARÊNCIA DE BANDEIRAS ======= */
    function converterParaBandeira(codigo) {
    const bandeiras = {
        'BR': '🇧🇷',
        'IN': '🇮🇳', 
        'IR': '🇮🇷',
        'US': '🇺🇸',
        'FR': '🇫🇷',
        'JP': '🇯🇵',
        'KR': '🇰🇷',
        'MX': '🇲🇽',
        'AR': '🇦🇷'
    };
    return bandeiras[codigo] || '🎬';
    }
