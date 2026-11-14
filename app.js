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
// 2. HUD VATIOS Y AUDIO LOFI
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
            logInteraction('interaccion_profunda');
        }
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
            if (!audioCtx) { playLofi(); isPlaying = true; musicBtn.classList.add('playing'); addWatts(5); logInteraction('audio_on'); } 
            else if (isPlaying) { audioCtx.suspend(); isPlaying = false; musicBtn.classList.remove('playing'); } 
            else { audioCtx.resume(); isPlaying = true; musicBtn.classList.add('playing'); } 
        } catch(e) {}
    }); 
}

// ==========================================================================
// 3. CONTADOR VISITAS
// ==========================================================================
async function gestionarVisitas() {
    const countElement = document.getElementById('view-count');
    if (!countElement) return;
    try {
        if (!localStorage.getItem('cuba_visita')) { 
            if (supabaseClient) await supabaseClient.from('page_views').insert([{}]); 
            localStorage.setItem('cuba_visita', 'true'); 
        }
        if (supabaseClient) {
            const { count, error } = await supabaseClient.from('page_views').select('*', { count: 'exact', head: true });
            if (!error && count !== null) countElement.textContent = count.toLocaleString('es-ES');
            else countElement.textContent = "32";
        } else { countElement.textContent = "32"; }
    } catch (e) { countElement.textContent = "32"; }
}

// ==========================================================================
// 4. INICIALIZACIÓN Y GRÁFICAS (DATOS REALES DEL INFORME)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    gestionarVisitas();

    // --- 3D Background ---
    try {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && typeof THREE !== 'undefined') {
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
    } catch(e) { }

    // --- Gráficas ---
    setTimeout(() => {
        if (typeof Chart === 'undefined') return;

        // 1. Gráfica Paradoja (ONEI)
        const ctxPara = document.getElementById('paradoxChart');
        if(ctxPara) {
            new Chart(ctxPara, {
                type: 'line',
                data: {
                    labels: ['2020', '2021', '2022'],
                    datasets: [
                        { label: 'Generación Total (GWh)', data: [19070.9, 17965.5, 15732.1], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderWidth: 3, fill: true, tension: 0.4 },
                        { label: 'Generación FV (GWh)', data: [260.8, 265.0, 241.5], borderColor: '#10b981', borderWidth: 3, tension: 0.4 },
                        { label: 'Potencia Instalada (MW)', data: [221.5, 241.8, 263.0], borderColor: '#ef4444', borderDash: [5,5], borderWidth: 3, tension: 0.4 }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false, onClick: () => { addWatts(10); logInteraction('click_paradoja'); } }
            });
        }

        // 2. Gráfica Clima (NASA) - DATOS REALES
        const ctxNasa = document.getElementById('nasaChart');
        let nasaChart;
        if(ctxNasa) {
            const labelsMeses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
            const dataIrradiancia = [3.55, 4.75, 5.60, 6.76, 7.21, 5.72, 6.84, 5.90, 5.74, 4.19, 3.94, 3.49]; // Año 2024
            const dataTemperatura = [23.49, 21.70, 25.55, 25.77, 29.46, 28.08, 28.29, 28.63, 28.39, 26.71, 24.75, 23.12];
            
            let currentIndex = 6; // Julio por defecto

            nasaChart = new Chart(ctxNasa, {
                type: 'bar',
                data: { 
                    labels: labelsMeses, 
                    datasets: [
                        { type: 'bar', label: 'Irradiancia', data: dataIrradiancia, backgroundColor: dataIrradiancia.map((_, i) => i === currentIndex ? '#eab308' : 'rgba(234, 179, 8, 0.3)'), borderColor: '#eab308', borderWidth: 1 },
                        { type: 'line', label: 'Temp', data: dataTemperatura, borderColor: '#ec4899', borderWidth: 3, yAxisID: 'y1', tension: 0.4 }
                    ]
                },
                options: { 
                    responsive: true, maintainAspectRatio: false,
                    onClick: () => { addWatts(5); logInteraction('click_clima'); },
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: '#888', font: { family: 'Space Mono', size: 10 } } },
                        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' }, title: { display: true, text: 'kWh/m²', color: '#eab308' } },
                        y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#888' }, title: { display: true, text: '°C', color: '#ec4899' } }
                    }
                }
            });

            const slider = document.getElementById('month-slider');
            const lossText = document.getElementById('loss-percent'); 
            const irrEl = document.getElementById('irradiancia-val');
            const tempEl = document.getElementById('temp-val');
            const monthNameEl = document.getElementById('month-name');
            const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

            if(slider) {
                slider.addEventListener('input', (e) => {
                    const mesIndex = parseInt(e.target.value);
                    addWatts(2);
                    nasaChart.data.datasets[0].backgroundColor = dataIrradiancia.map((_, i) => i === mesIndex ? '#eab308' : 'rgba(234, 179, 8, 0.3)');
                    
                    if(irrEl) irrEl.textContent = dataIrradiancia[mesIndex].toFixed(1);
                    if(tempEl) tempEl.textContent = dataTemperatura[mesIndex].toFixed(1);
                    if(monthNameEl) monthNameEl.textContent = nombresMeses[mesIndex];
                    
                    let perdida = 0;
                    if (dataTemperatura[mesIndex] > 25) perdida = -((dataTemperatura[mesIndex] - 25) * 1.5).toFixed(0);
                    if(lossText) lossText.textContent = `${perdida}%`;

                    nasaChart.update();
                });
            }
        }

        // 3. Gráfica Sectores (NUEVA - Del informe)
        const ctxSector = document.getElementById('sectorChart');
        if (ctxSector) {
            new Chart(ctxSector, {
                type: 'bar',
                data: {
                    labels: ['Residencias (Primarias)', 'Locales (Web)', 'Solineras (Web)'],
                    datasets: [{
                        label: 'Potencia Mediana (kWp)',
                        data: [2.0, 4.5, 40.0],
                        backgroundColor: ['#10b981', '#ef4444', '#a855f7'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, title: { display: true, text: 'kWp' } }, x: { grid: { display: false } } }
                }
            });
        }

        // 4. Gráfica Motivaciones (NUEVA - Del informe)
        const ctxMotive = document.getElementById('motivationChart');
        if (ctxMotive) {
            new Chart(ctxMotive, {
                type: 'bar',
                data: {
                    labels: ['Cortes de Energía (Supervivencia)', 'Ahorro Económico', 'Conciencia Ambiental'],
                    datasets: [{
                        label: 'Menciones (N=32)',
                        data: [32, 5, 2],
                        backgroundColor: ['#ef4444', '#3b82f6', '#10b981'],
                        borderWidth: 0
                    }]
                },
                options: {
                    indexAxis: 'y', // Esto la hace horizontal
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { x: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, title: { display: true, text: 'Votos' } }, y: { grid: { display: false } } }
                }
            });
        }

        // 5. Holograma OSINT
        try {
            const holo = document.getElementById('hologram-container');
            const info = document.getElementById('osint-info');
            if(holo) {
                for(let i=0; i<20; i++) {
                    const node = document.createElement('div');
                    node.className = 'holo-node';
                    node.style.left = `${Math.random() * 85 + 5}%`; 
                    node.style.top = `${Math.random() * 85 + 5}%`;
                    node.addEventListener('mouseenter', () => { if(info) info.innerHTML = `DATO ENCONTRADO (64 registros)`; addWatts(5); });
                    holo.appendChild(node);
                }
            }
        } catch(e) {}

        // 6. Typewriter Testimonios
        try {
            const textEl = document.getElementById('typewriter-text');
            let tIndex = 0, cIndex = 0, isDeleting = false;
            const texts = ["“No lo compré por ecología. Para que no se dañe la carne.”", "“El sol es lo único gratis.”", "“Invertí todos mis ahorros en baterías para la noche.”"];
            function typeWriter() {
                if(!textEl) return;
                const currentText = texts[tIndex];
                if (isDeleting) { textEl.textContent = currentText.substring(0, cIndex - 1); cIndex--; } 
                else { textEl.textContent = currentText.substring(0, cIndex + 1); cIndex++; }
                let speed = isDeleting ? 30 : 50;
                if (!isDeleting && cIndex === currentText.length) { speed = 2000; isDeleting = true; } 
                else if (isDeleting && cIndex === 0) { isDeleting = false; tIndex = (tIndex + 1) % texts.length; speed = 500; }
                setTimeout(typeWriter, speed);
            }
            typeWriter();
        } catch(e) {}
    }, 1000); 
});

// ==========================================================================
// 5. TERMINAL Y APAGÓN (CORREGIDOS)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const termInput = document.getElementById('terminal-input');
    const termOutput = document.getElementById('terminal-output');
    
    if (termOutput) termOutput.innerHTML = "SISTEMA v2.0\nEscribe 'help' para comandos.\n\n";
    
    if (termInput) {
        // Enfocar la terminal al hacer clic
        const terminalContainer = document.querySelector('.terminal-container');
        if (terminalContainer) {
            terminalContainer.addEventListener('click', () => termInput.focus());
        }

        termInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const cmd = this.value.trim().toLowerCase();
                this.value = '';
                
                // Imprimir comando
                termOutput.innerHTML += `<div style="margin-top: 5px;">root@cuba-solar:~# ${cmd}</div>`;
                
                // Lógica de comandos
                if (cmd === 'clear') { 
                    termOutput.innerHTML = ''; 
                } 
                else if (cmd === 'help') { 
                    termOutput.innerHTML += `<div style="color: #00ff00;">Comandos: help, status, desclasificar, clear</div>`; 
                }
                else if (cmd === 'status') { 
                    termOutput.innerHTML += `<div style="color: #fbbf24;">[!] Servidores estatales bloqueados. Usando red OSINT.</div>`; 
                    addWatts(5);
                } 
                else if (cmd === 'desclasificar') { 
                    termOutput.innerHTML += `<div style="color: #f87171;">[!] ACCESO DENEGADO POR EL ESTADO. Pivotando a datos primarios (N=32)...</div>`; 
                    addWatts(10);
                    logInteraction('terminal_desclasificar');
                } 
                else if (cmd !== '') {
                    termOutput.innerHTML += `<div style="color: #ef4444;">Comando no reconocido: ${cmd}</div>`;
                }

                // Auto-scroll
                if (terminalContainer) terminalContainer.scrollTop = terminalContainer.scrollHeight;
            }
        });
    }

    const blackoutBtn = document.getElementById('blackout-btn');
    const blackoutOverlay = document.getElementById('blackout-overlay');
    const powerSwitch = document.getElementById('power-switch');

    if (blackoutBtn) {
        blackoutBtn.addEventListener('click', () => {
            if(blackoutOverlay) blackoutOverlay.classList.remove('hidden');
            if (isPlaying && audioCtx) { audioCtx.suspend(); if(musicBtn) musicBtn.classList.remove('playing'); isPlaying = false; }
            addWatts(10);
            logInteraction('apagon');
        });
    }
    if (powerSwitch) {
        powerSwitch.addEventListener('click', () => {
            if(blackoutOverlay) blackoutOverlay.classList.add('hidden');
            if (audioCtx && !isPlaying) { audioCtx.resume(); if(musicBtn) musicBtn.classList.add('playing'); isPlaying = true; }
            logInteraction('apagon_restaurado');
        });
    }
});
