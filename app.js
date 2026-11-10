// ==========================================================================
// 1. CONFIGURACIÓN INICIAL Y VARIABLES GLOBALES
// ==========================================================================
const GITHUB_USER = 'jenedyjuarezm-ctrl';
const REPO_NAME = 'termodinamica-del-silencio'; 
const DATA_FILE = 'data/datos_web.json'; 
const DATA_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/main/${DATA_FILE}`;

// Credenciales de Supabase (Para el contador de visitas)
const SUPABASE_URL = 'https://jntyotrddlrzccoauram.supabase.co';
const SUPABASE_KEY = 'sb_publishable_H8uhN5DbCWLslwo4uJlDuw_jdAjE67K';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================================================
// 2. DATOS SEGUROS (Respaldo si el JSON falla)
// ==========================================================================
async function fetchData() {
    try {
        const res = await fetch(DATA_URL);
        if (!res.ok) throw new Error('Fallo al cargar JSON');
        return await res.json();
    } catch (e) {
        console.warn(' Usando datos locales. Verifica la ruta del JSON en GitHub.');
        return {
            paradoja: { labels: ["2020", "2021", "2022", "2023", "2024", "2025", "2026"], capacidad: [0, 3.2, 7.5, 11.1, 14.5, 16.8, 18.7], generacion: [0, -1.2, -2.5, -4.1, -5.8, -6.5, -7.4] },
            supervivencia: { motivo_supervivencia: 100, motivo_ahorro: 0 },
            metodologia: { total_encuestados: 32 }
        };
    }
}

// ==========================================================================
// 3. REPRODUCTOR DE MÚSICA (Sintetizador Lofi en tiempo real)
// ==========================================================================
const musicBtn = document.getElementById('music-toggle');
let audioCtx, isPlaying = false, intervalId;

function playLofi() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // Acordes relajantes (Do mayor, Re menor, La menor)
    const chords = [
        [130.81, 164.81, 196.00], 
        [146.83, 174.61, 220.00], 
        [110.00, 130.81, 164.81]  
    ];
    let chordIndex = 0;

    const playChord = () => {
        const now = audioCtx.currentTime;
        chords[chordIndex].forEach(freq => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.05, now + 1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 4);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 4);
        });
        chordIndex = (chordIndex + 1) % chords.length;
    };

    playChord();
    intervalId = setInterval(playChord, 4000);
}

if (musicBtn) {
    musicBtn.addEventListener('click', () => {
        if (!audioCtx) {
            playLofi();
            isPlaying = true;
            musicBtn.classList.add('playing');
        } else if (isPlaying) {
            audioCtx.suspend();
            isPlaying = false;
            musicBtn.classList.remove('playing');
        } else {
            audioCtx.resume();
            isPlaying = true;
            musicBtn.classList.add('playing');
        }
    });
}

// ==========================================================================
// 4. BARRA DE PROGRESO DE LECTURA
// ==========================================================================
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) progressBar.style.width = `${progress}%`;
});

// ==========================================================================
// 5. CONTADOR DE VISITAS (Supabase)
// ==========================================================================
async function registrarYContarVisitas() {
    const countElement = document.getElementById('view-count');
    if (!countElement) return;

    try {
        // Sumar visita
        const { error: insertError } = await supabaseClient.from('page_views').insert([{}]);
        if (insertError) throw insertError;

        // Contar total
        const { count, error: countError } = await supabaseClient.from('page_views').select('*', { count: 'exact', head: true });
        if (countError) throw countError;

        countElement.textContent = count.toLocaleString('es-ES');
    } catch (error) {
        console.error('Error al contar visitas:', error);
        countElement.textContent = "N/A";
    }
}

window.addEventListener('DOMContentLoaded', registrarYContarVisitas);

// ==========================================================================
// 6. FONDO 3D (Three.js)
// ==========================================================================
window.addEventListener('load', () => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        renderer.setSize(innerWidth, innerHeight);
        
        const container = document.getElementById('canvas-container');
        if (container) container.appendChild(renderer.domElement);

        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(2000 * 3);
        for (let i = 0; i < pos.length; i++) pos[i] = (Math.random() - 0.5) * 25;
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

        const mat = new THREE.PointsMaterial({ size: 0.04, color: 0xff8c00, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
        const mesh = new THREE.Points(geo, mat);
        scene.add(mesh);
        camera.position.z = 5;

        let mx = 0, my = 0;
        document.addEventListener('mousemove', e => { mx = (e.clientX / innerWidth) - 0.5; my = (e.clientY / innerHeight) - 0.5; });

        const clock = new THREE.Clock();
        
        let active = true;
        document.addEventListener('visibilitychange', () => { active = !document.hidden; if(active) animate(); });

        function animate() {
            if(!active) return;
            requestAnimationFrame(animate);
            const t = clock.getElapsedTime();
            mesh.rotation.y = t * 0.03 + mx * 0.3;
            mesh.rotation.x = t * 0.015 + my * 0.3;
            mat.opacity = 0.4 + Math.sin(t * 1.5) * 0.2;
            renderer.render(scene, camera);
        }
        animate();
    }
});

// ==========================================================================
// 7. ANIMACIONES Y GRÁFICAS (GSAP + Chart.js)
// ==========================================================================
gsap.registerPlugin(ScrollTrigger);

// Revelar secciones
document.querySelectorAll('.reveal').forEach(el => {
    ScrollTrigger.create({ trigger: el, start: "top 85%", onEnter: () => el.classList.add('visible'), once: true });
});

// Animar números gigantes
if(document.getElementById('stat-1')) {
    gsap.from("#stat-1", { textContent: 0, duration: 2, snap: { textContent: 1 }, scrollTrigger: { trigger: "#stat-1", start: "top 85%" } });
}
if(document.getElementById('stat-2')) {
    gsap.fromTo("#stat-2", { textContent: 0 }, { textContent: -7.4, duration: 2, snap: { textContent: 0.1 }, scrollTrigger: { trigger: "#stat-2", start: "top 85%" } });
}

async function initCharts() {
    const data = await fetchData();
    let c1, c2;

    // Gráfica 1: La Paradoja
    const paradoxWrapper = document.getElementById("paradox-chart-wrapper");
    if (paradoxWrapper) {
        ScrollTrigger.create({
            trigger: paradoxWrapper, start: "top 85%",
            onEnter: () => {
                paradoxWrapper.classList.add('show');
                if (!c1) {
                    c1 = new Chart(document.getElementById('paradoxChart').getContext('2d'), {
                        type: 'line',
                        data: {
                            labels: data.paradoja.labels,
                            datasets: [
                                { label: 'Capacidad Instalada (%)', data: data.paradoja.capacidad, borderColor: '#00e5ff', backgroundColor: 'rgba(0,229,255,0.1)', borderWidth: 3, fill: true },
                                { label: 'Generación Real (%)', data: data.paradoja.generacion, borderColor: '#ff3333', backgroundColor: 'rgba(255,51,51,0.1)', borderWidth: 3, borderDash: [5,5], fill: true }
                            ]
                        },
                        options: { responsive: true, maintainAspectRatio: false, animation: { duration: 2000 }, plugins: { legend: { labels: { color: '#e8e8e8', font: { family: 'Space Mono' } } } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#88888c' } }, x: { ticks: { color: '#88888c' } } } }
                    });
                }
            }
        });
    }

    // Gráfica 2: Interruptor de Supervivencia
    const switchEl = document.getElementById('survival-switch');
    const textEl = document.getElementById('survival-text');
    const survivalWrapper = document.getElementById('survival-chart-wrapper');
    let isActive = false;

    if (switchEl) {
        const toggle = () => {
            isActive = !isActive; switchEl.classList.toggle('active');
            if (isActive) {
                textEl.textContent = "“Para que no se dañe la comida en el apagón.”"; textEl.style.color = "var(--accent-warm)";
                survivalWrapper.classList.add('show');
                if (!c2) {
                    c2 = new Chart(document.getElementById('survivalChart').getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: ['Moda/Ambiente', 'Supervivencia'],
                            datasets: [{ label: `N=${data.metodologia.total_encuestados}`, data: [data.supervivencia.motivo_ahorro, data.supervivencia.motivo_supervivencia], backgroundColor: ['rgba(255,255,255,0.1)', 'rgba(255,140,0,0.8)'], borderWidth: 2, borderRadius: 6 }]
                        },
                        options: { responsive: true, maintainAspectRatio: false, animation: { duration: 1500, easing: 'easeOutBounce' }, plugins: { legend: { display: false } }, scales: { y: { max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#88888c' } }, x: { ticks: { color: '#e8e8e8', font: { family: 'Crimson Pro', size: 14 } } } } }
                    });
                }
            } else {
                textEl.textContent = "Esperando conexión..."; textEl.style.color = "var(--text-muted)"; survivalWrapper.classList.remove('show');
            }
        };
        switchEl.addEventListener('click', toggle);
        switchEl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') toggle(); });
    }
}

initCharts();
