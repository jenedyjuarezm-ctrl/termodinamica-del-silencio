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
// 3. INICIALIZACIÓN TOTAL (ESPERA A QUE EL HTML ESTÉ LISTO)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // --- CONTADOR VISITAS ---
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

            // Inicializamos la gráfica
            let nasaChart = new Chart(ctxNasa, {
                type: 'bar',
                data: { 
                    labels: meses, 
                    datasets: [
                        { type: 'bar', label: 'Irradiancia', data: irr, backgroundColor: irr.map((_, i) => i === index ? '#eab308' : 'rgba(234, 179, 8, 0.3)') },
                        { type: 'line', label: 'Temp', data: temp, borderColor: '#ec4899', borderWidth: 3, yAxisID: 'y1', tension: 0.4 }
                    ]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false }, // Permite que el tooltip salte al tocar
                    plugins: { 
                        legend: { display: false },
                        tooltip: {
                            enabled: true,
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            titleColor: '#eab308',
                            bodyColor: '#fff'
                        }
                    },
                    scales: {
                        y: { title: { display: true, text: 'kWh/m²', color: '#eab308' } },
                        y1: { position: 'right', title: { display: true, text: '°C', color: '#ec4899' }, grid: { drawOnChartArea: false } }
                    }
                }
            });

            // Lógica para actualizar los textos y la gráfica
            const actualizarClima = (val) => {
                const i = parseInt(val);
                // 1. Resaltar la barra correspondiente
                nasaChart.data.datasets[0].backgroundColor = irr.map((_, idx) => idx === i ? '#eab308' : 'rgba(234, 179, 8, 0.3)');
                
                // 2. Actualizar textos HTML
                const irrEl = document.getElementById('irradiancia-val');
                const tempEl = document.getElementById('temp-val');
                const monthEl = document.getElementById('month-name');
                const lossEl = document.getElementById('loss-percent');

                if(irrEl) irrEl.textContent = irr[i].toFixed(1);
                if(tempEl) tempEl.textContent = temp[i].toFixed(1);
                if(monthEl) monthEl.textContent = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][i];
                
                let perdida = 0;
                if (temp[i] > 25) perdida = -((temp[i] - 25) * 1.5).toFixed(0);
                if(lossEl) lossEl.textContent = `${perdida}%`;

                // 3. Refrescar gráfica SIN ANIMACIÓN (Para que no se sienta "congelada")
                nasaChart.update('none'); 
                addWatts(2);
            };

            // Escuchamos tanto 'input' como 'change' (crucial para móviles)
            const slider = document.getElementById('month-slider');
            if(slider) {
                slider.addEventListener('input', (e) => actualizarClima(e.target.value));
                slider.addEventListener('change', (e) => actualizarClima(e.target.value));
                
                // Forzamos la actualización inicial al cargar la página
                actualizarClima(slider.value); 
            }
        }
        

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
    }

    // --- CAPA 5: HOLOGRAMA OSINT ---
    const holo = document.getElementById('hologram-container');
    const info = document.getElementById('osint-info');
    if(holo && info) {
        // Texto inicial
        info.innerHTML = "SISTEMA EN ESPERA..."; 
        
        const osintRecords = [
            // --- SOLINERAS (32) ---
            { nombre: "El Girasol", ubicacion: "Holguín", url: "https://www.trabajadores.cu/" },
            { nombre: "Virginia (Gomate)", ubicacion: "Santa Clara", url: "https://www.granma.cu/" },
            { nombre: "El Rampeño (PDL Rampeando)", ubicacion: "Vedado, La Habana", url: "https://www.acn.cu/" },
            { nombre: "Solinera Comunitaria Cerro", ubicacion: "Cerro, La Habana", url: "https://oncubanews.com/" },
            { nombre: "Playa Mégano", ubicacion: "Playa, La Habana", url: "https://www.efe.com/" },
            { nombre: "Leos Sandino", ubicacion: "Sandino, Pinar del Río", url: "https://okdiario.com/" },
            { nombre: "Alemanes Express", ubicacion: "José Martí, Santa Clara", url: "https://www.cibercuba.com/" },
            { nombre: "Ciro Redondo", ubicacion: "Ciego de Ávila", url: "https://www.cibercuba.com/" },
            { nombre: "Solinera Comunitaria Maisí", ubicacion: "Maisí, Guantánamo", url: "https://www.cibercuba.com/" },
            { nombre: "Solinera Comunitaria Imías", ubicacion: "Imías, Guantánamo", url: "https://www.cibercuba.com/" },
            { nombre: "Solinera Comunitaria San Justo", ubicacion: "Guantánamo", url: "https://www.cibercuba.com/" },
            { nombre: "Solinera Comunitaria Crombet", ubicacion: "Guantánamo", url: "https://www.cibercuba.com/" },
            { nombre: "Solinera Comunitaria Guantánamo", ubicacion: "Guantánamo Capital", url: "https://www.cibercuba.com/" },
            { nombre: "Solinera Villa Clara 1", ubicacion: "Santa Clara", url: "https://www.cibercuba.com/" },
            { nombre: "Solinera Villa Clara 2", ubicacion: "Camajuaní", url: "https://www.cibercuba.com/" },
            { nombre: "Solinera Villa Clara 3", ubicacion: "Sagua la Grande", url: "https://www.cibercuba.com/" },
            { nombre: "Solinera Villa Clara 4", ubicacion: "Placetas", url: "https://www.cibercuba.com/" },
            { nombre: "Solinera Villa Clara 5", ubicacion: "Manicaragua", url: "https://www.cibercuba.com/" },
            { nombre: "Solinera Villa Clara 6", ubicacion: "Ranchuelo", url: "https://www.cibercuba.com/" },
            { nombre: "Solinera Villa Clara 7", ubicacion: "Remedios", url: "https://www.cibercuba.com/" },
            { nombre: "Solinera Villa Clara 8", ubicacion: "Caibarién", url: "https://www.cibercuba.com/" },
            { nombre: "Solinera Villa Clara 9", ubicacion: "Quemado de Güines", url: "https://www.cibercuba.com/" },
            { nombre: "Solinera Villa Clara 10", ubicacion: "Encrucijada", url: "https://www.cibercuba.com/" },
            { nombre: "Solinera Villa Clara 11", ubicacion: "Santo Domingo", url: "https://www.cibercuba.com/" },
            { nombre: "Solinera Villa Clara 12", ubicacion: "Cifuentes", url: "https://www.cibercuba.com/" },
            { nombre: "Solinera Villa Clara 13", ubicacion: "Santa Clara (Centro)", url: "https://www.cibercuba.com/" },
            { nombre: "Solinera Holguín 2", ubicacion: "Holguín (Capital)", url: "https://www.trabajadores.cu/" },
            { nombre: "Solinera Holguín 3", ubicacion: "Banes", url: "https://www.trabajadores.cu/" },
            { nombre: "Solinera Holguín 4", ubicacion: "Antilla", url: "https://www.trabajadores.cu/" },
            { nombre: "Solinera Holguín 5", ubicacion: "Mayarí", url: "https://www.trabajadores.cu/" },
            { nombre: "Solinera Holguín 6", ubicacion: "Moa", url: "https://www.trabajadores.cu/" },
            { nombre: "Solinera Holguín 7", ubicacion: "Gibara", url: "https://www.trabajadores.cu/" },

            // --- INSTITUCIONES (32) ---
            { nombre: "Escuela Latinoamericana de Medicina (ELAM)", ubicacion: "La Habana", url: "https://www.pv-magazine-latam.com/" },
            { nombre: "Aguas de La Habana", ubicacion: "La Habana", url: "https://www.acn.cu/" },
            { nombre: "Cubaenergia", ubicacion: "La Habana", url: "https://www.pv-magazine-latam.com/" },
            { nombre: "Ktech Energy", ubicacion: "La Habana", url: "https://ktechsolar.com/" },
            { nombre: "RENOVA (Sistema Trifásico)", ubicacion: "La Habana", url: "https://renova.cu/" },
            { nombre: "RENOVA (Vivienda Playa)", ubicacion: "Playa, La Habana", url: "https://renova.cu/" },
            { nombre: "Estación de Carga 5ta. Avenida Motores", ubicacion: "Guanabo, La Habana", url: "https://www.granma.cu/" },
            { nombre: "Etecsa", ubicacion: "Pinar del Río", url: "https://www.trabajadores.cu/" },
            { nombre: "Escuela Primaria Vo Thi Thang", ubicacion: "Playa, La Habana", url: "https://vietnam.vn/" },
            { nombre: "Círculo Infantil Vietnam Heroico", ubicacion: "La Habana", url: "https://vietnam.vn/" },
            { nombre: "Círculo Infantil Le Van Tam", ubicacion: "La Habana", url: "https://vietnam.vn/" },
            { nombre: "Escuela Primaria Nguyen Van Troi", ubicacion: "Cerro, La Habana", url: "https://vietnam.vn/" },
            { nombre: "Politécnico Ho Chi Minh", ubicacion: "La Habana", url: "https://vietnam.vn/" },
            { nombre: "Instituto Finlay de Vacunas", ubicacion: "La Habana", url: "https://www.pv-magazine-latam.com/" },
            { nombre: "Hospital Pediátrico (UCI)", ubicacion: "La Habana", url: "https://www.pv-magazine-latam.com/" },
            { nombre: "Bluesafe", ubicacion: "La Habana", url: "https://bluesafe.biz/" },
            { nombre: "Universidad Tecnológica de La Habana (Cujae)", ubicacion: "Cotorro, La Habana", url: "https://www.mindus.gob.cu/" },
            { nombre: "Parque Solar Cujae", ubicacion: "Cotorro, La Habana", url: "https://www.pv-magazine-latam.com/" },
            { nombre: "Universidad Agraria de La Habana (UNAH)", ubicacion: "Mayabeque", url: "https://www.acn.cu/" },
            { nombre: "Policlínico Carlos M. Portuondo", ubicacion: "Marianao, La Habana", url: "https://www.radiometropolitana.icrt.cu/" },
            { nombre: "Mipyme Jolyni", ubicacion: "La Habana", url: "https://www.efe.com/" },
            { nombre: "Escuela Primaria Cesáreo Fernández", ubicacion: "Playa, La Habana", url: "https://vietnam.vn/" },
            { nombre: "Escuela Nguyen Van Troi (10 de Octubre)", ubicacion: "10 de Octubre, La Habana", url: "https://vietnam.vn/" },
            { nombre: "RENOVA (Sistema Híbrido Comercial)", ubicacion: "La Habana", url: "https://renova.cu/" },
            { nombre: "RENOVA (Marquesina Carga VE)", ubicacion: "La Habana", url: "https://renova.cu/" },
            { nombre: "RENOVA (Sistema Off-Grid)", ubicacion: "La Habana", url: "https://renova.cu/" },
            { nombre: "EXPOCUBA", ubicacion: "Boyeros, La Habana", url: "https://www.cubadebate.cu/" },
            { nombre: "Parque Solar Naranjito", ubicacion: "Boyeros, La Habana", url: "https://www.cubahora.cu/" },
            { nombre: "Parque Solar Guanabo Viejo", ubicacion: "Habana del Este", url: "https://www.radioreloj.cu/" },
            { nombre: "RENOVA (Sistema 60 kW Empresarial)", ubicacion: "La Habana", url: "https://renova.cu/" },
            { nombre: "Ktech Energy (Sistema 36 kW)", ubicacion: "La Habana", url: "https://ktechsolar.com/" },
            { nombre: "Estación de Carga Vía Blanca", ubicacion: "Vía Blanca, La Habana", url: "https://www.granma.cu/" }
        ];

        // Generamos 40 nodos visuales
        for(let i=0; i<40; i++) {
            const node = document.createElement('div');
            node.className = 'holo-node';
            node.style.left = `${Math.random() * 85 + 5}%`; 
            node.style.top = `${Math.random() * 85 + 5}%`;
            node.style.cursor = 'pointer';
            
            // Función interactiva
            const interactuar = (e) => {
                if (e) e.preventDefault();
                
                // Seleccionamos un registro aleatorio de los 64
                const randomRecord = osintRecords[Math.floor(Math.random() * osintRecords.length)];
                
                // Mostramos los datos con el enlace
                info.innerHTML = `
                    <div style="text-align: left; padding: 5px; line-height: 1.4;">
                        <div style="color: #00ff00; font-weight: bold; margin-bottom: 5px;">⚡ ${randomRecord.nombre}</div>
                        <div style="color: #aaa; font-size: 0.85em; margin-bottom: 8px;">📍 ${randomRecord.ubicacion}</div>
                        <a href="${randomRecord.url}" target="_blank" rel="noopener noreferrer" style="color: #00bfff; text-decoration: none; border-bottom: 1px dashed #00bfff; font-size: 0.85em; display: inline-block;">
                            [ 🔗 VERIFICAR FUENTE ]
                        </a>
                    </div>
                `;
                addWatts(3); // Suma vatios al HUD
                logInteraction('osint_node_click'); // Guarda en Supabase
            };

            node.addEventListener('mouseenter', interactuar);
            node.addEventListener('touchstart', interactuar, {passive: false});
            node.addEventListener('click', interactuar);
            
            holo.appendChild(node);
        }
    }
            

            node.addEventListener('mouseenter', interactuar);
            node.addEventListener('touchstart', interactuar, {passive: false});
            node.addEventListener('click', interactuar);
            
            holo.appendChild(node);
        }
    }

    // --- CAPA 8: SIMULADOR DE RESILIENCIA (BLINDADO) ---
    const simKwp = document.getElementById('sim-kwp');
    const simBat = document.getElementById('sim-bat');
    const simStatus = document.getElementById('sim-status');
    const simDesc = document.getElementById('sim-desc');
    const simKwpText = document.getElementById('sim-kwp-text');
    const simBatText = document.getElementById('sim-bat-text');

    function actualizarSimulador() {
        // Si no encontramos los elementos, no hacemos nada para evitar errores
        if(!simKwp || !simBat || !simStatus || !simDesc) return;
        
        // Leer valores actuales de los sliders
        const kwp = parseFloat(simKwp.value);
        const bat = parseFloat(simBat.value);

        // 1. Actualizar los textos de los sliders (Ej: "2.0 kWp" y "5 kWh")
        if(simKwpText) simKwpText.textContent = `${kwp.toFixed(1)} kWp`;
        if(simBatText) simBatText.textContent = `${bat.toFixed(0)} kWh`;

        // 2. Lógica del simulador (Cambia el cartel)
        if (bat < 3) {
            simStatus.textContent = "SISTEMA INSUFICIENTE";
            simStatus.style.color = "var(--accent-danger, #ef4444)";
            simDesc.textContent = "No podrás mantener la nevera encendida durante la noche. Alto riesgo de pérdida de alimentos.";
        } else if (bat >= 3 && bat < 8) {
            simStatus.textContent = "SISTEMA DE RESPALDO BÁSICO";
            simStatus.style.color = "#eab308"; // Amarillo
            simDesc.textContent = "Podrás mantener la nevera y luces LED durante un apagón de 12 horas. Uso limitado de ventilación.";
        } else {
            simStatus.textContent = "SISTEMA RESILIENTE";
            simStatus.style.color = "#10b981"; // Verde
            simDesc.textContent = "Independencia energética total. Podrás mantener nevera, luces, ventilación e incluso internet.";
        }

        // Advertencia extra si hay muchas baterías pero pocos paneles
        if (kwp < 1.5 && bat > 5) {
            simDesc.textContent += " (Advertencia: Tus paneles son insuficientes para recargar esas baterías).";
        }
    }

    // Escuchamos tanto 'input' (mientras arrastras) como 'change' (al soltar el dedo)
    if(simKwp) {
        simKwp.addEventListener('input', actualizarSimulador);
        simKwp.addEventListener('change', actualizarSimulador);
    }
    if(simBat) {
        simBat.addEventListener('input', actualizarSimulador);
        simBat.addEventListener('change', actualizarSimulador);
    }
    
    // Ejecutamos la función una vez al cargar la página para que todo cuadre desde el inicio
    actualizarSimulador();

    // --- CAPA 9: TERMINAL ---
    const termInput = document.getElementById('terminal-input');
    const termOutput = document.getElementById('terminal-output');
    
    if(termOutput) termOutput.innerHTML = "SISTEMA v2.0\nEscribe 'help' para ver comandos.\n\n";

    if(termInput && termOutput) {
        const termContainer = document.querySelector('.terminal-container');
        if(termContainer) termContainer.addEventListener('click', () => termInput.focus());

        termInput.addEventListener('keydown', function(e) {
            // Detectar Enter en PC y Móvil
            if (e.key === 'Enter' || e.keyCode === 13) {
                e.preventDefault();
                const cmd = this.value.trim().toLowerCase();
                this.value = '';
                
                termOutput.innerHTML += `<div style="margin-top: 5px;">root@cuba-solar:~# ${cmd}</div>`;
                
                if (cmd === 'clear') { 
                    termOutput.innerHTML = ''; 
                } 
                else if (cmd === 'help') { 
                    termOutput.innerHTML += `<div style="color: #00ff00;">Comandos: help, status, desclasificar, clear</div>`; 
                }
                else if (cmd === 'status') { 
                    termOutput.innerHTML += `<div style="color: #fbbf24;">[!] Sesgo de no respuesta estatal detectado (90%).<br>[!] Pivotando a datos primarios (N=32) y OSINT (N=64).</div>`; 
                } 
                else if (cmd === 'desclasificar') { 
                    termOutput.innerHTML += `<div style="color: #f87171;">[!] ACCESO DENEGADO.<br>[OK] 32 registros primarios cargados.</div>`; 
                } 
                else if (cmd !== '') {
                    termOutput.innerHTML += `<div style="color: #ef4444;">Comando no reconocido: '${cmd}'</div>`;
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

    // --- TYPEWRITER (Testimonios) ---
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
