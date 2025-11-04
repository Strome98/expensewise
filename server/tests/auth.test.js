import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/index.js";

let mongo;

describe("Auth flow", () => {
  jest.setTimeout(30000);
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri);
  });
  afterAll(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await mongoose.disconnect();
    if (mongo) await mongo.stop();
  });

  it("registers and logs in", async () => {
    const email = "test@example.com";
    const password = "secret123";

    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email, password });
    expect(reg.statusCode).toBe(201);
    expect(reg.body.token).toBeTruthy();

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
    expect(login.statusCode).toBe(200);
    expect(login.body.token).toBeTruthy();
  });
});
