// ==========================================================================
// CONFIGURACIÓN
// ==========================================================================
const SUPABASE_URL = 'https://jntyotrddlrzccoauram.supabase.co';
const SUPABASE_KEY = 'sb_publishable_H8uhN5DbCWLslwo4uJlDuw_jdAjE67K';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================================================
// 1. AUDIO SENSORIAL (Sintetizador Lofi con Filtro Low-Pass)
// ==========================================================================
const musicBtn = document.getElementById('music-toggle');
let audioCtx, isPlaying = false, lofiInterval, filterNode;

function playLofi() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Filtro para que suene cálido y analógico (como un vinilo)
    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.value = 800; 
    filterNode.connect(audioCtx.destination);

    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; 

    const playNote = (freq, time, duration, volume) => {
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = 'triangle'; // Sonido de piano/sinte
        osc.frequency.setValueAtTime(freq, time);
        
        // Envolvente suave (Attack, Decay, Sustain, Release)
        gain.gain.setValueAtTime(0, time); 
        gain.gain.linearRampToValueAtTime(volume, time + 0.05); 
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        osc.connect(gain); 
        gain.connect(filterNode); // Pasa por el filtro antes de sonar
        osc.start(time); 
        osc.stop(time + duration);
    };

    const playDrum = (time) => {
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(100, time); 
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
        gain.gain.setValueAtTime(0.08, time); 
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
        osc.connect(gain); 
        gain.connect(audioCtx.destination); // El kick va directo
        osc.start(time); 
        osc.stop(time + 0.2);
    };

    const loop = () => {
        const now = audioCtx.currentTime;
        // Bajo constante
        playNote(130.81, now, 2.0, 0.04); 
        // Melodía aleatoria
        playNote(scale[Math.floor(Math.random() * scale.length)], now + 0.5, 1.5, 0.03);
        playNote(scale[Math.floor(Math.random() * scale.length)], now + 1.2, 1.0, 0.02);
        // Ritmo Lofi
        playDrum(now); 
        playDrum(now + 1.0);
    };
    
    loop(); 
    lofiInterval = setInterval(loop, 2000);
}

if (musicBtn) {
    musicBtn.addEventListener('click', () => {
        if (!audioCtx) { 
            playLofi(); isPlaying = true; musicBtn.classList.add('playing'); 
        } else if (isPlaying) { 
            audioCtx.suspend(); isPlaying = false; musicBtn.classList.remove('playing'); 
        } else { 
            audioCtx.resume(); isPlaying = true; musicBtn.classList.add('playing'); 
        }
    });
}

// ==========================================================================
// 2. CONTADOR DE VISITAS Y PROGRESO (Supabase)
// ==========================================================================
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) progressBar.style.width = `${(scrollTop / scrollHeight) * 100}%`;
});

async function registrarYContarVisitas() {
    const countElement = document.getElementById('view-count');
    if (!countElement) return;
    try {
        // Insertar visita
        await supabaseClient.from('page_views').insert([{}]);
        // Contar total
        const { count, error } = await supabaseClient.from('page_views').select('*', { count: 'exact', head: true });
        if (error) throw error;
        countElement.textContent = count.toLocaleString('es-ES');
    } catch (error) {
        console.error("Error contador:", error);
        countElement.textContent = "N/A";
    }
}
window.addEventListener('DOMContentLoaded', registrarYContarVisitas);

// ==========================================================================
// 3. FONDO 3D (Partículas que reaccionan al mouse)
// ==========================================================================
window.addEventListener('load', () => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        renderer.setSize(innerWidth, innerHeight);
        
        const container = document.getElementById('canvas-container');
        if (container) container.appendChild(renderer.domElement);

        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(2000 * 3);
        for (let i = 0; i < pos.length; i++) pos[i] = (Math.random() - 0.5) * 25;
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

        const mat = new THREE.PointsMaterial({ size: 0.04, color: 0xff8c00, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
        const mesh = new THREE.Points(geo, mat);
        scene.add(mesh);
        camera.position.z = 5;

        let mx = 0, my = 0;
        document.addEventListener('mousemove', e => { 
            mx = (e.clientX / innerWidth) - 0.5; 
            my = (e.clientY / innerHeight) - 0.5; 
        });

        const clock = new THREE.Clock();
        let active = true;
        document.addEventListener('visibilitychange', () => { active = !document.hidden; if(active) animate(); });

        function animate() {
            if(!active) return;
            requestAnimationFrame(animate);
            const t = clock.getElapsedTime();
            mesh.rotation.y = t * 0.03 + mx * 0.3;
            mesh.rotation.x = t * 0.015 + my * 0.3;
            mat.opacity = 0.4 + Math.sin(t * 1.5) * 0.2;
            renderer.render(scene, camera);
        }
        animate();
    }
});

// ==========================================================================
// 4. ANIMACIONES DE SCROLL
// ==========================================================================
gsap.registerPlugin(ScrollTrigger);

// Revelar secciones
document.querySelectorAll('.reveal').forEach(el => {
    ScrollTrigger.create({ 
        trigger: el, 
        start: "top 85%", 
        onEnter: () => el.classList.add('visible'), 
        once: true 
    });
});
