// Twitch Audio Recorder - Background Script

// Пока пустой, но может быть использован для фоновых задач
console.log('Twitch Audio Recorder extension loaded');

// Можно добавить обработку сообщений от content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getServerStatus') {
    // Проверить статус сервера
    fetch('http://localhost:5000/api/status')
      .then(response => response.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Асинхронный ответ
  }
});

