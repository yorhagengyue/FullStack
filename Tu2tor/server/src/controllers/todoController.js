import Todo from '../models/Todo.js';

// @desc    Get all todos for current user
// @route   GET /api/todos
// @access  Private
export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new todo
// @route   POST /api/todos
// @access  Private
export const createTodo = async (req, res) => {
  try {
    const { text, priority, dueDate, completed } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Todo text is required' });
    }

    const todo = await Todo.create({
      userId: req.user._id,
      text: text.trim(),
      priority: priority || 'medium',
      dueDate: dueDate || null,
      completed: completed || false
    });

    res.status(201).json(todo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a todo
// @route   PUT /api/todos/:id
// @access  Private
export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed, priority, dueDate } = req.body;

    const todo = await Todo.findOne({ _id: id, userId: req.user._id });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Update fields if provided
    if (text !== undefined) todo.text = text.trim();
    if (completed !== undefined) todo.completed = completed;
    if (priority !== undefined) todo.priority = priority;
    if (dueDate !== undefined) todo.dueDate = dueDate;

    await todo.save();

    res.json(todo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a todo
// @route   DELETE /api/todos/:id
// @access  Private
export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Toggle todo completion
// @route   PATCH /api/todos/:id/toggle
// @access  Private
export const toggleTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOne({ _id: id, userId: req.user._id });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    todo.completed = !todo.completed;
    await todo.save();

    res.json(todo);
  } catch (error) {
    console.error('Error toggling todo:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete all completed todos
// @route   DELETE /api/todos/completed
// @access  Private
export const deleteCompletedTodos = async (req, res) => {
  try {
    const result = await Todo.deleteMany({ 
      userId: req.user._id, 
      completed: true 
    });

    res.json({ 
      message: 'Completed todos deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting completed todos:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

