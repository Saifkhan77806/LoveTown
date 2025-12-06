import express from "express";
import { matchedUser } from "../controllers/matchedController.js";

const router = express.Router();

router.get("/getmatcheduser", matchedUser);
router.post("/convertchat", convertChat);

export default router;
