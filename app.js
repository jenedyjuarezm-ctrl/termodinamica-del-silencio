const SUPABASE_URL = 'https://jntyotrddlrzccoauram.supabase.co';
const SUPABASE_KEY = 'sb_publishable_H8uhN5DbCWLslwo4uJlDuw_jdAjE67K';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 1. AUDIO LOFI ---
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
if (musicBtn) { musicBtn.addEventListener('click', () => { if (!audioCtx) { playLofi(); isPlaying = true; musicBtn.classList.add('playing'); } else if (isPlaying) { audioCtx.suspend(); isPlaying = false; musicBtn.classList.remove('playing'); } else { audioCtx.resume(); isPlaying = true; musicBtn.classList.add('playing'); } }); }

// --- 2. CONTADOR VISITAS ---
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

// --- 3. FONDO 3D ---
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

// --- 4. VISUALIZACIONES ---
gsap.registerPlugin(ScrollTrigger);
Chart.defaults.color = '#88888c'; Chart.defaults.font.family = 'Space Mono'; Chart.defaults.font.size = 10;

function initVisuals() {
    const ctxPara = document.getElementById('paradoxChart');
    if(ctxPara) {
        new Chart(ctxPara, {
            type: 'line',
            data: {
                labels: ['2020', '2021', '2022'],
                datasets: [
                    { label: 'Generación Total', data: [19070, 17950, 15732], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 3, pointRadius: 6, pointBackgroundColor: '#fff', fill: true, tension: 0.4 },
                    { label: 'Generación FV', data: [260.8, 258.4, 241.5], borderColor: '#10b981', borderWidth: 3, pointRadius: 4, borderDash: [2, 2], tension: 0.4 },
                    { label: 'Potencia Instalada', data: [221.5, 240.0, 263.0], borderColor: '#ef4444', borderWidth: 3, pointRadius: 4, tension: 0.4 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true } } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)', borderDash: [5,5] } }, x: { grid: { display: false } } }, animation: { duration: 2000, easing: 'easeOutQuart' } }
        });
    }

    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const irrData = [3.8, 4.8, 5.8, 6.5, 6.7, 6.2, 6.7, 6.1, 5.6, 4.6, 3.8, 3.3];
    const tempData = [23.2, 24.0, 25.1, 26.3, 27.5, 28.1, 28.4, 28.3, 27.8, 26.8, 25.4, 23.6];
    const nasaChart = new Chart(document.getElementById('nasaChart'), {
        type: 'bar',
        data: { labels: months, datasets: [
            { type: 'bar', label: 'Irradiancia', data: irrData, backgroundColor: 'rgba(234, 179, 8, 0.3)', borderColor: '#eab308', borderWidth: 1 },
            { type: 'line', label: 'Temperatura', data: tempData, borderColor: '#ec4899', borderWidth: 3, pointRadius: 3, yAxisID: 'y1' }
        ]},
        options: { responsive: true, maintainAspectRatio: false, animation: { duration: 300 }, scales: { y: { position: 'left', grid: { color: 'rgba(255,255,255,0.05)' } }, y1: { position: 'right', grid: { display: false } }, x: { display: false } }, plugins: { legend: { display: false } } }
    });
    document.getElementById('month-slider').addEventListener('input', (e) => {
        const idx = parseInt(e.target.value);
        document.getElementById('month-label').textContent = months[idx];
        document.getElementById('irr-val').textContent = irrData[idx];
        document.getElementById('temp-val-climate').textContent = tempData[idx];
        const loss = tempData[idx] > 25 ? Math.round((tempData[idx] - 25) * 3) : 0;
        document.getElementById('eff-loss').textContent = `-${loss}%`;
        nasaChart.data.datasets[0].backgroundColor = months.map((_, i) => i === idx ? '#eab308' : 'rgba(234, 179, 8, 0.1)');
        nasaChart.update();
    });

    const holoContainer = document.getElementById('hologram-container');
    const osintInfo = document.getElementById('osint-info');
    const osintData = [
        { n: "Solinera El Girasol", t: "Villa Clara", kWp: 30, src: "CiberCuba" },
        { n: "Solinera Vedado", t: "La Habana", kWp: 20, src: "Trabajadores" },
        { n: "Instituto Finlay", t: "La Habana", kWp: 300, src: "pv magazine" },
        { n: "Parque EXPOCUBA", t: "La Habana", kWp: 1000, src: "Cubadebate" },
        { n: "Hospital Calixto García", t: "La Habana", kWp: 50, src: "ACN" }
    ];
    if(holoContainer) {
        for(let i=0; i<20; i++) {
            const node = document.createElement('div'); node.className = 'holo-node';
            node.style.left = `${Math.random() * 85 + 5}%`; node.style.top = `${Math.random() * 85 + 5}%`; node.style.animationDelay = `${Math.random() * 2}s`;
            const data = osintData[i % osintData.length];
            node.addEventListener('mouseenter', () => { osintInfo.innerHTML = `<span style="color:var(--accent-cyan)">>> DATO ENCONTRADO:</span> <strong>${data.n}</strong> (${data.t}) | Potencia: ${data.kWp} kWp | Fuente: ${data.src}`; osintInfo.style.borderColor = 'var(--accent-warm)'; });
            node.addEventListener('mouseleave', () => { osintInfo.style.borderColor = 'var(--accent-cyan)'; });
            holoContainer.appendChild(node);
        }
    }

    const kwpSlider = document.getElementById('sim-kwp'), batSlider = document.getElementById('sim-bat');
    const updateSim = () => {
        const kwp = parseFloat(kwpSlider.value), bat = parseInt(batSlider.value);
        document.getElementById('sim-kwp-text').textContent = `${kwp} kWp`; document.getElementById('sim-bat-text').textContent = `${bat} kWh`;
        let status = document.getElementById('sim-status'), desc = document.getElementById('sim-desc');
        if (bat >= 5 && kwp >= 2) { status.textContent = "SISTEMA RESILIENTE"; status.style.color = "var(--accent-cyan)"; desc.textContent = "Suficiente generación para pasar la noche sin perder alimentos."; }
        else { status.textContent = "SISTEMA INSUFICIENTE"; status.style.color = "var(--accent-danger)"; desc.textContent = bat < 5 ? "Las baterías son muy pequeñas. La nevera se apagará." : "Los paneles son débiles para recargar las baterías."; }
    };
    kwpSlider.addEventListener('input', updateSim); batSlider.addEventListener('input', updateSim); updateSim();

    const testimonials = ["“No lo compré por el medio ambiente. Lo compré para que no se me dañe la carne.”", "“El panel me costó más que mi sueldo de un año, pero al menos tengo un ventilador.”", "“El Estado dice que hay energía, pero mi casa pasa 12 horas a oscuras.”"];
    const textEl = document.getElementById('typewriter-text'); let tIndex = 0, cIndex = 0, isDeleting = false;
    function typeWriter() {
        if(!textEl) return; const currentText = testimonials[tIndex];
        if (isDeleting) { textEl.textContent = currentText.substring(0, cIndex - 1); cIndex--; } 
        else { textEl.textContent = currentText.substring(0, cIndex + 1); cIndex++; }
        let typeSpeed = isDeleting ? 30 : 50;
        if (!isDeleting && cIndex === currentText.length) { typeSpeed = 3000; isDeleting = true; } 
        else if (isDeleting && cIndex === 0) { isDeleting = false; tIndex = (tIndex + 1) % testimonials.length; typeSpeed = 500; }
        setTimeout(typeWriter, typeSpeed);
    }
    ScrollTrigger.create({ trigger: "#testimonios-section", start: "top 80%", onEnter: () => { if(cIndex === 0 && !isDeleting) typeWriter(); }, once: true });
}
window.addEventListener('load', () => setTimeout(initVisuals, 300));

// --- 5. TERMINAL ---
const termInput = document.getElementById('terminal-input'), termOutput = document.getElementById('terminal-output');
if (termOutput) termOutput.innerHTML = "SISTEMA OPERATIVO CUBA-SOLAR v2.0\nConexión con NASA establecida.\nEscribe 'help' para comenzar.\n\n";
const commands = {
    help: "Comandos:\n- status: Red eléctrica.\n- desclasificar: Extraer datos.\n- nasa: Datos satelitales.\n- clear: Limpiar.",
    status: "<span class='terminal-error'>ALERTA: Generación nacional al 17.5%. Apagones de 12h activos.</span>",
    desclasificar: "Buscando en MINEM...\n<span class='terminal-success'>ACCESO CONCEDIDO.</span> 64 registros OSINT. Estado niega el 90%. Ciudadanía instala 2.0 kWp/hogar.",
    nasa: "API NASA POWER...\nTemp: 30°C. Irradiancia: 6.7 kWh/m²/día.\n<span class='terminal-success'>Conclusión: Calor extremo reduce eficiencia un 15%.</span>",
    clear: "CLEAR"
};
if (termInput) {
    termInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const cmd = this.value.trim().toLowerCase(); this.value = '';
            termOutput.innerHTML += `<div><span class="prompt">root@cuba-solar:~#</span> ${cmd}</div>`;
            if (cmd === 'clear') { termOutput.innerHTML = ''; } 
            else if (commands[cmd]) { termOutput.innerHTML += `<div>${commands[cmd]}</div><br>`; } 
            else if (cmd !== '') { termOutput.innerHTML += `<div class="terminal-error">Comando no reconocido. Escribe 'help'.</div><br>`; }
            document.querySelector('.terminal-container').scrollTop = document.querySelector('.terminal-container').scrollHeight;
        }
    });
}

// --- 6. APAGÓN (CORREGIDO) ---
const blackoutBtn = document.getElementById('blackout-btn');
const blackoutOverlay = document.getElementById('blackout-overlay');
const powerSwitch = document.getElementById('power-switch');

if (blackoutBtn) {
    blackoutBtn.addEventListener('click', () => {
        // Mostrar la pantalla negra y activar el parpadeo
        blackoutOverlay.classList.remove('hidden'); 
        blackoutOverlay.classList.add('flicker');
        
        // Sonido de error (BEEP)
        if (audioCtx) {
            const osc = audioCtx.createOscillator(); 
            const gain = audioCtx.createGain();
            osc.type = 'square'; 
            osc.frequency.setValueAtTime(200, audioCtx.currentTime); 
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            osc.connect(gain); 
            gain.connect(audioCtx.destination); 
            osc.start(); 
            osc.stop(audioCtx.currentTime + 0.3);
        }

        // Quitar el parpadeo después de 1 segundo para que quede oscuro total
        setTimeout(() => { 
            blackoutOverlay.classList.remove('flicker'); 
            // Apagar música
            if (isPlaying) { 
                audioCtx.suspend(); 
                musicBtn.classList.remove('playing'); 
            } 
        }, 1000);
    });
}

if (powerSwitch) {
    powerSwitch.addEventListener('click', () => {
        // Efecto de encendido (parpadeo rápido)
        blackoutOverlay.style.opacity = '0.5';
        setTimeout(() => { blackoutOverlay.style.opacity = '1'; }, 150);
        setTimeout(() => { blackoutOverlay.style.opacity = '0.3'; }, 300);
        
        // Desaparecer completamente
        setTimeout(() => { 
            blackoutOverlay.classList.add('hidden'); 
            blackoutOverlay.style.opacity = '1'; // Restaurar opacidad por defecto
            
            // Reanudar música si el usuario la tenía activa
            if (audioCtx && !isPlaying) { 
                audioCtx.resume(); 
                musicBtn.classList.add('playing'); 
                isPlaying = true; 
            } 
        }, 500);
    });
}
