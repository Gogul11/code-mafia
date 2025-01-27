import express from 'express';
import { runCode } from '../controllers/editor.controller.js';


const EditorRouter = express.Router();

EditorRouter.post("/run", runCode);

export default EditorRouter;