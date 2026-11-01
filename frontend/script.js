let isWaiting = false;

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

async function sendMessage() {
    if (isWaiting) return;

    const input = document.getElementById('userInput');
    const chatBox = document.getElementById('chatBox');
    const rawText = input.value.trim();
    if (!rawText) return;

    if (rawText.length > 1500) {
        alert('Сообщение слишком длинное (максимум 1500 символов)!');
        return;
    }

    chatBox.innerHTML += `<div class="message user">${escapeHtml(rawText)}</div>`;
    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    isWaiting = true;

    try {
        const response = await fetch('http://localhost:8000/api/xaeros', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: rawText, action: 'chat' })
        });

        if (response.status === 429) {
            chatBox.innerHTML += `<div class="message ai">[!] Слишком много запросов. Сработала защита от спама. Подождите минуту.</div>`;
            return;
        }

        const data = await response.json();
        chatBox.innerHTML += `<div class="message ai">${escapeHtml(data.response)}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (e) {
        chatBox.innerHTML += `<div class="message ai">[!] Ошибка соединения с защищенным бэкендом. Запущен ли сервер?</div>`;
    } finally {
        isWaiting = false;
    }
}

function handleKeyPress(e) {
    if (e.key === 'Enter' && !isWaiting) sendMessage();
}
