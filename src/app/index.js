import express, { json } from "express";
import cors from "cors";
import router from "../routes/index.js";

const app = new express();
app.use(cors());
app.use(json());
app.use(router);

export default app;
