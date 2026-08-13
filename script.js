window.onload = function () {
    loadProfile();
    loadTasks();
    loadSettings();
};

function addTask() {
    let task = document.getElementById("taskInput").value.trim();
    let category = document.getElementById("taskCategory").value;
    let date = document.getElementById("taskDate").value;
    let time = document.getElementById("taskTime").value;
    let priority = document.getElementById("taskPriority").value;

    if (task === "") return;

    let newTask = { task, category, date, time, priority, completed: false };
    saveTask(newTask);
    renderTask(newTask);

    if (date && time) scheduleReminder(task, date, time);

    document.getElementById("taskInput").value = "";
    document.getElementById("taskDate").value = "";
    document.getElementById("taskTime").value = "";
    updateCount();
}

function renderTask(t) {
    let li = document.createElement("li");
    li.className = "priority-" + t.priority;

    let details = "[" + t.category + "]";
    if (t.date) details += " Date: " + t.date;
    if (t.time) details += " Time: " + t.time;

    li.innerHTML =
        '<span class="taskText" onclick="completeTask(this)" style="' +
        (t.completed ? "text-decoration:line-through;color:gray;" : "") +
        '">' + t.task + ' <small>' + details + '</small></span>' +
        '<button onclick="editTask(this)">Edit</button>' +
        '<button onclick="deleteTask(this)">Delete</button>';

    document.getElementById("taskList").appendChild(li);
}

function renderAllTasks() {
    document.getElementById("taskList").innerHTML = "";
    let tasks = getTasks();
    tasks.forEach(function (t) {
        renderTask(t);
    });
    updateCount();
}

function completeTask(span) {
    span.style.textDecoration = "line-through";
    span.style.color = "gray";
    updateTaskInStorage(span.parentElement, "completed", true);
}

function deleteTask(button) {
    let li = button.parentElement;
    removeTaskFromStorage(li);
    li.remove();
    updateCount();
}
