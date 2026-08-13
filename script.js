window.onload = function () {
    loadProfile();
    loadTasks();
    document.addEventListener("click", closeMenuOutside);
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
    if (t.date) details += " 📅 " + t.date;
    if (t.time) details += " ⏰ " + t.time;

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
    tasks.forEach(function (t) {
        renderTask(t);
        if (t.date && t.time && !t.completed) {
            scheduleReminder(t.task, t.date, t.time);
        }
    });
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
        setTimeout(function () {
            if (Notification.permission === "granted") {
                new Notification("Task Reminder", { body: task });
            } else {
                alert("Reminder: " + task);
            }
        }, delay);
    }
}

/* ---------- Three-dot menu ---------- */

function toggleMenu() {
    let menu = document.getElementById("dropdownMenu");
    menu.classList.toggle("show");
}

function closeMenuOutside(e) {
    let wrapper = document.querySelector(".menu-wrapper");
    let menu = document.getElementById("dropdownMenu");
    if (wrapper && !wrapper.contains(e.target)) {
        menu.classList.remove("show");
    }
}

/* ---------- Profile ---------- */

function loadProfile() {
    let name = localStorage.getItem("profileName");
    if (name) {
        document.getElementById("profileGreeting").innerText = "Hi, " + name + " 👋";
    }
}

function openProfile() {
    toggleMenu();
    let current = localStorage.getItem("profileName") || "";
    let name = prompt("Enter your name:", current);
    if (name === null) return;
    name = name.trim();
    if (name === "") {
        localStorage.removeItem("profileName");
        document.getElementById("profileGreeting").innerText = "";
    } else {
        localStorage.setItem("profileName", name);
        document.getElementById("profileGreeting").innerText = "Hi, " + name + " 👋";
    }
}

/* ---------- Notification settings ---------- */

function toggleNotifPermission() {
    toggleMenu();
    if (Notification.permission === "granted") {
        alert("Notifications are already allowed for this app.");
    } else if (Notification.permission === "denied") {
        alert("Notifications are blocked. Please enable them from your browser site settings.");
    } else {
        Notification.requestPermission().then(function (result) {
            if (result === "granted") {
                alert("Notifications enabled!");
            } else {
                alert("Notifications not allowed.");
            }
        });
    }
}

/* ---------- Sort ---------- */

function sortTasks() {
    toggleMenu();
    let choice = prompt("Sort by:\n1 = Date\n2 = Priority\n3 = Category\n\nEnter 1, 2 or 3:");
    if (choice === null) return;

    let tasks = getTasks();

    if (choice.trim() === "1") {
        tasks.sort(function (a, b) {
            return (a.date || "9999").localeCompare(b.date || "9999");
        });
    } else if (choice.trim() === "2") {
        let order = { high: 0, medium: 1, low: 2 };
        tasks.sort(function (a, b) {
            return order[a.priority] - order[b.priority];
        });
    } else if (choice.trim() === "3") {
        tasks.sort(function (a, b) {
            return a.category.localeCompare(b.category);
        });
    } else {
        return;
    }

    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderAllTasks();
}

/* ---------- Export / Backup ---------- */

function exportTasks() {
    toggleMenu();
    let tasks = getTasks();
    let dataStr = JSON.stringify(tasks, null, 2);
    let blob = new Blob([dataStr], { type: "application/json" });
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "dodaily-backup.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/* ---------- Clear all ---------- */

function clearAllTasks() {
    toggleMenu();
    let confirmClear = confirm("This will delete ALL tasks. Are you sure?");
    if (confirmClear) {
        localStorage.removeItem("tasks");
        renderAllTasks();
    }
}

/* ---------- About ---------- */

function aboutApp() {
    toggleMenu();
    alert("dodaily\nA simple To-Do List app\n\nBuilt with HTML, CSS & JavaScript\nHosted on GitHub Pages");
}
