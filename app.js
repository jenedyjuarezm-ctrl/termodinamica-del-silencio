// ==========================================================================
// 1. CONFIGURACIÓN BÁSICA Y SUPABASE
// ==========================================================================
const SUPABASE_URL = 'https://jntyotrddlrzccoauram.supabase.co';
const SUPABASE_KEY = 'sb_publishable_H8uhN5DbCWLslwo4uJlDuw_jdAjE67K';
let supabaseClient = null;
try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch(e) { console.warn("Supabase no cargó."); }

async function logInteraction(type) {
    if (!supabaseClient) return;
    try {
        await supabaseClient.from('interactions').insert([{ event_type: type, created_at: new Date().toISOString() }]);
    } catch (e) { }
}

// ==========================================================================
// 2. HUD VATIOS Y AUDIO
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
    } catch(e) {}
}

const musicBtn = document.getElementById('music-toggle');
let audioCtx, isPlaying = false;
function playLofi() {
    try {
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
    } catch(e) {}
}
if (musicBtn) { 
    musicBtn.addEventListener('click', () => { 
        try {
            if (!audioCtx) { playLofi(); isPlaying = true; musicBtn.classList.add('playing'); addWatts(5); } 
            else if (isPlaying) { audioCtx.suspend(); isPlaying = false; musicBtn.classList.remove('playing'); } 
            else { audioCtx.resume(); isPlaying = true; musicBtn.classList.add('playing'); } 
        } catch(e) {}
    }); 
}

// ==========================================================================
// 3. INICIALIZACIÓN TOTAL
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    
    const countElement = document.getElementById('view-count');
    if (countElement) countElement.textContent = "32";

    // --- 3D BACKGROUND ---
    try {
        if (typeof THREE !== 'undefined') {
            const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setSize(innerWidth, innerHeight);
            const container = document.getElementById('canvas-container');
            if (container) {
                container.appendChild(renderer.domElement);
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
        }
    } catch(e) {}

    // --- GRÁFICAS (Chart.js) ---
    if (typeof Chart !== 'undefined') {
        // 1. Paradoja
        const ctxPara = document.getElementById('paradoxChart');
        if(ctxPara) {
            new Chart(ctxPara, {
                type: 'line',
                data: { labels: ['2020', '2021', '2022'], datasets: [
                    { label: 'Gen Total', data: [19070.9, 17965.5, 15732.1], borderColor: '#3b82f6', borderWidth: 3, tension: 0.4 },
                    { label: 'Gen FV', data: [260.8, 265.0, 241.5], borderColor: '#10b981', borderWidth: 3, tension: 0.4 },
                    { label: 'Potencia', data: [221.5, 241.8, 263.0], borderColor: '#ef4444', borderDash: [5,5], borderWidth: 3, tension: 0.4 }
                ]},
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        // 2. Clima (NASA) y Slider
        const ctxNasa = document.getElementById('nasaChart');
        if(ctxNasa) {
            const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
            const irr = [3.55, 4.75, 5.60, 6.76, 7.21, 5.72, 6.84, 5.90, 5.74, 4.19, 3.94, 3.49]; 
            const temp = [23.49, 21.70, 25.55, 25.77, 29.46, 28.08, 28.29, 28.63, 28.39, 26.71, 24.75, 23.12];
            let index = 6;

            let nasaChart = new Chart(ctxNasa, {
                type: 'bar',
                data: { labels: meses, datasets: [
                    { type: 'bar', label: 'Irradiancia', data: irr, backgroundColor: irr.map((_, i) => i === index ? '#eab308' : 'rgba(234, 179, 8, 0.3)') },
                    { type: 'line', label: 'Temp', data: temp, borderColor: '#ec4899', borderWidth: 3, yAxisID: 'y1', tension: 0.4 }
                ]},
                options: { 
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { title: { display: true, text: 'kWh/m²', color: '#eab308' } },
                        y1: { position: 'right', title: { display: true, text: '°C', color: '#ec4899' }, grid: { drawOnChartArea: false } }
                    }
                }
            });

            const slider = document.getElementById('month-slider');
            if(slider) {
                slider.addEventListener('input', (e) => {
                    const i = parseInt(e.target.value);
                    nasaChart.data.datasets[0].backgroundColor = irr.map((_, idx) => idx === i ? '#eab308' : 'rgba(234, 179, 8, 0.3)');
                    
                    if(document.getElementById('irradiancia-val')) document.getElementById('irradiancia-val').textContent = irr[i].toFixed(1);
                    if(document.getElementById('temp-val')) document.getElementById('temp-val').textContent = temp[i].toFixed(1);
                    if(document.getElementById('month-name')) document.getElementById('month-name').textContent = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][i];
                    
                    let perdida = 0;
                    if (temp[i] > 25) perdida = -((temp[i] - 25) * 1.5).toFixed(0);
                    if(document.getElementById('loss-percent')) document.getElementById('loss-percent').textContent = `${perdida}%`;

                    nasaChart.update();
                    addWatts(2);
                });
            }
        }

        // 3. Sectores
        const ctxSector = document.getElementById('sectorChart');
        if (ctxSector) {
            new Chart(ctxSector, {
                type: 'bar',
                data: { labels: ['Residencias', 'Locales', 'Solineras'], datasets: [{ label: 'Potencia (kWp)', data: [2.0, 4.5, 40.0], backgroundColor: ['#10b981', '#ef4444', '#a855f7'] }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });
        }

        // 4. Motivaciones
        const ctxMotive = document.getElementById('motivationChart');
        if (ctxMotive) {
            new Chart(ctxMotive, {
                type: 'bar',
                data: { labels: ['Supervivencia', 'Ahorro', 'Ambiente'], datasets: [{ label: 'Menciones', data: [32, 5, 2], backgroundColor: ['#ef4444', '#3b82f6', '#10b981'] }] },
                options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });
        }
    }

    // --- CAPA 5: HOLOGRAMA OSINT ---
    const holo = document.getElementById('hologram-container');
    const info = document.getElementById('osint-info');
    if(holo && info) {
        info.innerHTML = "SISTEMA EN ESPERA..."; 
        const datosReales = ["REGISTRO #14: Solinera Cienfuegos", "REGISTRO #32: Mipyme La Habana", "REGISTRO #05: Panel residencial Villa Clara"];
        for(let i=0; i<20; i++) {
            const node = document.createElement('div');
            node.className = 'holo-node';
            node.style.left = `${Math.random() * 85 + 5}%`; 
            node.style.top = `${Math.random() * 85 + 5}%`;
            node.style.cursor = 'pointer';
            const interactuar = (e) => {
                if (e) e.preventDefault();
                info.innerHTML = `<span style="color: #00ff00;">${datosReales[Math.floor(Math.random() * datosReales.length)]}</span>`;
                addWatts(3);
            };
            node.addEventListener('mouseenter', interactuar);
            node.addEventListener('touchstart', interactuar, {passive: false});
            node.addEventListener('click', interactuar);
            holo.appendChild(node);
        }
    }

    // --- CAPA 8: SIMULADOR ---
    const simKwp = document.getElementById('sim-kwp');
    const simBat = document.getElementById('sim-bat');
    const simStatus = document.getElementById('sim-status');
    const simDesc = document.getElementById('sim-desc');

    function actualizarSimulador() {
        if(!simKwp || !simBat || !simStatus || !simDesc) return;
        const kwp = parseFloat(simKwp.value);
        const bat = parseFloat(simBat.value);

        if(document.getElementById('sim-kwp-text')) document.getElementById('sim-kwp-text').textContent = `${kwp.toFixed(1)} kWp`;
        if(document.getElementById('sim-bat-text')) document.getElementById('sim-bat-text').textContent = `${bat} kWh`;

        if (bat < 3) {
            simStatus.textContent = "SISTEMA INSUFICIENTE";
            simStatus.style.color = "var(--accent-danger)";
            simDesc.textContent = "No podrás mantener la nevera encendida durante la noche.";
        } else if (bat >= 3 && bat < 8) {
            simStatus.textContent = "SISTEMA DE RESPALDO BÁSICO";
            simStatus.style.color = "#eab308";
            simDesc.textContent = "Podrás mantener la nevera y luces LED durante un apagón de 12 horas.";
        } else {
            simStatus.textContent = "SISTEMA RESILIENTE";
            simStatus.style.color = "#10b981";
            simDesc.textContent = "Independencia energética total. Podrás mantener nevera, luces y ventilación.";
        }
    }

    if(simKwp) simKwp.addEventListener('input', actualizarSimulador);
    if(simBat) simBat.addEventListener('input', actualizarSimulador);
    actualizarSimulador();

    // --- CAPA 9: TERMINAL ---
    const termInput = document.getElementById('terminal-input');
    const termOutput = document.getElementById('terminal-output');
    if(termOutput) termOutput.innerHTML = "SISTEMA v2.0\nEscribe 'help' para ver comandos.\n\n";

    if(termInput && termOutput) {
        const termContainer = document.querySelector('.terminal-container');
        if(termContainer) termContainer.addEventListener('click', () => termInput.focus());

        termInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.keyCode === 13) {
                e.preventDefault();
                const cmd = this.value.trim().toLowerCase();
                this.value = '';
                termOutput.innerHTML += `<div style="margin-top: 5px;">root@cuba-solar:~# ${cmd}</div>`;
                
                if (cmd === 'clear') { 
                    termOutput.innerHTML = ''; 
                } else if (cmd === 'help') { 
                    termOutput.innerHTML += `<div style="color: #00ff00;">Comandos: help, status, desclasificar, clear</div>`; 
                } else if (cmd === 'status') { 
                    termOutput.innerHTML += `<div style="color: #fbbf24;">[!] Sesgo de no respuesta estatal (90%).<br>[!] Usando datos primarios (N=32).</div>`; 
                } else if (cmd === 'desclasificar') { 
                    termOutput.innerHTML += `<div style="color: #f87171;">[!] ACCESO DENEGADO.<br>[OK] 32 registros cargados.</div>`; 
                } else if (cmd !== '') {
                    termOutput.innerHTML += `<div style="color: #ef4444;">Comando no reconocido.</div>`;
                }
                if (termContainer) termContainer.scrollTop = termContainer.scrollHeight;
            }
        });
    }

    // --- APAGÓN ---
    const blackoutBtn = document.getElementById('blackout-btn');
    const blackoutOverlay = document.getElementById('blackout-overlay');
    const powerSwitch = document.getElementById('power-switch');

    if (blackoutBtn) {
        blackoutBtn.addEventListener('click', () => {
            if(blackoutOverlay) blackoutOverlay.classList.remove('hidden');
            if (isPlaying && audioCtx) { audioCtx.suspend(); if(musicBtn) musicBtn.classList.remove('playing'); isPlaying = false; }
        });
    }
    if (powerSwitch) {
        powerSwitch.addEventListener('click', () => {
            if(blackoutOverlay) blackoutOverlay.classList.add('hidden');
            if (audioCtx && !isPlaying) { audioCtx.resume(); if(musicBtn) musicBtn.classList.add('playing'); isPlaying = true; }
        });
    }

    // --- TYPEWRITER ---
    const textEl = document.getElementById('typewriter-text');
    if(textEl) {
        let tIndex = 0, cIndex = 0, isDeleting = false;
        const texts = ["“No lo compré por ecología. Para que no se dañe la carne.”", "“El sol es lo único gratis.”"];
        function typeWriter() {
            const currentText = texts[tIndex];
            if (isDeleting) { textEl.textContent = currentText.substring(0, cIndex - 1); cIndex--; } 
            else { textEl.textContent = currentText.substring(0, cIndex + 1); cIndex++; }
            let speed = isDeleting ? 30 : 50;
            if (!isDeleting && cIndex === currentText.length) { speed = 2000; isDeleting = true; } 
            else if (isDeleting && cIndex === 0) { isDeleting = false; tIndex = (tIndex + 1) % texts.length; speed = 500; }
            setTimeout(typeWriter, speed);
        }
        typeWriter();
    }
});
