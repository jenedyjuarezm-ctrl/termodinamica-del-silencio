const SUPABASE_URL = 'https://jntyotrddlrzccoauram.supabase.co';
const SUPABASE_KEY = 'sb_publishable_H8uhN5DbCWLslwo4uJlDuw_jdAjE67K';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 1. LÓGICA DE VATIOS ---
let currentWatts = 0;
const wattsCount = document.getElementById('watts-count');
const wattsFill = document.getElementById('watts-fill');
function addWatts(amount) {
    currentWatts += amount;
    if (currentWatts > 100) currentWatts = 100;
    if(wattsCount) wattsCount.textContent = currentWatts;
    if(wattsFill) wattsFill.style.width = `${currentWatts}%`;
    if (currentWatts >= 100) {
        const repo = document.getElementById('locked-repo');
        if(repo) {
            repo.classList.add('unlocked');
            document.getElementById('repo-title').textContent = "ACCESO CONCEDIDO";
            document.getElementById('repo-desc').textContent = "Has restaurado toda la información. Explora el pipeline de ingeniería.";
            document.getElementById('repo-btn').style.display = 'inline-flex';
        }
    }
}

// --- 2. AUDIO ---
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

// --- 3. VISITAS ---
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

// --- 4. TELEMETRÍA ---
let lastFrameTime = performance.now();
setInterval(() => {
    const pingEl = document.getElementById('tele-ping');
    const nodesEl = document.getElementById('tele-nodes');
    const fpsEl = document.getElementById('tele-fps');
    if(pingEl) pingEl.textContent = `${Math.floor(Math.random() * 20) + 12}ms`;
    if(nodesEl) { let nodes = parseInt(nodesEl.textContent) || 0; nodes = (nodes + Math.floor(Math.random() * 3) + 1) % 96; nodesEl.textContent = `${nodes}/96`; }
    const now = performance.now();
    if(fpsEl) fpsEl.textContent = Math.round(1000 / (now - lastFrameTime)) > 60 ? 60 : Math.round(1000 / (now - lastFrameTime));
    lastFrameTime = now;
}, 1000);

// --- 5. SUPERVIVENCIA Y 3D ---
const survivalBtn = document.getElementById('survival-btn');
if (survivalBtn) { survivalBtn.addEventListener('click', () => { document.body.classList.toggle('survival-mode'); survivalBtn.textContent = document.body.classList.contains('survival-mode') ? "🔋 MODO NORMAL" : "🔋 MODO SUPERVIVENCIA"; addWatts(10); }); }

window.addEventListener('load', () => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && !document.body.classList.contains('survival-mode')) {
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

// --- 6. GRÁFICAS Y VIS NETWORK ---
gsap.registerPlugin(ScrollTrigger);
Chart.defaults.color = '#88888c'; Chart.defaults.font.family = 'Space Mono'; Chart.defaults.font.size = 10;

function initVisuals() {
    // Gráfico Silencio
    const ctxSilence = document.getElementById('silenceChart');
    if (ctxSilence) {
        new Chart(ctxSilence, {
            type: 'bar',
            data: { labels: ['Datos Oficiales', 'Datos OSINT', 'Datos Primarios'], datasets: [{ label: 'Transparencia (%)', data: [10, 100, 100], backgroundColor: ['rgba(255, 51, 51, 0.2)', 'rgba(0, 229, 255, 0.8)', 'rgba(16, 185, 129, 0.8)'], borderColor: ['#ff3333', '#00e5ff', '#10b981'], borderWidth: 2 }] },
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
    const ctxNasa = document.getElementById('nasaChart');
    let nasaChart;
    if (ctxNasa) {
        nasaChart = new Chart(ctxNasa, {
            type: 'bar',
            data: { labels: ['Ene', 'Jun', 'Dic'], datasets: [
                { type: 'bar', label: 'Irradiancia', data: [3.8, 6.2, 3.3], backgroundColor: 'rgba(234, 179, 8, 0.5)' },
                { type: 'line', label: 'Temp', data: [23.2, 28.1, 23.6], borderColor: '#ec4899', borderWidth: 3, yAxisID: 'y1' }
            ]},
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { position: 'left' }, y1: { position: 'right', grid: { display: false } }, x: { display: false } }, plugins: { legend: { display: false } } }
        });
    }
    const slider = document.getElementById('month-slider');
    if(slider) {
        slider.addEventListener('input', (e) => {
            if(nasaChart) { nasaChart.data.datasets[0].data = [3.8, 6.7, 3.3].map(v => v + (Math.random() * 0.5)); nasaChart.update(); }
            addWatts(1);
        });
    }

    // Grafo OSINT
    const container = document.getElementById('network-graph');
    if (container && typeof vis !== 'undefined') {
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
        const options = { nodes: { shape: 'dot', size: 15, font: { color: '#fff', face: 'Space Mono' } }, edges: { color: 'rgba(255,255,255,0.2)', font: { color: '#888', size: 10 }, smooth: true }, physics: { stabilization: false }, interaction: { hover: true } };
        const network = new vis.Network(container, { nodes, edges }, options);
        network.on("click", function (params) {
            if (params.nodes.length > 0) {
                const node = nodes.get(params.nodes[0]);
                document.getElementById('osint-info').innerHTML = `<strong>${node.label}</strong> (${node.title}) | Fuente OSINT verificada.`;
                addWatts(5);
            }
        });
    }

    // Simulador
    const checkboxes = document.querySelectorAll('.device-check input');
    const updateSim = () => {
        let totalLoad = 0;
        if(document.getElementById('dev-fridge')?.checked) totalLoad += 2.0;
        if(document.getElementById('dev-router')?.checked) totalLoad += 0.5;
        if(document.getElementById('dev-water')?.checked) totalLoad += 1.0;
        if(document.getElementById('dev-light')?.checked) totalLoad += 0.2;
        const energyNeeded = totalLoad * 12;
        const status = document.getElementById('sim-status'), desc = document.getElementById('sim-desc');
        if(status && desc) {
            if (energyNeeded > 5) { status.textContent = "COLAPSO ENERGÉTICO"; status.style.color = "var(--accent-danger)"; desc.textContent = `Necesitas ${energyNeeded.toFixed(1)} kWh, pero solo tienes 5 kWh.`; }
            else { status.textContent = "SISTEMA ESTABLE"; status.style.color = "var(--accent-cyan)"; desc.textContent = `Consumo: ${energyNeeded.toFixed(1)} kWh. Resistirás las 12 horas.`; }
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
window.addEventListener('load', () => setTimeout(initVisuals, 300));

// --- 7. NLP (Análisis de Sentimiento) ---
const palabrasPositivas = ['bien', 'bueno', 'sol', 'esperanza', 'gracias', 'excelente', 'increíble', 'ayuda', 'futuro', 'luz', 'solución', 'resiliencia', 'orgullo'];
const palabrasNegativas = ['mal', 'apagón', 'triste', 'crisis', 'robo', 'pésimo', 'enfermo', 'comida', 'calor', 'mentira', 'problema', 'difícil', 'caos'];
function analizarSentimiento() {
    const texto = document.getElementById('comment-message').value.toLowerCase();
    const badge = document.getElementById('sentiment-badge');
    if(!badge) return;
    let positivos = 0, negativos = 0;
    palabrasPositivas.forEach(p => { if (texto.includes(p)) positivos++; });
    palabrasNegativas.forEach(p => { if (texto.includes(p)) negativos++; });
    if (texto.length < 3) { badge.textContent = "Analizando..."; badge.className = "sentiment-badge neutral"; return; }
    if (positivos > negativos) { badge.textContent = "Positivo ☀️"; badge.className = "sentiment-badge positive"; }
    else if (negativos > positivos) { badge.textContent = "Negativo ⚠️"; badge.className = "sentiment-badge negative"; }
    else { badge.textContent = "Neutral 📊"; badge.className = "sentiment-badge neutral"; }
}
window.analizarSentimiento = analizarSentimiento;

// --- 8. COMENTARIOS (SUPABASE) ---
const commentForm = document.getElementById('comment-form');
const commentsList = document.getElementById('comments-list');
async function loadComments() {
    if (!commentsList) return;
    try {
        const { data: comments, error } = await supabaseClient.from('comments').select('*').order('created_at', { ascending: false }).limit(20);
        if (error) throw error;
        if (comments.length === 0) { commentsList.innerHTML = '<p style="text-align:center; color: var(--text-muted); font-size: 0.9rem;">Sé el primero en reportar.</p>'; return; }
        commentsList.innerHTML = '';
        comments.forEach(c => {
            const date = new Date(c.created_at);
            const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            const div = document.createElement('div');
            div.className = 'comment-item';
            div.innerHTML = `<div class="comment-header"><span class="comment-name">> ${c.name}</span><span class="comment-time">${timeStr}</span></div><div class="comment-text">${c.message}</div>`;
            commentsList.appendChild(div);
        });
    } catch (error) { commentsList.innerHTML = '<p style="text-align:center; color: #ff3333; font-size: 0.9rem;">Error de conexión.</p>'; }
}
if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-submit-comment');
        const name = document.getElementById('comment-name').value.trim();
        const message = document.getElementById('comment-message').value.trim();
        if (!name || !message) return;
        btn.textContent = "Transmitiendo..."; btn.disabled = true;
        try {
            const { error } = await supabaseClient.from('comments').insert([{ name, message }]);
            if (error) throw error;
            document.getElementById('comment-name').value = ''; document.getElementById('comment-message').value = '';
            addWatts(15); await loadComments();
        } catch (error) { alert("Error al transmitir."); } 
        finally { btn.textContent = "Transmitir Mensaje 📡"; btn.disabled = false; }
    });
}
supabaseClient.channel('comments-channel').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, () => { loadComments(); }).subscribe();
window.addEventListener('load', () => { setTimeout(loadComments, 1000); });

// --- 9. TERMINAL ---
const termInput = document.getElementById('terminal-input'), termOutput = document.getElementById('terminal-output');
if (termOutput) termOutput.innerHTML = "SISTEMA v2.0\nEscribe 'help' para empezar.\n\n";
const commands = { help: "Comandos:\n- status\n- desclasificar\n- nasa\n- clear", status: "ALERTA: Apagones de 12h.", desclasificar: "ACCESO CONCEDIDO. 64 registros OSINT.", nasa: "TEMP: 30°C. Irradiación: 6.7 kWh.", clear: "CLEAR" };
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

// --- 10. APAGÓN ---
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

// --- 11. EXPLORADOR DE DATOS ---
const rawData = [
    { id: 1, source: 'ONEI', var: 'Generación Total 2022', val: '15,732 GW·h' },
    { id: 2, source: 'ONEI', var: 'Potencia Instalada FV', val: '263.0 MW' },
    { id: 3, source: 'NASA', var: 'Irradiancia Máxima', val: '6.7 kWh/m²' },
    { id: 4, source: 'NASA', var: 'Temperatura Promedio', val: '28.4 °C' },
    { id: 5, source: 'OSINT', var: 'Solinera El Girasol', val: '30 kWp' },
    { id: 6, source: 'OSINT', var: 'Parque EXPOCUBA', val: '1000 kWp' },
    { id: 7, source: 'Encuesta', var: 'Motivo: Supervivencia', val: '32 menciones' },
    { id: 8, source: 'Encuesta', var: 'Motivo: Ecología', val: '2 menciones' }
];
function renderTable(filter = 'all') {
    const tbody = document.getElementById('data-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    const filtered = filter === 'all' ? rawData : rawData.filter(d => d.source === filter);
    filtered.forEach(row => {
        tbody.innerHTML += `<tr><td style="color: var(--accent-cyan);">#${row.id.toString().padStart(3, '0')}</td><td>${row.source}</td><td>${row.var}</td><td><strong>${row.val}</strong></td></tr>`;
    });
}
const filterSelect = document.getElementById('filter-source');
if (filterSelect) { filterSelect.addEventListener('change', (e) => renderTable(e.target.value)); renderTable(); }
