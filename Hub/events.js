document.addEventListener('DOMContentLoaded', function() {
    const allEventsUl = document.getElementById('allEventsUl');
    const events = JSON.parse(localStorage.getItem('calendarEvents')) || {};

    if (Object.keys(events).length === 0) {
        allEventsUl.innerHTML = '<li>Nenhum evento agendado.</li>';
        return;
    }

    const sortedDates = Object.keys(events).sort();

    for (const dateStr of sortedDates) {
        const eventDate = new Date(dateStr + 'T00:00:00');
        const event = events[dateStr];
        const li = document.createElement('li');
        li.textContent = `${eventDate.toLocaleDateString('pt-BR')}: ${event.title} (Adicionado por: ${event.user})`;
        allEventsUl.appendChild(li);
    }
});