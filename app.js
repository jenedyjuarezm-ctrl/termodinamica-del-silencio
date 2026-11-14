// ==========================================================================
// 1. CONFIGURACIÓN BÁSICA
// ==========================================================================
const SUPABASE_URL = 'https://jntyotrddlrzccoauram.supabase.co';
const SUPABASE_KEY = 'sb_publishable_H8uhN5DbCWLslwo4uJlDuw_jdAjE67K';
let supabaseClient;
try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch(e) { console.warn("Supabase no cargó."); }

// ==========================================================================
// 2. HUD VATIOS (Aislado para no romper nada)
// ==========================================================================
let currentWatts = 0;
function addWatts(amount) {
    try {
        currentWatts += amount;
        if (currentWatts > 100) currentWatts = 100;
        const countEl = document.getElementById('watts-count');
        const fillEl = document.getElementById('watts-fill');
        if (countEl) countEl.textContent = currentWatts;
        if (fillEl) fillEl.style.width = `${currentWatts}%`;
        
        if (currentWatts >= 50 && !localStorage.getItem('interaccion_profunda') && supabaseClient) {
            localStorage.setItem('interaccion_profunda', 'true'); 
            supabaseClient.from('interactions').insert([{}]);
        }
    } catch(e) {}
}

// ==========================================================================
// 3. AUDIO LOFI
// ==========================================================================
const musicBtn = document.getElementById('music-toggle');
let audioCtx, isPlaying = false;
function playLofi() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const filter = audioCtx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 800; filter.connect(audioCtx.destination);
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00];
    const loop = () => {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = 'triangle'; osc.frequency.setValueAtTime(scale[Math.floor(Math.random()*5)], now);
        gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.03, now + 0.05); gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
        osc.connect(gain); gain.connect(filter); osc.start(now); osc.stop(now + 2);
    };
    loop(); setInterval(loop, 1500);
}
if (musicBtn) { 
    musicBtn.addEventListener('click', () => { 
        if (!audioCtx) { playLofi(); isPlaying = true; musicBtn.classList.add('playing'); addWatts(5); } 
        else if (isPlaying) { audioCtx.suspend(); isPlaying = false; musicBtn.classList.remove('playing'); } 
        else { audioCtx.resume(); isPlaying = true; musicBtn.classList.add('playing'); } 
    }); 
}

// ==========================================================================
// 4. CONTADOR VISITAS
// ==========================================================================
async function gestionarVisitas() {
    const countElement = document.getElementById('view-count');
    if (!countElement || !supabaseClient) return;
    try {
        if (!localStorage.getItem('cuba_visita')) { await supabaseClient.from('page_views').insert([{}]); localStorage.setItem('cuba_visita', 'true'); }
        const { count, error } = await supabaseClient.from('page_views').select('*', { count: 'exact', head: true });
        if (error) throw error;
        countElement.textContent = count.toLocaleString('es-ES');
    } catch (e) { countElement.textContent = "32"; }
}
window.addEventListener('DOMContentLoaded', gestionarVisitas);

// ==========================================================================
// 5. FONDO 3D
// ==========================================================================
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
        function animate() { requestAnimationFrame(animate); const t = clock.getElapsedTime(); mesh.rotation.y = t*0.03 + mx*0.3; mesh.rotation.x = t*0.015 + my*0.3; renderer.render(scene, camera); }
        animate();
    }
});

// ==========================================================================
// 6. GRÁFICAS (Código original que SÍ funcionaba)
// ==========================================================================
gsap.registerPlugin(ScrollTrigger);
Chart.defaults.color = '#88888c'; 
Chart.defaults.font.family = 'Space Mono';
Chart.defaults.font.size = 10;

function initVisuals() {
    // A. Paradoja (ONEI)
    const ctxPara = document.getElementById('paradoxChart');
    if(ctxPara) {
        const gradientBlue = ctxPara.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradientBlue.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
        gradientBlue.addColorStop(1, 'rgba(59, 130, 246, 0)');

        new Chart(ctxPara, {
            type: 'line',
            data: {
                labels: ['2020', '2021', '2022'],
                datasets: [
                    { label: 'Generación Total', data: [19070, 17950, 15732], borderColor: '#3b82f6', backgroundColor: gradientBlue, borderWidth: 3, pointRadius: 6, pointBackgroundColor: '#fff', fill: true, tension: 0.4 },
                    { label: 'Generación FV', data: [260.8, 258.4, 241.5], borderColor: '#10b981', borderWidth: 3, pointRadius: 4, borderDash: [2, 2], tension: 0.4 },
                    { label: 'Potencia Instalada', data: [221.5, 240.0, 263.0], borderColor: '#ef4444', borderWidth: 3, pointRadius: 4, tension: 0.4 }
                ]
            },
            options: { 
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true, color: '#ccc' } } },
                scales: { y: { grid: { color: 'rgba(255,255,255,0.05)', borderDash: [5,5] }, ticks: { color: '#888' } }, x: { grid: { display: false }, ticks: { color: '#888' } } },
                animation: { duration: 2000, easing: 'easeOutQuart' },
                onClick: () => addWatts(10)
            }
        });
    }

    // B. Clima (NASA)
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const irrData = [3.8, 4.8, 5.8, 6.5, 6.7, 6.2, 6.7, 6.1, 5.6, 4.6, 3.8, 3.3];
    const tempData = [23.2, 24.0, 25.1, 26.3, 27.5, 28.1, 28.4, 28.3, 27.8, 26.8, 25.4, 23.6];
    
    const nasaChart = new Chart(document.getElementById('nasaChart'), {
        type: 'bar',
        data: { labels: months, datasets: [
            { type: 'bar', label: 'Irradiancia', data: irrData, backgroundColor: 'rgba(234, 179, 8, 0.4)', borderColor: '#eab308', borderWidth: 1, borderRadius: 4 },
            { type: 'line', label: 'Temperatura', data: tempData, borderColor: '#ec4899', borderWidth: 3, pointRadius: 3, pointBackgroundColor: '#fff', yAxisID: 'y1', tension: 0.4 }
        ]},
        options: { responsive: true, maintainAspectRatio: false, animation: { duration: 1000 }, scales: { y: { position: 'left', grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#eab308' } }, y1: { position: 'right', grid: { display: false }, ticks: { color: '#ec4899' } }, x: { grid: { display: false }, ticks: { color: '#888' } } }, plugins: { legend: { display: false } } }
    });
    
    const slider = document.getElementById('month-slider');
    if(slider) {
        slider.addEventListener('input', (e) => {
            const idx = parseInt(e.target.value);
            document.getElementById('month-label').textContent = months[idx];
            document.getElementById('irr-val').textContent = irrData[idx];
            document.getElementById('temp-val-climate').textContent = tempData[idx];
            const loss = tempData[idx] > 25 ? Math.round((tempData[idx] - 25) * 3) : 0;
            document.getElementById('eff-loss').textContent = `-${loss}%`;
            nasaChart.data.datasets[0].backgroundColor = months.map((_, i) => i === idx ? '#eab308' : 'rgba(234, 179, 8, 0.2)');
            nasaChart.update();
            addWatts(2);
        });
    }

    // C. Holograma OSINT
    const holoContainer = document.getElementById('hologram-container');
    const osintInfo = document.getElementById('osint-info');
    const osintData = [
        { n: "Solinera El Girasol", t: "Villa Clara", kWp: 30, src: "CiberCuba" },
        { n: "Solinera Vedado", t: "La Habana", kWp: 20, src: "Trabajadores" },
        { n: "Instituto Finlay", t: "La Habana", kWp: 300, src: "pv magazine" }
    ];

    if(holoContainer) {
        for(let i=0; i<20; i++) {
            const node = document.createElement('div');
            node.className = 'holo-node';
            node.style.left = `${Math.random() * 85 + 5}%`; 
            node.style.top = `${Math.random() * 85 + 5}%`;
            node.style.animationDelay = `${Math.random() * 2}s`;
            const data = osintData[i % osintData.length];
            node.addEventListener('mouseenter', () => {
                osintInfo.innerHTML = `<span style="color:var(--accent-cyan)">>>:</span> <strong>${data.n}</strong> (${data.src})`;
                addWatts(5);
            });
            holoContainer.appendChild(node);
        }
    }

    // D. Simulador
    const kwpSlider = document.getElementById('sim-kwp');
    const batSlider = document.getElementById('sim-bat');
    if(kwpSlider && batSlider) {
        const updateSim = () => {
            const kwp = parseFloat(kwpSlider.value);
            const bat = parseInt(batSlider.value);
            document.getElementById('sim-kwp-text').textContent = `${kwp} kWp`;
            document.getElementById('sim-bat-text').textContent = `${bat} kWh`;
            let status = document.getElementById('sim-status');
            let desc = document.getElementById('sim-desc');
            if (bat >= 5 && kwp >= 2) {
                status.textContent = "SISTEMA RESILIENTE"; status.style.color = "var(--accent-cyan)";
                desc.textContent = "Suficiente generación para pasar la noche.";
            } else {
                status.textContent = "SISTEMA INSUFICIENTE"; status.style.color = "var(--accent-danger)";
                desc.textContent = bat < 5 ? "Baterías pequeñas." : "Paneles débiles.";
            }
            addWatts(2);
        };
        kwpSlider.addEventListener('input', updateSim); batSlider.addEventListener('input', updateSim); updateSim();
    }

    // E. Typewriter
    const testimonials = ["“Lo compré para que no se dañe la carne.”", "“El sol es lo único gratis.”"];
    const textEl = document.getElementById('typewriter-text');
    let tIndex = 0, cIndex = 0, isDeleting = false;
    function typeWriter() {
        if(!textEl) return;
        const currentText = testimonials[tIndex];
        if (isDeleting) { textEl.textContent = currentText.substring(0, cIndex - 1); cIndex--; } 
        else { textEl.textContent = currentText.substring(0, cIndex + 1); cIndex++; }
        let typeSpeed = isDeleting ? 30 : 50;
        if (!isDeleting && cIndex === currentText.length) { typeSpeed = 3000; isDeleting = true; } 
        else if (isDeleting && cIndex === 0) { isDeleting = false; tIndex = (tIndex + 1) % testimonials.length; typeSpeed = 500; }
        setTimeout(typeWriter, typeSpeed);
    }
    ScrollTrigger.create({ trigger: "#testimonios-section", start: "top 80%", onEnter: () => { if(cIndex === 0 && !isDeleting) typeWriter(); }, once: true });
}

window.addEventListener('load', () => setTimeout(initVisuals, 500));

// ==========================================================================
// 7. TERMINAL
// ==========================================================================
const termInput = document.getElementById('terminal-input');
const termOutput = document.getElementById('terminal-output');
if (termOutput) termOutput.innerHTML = "SISTEMA v2.0\nEscribe 'help'.\n\n";
const commands = {
    help: "status, desclasificar, clear",
    status: "ALERTA: Apagones de 12h.",
    desclasificar: "ACCESO CONCEDIDO. 64 registros.",
    clear: "CLEAR"
};
if (termInput) {
    termInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const cmd = this.value.trim().toLowerCase();
            this.value = '';
            termOutput.innerHTML += `<div>root@cuba:~# ${cmd}</div>`;
            if (cmd === 'clear') { termOutput.innerHTML = ''; } 
            else if (commands[cmd]) { termOutput.innerHTML += `<div>${commands[cmd]}</div><br>`; addWatts(5); } 
            document.querySelector('.terminal-container').scrollTop = document.querySelector('.terminal-container').scrollHeight;
        }
    });
}

// ==========================================================================
// 8. APAGÓN
// ==========================================================================
const blackoutBtn = document.getElementById('blackout-btn');
const blackoutOverlay = document.getElementById('blackout-overlay');
const powerSwitch = document.getElementById('power-switch');

if (blackoutBtn) {
    blackoutBtn.addEventListener('click', () => {
        blackoutOverlay.classList.remove('hidden');
        if (isPlaying && audioCtx) { audioCtx.suspend(); musicBtn.classList.remove('playing'); }
        addWatts(10);
    });
}
if (powerSwitch) {
    powerSwitch.addEventListener('click', () => {
        blackoutOverlay.classList.add('hidden');
        if (audioCtx && !isPlaying) { audioCtx.resume(); musicBtn.classList.add('playing'); isPlaying = true; }
    });
                     }
