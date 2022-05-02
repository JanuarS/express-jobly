"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");
const jsonwebtoken = require("jsonwebtoken");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", () => {
  let newJob = {
    title: "newJob", 
    salary: 50000,
    equity: "0.1",
    companyHandle: "c1"
  }

  test("works", async function() {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      ...newJob,
      id: expect.any(Number),
    });
  });
});

/************************************** findAll */

describe("findAll", () => {
  test("works: no filter", async function() {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "Job1",
        salary: null,
        equity: null,
        companyHandle: "c1",
      },
      {
        id: testJobIds[1],
        title: "Job2",
        salary: 100000,
        equity: "0",
        companyHandle: "c1",
      },
      {
        id: testJobIds[2],
        title: "Job3",
        salary: 200000,
        equity: "0.1",
        companyHandle: "c1",
      },
      {
        id: testJobIds[3],
        title: "Job4",
        salary: 300000,
        equity: "0.2",
        companyHandle: "c1",
      },
    ])
  })
});

/************************************** get */

describe("get", () => {
  test("works", async function() {
    let job = await Job.get(testJobIds[1]);
    expect(job).toEqual({
      id: testJobIds[1],
      title: "Job2",
      salary: 100000,
      equity: "0",
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      }
    });
  });

  test("job not found", async function() {
    try {
      await Job.get(0);
    } catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })
});

/************************************** update */

describe("update", () => {
  let update = {
    title: "Update",
    salary: 1,
    equity: "0.1",
  };

  test("works", async function() {
    let job = await Job.update(testJobIds[0], update);
    expect(job).toEqual({
      id: testJobIds[0],
      ...update,
      companyHandle: "c1",
    });
  });
});

/************************************** remove */

describe("remove", () => {
  test("works", async function() {
    await Job.remove(testJobIds[0]);
    const res = await db.query(
      `SELECT id FROM jobs where id=$1`, [testJobIds[0]]
    );
    expect(res.rows.length).toEqual(0);
  });

  test("job not found", async function() {
    try {
      await Job.remove(0);
    } catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })
});