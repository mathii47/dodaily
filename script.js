window.onload = function () {
    loadTasks();
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

    let details = [${t.category}];
    if (t.date) details += " 📅 " + t.date;
    if (t.time) details += " ⏰ " + t.time;

    li.innerHTML = `
        <span class="taskText" onclick="completeTask(this)" style="${t.completed ? 'text-decoration:line-through;color:gray;' : ''}">
            ${t.task} <small>${details}</small>
        </span>
        <button onclick="editTask(this)">Edit</button>
        <button onclick="deleteTask(this)">Delete</button>
    `;
    document.getElementById("taskList").appendChild(li);
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

function editTask(button) {
    let li = button.parentElement;
    let tasks = getTasks();
    let index = Array.from(li.parentElement.children).indexOf(li);
    let t = tasks[index];

    let newTask = prompt("Edit task:", t.task);
    if (newTask === null) return;
    let newDate = prompt("Edit date (YYYY-MM-DD) or leave blank:", t.date || "");
    let newTime = prompt("Edit time (HH:MM) or leave blank:", t.time || "");

    t.task = newTask.trim();
    t.date = newDate.trim();
    t.time = newTime.trim();

    tasks[index] = t;
    localStorage.setItem("tasks", JSON.stringify(tasks));

    li.remove();
    renderTask(t);
    if (t.date && t.time) scheduleReminder(t.task, t.date, t.time);
}

function getTasks() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTask(t) {
    let tasks = getTasks();
    tasks.push(t);
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    let tasks = getTasks();
    tasks.forEach(t => renderTask(t));
    updateCount();
}

function updateTaskInStorage(li, key, value) {
    let tasks = getTasks();
    let index = Array.from(li.parentElement.children).indexOf(li);
    if (tasks[index]) {
        tasks[index][key] = value;
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }
}

function removeTaskFromStorage(li) {
    let tasks = getTasks();
    let index = Array.from(li.parentElement.children).indexOf(li);
    tasks.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateCount() {
    let count = document.querySelectorAll("#taskList li").length;
    document.getElementById("taskCount").innerText = count + " tasks pending";
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");
}

function scheduleReminder(task, date, time) {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
    let reminderTime = new Date(date + "T" + time);
    let delay = reminderTime - new Date();

    if (delay > 0) {
        setTimeout(() => {
            if (Notification.permission === "granted") {
                new Notification("Task Reminder ⏰", { body: task });
            } else {
                alert("Reminder: " + task);
            }
        }, delay);
    }
}
