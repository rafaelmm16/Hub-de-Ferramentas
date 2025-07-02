document.addEventListener('DOMContentLoaded', function() {
    // --- Estado e Variáveis ---
    const tabelaCorpo = document.querySelector('.tabela-corpo');
    const modal = document.getElementById('agendaModal');
    const closeModal = document.getElementById('closeAgendaModal');
    const saveButton = document.getElementById('saveAgenda');
    const deleteButton = document.getElementById('deleteAgenda');

    let agendamentos = JSON.parse(localStorage.getItem('salaAgendamentos')) || {};
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let celulaSelecionada = null; // Armazena a célula clicada

    const salas = [
        "A1 - Laboratório", "A6 - Sala de Aula", "A9 - Sala Multiuso", "B1 - Sala de Aula",
        "B2 - Sala de Aula", "B3 - Sala de Aula", "B4 - Sala de Aula", "B5 - Sala de Aula",
        "C1 - Auditório", "C2 - Sala de Aula", "C3 - Sala de Aula", "C4 - Sala de Aula",
        "Lab. Info. 1 (A2)", "Lab. Info. 2 (G5)", "Lab. Info. 3 (A6)", "Lab. Info. 4 (B7)",
    ];
    const periodos = 17; // 1M a 5N (total de 17 colunas de horário)

    // --- Funções Principais ---

    function renderizarTabela() {
        tabelaCorpo.innerHTML = ''; // Limpa a tabela

        salas.forEach((nomeSala, indexSala) => {
            const tr = document.createElement('tr');
            
            const tdSala = document.createElement('td');
            tdSala.className = 'sala';
            tdSala.textContent = nomeSala;
            tr.appendChild(tdSala);

            for (let i = 1; i <= periodos; i++) {
                const td = document.createElement('td');
                const idCelula = `${indexSala}-${i}`; // ID único: "indiceSala-indicePeriodo"
                
                td.id = idCelula;
                td.dataset.sala = nomeSala;
                td.dataset.periodo = i;
                
                const agendamento = agendamentos[idCelula];

                if (agendamento) {
                    td.className = 'cartao cartao-agendado';
                    td.textContent = agendamento.motivo;
                    td.title = `Agendado por: ${agendamento.user}`;
                    if(currentUser && currentUser.name === agendamento.user) {
                        td.classList.add('meu-agendamento');
                    }
                } else {
                    td.className = 'cartao cartao-livre';
                    td.innerHTML = '<a style="opacity: 0;">Novo</a>';
                }
                
                td.addEventListener('click', () => onCelulaClick(td));
                tr.appendChild(td);
            }
            tabelaCorpo.appendChild(tr);
        });
    }

    function onCelulaClick(celula) {
        if (!currentUser) {
            alert('Você precisa estar logado para fazer um agendamento.');
            return;
        }

        celulaSelecionada = celula;
        const id = celula.id;
        const agendamento = agendamentos[id];

        document.getElementById('modalSala').textContent = celula.dataset.sala;
        document.getElementById('modalHorario').textContent = `Período ${celula.dataset.periodo}`;

        if (agendamento) { // Se já existe um agendamento
            // Só pode editar/excluir se for o dono ou admin
            if (currentUser.role === 'admin' || currentUser.name === agendamento.user) {
                document.getElementById('agendaMotivo').value = agendamento.motivo;
                deleteButton.style.display = 'block';
                modal.classList.add('show');
            } else {
                alert('Este horário já está reservado por outro usuário.');
            }
        } else { // Se a célula está livre
            document.getElementById('agendaMotivo').value = '';
            deleteButton.style.display = 'none';
            modal.classList.add('show');
        }
    }
    
    function salvarAgendamento() {
        const motivo = document.getElementById('agendaMotivo').value.trim();
        if (!motivo) {
            alert('Por favor, insira o motivo do agendamento.');
            return;
        }

        const id = celulaSelecionada.id;
        agendamentos[id] = {
            motivo: motivo,
            user: currentUser.name,
            sala: celulaSelecionada.dataset.sala,
            periodo: celulaSelecionada.dataset.periodo
        };
        
        localStorage.setItem('salaAgendamentos', JSON.stringify(agendamentos));
        fecharModal();
        renderizarTabela();
    }

    function excluirAgendamento() {
        if (confirm('Tem certeza que deseja excluir este agendamento?')) {
            const id = celulaSelecionada.id;
            delete agendamentos[id];
            localStorage.setItem('salaAgendamentos', JSON.stringify(agendamentos));
            fecharModal();
            renderizarTabela();
        }
    }

    function fecharModal() {
        modal.classList.remove('show');
    }

    // --- Event Listeners ---
    closeModal.addEventListener('click', fecharModal);
    saveButton.addEventListener('click', salvarAgendamento);
    deleteButton.addEventListener('click', excluirAgendamento);
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            fecharModal();
        }
    });

    // --- Inicialização ---
    if (!currentUser) {
        document.querySelector('.agenda-container').innerHTML = '<p style="text-align:center; padding: 20px;">Por favor, <a href="index.html">faça o login</a> na página inicial para visualizar e agendar salas.</p>';
    } else {
        renderizarTabela();
    }
});