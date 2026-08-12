function addTask() {
    let input = document.getElementById("taskInput");
    let task = input.value.trim();

    if (task === "") {
        return;
    }

    let li = document.createElement("li");

    li.innerHTML = `
        <span onclick="completeTask(this)">${task}</span>
        <button onclick="deleteTask(this)">Delete</button>
    `;

    document.getElementById("taskList").appendChild(li);

    input.value = "";
}

function completeTask(task) {
    task.style.textDecoration = "line-through";
    task.style.color = "gray";
}

function deleteTask(button) {
    button.parentElement.remove();
}
