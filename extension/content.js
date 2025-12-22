// Twitch Audio Recorder - Content Script

// Константа с адресом сервера
const SERVER_URL = 'https://live-anistream.ru';

let customAudioEnabled = false;
let customAudioElement = null;
let originalVideo = null;
let recordingInfo = null;
let syncOffset = 0; // Ручная корректировка синхронизации (в секундах)
let audioVolume = 100; // Громкость записанного аудио (0-100)

// Получить VOD ID из URL
function getVodId() {
  const match = window.location.pathname.match(/\/videos\/(\d+)/);
  return match ? match[1] : null;
}

// Получить информацию о VOD через Twitch API (из страницы)
function getVodInfo() {
  // Попытаться получить информацию из DOM
  const channelElement = document.querySelector('a[data-a-target="user-channel-header-item"]');
  const channel = channelElement ? channelElement.textContent.trim() : null;
  
  // Попытаться получить дату из страницы
  const dateElement = document.querySelector('p[data-a-target="player-seekbar-stream-time"]');
  let vodDate = null;
  
  if (dateElement) {
    const dateText = dateElement.textContent;
    // Парсинг даты (формат может отличаться)
    vodDate = new Date().toISOString(); // Временное решение
  }
  
  return { channel, vodDate };
}

// Поиск записи на сервере
async function findRecording(vodId) {
  try {
    // Сначала пробуем по VOD ID
    console.log(`[TAR] Поиск записи по VOD ID: ${vodId}`);
    let response = await fetch(`${SERVER_URL}/api/recording/by-vod/${vodId}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('[TAR] Запись найдена по VOD ID:', data);
      return data;
    }
    
    // Fallback: поиск по дате и каналу
    console.log('[TAR] Запись не найдена по VOD ID, пробуем по дате...');
    const vodInfo = getVodInfo();
    
    if (vodInfo.channel && vodInfo.vodDate) {
      response = await fetch(
        `${SERVER_URL}/api/recording/by-date?channel=${vodInfo.channel}&date=${vodInfo.vodDate}`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('[TAR] Запись найдена по дате:', data);
        return data;
      }
    }
    
    console.log('[TAR] Запись не найдена');
    return null;
    
  } catch (error) {
    console.error('[TAR] Ошибка поиска записи:', error);
    return null;
  }
}

// Создать UI кнопку
function createToggleButton() {
  const button = document.createElement('button');
  button.id = 'tar-toggle-button';
  button.className = 'tar-button';
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path fill="currentColor" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-9v4l3.5 2 .5-.9-3-1.6V7H9z"/>
    </svg>
    <span>Записанное аудио</span>
  `;
  button.disabled = true;
  button.title = 'Загрузка...';
  
  button.addEventListener('click', toggleCustomAudio);
  
  // Вставить кнопку в контроллы плеера
  const insertButton = () => {
    const controls = document.querySelector('.player-controls__right-control-group');
    if (controls && !document.getElementById('tar-toggle-button')) {
      controls.insertBefore(button, controls.firstChild);
      return true;
    }
    return false;
  };
  
  // Попробовать вставить сразу или подождать загрузки
  if (!insertButton()) {
    const observer = new MutationObserver(() => {
      if (insertButton()) {
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  return button;
}

// Переключить пользовательское аудио
function toggleCustomAudio() {
  if (!recordingInfo || !originalVideo) return;
  
  customAudioEnabled = !customAudioEnabled;
  
  if (customAudioEnabled) {
    enableCustomAudio();
  } else {
    disableCustomAudio();
  }
  
  updateButtonState();
}

// Включить пользовательское аудио
function enableCustomAudio() {
  if (!originalVideo || !recordingInfo) return;
  
  // Создать аудио элемент
  if (!customAudioElement) {
    customAudioElement = document.createElement('audio');
    // Убрать /api из пути - nginx раздает файлы через /audio/
    // Убрать "recordings/" так как nginx alias уже указывает на эту директорию
    // URL-энкодить путь для корректной работы с кириллицей
    let filePath = recordingInfo.filepath.replace(/\\/g, '/');
    if (filePath.startsWith('recordings/')) {
      filePath = filePath.substring('recordings/'.length);
    }
    const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
    const audioUrl = `${SERVER_URL}/audio/${encodedPath}`;
    customAudioElement.src = audioUrl;
    customAudioElement.preload = 'auto';
    customAudioElement.volume = audioVolume / 100; // Применить громкость (0-1)
    console.log('[TAR] Audio URL:', audioUrl);
    console.log('[TAR] Громкость установлена:', audioVolume, '%');
  }
  
  // Отключить звук оригинального видео
  originalVideo.muted = true;
  
  // Синхронизировать с видео
  syncAudioWithVideo();
  
  // Добавить обработчики событий
  // Только контроль play/pause/timeupdate, БЕЗ автосинхронизации
  originalVideo.addEventListener('play', onVideoPlay);
  originalVideo.addEventListener('pause', onVideoPause);
  originalVideo.addEventListener('ratechange', onVideoRateChange);
  originalVideo.addEventListener('timeupdate', onTimeUpdate);
  
  // Добавить визуальный индикатор на таймлайн
  addTimelineIndicator();
  
  // Добавить кнопку ручной синхронизации
  addSyncButton();
  
  console.log('[TAR] Пользовательское аудио включено');
}

// Отключить пользовательское аудио
function disableCustomAudio() {
  if (!originalVideo) return;
  
  // Включить звук оригинального видео
  originalVideo.muted = false;
  
  // Остановить пользовательское аудио
  if (customAudioElement) {
    customAudioElement.pause();
  }
  
  // Удалить обработчики
  originalVideo.removeEventListener('play', onVideoPlay);
  originalVideo.removeEventListener('pause', onVideoPause);
  originalVideo.removeEventListener('seeked', onVideoSeeked);
  originalVideo.removeEventListener('ratechange', onVideoRateChange);
  originalVideo.removeEventListener('timeupdate', onTimeUpdate);
  
  // Удалить индикатор с таймлайна
  removeTimelineIndicator();
  
  // Удалить кнопку синхронизации
  removeSyncButton();
  
  console.log('[TAR] Пользовательское аудио отключено');
}

// Синхронизация аудио с видео с учетом offset
function syncAudioWithVideo(forceLog = false) {
  if (!customAudioElement || !originalVideo || !recordingInfo) return;
  
  const offset = recordingInfo.offset_seconds || 0;
  const duration = recordingInfo.duration_seconds || Infinity;
  
  // Вычислить позицию в аудио с учетом offset и ручной корректировки
  const videoTime = originalVideo.currentTime;
  const audioTime = videoTime - offset + syncOffset; // Применить ручную корректировку
  
  // Проверить что мы в пределах записанного фрагмента
  if (audioTime >= 0 && audioTime <= duration) {
    // Проверить что аудио готово к перемотке
    if (customAudioElement.readyState >= 2) { // HAVE_CURRENT_DATA или выше
      const oldAudioTime = customAudioElement.currentTime;
      const timeDiff = Math.abs(audioTime - oldAudioTime);
      
      // Логировать только значительные изменения (>5 секунд) или принудительно
      if (timeDiff > 5 || forceLog) {
        console.log(`[TAR] Sync: video=${videoTime.toFixed(1)}s → audio=${oldAudioTime.toFixed(1)}s→${audioTime.toFixed(1)}s (Δ=${timeDiff.toFixed(1)}s, correction=${syncOffset.toFixed(1)}s)`);
      }
      
      customAudioElement.currentTime = audioTime;
      customAudioElement.playbackRate = originalVideo.playbackRate;
      
      if (!originalVideo.paused) {
        customAudioElement.play().catch(e => {
          console.error('[TAR] Ошибка воспроизведения аудио:', e);
        });
      }
    } else {
      // Попробовать еще раз через 100ms (без лога для уменьшения спама)
      setTimeout(() => syncAudioWithVideo(), 100);
    }
  } else {
    // Вне диапазона записи - пауза
    if (forceLog) {
      console.log(`[TAR] Вне диапазона записи (audioTime=${audioTime.toFixed(1)}s), пауза`);
    }
    customAudioElement.pause();
  }
}

// Добавить кнопку ручной синхронизации
function addSyncButton() {
  // Удалить старую кнопку если есть
  removeSyncButton();
  
  const button = document.createElement('button');
  button.id = 'tar-sync-button';
  button.className = 'tar-button tar-sync-btn';
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 20 20" style="vertical-align: middle;">
      <path fill="currentColor" d="M10 2c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8h2c0 3.3 2.7 6 6 6s6-2.7 6-6-2.7-6-6-6V6l-4-3 4-3v2z"/>
    </svg>
    <span style="margin-left: 4px;">Синхр</span>
  `;
  button.title = 'Ручная синхронизация аудио';
  
  button.addEventListener('click', () => {
    if (customAudioEnabled && customAudioElement && originalVideo) {
      console.log('[TAR] Ручная синхронизация...');
      syncAudioWithVideo(true); // forceLog = true
      
      // Показать визуальную обратную связь
      button.style.background = '#00f593';
      setTimeout(() => {
        button.style.background = '';
      }, 300);
    }
  });
  
  // Вставить кнопку рядом с кнопкой toggle
  const toggleButton = document.getElementById('tar-toggle-button');
  if (toggleButton && toggleButton.parentNode) {
    toggleButton.parentNode.insertBefore(button, toggleButton.nextSibling);
  }
}

function removeSyncButton() {
  const button = document.getElementById('tar-sync-button');
  if (button) {
    button.remove();
  }
}

// Обработчики событий видео
function onVideoPlay() {
  if (customAudioElement && customAudioEnabled) {
    // Просто запустить аудио без пересинхронизации
    customAudioElement.play().catch(console.error);
  }
}

function onVideoPause() {
  if (customAudioElement && customAudioEnabled) {
    customAudioElement.pause();
  }
}

function onVideoRateChange() {
  if (customAudioElement && customAudioEnabled) {
    // Синхронизировать только скорость воспроизведения
    customAudioElement.playbackRate = originalVideo.playbackRate;
  }
}

function onTimeUpdate() {
  if (customAudioElement && customAudioEnabled && recordingInfo) {
    const offset = recordingInfo.offset_seconds || 0;
    const duration = recordingInfo.duration_seconds || Infinity;
    const videoTime = originalVideo.currentTime;
    const audioTime = videoTime - offset + syncOffset; // Применить ручную корректировку
    
    // Проверять что мы в пределах записи
    if (audioTime < 0 || audioTime > duration) {
      if (!customAudioElement.paused) {
        customAudioElement.pause();
      }
    } else {
      if (customAudioElement.paused && !originalVideo.paused) {
        customAudioElement.play().catch(console.error);
      }
    }
  }
}

// Обновить состояние кнопки
function updateButtonState() {
  const button = document.getElementById('tar-toggle-button');
  if (!button) return;
  
  if (recordingInfo) {
    button.disabled = false;
    
    if (customAudioEnabled) {
      button.classList.add('active');
      button.title = 'Отключить записанное аудио';
    } else {
      button.classList.remove('active');
      button.title = 'Включить записанное аудио';
    }
  } else {
    button.disabled = true;
    button.title = 'Запись не найдена';
  }
}

// Найти видео элемент
function findVideoElement() {
  return document.querySelector('video');
}

// Инициализация
async function initialize() {
  const vodId = getVodId();
  if (!vodId) {
    console.log('[TAR] Не удалось определить VOD ID');
    return;
  }
  
  console.log('[TAR] VOD ID:', vodId);
  
  // Найти видео элемент
  const findVideo = () => {
    originalVideo = findVideoElement();
    if (originalVideo) {
      console.log('[TAR] Видео элемент найден');
      return true;
    }
    return false;
  };
  
  if (!findVideo()) {
    // Подождать загрузки видео
    const observer = new MutationObserver(() => {
      if (findVideo()) {
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  // Создать кнопку
  createToggleButton();
  
  // Поискать запись
  recordingInfo = await findRecording(vodId);
  
  if (recordingInfo) {
    console.log('[TAR] Запись найдена:', recordingInfo);
  } else {
    console.log('[TAR] Запись не найдена для VOD:', vodId);
  }
  
  updateButtonState();
}

// Загрузить настройки из storage
try {
  chrome.storage.sync.get(['syncOffset', 'audioVolume'], (result) => {
    if (result.syncOffset !== undefined) {
      syncOffset = parseFloat(result.syncOffset) || 0;
      console.log('[TAR] Корректировка синхронизации:', syncOffset, 'сек');
    }
    
    if (result.audioVolume !== undefined) {
      audioVolume = parseInt(result.audioVolume) || 100;
      console.log('[TAR] Громкость аудио:', audioVolume, '%');
    }
    
    initialize();
  });
  
  // Слушать изменения настроек
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      // Обновление корректировки синхронизации
      if (changes.syncOffset) {
        const oldValue = changes.syncOffset.oldValue || 0;
        const newValue = parseFloat(changes.syncOffset.newValue) || 0;
        syncOffset = newValue;
        console.log(`[TAR] Корректировка обновлена: ${oldValue}с → ${newValue}с`);
        
        // Пересинхронизировать если воспроизводится
        if (customAudioEnabled && customAudioElement && originalVideo) {
          console.log('[TAR] Применение новой корректировки...');
          syncAudioWithVideo(true); // forceLog = true
        }
      }
      
      // Обновление громкости
      if (changes.audioVolume) {
        const oldValue = changes.audioVolume.oldValue || 100;
        const newValue = parseInt(changes.audioVolume.newValue) || 100;
        audioVolume = newValue;
        console.log(`[TAR] Громкость обновлена: ${oldValue}% → ${newValue}%`);
        
        // Применить к аудио элементу если воспроизводится
        if (customAudioElement) {
          customAudioElement.volume = audioVolume / 100;
        }
      }
    }
  });
} catch (error) {
  console.error('[TAR] Ошибка загрузки настроек:', error);
  initialize();
}

// Добавить визуальный индикатор на таймлайн
function addTimelineIndicator() {
  if (!recordingInfo || !originalVideo) return;
  
  const offset = recordingInfo.offset_seconds || 0;
  const duration = recordingInfo.duration_seconds || originalVideo.duration;
  const videoDuration = originalVideo.duration;
  
  // Найти прогресс бар
  const progressBar = document.querySelector('.seekbar-bar');
  if (!progressBar) return;
  
  // Удалить старый индикатор если есть
  removeTimelineIndicator();
  
  // Создать индикатор
  const indicator = document.createElement('div');
  indicator.id = 'tar-timeline-indicator';
  indicator.style.cssText = `
    position: absolute;
    top: 0;
    height: 100%;
    background: rgba(145, 71, 255, 0.4);
    pointer-events: none;
    z-index: 1;
    left: ${(offset / videoDuration) * 100}%;
    width: ${(duration / videoDuration) * 100}%;
  `;
  
  progressBar.style.position = 'relative';
  progressBar.appendChild(indicator);
}

function removeTimelineIndicator() {
  const indicator = document.getElementById('tar-timeline-indicator');
  if (indicator) {
    indicator.remove();
  }
}

// Слушать изменения URL (для SPA навигации)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (url.includes('/videos/')) {
      // Очистить предыдущее состояние
      if (customAudioEnabled) {
        disableCustomAudio();
      }
      customAudioEnabled = false;
      customAudioElement = null;
      recordingInfo = null;
      removeTimelineIndicator();
      
      // Переинициализировать
      initialize();
    }
  }
}).observe(document, { subtree: true, childList: true });

