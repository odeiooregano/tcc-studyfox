document.addEventListener('DOMContentLoaded', function() {
    const userContainer = document.querySelector('.user-container');
    
    if (userContainer) {
        userContainer.addEventListener('click', function() {
            window.location.href = '/welcome/perfil';
        });
    }
    
    const audio = document.getElementById('background-audio');
    const soundBtn = document.getElementById('sound-btn');
    const soundIcon = document.getElementById('sound-icon');

    // Define loop infinito
    audio.loop = true;

    // Toca o áudio quando o usuário clicar em qualquer lugar da página
    function playAudio() {
        audio.play().then(() => {
            console.log("Áudio iniciado!");
        }).catch(err => {
            console.log("Autoplay bloqueado:", err);
        });

        // Remove o listener para não disparar várias vezes
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
});

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
