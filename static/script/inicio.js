document.addEventListener('DOMContentLoaded', () => {
  const livro = document.getElementById('livroAnimado');
  const miolo = livro.querySelector('.miolo');
  const paginaEsquerda = livro.querySelector('.pagina.esquerda');
  const paginaDireita = livro.querySelector('.pagina.direita');

  function abrirLivro() {
    livro.classList.add('aberto');
  }

  function fecharLivro() {
    livro.classList.remove('aberto');
  }

  // IntersectionObserver para acionar animação
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        abrirLivro(); // Open the book when it comes into view
      } else {
        fecharLivro(); // Close the book when it goes out of view
      }
    });
  }, { threshold: 0.4 }); // Adjust threshold as needed

  observer.observe(livro); // Observe the book element
});

// FAQ toggle functionality
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', function() {
    const item = this.parentElement;
    document.querySelectorAll('.faq-item').forEach(i => {
      if (i !== item) i.classList.remove('open');
    });
    item.classList.toggle('open');
  });
});
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('mobile-menu'); // Ou a ID que você usar
  const sidebar = document.getElementById('sidebar'); // Ou a ID que você usar

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('open');
    });

    // Opcional: Fechar a sidebar ao clicar em um link
    sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        sidebar.classList.remove('open');
      });
    });
  }
});
