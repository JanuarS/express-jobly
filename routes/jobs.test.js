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
  test("works", async function() {
    const resp = await request(app).get(`/jobs`);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Job1",
          salary: null,
          equity: null,
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "Job2",
          salary: 100000,
          equity: "0",
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "Job3",
          salary: 200000,
          equity: "0.1",
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "Job4",
          salary: 300000,
          equity: "0.2",
          companyHandle: "c1",
        },
      ]
    })
  })

  test("filtering works", async function() {
    const resp = await request(app)
        .get(`/jobs`)
        .query({ hasEquity: true });
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Job3",
          salary: 200000,
          equity: "0.1",
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "Job4",
          salary: 300000,
          equity: "0.2",
          companyHandle: "c1",
        },
      ]
    })
  })
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", () => {
  test("works", async function() {
    const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobIds[0],
        title: "Job1",
        salary: null,
        equity: null,
        company: {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        }
      }
    })
  })

  test("job not found", async function() {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  })
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", () => {
  test("works for admin", async function() {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: "update",
          salary: 100,
          equity: "0.2",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "update",
        salary: 100,
        equity: "0.2",
        companyHandle: "c1",
      }
    });
  });

  test("not work for non-admin", async function() {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: "update",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  })
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
  });

  test("not work for non-admin", async function() {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

