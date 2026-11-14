// ==========================================================================
// 1. CONFIGURACIÓN BÁSICA
// ==========================================================================
const SUPABASE_URL = 'https://jntyotrddlrzccoauram.supabase.co';
const SUPABASE_KEY = 'sb_publishable_H8uhN5DbCWLslwo4uJlDuw_jdAjE67K';
let supabaseClient = null;
try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch(e) { console.warn("Supabase no cargó."); }

// ==========================================================================
// 2. HUD VATIOS
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
            supabaseClient.from('interactions').insert([{}]).catch(() => {});
        }
    } catch(e) {}
}

// ==========================================================================
// 3. AUDIO LOFI
// ==========================================================================
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
// 4. CONTADOR VISITAS
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
        } else {
            countElement.textContent = "32";
        }
    } catch (e) { countElement.textContent = "32"; }
}

// ==========================================================================
// 5. INICIALIZACIÓN A PRUEBA DE BALAS
// ==========================================================================
window.addEventListener('load', () => {
    // 1. Iniciar Contador
    gestionarVisitas();

    // 2. Iniciar 3D
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
    } catch(e) { console.warn("3D falló."); }

    // 3. Iniciar Gráficas y Textos (Damos 1.5 segundos para red lenta)
    setTimeout(() => {
        // A. Gráfica Paradoja
        try {
            if (typeof Chart !== 'undefined') {
                const ctxPara = document.getElementById('paradoxChart');
                if(ctxPara) {
                    new Chart(ctxPara, {
                        type: 'line',
                        data: {
                            labels: ['2020', '2021', '2022'],
                            datasets: [
                                { label: 'Generación Total', data: [19070, 17950, 15732], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderWidth: 3, fill: true, tension: 0.4 },
                                { label: 'Generación FV', data: [260.8, 258.4, 241.5], borderColor: '#10b981', borderWidth: 3, tension: 0.4 },
                                { label: 'Potencia Instalada', data: [221.5, 240.0, 263.0], borderColor: '#ef4444', borderDash: [5,5], borderWidth: 3, tension: 0.4 }
                            ]
                        },
                        options: { responsive: true, maintainAspectRatio: false, onClick: () => addWatts(10) }
                    });
                }

                // B. Gráfica Clima
                const ctxNasa = document.getElementById('nasaChart');
                let nasaChart;
                if(ctxNasa) {
                    nasaChart = new Chart(ctxNasa, {
                        type: 'bar',
                        data: { labels: ['Ene','Jun','Dic'], datasets: [
                            { type: 'bar', label: 'Irradiancia', data: [3.8, 6.2, 3.3], backgroundColor: '#eab308' },
                            { type: 'line', label: 'Temp', data: [23.2, 28.1, 23.6], borderColor: '#ec4899', borderWidth: 3, yAxisID: 'y1' }
                        ]},
                        options: { responsive: true, maintainAspectRatio: false }
                    });
                }
                const slider = document.getElementById('month-slider');
                if(slider && nasaChart) {
                    slider.addEventListener('input', () => { addWatts(2); nasaChart.update(); });
                }
            }
        } catch(e) { console.error("Error gráficas:", e); }

        // C. Holograma
        try {
            const holo = document.getElementById('hologram-container');
            const info = document.getElementById('osint-info');
            if(holo) {
                for(let i=0; i<20; i++) {
                    const node = document.createElement('div');
                    node.className = 'holo-node';
                    node.style.left = `${Math.random() * 85 + 5}%`; 
                    node.style.top = `${Math.random() * 85 + 5}%`;
                    node.addEventListener('mouseenter', () => { if(info) info.innerHTML = `DATO ENCONTRADO`; addWatts(5); });
                    holo.appendChild(node);
                }
            }
        } catch(e) {}

        // D. Typewriter
        try {
            const textEl = document.getElementById('typewriter-text');
            let tIndex = 0, cIndex = 0, isDeleting = false;
            const texts = ["“No lo compré por ecología. Para que no se dañe la carne.”", "“El sol es lo único gratis.”"];
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
    }, 1500); // Espera de 1.5s para que cargue Chart.js
});

// ==========================================================================
// 6. TERMINAL Y APAGÓN
// ==========================================================================
try {
    const termInput = document.getElementById('terminal-input');
    const termOutput = document.getElementById('terminal-output');
    if (termOutput) termOutput.innerHTML = "SISTEMA v2.0\nEscribe 'help'.\n\n";
    if (termInput) {
        termInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const cmd = this.value.trim().toLowerCase();
                this.value = '';
                termOutput.innerHTML += `<div>root@cuba:~# ${cmd}</div>`;
                if (cmd === 'clear') { termOutput.innerHTML = ''; } 
                else if (cmd === 'help' || cmd === 'status' || cmd === 'desclasificar') { 
                    termOutput.innerHTML += `<div>Comando ejecutado. 64 registros encontrados.</div><br>`; 
                    addWatts(5); 
                } 
                document.querySelector('.terminal-container').scrollTop = document.querySelector('.terminal-container').scrollHeight;
            }
        });
    }

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
} catch(e) {}
