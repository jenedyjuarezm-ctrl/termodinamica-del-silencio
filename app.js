const SUPABASE_URL = 'https://jntyotrddlrzccoauram.supabase.co';
const SUPABASE_KEY = 'sb_publishable_H8uhN5DbCWLslwo4uJlDuw_jdAjE67K';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 1. UI Y VATIOS ---
let currentWatts = 0;
function addWatts(amount) {
    currentWatts += amount;
    if (currentWatts > 100) currentWatts = 100;
    const wattsCount = document.getElementById('watts-count');
    const wattsFill = document.getElementById('watts-fill');
    if(wattsCount) wattsCount.textContent = currentWatts;
    if(wattsFill) wattsFill.style.width = `${currentWatts}%`;
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

// --- 3. VISITAS Y TELEMETRÍA ---
async function gestionarVisitas() {
    const countElement = document.getElementById('view-count');
    if (!countElement) return;
    try {
        if (!localStorage.getItem('cuba_visita')) { await supabaseClient.from('page_views').insert([{}]); localStorage.setItem('cuba_visita', 'true'); }
        const { count } = await supabaseClient.from('page_views').select('*', { count: 'exact', head: true });
        countElement.textContent = count.toLocaleString('es-ES');
    } catch (e) { countElement.textContent = "N/A"; }
}
window.addEventListener('DOMContentLoaded', gestionarVisitas);

let lastFrameTime = performance.now();
setInterval(() => {
    const pingEl = document.getElementById('tele-ping'), nodesEl = document.getElementById('tele-nodes'), fpsEl = document.getElementById('tele-fps');
    if(pingEl) pingEl.textContent = `${Math.floor(Math.random() * 20) + 12}ms`;
    if(nodesEl) { let nodes = parseInt(nodesEl.textContent) || 0; nodes = (nodes + Math.floor(Math.random() * 3) + 1) % 96; nodesEl.textContent = `${nodes}/96`; }
    const now = performance.now();
    if(fpsEl) fpsEl.textContent = Math.round(1000 / (now - lastFrameTime)) > 60 ? 60 : Math.round(1000 / (now - lastFrameTime));
    lastFrameTime = now;
}, 1000);

// --- 4. SUPERVIVENCIA Y 3D ---
const survivalBtn = document.getElementById('survival-btn');
if (survivalBtn) { survivalBtn.addEventListener('click', () => { document.body.classList.toggle('survival-mode'); survivalBtn.textContent = document.body.classList.contains('survival-mode') ? "🔋 NORMAL" : "🔋 SUPERVIVENCIA"; addWatts(10); }); }

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

// --- 5. INICIALIZACIÓN DE GRÁFICAS (Asegurada con timeout) ---
window.addEventListener('load', () => {
    setTimeout(() => {
        // Gráfico 1
        const ctx1 = document.getElementById('silenceChart');
        if(ctx1) new Chart(ctx1, { type: 'bar', data: { labels: ['Oficial', 'OSINT', 'Encuestas'], datasets: [{ data: [10, 100, 100], backgroundColor: ['#ff3333', '#00e5ff', '#10b981'] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
        
        // Gráfico 2
        const ctx2 = document.getElementById('paradoxChart');
        if(ctx2) new Chart(ctx2, { type: 'line', data: { labels: ['2020', '2021', '2022'], datasets: [{ label: 'Gen Total', data: [19070, 17950, 15732], borderColor: '#3b82f6', tension: 0.4 }, { label: 'Gen FV', data: [260.8, 258.4, 241.5], borderColor: '#10b981', tension: 0.4 }, { label: 'Potencia', data: [221.5, 240.0, 263.0], borderColor: '#ef4444', borderDash: [5,5], tension: 0.4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } } });

        // Gráfico 3
        const ctx3 = document.getElementById('nasaChart');
        if(ctx3) new Chart(ctx3, { type: 'bar', data: { labels: ['Ene', 'Jun', 'Dic'], datasets: [{ type: 'bar', data: [3.8, 6.2, 3.3], backgroundColor: 'rgba(234,179,8,0.5)' }, { type: 'line', data: [23.2, 28.1, 23.6], borderColor: '#ec4899', borderWidth: 3, yAxisID: 'y1' }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y1: { position: 'right' } }, plugins: { legend: { display: false } } } });

        // Grafo OSINT
        const container = document.getElementById('network-graph');
        if (container && typeof vis !== 'undefined') {
            const nodes = new vis.DataSet([{ id: 1, label: 'Girasol', color: '#00e5ff' }, { id: 2, label: 'Vedado', color: '#00e5ff' }, { id: 3, label: 'Finlay', color: '#10b981' }]);
            const edges = new vis.DataSet([{ from: 1, to: 2 }, { from: 2, to: 3 }]);
            new vis.Network(container, { nodes, edges }, { nodes: { shape: 'dot', size: 15, font: { color: '#fff' } }, edges: { color: 'rgba(255,255,255,0.2)' }, physics: { stabilization: false } });
        }
    }, 500);
});

// --- 6. COMENTARIOS, NLP Y TABLA ---
// (Lógica idéntica a la anterior, está funcionando bien)
const commentForm = document.getElementById('comment-form');
const commentsList = document.getElementById('comments-list');
async function loadComments() {
    if (!commentsList) return;
    try {
        const { data: comments } = await supabaseClient.from('comments').select('*').order('created_at', { ascending: false }).limit(10);
        if (comments.length === 0) { commentsList.innerHTML = '<p style="text-align:center; color: #888; font-size: 0.8rem;">Sé el primero.</p>'; return; }
        commentsList.innerHTML = comments.map(c => `<div class="comment-item"><div class="comment-header"><span class="comment-name">> ${c.name}</span></div><div class="comment-text">${c.message}</div></div>`).join('');
    } catch (e) { commentsList.innerHTML = 'Error de conexión.'; }
}
if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-submit-comment');
        const name = document.getElementById('comment-name').value.trim();
        const message = document.getElementById('comment-message').value.trim();
        btn.textContent = "Transmitiendo...";
        await supabaseClient.from('comments').insert([{ name, message }]);
        document.getElementById('comment-message').value = '';
        addWatts(15); loadComments(); btn.textContent = "Transmitir Mensaje 📡";
    });
}
supabaseClient.channel('comments-channel').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, () => { loadComments(); }).subscribe();
window.addEventListener('load', () => setTimeout(loadComments, 1000));

function analizarSentimiento() {
    const texto = document.getElementById('comment-message').value.toLowerCase();
    const badge = document.getElementById('sentiment-badge');
    if(!badge) return;
    if (texto.includes('sol') || texto.includes('bien') || texto.includes('gracias')) { badge.textContent = "Positivo ☀️"; badge.className = "sentiment-badge positive"; }
    else if (texto.includes('apagón') || texto.includes('mal') || texto.includes('comida')) { badge.textContent = "Negativo ⚠️"; badge.className = "sentiment-badge negative"; }
    else { badge.textContent = "Neutral 📊"; badge.className = "sentiment-badge neutral"; }
}
window.analizarSentimiento = analizarSentimiento;

// Tabla Datos
const rawData = [{ id: 1, source: 'ONEI', var: 'Generación Total', val: '15,732 GW·h' }, { id: 2, source: 'NASA', var: 'Irradiancia', val: '6.7 kWh/m²' }, { id: 3, source: 'OSINT', var: 'Solinera Girasol', val: '30 kWp' }];
function renderTable(filter = 'all') {
    const tbody = document.getElementById('data-table-body');
    if (!tbody) return;
    const filtered = filter === 'all' ? rawData : rawData.filter(d => d.source === filter);
    tbody.innerHTML = filtered.map(r => `<tr><td>#${r.id}</td><td>${r.source}</td><td>${r.var}</td><td><strong>${r.val}</strong></td></tr>`).join('');
}
const filterSelect = document.getElementById('filter-source');
if (filterSelect) { filterSelect.addEventListener('change', (e) => renderTable(e.target.value)); renderTable(); }

// APAGÓN
const blackoutBtn = document.getElementById('blackout-btn'), blackoutOverlay = document.getElementById('blackout-overlay'), powerSwitch = document.getElementById('power-switch');
if (blackoutBtn) blackoutBtn.addEventListener('click', () => { blackoutOverlay.classList.remove('hidden'); setTimeout(() => { if (isPlaying) { audioCtx.suspend(); musicBtn.classList.remove('playing'); } }, 500); });
if (powerSwitch) powerSwitch.addEventListener('click', () => { blackoutOverlay.classList.add('hidden'); if (audioCtx && !isPlaying) { audioCtx.resume(); musicBtn.classList.add('playing'); } });
