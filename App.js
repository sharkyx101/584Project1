import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/tasks';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ name: '', description: '', comment: '' });
  const [updatedTaskName, setUpdatedTaskName] = useState('');
  const [updatedTaskDescription, setUpdatedTaskDescription] = useState('');

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => setTasks(data))
      .catch((error) => console.error('Error fetching tasks:', error));
  }, []);

  const handleUpdateTask = (taskId) => {
    fetch(`${API_URL}/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: updatedTaskName,
        description: updatedTaskDescription,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // Refresh the tasks after updating a task
        fetch(API_URL)
          .then((response) => response.json())
          .then((data) => setTasks(data))
          .catch((error) => console.error('Error fetching tasks:', error));
      })
      .catch((error) => console.error('Error updating task:', error));
  };

  const handleCreateTask = () => {
    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTask),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // Refresh the tasks after creating a new task
        fetch(API_URL)
          .then((response) => response.json())
          .then((data) => setTasks(data))
          .catch((error) => console.error('Error fetching tasks:', error));
      })
      .catch((error) => console.error('Error creating task:', error));
  };

  const handleAddComment = (taskId, newComment) => {
    fetch(`${API_URL}/${taskId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment: newComment }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // Refresh the tasks after adding a comment
        fetch(API_URL)
          .then((response) => response.json())
          .then((data) => setTasks(data))
          .catch((error) => console.error('Error fetching tasks:', error));
      })
      .catch((error) => console.error('Error adding comment:', error));
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    const updatedTasks = [...tasks];
  
    const draggedTask = updatedTasks.find((task) => task._id === draggedId);
    const targetTask = updatedTasks.find((task) => task._id === targetId);
  
    const draggedTaskOrder = draggedTask.order;
    draggedTask.order = targetTask.order;
    targetTask.order = draggedTaskOrder;
  
    // Sort the tasks based on their updated order
    updatedTasks.sort((a, b) => a.order - b.order);
  
    // Ensure the task order is updated in the state
    setTasks(updatedTasks);
  
    // Update task order on the server for all tasks
    updatedTasks.forEach((task, index) => {
      fetch(`${API_URL}/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: index + 1 }),
      })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error('Error updating task order:', error));
    });
  };  


  return (
    <div>
      <h1>Task Manager</h1>
      <div>
        <input
          type="text"
          placeholder="Task name"
          value={newTask.name}
          onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Task description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        />
        <button onClick={handleCreateTask}>Add Task</button>
      </div>
      <div>
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task._id}
              draggable
              onDragStart={(e) => handleDragStart(e, task._id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, task._id)}
            >
              <p>{task.name}</p>
              <p>{task.description}</p>
              <p>Comments: {task.comments ? task.comments.length : 0}</p>
              <ul>
                {task.comments &&
                  task.comments.map((comment, index) => (
                    <li key={index}>{comment}</li>
                  ))}
              </ul>
              <input
                type="text"
                placeholder="New comment"
                onChange={(e) => setNewTask({ ...newTask, comment: e.target.value })}
              />
              <button onClick={() => handleAddComment(task._id, newTask.comment)}>
                Add Comment
              </button>
              <input
                type="text"
                placeholder="Updated task name"
                value={updatedTaskName}
                onChange={(e) => setUpdatedTaskName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Updated task description"
                value={updatedTaskDescription}
                onChange={(e) => setUpdatedTaskDescription(e.target.value)}
              />
              <button onClick={() => handleUpdateTask(task._id)}>Update Task</button>
            </div>
          ))
        ) : (
          <p>No tasks available.</p>
        )}
      </div>
    </div>
  );
};

export default App;
