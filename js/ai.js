async function sendMessage() {

    const input = document.getElementById("userMessage");
    const chatBox = document.getElementById("chatBox");

    const message = input.value.trim();

    if (!message) {
        return;
    }

    // Show user's message
    chatBox.innerHTML += `
        <div class="user-message">
            ${message}
        </div>
    `;

    input.value = "";

    try {

        const response = await fetch(
           "https://medicare-ai-2026.onrender.com/api/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: message
                })
            }
        );

        const data = await response.json();

        // Show AI response
        if (data.response) {

            chatBox.innerHTML += `
                <div class="ai-message">
                    🤖 ${data.response}
                </div>
            `;

        } else {

            chatBox.innerHTML += `
                <div class="ai-message">
                    ❌ ${data.error || "Something went wrong."}
                </div>
            `;
        }

    } catch (error) {

        console.error("AI Error:", error);

        chatBox.innerHTML += `
            <div class="ai-message">
                ❌ Cannot connect to MediCare AI backend.
            </div>
        `;
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}