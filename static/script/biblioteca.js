const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

let isOpen = false;

menuBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    sidebar.classList.toggle('open');
    menuBtn.innerHTML = isOpen ? '&#10006;' : '&#9776;';
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

document.addEventListener('DOMContentLoaded', function() {
    const userContainer = document.querySelector('.user-container');
    
    if (userContainer) {
        userContainer.addEventListener('click', function() {
            window.location.href = '/welcome/perfil';
        });
    }
    
    const logo = document.querySelector('.logo');
    
    if (logo) {
        logo.addEventListener('click', function() {
            window.location.href = '/welcome';
        });
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
});

function showCategory(categoria, event) {
    const categorias = document.querySelectorAll('.categoria');
    categorias.forEach(cat => cat.style.display = 'none');

    const botoes = document.querySelectorAll('.tab-btn');
    botoes.forEach(btn => btn.classList.remove('active'));

    document.getElementById(categoria).style.display = 'grid';
    
    if (event) event.target.classList.add('active');
}

function showDetails(title, image, director, genres, description) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-director').innerText = `Diretor: ${director}`;
    document.getElementById('modal-genres').innerHTML = `<strong>Gêneros:</strong> ${genres}`;
    document.getElementById('modal-image').src = image;
    document.getElementById('modal-description').innerText = description;

    document.getElementById('modal-source').classList.add('hidden');
    
    document.getElementById('modal-director').style.display = 'block';
    document.getElementById('modal-genres').style.display = 'block';
    document.getElementById('modal').style.display = 'flex';
}

function showDetailsDados(title, source, image, description, tituloPesquisa) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-image').src = image;
    document.getElementById('modal-description').innerText = description;
    document.getElementById('modal-director').style.display = 'none';
    document.getElementById('modal-genres').style.display = 'none';

    document.getElementById('modal-source').innerText = tituloPesquisa;

    const sourceElement = document.getElementById('modal-source');
    sourceElement.innerHTML = `<strong>Fonte:</strong> <a href="${source}" target="_blank">${tituloPesquisa}</a>`;
    sourceElement.classList.remove('hidden');

    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

document.getElementById('modal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeModal();
    }
});
