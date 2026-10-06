import "dotenv/config";
import cors from "cors";
import express from "express";
import { MongoClient, MongoServerError } from "mongodb";

const port = Number(process.env.PORT || 8787);
const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DATABASE || "clouddeployx";
const log = (level, message, details = "") => {
  const suffix = details ? ` ${details}` : "";
  console[level](`[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}${suffix}`);
};

if (!mongoUri) {
  console.error("MONGODB_URI is required.");
  process.exit(1);
}

const client = new MongoClient(mongoUri, {
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
});

log("info", `Connecting to MongoDB database "${databaseName}"...`);
const databasePromise = client.connect().then(async () => {
  log("info", "MongoDB Atlas connection established.");
  const database = client.db(databaseName);
  await Promise.all([
    database.collection("users").createIndex({ usernameNormalized: 1 }, { unique: true }),
    database.collection("users").createIndex({ emailNormalized: 1 }, { unique: true }),
    database.collection("teamMembers").createIndex({ usernameNormalized: 1 }, { unique: true }),
    database.collection("teamMembers").createIndex({ emailNormalized: 1 }, { unique: true }),
  ]);
  log("info", "MongoDB indexes are ready.");
  return database;
}).catch(error => {
  log("error", "MongoDB connection or initialization failed.", `(${error?.name || "Error"}${error?.code ? `, code ${error.code}` : ""})`);
  throw error;
});

const app = express();
app.use(cors({
  origin: process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map(origin => origin.trim())
    : true,
}));
app.use(express.json({ limit: "1mb" }));
app.use((request, response, next) => {
  const startedAt = Date.now();
  response.on("finish", () => {
    log("info", `${request.method} ${request.path} ${response.statusCode} ${Date.now() - startedAt}ms`);
  });
  next();
});

const normalize = value => String(value || "").trim().toLowerCase();
const withoutInternalFields = ({ _id, usernameNormalized, emailNormalized, passwordHash, ...record }) => record;

app.get("/api/health", async (_request, response, next) => {
  try {
    const database = await databasePromise;
    await database.command({ ping: 1 });
    response.json({ status: "ok", database: "mongodb" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/users", async (_request, response, next) => {
  try {
    const database = await databasePromise;
    const users = await database.collection("users")
      .find({}, { projection: { passwordHash: 0, usernameNormalized: 0, emailNormalized: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    response.json({ users: users.map(({ _id, ...user }) => user) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/users/check", async (request, response, next) => {
  try {
    const database = await databasePromise;
    const username = normalize(request.query.username);
    const email = normalize(request.query.email);
    const [usernameUsed, emailUsed] = await Promise.all([
      username ? database.collection("users").findOne({ usernameNormalized: username }) : null,
      email ? database.collection("users").findOne({ emailNormalized: email }) : null,
    ]);
    response.json({ usernameUsed: Boolean(usernameUsed), emailUsed: Boolean(emailUsed) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/users/signup", async (request, response, next) => {
  try {
    const database = await databasePromise;
    const account = request.body || {};
    const usernameNormalized = normalize(account.username);
    const emailNormalized = normalize(account.email);
    if (!account.name || !account.dateOfBirth || !usernameNormalized || !emailNormalized || !account.passwordHash) {
      return response.status(400).json({ error: "Complete every required field." });
    }
    const user = {
      ...account,
      username: String(account.username).trim(),
      email: String(account.email).trim(),
      usernameNormalized,
      emailNormalized,
      createdAt: account.createdAt || new Date().toISOString(),
    };
    await database.collection("users").insertOne(user);
    response.status(201).json({ user: withoutInternalFields(user) });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      const field = error.keyPattern?.emailNormalized ? "email" : "username";
      return response.status(409).json({ error: `This ${field} is already used.` });
    }
    next(error);
  }
});

app.post("/api/users/login", async (request, response, next) => {
  try {
    const database = await databasePromise;
    const identifier = normalize(request.body?.identifier);
    const user = await database.collection("users").findOne({
      $or: [{ usernameNormalized: identifier }, { emailNormalized: identifier }],
      passwordHash: request.body?.passwordHash,
    });
    if (!user) return response.status(401).json({ error: "Invalid username or password." });
    response.json({ user: withoutInternalFields(user) });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/users/:username", async (request, response, next) => {
  try {
    const database = await databasePromise;
    const result = await database.collection("users").deleteOne({
      usernameNormalized: normalize(request.params.username),
    });
    if (!result.deletedCount) return response.status(404).json({ error: "User not found." });
    response.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.get("/api/activity", async (_request, response, next) => {
  try {
    const database = await databasePromise;
    const events = await database.collection("activity")
      .find({})
      .sort({ timestamp: -1 })
      .limit(250)
      .toArray();
    response.json({ events: events.map(({ _id, ...event }) => ({ ...event, id: String(_id) })) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/activity", async (request, response, next) => {
  try {
    const database = await databasePromise;
    const payload = request.body || {};
    if (!payload.actor || !payload.action || !payload.resource) {
      return response.status(400).json({ error: "Actor, action, and resource are required." });
    }
    const event = {
      actor: String(payload.actor),
      action: String(payload.action),
      resource: String(payload.resource),
      environment: String(payload.environment || "—"),
      timestamp: new Date(),
    };
    const result = await database.collection("activity").insertOne(event);
    response.status(201).json({
      event: { ...event, id: String(result.insertedId), timestamp: event.timestamp.toISOString() },
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/team", async (_request, response, next) => {
  try {
    const database = await databasePromise;
    const members = await database.collection("teamMembers")
      .find({ removedAt: { $exists: false } }, { projection: { usernameNormalized: 0, emailNormalized: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    response.json({ members: members.map(({ _id, ...member }) => member) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/team", async (request, response, next) => {
  try {
    const database = await databasePromise;
    const payload = request.body || {};
    const usernameNormalized = normalize(payload.username);
    const emailNormalized = normalize(payload.email);
    if (!payload.name || !usernameNormalized || !emailNormalized || !payload.passwordHash || !payload.deploymentAccess) {
      return response.status(400).json({ error: "Complete every required team member field." });
    }
    const member = {
      ...payload,
      username: String(payload.username).trim(),
      email: String(payload.email).trim(),
      usernameNormalized,
      emailNormalized,
      createdAt: new Date().toISOString(),
    };
    await database.collection("teamMembers").insertOne(member);
    response.status(201).json({ member: withoutInternalFields(member) });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      const field = error.keyPattern?.emailNormalized ? "email" : "username";
      return response.status(409).json({ error: `This team ${field} has already been used.` });
    }
    next(error);
  }
});

app.post("/api/team/login", async (request, response, next) => {
  try {
    const database = await databasePromise;
    const identifier = normalize(request.body?.identifier);
    const member = await database.collection("teamMembers").findOneAndUpdate(
      {
        $or: [{ usernameNormalized: identifier }, { emailNormalized: identifier }],
        passwordHash: request.body?.passwordHash,
        removedAt: { $exists: false },
      },
      { $set: { status: "Active", lastActive: "Now" } },
      { returnDocument: "after" },
    );
    if (!member) return response.status(401).json({ error: "Invalid team username or password." });
    response.json({ member: withoutInternalFields(member) });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/team/:username", async (request, response, next) => {
  try {
    const database = await databasePromise;
    const result = await database.collection("teamMembers").updateOne(
      { usernameNormalized: normalize(request.params.username), removedAt: { $exists: false } },
      { $set: { removedAt: new Date().toISOString(), status: "Removed" } },
    );
    if (!result.matchedCount) return response.status(404).json({ error: "Team member not found." });
    response.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  log("error", error instanceof Error ? error.message.replaceAll(mongoUri, "[MongoDB URI redacted]") : "Unknown server error");
  response.status(500).json({ error: "Database service unavailable." });
});

export default app;

const server = process.env.VERCEL
  ? null
  : app.listen(port, () => {
      log("info", `CloudDeployX API listening on port ${port}.`);
    });

const shutdown = async () => {
  log("info", "Shutting down backend...");
  server?.close();
  await client.close();
  log("info", "Backend shutdown complete.");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
