const chatBody = document.querySelector('.chat-body');
const messageField = document.querySelector('.message-field');
const sendMessageButton = document.querySelector('#send-msg');
const GetFile = document.querySelector('#get-file');
const fileuploadCover = document.querySelector(".file-upload-cover");
const cancelUploadButton = document.querySelector("#file-cancel")

const API_KEY = "AIzaSyA15nQijtZpm_e0F63XKrZzwowxNFjI2J0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const userData = {
  message: null,
  file: {
    data: null,
    mime_type: null
  }
};




// Create message element and return it
const createMessageElem = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Generating API response
const generateBotMessage = async (incomingMessageDiv) => {
  const messageElem = incomingMessageDiv.querySelector('.bot-message-text');


  // Request options
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])]
      }]
    })
  };

  try {
    // Fetching API response
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    // Displaying bot reply on chatbox
    const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*(.*?)\*\*/g, "$1").trim();
    messageElem.innerText = apiResponseText;
    console.log(data);

  } catch (error) {
    console.log(error);
    messageElem.innerText = error.message;
    messageElem.style.color = "#ff0000"
  } finally {

    userData.file = {};
    incomingMessageDiv.classList.remove("thinking");
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }
};

// Handle outgoing user message
const handleGoingOutput = function (e) {
  e.preventDefault();

  userData.message = messageField.value.trim();
  messageField.value = "";
  fileuploadCover.classList.add("file-uploaded");

  // Create and display user message
  const messageContent = `<div class="user-message-text"></div>
                          ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" ; class="UserInputImg"/> ` : ""}

  
  `;
  const goingMessageDiv = createMessageElem(messageContent, "user-message");
  goingMessageDiv.querySelector('.user-message-text').textContent = userData.message;
  chatBody.appendChild(goingMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  // Simulate bot response with thinking indicator after delay
  setTimeout(() => {
    const messageContent = `
      <div class="bot-message thinking">
        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024" class="chat-bot-img">
          <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
        </svg>
        <div class="bot-message-text">
          <div class="thinking-indicator">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
      </div>`;
    const incomingMessageDiv = createMessageElem(messageContent, "bot-message");
    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    generateBotMessage(incomingMessageDiv);

  }, 600);
};

// Event listeners
messageField.addEventListener("keydown", (para) => {
  const Userinput = para.target.value.trim();
  if (para.key === "Enter" && Userinput) {
    handleGoingOutput(para);
  }
});


GetFile.addEventListener("change", () => {

  const file = GetFile.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    fileuploadCover.querySelector("img").src = e.target.result;
    fileuploadCover.classList.add("file-uploaded");
    // storing the data in userdata

    const base64String = e.target.result.split(",")[1];

    userData.file = {
      data: base64String,
      mime_type: file.type
    }

    GetFile.value = "";
  }

  reader.readAsDataURL(file);

  console.log(file)


})



cancelUploadButton.addEventListener("click", () => {
  userData.file = {};
  fileuploadCover.classList.remove("file-uploaded");
})

// just setting up emoji picker and handle emojis

const picker = new EmojiMart.Picker({

  theme: "light",
  skinTonePosition: "none",
  previewPosition: "none",
  onEmojiSelect: (emoji) => {
    const { selectionStart: start, selectionEnd: end } = messageField;
    messageField.setRangeText(emoji.native, start, end, "end");
    messageField.focus();
  },
  onClickOutside: (e) => {

if (e.target.id === "emoji-picker") {
  document.body.classList.toggle("show-emoji-picker");
} else {
  document.body.classList.remove("show-emoji-picker");
}

  }

});

document.querySelector(".form-ofchat").appendChild(picker);


sendMessageButton.addEventListener('click', (e) => handleGoingOutput(e));


document.querySelector('#file-upload').addEventListener('click', () => GetFile.click());