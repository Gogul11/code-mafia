import express from 'express';
import { submitCodeForQuestion, runBatchCode, getPoints } from '../controllers/editor.controller.js';


const EditorRouter = express.Router();

EditorRouter.post("/runtestcases", runBatchCode);

EditorRouter.post("/submitquestion", submitCodeForQuestion);

EditorRouter.get("/points", getPoints)

export default EditorRouter;