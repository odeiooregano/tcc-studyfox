
// static/js/load_fox_3d_index.js

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('fox-animation-container');

    if (!container) {
        console.error("Elemento #fox-animation-container não encontrado. O modelo 3D da raposa não será renderizado.");
        return; // Interrompe a execução se o container não for encontrado
    }

    console.log("Container encontrado:", container); // Verifica se o container foi achado

    // 1. Cenário
    const scene = new THREE.Scene();

    // 2. Câmera
    // Ajuste a 'fov' (campo de visão), 'aspect' (proporção), 'near' e 'far' (distâncias de renderização)
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0.5, 2); // Ajuste a posição da câmera para ver a raposa (X, Y, Z)

    // 3. Renderizador
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha: true para fundo transparente
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // Melhora a qualidade em telas de alta densidade
    container.appendChild(renderer.domElement);

    // Opcional: Adicionar controles de órbita para poder mover a câmera com o mouse (útil para debug)
    // Para usar OrbitControls, você precisaria importar o script:
    // <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
    // const controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true; // para um movimento mais suave
    // controls.dampingFactor = 0.25;

    // 4. Luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); // Luz ambiente, intensidade 1.2
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Luz direcional
    directionalLight.position.set(2, 5, 3); // Posição da luz
    scene.add(directionalLight);

    // Opcional: Adicionar uma luz traseira para simular reflexo/contorno
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-2, -5, -3);
    scene.add(backLight);


    // 5. Carregar o Modelo 3D com Animações
    let mixer; // Variável para o AnimationMixer

    loader.load(
        '/static/anim/caudamove.glb', // <-- CONFIRME SE ESTE CAMINHO ESTÁ 100% CORRETO!
        function (gltf) {
            const model = gltf.scene;
            scene.add(model);

            // Ajuste a escala e posição da raposa
            model.scale.set(0.8, 0.8, 0.8); // Ajuste este valor
            model.position.set(0, -0.7, 0); // Ajuste este valor (X, Y, Z)

            console.log("Modelo 3D carregado com sucesso!", model); // Confirma carregamento
            console.log("Animações encontradas:", gltf.animations); // Vê se há animações

            mixer = new THREE.AnimationMixer(model);
            if (gltf.animations && gltf.animations.length > 0) {
                gltf.animations.forEach((clip) => {
                    mixer.clipAction(clip).play();
                    console.log("Tocando animação:", clip.name);
                });
            } else {
                console.warn("Nenhuma animação encontrada no modelo 3D.");
            }

            animate(); // Inicia o loop de animação
        },
        function (xhr) {
            console.log('Progresso de carregamento:', (xhr.loaded / xhr.total * 100).toFixed(2) + '%');
        },
        function (error) {
            console.error('Um erro ocorreu ao carregar o modelo 3D:', error);
        }
    );

    // 6. Loop de Animação
    const clock = new THREE.Clock(); // Para controlar o tempo das animações

    function animate() {
        requestAnimationFrame(animate); // Chama a função novamente no próximo frame

        const delta = clock.getDelta(); // Tempo desde o último frame
        if (mixer) {
            mixer.update(delta); // Atualiza as animações
        }

        // if (controls) { // Se estiver usando OrbitControls
        //     controls.update();
        // }

        renderer.render(scene, camera); // Renderiza a cena
    }

    // 7. Responsvividade (ajusta o tamanho do renderizador quando a janela muda de tamanho)
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
});