document.addEventListener('DOMContentLoaded', function() {
    const allEventsUl = document.getElementById('allEventsUl');
    let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
    // Pega o usuário logado para verificar permissões
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    function renderAllEvents() {
        allEventsUl.innerHTML = ''; 

        if (Object.keys(events).length === 0) {
            allEventsUl.innerHTML = '<li>Nenhum evento agendado.</li>';
            return;
        }

        const sortedDates = Object.keys(events).sort((a, b) => new Date(a) - new Date(b));

        for (const dateStr of sortedDates) {
            const eventDate = new Date(dateStr + 'T00:00:00');
            const event = events[dateStr];
            
            const li = document.createElement('li');
            li.classList.add('event-item'); 

            const eventText = document.createElement('span');
            eventText.textContent = `${eventDate.toLocaleDateString('pt-BR')}: ${event.title} (Adicionado por: ${event.user})`;
            
            li.appendChild(eventText);

            // Adiciona o botão de deletar apenas se o usuário tiver permissão
            // (ser admin ou ser o dono do evento)
            if (currentUser && (currentUser.role === 'admin' || currentUser.name === event.user)) {
                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('delete-event-btn');
                deleteBtn.innerHTML = '<span class="material-symbols-outlined">delete</span>';
                deleteBtn.setAttribute('data-date', dateStr); 

                deleteBtn.onclick = () => {
                    if (confirm(`Tem certeza que deseja excluir o evento: "${event.title}"?`)) {
                        delete events[dateStr];
                        localStorage.setItem('calendarEvents', JSON.stringify(events));
                        renderAllEvents(); // Re-renderiza a lista
                    }
                };
                li.appendChild(deleteBtn);
            }
            
            allEventsUl.appendChild(li);
        }
    }

    renderAllEvents();
});