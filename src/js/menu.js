document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll('.menu-item');

  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault(); 

      menuItems.forEach(i => i.classList.remove('active'));

      item.classList.add('active');

      const menu = item.dataset.menu;
      switch (menu) {
        case 'project':
          window.location.href = 'project.html';
          break;
        case 'menu1':
          window.location.href = 'menu.html';
          break;
        case 'menu2':
          window.location.href = 'menu1.html';
          break;
      }
    });
  });

  const currentPage = window.location.pathname;
  menuItems.forEach(item => {
    const menu = item.dataset.menu;
    if (
      (currentPage.includes('project') && menu === 'project') ||
      (currentPage.includes('menu.html') && menu === 'menu1') ||
      (currentPage.includes('menu1.html') && menu === 'menu2')
    ) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
});

//buat upload file
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const fileNameDisplay = document.getElementById('fileName');

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      updateFileName(fileInput.files[0].name);
      console.log('File selected:', fileInput.files[0]);
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = 'rgba(4, 54, 62, 0.8)';
    dropZone.style.borderColor = '#fff';
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = 'rgba(4, 54, 62, 0.5)';
    dropZone.style.borderColor = '#ccc';
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = 'rgba(4, 54, 62, 0.5)';
    dropZone.style.borderColor = '#ccc';

    const files = e.dataTransfer.files;
    if (files.length) {
      fileInput.files = files; 
      updateFileName(files[0].name);
      console.log('File dropped:', files[0]);
    }
  });

  function updateFileName(name) {
    fileNameDisplay.textContent = name;
  }

//download + chat
    const downloadSection = document.getElementById('downloadSection');
    const downloadBtn = document.getElementById('downloadBtn');
    const chatLog = document.getElementById('chatLog');
    const sendBtn = document.getElementById('sendBtn');
    const userInput = document.getElementById('userInput');

    fileInput.addEventListener('change', () => {
      downloadSection.classList.remove('hidden');
    });

    downloadBtn.addEventListener('click', () => {
      alert('Ringkasan sedang diunduh... (simulasi)');
    });

    sendBtn.addEventListener('click', () => {
      const userText = userInput.value.trim();
      if (userText) {
        const userBubble = document.createElement('div');
        userBubble.className = 'chat-bubble user';
        userBubble.textContent = userText;
        chatLog.appendChild(userBubble);

        const systemBubble = document.createElement('div');
        systemBubble.className = 'chat-bubble system';
        systemBubble.textContent = 'Ini respons sistem untuk: "' + userText + '"';
        chatLog.appendChild(systemBubble);

        userInput.value = '';
        chatLog.scrollTop = chatLog.scrollHeight;
      }
    });

  // rekomendasi paper
  const showPopupBtn = document.getElementById('showRecommendationBtn');
  const popup = document.getElementById('recommendationPopup');
  const minimizeBtn = document.getElementById('minimizePopupBtn');
  const downloadSection2 = document.getElementById('downloadSection2');
  const downloadBtn2 = document.querySelector('#downloadSection2 .download-summary-btn');

  if (downloadBtn2) {
    downloadBtn2.addEventListener('click', () => {
      alert('Ringkasan sedang diunduh... (simulasi)');
    });
  }

  showPopupBtn.addEventListener('click', () => {
    popup.classList.remove('hidden');
  });

  minimizeBtn.addEventListener('click', () => {
    popup.classList.add('hidden');
  });

  document.querySelectorAll('.pick-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.getElementById('recommendationPopup').classList.add('hidden');

      document.getElementById('recommendationSummarySection').classList.remove('hidden');
      document.getElementById('downloadSection2').classList.remove('hidden');

      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
  });
