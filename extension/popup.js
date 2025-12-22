// Константа с адресом сервера
const SERVER_URL = 'https://live-anistream.ru';

const syncOffsetInput = document.getElementById('syncOffset');
const audioVolumeInput = document.getElementById('audioVolume');
const volumeValue = document.getElementById('volumeValue');
const suggestStreamerInput = document.getElementById('suggestStreamer');
const suggestBtn = document.getElementById('suggestBtn');
const messageDiv = document.getElementById('message');
const connectionStatus = document.getElementById('connectionStatus');

// Загрузить сохраненные настройки
chrome.storage.sync.get(['syncOffset', 'audioVolume'], (result) => {
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

// Автосохранение при изменении громкости
audioVolumeInput.addEventListener('input', () => {
  const audioVolume = parseInt(audioVolumeInput.value);
  volumeValue.textContent = `${audioVolume}%`;
  chrome.storage.sync.set({ audioVolume });
});

// Автосохранение при изменении синхронизации
syncOffsetInput.addEventListener('change', () => {
  const syncOffset = parseFloat(syncOffsetInput.value) || 0;
  chrome.storage.sync.set({ syncOffset });
  showMessage('Настройки сохранены', 'success');
});

// Предложить стримера
suggestBtn.addEventListener('click', async () => {
  const streamerName = suggestStreamerInput.value.trim().toLowerCase();
  
  if (!streamerName) {
    showMessage('Введите имя стримера', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${SERVER_URL}/api/suggest-streamer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ channel: streamerName })
    });
    
    if (response.ok) {
      showMessage('Предложение отправлено!', 'success');
      suggestStreamerInput.value = '';
    } else {
      const data = await response.json();
      showMessage(data.error || 'Ошибка отправки', 'error');
    }
  } catch (error) {
    showMessage('Ошибка соединения с сервером', 'error');
  }
});

// Проверка статуса сервера
async function checkServerStatus() {
  try {
    const response = await fetch(`${SERVER_URL}/api/status`);
    
    if (response.ok) {
      const data = await response.json();
      
      const statusDiv = document.getElementById('status');
      statusDiv.innerHTML = `
        <div class="status-item">
          <span class="status-label">Подключение:</span>
          <span class="status-value status-online">● Онлайн</span>
        </div>
        <div class="status-item">
          <span class="status-label">Активных записей:</span>
          <span class="status-value">${data.active_recordings}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Всего в архиве:</span>
          <span class="status-value">${data.total_recordings}</span>
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

// Периодическая проверка статуса
checkServerStatus();
setInterval(checkServerStatus, 10000);
