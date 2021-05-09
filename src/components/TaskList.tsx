import { useEffect, useState } from 'react';
import '../styles/tasklist.scss';
import { FiTrash, FiCheckSquare } from 'react-icons/fi';

import api from '../../server/axios';

interface Task {
  id: number;
  title: string;
  isComplete: boolean;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [toggle, setToggle] = useState<boolean>(true);

  const getTasks = async () => {
    const response = await api.get('tasks');
    return response.data;
  };

  useEffect(() => {
    //Requisição
    const getAllTasks = async () => {
      const allTasks = await getTasks();
      if (allTasks) setTasks(allTasks);
    };
    getAllTasks();
  }, []);

  async function handleCreateNewTask() {
    // Crie uma nova task com um id random, não permita criar caso o título seja vazio.
    let newItem = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      isComplete: false,
    };

    if (newTaskTitle.trim() !== '') {
      const response = await api.post('tasks', newItem);
      setTasks([...tasks, response.data]);
    }

    //return value of input to nothing
    setNewTaskTitle('');
  }

  async function handleToggleTaskCompletion(id: number) {
    // Altere entre `true` ou `false` o campo `isComplete` de uma task com dado ID
    let changedItem;

    let updatedTasks = tasks.map((item) => {
      if (item.id === id) {
        changedItem = { ...item, isComplete: !item.isComplete };
        return { ...item, isComplete: !item.isComplete };
      }
      return item;
    });
    if (!toggle) {
      updatedTasks = updatedTasks.filter((task) => task.isComplete === false);
    }

    await api.put(`tasks/${id}`, changedItem);

    setTasks(updatedTasks);
  }

  async function handleRemoveTask(id: number) {
    // Remova uma task da listagem pelo ID
    await api.delete(`tasks/${id}`);
    setTasks(tasks.filter((item) => item.id !== id));
  }

  async function handleToggleView(toggle: boolean) {
    setToggle(toggle);
    if (!toggle) {
      setTasks(tasks.filter((item) => item.isComplete === false));
    } else {
      setTasks(await getTasks());
    }
  }

  return (
    <section className='task-list container'>
      <header>
        <h2>Minhas tasks</h2>

        <div className='input-group'>
          <div className='input'>
            <p>Completed Tasks</p>
            <input
              type='checkbox'
              checked={toggle}
              onChange={(e) => handleToggleView(e.target.checked)}
            ></input>
            <span />
          </div>
          <input
            type='text'
            placeholder='Adicionar novo todo'
            onChange={(e) => setNewTaskTitle(e.target.value)}
            value={newTaskTitle}
            onKeyDown={(e) => (e.key === 'Enter' ? handleCreateNewTask() : 0)}
            tabIndex={0}
          />
          <button type='submit' data-testid='add-task-button' onClick={handleCreateNewTask}>
            <FiCheckSquare size={16} color='#fff' />
          </button>
        </div>
      </header>

      <main>
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <div className={task.isComplete ? 'completed' : ''} data-testid='task'>
                <label className='checkbox-container'>
                  <input
                    type='checkbox'
                    readOnly
                    checked={task.isComplete}
                    onClick={() => handleToggleTaskCompletion(task.id)}
                  />
                  <span className='checkmark'></span>
                </label>
                <p>{task.title}</p>
              </div>

              <button
                type='button'
                data-testid='remove-task-button'
                onClick={() => handleRemoveTask(task.id)}
              >
                <FiTrash size={16} />
              </button>
            </li>
          ))}
        </ul>
      </main>
    </section>
  );
}
