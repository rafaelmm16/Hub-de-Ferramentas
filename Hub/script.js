document.addEventListener('DOMContentLoaded', function() {
    // --- Variáveis Globais e Estado ---
    let currentDate = new Date();
    let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
    let selectedDate = null;

    // --- Elementos do DOM ---
    const menuButton = document.getElementById('menuButton');
    const sideMenu = document.getElementById('sideMenu');
    const mainContent = document.getElementById('mainContent');
    const monthYearElement = document.getElementById('monthYear');
    const calendarGrid = document.getElementById('calendarGrid');
    const prevMonthButton = document.getElementById('prevMonth');
    const nextMonthButton = document.getElementById('nextMonth');
    const eventModal = document.getElementById('eventModal');
    const closeModal = document.getElementById('closeModal');
    const saveEventButton = document.getElementById('saveEvent');
    const deleteEventButton = document.getElementById('deleteEvent');
    const eventDateElement = document.getElementById('eventDate');
    const eventTitleInput = document.getElementById('eventTitle');
    const eventsUl = document.getElementById('eventsUl');
    const usernameInput = document.getElementById('username');

    // Carrega o nome do usuário salvo
    usernameInput.value = localStorage.getItem('username') || '';
    usernameInput.addEventListener('input', (e) => {
        localStorage.setItem('username', e.target.value);
    });

    // --- Lógica de UI (Menu Lateral) ---
    menuButton.addEventListener('click', () => {
        sideMenu.classList.toggle('open');
        mainContent.classList.toggle('shifted');
    });

    // --- Lógica do Calendário ---
    function renderCalendar() {
        calendarGrid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        monthYearElement.textContent = `${new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(currentDate)} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarGrid.appendChild(document.createElement('div'));
        }

        for (let day = 1; day <= lastDayOfMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.textContent = day;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            if (day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
                dayElement.classList.add('today');
            }
            if (events[dateStr]) {
                dayElement.classList.add('has-event');
            }

            dayElement.addEventListener('click', () => { //
                selectedDate = dateStr;
                openEventModal(dateStr); // Chama a função que abre o modal
            });
            calendarGrid.appendChild(dayElement);
        }
        renderEventList();
    }
    
    // --- Lógica de Eventos ---
    function openEventModal(dateStr) {
        selectedDate = dateStr;
        eventDateElement.textContent = new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
        
        if (events[dateStr]) {
            eventTitleInput.value = events[dateStr].title;
            deleteEventButton.style.display = 'block';
        } else {
            eventTitleInput.value = '';
            deleteEventButton.style.display = 'none';
        }
        eventModal.style.display = 'flex';
    }

    function closeEventModal() {
        eventModal.style.display = 'none';
    }

    saveEventButton.addEventListener('click', () => {
        const eventTitle = eventTitleInput.value.trim();
        const user = usernameInput.value.trim();

        if (!user) {
            alert('Por favor, insira seu nome de usuário.');
            return;
        }

        if (eventTitle) {
            events[selectedDate] = { title: eventTitle, user: user };
        } else if (events[selectedDate]) {
            // Se o título estiver vazio, mas o evento existir, considere excluir
            delete events[selectedDate];
        }
        
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        closeEventModal();
        renderCalendar();
    });

    deleteEventButton.addEventListener('click', () => {
        if (!selectedDate || !events[selectedDate]) return;

        if (confirm(`Tem certeza que deseja excluir este evento?`)) {
            delete events[selectedDate];
            localStorage.setItem('calendarEvents', JSON.stringify(events));
            closeEventModal();
            renderCalendar();
        }
    });

    function renderEventList() {
        eventsUl.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const monthEvents = Object.keys(events)
            .filter(dateStr => {
                const eventDate = new Date(dateStr + 'T00:00:00');
                return eventDate.getFullYear() === year && eventDate.getMonth() === month;
            })
            .sort((a, b) => new Date(a) - new Date(b));

        if (monthEvents.length === 0) {
            eventsUl.innerHTML = '<li>Nenhum evento este mês.</li>';
            return;
        }

        monthEvents.forEach(dateStr => {
            const li = document.createElement('li');
            li.classList.add('event-item');
            const event = events[dateStr];
            
            const eventText = document.createElement('span');
            eventText.textContent = `${new Date(dateStr + 'T00:00:00').getDate()}: ${event.title} (por: ${event.user})`;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-event-btn');
            deleteBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">delete</span>';
            deleteBtn.onclick = () => {
                if (confirm(`Tem certeza que deseja excluir o evento: "${event.title}"?`)) {
                    delete events[dateStr];
                    localStorage.setItem('calendarEvents', JSON.stringify(events));
                    renderCalendar();
                }
            };

            li.appendChild(eventText);
            li.appendChild(deleteBtn);
            eventsUl.appendChild(li);
        });
    }

    // --- Navegação e Inicialização ---
    prevMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    closeModal.addEventListener('click', closeEventModal);
    window.addEventListener('click', (event) => {
        if (event.target == eventModal) {
            closeEventModal();
        }
    });

    renderCalendar();
});

// --- Lógica da Calculadora (permanece a mesma) ---
let resultScreen = document.getElementById('result');
function appendValue(value) { resultScreen.value += value; }
function clearScreen() { resultScreen.value = ''; }
function calculateResult() {
    try {
        resultScreen.value = eval(resultScreen.value);
    } catch (error) {
        alert('Cálculo inválido');
        clearScreen();
    }
}