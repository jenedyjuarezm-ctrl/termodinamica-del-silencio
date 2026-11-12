const DATA_URL = `https://raw.githubusercontent.com/jenedyjuarezm-ctrl/termodinamica-del-silencio/main/data/datos_web.json`;
const SUPABASE_URL = 'https://jntyotrddlrzccoauram.supabase.co';
const SUPABASE_KEY = 'sb_publishable_H8uhN5DbCWLslwo4uJlDuw_jdAjE67K';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 1. AUDIO (Sintetizador Lofi) ---
const musicBtn = document.getElementById('music-toggle');
let audioCtx, isPlaying = false, lofiInterval;
function playLofi() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; 
    const playNote = (freq, time, duration, volume) => {
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(volume, time + 0.05); gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.connect(gain); gain.connect(audioCtx.destination); osc.start(time); osc.stop(time + duration);
    };
    const playDrum = (time) => {
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(150, time); osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
        gain.gain.setValueAtTime(0.1, time); gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        osc.connect(gain); gain.connect(audioCtx.destination); osc.start(time); osc.stop(time + 0.2);
    };
    const loop = () => {
        const now = audioCtx.currentTime;
        playNote(130.81, now, 2.0, 0.03); 
        playNote(scale[Math.floor(Math.random() * scale.length)], now + 0.5, 1.5, 0.02);
        playDrum(now); playDrum(now + 1.0);
    };
    loop(); lofiInterval = setInterval(loop, 2000);
}
if (musicBtn) {
    musicBtn.addEventListener('click', () => {
        if (!audioCtx) { playLofi(); isPlaying = true; musicBtn.classList.add('playing'); }
        else if (isPlaying) { audioCtx.suspend(); isPlaying = false; musicBtn.classList.remove('playing'); }
        else { audioCtx.resume(); isPlaying = true; musicBtn.classList.add('playing'); }
    });
}

// --- 2. CONTADOR Y PROGRESO ---
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    document.getElementById('scroll-progress').style.width = `${(scrollTop / scrollHeight) * 100}%`;
});
async function registrarYContarVisitas() {
    const countElement = document.getElementById('view-count');
    if (!countElement) return;
    try {
        await supabaseClient.from('page_views').insert([{}]);
        const { count, error } = await supabaseClient.from('page_views').select('*', { count: 'exact', head: true });
        if (error) throw error;
        countElement.textContent = count.toLocaleString('es-ES');
    } catch (error) { countElement.textContent = "N/A"; }
}
window.addEventListener('DOMContentLoaded', registrarYContarVisitas);

// --- 3. FONDO 3D ---
window.addEventListener('load', () => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setSize(innerWidth, innerHeight);
        document.getElementById('canvas-container').appendChild(renderer.domElement);
        const geo = new THREE.BufferGeometry(), pos = new Float32Array(2000 * 3);
        for (let i = 0; i < pos.length; i++) pos[i] = (Math.random() - 0.5) * 25;
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size: 0.04, color: 0xff8c00, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
        const mesh = new THREE.Points(geo, mat); scene.add(mesh); camera.position.z = 5;
        let mx = 0, my = 0; document.addEventListener('mousemove', e => { mx = (e.clientX / innerWidth) - 0.5; my = (e.clientY / innerHeight) - 0.5; });
        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate); const t = clock.getElapsedTime();
            mesh.rotation.y = t * 0.03 + mx * 0.3; mesh.rotation.x = t * 0.015 + my * 0.3; mat.opacity = 0.4 + Math.sin(t * 1.5) * 0.2;
            renderer.render(scene, camera);
        }
        animate();
    }
});

// --- 4. GRÁFICAS (GSAP + Chart.js) ---
gsap.registerPlugin(ScrollTrigger);
document.querySelectorAll('.reveal').forEach(el => {
    ScrollTrigger.create({ trigger: el, start: "top 85%", onEnter: () => el.classList.add('visible'), once: true });
});

// Datos estáticos basados en tu informe
function crearGraficas() {
    // 1. Gráfica de Metodología (Torta)
    const ctxMet = document.getElementById('metodologiaChart');
    if(ctxMet) {
        new Chart(ctxMet, {
            type: 'doughnut',
            data: {
                labels: ['Residentes (Primario)', 'Centros Web (OSINT)', 'Solineras Web (OSINT)'],
                datasets: [{ data: [32, 32, 32], backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'], borderWidth: 0 }]
            },
            options: { cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: '#888' } } } }
        });
    }

    // 2. Gráfica Paradoja (ONEI)
    const ctxPara = document.getElementById('paradoxChart');
    if(ctxPara) {
        new Chart(ctxPara, {
            type: 'line',
            data: {
                labels: ['2020', '2021', '2022'],
                datasets: [
                    { label: 'Generación Total (GW·h)', data: [19070, 17950, 15732], borderColor: '#3b82f6', yAxisID: 'y' },
                    { label: 'Generación FV (GW·h)', data: [260.8, 258.4, 241.5], borderColor: '#10b981', yAxisID: 'y1' },
                    { label: 'Potencia Instalada (MW)', data: [221.5, 240.0, 263.0], borderColor: '#ef4444', borderDash: [5,5], yAxisID: 'y1' }
                ]
            },
            options: { 
                responsive: true, maintainAspectRatio: false,
                scales: { 
                    y: { type: 'linear', position: 'left', title: { display: true, text: 'Generación Total', color: '#3b82f6' } },
                    y1: { type: 'linear', position: 'right', title: { display: true, text: 'FV / Potencia', color: '#ef4444' } }
                }
            }
        });
    }

    // 3. Gráfica Clima (NASA)
    const ctxNasa = document.getElementById('nasaChart');
    if(ctxNasa) {
        new Chart(ctxNasa, {
            type: 'bar',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                datasets: [
                    { type: 'bar', label: 'Irradiancia (kWh/m²/día)', data: [3.8, 4.8, 5.8, 6.5, 6.7, 6.2, 6.7, 6.1, 5.6, 4.6, 3.8, 3.3], backgroundColor: '#eab308', yAxisID: 'y' },
                    { type: 'line', label: 'Temperatura (°C)', data: [23.2, 24.0, 25.1, 26.3, 27.5, 28.1, 28.4, 28.3, 27.8, 26.8, 25.4, 23.6], borderColor: '#ec4899', borderWidth: 3, yAxisID: 'y1' }
                ]
            },
            options: { 
                responsive: true, maintainAspectRatio: false,
                scales: { 
                    y: { title: { display: true, text: 'Irradiancia' } },
                    y1: { type: 'linear', position: 'right', title: { display: true, text: 'Temperatura' } }
                }
            }
        });
    }

    // 4. Gráfica Escala (Barras)
    const ctxScale = document.getElementById('scaleChart');
    if(ctxScale) {
        new Chart(ctxScale, {
            type: 'bar',
            data: {
                labels: ['Residencias (Primarias)', 'Centros / Locales', 'Solineras (Web)'],
                datasets: [{ label: 'Potencia Mediana (kWp)', data: [2.0, 4.5, 40.0], backgroundColor: ['#10b981', '#ef4444', '#8b5cf6'] }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }

    // 5. Gráfica Supervivencia (Interactiva)
    const switchEl = document.getElementById('survival-switch');
    const textEl = document.getElementById('survival-text');
    const survivalWrapper = document.getElementById('survival-chart-wrapper');
    let isActive = false;
    let chartSurvival = null;

    if (switchEl) {
        switchEl.addEventListener('click', () => {
            isActive = !isActive; switchEl.classList.toggle('active');
            if (isActive) {
                textEl.textContent = "“Para que no se dañe la comida en el apagón.”"; textEl.style.color = "var(--accent-warm)";
                survivalWrapper.classList.add('show');
                if (!chartSurvival) {
                    chartSurvival = new Chart(document.getElementById('survivalChart').getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: ['Cortes de Energía', 'Ahorro Económico', 'Conciencia Ambiental'],
                            datasets: [{ label: 'Menciones (N=32)', data: [32, 5, 2], backgroundColor: ['#ef4444', '#3b82f6', '#10b981'] }]
                        },
                        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                    });
                }
            } else {
                textEl.textContent = "Esperando conexión..."; textEl.style.color = "var(--text-muted)"; survivalWrapper.classList.remove('show');
            }
        });
    }
}

// Iniciar gráficas
window.addEventListener('load', () => {
    setTimeout(crearGraficas, 500); // Pequeño delay para asegurar carga
});
