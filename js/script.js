    // Tasks array
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    let currentDateFilter = 'all';

        // DOM Elements
        const taskForm = document.getElementById('taskForm');
        const taskInput = document.getElementById('taskInput');
        const taskDate = document.getElementById('taskDate');
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const filterStatus = document.getElementById('filterStatus');
        const filterDate = document.getElementById('filterDate');
        const clearFilters = document.getElementById('clearFilters');
        const taskError = document.getElementById('taskError');

        // Initialize the app
        function init() {
            renderTasks();
            setupEventListeners();
            setDefaultDate();
        }

        // Atur tanggal hari ini sebagai tanggal default.
        function setDefaultDate() {
            const today = new Date().toISOString().split('T')[0];
            taskDate.value = today;
        }

        // Set up event listeners
        function setupEventListeners() {
            taskForm.addEventListener('submit', handleAddTask);
            filterStatus.addEventListener('change', handleFilterChange);
            filterDate.addEventListener('change', handleDateFilterChange);
            clearFilters.addEventListener('click', handleClearFilters);
        }

        // Menambahkan tugas baru
        function handleAddTask(e) {
            e.preventDefault();
            
            // Validasi input
            if (!taskInput.value.trim()) {
                taskError.classList.remove('hidden');
                taskInput.focus();
                return;
            }
            
            taskError.classList.add('hidden');
            
            // Membuat Tugas Baru
            const newTask = {
                id: Date.now(),
                text: taskInput.value.trim(),
                date: taskDate.value,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            tasks.unshift(newTask);
            saveTasks();
            renderTasks();
            
            // Reset form
            taskInput.value = '';
            taskInput.focus();
            setDefaultDate();
        }

        // Tombol pengaturan penyelesaian tugas
        function toggleTaskCompletion(id) {
            const task = tasks.find(task => task.id === id);
            if (task) {
                task.completed = !task.completed;
                saveTasks();
                renderTasks();
            }
        }

        // Mengelola penghapusan tugas
        function deleteTask(id) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
        }

        // Mengelola perubahan filter status
        function handleFilterChange(e) {
            currentFilter = e.target.value;
            renderTasks();
        }

        // Handle date filter change
        function handleDateFilterChange(e) {
            currentDateFilter = e.target.value;
            renderTasks();
        }

        // Mengelola perubahan filter tanggal
        function handleClearFilters() {
            filterStatus.value = 'all';
            filterDate.value = 'all';
            currentFilter = 'all';
            currentDateFilter = 'all';
            renderTasks();
        }

        // Simpan Tugas Ke localStorage
        function saveTasks() {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        // Render tugas berdasarkan filter saat ini
        function renderTasks() {
            let filteredTasks = [...tasks];
            
            // Terapkan filter status
            if (currentFilter === 'pending') {
                filteredTasks = filteredTasks.filter(task => !task.completed);
            } else if (currentFilter === 'completed') {
                filteredTasks = filteredTasks.filter(task => task.completed);
            }
            
            // Terapkan filter tanggal
            if (currentDateFilter === 'today') {
                const today = new Date().toISOString().split('T')[0];
                filteredTasks = filteredTasks.filter(task => task.date === today);
            } else if (currentDateFilter === 'upcoming') {
                const today = new Date().toISOString().split('T')[0];
                filteredTasks = filteredTasks.filter(task => task.date >= today && !task.completed);
            } else if (currentDateFilter === 'past') {
                const today = new Date().toISOString().split('T')[0];
                filteredTasks = filteredTasks.filter(task => task.date < today && !task.completed);
            }

            if (filteredTasks.length === 0) {
                emptyState.classList.remove('hidden');
                taskList.innerHTML = '';
                taskList.appendChild(emptyState);
                return;
            }

            emptyState.classList.add('hidden');
            
            const fragment = document.createDocumentFragment();
            
            filteredTasks.forEach(task => {
                const taskElement = createTaskElement(task);
                fragment.appendChild(taskElement);
            });
            
            taskList.innerHTML = '';
            taskList.appendChild(fragment);
        }

        // Buat elemen tugas
        function createTaskElement(task) {
            const taskElement = document.createElement('div');
            taskElement.className = 'py-4 fade-in';
            
            const formattedDate = formatDate(task.date);
            const statusClass = task.completed ? 'task-completed text-gray-500' : 'text-gray-800';
            const checkboxIcon = task.completed ? '✓' : '';
            
            taskElement.innerHTML = `
                <div class="flex items-start gap-4">
                    <button class="mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 border-indigo-500 flex items-center justify-center hover:bg-indigo-100 transition-colors ${task.completed ? 'bg-indigo-500 text-white' : ''}" onclick="toggleTaskCompletion(${task.id})">
                        ${checkboxIcon}
                    </button>
                    
                    <div class="flex-grow">
                        <div class="flex justify-between items-start gap-2">
                            <p class="${statusClass} font-medium break-all">${task.text}</p>
                            <button class="text-red-500 hover:text-red-700 text-sm" onclick="deleteTask(${task.id})">
                                Delete
                            </button>
                        </div>
                        <div class="flex items-center mt-1 text-sm text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            ${formattedDate}
                            ${isOverdue(task.date) && !task.completed ? '<span class="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">Overdue</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
            
            return taskElement;
        }

        // Format tanggal untuk ditampilkan
        function formatDate(dateString) {
            if (!dateString) return 'No date';
            
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            
            return date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }

        // Cek apakah tanggal sudah lewat
        function isOverdue(dateString) {
            if (!dateString) return false;
            
            const taskDate = new Date(dateString);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            return taskDate < today;
        }

        // Initialisasi aplikasi saat DOM siap
    document.addEventListener('DOMContentLoaded', init);