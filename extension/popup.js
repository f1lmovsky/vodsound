const serverUrlInput = document.getElementById('serverUrl');
const syncOffsetInput = document.getElementById('syncOffset');
const audioVolumeInput = document.getElementById('audioVolume');
const volumeValue = document.getElementById('volumeValue');
const saveBtn = document.getElementById('saveBtn');
const messageDiv = document.getElementById('message');
const connectionStatus = document.getElementById('connectionStatus');
const adminLink = document.getElementById('adminLink');

// Обновить отображение значения громкости
audioVolumeInput.addEventListener('input', () => {
  volumeValue.textContent = `${audioVolumeInput.value}%`;
});

chrome.storage.sync.get(['serverUrl', 'syncOffset', 'audioVolume'], (result) => {
  if (result.serverUrl) {
    serverUrlInput.value = result.serverUrl;
  } else {
    serverUrlInput.value = 'http://localhost:5000';
  }
  
  if (result.syncOffset !== undefined) {
    syncOffsetInput.value = result.syncOffset;
  } else {
    syncOffsetInput.value = 0;
  }
  
  if (result.audioVolume !== undefined) {
    audioVolumeInput.value = result.audioVolume;
    volumeValue.textContent = `${result.audioVolume}%`;
  } else {
    audioVolumeInput.value = 100;
    volumeValue.textContent = '100%';
  }
  
  checkServerStatus();
});

saveBtn.addEventListener('click', () => {
  const serverUrl = serverUrlInput.value.trim();
  const syncOffset = parseFloat(syncOffsetInput.value) || 0;
  const audioVolume = parseInt(audioVolumeInput.value) || 100;
  
  if (!serverUrl) {
    showMessage('Введите адрес сервера', 'error');
    return;
  }
  
  chrome.storage.sync.set({ serverUrl, syncOffset, audioVolume }, () => {
    showMessage('Сохранено!', 'success');
    checkServerStatus();
  });
});

adminLink.addEventListener('click', (e) => {
  e.preventDefault();
  const serverUrl = serverUrlInput.value.trim();
  if (serverUrl) {
    chrome.tabs.create({ url: `${serverUrl}/admin` });
  }
});

async function checkServerStatus() {
  const serverUrl = serverUrlInput.value.trim();
  
  if (!serverUrl) {
    connectionStatus.innerHTML = '<span class="status-offline">● Не настроено</span>';
    return;
  }
  
  try {
    const response = await fetch(`${serverUrl}/api/status`);
    
    if (response.ok) {
      const data = await response.json();
      
      const statusDiv = document.getElementById('status');
      statusDiv.innerHTML = `
        <div class="status-item">
          <span class="status-label">Подключение:</span>
          <span class="status-value status-online">● Онлайн</span>
        </div>
        <div class="status-item">
          <span class="status-label">Записей:</span>
          <span class="status-value">${data.active_recordings}/${data.total_recordings}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Стримеров:</span>
          <span class="status-value">${data.monitored_streamers.length}</span>
        </div>
      `;
    } else {
      throw new Error('Server error');
    }
  } catch (error) {
    connectionStatus.innerHTML = '<span class="status-offline">● Офлайн</span>';
  }
}

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 3000);
}

checkServerStatus();
setInterval(checkServerStatus, 10000);

