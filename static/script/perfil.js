const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const main = document.querySelector('main');

let isOpen = false;
let novaFotoTemporaria = null;

menuBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    sidebar.classList.toggle('open');
    main.style.marginLeft = isOpen ? '220px' : '0';
    menuBtn.innerHTML = isOpen ? '&#10006;' : '&#9776;';
});

document.addEventListener('click', (e) => {
    if (
        isOpen &&
        !sidebar.contains(e.target) &&
        e.target !== menuBtn
    ) {
        sidebar.classList.remove('open');
        main.style.marginLeft = '0';
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
});


function abrirEdicao() {
    document.getElementById('edit-username').value = document.getElementById('username').value;
    document.getElementById('edit-email').value = document.getElementById('email').value;

    document.getElementById('perfilContainer').style.display = 'none';
    document.getElementById('editarPerfil').style.display = 'block';
    
    document.getElementById('editarPerfil').classList.add('aberta');
}

function fecharEdicao() {
    document.getElementById('perfilContainer').style.display = 'block';
    document.getElementById('editarPerfil').style.display = 'none';
    
    document.getElementById('editarPerfil').classList.remove('aberta');
}

function excluirConta() {
    if (window.confirm("Tem certeza que deseja excluir sua conta? Essa ação não poderá ser desfeita.")) {
        console.log("Simulação: Conta excluída. Redirecionando para logout.");
        window.location.href = '/logout';
    } else {
        console.log("Exclusão de conta cancelada.");
    }
}

document.getElementById('foto-upload').addEventListener('change', function (event) {
    const file = event.target.files[0];
    let novaFotoTemporaria;
  
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
    
        reader.onload = function (e) {
            novaFotoTemporaria = e.target.result;
            document.getElementById('fotoPerfilEdicao').src = novaFotoTemporaria;
            document.getElementById('fotoPerfilVisualizacao').src = novaFotoTemporaria;
            document.querySelector('.perfil-pequeno').src = novaFotoTemporaria;
            };
    
        reader.readAsDataURL(file);
    } else {
        alert('Por favor, selecione uma imagem válida.');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const fotoUpload = document.getElementById('foto-upload');
    if (fotoUpload) {
        fotoUpload.addEventListener('change', function (event) {
            const file = event.target.files[0];
            let novaFotoTemporaria;
          
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
            
                reader.onload = function (e) {
                    novaFotoTemporaria = e.target.result;
                    
                    document.getElementById('fotoPerfilEdicao').src = novaFotoTemporaria;
                    document.getElementById('fotoPerfilVisualizacao').src = novaFotoTemporaria;
                    document.querySelector('.perfil-pequeno').src = novaFotoTemporaria;
                };
            
                reader.readAsDataURL(file);
            } else {
                alert('Por favor, selecione uma imagem válida.');
            }
        });
    }
});