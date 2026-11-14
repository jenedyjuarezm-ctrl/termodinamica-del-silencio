const SUPABASE_URL = 'https://jntyotrddlrzccoauram.supabase.co';
const SUPABASE_KEY = 'sb_publishable_H8uhN5DbCWLslwo4uJlDuw_jdAjE67K';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 1. LÓGICA DE VATIOS DE INFORMACIÓN (HUD) ---
let currentWatts = 0;
const wattsCount = document.getElementById('watts-count');
const wattsFill = document.getElementById('watts-fill');

function addWatts(amount) {
    currentWatts += amount;
    if (currentWatts > 100) currentWatts = 100;
    if(wattsCount) wattsCount.textContent = currentWatts;
    if(wattsFill) wattsFill.style.width = `${currentWatts}%`;

    // Desbloquear GitHub si llega a 100
    if (currentWatts >= 100) {
        const repo = document.getElementById('locked-repo');
        repo.classList.add('unlocked');
        document.getElementById('repo-title').textContent = "ACCESO CONCEDIDO";
        document.getElementById('repo-desc').textContent = "Has restaurado toda la información. Explora el pipeline de ingeniería detrás de este sitio.";
        document.getElementById('repo-btn').style.display = 'inline-flex';
    }
}

// --- 2. AUDIO LOFI ---
const musicBtn = document.getElementById('music-toggle');
let audioCtx, isPlaying = false;
function playLofi() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const filter = audioCtx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 800; filter.connect(audioCtx.destination);
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00];
    setInterval(() => {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = 'triangle'; osc.frequency.setValueAtTime(scale[Math.floor(Math.random()*5)], now);
        gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.03, now + 0.05); gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
        osc.connect(gain); gain.connect(filter); osc.start(now); osc.stop(now + 2);
    }, 1500);
}
if (musicBtn) { musicBtn.addEventListener('click', () => { if (!audioCtx) { playLofi(); isPlaying = true; musicBtn.classList.add('playing'); addWatts(5); } else if (isPlaying) { audioCtx.suspend(); isPlaying = false; musicBtn.classList.remove('playing'); } else { audioCtx.resume(); isPlaying = true; musicBtn.classList.add('playing'); } }); }

// --- 3. CONTADOR VISITAS ---
async function gestionarVisitas() {
    const countElement = document.getElementById('view-count');
    if (!countElement) return;
    try {
        if (!localStorage.getItem('cuba_visita')) { await supabaseClient.from('page_views').insert([{}]); localStorage.setItem('cuba_visita', 'true'); }
        const { count, error } = await supabaseClient.from('page_views').select('*', { count: 'exact', head: true });
        if (error) throw error;
        countElement.textContent = count.toLocaleString('es-ES');
    } catch (e) { countElement.textContent = "N/A"; }
}
window.addEventListener('DOMContentLoaded', gestionarVisitas);

// --- 4. MODO SUPERVIVENCIA (Bajo Consumo) ---
const survivalBtn = document.getElementById('survival-btn');
if (survivalBtn) {
    survivalBtn.addEventListener('click', () => {
        document.body.classList.toggle('survival-mode');
        if (document.body.classList.contains('survival-mode')) {
            survivalBtn.textContent = "🔋 MODO NORMAL";
            if (isPlaying) { audioCtx.suspend(); musicBtn.classList.remove('playing'); }
        } else {
            survivalBtn.textContent = "🔋 MODO SUPERVIVENCIA";
        }
        addWatts(10);
    });
}

// --- 5. GRÁFICAS CHART.JS ---
gsap.registerPlugin(ScrollTrigger);
Chart.defaults.color = '#88888c'; Chart.defaults.font.family = 'Space Mono'; Chart.defaults.font.size = 10;

function initCharts() {
    // Gráfico del Silencio (La Ausencia)
    const ctxSilence = document.getElementById('silenceChart');
    if (ctxSilence) {
        new Chart(ctxSilence, {
            type: 'bar',
            data: {
                labels: ['Datos Oficiales (Estado)', 'Datos OSINT (Prensa)', 'Datos Primarios (Encuestas)'],
                datasets: [{
                    label: 'Transparencia (%)',
                    data: [10, 100, 100], // El estado solo da 10%
                    backgroundColor: ['rgba(255, 51, 51, 0.2)', 'rgba(0, 229, 255, 0.8)', 'rgba(16, 185, 129, 0.8)'],
                    borderColor: ['#ff3333', '#00e5ff', '#10b981'],
                    borderWidth: 2
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { max: 100, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }, onClick: () => addWatts(10) }
        });
    }

    // Gráfico Paradoja
    const ctxPara = document.getElementById('paradoxChart');
    if (ctxPara) {
        new Chart(ctxPara, {
            type: 'line',
            data: { labels: ['2020', '2021', '2022'], datasets: [
                { label: 'Gen Total', data: [19070, 17950, 15732], borderColor: '#3b82f6', borderWidth: 3, tension: 0.4 },
                { label: 'Gen FV', data: [260.8, 258.4, 241.5], borderColor: '#10b981', borderWidth: 3, tension: 0.4 },
                { label: 'Potencia', data: [221.5, 240.0, 263.0], borderColor: '#ef4444', borderDash: [5,5], borderWidth: 3, tension: 0.4 }
            ]},
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }, onClick: () => addWatts(10) }
        });
    }

    // Gráfico Clima
    const nasaChart = new Chart(document.getElementById('nasaChart'), {
        type: 'bar',
        data: { labels: ['Ene', 'Jun', 'Dic'], datasets: [
            { type: 'bar', label: 'Irradiancia', data: [3.8, 6.2, 3.3], backgroundColor: 'rgba(234, 179, 8, 0.5)' },
            { type: 'line', label: 'Temp', data: [23.2, 28.1, 23.6], borderColor: '#ec4899', borderWidth: 3, yAxisID: 'y1' }
        ]},
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { position: 'left' }, y1: { position: 'right', grid: { display: false } }, x: { display: false } }, plugins: { legend: { display: false } } }
    });

    document.getElementById('month-slider').addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        // Simulamos cambio de datos
        nasaChart.data.datasets[0].data = [3.8, 6.7, 3.3].map(v => v + (Math.random() * 0.5));
        nasaChart.update();
        addWatts(1); // 1 vatio por interacción
    });

    // --- 6. GRAFO OSINT (VIS-NETWORK) ---
    const container = document.getElementById('network-graph');
    if (container) {
        const nodes = new vis.DataSet([
            { id: 1, label: 'Solinera El Girasol', title: 'Villa Clara', color: '#00e5ff' },
            { id: 2, label: 'Solinera Vedado', title: 'La Habana', color: '#00e5ff' },
            { id: 3, label: 'Instituto Finlay', title: 'La Habana', color: '#10b981' },
            { id: 4, label: 'EXPOCUBA', title: 'La Habana', color: '#10b981' },
            { id: 5, label: 'Hospital Calixto', title: 'La Habana', color: '#10b981' }
        ]);
        const edges = new vis.DataSet([
            { from: 1, to: 2, label: 'CiberCuba' },
            { from: 2, to: 3, label: 'pv magazine' },
            { from: 3, to: 4, label: 'Cubadebate' },
            { from: 4, to: 5, label: 'ACN' }
        ]);
        const data = { nodes, edges };
        const options = { 
            nodes: { shape: 'dot', size: 15, font: { color: '#fff', face: 'Space Mono' } },
            edges: { color: 'rgba(255,255,255,0.2)', font: { color: '#888', size: 10 }, smooth: true },
            physics: { stabilization: false, barnesHut: { gravitationalConstant: -2000 } },
            interaction: { hover: true }
        };
        const network = new vis.Network(container, data, options);
        
        network.on("click", function (params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const node = nodes.get(nodeId);
                document.getElementById('osint-info').innerHTML = `<strong>${node.label}</strong> (${node.title}) | Fuente OSINT verificada.`;
                addWatts(5); // 5 vatios por explorar un nodo
            }
        });
    }

    // --- 7. SIMULADOR 2.0 ---
    const checkboxes = document.querySelectorAll('.device-check input');
    const updateSim = () => {
        let totalLoad = 0;
        if(document.getElementById('dev-fridge').checked) totalLoad += 2.0;
        if(document.getElementById('dev-router').checked) totalLoad += 0.5;
        if(document.getElementById('dev-water').checked) totalLoad += 1.0;
        if(document.getElementById('dev-light').checked) totalLoad += 0.2;

        const batCapacity = 5; // 5 kWh
        const hoursNeeded = 12;
        const energyNeeded = totalLoad * hoursNeeded;

        const status = document.getElementById('sim-status');
        const desc = document.getElementById('sim-desc');

        if (energyNeeded > batCapacity) {
            status.textContent = "COLAPSO ENERGÉTICO";
            status.style.color = "var(--accent-danger)";
            desc.textContent = `Necesitas ${energyNeeded.toFixed(1)} kWh, pero solo tienes 5 kWh. Tendrás que apagar la nevera.`;
        } else {
            status.textContent = "SISTEMA ESTABLE";
            status.style.color = "var(--accent-cyan)";
            desc.textContent = `Consumo total: ${energyNeeded.toFixed(1)} kWh. Resistirás las 12 horas.`;
        }
        addWatts(2);
    };
    checkboxes.forEach(cb => cb.addEventListener('change', updateSim));

    // Typewriter
    const textEl = document.getElementById('typewriter-text');
    const testimonials = ["“No lo compré por ecología. Lo compré para que no se dañe la carne.”", "“El panel me costó un año de sueldo, pero tengo ventilador.”", "“12 horas a oscuras. El sol es lo único gratis.”"];
    let tIndex = 0, cIndex = 0, isDeleting = false;
    function typeWriter() {
        if(!textEl) return; const txt = testimonials[tIndex];
        if (isDeleting) { textEl.textContent = txt.substring(0, cIndex - 1); cIndex--; } 
        else { textEl.textContent = txt.substring(0, cIndex + 1); cIndex++; }
        let speed = isDeleting ? 30 : 50;
        if (!isDeleting && cIndex === txt.length) { speed = 3000; isDeleting = true; } 
        else if (isDeleting && cIndex === 0) { isDeleting = false; tIndex = (tIndex + 1) % testimonials.length; speed = 500; }
        setTimeout(typeWriter, speed);
    }
    typeWriter();
}
window.addEventListener('load', () => setTimeout(initCharts, 300));

// --- 8. TERMINAL OSINT ---
const termInput = document.getElementById('terminal-input'), termOutput = document.getElementById('terminal-output');
if (termOutput) termOutput.innerHTML = "SISTEMA v2.0\nEscribe 'help' para empezar.\n\n";
const commands = {
    help: "Comandos:\n- status\n- desclasificar\n- nasa\n- clear",
    status: "ALERTA: Apagones de 12h.",
    desclasificar: "ACCESO CONCEDIDO. 64 registros OSINT recuperados.",
    nasa: "TEMP: 30°C. Irradiación: 6.7 kWh.",
    clear: "CLEAR"
};
if (termInput) {
    termInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const cmd = this.value.trim().toLowerCase(); this.value = '';
            termOutput.innerHTML += `<div>root@cuba-solar:~# ${cmd}</div>`;
            if (cmd === 'clear') { termOutput.innerHTML = ''; } 
            else if (commands[cmd]) { termOutput.innerHTML += `<div>${commands[cmd]}</div><br>`; addWatts(5); } 
            else if (cmd !== '') { termOutput.innerHTML += `<div>Comando no reconocido.</div><br>`; }
            document.querySelector('.terminal-container').scrollTop = document.querySelector('.terminal-container').scrollHeight;
        }
    });
}

// --- 9. APAGÓN ---
const blackoutBtn = document.getElementById('blackout-btn'), blackoutOverlay = document.getElementById('blackout-overlay'), powerSwitch = document.getElementById('power-switch');
if (blackoutBtn) {
    blackoutBtn.addEventListener('click', () => {
        blackoutOverlay.classList.remove('hidden'); blackoutOverlay.classList.add('flicker');
        if (audioCtx) { const osc = audioCtx.createOscillator(); osc.frequency.setValueAtTime(200, audioCtx.currentTime); osc.start(); osc.stop(audioCtx.currentTime + 0.3); }
        setTimeout(() => { blackoutOverlay.classList.remove('flicker'); if (isPlaying) { audioCtx.suspend(); musicBtn.classList.remove('playing'); } }, 1000);
    });
}
if (powerSwitch) {
    powerSwitch.addEventListener('click', () => {
        blackoutOverlay.classList.add('hidden'); 
        if (audioCtx && !isPlaying) { audioCtx.resume(); musicBtn.classList.add('playing'); isPlaying = true; }
        addWatts(5);
    });
            }
