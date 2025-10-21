
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Referências aos elementos HTML
const textoIntroducaoUsuario = document.getElementById('texto-introducao-usuario');
const corrigirComIaBtn = document.getElementById('corrigirComIaBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const correctionResultsContainer = document.getElementById('correctionResultsContainer');
const correctedTextElem = document.getElementById('correctedText');
const scoreElem = document.getElementById('score');
const suggestionsList = document.getElementById('suggestionsList');

// --- Funções para a API Gemini e exibição de resultados ---
corrigirComIaBtn.addEventListener('click', async () => {
    const introduction = textoIntroducaoUsuario.value.trim();

    if (!introduction) {
        displayError('Por favor, digite a introdução da redação para análise.');
        return;
    }

    correctionResultsContainer.classList.add('oculto');
    errorMessage.classList.add('oculto');
    loadingIndicator.style.display = 'block'; 
    corrigirComIaBtn.disabled = true; 

    try {
        let chatHistory = [];
        const prompt = `Você é um avaliador de redação do ENEM altamente qualificado. Analise a seguinte introdução de redação com base nos critérios do ENEM (Competências 1, 2 e 3, focando na adequação ao tema, clareza, coesão e gramática).

        1.  **Correção:** Revise e corrija a introdução para que esteja impecável e otimizada para os critérios do ENEM.
        2.  **Nota:** Atribua uma nota para esta introdução, de 0 a 200 pontos. Considere que esta é uma sub-nota da competência total da redação, focando apenas na introdução.
        3.  **Sugestões:** Forneça uma lista de sugestões detalhadas para melhorar a introdução, explicando o que pode ser aprimorado para alcançar uma nota mais alta no ENEM.

        A resposta deve ser em formato JSON, seguindo este esquema:
        {
            "correctedText": "Texto da introdução corrigida aqui.",
            "score": 180,
            "suggestions": [
                "Sugestão 1.",
                "Sugestão 2.",
                "Sugestão 3."
            ]
        }

        Introdução a ser avaliada:
        "${introduction}"`;

        chatHistory.push({ role: "user", parts: [{ text: prompt }] });

        const payload = {
            contents: chatHistory,
            generationConfig: {
                responseMimeType: "application/json", 
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        "correctedText": { "type": "STRING" },
                        "score": { "type": "NUMBER" },
                        "suggestions": {
                            "type": "ARRAY",
                            "items": { "type": "STRING" }
                        }
                    },
                    "propertyOrdering": ["correctedText", "score", "suggestions"] 
                }
            }
        };

        const apiKey = "AIzaSyCigqphcHuuXSljqcAovN9kGntaK5IL0D0"; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        updateProgressBar(100);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro na API do Gemini: ${response.status} - ${errorData.error.message || 'Erro desconhecido'}`);
        }

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {

            const jsonString = result.candidates[0].content.parts[0].text;
            const parsedJson = JSON.parse(jsonString); 

            correctedTextElem.textContent = parsedJson.correctedText || 'Nenhuma correção fornecida.';
            scoreElem.textContent = parsedJson.score !== undefined ? parsedJson.score : 'N/A';

            suggestionsList.innerHTML = '';
            if (parsedJson.suggestions && parsedJson.suggestions.length > 0) {
                parsedJson.suggestions.forEach(suggestion => {
                    const li = document.createElement('li');
                    li.textContent = suggestion;
                    suggestionsList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = 'Nenhuma sugestão de melhoria fornecida.';
                suggestionsList.appendChild(li);
            }

            correctionResultsContainer.classList.remove('oculto'); 

        } else {
            displayError('Formato de resposta inesperado da API do Gemini. Tente novamente.');
        }

    } catch (error) {
        console.error('Erro ao analisar redação:', error);
        displayError(`Não foi possível analisar a redação: ${error.message}.`);
    } finally {
        loadingIndicator.style.display = 'none'; 
        corrigirComIaBtn.disabled = false; 
    }
});

function displayError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('oculto');
}

function finalizeIntroductionPhase() {
    const scoreElement = document.getElementById('score');
    let finalScore = 0;
    if (scoreElement) {
        finalScore = parseInt(scoreElement.innerText) || 0;
    }

    fetch('/save_and_advance_intro_phase', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score: finalScore }), // Sending the score
    })
    .then(response => {
        if (!response.ok) {
            // If the HTTP status is not 2xx, process it as an error
            return response.json().then(errorData => {
                throw new Error(errorData.error || 'Erro desconhecido do servidor.');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log("Response from backend for finalizeIntroductionPhase:", data); // Log the response

        if (data.success) {
            console.log("Success! Redirecting to congratulations page.");
            window.location.href = CONGRATULATIONS_URL; // This should work now
        } else {
            // If backend sent success: false or some other non-success data
            console.warn("Backend reported non-success for finalizeIntroductionPhase:", data.message || data.error || 'No specific message.');
            alert('Erro ao finalizar a fase: ' + (data.message || data.error || 'Detalhes desconhecidos.'));
            // If you *still* want to redirect to welcome on error, add it here explicitly
            // window.location.href = WELCOME_URL;
        }
    })
    .catch(error => {
        console.error('Erro na requisição finalizeIntroductionPhase:', error);
        alert('Erro de comunicação com o servidor: ' + error.message);
    });
}

function confirmExit() {
    console.log('Função confirmExit chamada.');
}

function verificarLacunas() {
    console.log('Função verificarLacunas chamada.');
}
