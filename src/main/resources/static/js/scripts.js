$(document).ready(function () {
    const apiUrl = 'https://todo.doczilla.pro/api/todos';

    function loadTasks(queryParams = {}) {
        $.ajax({
            url: `${apiUrl}`,
            method: 'GET',
            data: queryParams,
            success: function (data) {
                let tasks = sortTasksByDate(data);

                if (queryParams.startDate && queryParams.endDate) {
                    tasks = filterTasksByDateRange(tasks, queryParams.startDate, queryParams.endDate);
                }

                renderTasks(tasks);
            },
            error: function (error) {
                console.error('Ошибка при загрузке задач:', error);
            }
        });
    }

    function renderTasks(tasks) {
        const $tasksList = $('#tasks-list');
        $tasksList.empty();

        if (tasks.length === 0) {
            $('#no-tasks').show();
            return;
        }

        $('#no-tasks').hide();

        tasks.forEach(task => {
            const $taskItem = $('<div>').addClass('task-item').text(`${task.name} - ${task.date}`);
            $taskItem.on('click', function () {
                openTaskModal(task);
            });
            $tasksList.append($taskItem);
        });
    }

    $('#search').on('input', function () {
        const query = $(this).val();
        loadTasks({ search: query });
    });

    $('#today-tasks').on('click', function () {
        const today = new Date().toISOString().split('T')[0];
        loadTasks({ date: today });
    });

    $('#week-tasks').on('click', function () {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);
        loadTasks({ startDate: startDate.toISOString().split('T')[0], endDate: endDate.toISOString().split('T')[0] });
    });

    $('#show-all-tasks').on('click', function () {
        loadTasks();
    });

    $('#undone').on('change', function () {
        const isChecked = $(this).is(':checked');
        loadTasks({ undone: isChecked });
    });

    $('#calendar').datepicker({
        onSelect: function (dateText) {
            loadTasks({ date: dateText });
        }
    });

    $('#add-task-button').on('click', function () {
        $('#addTaskModal').show();
    });

    $('.close').on('click', function () {
        $('#addTaskModal').hide();
    });

    $('#addTaskForm').on('submit', function (e) {
        e.preventDefault();
        const taskData = {
            name: $('#taskName').val(),
            description: $('#taskDesc').val(),
            date: $('#taskDate').val(),
        };
        $.ajax({
            url: `${apiUrl}`,
            method: 'POST',
            data: JSON.stringify(taskData),
            contentType: 'application/json',
            success: function () {
                $('#addTaskModal').hide();
                loadTasks();
            },
            error: function (error) {
                console.error('Ошибка при добавлении задачи:', error);
            }
        });
    });

    function openTaskModal(task) {
        const modalHtml = `
            <div class="modal" id="taskModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${task.name}</h2>
                        <span class="close" onclick="$('#taskModal').remove();">&times;</span>
                    </div>
                    <div class="modal-body">
                        <p>${task.description}</p>
                        <p>Дата: ${task.date}</p>
                    </div>
                </div>
            </div>
        `;
        $('body').append(modalHtml);
        $('#taskModal').show();
    }

    function sortTasksByDate(tasks) {
        return tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    function filterTasksByDateRange(tasks, startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        return tasks.filter(task => {
            const taskDate = new Date(task.date);
            return taskDate >= start && taskDate <= end;
        });
    }

    function searchTasks(query) {
        $.ajax({
            url: `${apiUrl}/find`,
            method: 'GET',
            data: { search: query },
            success: function (data) {
                renderSearchResults(data);
            },
            error: function (error) {
                console.error('Ошибка при поиске задач:', error);
            }
        });
    }

    function renderSearchResults(tasks) {
        const $results = $('#search-results');
        $results.empty();
        tasks.forEach(task => {
            const $item = $('<li>').text(task.name).addClass('dropdown-item');
            $item.on('click', function () {
                openTaskDetailsModal(task);
            });
            $results.append($item);
        });
    }

    function openTaskDetailsModal(task) {
        $('#task-details').text(`Название: ${task.name}\nОписание: ${task.description}\nДата: ${task.date}`);
        $('#taskDetailsModal').show();
    }

    $('.modal .close').on('click', function () {
        $(this).closest('.modal').hide();
    });

    $('#search').on('input', function () {
        const query = $(this).val();
        if (query) {
            searchTasks(query);
        } else {
            $('#search-results').empty();
        }
    });

    $('#calendar').datepicker({
        rangeSelect: true,
        onSelect: function (dates) {
            const [startDate, endDate] = dates.split(' - ');
            loadTasks({ startDate, endDate });
        }
    });

    $('#sort-tasks').on('click', function () {
        loadTasks();
    });

    loadTasks();
});
