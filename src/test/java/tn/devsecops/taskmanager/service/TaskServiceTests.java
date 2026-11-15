
package tn.devsecops.taskmanager.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tn.devsecops.taskmanager.model.Task;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class TaskServiceTests {

    private TaskService taskService;

    @BeforeEach
    void setUp() {
        taskService = new TaskService();
    }

    @Test
    void createTaskShouldAssignId() {
        Task task = new Task(null, "Learn Jenkins", "CI/CD", false);

        Task created = taskService.createTask(task);

        assertEquals(1L, created.getId());
        assertEquals(1, taskService.getAllTasks().size());
    }

    @Test
    void getAllTasksShouldReturnAllTasks() {
        taskService.createTask(new Task(null, "Task 1", "First", false));
        taskService.createTask(new Task(null, "Task 2", "Second", true));

        List<Task> tasks = taskService.getAllTasks();

        assertEquals(2, tasks.size());
    }

    @Test
    void getTaskByIdShouldReturnTaskWhenItExists() {
        Task created = taskService.createTask(
                new Task(null, "Learn Docker", "Containers", false)
        );

        Optional<Task> result = taskService.getTaskById(created.getId());

        assertTrue(result.isPresent());
        assertEquals("Learn Docker", result.get().getTitle());
    }

    @Test
    void getTaskByIdShouldReturnEmptyWhenTaskDoesNotExist() {
        Optional<Task> result = taskService.getTaskById(99L);

        assertTrue(result.isEmpty());
    }

    @Test
    void updateTaskShouldModifyExistingTask() {
        Task created = taskService.createTask(
                new Task(null, "Old title", "Old description", false)
        );

        Task updated = new Task(null, "New title", "New description", true);

        Optional<Task> result = taskService.updateTask(created.getId(), updated);

        assertTrue(result.isPresent());
        assertEquals("New title", result.get().getTitle());
        assertEquals("New description", result.get().getDescription());
        assertTrue(result.get().isCompleted());
    }

    @Test
    void deleteTaskShouldRemoveExistingTask() {
        Task created = taskService.createTask(
                new Task(null, "Delete me", "Test", false)
        );

        boolean deleted = taskService.deleteTask(created.getId());

        assertTrue(deleted);
        assertTrue(taskService.getAllTasks().isEmpty());
    }

    @Test
    void deleteTaskShouldReturnFalseWhenTaskDoesNotExist() {
        boolean deleted = taskService.deleteTask(99L);

        assertFalse(deleted);
    }
}
