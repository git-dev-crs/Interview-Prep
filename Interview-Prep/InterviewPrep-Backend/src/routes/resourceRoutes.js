import express from "express";
import {
    getDocuments,
    updateCompletedQuestions,
    removeCompletedQuestions,
} from "../controllers/resourceController.js";

const router = express.Router();

router.post("/documents", getDocuments);
router.post("/update-completed-questions", updateCompletedQuestions);
router.post("/remove-completed-questions", removeCompletedQuestions);

export default router;
