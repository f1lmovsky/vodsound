# 🎵 VODSound

<div align="center">

**Слушайте полную звуковую дорожку Twitch VOD, как на живой трансляции**

*Listen to complete Twitch VOD audio, just like in a live broadcast*

---

[Установка](#-установка) • [Использование](#-использование) • [FAQ](#-faq)

</div>

---

## 🌍 Описание / Description

### 🇷🇺 Русский

Расширение для браузера, позволяющее слышать **полноценную звуковую дорожку** как на трансляции, без вырезанного аудио.

**Проблема:** На VOD записях Twitch часто вырезают музыку из-за авторских прав.  
**Решение:** VODSound воспроизводит оригинальную запись звука с момента трансляции.

### 🇬🇧 English

This browser extension allows you to hear **complete audio information**, just like in a live broadcast, without any sound being cut out.

**Problem:** Twitch VOD recordings often have music muted due to copyright.  
**Solution:** VODSound plays the original audio recorded during the live stream.

---

## 📥 Установка / Installation

### 🇷🇺 Инструкция (Russian)

1. **Скачайте папку** [`extension`](https://github.com/your-repo/vodsound/releases) 📁

2. **Откройте браузер** и перейдите в **Расширения**:
   - Chrome: `chrome://extensions/`
   - Opera: `opera://extensions/`
   - Edge: `edge://extensions/`

3. **Включите "Режим разработчика"** (переключатель в правом верхнем углу) 🔧

4. **Установите расширение** одним из способов:
   - 🖱️ **Перетащите папку** `extension` в окно браузера
   - 📂 **ИЛИ** нажмите "Загрузить распакованное расширение" и выберите папку

5. **Разрешите подключение к серверу**:
   - Откройте в браузере: https://89.111.155.235
   - ⚠️ Браузер скажет что "Подключение не безопасно"
   - Нажмите **"Перейти на сайт"** / **"Открыть в любом случае"**

6. **Настройте расширение**:
   - Откройте расширение (иконка 🎵 в панели инструментов)
   - В поле **"Адрес сервера"** вставьте: `https://89.111.155.235`
   - Нажмите **"Сохранить"**

7. ✅ **Готово!** Расширение установлено и настроено.

---

### 🇬🇧 Instructions (English)

1. **Download** the [`extension`](https://github.com/your-repo/vodsound/releases) folder 📁

2. **Open your browser** and go to **Extensions**:
   - Chrome: `chrome://extensions/`
   - Opera: `opera://extensions/`
   - Edge: `edge://extensions/`

3. **Enable "Developer mode"** (toggle in the top right corner) 🔧

4. **Install the extension** using one of these methods:
   - 🖱️ **Drag and drop** the `extension` folder into the browser window
   - 📂 **OR** click "Load unpacked extension" and select the folder

5. **Allow server connection**:
   - Open in browser: https://89.111.155.235
   - ⚠️ Browser will say "Connection is not secure"
   - Click **"Visit this site anyway"** / **"Proceed to site"**

6. **Configure the extension**:
   - Open the extension (🎵 icon in the toolbar)
   - In the **"Server URL"** field, paste: `https://89.111.155.235`
   - Click **"Save"**

7. ✅ **Done!** Extension is installed and configured.

---

## 🎮 Использование / Usage

### 🇷🇺 Как пользоваться

1. **Откройте VOD** на Twitch (страница с записью трансляции)
2. **Найдите кнопку** `🎵 Записанное аудио` в плеере
3. **Нажмите** на неё - оригинальная звуковая дорожка включится
4. **Используйте кнопку** `🔄 Синхр` если звук рассинхронизировался

**Дополнительные настройки:**
- 🔊 **Громкость** - регулировка громкости записанного звука (0-100%)
- ⏱️ **Корректировка синхронизации** - если звук отстаёт или опережает видео (-10 до +10 секунд)

---

### 🇬🇧 How to use

1. **Open a VOD** on Twitch (recorded stream page)
2. **Find the button** `🎵 Recorded Audio` in the player
3. **Click it** - original audio track will start playing
4. **Use the button** `🔄 Sync` if audio gets out of sync

**Additional settings:**
- 🔊 **Volume** - adjust recorded audio volume (0-100%)
- ⏱️ **Sync adjustment** - if audio lags or leads the video (-10 to +10 seconds)

---

## ❓ FAQ

<details>
<summary><b>🇷🇺 Расширение не работает</b></summary>

- ✅ Проверьте что вы открыли https://89.111.155.235 и разрешили подключение
- ✅ Убедитесь что в настройках расширения указан правильный адрес
- ✅ Откройте консоль браузера (F12) и посмотрите на ошибки
- ✅ Проверьте что для данного VOD есть запись
</details>

<details>
<summary><b>🇬🇧 Extension doesn't work</b></summary>

- ✅ Check that you opened https://89.111.155.235 and allowed the connection
- ✅ Make sure the server URL is correct in extension settings
- ✅ Open browser console (F12) and check for errors
- ✅ Verify that a recording exists for this VOD
</details>

<details>
<summary><b>🇷🇺 Нет звука</b></summary>

- 🔊 Проверьте громкость в настройках расширения
- 🔄 Нажмите кнопку "Синхр"
- ⏸️ Поставьте видео на паузу и снова включите
</details>

<details>
<summary><b>🇬🇧 No sound</b></summary>

- 🔊 Check volume in extension settings
- 🔄 Press the "Sync" button
- ⏸️ Pause and resume the video
</details>

<details>
<summary><b>🇷🇺 Звук не синхронизирован</b></summary>

- 🔄 Нажмите кнопку "Синхр" в плеере
- ⏱️ Используйте настройку "Корректировка синхронизации"
  - Положительное значение - звук позже
  - Отрицательное значение - звук раньше
</details>

<details>
<summary><b>🇬🇧 Audio is out of sync</b></summary>

- 🔄 Press the "Sync" button in the player
- ⏱️ Use the "Sync adjustment" setting
  - Positive value - audio later
  - Negative value - audio earlier
</details>

<details>
<summary><b>🇷🇺 Почему "Подключение не безопасно"?</b></summary>

Сервер использует самоподписанный SSL сертификат. Это безопасно для личного использования, но браузер предупреждает об этом. Просто нажмите "Перейти на сайт".
</details>

<details>
<summary><b>🇬🇧 Why "Connection is not secure"?</b></summary>

The server uses a self-signed SSL certificate. This is safe for personal use, but the browser warns about it. Just click "Proceed to site".
</details>

---

## 🔄 Обновление / Update

При выходе новой версии:

1. Скачайте новую папку `extension`
2. Удалите старое расширение в `chrome://extensions/`
3. Установите новую версию (см. [Установка](#-установка))

*When a new version is released, download the new `extension` folder, remove the old extension, and install the new one.*

---

## ⚠️ Дисклеймер / Disclaimer

**🇷🇺** Этот проект предназначен для личного использования. Убедитесь что у вас есть право на использование контента. Соблюдайте правила Twitch и авторские права.

**🇬🇧** This project is for personal use. Make sure you have the right to use the content. Follow Twitch rules and copyright laws.

---

<div align="center">

**Версия / Version:** 1.0.0  
**Дата / Date:** Декабрь / December 2025

Made with 🎵 for Twitch VOD lovers

</div>
