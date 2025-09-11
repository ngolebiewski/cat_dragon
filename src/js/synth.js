const AudioCtx = new (window.AudioContext || window.webkitAudioContext)();
const bpm = 180;
const beatTime = 60 / bpm;
const Cminor = [261.63, 293.66, 311.13, 349.23, 392.0, 415.3, 466.16];

function playNote(freq, dur = 0.2, vol = 0.1, type = "sawtooth") {
    const osc = AudioCtx.createOscillator();
    const gain = AudioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, AudioCtx.currentTime);
    gain.gain.setValueAtTime(vol, AudioCtx.currentTime);
    osc.connect(gain); gain.connect(AudioCtx.destination);
    osc.start(); osc.stop(AudioCtx.currentTime + dur);
}

function kick(time = 0) {
    const osc = AudioCtx.createOscillator();
    const gain = AudioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(100, AudioCtx.currentTime + time);
    gain.gain.setValueAtTime(1, AudioCtx.currentTime + time);
    gain.gain.exponentialRampToValueAtTime(0.001, AudioCtx.currentTime + time + 0.3);
    osc.connect(gain); gain.connect(AudioCtx.destination);
    osc.start(AudioCtx.currentTime + time); osc.stop(AudioCtx.currentTime + time + 0.3);
}

function snare(time = 0) {
    const noise = AudioCtx.createBufferSource();
    const buffer = AudioCtx.createBuffer(1, AudioCtx.sampleRate * 0.2, AudioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buffer;
    const gain = AudioCtx.createGain();
    gain.gain.setValueAtTime(0.05, AudioCtx.currentTime + time);
    noise.connect(gain); gain.connect(AudioCtx.destination);
    noise.start(AudioCtx.currentTime + time); noise.stop(AudioCtx.currentTime + time + 0.2);
}

// --- SEMI-RANDOM ARPEGGIATOR ---
function playArpStep(time) {
    let weights = [3, 2, 2, 1, 1, 1, 1];
    let idx = Math.floor(Math.random() * weights.reduce((a,b)=>a+b));
    let cumulative = 0;
    for (let i=0; i<weights.length; i++) {
        cumulative += weights[i];
        if (idx < cumulative) { idx = i; break; }
    }
    playNote(Cminor[idx], 0.2, 0.08, "triangle");
}

// --- LOOP CONTROL ---
let timeouts = [];
let isPlaying = false;

export function playLoop() {
    if (isPlaying) return;
    if (AudioCtx.state === "suspended") AudioCtx.resume();
    isPlaying = true;

    function loop() {
        const stepsPerMeasure = 8;
        for (let measure=0; measure<4; measure++) {
            for (let step=0; step<stepsPerMeasure; step++) {
                const t = measure*4*beatTime + step*(4*beatTime/stepsPerMeasure);
                timeouts.push(setTimeout(()=>playArpStep(t), t*1000));
                if(step%4===0) timeouts.push(setTimeout(()=>kick(t), t*1000));
                if(step%4===2) timeouts.push(setTimeout(()=>snare(t), t*1000));
            }
        }
        // schedule next loop
        timeouts.push(setTimeout(loop, beatTime*4*1000));
    }

    loop();
}

export function stopLoop() {
    timeouts.forEach(id => clearTimeout(id));
    timeouts = [];
    isPlaying = false;
}
