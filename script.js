const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;

// Path to your PHP file
const PHP_FILE_PATH = "chatbot.php"; 

const loadDataFromLocalstorage = () => {
    const themeColor = localStorage.getItem("themeColor");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class="default-text">
                            <h1>Chat with Xgpt AI</h1>
                            <p>Welcome to Xgpt  AI! Start a conversation and explore the amazing capabilities of artificial intelligence. Xgpt  is here to assist you with insightful responses to any question you may have.</p>
                            <p>Simply type your message below, and let the AI provide answers that are accurate and intelligent. Your chat history will be displayed here, helping you track previous conversations.</p>
                            <p>Feel free to ask anything, from simple queries to complex topics, and see how Xgpt  AI handles it. The more you chat, the better it understands and adapts to your needs!</p>
                            <p>Ready to dive into the world of AI? Start typing below to begin your conversation with Xgpt  AI!</p>
                            <p>Made by <a href="https://t.me/M_R_0X" target="_blank">Swastik</a> | Powered by Xgpt AI</p>
                        </div>`;
    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const createChatElement = (content, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv;
};

// Format text with markdown-like syntax
const formatText = (text) => {
    // Bold (surround text with double asterisks or double underscores)
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/__(.*?)__/g, "<strong>$1</strong>");

    // Italic (surround text with single asterisk or underscore)
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
    text = text.replace(/_(.*?)_/g, "<em>$1</em>");

    // Mono (single backtick)
    text = text.replace(/`(.*?)`/g, "<code>$1</code>");

    // Code block formatting (triple backticks)
    text = text.replace(/```(.*?)```/gs, "<pre><code class='language-javascript'>$1</code></pre>");

    // Ensure Prism.js handles the syntax highlighting
    setTimeout(() => {
        Prism.highlightAll();
    }, 10); // Small delay to ensure Prism.js runs after the content is rendered

    return text;
};
// Get chat response from the PHP backend
const getChatResponseFromAPI = async (incomingChatDiv) => {
    const pElement = document.createElement("p");

    try {
        // Send the user text to PHP backend
        const formData = new FormData();
        formData.append("user_message", userText.trim());

        const response = await fetch(PHP_FILE_PATH, {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        console.log("API Response Data:", data);

        if (data.response) {
            const formattedResponse = formatText(data.response);
            pElement.innerHTML = formattedResponse; // Use innerHTML to inject formatted text
        } else {
            pElement.classList.add("error");
            pElement.textContent = "Oops! Something went wrong with the API response.";
        }
    } catch (error) {
        console.error("Error fetching the API:", error);
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response.";
    }

    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const showTypingAnimation = () => {
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="DeepSeek.png" alt="DeepSeek-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;

    const incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponseFromAPI(incomingChatDiv);
};

const handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if (!userText) return;

    chatInput.value = "";
    chatInput.style.height = `${initialInputHeight}px`;

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="user.jpg" alt="user-img">
                        <p>${formatText(userText)}</p>
                    </div>
                </div>`;

    const outgoingChatDiv = createChatElement(html, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
};

const copyResponse = (copyBtn) => {
    const responseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent)
        .then(() => {
            copyBtn.textContent = "done";  // Change button text to "done" after successful copy
            setTimeout(() => copyBtn.textContent = "content_copy", 1000); // Reset the button text after 1 second
        })
        .catch((error) => {
            console.error("Failed to copy text: ", error);
            copyBtn.textContent = "error"; // Show error if copy fails
            setTimeout(() => copyBtn.textContent = "content_copy", 1000);
        });
};

deleteButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

loadDataFromLocalstorage();
sendButton.addEventListener("click", handleOutgoingChat);