function addTask() {
    let input = document.getElementById("taskInput");
    let timeInput = document.getElementById("taskTime");
    let task = input.value.trim();
    let time = timeInput.value;

    if (task === "") {
        return;
    }

    let li = document.createElement("li");

    li.innerHTML = `
        <span onclick="completeTask(this)">${task} ${time ? "(⏰ " + time + ")" : ""}</span>
        <button onclick="deleteTask(this)">Delete</button>
    `;

    document.getElementById("taskList").appendChild(li);

    if (time) {
        scheduleReminder(task, time);
    }

    input.value = "";
    timeInput.value = "";
}

function completeTask(task) {
    task.style.textDecoration = "line-through";
    task.style.color = "gray";
}

function deleteTask(button) {
    button.parentElement.remove();
}

function scheduleReminder(task, time) {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    let now = new Date();
    let [hours, minutes] = time.split(":");
    let reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    let delay = reminderTime - now;

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
