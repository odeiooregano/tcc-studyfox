const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

let isOpen = false;

menuBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    sidebar.classList.toggle('open');
    menuBtn.innerHTML = isOpen ? '&#10006;' : '&#9776;';
});

document.addEventListener('DOMContentLoaded', function() {
    const userContainer = document.querySelector('.user-container');
    
    if (userContainer) {
        userContainer.addEventListener('click', function() {
            window.location.href = '/welcome/perfil';
        });
    }

    // --- Início do código de controle de áudio ---
    const audio = document.getElementById('background-audio');
    const soundBtn = document.getElementById('sound-btn');
    const soundIcon = document.getElementById('sound-icon');
    
    if (audio && soundBtn && soundIcon) {
        // Tenta reproduzir o áudio automaticamente
        audio.play().catch(error => {
            console.log("Autoplay bloqueado pelo navegador. O usuário precisa interagir para iniciar o áudio.");
        });

        // Adiciona um 'event listener' ao botão de som
        soundBtn.addEventListener('click', () => {
            if (audio.paused) {
                // Se o áudio estiver pausado, reproduza e mude o ícone
                audio.play();
                soundIcon.classList.remove('fa-volume-mute');
                soundIcon.classList.add('fa-volume-up');
            } else {
                // Se o áudio estiver tocando, pause e mude o ícone
                audio.pause();
                soundIcon.classList.remove('fa-volume-up');
                soundIcon.classList.add('fa-volume-mute');
            }
        });
    }
    // --- Fim do código de controle de áudio ---
});


document.addEventListener('click', (e) => {
    if (
        isOpen && 
        !sidebar.contains(e.target) && 
        e.target !== menuBtn
    ) {
        sidebar.classList.remove('open');
        menuBtn.innerHTML = '&#9776;';
        isOpen = false;
    }
});

// Variáveis de Estado do Jogo (serão preenchidas pelo Backend)
let gameProgress = {
    intro_progress_stage: 0, // 0: Nenhum, 1: Lacunas, 2: Ordenação, 3: Escrita
    total_essays_written: 0, // Contagem total de redações finalizadas
};

// Definição das Conquistas
// O 'unlocked' e 'progress' inicial serão sobrescritos pelos dados do backend.
// As 'conditions' agora são lógicas internas da função updateAchievementsFromProgress.
const achievements = {
    core: { 
        id: 'core', 
        name: 'Você', 
        description: 'Este é o seu perfil central. Todas as conquistas estão conectadas a você.', 
        unlocked: true, 
        progress: 100 
    },
    intro: { 
        id: 'intro', 
        name: 'Introdução', 
        description: 'Parabéns! Você dominou a Introdução ao concluir todos os seus módulos (Pesquisa, Roteiro e Revisão).', 
        unlocked: false, 
        progress: 0 
    },
    intro1: { 
        id: 'intro1', 
        name: 'Pesquisa', 
        description: 'Complete o exercício de preenchimento de lacunas sobre pesquisa.', 
        unlocked: false, 
        progress: 0 
    },
    intro2: { 
        id: 'intro2', 
        name: 'Roteiro', 
        description: 'Conclua o exercício de ordenação de frases para montar um roteiro.', 
        unlocked: false, 
        progress: 0 
    },
    intro3: { 
        id: 'intro3', 
        name: 'Revisão', 
        description: 'Finalize o exercício de escrita da introdução.', 
        unlocked: false, 
        progress: 0 
    },
    des: { 
        id: 'des', 
        name: 'Desenvolvimento', 
        description: 'Domine a arte do desenvolvimento de argumentos.', 
        unlocked: false, 
        progress: 0 
    },
    des1: { 
        id: 'des1', 
        name: 'Argumentos', 
        description: 'Estruture argumentos sólidos.', 
        unlocked: false, 
        progress: 0 
    },
    des2: { 
        id: 'des2', 
        name: 'Exemplos', 
        description: 'Utilize exemplos impactantes.', 
        unlocked: false, 
        progress: 0 
    },
    des3: { 
        id: 'des3', 
        name: 'Dados', 
        description: 'Incorpore dados de forma eficaz.', 
        unlocked: false, 
        progress: 0 
    },
    conc: { 
        id: 'conc', 
        name: 'Conclusão', 
        description: 'Aprenda a concluir sua redação de forma brilhante.', 
        unlocked: false, 
        progress: 0 
    },
    conc1: { 
        id: 'conc1', 
        name: 'Síntese', 
        description: 'Faça a síntese das ideias abordadas.', 
        unlocked: false, 
        progress: 0 
    },
    conc2: { 
        id: 'conc2', 
        name: 'Proposta', 
        description: 'Elabore propostas de intervenção.', 
        unlocked: false, 
        progress: 0 
    },
    conc3: { 
        id: 'conc3', 
        name: 'Finalização', 
        description: 'Finalize seu texto com maestria.', 
        unlocked: false, 
        progress: 0 
    },
    red: { 
        id: 'red', 
        name: 'Redação Completa', 
        description: 'Domine todo o processo de escrita de uma redação.', 
        unlocked: false, 
        progress: 0 
    },
    red1: { 
        id: 'red1', 
        name: 'Rascunho', 
        description: 'Crie seu primeiro rascunho completo.', 
        unlocked: false, 
        progress: 0 
    },
    red2: { 
        id: 'red2', 
        name: 'Correção', 
        description: 'Realize a correção completa da sua redação.', 
        unlocked: false, 
        progress: 0 
    },
    red3: { 
        id: 'red3', 
        name: 'Versão Final', 
        description: 'Produza sua versão final, impecável.', 
        unlocked: false, 
        progress: 0 
    }
};

// Mapeamento das conexões entre os nós
const connections = [
    { from: 'core', to: 'intro' },
    { from: 'intro', to: 'intro1' },
    { from: 'intro1', to: 'intro2' },
    { from: 'intro2', to: 'intro3' },
    { from: 'core', to: 'des' },
    { from: 'des', to: 'des1' },
    { from: 'des1', to: 'des2' },
    { from: 'des2', to: 'des3' },
    { from: 'core', to: 'conc' },
    { from: 'conc', to: 'conc1' },
    { from: 'conc1', to: 'conc2' },
    { from: 'conc2', to: 'conc3' },
    { from: 'intro3', to: 'red' }, // Conecta a introdução completa com o nó principal de redação
    { from: 'des3', to: 'red' },   // Conecta o desenvolvimento completo com o nó principal de redação
    { from: 'conc3', to: 'red' },  // Conecta a conclusão completa com o nó principal de redação
    { from: 'red', to: 'red1' },
    { from: 'red1', to: 'red2' },
    { from: 'red2', to: 'red3' },
];

function getElementPosition(id) {
    const element = document.getElementById(id);
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    const container = document.querySelector('.container');
    const containerRect = container.getBoundingClientRect();

    return {
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top
    };
}

// Desenhar as conexões entre os nós
function drawConnections() {
    // Remove as conexões existentes para redesenhar
    document.querySelectorAll('.connection').forEach(conn => conn.remove());

    connections.forEach(conn => {
        const fromPos = getElementPosition(conn.from);
        const toPos = getElementPosition(conn.to);

        if (fromPos && toPos) {
            const fromX = fromPos.x;
            const fromY = fromPos.y;
            const toX = toPos.x;
            const toY = toPos.y;

            const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
            const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;

            const connection = document.createElement('div');
            connection.className = 'connection';
            connection.style.width = `${length}px`;
            connection.style.height = '2px';
            connection.style.left = `${fromX}px`;
            connection.style.top = `${fromY}px`;
            connection.style.transform = `rotate(${angle}deg)`;

            // Opacidade da conexão baseada no status de desbloqueio do nó de ORIGEM
            if (achievements[conn.from] && achievements[conn.from].unlocked) {
                connection.style.opacity = '1'; // Conexão visível e ativa
                connection.style.backgroundColor = '#007bff'; // Azul para conexões ativas
            } else {
                connection.style.opacity = '0.3'; // Conexão mais fraca se o nó de origem estiver bloqueado
                connection.style.backgroundColor = '#cccccc'; // Cinza para conexões inativas
            }

            document.querySelector('.container').appendChild(connection);
        }
    });
}

// Atualizar o estado visual dos nós (classe 'locked' e texto de progresso)
function updateNodes() {
    Object.keys(achievements).forEach(id => {
        const node = document.getElementById(id);
        if (node) {
            const achievement = achievements[id];
            
            // Atualiza classes de unlocked/locked
            if (achievement.unlocked) {
                node.classList.remove('locked');
            } else {
                node.classList.add('locked');
            }

            // Atualiza o texto de progresso/checkmark
            let progressTextElement = node.querySelector('.progress-text');
            if (!progressTextElement) {
                progressTextElement = document.createElement('div');
                progressTextElement.className = 'progress-text';
                node.appendChild(progressTextElement);
            }
            if (achievement.unlocked && achievement.progress < 100) {
                 progressTextElement.textContent = `${Math.round(achievement.progress)}%`;
                 progressTextElement.style.display = 'block';
            } else if (achievement.unlocked && achievement.progress === 100) {
                 progressTextElement.textContent = '✔️'; // Checkmark para conquistas 100% completas
                 progressTextElement.style.display = 'block';
            } else {
                 progressTextElement.style.display = 'none'; // Esconde se bloqueado ou 0%
            }
        }
    });
}

// Mostrar a caixa de informações da conquista
function showInfo(id) {
    const ach = achievements[id];
    if (!ach) return; 

    const infoBox = document.getElementById('infoBox');
    const infoTitle = document.getElementById('infoTitle');
    const infoDesc = document.getElementById('infoDesc');
    const infoProgressElement = document.getElementById('infoProgress'); // Renomeado para evitar conflito com 'progress' da conquista
    const infoStatus = document.getElementById('infoStatus');

    // Armazena o ID do nó atualmente aberto para possível atualização se o progresso mudar
    infoBox.dataset.nodeId = id; 

    infoTitle.textContent = ach.name;
    infoDesc.textContent = ach.description;

    const percentage = ach.progress; // Usa o progresso já calculado e armazenado na conquista
    
    infoProgressElement.style.width = percentage + '%';
    infoProgressElement.textContent = `${Math.floor(percentage)}%`;

    // Lógica para exibir o status (Desbloqueada/Bloqueada) e a cor da barra de progresso
    if (ach.unlocked) {
        infoStatus.textContent = 'Status: Desbloqueada!';
        infoStatus.className = 'info-status unlocked';
        infoProgressElement.classList.remove('locked');
        infoProgressElement.classList.add('unlocked');
    } else {
        // Assume que a conquista está bloqueada, mas verifica dependências para a mensagem
        let statusMessage = 'Status: Bloqueada';
        let isParentLocked = false;
        
        // Lógica específica para o nó 'intro'
        if (id === 'intro') {
            if (!achievements.intro1.unlocked || !achievements.intro2.unlocked || !achievements.intro3.unlocked) {
                statusMessage = `Status: Bloqueada! Complete os exercícios da Introdução (Pesquisa, Roteiro, Revisão) primeiro.`;
                isParentLocked = true; // Considera como "bloqueada por dependência" para a mensagem
            }
        } else {
            // Para outros nós, verifica o pai direto
            const parentConnection = connections.find(conn => conn.to === id);
            if (parentConnection && !achievements[parentConnection.from].unlocked) {
                statusMessage = `Status: Bloqueada! Desbloqueie "${achievements[parentConnection.from].name}" primeiro.`;
                isParentLocked = true; // Considera como "bloqueada por dependência"
            }
        }

        // Se não está desbloqueada e não é explicitamente bloqueada por um pai, mostra o progresso atual
        if (!isParentLocked) {
             statusMessage += ` (Progresso: ${Math.floor(ach.progress)}%)`;
        }

        infoStatus.textContent = statusMessage;
        infoStatus.className = 'info-status locked';
        infoProgressElement.classList.remove('unlocked');
        infoProgressElement.classList.add('locked');
    }
    
    infoBox.style.display = 'block'; // Garante que a caixa de informações seja visível
}

// Função para fechar a caixa de informações
function closeInfoBox() {
    document.getElementById('infoBox').style.display = 'none';
    document.getElementById('infoBox').dataset.nodeId = ''; // Limpa o ID do nó aberto
}

// Função principal para atualizar o objeto 'achievements' com base nos dados do backend
function updateAchievementsFromProgress(progressData) {
    const introStage = progressData.intro_progress_stage; // 0, 1, 2, 3
    const totalEssays = progressData.total_essays_written; // Contagem total de redações

    // 1. Resetar todas as conquistas para o estado padrão (exceto core), antes de aplicar o progresso do backend
    for (const id in achievements) {
        if (id !== 'core') {
            achievements[id].unlocked = false;
            achievements[id].progress = 0;
        }
    }

    // 2. Definir o estado do core node (sempre desbloqueado)
    achievements.core.unlocked = true;
    achievements.core.progress = 100;

    // 3. Atualizar conquistas da Introdução (intro, intro1, intro2, intro3)
    // Sub-conquistas da Introdução
    if (introStage >= 1) { // Lacunas
        achievements.intro1.unlocked = true;
        achievements.intro1.progress = 100;
    }
    if (introStage >= 2) { // Ordenação
        achievements.intro2.unlocked = true;
        achievements.intro2.progress = 100;
    }
    if (introStage >= 3) { // Escrita
        achievements.intro3.unlocked = true;
        achievements.intro3.progress = 100;
    }
    
    // Conquista principal da Introdução
    achievements.intro.unlocked = achievements.intro1.unlocked && achievements.intro2.unlocked && achievements.intro3.unlocked;
    achievements.intro.progress = (
        (achievements.intro1.unlocked ? 1 : 0) +
        (achievements.intro2.unlocked ? 1 : 0) +
        (achievements.intro3.unlocked ? 1 : 0)
    ) / 3 * 100; // Progresso da 'intro' em % baseado nos filhos

    // 4. Atualizar conquistas de Desenvolvimento (des, des1, des2, des3)
    if (achievements.intro.unlocked) { // 'des' desbloqueia após 'intro' completa
        achievements.des.unlocked = true;
        achievements.des.progress = 100;
    }
    // As sub-conquistas de 'des' poderiam depender do 'totalEssays' ou de outro estágio
    // Ajuste estes limites de 'totalEssays' conforme seus requisitos reais de jogo
    if (achievements.des.unlocked && totalEssays >= 4) { // Exemplo: 4 redações para des1
        achievements.des1.unlocked = true;
        achievements.des1.progress = 100;
    }
    if (achievements.des1.unlocked && totalEssays >= 5) { // Exemplo: 5 redações para des2
        achievements.des2.unlocked = true;
        achievements.des2.progress = 100;
    }
    if (achievements.des2.unlocked && totalEssays >= 6) { // Exemplo: 6 redações para des3
        achievements.des3.unlocked = true;
        achievements.des3.progress = 100;
    }

    // 5. Atualizar conquistas de Conclusão (conc, conc1, conc2, conc3)
    if (achievements.des3.unlocked) { // 'conc' desbloqueia após 'des3'
        achievements.conc.unlocked = true;
        achievements.conc.progress = 100;
    }
    if (achievements.conc.unlocked && totalEssays >= 7) {
        achievements.conc1.unlocked = true;
        achievements.conc1.progress = 100;
    }
    if (achievements.conc1.unlocked && totalEssays >= 8) {
        achievements.conc2.unlocked = true;
        achievements.conc2.progress = 100;
    }
    if (achievements.conc2.unlocked && totalEssays >= 9) {
        achievements.conc3.unlocked = true;
        achievements.conc3.progress = 100;
    }

    // 6. Atualizar conquistas de Redação Final (red, red1, red2, red3)
    // O nó 'red' principal desbloqueia quando intro, des, e conc estão completos
    if (achievements.intro.unlocked && achievements.des.unlocked && achievements.conc.unlocked) {
        achievements.red.unlocked = true;
        achievements.red.progress = 100;
    }
    if (achievements.red.unlocked && totalEssays >= 10) {
        achievements.red1.unlocked = true;
        achievements.red1.progress = 100;
    }
    if (achievements.red1.unlocked && totalEssays >= 11) {
        achievements.red2.unlocked = true;
        achievements.red2.progress = 100;
    }
    if (achievements.red2.unlocked && totalEssays >= 12) {
        achievements.red3.unlocked = true;
        achievements.red3.progress = 100;
    }


    // Após todas as atualizações de estado, redesenha a UI
    updateNodes();
    drawConnections();
}

// Inicialização
window.onload = async function() { 
    // Esconda a caixa de informação ao carregar a página
    closeInfoBox();

    // Fetch user progress from the backend
    try {
        const response = await fetch('/api/user_progress');
        if (!response.ok) {
            // Se a resposta não for OK (ex: 401 Unauthorized), redireciona para o login
            if (response.status === 401) {
                console.warn("Usuário não logado. Redirecionando para login...");
                window.location.href = '/login';
                // Retorne um erro para interromper o fluxo de promessas
                throw new Error("Não autorizado"); 
            }
            throw new Error(`Erro ao carregar progresso do usuário: ${response.status}`);
        }
        const data = await response.json();
        console.log("Progresso do usuário carregado:", data); // Para depuração
        gameProgress = data; // Atualiza gameProgress com dados do backend
        updateAchievementsFromProgress(gameProgress); // Atualiza as conquistas com base nos dados reais

    } catch (error) {
        console.error("Erro no fetch de progresso:", error);
        // Em caso de erro, ainda tente renderizar com os dados padrões ou mínimos
        // Isso garantirá que o mapa apareça mesmo se o backend falhar
        updateNodes(); 
        drawConnections();
    }

    // Redesenha as conexões quando a janela é redimensionada
    window.addEventListener('resize', drawConnections);
};