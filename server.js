import app from "./src/app/index.js";
import { mongoDatabase } from "./src/app/mongoDatabase.js";
import dotenv from "dotenv";
import removeInactiveParticipants from "./src/services/removeInactiveParticipants.js";

dotenv.config();

async function init() {
  await mongoDatabase.openInstance();
}

const port = process.env.PORT || 5000;

(async () => {
  await init();
  app.listen(port, () => {
    console.log(`Server is running on: http://localhost:${port}`);
  });

  setInterval(async () => {
    await removeInactiveParticipants();
  }, 15000);
})();
