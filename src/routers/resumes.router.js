import express from "express";

const resumeRouter = express.Router();

resumeRouter.post('/sign-up');
resumeRouter.post('/sign-in');

export { resumeRouter };