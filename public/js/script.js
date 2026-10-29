const form = document.getElementById('entry-form');
const idInput = document.getElementById('entry-id');
const titleInput = document.getElementById('title');
const dateInput = document.getElementById('entry-date');
const moodSelect = document.getElementById('mood');
const contentInput = document.getElementById('content');
const formTitle = document.getElementById('form-title');
const cancelBtn = document.getElementById('cancel-btn');
const searchInput = document.getElementById('search');
const filterMood = document.getElementById('filter-mood');
const entriesEl = document.getElementById('entries');

let entries = [];

function today() {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
}

async function api(url, options) {
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
    return res.status === 204 ? null : res.json();
}

async function loadMoods() {
    const moods = await api('/api/moods');
    for (const m of moods) {
        const label = `${m.emoji} ${m.name}`;
        moodSelect.add(new Option(label, m.mood_id));
        filterMood.add(new Option(label, m.mood_id));
    }
}

async function loadEntries() {
    const params = new URLSearchParams();
    if (searchInput.value.trim()) params.set('q', searchInput.value.trim());
    if (filterMood.value) params.set('mood', filterMood.value);
    entries = await api(`/api/entries?${params}`);
    render();
}

function render() {
    if (!entries.length) {
        entriesEl.innerHTML = '<p class="empty">No entries yet.</p>';
        return;
    }
    entriesEl.innerHTML = entries.map(e => `
        <article class="entry">
            <h3>${escapeHtml(e.title)}</h3>
            <div class="meta">${e.entry_date}${e.mood_name ? ` · ${e.mood_emoji} ${escapeHtml(e.mood_name)}` : ''}</div>
            <p>${escapeHtml(e.content)}</p>
            <div class="actions">
                <button data-edit="${e.entry_id}">Edit</button>
                <button data-delete="${e.entry_id}" class="danger">Delete</button>
            </div>
        </article>`).join('');
}

function resetForm() {
    form.reset();
    idInput.value = '';
    dateInput.value = today();
    formTitle.textContent = 'New entry';
    cancelBtn.hidden = true;
}

form.addEventListener('submit', async ev => {
    ev.preventDefault();
    const body = JSON.stringify({
        title: titleInput.value,
        content: contentInput.value,
        mood_id: moodSelect.value || null,
        entry_date: dateInput.value,
    });
    try {
        if (idInput.value) await api(`/api/entries/${idInput.value}`, { method: 'PUT', body });
        else await api('/api/entries', { method: 'POST', body });
        resetForm();
        await loadEntries();
    } catch (err) {
        alert(err.message);
    }
});

entriesEl.addEventListener('click', async ev => {
    const editId = ev.target.dataset.edit;
    const delId = ev.target.dataset.delete;
    if (editId) {
        const e = entries.find(x => String(x.entry_id) === editId);
        idInput.value = e.entry_id;
        titleInput.value = e.title;
        dateInput.value = e.entry_date;
        moodSelect.value = e.mood_id || '';
        contentInput.value = e.content;
        formTitle.textContent = 'Edit entry';
        cancelBtn.hidden = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (delId && confirm('Delete this entry?')) {
        try {
            await api(`/api/entries/${delId}`, { method: 'DELETE' });
            await loadEntries();
        } catch (err) {
            alert(err.message);
        }
    }
});

cancelBtn.addEventListener('click', resetForm);
searchInput.addEventListener('input', loadEntries);
filterMood.addEventListener('change', loadEntries);

(async () => {
    resetForm();
    await loadMoods();
    await loadEntries();
})();
