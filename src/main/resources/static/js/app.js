const API_URL = "/tasks";

const taskList = document.getElementById("task-list");
const taskModal = document.getElementById("task-modal");
const taskForm = document.getElementById("task-form");
const modalTitle = document.getElementById("modal-title");
const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");

const totalCount = document.getElementById("total-count");
const pendingCount = document.getElementById("pending-count");
const completedCount = document.getElementById("completed-count");
const taskCountLabel = document.getElementById("task-count-label");

let tasks = [];
let currentFilter = "all";
let editingTaskId = null;

async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

async function loadTasks() {
    try {
        tasks = await apiRequest(API_URL);
        renderTasks();
    } catch (error) {
        taskList.innerHTML = `
            <div class="empty-state">
                <h3>Unable to load tasks</h3>
                <p>Check the application connection and try again.</p>
            </div>
        `;
        console.error(error);
    }
}

function updateStatistics() {
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;

    totalCount.textContent = tasks.length;
    pendingCount.textContent = pending;
    completedCount.textContent = completed;

    taskCountLabel.textContent =
        `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
}

function renderTasks() {
    updateStatistics();

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "pending") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    if (filteredTasks.length === 0) {
        const message = currentFilter === "all"
            ? "Add your first task to get started."
            : "There are no tasks in this category.";

        taskList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">▦</div>
                <h3>No tasks found</h3>
                <p>${message}</p>
            </div>
        `;
        return;
    }

    taskList.innerHTML = filteredTasks.map(task => `
        <div class="task-card ${task.completed ? "completed" : ""}">
            <input
                type="checkbox"
                class="task-check"
                data-action="toggle"
                data-id="${task.id}"
                ${task.completed ? "checked" : ""}
                aria-label="Mark ${escapeHTML(task.title)} as completed"
            >

            <div class="task-details">
                <h3>${escapeHTML(task.title)}</h3>
                <p>${escapeHTML(task.description || "No description")}</p>
            </div>

            <span class="task-status ${
                task.completed ? "status-completed" : "status-pending"
            }">
                ${task.completed ? "Completed" : "Pending"}
            </span>

            <div class="task-actions">
                <button class="action-button"
                    data-action="edit"
                    data-id="${task.id}">
                    Edit
                </button>

                <button class="action-button delete-button"
                    data-action="delete"
                    data-id="${task.id}">
                    Delete
                </button>
            </div>
        </div>
    `).join("");
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function openModal(task = null) {
    editingTaskId = task ? task.id : null;

    modalTitle.textContent = task ? "Edit Task" : "Add a New Task";

    taskTitle.value = task ? task.title : "";
    taskDescription.value = task ? task.description || "" : "";

    taskModal.classList.remove("hidden");
    taskTitle.focus();
}

function closeModal() {
    taskModal.classList.add("hidden");
    taskForm.reset();
    editingTaskId = null;
}

document.getElementById("add-task-button").addEventListener("click", () => {
    openModal();
});

document.getElementById("close-modal").addEventListener("click", closeModal);
document.getElementById("cancel-modal").addEventListener("click", closeModal);

taskModal.addEventListener("click", event => {
    if (event.target === taskModal) {
        closeModal();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeModal();
    }
});

taskForm.addEventListener("submit", async event => {
    event.preventDefault();

    const task = {
        title: taskTitle.value.trim(),
        description: taskDescription.value.trim(),
        completed: editingTaskId
            ? tasks.find(item => item.id === editingTaskId).completed
            : false
    };

    if (!task.title) {
        return;
    }

    try {
        if (editingTaskId) {
            await apiRequest(`${API_URL}/${editingTaskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(task)
            });
        } else {
            await apiRequest(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(task)
            });
        }

        closeModal();
        await loadTasks();
    } catch (error) {
        alert("Unable to save the task. Please try again.");
        console.error(error);
    }
});

taskList.addEventListener("click", async event => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const id = Number(button.dataset.id);
    const task = tasks.find(item => item.id === id);

    if (!task) {
        return;
    }

    if (button.dataset.action === "edit") {
        openModal(task);
    }

    if (button.dataset.action === "delete") {
        if (!confirm(`Delete "${task.title}"?`)) {
            return;
        }

        try {
            await apiRequest(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            await loadTasks();
        } catch (error) {
            alert("Unable to delete the task.");
            console.error(error);
        }
    }
});

taskList.addEventListener("change", async event => {
    const checkbox = event.target;

    if (!checkbox.matches('input[data-action="toggle"]')) {
        return;
    }

    const id = Number(checkbox.dataset.id);
    const task = tasks.find(item => item.id === id);

    if (!task) {
        return;
    }

    const updatedTask = {
        title: task.title,
        description: task.description,
        completed: checkbox.checked
    };

    try {
        await apiRequest(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTask)
        });

        await loadTasks();
    } catch (error) {
        checkbox.checked = task.completed;
        alert("Unable to update the task status.");
        console.error(error);
    }
});

document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".nav-item").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
        currentFilter = button.dataset.filter;
        renderTasks();
    });
});

loadTasks();
