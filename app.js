const SUPABASE_URL = 'https://jntyotrddlrzccoauram.supabase.co';
const SUPABASE_KEY = 'sb_publishable_H8uhN5DbCWLslwo4uJlDuw_jdAjE67K';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 1. AUDIO SENSORIAL (Sintetizador Lofi) ---
const musicBtn = document.getElementById('music-toggle');
let audioCtx, isPlaying = false;
function playLofi() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const filter = audioCtx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 800; filter.connect(audioCtx.destination);
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; 
    const playNote = (freq, time, dur, vol) => {
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(vol, time + 0.05); gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(gain); gain.connect(filter); osc.start(time); osc.stop(time + dur);
    };
    const loop = () => {
        const now = audioCtx.currentTime;
        playNote(130.81, now, 2.0, 0.04); playNote(scale[Math.floor(Math.random()*5)], now + 0.5, 1.5, 0.03);
    };
    loop(); setInterval(loop, 2000);
}
if (musicBtn) { musicBtn.addEventListener('click', () => { if (!audioCtx) { playLofi(); isPlaying = true; musicBtn.classList.add('playing'); } else if (isPlaying) { audioCtx.suspend(); isPlaying = false; musicBtn.classList.remove('playing'); } else { audioCtx.resume(); isPlaying = true; musicBtn.classList.add('playing'); } }); }

// --- 2. CONTADOR DE VISITAS (Anti-recarga) ---
async function gestionarVisitas() {
    const countElement = document.getElementById('view-count');
    if (!countElement) return;
    try {
        if (!localStorage.getItem('cuba_visita')) {
            await supabaseClient.from('page_views').insert([{}]);
            localStorage.setItem('cuba_visita', 'true');
        }
        const { count, error } = await supabaseClient.from('page_views').select('*', { count: 'exact', head: true });
        if (error) throw error;
        countElement.textContent = count.toLocaleString('es-ES');
    } catch (e) { countElement.textContent = "N/A"; }
}
window.addEventListener('DOMContentLoaded', gestionarVisitas);

// --- 3. FONDO 3D REACTIVO ---
window.addEventListener('load', () => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setSize(innerWidth, innerHeight);
        document.getElementById('canvas-container').appendChild(renderer.domElement);
        
        const geo = new THREE.BufferGeometry(), pos = new Float32Array(2000 * 3);
        for (let i = 0; i < pos.length; i++) pos[i] = (Math.random() - 0.5) * 25;
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        
        const mat = new THREE.PointsMaterial({ size: 0.04, color: 0xff8c00, transparent: true, opacity: 0.6 });
        const mesh = new THREE.Points(geo, mat); scene.add(mesh); camera.position.z = 5;
        
        let mx = 0, my = 0; document.addEventListener('mousemove', e => { mx = (e.clientX/innerWidth)-0.5; my = (e.clientY/innerHeight)-0.5; });
        
        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate); const t = clock.getElapsedTime();
            mesh.rotation.y = t*0.03 + mx*0.3; mesh.rotation.x = t*0.015 + my*0.3;
            renderer.render(scene, camera);
        }
        animate();
        
        // Cambiar color de partículas según sección (usando data-bgcolor)
        gsap.utils.toArray('.scroll-section').forEach(sec => {
            ScrollTrigger.create({
                trigger: sec, start: "top 50%", end: "bottom 50%",
                onEnter: () => {
                    const colorHex = sec.getAttribute('data-bgcolor');
                    if(colorHex) gsap.to(mat.color, { r: parseInt(colorHex.slice(1,3),16)/255, g: parseInt(colorHex.slice(3,5),16)/255, b: parseInt(colorHex.slice(5,7),16)/255, duration: 1 });
                }
            });
        });
    }
});

// --- 4. GRÁFICAS Y MÓDULOS INTERACTIVOS ---
gsap.registerPlugin(ScrollTrigger);
document.querySelectorAll('.reveal').forEach(el => { ScrollTrigger.create({ trigger: el, start: "top 85%", onEnter: () => el.classList.add('visible'), once: true }); });

Chart.defaults.color = '#88888c'; Chart.defaults.font.family = 'Space Mono';

function initInteractivity() {
    // PARADOJA (ONEI)
    new Chart(document.getElementById('paradoxChart'), {
        type: 'line',
        data: {
            labels: ['2020', '2021', '2022'],
            datasets: [
                { label: 'Generación Total', data: [19070, 17950, 15732], borderColor: '#3b82f6', borderWidth: 3 },
                { label: 'Generación FV', data: [260.8, 258.4, 241.5], borderColor: '#10b981', borderWidth: 3 },
                { label: 'Potencia Instalada', data: [221.5, 240.0, 263.0], borderColor: '#ef4444', borderDash: [5,5], borderWidth: 3 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } } }
    });

    // CLIMA (NASA) - SLIDER
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const irrData = [3.8, 4.8, 5.8, 6.5, 6.7, 6.2, 6.7, 6.1, 5.6, 4.6, 3.8, 3.3];
    const tempData = [23.2, 24.0, 25.1, 26.3, 27.5, 28.1, 28.4, 28.3, 27.8, 26.8, 25.4, 23.6];
    
    const nasaChart = new Chart(document.getElementById('nasaChart'), {
        type: 'bar',
        data: { labels: months, datasets: [
            { type: 'bar', label: 'Irradiancia', data: irrData, backgroundColor: 'rgba(234, 179, 8, 0.5)' },
            { type: 'line', label: 'Temperatura', data: tempData, borderColor: '#ec4899', borderWidth: 3, yAxisID: 'y1' }
        ]},
        options: { responsive: true, maintainAspectRatio: false, animation: { duration: 300 }, scales: { y: { position: 'left' }, y1: { position: 'right', grid: { display: false } }, x: { display: false } }, plugins: { legend: { display: false } } }
    });

    const slider = document.getElementById('month-slider');
    slider.addEventListener('input', (e) => {
        const idx = parseInt(e.target.value);
        document.getElementById('month-label').textContent = months[idx];
        document.getElementById('irr-val').textContent = irrData[idx];
        document.getElementById('temp-val-climate').textContent = tempData[idx];
        
        const loss = tempData[idx] > 25 ? Math.round((tempData[idx] - 25) * 3) : 0;
        document.getElementById('eff-loss').textContent = `-${loss}%`;
        
        // Actualizar gráfico resaltando el mes
        nasaChart.data.datasets[0].backgroundColor = months.map((_, i) => i === idx ? '#eab308' : 'rgba(234, 179, 8, 0.1)');
        nasaChart.update();
    });

    // MAPA OSINT
    const osintData = [
        { n: "Solinera El Girasol", t: "Villa Clara", kWp: 30, src: "CiberCuba" },
        { n: "Solinera Vedado", t: "La Habana", kWp: 20, src: "Trabajadores" },
        { n: "Instituto Finlay", t: "La Habana", kWp: 300, src: "pv magazine" },
        { n: "Parque EXPOCUBA", t: "La Habana", kWp: 1000, src: "Cubadebate" }
    ];
    const grid = document.getElementById('osint-grid');
    if(grid) {
        for(let i=0; i<32; i++) { // Simulamos 32 nodos
            const node = document.createElement('div');
            node.className = 'osint-node';
            node.addEventListener('mouseenter', () => {
                const data = osintData[i % osintData.length];
                document.getElementById('osint-info').innerHTML = `<strong>${data.n}</strong> (${data.t})<br>Potencia: ${data.kWp} kWp | Fuente: ${data.src}`;
                node.style.background = 'var(--accent-cyan)';
            });
            node.addEventListener('mouseleave', () => { node.style.background = 'rgba(255,255,255,0.05)'; });
            grid.appendChild(node);
        }
    }

    // SIMULADOR
    const kwpSlider = document.getElementById('sim-kwp');
    const batSlider = document.getElementById('sim-bat');
    
    const updateSim = () => {
        const kwp = parseFloat(kwpSlider.value);
        const bat = parseInt(batSlider.value);
        document.getElementById('sim-kwp-text').textContent = `${kwp} kWp`;
        document.getElementById('sim-bat-text').textContent = `${bat} kWh`;
        
        const panelGen = kwp * 4; // Aprox 4 horas sol pico
        const needed = 12; // 12 horas de apagón
        const energyNeeded = 5; // Nevera + luces básicas

        let status = document.getElementById('sim-status');
        let desc = document.getElementById('sim-desc');

        if (bat >= 5 && kwp >= 2) {
            status.textContent = "SISTEMA RESILIENTE";
            status.style.color = "var(--accent-cyan)";
            desc.textContent = "Tienes suficiente generación y almacenamiento para pasar la noche sin perder alimentos.";
        } else {
            status.textContent = "SISTEMA INSUFICIENTE";
            status.style.color = "var(--accent-danger)";
            desc.textContent = bat < 5 ? "Las baterías son muy pequeñas. La nevera se apagará." : "Los paneles son muy débiles para recargar las baterías.";
        }
    };
    kwpSlider.addEventListener('input', updateSim);
    batSlider.addEventListener('input', updateSim);
    updateSim();
}

window.addEventListener('load', () => setTimeout(initInteractivity, 500));
