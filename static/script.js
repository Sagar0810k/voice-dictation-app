const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const correctBtn = document.getElementById("correct-btn");
const transcription = document.getElementById("transcription");
const statusText = document.getElementById("status");

let recognition;
let isListening = false;

// Check if SpeechRecognition API is supported
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;  // Keep listening until manually stopped
    recognition.interimResults = true;  // Show live updates
    recognition.lang = "en-US";  // Set language

    recognition.onstart = () => {
        statusText.textContent = "🎙️ Listening...";
        statusText.classList.remove("text-secondary", "text-danger");
        statusText.classList.add("text-success");
        startBtn.disabled = true;
        stopBtn.disabled = false;
        isListening = true;
    };

    recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript + " ";
        }
        transcription.value = transcript.trim();  // Update text box
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        statusText.textContent = "⚠️ Error: " + event.error;
        statusText.classList.add("text-danger");
    };

    recognition.onend = () => {
        if (isListening) {
            recognition.start();  // Restart automatically unless stopped
        } else {
            statusText.textContent = "Stopped.";
            statusText.classList.remove("text-success");
            statusText.classList.add("text-secondary");
            startBtn.disabled = false;
            stopBtn.disabled = true;
        }
    };
} else {
    alert("⚠️ Your browser does not support Speech Recognition.");
}

startBtn.onclick = () => {
    if (!recognition) return;
    transcription.value = "";  // Clear previous text
    isListening = true;
    recognition.start();
};

stopBtn.onclick = () => {
    if (!recognition) return;
    isListening = false;
    recognition.stop();  // Stop when user clicks
};

correctBtn.onclick = async () => {
    const text = transcription.value.trim();
    if (!text) {
        alert("Please enter some text first!");
        return;
    }

    statusText.textContent = "✨ Correcting grammar...";
    
    try {
        const response = await fetch("/correct_text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });

        const data = await response.json();
        transcription.value = data.corrected_text;
        statusText.textContent = "✅ Grammar corrected!";
    } catch (error) {
        console.error("Error:", error);
        statusText.textContent = "⚠️ Error processing request.";
    }
};
