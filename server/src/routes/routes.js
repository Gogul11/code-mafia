import express from 'express';
import EditorRoutes from './editor.route.js';
import gameRouter from './game.route.js';

const router = express.Router();

router.get("/", (req, res) => {
    res.status(200).send("Router hit!"); 
});

router.use("/editor", EditorRoutes);
router.use("/game", gameRouter);

router.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    return res.status(statusCode).json({
      success: false,
      message,
      statusCode,
    });
  });
  
  router.use("*", (req, res) => {
    res.json({ message: "404 Not found", success: false });
  });
  
  export default router;