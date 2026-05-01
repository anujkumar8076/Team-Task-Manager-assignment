const express = require('express');
const { body } = require('express-validator');
const {
  getTasksByProject,
  getMyTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// /api/tasks/my
router.get('/my', protect, getMyTasks);

// /api/projects/:projectId/tasks
router
  .route('/')
  .get(protect, getTasksByProject)
  .post(
    protect,
    adminOnly,
    [body('title').trim().notEmpty().withMessage('Task title is required')],
    createTask
  );

// /api/tasks/:id
router.route('/:id').put(protect, updateTask).delete(protect, adminOnly, deleteTask);

module.exports = router;
