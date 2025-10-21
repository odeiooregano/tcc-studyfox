        const etapaAtual = Number({{ etapa }});
        const ultimaEtapa = {{ 'true' if ultima_etapa else 'false' }};
      
        const textosPorEtapa = {
            1: {
                'a': 'O novo escritor do Studyfox se prepara para o começo da jornada, com o conhecimento amplo sobre a arte das redações, ',
                'b': 'O novo escritor do Studyfox se prepara para o começo da jornada, com o conhecimento mediano sobre a arte das redações, ',
                'c': 'O novo escritor do Studyfox se prepara para o começo da jornada, sem conhecimento sobre a arte das redações, '
            },
            2: {
                'a': 'tem grande tempo livre, tenho certeza de que aprenderá muito, ',
                'b': 'mesmo com seu tempo livre limitado, tenho certeza de que aprenderá muito, ',
                'c': 'mesmo com seu tempo livre extremamente limitado, tenho certeza de que aprenderá muito, '
            },
            3: {
                'a': 'assim superando seu rival, a introdução na escrita. ',
                'b': 'assim superando seu rival, o desenvolvimento na escrita. ',
                'c': 'assim superando seu rival, a conclusão na escrita. '
            }
        };
      
        const pagina = document.getElementById('pagina-texto');
        const inputs = document.querySelectorAll('input[name="resposta"]');
      
        let timeoutAtual = null; // Armazena o timeout da digitação anterior

function escreverComoMaos(textoAnterior, novoTrecho, elemento, velocidade = 40) {
    if (timeoutAtual) clearTimeout(timeoutAtual); // Cancela qualquer digitação anterior

    let i = 0;
    elemento.textContent = textoAnterior;

    function escreverLetra() {
        if (i < novoTrecho.length) {
            elemento.textContent += novoTrecho.charAt(i);
            i++;
            timeoutAtual = setTimeout(escreverLetra, velocidade + Math.random() * 30);
        }
    }

    escreverLetra();
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
    // --- Fim do código de controle de áudio ---

      
        function exibirTextoAnterior() {
            let texto = '';
            for (let etapa = 1; etapa < etapaAtual; etapa++) {
                const resposta = sessionStorage.getItem(`etapa${etapa}`);
                if (resposta && textosPorEtapa[etapa]?.[resposta]) {
                    texto += textosPorEtapa[etapa][resposta];
                }
            }
            pagina.textContent = texto;
        }
      
        exibirTextoAnterior();
      
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                const valor = input.value;
                sessionStorage.setItem(`etapa${etapaAtual}`, valor);
      
                let textoAnterior = '';
                for (let etapa = 1; etapa < etapaAtual; etapa++) {
                    const resposta = sessionStorage.getItem(`etapa${etapa}`);
                    if (resposta && textosPorEtapa[etapa]?.[resposta]) {
                        textoAnterior += textosPorEtapa[etapa][resposta];
                    }
                }
      
                const novoTrecho = (textosPorEtapa[etapaAtual] && textosPorEtapa[etapaAtual][valor]) || '';
                sessionStorage.setItem('textoCaderno', textoAnterior + novoTrecho);
                escreverComoMaos(textoAnterior, novoTrecho, pagina, 35);
            });
        });
      
        if (ultimaEtapa) {
            const questionario = document.getElementById('questionario-container');
            const cadernoEsquerdo = document.getElementById('caderno-esquerdo');
            const paginaFinal = document.getElementById('pagina-final');
      
            if (questionario && cadernoEsquerdo && paginaFinal) {
                questionario.style.display = 'none';
                cadernoEsquerdo.style.display = 'block';
      
                const textoFinal = sessionStorage.getItem('textoCaderno') || '';
                paginaFinal.textContent = textoFinal;
            }
        }


    
        