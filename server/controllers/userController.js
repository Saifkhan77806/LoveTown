// controllers/userController.ts

import { getUserByEmail } from "../data/user.js";

export const getUsers = async (req, res) => {
  const { email, isEmbedding } = req.query;

  const user = await getUserByEmail(email, isEmbedding);

  if (user.success) {
    return res.status(200).json({ user: user?.user, message: "Get all users" });
  } else {
    return res.status(404).json({ error: user?.error, message: user?.message });
  }
};

export const createUser = async (req, res) => {
  const userData = req.body;
  res.status(201).json({ message: "User created", data: userData });
};
