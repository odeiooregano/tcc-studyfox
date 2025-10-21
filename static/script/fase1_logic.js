function updateProgressBar(percentage) {
    console.log("Updating progress bar to: " + percentage + "%");
    const progressBarFill = document.querySelector('.progress-bar-fill');
    if (progressBarFill) {
        progressBarFill.style.width = percentage + '%';
        console.log("Progress bar width set to: " + progressBarFill.style.width);
    } else {
        console.error("Progress bar fill element not found!");
    }
}

// Variáveis globais para os exercícios de lacunas
let lacunaAtual = 0; 
const respostas = {}; 
let corrigido = false; 
let cenarioLacunasAtual = null; 

// Variáveis globais para o exercício de Ordenação (Drag and Drop)
let exercicioOrdemAtual = null; 
let draggedElement = null;
let currentExerciseType = 'lacunas-introducao'; 
let lacunasScenarioIndex = 0; 
let ordemScenarioIndex = 0; 

// Função para embaralhar um array (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ====================================================================
// FUNÇÕES PARA EXERCÍCIO DE LACUNAS
// ====================================================================

function iniciarExercicioLacunas(cenario) {
    cenarioLacunasAtual = cenario;

    document.getElementById('exercicio-pergunta').classList.remove('oculto');
    document.getElementById('exercicio-ordenacao').classList.add('oculto'); 
    document.getElementById('exercicio2').classList.add('oculto'); 

    document.querySelector('#exercicio-pergunta .fala').textContent = "Leia e responda com atenção!";

    const textoDinamicoP = document.getElementById('texto-dinamico');
    let textoComLacunasHTML = cenario.contexto;

    cenario.gaps.forEach(l => {
        const regex = new RegExp(`<lacuna id='l${l.id}'>______</lacuna>`, 'g');
        textoComLacunasHTML = textoComLacunasHTML.replace(regex, `<span class="lacuna-preenchivel" data-index="${l.id}">_______</span>`);
    });
    textoDinamicoP.innerHTML = textoComLacunasHTML;

    const feedbackDiv = document.getElementById("feedback-lacunas");
    feedbackDiv.innerHTML = '';
    feedbackDiv.classList.remove("sucesso", "erro");

    document.getElementById('btn-proximo-lacunas').classList.add('oculto');
    document.getElementById('btn-verificar-lacunas').classList.remove('oculto');

    Object.keys(respostas).forEach(key => delete respostas[key]);
    document.querySelectorAll('.lacuna-preenchivel').forEach(span => {
        span.textContent = '_______'; 
        span.classList.remove('correto', 'incorreto');
        span.title = '';
    });

    lacunaAtual = 0; 
    mostrarOpcoes(); 
}

function mostrarOpcoes() {
    const container = document.getElementById("opcoes-container");
    container.innerHTML = ""; 

    if (lacunaAtual >= cenarioLacunasAtual.gaps.length) {
        container.classList.add('oculto'); 
        document.getElementById("btn-verificar-lacunas").classList.remove('oculto');
        return;
    }

    const currentGapData = cenarioLacunasAtual.gaps[lacunaAtual];
    const opcoesDisponiveis = currentGapData.options;

    const opcoesParaLacunaAtual = shuffleArray([...opcoesDisponiveis]);

    container.classList.remove('oculto'); 
    document.getElementById("btn-verificar-lacunas").classList.add('oculto'); 

    opcoesParaLacunaAtual.forEach(op => {
        const btn = document.createElement("button");
        btn.textContent = op;
        btn.classList.add('btn-opcao-lacuna'); 
        btn.onclick = () => preencherLacuna(op);
        container.appendChild(btn);
    });
}

function preencherLacuna(texto) {
    const span = document.querySelector(`.lacuna-preenchivel[data-index="${cenarioLacunasAtual.gaps[lacunaAtual].id}"]`);
    if (span) {
        span.textContent = texto;
        span.classList.add("preenchida");
        respostas[span.dataset.index] = texto; 
    } else {
        console.warn(`Span com data-index="${cenarioLacunasAtual.gaps[lacunaAtual].id}" não encontrado.`);
    }

    lacunaAtual++; 

    if (lacunaAtual < cenarioLacunasAtual.gaps.length) {
        mostrarOpcoes(); 
    } else {
        document.getElementById("opcoes-container").classList.add('oculto'); 
        document.getElementById("btn-verificar-lacunas").classList.remove('oculto'); 
    }
}

window.verificarRespostasLacunas = async function() {
    try {
        const response = await fetch('/verificar_lacunas_introducao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cenario_id: cenarioLacunasAtual.id,
                respostas_usuario: respostas
            }),
        });

        const data = await response.json();
        const feedbackContainer = document.getElementById('feedback-lacunas');
        feedbackContainer.innerHTML = '';

        if (data.correto) {
            feedbackContainer.innerHTML = '<p class="text-green-600 font-bold">🎉 Todas as respostas estão corretas!</p>';
            document.getElementById('btn-proximo-lacunas').classList.remove('oculto');
            document.getElementById('btn-verificar-lacunas').classList.add('oculto');
            document.querySelectorAll('.lacuna-preenchivel').forEach(span => {
                span.classList.add('correto');
            });
        } else {
            feedbackContainer.innerHTML = '<p class="text-red-600 font-bold">Algumas respostas estão incorretas. Tente novamente.</p>';
            data.detalhes.forEach(detalhe => {
                const spanElement = document.querySelector(`.lacuna-preenchivel[data-index="${detalhe.index}"]`);
                if (spanElement) {
                    if (detalhe.acertou) {
                        spanElement.classList.remove('incorreto');
                        spanElement.classList.add('correto');
                    } else {
                        spanElement.classList.remove('correto');
                        spanElement.classList.add('incorreto');
                        spanElement.title = `Correto: ${detalhe.correta}`;
                    }
                }
            });
            // Keep the 'Verificar' button visible so the user can try again
            document.getElementById('btn-proximo-lacunas').classList.add('oculto');
            document.getElementById('btn-verificar-lacunas').classList.remove('oculto');

            // Reset lacunaAtual and show options again to allow re-attempting
            lacunaAtual = 0; // Reset to the first gap
            mostrarOpcoes(); // Re-display the options for the first gap
        }
    } catch (error) {
        console.error('Erro ao verificar respostas:', error);
        alert('Ocorreu um erro ao verificar as respostas. Tente novamente.');
    }
};

window.proximoExercicioLacunas = function() {
    avancarCenarioOuFase('lacunas');
    document.getElementById('feedback-lacunas').innerHTML = '';
    document.getElementById('btn-proximo-lacunas').classList.add('oculto');
    document.getElementById('btn-verificar-lacunas').classList.remove('oculto');
    document.querySelectorAll('.lacuna-preenchivel').forEach(span => {
        span.textContent = '_______';
        span.classList.remove('correto', 'incorreto', 'preenchida');
        span.title = '';
    });
    document.getElementById('opcoes-container').innerHTML = ''; 
    lacunaAtual = 0; 
    Object.keys(respostas).forEach(key => delete respostas[key]); 

    updateProgressBar(60);
};

// ====================================================================
// FUNÇÕES PARA EXERCÍCIO DE ORDENAÇÃO (DRAG AND DROP)
// ====================================================================

function iniciarExercicioOrdem(cenario) {
    exercicioOrdemAtual = cenario; 
    document.getElementById('exercicio-ordenacao').classList.remove('oculto');
    document.getElementById('exercicio-pergunta').classList.add('oculto'); 
    document.getElementById('exercicio2').classList.add('oculto'); 

    document.getElementById('fala-ordenacao').textContent = cenario.pergunta;

    const sortableList = document.getElementById('sortable-list');
    sortableList.innerHTML = ''; 

    const frasesEmbaralhadas = shuffleArray([...cenario.frases]); 

    frasesEmbaralhadas.forEach(frase => {
        const li = document.createElement('li');
        li.textContent = frase.texto;
        li.setAttribute('data-id', frase.id); 
        li.setAttribute('draggable', 'true');
        li.classList.add('sortable-item');
        sortableList.appendChild(li);
    });

    addDragDropEventListeners();

    document.getElementById('feedback-ordem').innerHTML = '';
    document.getElementById('feedback-ordem').classList.remove("sucesso", "erro");
    document.getElementById('btn-proximo-ordem').classList.add('oculto');
    document.getElementById('btn-verificar-ordem').classList.remove('oculto');
    sortableList.classList.remove('ordem-correta'); 
}


function addDragDropEventListeners() {
    const listItems = document.querySelectorAll('.sortable-item');
    listItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
    });
}

function handleDragStart(e) {
    draggedElement = e.target;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', draggedElement.innerHTML);
    draggedElement.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
    const target = e.target;
    if (target.classList.contains('sortable-item') && target !== draggedElement) {
        const rect = target.getBoundingClientRect();
        const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
        document.querySelectorAll('.sortable-item').forEach(item => item.classList.remove('drag-over-before', 'drag-over-after'));
        if (next) {
            target.classList.add('drag-over-after');
        } else {
            target.classList.add('drag-over-before');
        }
    }
}

function handleDrop(e) {
    e.preventDefault();
    const target = e.target;
    document.querySelectorAll('.sortable-item').forEach(item => item.classList.remove('drag-over-before', 'drag-over-after'));

    if (target.classList.contains('sortable-item') && target !== draggedElement) {
        const parent = target.parentNode;
        const nextSibling = target.nextSibling;
        const rect = target.getBoundingClientRect();
        const insertBefore = (e.clientY - rect.top) / (rect.bottom - rect.top) <= 0.5;

        if (insertBefore) {
            parent.insertBefore(draggedElement, target);
        } else {
            parent.insertBefore(draggedElement, nextSibling);
        }
    }
}

function handleDragEnd(e) {
    draggedElement.classList.remove('dragging');
    document.querySelectorAll('.sortable-item').forEach(item => item.classList.remove('drag-over-before', 'drag-over-after'));
    draggedElement = null; 
}

window.verificarOrdem = async function() {
    const sortableList = document.getElementById('sortable-list');
    const ordemAtualIds = Array.from(sortableList.children).map(item => item.dataset.id); 

    try {
        const response = await fetch('/verificar_ordem_introducao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cenario_id: exercicioOrdemAtual.id, 
                ordem_usuario: ordemAtualIds
            }),
        });

        const data = await response.json();
        const feedbackContainer = document.getElementById('feedback-ordem');
        feedbackContainer.innerHTML = '';

        if (data.correto) {
            feedbackContainer.innerHTML = '<p class="text-green-600 font-bold">🎉 Parabéns! A ordem está correta!</p>';
            sortableList.classList.add('ordem-correta'); 
            document.getElementById('btn-proximo-ordem').classList.remove('oculto');
            document.getElementById('btn-verificar-ordem').classList.add('oculto');
            document.querySelectorAll('.sortable-item').forEach(item => item.setAttribute('draggable', 'false'));
        } else {
            feedbackContainer.innerHTML = '<p class="text-red-600 font-bold">Ops! A ordem está incorreta. Tente novamente.</p>';
            document.getElementById('btn-proximo-ordem').classList.add('oculto');
            document.getElementById('btn-verificar-ordem').classList.remove('oculto');
        }
    } catch (error) {
        console.error('Erro ao verificar ordem:', error);
        alert('Ocorreu um erro ao verificar a ordem. Tente novamente.');
    }
};

window.proximoExercicioOrdem = function() {
    avancarCenarioOuFase('ordem');
    document.getElementById('feedback-ordem').innerHTML = '';
    document.getElementById('btn-proximo-ordem').classList.add('oculto');
    document.getElementById('btn-verificar-ordem').classList.remove('oculto');
    document.getElementById('sortable-list').classList.remove('ordem-correta'); 
    document.querySelectorAll('.sortable-item').forEach(item => item.setAttribute('draggable', 'true')); 
    updateProgressBar(90);
};

// ====================================================================
// FUNÇÕES DE NAVEGAÇÃO ENTRE EXERCÍCIOS/FASES
// ====================================================================

function avancarCenarioOuFase(origem) {
    const lacunasData = lacunas.lacunas;
    const ordemInvertidaData = lacunas.ordemInvertida;

    if (origem === 'lacunas') {
        lacunasScenarioIndex++;
        if (lacunasScenarioIndex < lacunasData.length) {
            iniciarExercicioLacunas(lacunasData[lacunasScenarioIndex]);
        } else {
            if (ordemInvertidaData && ordemInvertidaData.length > 0) {
                currentExerciseType = 'ordem-introducao'; 
                ordemScenarioIndex = 0; 
                iniciarExercicioOrdem(ordemInvertidaData[ordemScenarioIndex]);
            } else {
                console.log("Todos os exercícios de lacunas concluídos! Avançando para o exercício de escrita...");
                currentExerciseType = 'escrita';
                document.getElementById('exercicio-pergunta').classList.add('oculto');
                document.getElementById('exercicio-ordenacao').classList.add('oculto');
                document.getElementById('exercicio2').classList.remove('oculto');
            }
        }
    } else if (origem === 'ordem') {
        ordemScenarioIndex++;
        if (ordemInvertidaData && ordemScenarioIndex < ordemInvertidaData.length) {
            iniciarExercicioOrdem(ordemInvertidaData[ordemScenarioIndex]);
        } else {
            console.log("Todos os exercícios de ordenação concluídos! Avançando para o exercício de escrita...");
            currentExerciseType = 'escrita';
            document.getElementById('exercicio-pergunta').classList.add('oculto');
            document.getElementById('exercicio-ordenacao').classList.add('oculto');
            document.getElementById('exercicio2').classList.remove('oculto');
        }
    } else if (origem === 'escrita') {
        console.log("Todos os exercícios da introdução concluídos!");
    }
}

// ====================================================================
// INICIALIZAÇÃO
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
    if (lacunas && Array.isArray(lacunas.lacunas) && lacunas.lacunas.length > 0) {
        currentExerciseType = 'lacunas-introducao'; 
        iniciarExercicioLacunas(lacunas.lacunas[lacunasScenarioIndex]);
    } else if (lacunas && Array.isArray(lacunas.ordemInvertida) && lacunas.ordemInvertida.length > 0) {
        currentExerciseType = 'ordem-introducao';
        iniciarExercicioOrdem(lacunas.ordemInvertida[ordemScenarioIndex]);
    } else {
        console.error("Nenhum dado de exercício carregado ou vazio para lacunas ou ordenação.");
        currentExerciseType = 'escrita';
        document.getElementById('exercicio-pergunta').classList.add('oculto');
        document.getElementById('exercicio-ordenacao').classList.add('oculto');
        document.getElementById('exercicio2').classList.remove('oculto');
    }

    window.confirmExit = function() {
        if (confirm("Tem certeza que deseja sair? Seu progresso pode não ser salvo.")) {
            window.location.href = "/welcome";
        }
    };
});


    // --- Início do código de controle de áudio ---
    const audio = document.getElementById('background-audio');
    const soundBtn = document.getElementById('sound-btn');
    const soundIcon = document.getElementById('sound-icon');

    if (audio && soundBtn && soundIcon) {
        // Define loop infinito
        audio.loop = true;

        // Toca o áudio no primeiro clique em qualquer lugar da página
        function playAudio() {
            audio.play().then(() => console.log("Áudio iniciado!"))
                 .catch(err => console.log("Autoplay bloqueado:", err));
            document.removeEventListener('click', playAudio);
        }
        document.addEventListener('click', playAudio);

        // Botão de play/pause
        soundBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                soundIcon.classList.remove('fa-volume-mute');
                soundIcon.classList.add('fa-volume-up');
            } else {
                audio.pause();
                soundIcon.classList.remove('fa-volume-up');
                soundIcon.classList.add('fa-volume-mute');
            }
        });
    }