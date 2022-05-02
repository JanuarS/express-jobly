"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const Job = require("../models/job");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", () => {
  const newJob = {
    title: "New Job",
    salary: 100,
    equity: "0.1",
    companyHandle: "c1",
  }

  test("works for admin", async function() {
    const resp = await request(app)
        .post(`/jobs`)
        .send(newJob)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "New Job",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      }
    })
  });

  test("not work for non-admin", async function() {
    const resp = await request(app)
        .post(`/jobs`)
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", () => {

});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", () => {

});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", () => {

});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", () => {
  test("works for admin", async function() {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual(
      { 
        deleted: testJobIds[0] 
      }
    );
  })
});

