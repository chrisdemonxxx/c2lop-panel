import { useEffect } from 'react';
import { create } from 'zustand';
import socket from './socket';
import { showHackerToast } from '@/components/HackerToast';

// Types for client and task updates (customize as needed)
interface ClientState {
  clients: any[];
  setClients: (clients: any[]) => void;
  updateClient: (client: any) => void;
}

interface TaskState {
  tasks: Record<string, any>; // key: task.id, value: task object
  setTasks: (tasks: any[]) => void;
  addTask: (task: any) => void;
  updateTask: (task: any) => void;
  deleteTask: (taskId: string) => void;
  taskResults: Record<string, any>;
  setTaskResult: (clientId: string, output: any) => void;
}

export const useClientStore = create<ClientState & {
  addClient: (client: any) => void;
  deleteClient: (id: string) => void;
  fetchClients: () => void;
}>((set, get) => ({
  clients: [],
  setClients: (clients) => set({ clients }),
  updateClient: (client) => set((state) => ({
    clients: state.clients.map((c) => c.id === client.id ? { ...c, ...client } : c),
  })),
  addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
  deleteClient: (id) => set((state) => ({ clients: state.clients.filter((c) => c.id !== id) })),
  fetchClients: async () => {
    try {
      const api = (await import('./api')).default;
      const res = await api.get('/clients');
      set({ clients: res.data.data });
    } catch {}
  }
}));

export const useTaskStore = create<TaskState>((set) => ({
  tasks: {},
  setTasks: (tasks) => set({ tasks: tasks.reduce((acc: any, t: any) => { acc[t.id] = t; return acc; }, {}) }),
  addTask: (task) => set((state) => ({ tasks: { ...state.tasks, [task.id]: task } })),
  updateTask: (task) => set((state) => ({ tasks: { ...state.tasks, [task.id]: { ...state.tasks[task.id], ...task } } })),
  deleteTask: (taskId) => set((state) => { const newTasks = { ...state.tasks }; delete newTasks[taskId]; return { tasks: newTasks }; }),
  taskResults: {},
  setTaskResult: (clientId, output) => set((state) => ({
    taskResults: { ...state.taskResults, [clientId]: output },
  })),
}));

// Hook to subscribe to real-time events
export function useSocketRealtime() {
  const setClients = useClientStore((s) => s.setClients);
  const addClient = useClientStore((s) => s.addClient);
  const deleteClient = useClientStore((s) => s.deleteClient);
  const fetchClients = useClientStore((s) => s.fetchClients);
  const setTaskResult = useTaskStore((s) => s.setTaskResult);
  const setTasks = useTaskStore((s) => s.setTasks);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  useEffect(() => {
    fetchClients(); // Initial load from backend
    socket.on('client_update', (data) => {
      setClients(data);
      showHackerToast('Client list updated', 'info');
    });
    socket.on('client_added', (client) => {
      addClient(client);
      showHackerToast(`Client added: ${client.hostname || client.id}`, 'success');
    });
    socket.on('client_deleted', (id) => {
      deleteClient(id);
      showHackerToast(`Client deleted: ${id}`, 'error');
    });
    socket.on('client_connected', (client) => {
      showHackerToast(`Client connected: ${client.hostname || client.id}`, 'success');
    });
    socket.on('client_disconnected', (client) => {
      showHackerToast(`Client disconnected: ${client.hostname || client.id}`, 'error');
    });
    socket.on('task_result_received', ({ clientId, output }) => {
      setTaskResult(clientId, output);
      showHackerToast(`Task result received for client ${clientId}`, 'info');
    });
    socket.on('task_created', (task) => {
      addTask(task);
      showHackerToast(`Task created: ${task.command || task.id}`, 'success');
    });
    socket.on('task_updated', (task) => {
      updateTask(task);
      showHackerToast(`Task updated: ${task.command || task.id}`, 'info');
    });
    socket.on('task_deleted', (taskId) => {
      deleteTask(taskId);
      showHackerToast(`Task deleted: ${taskId}`, 'error');
    });
    return () => {
      socket.off('client_update');
      socket.off('client_added');
      socket.off('client_deleted');
      socket.off('client_connected');
      socket.off('client_disconnected');
      socket.off('task_result_received');
      socket.off('task_created');
      socket.off('task_updated');
      socket.off('task_deleted');
    };

  }, [setClients, addClient, deleteClient, fetchClients, setTaskResult]);
}
