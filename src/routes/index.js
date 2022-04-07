import { Router } from "express";
import { mongoDatabase } from "../app/mongoDatabase.js";

const router = Router();

router.get("/participants", async (req, res) => {
  const participants = await mongoDatabase.db.collection("participants").find().toArray();
  res.json(participants);
});

router.get("/messages", async (req, res) => {
  const messages = await mongoDatabase.db.collection("messages").find().toArray();
  res.json(messages);
});

export default router;
