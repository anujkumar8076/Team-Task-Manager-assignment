const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/auth');
const taskRoutes = require('./taskRoutes');

const router = express.Router();

// Nest task routes under project
router.use('/:projectId/tasks', taskRoutes);

router
  .route('/')
  .get(protect, getProjects)
  .post(
    protect,
    adminOnly,
    [body('name').trim().notEmpty().withMessage('Project name is required')],
    createProject
  );

router
  .route('/:id')
  .get(protect, getProject)
  .put(
    protect,
    adminOnly,
    [body('name').optional().trim().notEmpty().withMessage('Name cannot be empty')],
    updateProject
  )
  .delete(protect, adminOnly, deleteProject);

router.post('/:id/members', protect, adminOnly, addMember);
router.delete('/:id/members/:userId', protect, adminOnly, removeMember);

module.exports = router;
