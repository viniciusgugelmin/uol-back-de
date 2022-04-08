import { mongoDatabase } from "../app/mongoDatabase.js";

async function removeInactiveParticipants() {
  try {
    console.log("Checking for inactive users...");

    const inactiveTime = Date.now() - 10000;
    const participants = await mongoDatabase.db.collection("participants").find().toArray();
    const inactiveParticipants = participants.filter((participant) => {
      return participant.lastStatus < inactiveTime;
    });

    if (inactiveParticipants.length === 0) {
      console.log("No inactive users ✔");
      return;
    }

    await mongoDatabase.db.collection("participants").deleteMany({ lastStatus: { $lte: inactiveTime } });

    const inactiveParticipantsMessage = inactiveParticipants.map((participant) => {
      console.log(`Removing inactive user: ${participant.name}`);
      const date = new Date();
      const time = date.toTimeString().split(" ")[0];

      return {
        from: participant.name,
        to: "Todos",
        text: "sai da sala...",
        type: "status",
        time: time,
      };
    });

    await mongoDatabase.db.collection("messages").insertMany(inactiveParticipantsMessage);
  } catch (error) {
    console.log(error);
  }
}

export default removeInactiveParticipants;
