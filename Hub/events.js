document.addEventListener('DOMContentLoaded', function() {
    const allEventsUl = document.getElementById('allEventsUl');
    let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};

    function renderAllEvents() {
        allEventsUl.innerHTML = ''; // Limpa a lista antes de renderizar

        if (Object.keys(events).length === 0) {
            allEventsUl.innerHTML = '<li>Nenhum evento agendado.</li>';
            return;
        }

        // Ordena as datas antes de exibi-las
        const sortedDates = Object.keys(events).sort((a, b) => new Date(a) - new Date(b));

        for (const dateStr of sortedDates) {
            const eventDate = new Date(dateStr + 'T00:00:00');
            const event = events[dateStr];
            
            const li = document.createElement('li');
            li.classList.add('event-item'); // Usa a mesma classe para o estilo

            const eventText = document.createElement('span');
            eventText.textContent = `${eventDate.toLocaleDateString('pt-BR')}: ${event.title} (Adicionado por: ${event.user})`;

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-event-btn');
            deleteBtn.innerHTML = '<span class="material-symbols-outlined">delete</span>';
            deleteBtn.setAttribute('data-date', dateStr); // Armazena a data no botão

            deleteBtn.onclick = () => {
                if (confirm(`Tem certeza que deseja excluir o evento: "${event.title}"?`)) {
                    delete events[dateStr];
                    localStorage.setItem('calendarEvents', JSON.stringify(events));
                    renderAllEvents(); // Re-renderiza a lista
                }
            };

            li.appendChild(eventText);
            li.appendChild(deleteBtn);
            allEventsUl.appendChild(li);
        }
    }

    renderAllEvents();
});