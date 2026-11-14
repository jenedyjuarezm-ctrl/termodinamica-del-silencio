// ==========================================================================
// 1. CONFIGURACIÓN Y HUD
// ==========================================================================
const SUPABASE_URL = 'https://jntyotrddlrzccoauram.supabase.co';
const SUPABASE_KEY = 'sb_publishable_H8uhN5DbCWLslwo4uJlDuw_jdAjE67K';
let supabaseClient = null;
try { supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch(e) {}

let currentWatts = 0;
function addWatts(amount) {
    try {
        currentWatts = Math.min(currentWatts + amount, 100);
        const countEl = document.getElementById('watts-count');
        const fillEl = document.getElementById('watts-fill');
        if (countEl) countEl.textContent = currentWatts;
        if (fillEl) fillEl.style.width = `${currentWatts}%`;
    } catch(e) {}
}

// ==========================================================================
// 2. INICIALIZACIÓN (ESPERAMOS A QUE CARGUE TODO)
// ==========================================================================
window.addEventListener('load', () => {
    
    // --- 1. GRÁFICA CLIMA (NASA) Y SLIDER ---
    try {
        const slider = document.getElementById('month-slider');
        const ctxNasa = document.getElementById('nasaChart');
        
        if (slider && ctxNasa && typeof Chart !== 'undefined') {
            const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
            const irr = [3.55, 4.75, 5.60, 6.76, 7.21, 5.72, 6.84, 5.90, 5.74, 4.19, 3.94, 3.49]; 
            const temp = [23.49, 21.70, 25.55, 25.77, 29.46, 28.08, 28.29, 28.63, 28.39, 26.71, 24.75, 23.12];

            let nasaChart = new Chart(ctxNasa, {
                type: 'bar',
                data: { labels: meses, datasets: [
                    { type: 'bar', label: 'Irradiancia', data: irr, backgroundColor: 'rgba(234, 179, 8, 0.5)' },
                    { type: 'line', label: 'Temp', data: temp, borderColor: '#ec4899', borderWidth: 3, yAxisID: 'y1' }
                ]},
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                    scales: { y: { title: { display: true, text: 'kWh/m²' } }, y1: { position: 'right', title: { display: true, text: '°C' }, grid: { drawOnChartArea: false } } }
                }
            });

            // Lógica del Slider
            slider.addEventListener('input', (e) => {
                const i = parseInt(e.target.value);
                nasaChart.data.datasets[0].backgroundColor = irr.map((_, idx) => idx === i ? '#eab308' : 'rgba(234, 179, 8, 0.5)');
                
                const irrVal = document.getElementById('irradiancia-val');
                const tempVal = document.getElementById('temp-val');
                const monthVal = document.getElementById('month-name');
                const lossVal = document.getElementById('loss-percent');

                if(irrVal) irrVal.textContent = irr[i].toFixed(1);
                if(tempVal) tempVal.textContent = temp[i].toFixed(1);
                if(monthVal) monthVal.textContent = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][i];
                
                let perdida = 0;
                if (temp[i] > 25) perdida = -((temp[i] - 25) * 1.5).toFixed(0);
                if(lossVal) lossVal.textContent = `${perdida}%`;

                nasaChart.update();
                addWatts(2);
            });
        }
    } catch (e) { console.error("Fallo en NASA", e); }

    // --- 2. SIMULADOR DE RESILIENCIA ---
    try {
        const simKwp = document.getElementById('sim-kwp');
        const simBat = document.getElementById('sim-bat');
        
        if (simKwp && simBat) {
            const actualizarSim = () => {
                const kwp = parseFloat(simKwp.value);
                const bat = parseFloat(simBat.value);
                const status = document.getElementById('sim-status');
                const desc = document.getElementById('sim-desc');

                if(document.getElementById('sim-kwp-text')) document.getElementById('sim-kwp-text').textContent = `${kwp.toFixed(1)} kWp`;
                if(document.getElementById('sim-bat-text')) document.getElementById('sim-bat-text').textContent = `${bat} kWh`;

                if (bat < 3) {
                    if(status) { status.textContent = "SISTEMA INSUFICIENTE"; status.style.color = "red"; }
                    if(desc) desc.textContent = "No podrás mantener la nevera encendida durante la noche.";
                } else if (bat >= 3 && bat < 8) {
                    if(status) { status.textContent = "SISTEMA DE RESPALDO BÁSICO"; status.style.color = "#eab308"; }
                    if(desc) desc.textContent = "Podrás mantener la nevera y luces LED durante un apagón de 12 horas.";
                } else {
                    if(status) { status.textContent = "SISTEMA RESILIENTE"; status.style.color = "#10b981"; }
                    if(desc) desc.textContent = "Independencia energética total. Nevera, luces y ventilación aseguradas.";
                }
            };
            simKwp.addEventListener('input', actualizarSim);
            simBat.addEventListener('input', actualizarSim);
            actualizarSim(); // Ejecutar al inicio
        }
    } catch (e) { console.error("Fallo en Simulador", e); }

    // --- 3. HOLOGRAMA OSINT ---
    try {
        const holo = document.getElementById('hologram-container');
        const info = document.getElementById('osint-info');
        if (holo && info) {
            const datos = ["REGISTRO #14: Solinera Cienfuegos", "REGISTRO #32: Mipyme La Habana", "REGISTRO #05: Panel residencial", "REGISTRO #61: Solinera Matanzas"];
            
            for(let i=0; i<20; i++) {
                const node = document.createElement('div');
                node.className = 'holo-node';
                node.style.left = `${Math.random() * 85 + 5}%`; 
                node.style.top = `${Math.random() * 85 + 5}%`;
                node.style.pointerEvents = 'auto'; // Asegura que se pueda tocar
                
                const accion = (e) => {
                    if (e) e.preventDefault();
                    info.innerHTML = `<span style="color: #00ff00;">${datos[Math.floor(Math.random() * datos.length)]}</span>`;
                    addWatts(2);
                };
                
                node.addEventListener('touchstart', accion, {passive: false});
                node.addEventListener('click', accion);
                holo.appendChild(node);
            }
        }
    } catch (e) { console.error("Fallo en Holograma", e); }

    // --- 4. TERMINAL ---
    try {
        const termInput = document.getElementById('terminal-input');
        const termOutput = document.getElementById('terminal-output');
        
        if (termInput && termOutput) {
            termOutput.innerHTML = "SISTEMA v2.0\nEscribe 'help'.\n\n";
            const container = document.querySelector('.terminal-container');
            if (container) container.addEventListener('click', () => termInput.focus());

            termInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.keyCode === 13) {
                    e.preventDefault();
                    const cmd = termInput.value.trim().toLowerCase();
                    termInput.value = '';
                    termOutput.innerHTML += `<div>root@cuba:~# ${cmd}</div>`;
                    
                    if (cmd === 'clear') termOutput.innerHTML = '';
                    else if (cmd === 'help') termOutput.innerHTML += `<div style="color: lime;">Comandos: help, status, clear</div>`;
                    else if (cmd === 'status') termOutput.innerHTML += `<div style="color: yellow;">[!] Datos primarios cargados (N=32).</div>`;
                    else if (cmd !== '') termOutput.innerHTML += `<div style="color: red;">Comando desconocido.</div>`;
                    
                    if (container) container.scrollTop = container.scrollHeight;
                }
            });
        }
    } catch (e) { console.error("Fallo en Terminal", e); }

});
