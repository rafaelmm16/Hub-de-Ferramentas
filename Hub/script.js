document.addEventListener('DOMContentLoaded', function() {
    // --- Variáveis Globais e Estado ---
    let currentDate = new Date();
    let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
    let selectedDate = null;
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    // --- Elementos do DOM ---
    const menuButton = document.getElementById('menuButton');
    const sideMenu = document.getElementById('sideMenu');
    const mainContent = document.getElementById('mainContent');
    const monthYearElement = document.getElementById('monthYear');
    const calendarGrid = document.getElementById('calendarGrid');
    const prevMonthButton = document.getElementById('prevMonth');
    const nextMonthButton = document.getElementById('nextMonth');
    const eventsUl = document.getElementById('eventsUl');

    // --- Elementos do Modal de Evento ---
    const eventModal = document.getElementById('eventModal');
    const closeModal = document.getElementById('closeModal');
    const saveEventButton = document.getElementById('saveEvent');
    const deleteEventButton = document.getElementById('deleteEvent');
    const eventDateElement = document.getElementById('eventDate');
    const eventTitleInput = document.getElementById('eventTitle');

    // --- Elementos de Login ---
    const welcomeMessage = document.getElementById('welcomeMessage');
    const loginLogoutButton = document.getElementById('loginLogoutButton');
    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginSubmit = document.getElementById('loginSubmit');


    // --- Lógica de UI (Menu e Login) ---
    function updateLoginUI() {
        if (currentUser) {
            welcomeMessage.textContent = `Bem-vindo(a), ${currentUser.name}!`;
            loginLogoutButton.textContent = 'Logout';
        } else {
            welcomeMessage.textContent = 'Você não está logado.';
            loginLogoutButton.textContent = 'Login';
        }
        renderCalendar(); // Re-renderiza o calendário para atualizar permissões visuais
    }

    loginLogoutButton.addEventListener('click', () => {
        if (currentUser) { // Processo de Logout
            if (confirm('Tem certeza que deseja sair?')) {
                localStorage.removeItem('currentUser');
                currentUser = null;
                updateLoginUI();
            }
        } else { // Abre o modal de login
            loginModal.classList.add('show');
        }
    });
    
    closeLoginModal.addEventListener('click', () => loginModal.classList.remove('show'));
    
    loginSubmit.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username) {
            alert('Por favor, insira um nome de usuário.');
            return;
        }

        // Sistema de autenticação simples
        if (username.toLowerCase() === 'admin' && password === 'admin') {
            currentUser = { name: 'admin', role: 'admin' };
        } else if (username.toLowerCase() === 'admin' && password !== 'admin') {
            alert('Senha incorreta para o administrador.');
            return;
        } else {
            currentUser = { name: username, role: 'user' };
        }

        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateLoginUI();
        loginModal.classList.remove('show');
        usernameInput.value = '';
        passwordInput.value = '';
    });

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

            dayElement.addEventListener('click', () => {
                if (!currentUser) {
                    alert('Você precisa estar logado para adicionar ou editar eventos.');
                    return;
                }
                selectedDate = dateStr;
                openEventModal(dateStr);
            });
            calendarGrid.appendChild(dayElement);
        }
        renderEventList();
    }
    
    // --- Lógica de Eventos ---
    function openEventModal(dateStr) {
        selectedDate = dateStr;
        eventDateElement.textContent = new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
        const event = events[dateStr];

        if (event) {
            eventTitleInput.value = event.title;
            // Mostra o botão de excluir se for admin ou o dono do evento
            if (currentUser.role === 'admin' || currentUser.name === event.user) {
                deleteEventButton.style.display = 'block';
            } else {
                deleteEventButton.style.display = 'none';
            }
        } else {
            eventTitleInput.value = '';
            deleteEventButton.style.display = 'none';
        }
        eventModal.classList.add('show');
    }

    function closeEventModal() {
        eventModal.classList.remove('show');
    }

    saveEventButton.addEventListener('click', () => {
        const eventTitle = eventTitleInput.value.trim();
        
        if (!currentUser) {
            alert('Erro: nenhum usuário logado.');
            return;
        }
        
        if (eventTitle) {
            // Salva ou atualiza o evento com o nome do usuário
            events[selectedDate] = { title: eventTitle, user: currentUser.name };
        } else if (events[selectedDate]) {
            // Se o título for apagado, considera exclusão (se tiver permissão)
            const event = events[selectedDate];
             if (currentUser.role === 'admin' || currentUser.name === event.user) {
                delete events[selectedDate];
             } else {
                alert('Você não tem permissão para apagar este evento.');
             }
        }
        
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        closeEventModal();
        renderCalendar();
    });

    deleteEventButton.addEventListener('click', () => {
        const event = events[selectedDate];
        if (!selectedDate || !event) return;

        // Confirmação dupla de permissão
        if (currentUser.role !== 'admin' && currentUser.name !== event.user) {
            alert('Você não tem permissão para excluir este evento.');
            return;
        }

        if (confirm(`Tem certeza que deseja excluir o evento: "${event.title}"?`)) {
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
            
            li.appendChild(eventText);

            // Adiciona botão de excluir apenas se tiver permissão
            if (currentUser && (currentUser.role === 'admin' || currentUser.name === event.user)) {
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
                li.appendChild(deleteBtn);
            }
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
        if (event.target == eventModal || event.target == loginModal) {
            closeEventModal();
            loginModal.classList.remove('show');
        }
    });

    // Inicialização da aplicação
    updateLoginUI();
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