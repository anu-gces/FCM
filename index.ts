import express from "express";
import admin from "firebase-admin";
import { config } from "dotenv";
import { Request, Response } from "express-serve-static-core";

//@ts-ignore
import cors from "cors";

config(); // Load environment variables from .env file

const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());
app.use(cors());

app.get("/", (_req: Request, res: Response) => {
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
        data: {
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
