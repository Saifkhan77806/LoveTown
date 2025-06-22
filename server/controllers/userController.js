// controllers/userController.ts

export const getUsers = async (req, res) => {
  res.json({ message: 'Get all users' });
};

export const createUser = async (req, res) => {
  const userData = req.body;
  res.status(201).json({ message: 'User created', data: userData });
};
