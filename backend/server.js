import "dotenv/config";
import cors from "cors";
import express from "express";
import { createHash } from "node:crypto";
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
  monitorCommands: true,
});

const loggedMongoCommands = new Set(["find", "aggregate", "insert", "update", "delete", "findAndModify", "createIndexes"]);
const activeMongoOperations = new Map();
client.on("commandStarted", event => {
  if (!loggedMongoCommands.has(event.commandName)) return;
  const collection = event.command[event.commandName];
  if (typeof collection !== "string") return;
  const operation = `MongoDB ${event.commandName.toUpperCase()} ${event.databaseName}.${collection}`;
  activeMongoOperations.set(event.requestId, operation);
  log("info", `--> ${operation}`);
});
client.on("commandSucceeded", event => {
  const operation = activeMongoOperations.get(event.requestId);
  if (!operation) return;
  activeMongoOperations.delete(event.requestId);
  log("info", `<-- ${operation} OK (${event.duration}ms)`);
});
client.on("commandFailed", event => {
  const operation = activeMongoOperations.get(event.requestId);
  if (!operation) return;
  activeMongoOperations.delete(event.requestId);
  log("error", `<-- ${operation} failed (${event.duration}ms)`);
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
    database.collection("applications").createIndex({ id: 1 }, { unique: true }),
    database.collection("deployments").createIndex({ id: 1 }, { unique: true }),
    database.collection("workspaceSettings").createIndex({ username: 1 }, { unique: true }),
    database.collection("admins").createIndex({ usernameNormalized: 1 }, { unique: true }),
  ]);
  const adminUsername = (process.env.ADMIN_DEFAULT_USERNAME || "abubakkar").trim();
  const adminPasswordHash = createHash("sha256").update(process.env.ADMIN_DEFAULT_PASSWORD || "10092004").digest("hex");
  await database.collection("admins").updateOne(
    { usernameNormalized: adminUsername.toLowerCase() },
    { $setOnInsert: { name: "Abubakkar", username: adminUsername, usernameNormalized: adminUsername.toLowerCase(), passwordHash: adminPasswordHash, createdAt: new Date().toISOString() } },
    { upsert: true },
  );
  log("info", "MongoDB indexes are ready.");
  return database;
}).catch(error => {
  log("error", "MongoDB connection or initialization failed.", `(${error?.name || "Error"}${error?.code ? `, code ${error.code}` : ""})`);
  throw error;
});

const app = express();
app.use((request, response, next) => {
  const startedAt = Date.now();
  const path = request.path;
  log("info", `--> ${request.method} ${path}`);
  response.on("finish", () => {
    const level = response.statusCode >= 500 ? "error" : response.statusCode >= 400 ? "warn" : "info";
    log(level, `<-- ${request.method} ${path} ${response.statusCode} (${Date.now() - startedAt}ms)`);
  });
  next();
});
app.use(cors({
  origin: process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map(origin => origin.trim())
    : true,
}));
app.use(express.json({ limit: "1mb" }));

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

app.patch("/api/users/:username/password", async (request, response, next) => {
  try {
    const database = await databasePromise;
    const { currentPasswordHash, nextPasswordHash } = request.body || {};
    if (!currentPasswordHash || !nextPasswordHash) return response.status(400).json({ error: "Current and new passwords are required." });
    const result = await database.collection("users").updateOne(
      { usernameNormalized: normalize(request.params.username), passwordHash: currentPasswordHash },
      { $set: { passwordHash: nextPasswordHash, passwordUpdatedAt: new Date().toISOString() } },
    );
    if (!result.matchedCount) return response.status(401).json({ error: "Current password is incorrect." });
    response.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/login", async (request, response, next) => {
  try {
    const database = await databasePromise;
    const admin = await database.collection("admins").findOne({
      usernameNormalized: normalize(request.body?.identifier),
      passwordHash: request.body?.passwordHash,
    });
    if (!admin) return response.status(401).json({ error: "Invalid administrator username or password." });
    response.json({ admin: withoutInternalFields(admin) });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/admin/:username/password", async (request, response, next) => {
  try {
    const database = await databasePromise;
    const { currentPasswordHash, nextPasswordHash } = request.body || {};
    if (!currentPasswordHash || !nextPasswordHash) return response.status(400).json({ error: "Current and new passwords are required." });
    const result = await database.collection("admins").updateOne(
      { usernameNormalized: normalize(request.params.username), passwordHash: currentPasswordHash },
      { $set: { passwordHash: nextPasswordHash, passwordUpdatedAt: new Date().toISOString() } },
    );
    if (!result.matchedCount) return response.status(401).json({ error: "Current password is incorrect." });
    response.json({ success: true });
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

app.get("/api/applications", async (_request, response, next) => {
  try {
    const database = await databasePromise;
    const applications = await database.collection("applications").find({}).sort({ createdAt: -1 }).toArray();
    response.json({ applications: applications.map(({ _id, ...application }) => application) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/applications", async (request, response, next) => {
  try {
    const database = await databasePromise;
    const payload = request.body || {};
    if (!payload.id || !payload.name || !payload.ownerUsername) {
      return response.status(400).json({ error: "Application ID, name, and owner are required." });
    }
    const application = { ...payload, createdAt: payload.createdAt || new Date().toISOString() };
    await database.collection("applications").insertOne(application);
    response.status(201).json({ application });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return response.status(409).json({ error: "This application has already been saved." });
    }
    next(error);
  }
});

app.put("/api/applications/:id", async (request, response, next) => {
  try {
    const database = await databasePromise;
    const { _id, ...payload } = request.body || {};
    const result = await database.collection("applications").updateOne(
      { id: request.params.id },
      { $set: { ...payload, id: request.params.id, updatedAt: new Date().toISOString() } },
    );
    if (!result.matchedCount) return response.status(404).json({ error: "Application not found." });
    response.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/applications/:id", async (request, response, next) => {
  try {
    const database = await databasePromise;
    const result = await database.collection("applications").deleteOne({ id: request.params.id });
    if (!result.deletedCount) return response.status(404).json({ error: "Application not found." });
    await database.collection("deployments").deleteMany({ applicationId: request.params.id });
    response.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.get("/api/deployments", async (_request, response, next) => {
  try {
    const database = await databasePromise;
    const deployments = await database.collection("deployments").find({}).sort({ createdAt: -1 }).toArray();
    response.json({ deployments: deployments.map(({ _id, ...deployment }) => deployment) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/deployments", async (request, response, next) => {
  try {
    const database = await databasePromise;
    const payload = request.body || {};
    if (!payload.id || !payload.applicationId || !payload.applicationName || !payload.ownerUsername) {
      return response.status(400).json({ error: "Deployment ID, application, and owner are required." });
    }
    const deployment = { ...payload, createdAt: payload.createdAt || new Date().toISOString() };
    await database.collection("deployments").insertOne(deployment);
    response.status(201).json({ deployment });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/deployments/:id", async (request, response, next) => {
  try {
    const database = await databasePromise;
    const { status, completedAt, duration, version } = request.body || {};
    const fields = Object.fromEntries(Object.entries({ status, completedAt, duration, version }).filter(([, value]) => value !== undefined));
    const result = await database.collection("deployments").updateOne(
      { id: request.params.id },
      { $set: { ...fields, updatedAt: new Date().toISOString() } },
    );
    if (!result.matchedCount) return response.status(404).json({ error: "Deployment not found." });
    response.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.get("/api/settings/:username", async (request, response, next) => {
  try {
    const database = await databasePromise;
    const record = await database.collection("workspaceSettings").findOne({ username: normalize(request.params.username) });
    response.json({ settings: record?.settings || {} });
  } catch (error) {
    next(error);
  }
});

app.put("/api/settings/:username", async (request, response, next) => {
  try {
    const database = await databasePromise;
    const { key, value } = request.body || {};
    const allowedKeys = new Set(["general", "security", "environment", "notifications", "apiKeys"]);
    if (!allowedKeys.has(key)) return response.status(400).json({ error: "Unknown workspace setting." });
    await database.collection("workspaceSettings").updateOne(
      { username: normalize(request.params.username) },
      { $set: { [`settings.${key}`]: value, updatedAt: new Date().toISOString() }, $setOnInsert: { username: normalize(request.params.username) } },
      { upsert: true },
    );
    response.json({ success: true });
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

app.patch("/api/team/:username/password", async (request, response, next) => {
  try {
    const database = await databasePromise;
    const { currentPasswordHash, nextPasswordHash } = request.body || {};
    if (!currentPasswordHash || !nextPasswordHash) return response.status(400).json({ error: "Current and new passwords are required." });
    const result = await database.collection("teamMembers").updateOne(
      { usernameNormalized: normalize(request.params.username), passwordHash: currentPasswordHash, removedAt: { $exists: false } },
      { $set: { passwordHash: nextPasswordHash, passwordUpdatedAt: new Date().toISOString() } },
    );
    if (!result.matchedCount) return response.status(401).json({ error: "Current password is incorrect." });
    response.json({ success: true });
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
