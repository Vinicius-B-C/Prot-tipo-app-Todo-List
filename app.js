document.addEventListener('DOMContentLoaded', () => {
  const page = document.title.toLowerCase();

  // --- LOCAL STORAGE ---
  const getUserTasks = () => {
    const stored = localStorage.getItem('userTasks');
    return stored ? JSON.parse(stored) : [];
  };
  
  const saveUserTasks = (tasks) => localStorage.setItem('userTasks', JSON.stringify(tasks));

  // Inicializar com tarefas exemplo se estiver vazio
  const initializeTasks = () => {
    const userTasks = getUserTasks();
    if (userTasks.length === 0) {
      const exampleTasks = [
        { id: 1, name: 'Fazer compras de mercado', time: '10:00', priority: 'media', status: 'completed' },
        { id: 2, name: 'Pagar conta de energia', time: '15:30', priority: 'alta', status: 'pending' },
        { id: 3, name: 'Levar o lixo para fora', time: '08:00', priority: 'baixa', status: 'pending' },
        { id: 4, name: 'Agendar consulta médica', time: '11:00', priority: 'alta', status: 'completed' }
      ];
      saveUserTasks(exampleTasks);
    }
  };

  initializeTasks();

  const getAllTasks = () => {
    return getUserTasks();
  };

  // --- FUNÇÃO PARA COR DO DROPDOWN ---
  const updateDropdownColor = (dropdown) => {
    if (dropdown.value === 'completed') {
      dropdown.style.backgroundColor = '#28a745';
      dropdown.style.color = '#fff';
    } else {
      dropdown.style.backgroundColor = '#dc3545';
      dropdown.style.color = '#fff';
    }
  };

  // --- PÁGINA INICIAL ---
  if (page.includes('minhas tarefas')) {
    const taskList = document.getElementById('task-list');

    const updateTaskStatus = (taskId, newStatus) => {
      const userTasks = getUserTasks();
      const taskIndex = userTasks.findIndex(t => t.id == taskId);
      
      if (taskIndex !== -1) {
        userTasks[taskIndex].status = newStatus;
        saveUserTasks(userTasks);
        renderTasks();
      }
    };

    const deleteTask = (taskId) => {
      if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        const userTasks = getUserTasks();
        const updatedTasks = userTasks.filter(t => t.id != taskId);
        saveUserTasks(updatedTasks);
        renderTasks();
      }
    };

    const editTask = (taskId) => {
      // Salvar o ID da tarefa sendo editada e redirecionar
      localStorage.setItem('editingTaskId', taskId);
      window.location.href = 'adicionar.html';
    };

    const renderTasks = () => {
      taskList.innerHTML = '';
      const tasks = getAllTasks();

      if (tasks.length === 0) {
        taskList.innerHTML = '<p style="text-align:center; color:#888; padding: 20px;">Nenhuma tarefa ainda.</p>';
        return;
      }

      tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;
        li.dataset.status = task.status;

        // Quadrado de prioridade
        const priorityBox = document.createElement('div');
        priorityBox.className = 'priority-box';
        const colors = { alta: '#dc3545', media: '#ffc107', baixa: '#28a745' };
        priorityBox.style.backgroundColor = colors[task.priority] || '#ccc';

        // Container do conteúdo da tarefa (clicável para editar)
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';
        taskContent.style.flex = '1';
        taskContent.style.cursor = 'pointer';
        taskContent.addEventListener('click', () => editTask(task.id));

        // Nome da tarefa
        const taskName = document.createElement('div');
        taskName.className = 'task-name';
        taskName.textContent = task.name;

        // Horário da tarefa
        const taskTime = document.createElement('div');
        taskTime.className = 'task-time';
        taskTime.textContent = task.time || '--:--';
        taskTime.style.fontSize = '0.8rem';
        taskTime.style.color = '#666';

        taskContent.appendChild(taskName);
        taskContent.appendChild(taskTime);

        // Dropdown de status
        const statusSelect = document.createElement('select');
        statusSelect.className = 'status-dropdown';
        const options = [
          { value: 'pending', label: 'Pendente' },
          { value: 'completed', label: 'Concluído' }
        ];
        
        options.forEach(opt => {
          const o = document.createElement('option');
          o.value = opt.value;
          o.textContent = opt.label;
          if (task.status === opt.value) o.selected = true;
          statusSelect.appendChild(o);
        });

        updateDropdownColor(statusSelect);

        statusSelect.addEventListener('change', (e) => {
          updateTaskStatus(task.id, e.target.value);
          updateDropdownColor(statusSelect);
        });

        // Botão de excluir (minimalista)
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = 'Excluir tarefa';
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteTask(task.id);
        });

        li.appendChild(priorityBox);
        li.appendChild(taskContent);
        li.appendChild(statusSelect);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
      });
    };

    renderTasks();
  }

  // --- PÁGINA ADICIONAR/EDITAR ---
  if (page.includes('adicionar tarefa')) {
    const taskForm = document.getElementById('task-form');
    const priorityIndicator = document.getElementById('priority-indicator');
    const prioritySelect = document.getElementById('priority');
    const taskNameInput = document.getElementById('task-name');
    const taskTimeInput = document.getElementById('task-time');
    const formTitle = document.querySelector('h1');

    // Verificar se está editando
    const editingTaskId = localStorage.getItem('editingTaskId');
    let isEditing = false;
    let currentTask = null;

    if (editingTaskId) {
      isEditing = true;
      const tasks = getUserTasks();
      currentTask = tasks.find(t => t.id == editingTaskId);
      
      if (currentTask) {
        // Preencher formulário com dados da tarefa
        taskNameInput.value = currentTask.name;
        taskTimeInput.value = currentTask.time;
        prioritySelect.value = currentTask.priority;
        formTitle.textContent = 'Editar Tarefa';
        
        // Alterar texto do botão
        const submitBtn = taskForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Atualizar';
      }
    }

    const updateIndicatorColor = () => {
      const colors = { alta: '#dc3545', media: '#ffc107', baixa: '#28a745' };
      priorityIndicator.style.backgroundColor = colors[prioritySelect.value] || '#ccc';
    };

    prioritySelect.addEventListener('change', updateIndicatorColor);
    updateIndicatorColor();

    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = taskNameInput.value.trim();
      const time = taskTimeInput.value;
      const priority = prioritySelect.value;

      if (!name) {
        alert('Digite o nome da tarefa!');
        return;
      }

      const tasks = getUserTasks();

      if (isEditing && currentTask) {
        // Atualizar tarefa existente
        const taskIndex = tasks.findIndex(t => t.id == currentTask.id);
        if (taskIndex !== -1) {
          tasks[taskIndex] = {
            ...currentTask,
            name,
            time: time || '--:--',
            priority
          };
        }
      } else {
        // Criar nova tarefa
        const newTask = {
          id: Date.now(),
          name,
          time: time || '--:--',
          priority,
          status: 'pending'
        };
        tasks.push(newTask);
      }

      saveUserTasks(tasks);
      
      // Limpar ID de edição e redirecionar
      localStorage.removeItem('editingTaskId');
      window.location.href = 'inicial.html';
    });

    // Se cancelar, limpar o ID de edição
    const cancelBtn = document.querySelector('.btn-cancel');
    cancelBtn.addEventListener('click', () => {
      localStorage.removeItem('editingTaskId');
    });
  }

  // --- PÁGINA PROGRESSO ---
  if (page.includes('progresso da semana')) {
    const pieChart = document.getElementById('pie-chart');
    const progressStats = document.getElementById('progress-stats');

    const tasks = getAllTasks();
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    pieChart.style.background = `conic-gradient(
      #28a745 0% ${percent}%,
      #dc3545 ${percent}% 100%
    )`;

    progressStats.innerHTML = `
      <div class="stat-item">
        <span class="icon complete">✓</span>
        <span>${percent}% Concluído (${completed} tarefas)</span>
      </div>
      <div class="stat-item">
        <span class="icon pending">⏳</span>
        <span>${100 - percent}% Pendente (${total - completed} tarefas)</span>
      </div>
      <div style="text-align:center;margin-top:20px;color:#666;font-weight:bold;">
        Total de tarefas: ${total}
      </div>
    `;
  }
});