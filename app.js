const GITHUB_USER = 'jenedyjuarezm-ctrl';
const REPO_NAME = 'sistema-solar-cuba-mercado';
const DATA_FILE = 'data/datos_web.json'; 
const DATA_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/main/${DATA_FILE}`;

// --- 1. REPRODUCTOR DE MÚSICA LOFI ---
const musicBtn = document.getElementById('music-toggle');
const audio = document.getElementById('lofi-audio');

musicBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.volume = 0.3; // Volumen suave de fondo
        audio.play().catch(e => console.log("Interacción requerida para audio"));
        musicBtn.classList.add('playing');
    } else {
        audio.pause();
        musicBtn.classList.remove('playing');
    }
});

// --- 2. BARRA DE PROGRESO DE LECTURA ---
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    document.getElementById('scroll-progress').style.width = `${progress}%`;
});

// --- 3. DATOS Y GRÁFICAS ---
async function fetchData() {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error('Error al cargar datos');
        return await response.json();
    } catch (error) {
        console.warn('Usando datos de respaldo');
        return {
            paradoja: { labels: ["2020", "2021", "2022"], capacidad: [0, 9.3, 18.7], generacion: [0, -3.7, -7.4] },
            supervivencia: { motivo_supervivencia: 100, motivo_ahorro: 0 },
            metodologia: { total_encuestados: 32 }
        };
    }
}

// --- 4. FONDO 3D ---
window.addEventListener('load', () => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        renderer.setSize(innerWidth, innerHeight);
        document.getElementById('canvas-container').appendChild(renderer.domElement);

        const geometry = new THREE.BufferGeometry();
        const count = 2000;
        const posArray = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) posArray[i] = (Math.random() - 0.5) * 25;
        geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const material = new THREE.PointsMaterial({ size: 0.04, color: 0xff8c00, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
        const mesh = new THREE.Points(geometry, material);
        scene.add(mesh);
        camera.position.z = 5;

        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / innerWidth) - 0.5;
            mouseY = (e.clientY / innerHeight) - 0.5;
        });

        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            const t = clock.getElapsedTime();
            mesh.rotation.y = t * 0.03 + mouseX * 0.3;
            mesh.rotation.x = t * 0.015 + mouseY * 0.3;
            material.opacity = 0.4 + Math.sin(t * 1.5) * 0.2;
            renderer.render(scene, camera);
        }
        animate();
    }
});

// --- 5. GSAP Y CHART.JS ---
gsap.registerPlugin(ScrollTrigger);

document.querySelectorAll('.reveal').forEach(el => {
    ScrollTrigger.create({ trigger: el, start: "top 85%", onEnter: () => el.classList.add('visible'), once: true });
});

gsap.from("#stat-1", { textContent: 0, duration: 2, snap: { textContent: 1 }, ease: "power3.out", scrollTrigger: { trigger: "#stat-1", start: "top 85%" } });
gsap.fromTo("#stat-2", { textContent: 0 }, { textContent: -7.4, duration: 2, snap: { textContent: 0.1 }, ease: "power3.out", scrollTrigger: { trigger: "#stat-2", start: "top 85%" } });

async function initCharts() {
    const data = await fetchData();
    let chart1, chart2;

    ScrollTrigger.create({
        trigger: "#paradox-chart-wrapper", start: "top 85%",
        onEnter: () => {
            document.getElementById("paradox-chart-wrapper").classList.add('show');
            if (!chart1) {
                chart1 = new Chart(document.getElementById('paradoxChart').getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: data.paradoja.labels,
                        datasets: [
                            { label: 'Capacidad Instalada (%)', data: data.paradoja.capacidad, borderColor: '#00e5ff', backgroundColor: 'rgba(0, 229, 255, 0.1)', borderWidth: 3, tension: 0.4, fill: true },
                            { label: 'Generación Real (%)', data: data.paradoja.generacion, borderColor: '#ff3333', backgroundColor: 'rgba(255, 51, 51, 0.1)', borderWidth: 3, borderDash: [5, 5], tension: 0.4, fill: true }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: false, animation: { duration: 2000 }, plugins: { legend: { labels: { color: '#e8e8e8', font: { family: 'Space Mono', size: 10 } } } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#88888c', font: { family: 'Space Mono' } } }, x: { grid: { display: false }, ticks: { color: '#88888c', font: { family: 'Space Mono' } } } } }
                });
            }
        }
    });

    const switchEl = document.getElementById('survival-switch');
    const textEl = document.getElementById('survival-text');
    const survivalWrapper = document.getElementById('survival-chart-wrapper');
    let isActive = false;

    const toggleSwitch = () => {
        isActive = !isActive;
        switchEl.classList.toggle('active');
        if (isActive) {
            textEl.textContent = "“Para que no se dañe la comida en el apagón.”";
            textEl.style.color = "var(--accent-warm)";
            survivalWrapper.classList.add('show');
            if (!chart2) {
                chart2 = new Chart(document.getElementById('survivalChart').getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ['Moda/Ambiente', 'Supervivencia (Comida)'],
                        datasets: [{ label: `N=${data.metodologia.total_encuestados}`, data: [data.supervivencia.motivo_ahorro, data.supervivencia.motivo_supervivencia], backgroundColor: ['rgba(255,255,255,0.1)', 'rgba(255,140,0,0.8)'], borderColor: ['rgba(255,255,255,0.2)', 'rgba(255,140,0,1)'], borderWidth: 2, borderRadius: 6 }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, animation: { duration: 1500, easing: 'easeOutBounce' }, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#88888c', font: { family: 'Space Mono' } } }, x: { grid: { display: false }, ticks: { color: '#e8e8e8', font: { family: 'Crimson Pro', size: 14 } } } } }
                });
            }
        } else {
            textEl.textContent = "Esperando conexión al sistema...";
            textEl.style.color = "var(--text-muted)";
            survivalWrapper.classList.remove('show');
        }
    };

    switchEl.addEventListener('click', toggleSwitch);
    switchEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSwitch(); } });
}

initCharts();
