import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/index.js";
let token;
let mongo;

describe("Transactions CRUD", () => {
  jest.setTimeout(30000);
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri);
    const email = "crud@example.com";
    const password = "secret123";
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email, password });
    token = reg.body.token;
  });
  afterAll(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await mongoose.disconnect();
    if (mongo) await mongo.stop();
  });

  it("creates, reads, updates, deletes a transaction", async () => {
    const createRes = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "expense",
        amount: 25,
        category: "Food",
        note: "Lunch",
        date: new Date().toISOString(),
      });
    expect(createRes.statusCode).toBe(201);
    const id = createRes.body._id;

    const listRes = await request(app)
      .get("/api/transactions")
      .set("Authorization", `Bearer ${token}`);
    expect(listRes.statusCode).toBe(200);
    expect(listRes.body.length).toBeGreaterThan(0);

    const updateRes = await request(app)
      .put(`/api/transactions/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ note: "Lunch with friend" });
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.note).toBe("Lunch with friend");

    const delRes = await request(app)
      .delete(`/api/transactions/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.ok).toBe(true);
  });
});
