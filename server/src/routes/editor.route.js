import express from 'express';
import { submitCodeForQuestion, runBatchCode, getPoints } from '../controllers/editor.controller.js';
import verifyToken from '../middleware/verifyToken.js';


const EditorRouter = express.Router();

EditorRouter.post("/runtestcases", verifyToken, runBatchCode);

EditorRouter.post("/submitquestion", verifyToken, submitCodeForQuestion);

EditorRouter.get("/points", verifyToken, getPoints)

export default EditorRouter;