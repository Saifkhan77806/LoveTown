import express from "express";
import { matchedUser } from "../controllers/matchedController.js";

const router = express.Router();

router.get("/getmatcheduser", matchedUser);

export default router;
