import express from 'express';
import { runBatchCode, runCode } from '../controllers/editor.controller.js';


const EditorRouter = express.Router();

EditorRouter.post("/run", runCode);
EditorRouter.post("/batch", runBatchCode);

export default EditorRouter;