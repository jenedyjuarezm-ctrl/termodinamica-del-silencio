// CONFIGURACIÓN
const SUPABASE_URL = 'https://jntyotrddlrzccoauram.supabase.co';
const SUPABASE_KEY = 'sb_publishable_H8uhN5DbCWLslwo4uJlDuw_jdAjE67K';
let supabaseClient = null;
try { if (typeof supabase !== 'undefined') supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch(e) {}

async function logInteraction(type) {
    if (!supabaseClient) return;
    try { await supabaseClient.from('interactions').insert([{ event_type: type, created_at: new Date().toISOString() }]); } catch(e) {}
}

// VATIOS Y AUDIO
let currentWatts = 0;
function addWatts(amount) {
    try {
        currentWatts += amount; if (currentWatts > 100) currentWatts = 100;
        const countEl = document.getElementById('watts-count'), fillEl = document.getElementById('watts-fill');
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
        setInterval(() => {
            const now = audioCtx.currentTime, osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
            osc.type = 'triangle'; osc.frequency.setValueAtTime([261.63,293.66,329.63,392,440][Math.floor(Math.random()*5)], now);
            gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.03, now + 0.05); gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
            osc.connect(gain); gain.connect(filter); osc.start(now); osc.stop(now + 2);
        }, 1500);
    } catch(e) {}
}
if (musicBtn) musicBtn.addEventListener('click', () => {
    try {
        if (!audioCtx) { playLofi(); isPlaying = true; musicBtn.classList.add('playing'); addWatts(5); }
        else if (isPlaying) { audioCtx.suspend(); isPlaying = false; musicBtn.classList.remove('playing'); }
        else { audioCtx.resume(); isPlaying = true; musicBtn.classList.add('playing'); }
    } catch(e) {}
});

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    const countElement = document.getElementById('view-count');
    if (countElement) countElement.textContent = "32";

    // 3D
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
                const mesh = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.04, color: 0xff8c00, transparent: true, opacity: 0.6 }));
                scene.add(mesh); camera.position.z = 5;
                const animate = () => { requestAnimationFrame(animate); mesh.rotation.y += 0.001; renderer.render(scene, camera); }; animate();
            }
        }
    } catch(e) {}

    // GRÁFICAS
    if (typeof Chart !== 'undefined') {
        const ctxPara = document.getElementById('paradoxChart');
        if(ctxPara) new Chart(ctxPara, { type: 'line', data: { labels: ['2020', '2021', '2022'], datasets: [{ label: 'Gen Total', data: [19070.9, 17965.5, 15732.1], borderColor: '#3b82f6', borderWidth: 3 }, { label: 'Gen FV', data: [260.8, 265.0, 241.5], borderColor: '#10b981', borderWidth: 3 }, { label: 'Potencia', data: [221.5, 241.8, 263.0], borderColor: '#ef4444', borderWidth: 3 }] }, options: { responsive: true, maintainAspectRatio: false } });

        const ctxNasa = document.getElementById('nasaChart');
        if(ctxNasa) {
            const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'], irr = [3.55, 4.75, 5.60, 6.76, 7.21, 5.72, 6.84, 5.90, 5.74, 4.19, 3.94, 3.49], temp = [23.49, 21.70, 25.55, 25.77, 29.46, 28.08, 28.29, 28.63, 28.39, 26.71, 24.75, 23.12];
            let nasaChart = new Chart(ctxNasa, { type: 'bar', data: { labels: meses, datasets: [{ type: 'bar', label: 'Irradiancia', data: irr, backgroundColor: irr.map((_, i) => i === 6 ? '#eab308' : 'rgba(234, 179, 8, 0.3)') }, { type: 'line', label: 'Temp', data: temp, borderColor: '#ec4899', borderWidth: 3, yAxisID: 'y1' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { title: { display: true, text: 'kWh/m²', color: '#eab308' } }, y1: { position: 'right', title: { display: true, text: '°C', color: '#ec4899' }, grid: { drawOnChartArea: false } } } } });
            const slider = document.getElementById('month-slider');
            if(slider) slider.addEventListener('input', (e) => {
                const i = parseInt(e.target.value);
                nasaChart.data.datasets[0].backgroundColor = irr.map((_, idx) => idx === i ? '#eab308' : 'rgba(234, 179, 8, 0.3)');
                if(document.getElementById('irradiancia-val')) document.getElementById('irradiancia-val').textContent = irr[i].toFixed(1);
                if(document.getElementById('temp-val')) document.getElementById('temp-val').textContent = temp[i].toFixed(1);
                if(document.getElementById('month-name')) document.getElementById('month-name').textContent = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][i];
                let p = temp[i] > 25 ? -((temp[i] - 25) * 1.5).toFixed(0) : 0;
                if(document.getElementById('loss-percent')) document.getElementById('loss-percent').textContent = `${p}%`;
                nasaChart.update('none'); addWatts(2);
            });
        }

        const ctxSector = document.getElementById('sectorChart');
        if (ctxSector) new Chart(ctxSector, { type: 'bar', data: { labels: ['Residencias', 'Locales', 'Solineras'], datasets: [{ label: 'kWp', data: [2.0, 4.5, 40.0], backgroundColor: ['#10b981', '#ef4444', '#a855f7'] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });

        const ctxMotive = document.getElementById('motivationChart');
        if (ctxMotive) new Chart(ctxMotive, { type: 'bar', data: { labels: ['Supervivencia', 'Ahorro', 'Ambiental'], datasets: [{ label: 'N=32', data: [32, 5, 2], backgroundColor: ['#ef4444', '#3b82f6', '#10b981'] }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
    }

    // OSINT
    const holo = document.getElementById('hologram-container'), info = document.getElementById('osint-info');
    if(holo && info) {
        info.innerHTML = "SISTEMA EN ESPERA... Toca un nodo.";
        const records = [
            ["El Girasol","Holguín","https://www.trabajadores.cu/"],["Virginia","Santa Clara","https://www.granma.cu/"],["El Rampeño","Vedado","https://www.acn.cu/"],["Solinera Cerro","Cerro","https://oncubanews.com/"],["Playa Mégano","Playa","https://www.efe.com/"],["Leos Sandino","Pinar del Río","https://okdiario.com/"],["Alemanes Express","Santa Clara","https://www.cibercuba.com/"],["Ciro Redondo","Ciego de Ávila","https://www.cibercuba.com/"],["Maisí","Guantánamo","https://www.cibercuba.com/"],["Imías","Guantánamo","https://www.cibercuba.com/"],["San Justo","Guantánamo","https://www.cibercuba.com/"],["Crombet","Guantánamo","https://www.cibercuba.com/"],["Guantánamo Cap","Guantánamo","https://www.cibercuba.com/"],["Villa Clara 1","Santa Clara","https://www.cibercuba.com/"],["Villa Clara 2","Camajuaní","https://www.cibercuba.com/"],["Villa Clara 3","Sagua","https://www.cibercuba.com/"],["Villa Clara 4","Placetas","https://www.cibercuba.com/"],["Villa Clara 5","Manicaragua","https://www.cibercuba.com/"],["Villa Clara 6","Ranchuelo","https://www.cibercuba.com/"],["Villa Clara 7","Remedios","https://www.cibercuba.com/"],["Villa Clara 8","Caibarién","https://www.cibercuba.com/"],["Villa Clara 9","Quemado","https://www.cibercuba.com/"],["Villa Clara 10","Encrucijada","https://www.cibercuba.com/"],["Villa Clara 11","Santo Domingo","https://www.cibercuba.com/"],["Villa Clara 12","Cifuentes","https://www.cibercuba.com/"],["Villa Clara 13","Santa Clara","https://www.cibercuba.com/"],["Holguín 2","Holguín","https://www.trabajadores.cu/"],["Holguín 3","Banes","https://www.trabajadores.cu/"],["Holguín 4","Antilla","https://www.trabajadores.cu/"],["Holguín 5","Mayarí","https://www.trabajadores.cu/"],["Holguín 6","Moa","https://www.trabajadores.cu/"],["Holguín 7","Gibara","https://www.trabajadores.cu/"],
            ["ELAM","La Habana","https://www.pv-magazine-latam.com/"],["Aguas Habana","La Habana","https://www.acn.cu/"],["Cubaenergia","La Habana","https://www.pv-magazine-latam.com/"],["Ktech Energy","La Habana","https://ktechsolar.com/"],["RENOVA Trifásico","La Habana","https://renova.cu/"],["RENOVA Playa","Playa","https://renova.cu/"],["Estación 5ta Avenida","Guanabo","https://www.granma.cu/"],["Etecsa","Pinar del Río","https://www.trabajadores.cu/"],["Vo Thi Thang","Playa","https://vietnam.vn/"],["Vietnam Heroico","La Habana","https://vietnam.vn/"],["Le Van Tam","La Habana","https://vietnam.vn/"],["Nguyen Van Troi","Cerro","https://vietnam.vn/"],["Politécnico HCM","La Habana","https://vietnam.vn/"],["Finlay","La Habana","https://www.pv-magazine-latam.com/"],["Hosp Pediátrico","La Habana","https://www.pv-magazine-latam.com/"],["Bluesafe","La Habana","https://bluesafe.biz/"],["Cujae","Cotorro","https://www.mindus.gob.cu/"],["Parque Cujae","Cotorro","https://www.pv-magazine-latam.com/"],["UNAH","Mayabeque","https://www.acn.cu/"],["Policlínico Portuondo","Marianao","https://www.radiometropolitana.icrt.cu/"],["Mipyme Jolyni","La Habana","https://www.efe.com/"],["Cesáreo Fernández","Playa","https://vietnam.vn/"],["Nguyen Van Troi 10 Oct","10 de Octubre","https://vietnam.vn/"],["RENOVA Híbrido","La Habana","https://renova.cu/"],["RENOVA Marquesina","La Habana","https://renova.cu/"],["RENOVA Off-Grid","La Habana","https://renova.cu/"],["EXPOCUBA","Boyeros","https://www.cubadebate.cu/"],["Parque Naranjito","Boyeros","https://www.cubahora.cu/"],["Parque Guanabo","Habana Este","https://www.radioreloj.cu/"],["RENOVA 60kW","La Habana","https://renova.cu/"],["Ktech 36kW","La Habana","https://ktechsolar.com/"],["Estación Vía Blanca","Vía Blanca","https://www.granma.cu/"]
        ];
        for(let i=0; i<40; i++) {
            const node = document.createElement('div'); node.className = 'holo-node';
            node.style.left = `${Math.random() * 85 + 5}%`; node.style.top = `${Math.random() * 85 + 5}%`; node.style.cursor = 'pointer';
            const interactuar = (e) => {
                if (e) e.preventDefault();
                const r = records[Math.floor(Math.random() * records.length)];
                info.innerHTML = `<div style="text-align: left; padding: 5px;"><div style="color: #00ff00; font-weight: bold;">⚡ ${r[0]}</div><div style="color: #aaa; font-size: 0.85em; margin-bottom: 8px;">📍 ${r[1]}</div><a href="${r[2]}" target="_blank" style="color: #00bfff; text-decoration: none; border-bottom: 1px dashed #00bfff; font-size: 0.85em;">[ 🔗 VERIFICAR FUENTE ]</a></div>`;
                addWatts(3);
            };
            node.addEventListener('mouseenter', interactuar); node.addEventListener('touchstart', interactuar, {passive: false}); node.addEventListener('click', interactuar);
            holo.appendChild(node);
        }
    }

    // SIMULADOR
    const simK = document.getElementById('sim-kwp'), simB = document.getElementById('sim-bat'), simS = document.getElementById('sim-status'), simD = document.getElementById('sim-desc');
    function updateSim() {
        if(!simK || !simB || !simS || !simD) return;
        const k = parseFloat(simK.value), b = parseFloat(simB.value);
        if(document.getElementById('sim-kwp-text')) document.getElementById('sim-kwp-text').textContent = `${k.toFixed(1)} kWp`;
        if(document.getElementById('sim-bat-text')) document.getElementById('sim-bat-text').textContent = `${b.toFixed(0)} kWh`;
        if (b < 3) { simS.textContent = "SISTEMA INSUFICIENTE"; simS.style.color = "#ef4444"; simD.textContent = "No podrás mantener la nevera encendida durante la noche."; }
        else if (b >= 3 && b < 8) { simS.textContent = "SISTEMA BÁSICO"; simS.style.color = "#eab308"; simD.textContent = "Podrás mantener la nevera y luces LED durante 12 horas."; }
        else { simS.textContent = "SISTEMA RESILIENTE"; simS.style.color = "#10b981"; simD.textContent = "Independencia energética total. Nevera, luces e internet."; }
    }
    if(simK && simB) { simK.addEventListener('input', updateSim); simB.addEventListener('input', updateSim); updateSim(); }

    // TERMINAL
const tIn = document.getElementById('terminal-input');
const tOut = document.getElementById('terminal-output');
if(tOut) tOut.innerHTML = "SISTEMA v2.0\nEscribe 'help' para ver los comandos.\n\n";
if(tIn && tOut) {
    const tCont = document.querySelector('.terminal-container');
    if(tCont) tCont.addEventListener('click', () => tIn.focus());
    tIn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault(); 
            const cmd = this.value.trim().toLowerCase(); 
            this.value = '';
            tOut.innerHTML += '<div style="margin-top: 5px;">root@cuba-solar:~# ' + cmd + '</div>';
            const datosNasa = { ene: { irr: 3.55, temp: 23.49 }, feb: { irr: 4.75, temp: 21.70 }, mar: { irr: 5.60, temp: 25.55 }, abr: { irr: 6.76, temp: 25.77 }, may: { irr: 7.21, temp: 29.46 }, jun: { irr: 5.72, temp: 28.08 }, jul: { irr: 6.84, temp: 28.29 }, ago: { irr: 5.90, temp: 28.63 }, sep: { irr: 5.74, temp: 28.39 }, oct: { irr: 4.19, temp: 26.71 }, nov: { irr: 3.94, temp: 24.75 }, dic: { irr: 3.49, temp: 23.12 } };
            if (cmd === 'clear') { 
                tOut.innerHTML = ''; 
            } else if (cmd === 'help') { 
                tOut.innerHTML += '<div style="color: #00ff00; margin-bottom: 5px;">[ COMANDOS ]</div><div>- help: Lista.</div><div>- status: Sesgo.</div><div>- desclasificar: Datos.</div><div>- clima [mes]: NASA.</div><div>- onei: Paradoja.</div><div>- clear: Limpiar.</div><br>';
            } else if (cmd === 'status') { 
                tOut.innerHTML += '<div style="color: #fbbf24;">[!] Sesgo de no respuesta (90%).<br>[!] Pivotando a N=32 y OSINT N=64.</div><br>'; 
            } else if (cmd === 'desclasificar') { 
                tOut.innerHTML += '<div style="color: #f87171;">[!] ACCESO DENEGADO.<br>[OK] 32 registros primarios cargados.</div><br>'; 
            } else if (cmd === 'onei') {
                tOut.innerHTML += '<div style="color: #3b82f6;">[ PARADOJA ONEI ]</div><div>- Gen Total: -17.5%</div><div>- Potencia FV: +18.7%</div><div>- Gen FV Real: -7.4%</div><br>';
            } else if (cmd.startsWith('clima')) {
    // Limpiamos y separamos las palabras
    const partes = cmd.split(' ').filter(p => p.length > 0);
    let mesInput = partes[1]; // Tomamos lo que escribió el usuario

    // Diccionario para aceptar mes completo o abreviado
    const mesesValidos = {
        'ene': 'ene', 'enero': 'ene', 'feb': 'feb', 'febrero': 'feb',
        'mar': 'mar', 'marzo': 'mar', 'abr': 'abr', 'abril': 'abr',
        'may': 'may', 'mayo': 'may', 'jun': 'jun', 'junio': 'jun',
        'jul': 'jul', 'julio': 'jul', 'ago': 'ago', 'agosto': 'ago',
        'sep': 'sep', 'septiembre': 'sep', 'oct': 'oct', 'octubre': 'oct',
        'nov': 'nov', 'noviembre': 'nov', 'dic': 'dic', 'diciembre': 'dic'
    };

    // Convertimos lo que escribió a la clave corta (ej: "julio" -> "jul")
    const mesClave = mesesValidos[mesInput];

    if (mesClave && datosNasa[mesClave]) {
        const d = datosNasa[mesClave];
        let p = d.temp > 25 ? -((d.temp - 25) * 1.5).toFixed(0) : 0;
        
        tOut.innerHTML += '<div style="color: #eab308;">[ NASA: ' + mesClave.toUpperCase() + ' ]</div>' +
                          '<div>- Irradiancia: ' + d.irr + ' kWh/m²</div>' +
                          '<div>- Temperatura: ' + d.temp + ' °C</div>' +
                          '<div>- Pérdida estimada: <span style="color: #ef4444;">' + p + '%</span></div><br>';
    } else if (!mesInput) {
        tOut.innerHTML += '<div style="color: #ef4444;">[!] Debes indicar un mes. Ejemplo: clima jul</div><br>';
    } else {
        tOut.innerHTML += '<div style="color: #ef4444;">[!] Mes no válido. Usa: ene, feb, mar... o el nombre completo.</div><br>';
    }
            }
    });
}

    // TYPEWRITER Y APAGÓN
    const tEl = document.getElementById('typewriter-text');
    if(tEl) {
        let tI = 0, cI = 0, del = false;
        const texts = ["“No lo compré por ecología. Para que no se dañe la carne.”", "“El sol es lo único gratis.”"];
        const type = () => {
            const cur = texts[tI];
            tEl.textContent = del ? cur.substring(0, cI - 1) : cur.substring(0, cI + 1);
            cI += del ? -1 : 1;
            let sp = del ? 30 : 50;
            if (!del && cI === cur.length) { sp = 2000; del = true; }
            else if (del && cI === 0) { del = false; tI = (tI + 1) % texts.length; sp = 500; }
            setTimeout(type, sp);
        };
        type();
    }

    const bBtn = document.getElementById('blackout-btn'), bOv = document.getElementById('blackout-overlay'), pSw = document.getElementById('power-switch');
    if (bBtn && bOv) bBtn.addEventListener('click', () => { bOv.classList.remove('hidden'); if (isPlaying && audioCtx) { audioCtx.suspend(); if(musicBtn) musicBtn.classList.remove('playing'); isPlaying = false; } });
    if (pSw && bOv) pSw.addEventListener('click', () => { bOv.classList.add('hidden'); if (audioCtx && !isPlaying) { audioCtx.resume(); if(musicBtn) musicBtn.classList.add('playing'); isPlaying = true; } });
});
