import "../css/homepage.css";
import { supabase } from "./supabase_client";
import {
  summarizeAbstraction,
  summarizeExtraction,
  getCurrentUser,
  askQuestion,
} from "./services/api_service.js";

class FileAnalyzer {
  constructor() {
    this.currentFile = null;
    this.isAnalyzing = false;
    this.analysisResult = null;
    this.currentUser = null;
    this.sessionId = null;
    this.initializeElements();
    this.attachEventListeners();
    this.initializeUserProfile();
  }

  async initializeUserProfile() {
    try {
      this.currentUser = await getCurrentUser();

      const displayName =
        this.currentUser.user_metadata.name ||
        this.currentUser.user_metadata.full_name ||
        this.currentUser.user_metadata.login ||
        this.currentUser.email?.split("@")[0] ||
        "User";

      this.userName.textContent = displayName;

      const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      this.userAvatar.textContent = initials;
    } catch (err) {
      console.error("Error loading profile:", err);
      window.location.href = "/pages/signup.html";
    }
  }

  initializeElements() {
    this.sidebar = document.getElementById("sidebar");
    this.overlay = document.getElementById("overlay");
    this.mobileMenuBtn = document.getElementById("mobileMenuBtn");
    this.newChatBtn = document.getElementById("newChatBtn");
    this.uploadArea = document.getElementById("uploadArea");
    this.uploadBtn = document.getElementById("uploadBtn");
    this.fileInput = document.getElementById("fileInput");
    this.filePreview = document.getElementById("filePreview");
    this.fileName = document.getElementById("fileName");
    this.fileSize = document.getElementById("fileSize");
    this.fileTypeIcon = document.getElementById("fileTypeIcon");
    this.analyzeBtn = document.getElementById("analyzeBtn");
    this.analyzeBtnText = document.getElementById("analyzeBtnText");
    this.loadingSpinner = document.getElementById("loadingSpinner");
    this.changeFileBtn = document.getElementById("changeFileBtn");

    this.userAvatar = document.querySelector(".user-avatar");
    this.userName = document.querySelector(".user-name");
  }

  attachEventListeners() {
    if (this.mobileMenuBtn) {
      this.mobileMenuBtn.addEventListener("click", () => this.toggleSidebar());
    }
    if (this.overlay) {
      this.overlay.addEventListener("click", () => this.closeSidebar());
    }

    if (this.uploadBtn) {
      this.uploadBtn.addEventListener("click", () => this.fileInput.click());
    }
    if (this.uploadArea) {
      this.uploadArea.addEventListener("click", () => this.fileInput.click());
    }
    if (this.fileInput) {
      this.fileInput.addEventListener("change", (e) =>
        this.handleFileSelect(e)
      );
    }
    if (this.changeFileBtn) {
      this.changeFileBtn.addEventListener("click", () => this.newAnalysis());
    }

    if (this.uploadArea) {
      this.uploadArea.addEventListener("dragover", (e) =>
        this.handleDragOver(e)
      );
      this.uploadArea.addEventListener("dragleave", (e) =>
        this.handleDragLeave(e)
      );
      this.uploadArea.addEventListener("drop", (e) => this.handleDrop(e));
    }

    if (this.analyzeBtn) {
      this.analyzeBtn.addEventListener("click", () => this.analyzeFile());
    }

    if (this.newChatBtn) {
      this.newChatBtn.addEventListener("click", () => this.newAnalysis());
    }

    document.querySelectorAll(".history-item").forEach((item) => {
      item.addEventListener("click", () => this.selectHistoryItem(item));
    });

      const sidebarContent = document.getElementById('sidebar').querySelector('.sidebar-content');
      sidebarContent.style.overflowY = 'auto';
      sidebarContent.style.height = 'calc(100vh - 150px)';

    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error("Error signing out:", error.message);
          } else {
            // Optionally reload or redirect after logout
            window.location.reload();
          }
        } catch (err) {
          console.error("Unexpected error during sign out:", err);
        }
      });
    }
  }

  toggleSidebar() {
    if (this.sidebar) {
      this.sidebar.classList.toggle("open");
    }
    if (this.overlay) {
      this.overlay.classList.toggle("show");
    }
  }

  closeSidebar() {
    if (this.sidebar) {
      this.sidebar.classList.remove("open");
    }
    if (this.overlay) {
      this.overlay.classList.remove("show");
    }
  }

  handleDragOver(e) {
    e.preventDefault();
    this.uploadArea.classList.add("dragover");
  }

  handleDragLeave(e) {
    e.preventDefault();
    this.uploadArea.classList.remove("dragover");
  }

  handleDrop(e) {
    e.preventDefault();
    this.uploadArea.classList.remove("dragover");
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      this.processFile(files[0]);
    }
  }

  handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  processFile(file) {
    this.currentFile = file;
    if (this.fileName) {
      this.fileName.textContent = file.name;
    }
    if (this.fileSize) {
      this.fileSize.textContent = `${this.formatFileSize(
        file.size
      )} • ${this.getFileType(file)}`;
    }

    if (this.uploadArea) {
      this.uploadArea.style.display = "none";
    }
    if (this.filePreview) {
      this.filePreview.classList.add("show");
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  getFileType(file) {
    const extension = file.name.split(".").pop().toUpperCase();
    const types = {
      PDF: "PDF Document",
    };
    return types[extension] || `${extension} File`;
  }

  showLoading() {
    const selectedMode = document.querySelector(
      'input[name="analysisMode"]:checked'
    )?.value;

    const loadingOverlay = document.createElement("div");
    loadingOverlay.id = "loadingOverlay";
    loadingOverlay.className = "loading-overlay";

    const loadingText =
      selectedMode === "abstraction"
        ? "Analyzing your document... (it may take a while)"
        : "Analyzing your document...";

    loadingOverlay.innerHTML = `
      <div style="text-align: center;">
        <div class="loading-spinner"></div>
        <div class="loading-text">${loadingText}</div>
      </div>
    `;
    document.body.appendChild(loadingOverlay);
  }

  hideLoading() {
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay) {
      loadingOverlay.remove();
    }
  }

  async analyzeFile() {
    if (!this.currentFile) {
      this.showError("Please select a file first");
      return;
    }

    const selectedMode = document.querySelector(
      'input[name="analysisMode"]:checked'
    )?.value;
    if (!selectedMode) {
      this.showError("Please select a summarization mode");
      return;
    }

    try {
      this.showLoading();

      const [result] = await Promise.all([
        selectedMode === "abstraction"
          ? summarizeAbstraction(this.currentFile)
          : summarizeExtraction(this.currentFile),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);

      this.hideLoading();

      this.showAnalysisResult(result);

      this.addToHistory(this.currentFile);
    } catch (error) {
      this.hideLoading();
      console.error("Analysis failed:", error);
      this.showError(`Analysis failed: ${error.message}`);
    }
  }

  showAnalysisResult(result) {
    this.analysisResult = result;
    this.currentSummarizationId = result.id;
    this.currentSessionId = null;

    const chatSection = document.getElementById("chatSection");
    if (chatSection) {
      chatSection.style.display = "flex";
      chatSection.classList.add("show");
    }

    const chatLog = document.getElementById("chatLog");
    if (chatLog) {
      chatLog.innerHTML = `
        <div class="chat-bubble system">
          <strong>Analysis Complete!</strong><br><br>
          ${result.summary}
        </div>
      `;
    }

    const chatInput = document.getElementById("userInput");
    if (chatInput) {
      chatInput.focus();
      chatInput.placeholder = "QnA seputar hasil Summarization...";
    }

    const existingResult = document.getElementById("analysisResult");
    if (existingResult) {
      existingResult.remove();
    }

    chatSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  startQnA(summarizationId) {
    this.currentSummarizationId = summarizationId;

    const chatInput = document.getElementById("userInput");
    if (chatInput) {
      chatInput.focus();
    }
  }

  showError(message) {
    let errorArea = document.getElementById("errorMessage");
    if (!errorArea) {
      errorArea = document.createElement("div");
      errorArea.id = "errorMessage";
      errorArea.className = "error-message";

      const filePreview = document.getElementById("filePreview");
      filePreview.parentNode.insertBefore(errorArea, filePreview.nextSibling);
    }

    errorArea.innerHTML = `
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-text">${message}</span>
        <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    setTimeout(() => {
      if (errorArea.parentNode) {
        errorArea.remove();
      }
    }, 5000);
  }

  addToHistory(file) {
    const todaySection = document.querySelector(".history-section");
    if (!todaySection) return;

    const historyItem = document.createElement("div");
    historyItem.className = "history-item";
    historyItem.innerHTML = `
      <span>${file.name}</span>
    `;

    document.querySelectorAll(".history-item").forEach((item) => {
      item.classList.remove("active");
    });

    historyItem.classList.add("active");

    const todayTitle = todaySection.querySelector(".history-title");
    if (todayTitle) {
      todayTitle.insertAdjacentElement("afterend", historyItem);
    }

    historyItem.addEventListener("click", () =>
      this.selectHistoryItem(historyItem)
    );
  }

  selectHistoryItem(item) {
    document.querySelectorAll(".history-item").forEach((i) => {
      i.classList.remove("active");
    });
    item.classList.add("active");
    this.closeSidebar();
  }

  showAnalysisComplete() {
    if (this.analyzeBtnText) {
      this.analyzeBtnText.textContent = "Analysis Complete!";
      setTimeout(() => {
        this.analyzeBtnText.textContent = "Analyze File";
      }, 2000);
    }
  }

  showError(message) {
    alert(message);
  }

  newAnalysis() {
    this.currentFile = null;
    if (this.filePreview) {
      this.filePreview.classList.remove("show");
    }
    if (this.fileInput) {
      this.fileInput.value = "";
    }
    if (this.uploadArea) {
      this.uploadArea.style.display = "block";
    }
    this.closeSidebar();

    document.querySelectorAll(".history-item").forEach((item) => {
      item.classList.remove("active");
    });
  }

  async handleChatMessage(userText) {
    if (!this.currentSummarizationId) {
      this.showError("Please analyze a file first before asking questions.");
      return;
    }

    try {
      this.addChatMessage(userText, "user");

      const loadingMessage = this.addChatMessage("Thinking...", "system", true);

      const response = await askQuestion(
        this.currentSummarizationId,
        userText,
        this.sessionId
      );

      if (loadingMessage) {
        loadingMessage.remove();
      }

      if (response.session_id) {
        this.sessionId = response.session_id;
      }

      this.addChatMessage(response.answer, "system");
    } catch (error) {
      console.error("Error in chat:", error);
      const loadingMessages = document.querySelectorAll(
        ".chat-message.loading"
      );
      loadingMessages.forEach((msg) => msg.remove());

      this.addChatMessage(
        "Sorry, I encountered an error. Please try again.",
        "system"
      );
    }
  }

  addChatMessage(message, sender, isLoading = false) {
    const chatLog = document.getElementById('chatLog');
    if (!chatLog) return null;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message${isLoading ? ' loading' : ''}`;
    
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}${isLoading ? ' loading' : ''}`;
    bubble.textContent = message;
    
    messageDiv.appendChild(bubble);
    chatLog.appendChild(messageDiv);
    
    // Scroll to bottom
    chatLog.scrollTop = chatLog.scrollHeight;
    
    return messageDiv;
  }
}

const fileAnalyzer = new FileAnalyzer();
window.fileAnalyzer = fileAnalyzer;

document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("sendBtn");
  const userInput = document.getElementById("userInput");

  sendBtn.addEventListener("click", async () => {
    const userText = userInput.value.trim();
    if (userText && window.fileAnalyzer) {
      userInput.value = "";
      await window.fileAnalyzer.handleChatMessage(userText);
    }
  });

  userInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      const userText = userInput.value.trim();
      if (userText && window.fileAnalyzer) {
        userInput.value = "";
        await window.fileAnalyzer.handleChatMessage(userText);
      }
    }
  });

  const analyzeBtn = document.getElementById("analyzeBtn");
  const modeRadios = document.querySelectorAll('input[name="analysisMode"]');

  modeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      analyzeBtn.classList.remove("hidden");
    });
  });
});
