// DOM vale elements -->
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Text-to-Speech (TTS) elements -->
const textInput = document.getElementById('text-input');
const voiceSelect = document.getElementById('voice-select');
const rateInput = document.getElementById('rate-input');
const rateValue = document.getElementById('rate-value');
const pitchInput = document.getElementById('pitch-input');
const pitchValue = document.getElementById('pitch-value');
const speakBtn = document.getElementById('speak-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');

// Speech-to-Text (STT) elements -->
const transcript = document.getElementById('transcript');
const languageSelect = document.getElementById('language-select');
const recordBtn = document.getElementById('record-btn');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');

// ek variable mein speech recognize put karne ke liye -->
const synth = window.speechSynthesis;
let voices = [];

// ek variable mein text recognize put karne ke liye -->
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;

// Tab ki functionality ke liye -->
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(`${button.dataset.tab}-section`).classList.add('active');
    });
});

// Text-to-Speech (TTS) functions -->
function loadVoices() {
    voices = synth.getVoices();
    voiceSelect.innerHTML = voices
        .map((voice, index) => `<option value="${index}">${voice.name} (${voice.lang})</option>`)
        .join('');
}

function updateValue(input, display) {
    display.textContent = `${input.value}x`;
}

rateInput.addEventListener('input', () => updateValue(rateInput, rateValue));
pitchInput.addEventListener('input', () => updateValue(pitchInput, pitchValue));

speakBtn.addEventListener('click', () => {
    if (synth.speaking) {
        synth.resume();
        speakBtn.textContent = 'Pause';
        return;
    }

    const text = textInput.value;
    if (text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = voices[voiceSelect.value];
        utterance.rate = parseFloat(rateInput.value);
        utterance.pitch = parseFloat(pitchInput.value);

        utterance.onend = () => {
            speakBtn.textContent = 'Speak';
        };

        synth.speak(utterance);
        speakBtn.textContent = 'Pause';
    }
});

pauseBtn.addEventListener('click', () => {
    if (synth.speaking) {
        synth.pause();
    }
});

stopBtn.addEventListener('click', () => {
    synth.cancel();
    speakBtn.textContent = 'Speak';
});

// Speech-to-Text (STT) functions for speech recognition -->
recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
        } else {
            interimTranscript += transcript;
        }
    }

    if (finalTranscript) {
        document.getElementById('transcript').value += finalTranscript;
    }
};

recognition.onend = () => {
    if (recordBtn.classList.contains('recording')) {
        recognition.start();
    } else {
        recordBtn.textContent = 'Start Recording';
    }
};

recordBtn.addEventListener('click', () => {
    if (recordBtn.classList.contains('recording')) {
        recognition.stop();
        recordBtn.classList.remove('recording');
        recordBtn.textContent = 'Start Recording';
    } else {
        recognition.lang = languageSelect.value;
        recognition.start();
        recordBtn.classList.add('recording');
        recordBtn.textContent = 'Stop Recording';
    }
});

copyBtn.addEventListener('click', () => {
    transcript.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = 'Copy Text';
    }, 2000);
});

clearBtn.addEventListener('click', () => {
    transcript.value = '';
});

// voices ko initialize karne ke liye  -->
loadVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}