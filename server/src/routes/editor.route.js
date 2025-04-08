import express from 'express';
import { runBatchCode, runCode, getPoints } from '../controllers/editor.controller.js';


const EditorRouter = express.Router();

EditorRouter.post("/run", (req, res, next) => {
    res.setHeader("X-Deprecation-Warning", "The '/run' route is deprecated and will be removed in future versions.");
    runCode(req, res, next);
});

EditorRouter.post("/batch", runBatchCode);

EditorRouter.get("/points", getPoints)

export default EditorRouter;