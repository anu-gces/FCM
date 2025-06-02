import express from "express";
import admin from "firebase-admin";
//@ts-ignore
import cors from "cors";

const serviceAccount = require("./siru-res-pos-firebase-adminsdk-7wlis-699fcf38fd.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json()); // <-- Add this line!
app.use(cors()); // <-- Add this line before your routes

app.get("/", (_req, res) => {
  res.send("Hello, TypeScript Express!");
});

app.post("/send-fcm", async (req, res) => {
  const { tokens } = req.body;
  if (!Array.isArray(tokens) || tokens.length === 0) {
    res.status(400).json({ error: "token required" });
    return;
  }
  try {
    const response = await admin.messaging().sendEach(
      tokens.map((token) => ({
        token,
        body: {
          title: "New Order!",
          body: "You have a new order in CakeCafe!",
        },
      }))
    );
    res.json({ success: true, response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
