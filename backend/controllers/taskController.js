const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
const getTasksByProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (
      req.user.role !== 'admin' &&
      !project.members.some((m) => m.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks assigned to logged-in user (dashboard)
// @route   GET /api/tasks/my
// @access  Private
const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .sort('-createdAt');

    const now = new Date();
    const stats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      overdue: tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed'
      ).length,
    };

    res.json({ tasks, stats });
  } catch (error) {
    next(error);
  }
};

// @desc    Create task in a project
// @route   POST /api/projects/:projectId/tasks
// @access  Private/Admin
const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { title, description, status, assignedTo, dueDate } = req.body;

    // Validate assignedTo is a project member
    if (assignedTo && !project.members.some((m) => m.toString() === assignedTo)) {
      return res
        .status(400)
        .json({ message: 'Assigned user is not a member of this project' });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      assignedTo: assignedTo || null,
      project: req.params.projectId,
      dueDate: dueDate || null,
      createdBy: req.user._id,
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Members can only update status of their own tasks
    if (req.user.role !== 'admin') {
      if (
        !task.assignedTo ||
        task.assignedTo.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: 'Access denied' });
      }
      // Members can only update status
      if (req.body.status) task.status = req.body.status;
    } else {
      const { title, description, status, assignedTo, dueDate } = req.body;
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
      if (dueDate !== undefined) task.dueDate = dueDate || null;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasksByProject,
  getMyTasks,
  createTask,
  updateTask,
  deleteTask,
};
