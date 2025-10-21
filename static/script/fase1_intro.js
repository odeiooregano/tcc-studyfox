// === Função de confirmação de saída ===
function confirmExit() {
  const confirmar = confirm("Tem certeza que deseja voltar para a tela inicial?");
  if (confirmar) {
    window.location.href = "welcome";
  }
}

// === Falas do mascote ===
const falas = [
  "Vamos aprender a fazer uma introdução de redação dissertativa argumentativa, como no ENEM!",
  "A introdução deve apresentar o tema e indicar seu ponto de vista sobre ele.",
  "Você pode começar com um gancho, como uma citação, dado, pergunta ou fato histórico.",
  "Depois, é importante contextualizar o tema, explicando por que ele é relevante.",
  "Na sequência, você deve apresentar a sua tese — ou seja, a opinião que vai defender.",
  "A tese deve ser clara, objetiva e mostrar o caminho que sua argumentação vai seguir.",
  "Evite frases vagas ou genéricas. Seja direto e mostre que entendeu o tema proposto.",
  "Um bom parágrafo introdutório tem, geralmente, de 3 a 5 linhas. Nada muito longo!",
  "Pronto! Agora você sabe como fazer uma introdução eficiente para sua redação.",
  "Observe um exemplo de introdução antes de começarmos 😊"
];

let falaAtual = 0;

function atualizarFala() {
  document.getElementById("fala-do-mascote").textContent = falas[falaAtual];

  const mascoteArea = document.getElementById("mascote-area");
  const textoExplicativo = document.getElementById("texto-explicativo");

  if (falaAtual === falas.length - 1) {
    mascoteArea.classList.add("final-ajuste");
    textoExplicativo.classList.remove("oculto");
  } else {
    mascoteArea.classList.remove("final-ajuste");
    textoExplicativo.classList.add("oculto");
  }
}

function proximaFala() {
  if (falaAtual < falas.length - 1) {
    falaAtual++;
    atualizarFala();
  } else {
    window.location.href = "/fase1/perguntas";
  }
}

function voltarFala() {
  if (falaAtual > 0) {
    falaAtual--;
    atualizarFala();
  }
}

function mostrarModal() {
  document.getElementById("modal-overlay").classList.remove("escondido");
}

function fecharModal() {
  document.getElementById("modal-overlay").classList.add("escondido");
}



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
