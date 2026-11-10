/**
 * La Resistencia de los Vatios - Lógica Principal
 * Conexión de datos: GitHub Raw Content
 */

// --- 1. CONEXIÓN CON LOS DATOS DE TU REPOSITORIO ---
const GITHUB_USER = 'jenedyjuarezm-ctrl';
const REPO_NAME = 'sistema-solar-cuba-mercado';
const DATA_FILE = 'data/datos_web.json'; // Ruta del archivo JSON en tu repo

// Construimos la URL Raw de GitHub (esto evita problemas de CORS)
const DATA_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/main/${DATA_FILE}`;

async function fetchData() {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error('Error al cargar los datos del repositorio');
        const data = await response.json();
        console.log('✅ Datos cargados desde GitHub:', data);
        return data;
    } catch (error) {
        console.error('⚠️ Fallo en la conexión. Usando datos de respaldo.', error);
        // Datos de respaldo por si el fetch falla
        return {
            paradoja: { labels: ["2020", "2021", "2022"], capacidad: [0, 9.3, 18.7], generacion: [0, -3.7, -7.4] },
            supervivencia: { total_encuestados: 32, motivo_supervivencia: 100, motivo_ahorro: 0 }
        };
    }
}

// --- 2. FONDO 3D (Partículas de energía) ---
window.addEventListener('load', () => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        renderer.setSize(innerWidth, innerHeight);
        document.getElementById('canvas-container').appendChild(renderer.domElement);

        const geometry = new THREE.BufferGeometry();
        const count = 1800;
        const posArray = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) posArray[i] = (Math.random() - 0.5) * 25;
        geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const material = new THREE.PointsMaterial({
            size: 0.04, color: 0xff8c00, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending
        });
        const mesh = new THREE.Points(geometry, material);
        scene.add(mesh);
        camera.position.z = 5;

        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / innerWidth) - 0.5;
            mouseY = (e.clientY / innerHeight) - 0.5;
        });

        const clock = new THREE.Clock();
        let active = true;
        document.addEventListener('visibilitychange', () => {
            active = !document.hidden;
            if (active) animate();
        });

        function animate() {
            if (!active) return;
            requestAnimationFrame(animate);
            const t = clock.getElapsedTime();
            mesh.rotation.y = t * 0.03 + mouseX * 0.3;
            mesh.rotation.x = t * 0.015 + mouseY * 0.3;
            material.opacity = 0.4 + Math.sin(t * 1.5) * 0.2;
            renderer.render(scene, camera);
        }
        animate();

        addEventListener('resize', () => {
            camera.aspect = innerWidth / innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(innerWidth, innerHeight);
        });
    }
});

// --- 3. AUDIO SENSORIAL (Zumbido de red eléctrica) ---
let audioCtx, oscillator, gainNode;
document.body.addEventListener('click', () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        oscillator = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(50, audioCtx.currentTime); // 50Hz
        gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
    }
}, { once: true });

document.addEventListener('visibilitychange', () => {
    if (audioCtx) document.hidden ? audioCtx.suspend() : audioCtx.resume();
});

// --- 4. ANIMACIONES DE SCROLL Y GRÁFICAS (GSAP + Chart.js) ---
gsap.registerPlugin(ScrollTrigger);

// Revelar tarjetas
document.querySelectorAll('.reveal').forEach(el => {
    ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        onEnter: () => el.classList.add('visible'),
        once: true
    });
});

// Animación de números
gsap.from(document.getElementById('stat-1'), {
    textContent: 0, duration: 2, snap: { textContent: 1 }, ease: "power3.out",
    scrollTrigger: { trigger: "#stat-1", start: "top 85%" }
});

gsap.fromTo(document.getElementById('stat-2'), 
    { textContent: 0 },
    {
        textContent: -7.4, duration: 2, snap: { textContent: 0.1 }, ease: "power3.out",
        scrollTrigger: {
            trigger: "#stat-2", start: "top 85%",
            onEnter: () => {
                // Silenciar el zumbido al llegar a la caída
                if (gainNode) gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
            }
        }
    }
);

// --- 5. GRÁFICAS CON DATOS REALES ---
async function initCharts() {
    const data = await fetchData();
    let chart1, chart2;

    // Gráfica de la Paradoja
    ScrollTrigger.create({
        trigger: "#paradox-chart-wrapper",
        start: "top 85%",
        onEnter: () => {
            document.getElementById("paradox-chart-wrapper").classList.add('show');
            if (!chart1) {
                chart1 = new Chart(document.getElementById('paradoxChart').getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: data.paradoja.labels,
                        datasets: [
                            {
                                label: 'Capacidad Instalada (%)',
                                data: data.paradoja.capacidad,
                                borderColor: '#00e5ff',
                                backgroundColor: 'rgba(0, 229, 255, 0.1)',
                                borderWidth: 3, tension: 0.4, fill: true
                            },
                            {
                                label: 'Generación Real (%)',
                                data: data.paradoja.generacion,
                                borderColor: '#ff3333',
                                backgroundColor: 'rgba(255, 51, 51, 0.1)',
                                borderWidth: 3, borderDash: [5, 5], tension: 0.4, fill: true
                            }
                        ]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        animation: { duration: 2000, easing: 'easeOutQuart' },
                        plugins: { legend: { labels: { color: '#e8e8e8', font: { family: 'Space Mono', size: 10 } } } },
                        scales: {
                            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#88888c', font: { family: 'Space Mono' } } },
                            x: { grid: { display: false }, ticks: { color: '#88888c', font: { family: 'Space Mono' } } }
                        }
                    }
                });
            }
        }
    });

    // Interruptor de Supervivencia
    const switchEl = document.getElementById('survival-switch');
    const textEl = document.getElementById('survival-text');
    const survivalWrapper = document.getElementById('survival-chart-wrapper');
    let isActive = false;

    const toggleSwitch = () => {
        isActive = !isActive;
        switchEl.classList.toggle('active');
        if (isActive) {
            if (audioCtx) {
                // Sonido de "clic" al encender
                const clickOsc = audioCtx.createOscillator();
                const clickGain = audioCtx.createGain();
                clickOsc.type = 'sine';
                clickOsc.frequency.setValueAtTime(800, audioCtx.currentTime);
                clickOsc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
                clickGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                clickGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
                clickOsc.connect(clickGain); clickGain.connect(audioCtx.destination);
                clickOsc.start(); clickOsc.stop(audioCtx.currentTime + 0.1);
            }
            textEl.textContent = "“Para que no se dañe la comida en el apagón.”";
            textEl.style.color = "var(--accent-warm)";
            survivalWrapper.classList.add('show');
            if (!chart2) {
                chart2 = new Chart(document.getElementById('survivalChart').getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ['Moda/Ambiente', 'Supervivencia (Comida)'],
                        datasets: [{
                            label: `N=${data.supervivencia.total_encuestados}`,
                            data: [data.supervivencia.motivo_ahorro, data.supervivencia.motivo_supervivencia],
                            backgroundColor: ['rgba(255,255,255,0.1)', 'rgba(255,140,0,0.8)'],
                            borderColor: ['rgba(255,255,255,0.2)', 'rgba(255,140,0,1)'],
                            borderWidth: 2, borderRadius: 6
                        }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        animation: { duration: 1500, easing: 'easeOutBounce' },
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#88888c', font: { family: 'Space Mono' } } },
                            x: { grid: { display: false }, ticks: { color: '#e8e8e8', font: { family: 'Crimson Pro', size: 14 } } }
                        }
                    }
                });
            }
        } else {
            textEl.textContent = "Esperando conexión al sistema...";
            textEl.style.color = "var(--text-muted)";
            survivalWrapper.classList.remove('show');
        }
    };

    switchEl.addEventListener('click', toggleSwitch);
    switchEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSwitch(); }
    });
}

// Iniciar gráficas
initCharts();
