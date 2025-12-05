import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Check, 
  Trash2, 
  Calendar, 
  Clock, 
  Video,
  BookOpen,
  Circle,
  Edit2,
  X,
  Loader
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { format, isFuture, isToday } from 'date-fns';
import TopBar from '../../components/layout/TopBar';
import { todosAPI } from '../../services/api';

const TodoPage = () => {
  const { bookings } = useApp();
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load todos from backend
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await todosAPI.getTodos();
      setTodos(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  // Get upcoming sessions
  const upcomingSessions = bookings
    .filter(b => {
      const sessionDate = b.startTime ? new Date(b.startTime) : (b.date ? new Date(b.date) : null);
      return sessionDate && isFuture(sessionDate) && (b.status === 'confirmed' || b.status === 'pending');
    })
    .sort((a, b) => {
      const dateA = a.startTime ? new Date(a.startTime) : new Date(a.date);
      const dateB = b.startTime ? new Date(b.startTime) : new Date(b.date);
      return dateA - dateB;
    });

  const addTodo = async () => {
    if (newTodoText.trim()) {
      try {
        const newTodo = await todosAPI.createTodo({ text: newTodoText.trim() });
        setTodos([newTodo, ...todos]);
        setNewTodoText('');
      } catch (err) {
        console.error('Error creating todo:', err);
        setError('Failed to create todo');
      }
    }
  };

  const toggleTodo = async (id) => {
    try {
      const updatedTodo = await todosAPI.toggleTodo(id);
      setTodos(todos.map(todo => todo._id === id ? updatedTodo : todo));
    } catch (err) {
      console.error('Error toggling todo:', err);
      setError('Failed to update todo');
    }
  };

  const deleteTodo = async (id) => {
    try {
      await todosAPI.deleteTodo(id);
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete todo');
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo._id);
    setEditText(todo.text);
  };

  const saveEdit = async () => {
    if (editText.trim()) {
      try {
        const updatedTodo = await todosAPI.updateTodo(editingId, { text: editText.trim() });
        setTodos(todos.map(todo => todo._id === editingId ? updatedTodo : todo));
        setEditingId(null);
        setEditText('');
      } catch (err) {
        console.error('Error updating todo:', err);
        setError('Failed to update todo');
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeTodosCount = todos.filter(t => !t.completed).length;
  const completedTodosCount = todos.filter(t => t.completed).length;

  const formatSessionTime = (booking) => {
    const sessionDate = booking.startTime ? new Date(booking.startTime) : (booking.date ? new Date(booking.date) : null);
    if (!sessionDate) return 'TBD';
    
    if (isToday(sessionDate)) {
      return `Today at ${format(sessionDate, 'h:mm a')}`;
    }
    return format(sessionDate, 'MMM dd, h:mm a');
  };

  return (
    <div className="min-h-full bg-[#F2F5F9] font-sans">
      <div className="w-full bg-white rounded-[28px] shadow-xl shadow-gray-200/50 p-6 md:p-8">
        
        <TopBar />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Todo List</h1>
          <p className="text-gray-500">Manage your tasks and upcoming sessions</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column - Custom Todos */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Add Todo Input */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                  placeholder="Add a new todo..."
                  className="flex-1 px-4 py-3 bg-white rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  disabled={loading}
                />
                <button
                  onClick={addTodo}
                  disabled={loading || !newTodoText.trim()}
                  className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    filter === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All ({todos.length})
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    filter === 'active' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Active ({activeTodosCount})
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    filter === 'completed' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Completed ({completedTodosCount})
                </button>
              </div>
            </div>

            {/* Todo List */}
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <AnimatePresence>
                  {filteredTodos.length > 0 ? (
                    filteredTodos.map((todo) => (
                      <motion.div
                        key={todo._id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className={`bg-white border rounded-2xl p-4 transition-all hover:shadow-md ${
                          todo.completed ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleTodo(todo._id)}
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              todo.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-500'
                            }`}
                          >
                            {todo.completed && <Check className="w-4 h-4" />}
                          </button>

                          {editingId === todo._id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              className="flex-1 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                              autoFocus
                            />
                            <button
                              onClick={saveEdit}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span
                              className={`flex-1 text-sm ${
                                todo.completed ? 'line-through text-gray-400' : 'text-gray-900'
                              }`}
                            >
                              {todo.text}
                            </span>
                            <button
                              onClick={() => startEdit(todo)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteTodo(todo.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Circle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">
                        {filter === 'completed' ? 'No completed tasks yet' : 'No todos yet'}
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Right Column - Upcoming Sessions */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Upcoming Sessions</h3>
              </div>

              <div className="space-y-3">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.slice(0, 5).map((session) => (
                    <div
                      key={session._id || session.id}
                      onClick={() => navigate(`/app/session/${session._id || session.id}`)}
                      className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-md transition-all border border-orange-100 hover:border-orange-200 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          session.status === 'confirmed' ? 'bg-green-100' : 'bg-orange-100'
                        }`}>
                          {session.sessionType === 'online' ? (
                            <Video className={`w-4 h-4 ${
                              session.status === 'confirmed' ? 'text-green-600' : 'text-orange-600'
                            }`} />
                          ) : (
                            <BookOpen className={`w-4 h-4 ${
                              session.status === 'confirmed' ? 'text-green-600' : 'text-orange-600'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate group-hover:text-orange-600 transition-colors">
                            {session.subject}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatSessionTime(session)}</span>
                          </div>
                          <div className="mt-2">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              session.status === 'confirmed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {session.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No upcoming sessions</p>
                  </div>
                )}
              </div>

              {upcomingSessions.length > 5 && (
                <button
                  onClick={() => navigate('/app/sessions')}
                  className="w-full mt-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  View All Sessions →
                </button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Todos</span>
                  <span className="text-lg font-bold text-gray-900">{activeTodosCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-lg font-bold text-green-600">{completedTodosCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Upcoming Sessions</span>
                  <span className="text-lg font-bold text-orange-600">{upcomingSessions.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoPage;

