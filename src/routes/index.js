import { Router } from "express";
import { mongoDatabase } from "../app/mongoDatabase.js";
import { stripHtml } from "string-strip-html";
import joi from "joi";

const router = Router();

const participantsSchema = joi.object({
  name: joi.string().required(),
});

const messageSchema = joi.object({
  to: joi.string().required(),
  text: joi.string().required(),
  type: joi.string().required(),
});

router.get("/participants", async (req, res) => {
  try {
    const participants = await mongoDatabase.db.collection("participants").find().toArray();
    return res.json(participants);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/participants", async (req, res) => {
  const participant = req.body;

  const validation = participantsSchema.validate(participant);
  if (validation.error) {
    return res.status(422).json({ error: validation.error.details[0].message });
  }

  participant.name = stripHtml(participant.name).result.trim();

  try {
    const existingParticipant = await mongoDatabase.db.collection("participants").findOne({ name: participant.name });

    if (existingParticipant) {
      return res.sendStatus(409);
    }

    const date = new Date();
    const time = date.toTimeString().split(" ")[0];

    await mongoDatabase.db.collection("participants").insertOne({ ...participant, lastStatus: Date.now() });
    await mongoDatabase.db.collection("messages").insertOne({
      from: participant.name,
      to: "Todos",
      text: "entra na sala...",
      type: "status",
      time,
    });
    return res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

router.get("/messages", async (req, res) => {
  const { limit } = req.query;
  const { user } = req.headers;

  try {
    const existingParticipant = await mongoDatabase.db.collection("participants").findOne({ name: user });

    if (!existingParticipant) {
      return res.sendStatus(422);
    }

    const messages = await mongoDatabase.db.collection("messages").find().toArray();
    const participantsMessages = messages.filter(
      (message) => (message.to === user && message.to === "Todos") || message.from === user
    );

    if (!isNaN(limit) && limit) {
      return res.json(participantsMessages.slice(-limit));
    }

    return res.json(participantsMessages);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/messages", async (req, res) => {
  const message = req.body;
  const from = req.headers.user;

  const validation = messageSchema.validate(message);
  if (validation.error) {
    return res.status(422).json({ error: validation.error.details[0].message });
  }

  message.to = stripHtml(message.to).result.trim();
  message.text = stripHtml(message.text).result.trim();

  try {
    const existingParticipant = await mongoDatabase.db.collection("participants").findOne({ name: from });

    if (!existingParticipant) {
      return res.sendStatus(422);
    }

    const date = new Date();
    const time = date.toTimeString().split(" ")[0];

    await mongoDatabase.db.collection("messages").insertOne({ ...message, from, time });
    return res.sendStatus(201);
  } catch (error) {
    return res.sendStatus(500);
  }
});

router.post("/status", async (req, res) => {
  try {
    const { user } = req.headers;
    const participant = await mongoDatabase.db.collection("participants").findOne({ name: user });

    if (!participant) {
      return res.sendStatus(404);
    }

    await mongoDatabase.db.collection("participants").updateOne({ name: user }, { $set: { lastStatus: Date.now() } });
    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
