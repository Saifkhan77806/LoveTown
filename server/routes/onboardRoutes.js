import express from "express";
import { onBoardUser } from "../controllers/onBoardUser.js";

const router = express.Router();

router.put("/onboard-user", onBoardUser);

export default router;
