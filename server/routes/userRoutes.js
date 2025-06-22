// routes/userRoutes.ts
import express from 'express';
import { createUser, getUsers } from '../controllers/userController';

const router = express.Router();

// GET /api/users
router.get('/', getUsers);

// POST /api/users
router.post('/', createUser);

export default router;
