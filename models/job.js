"use strict";

const { max } = require("pg/lib/defaults");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
        [
          title,
          salary,
          equity,
          companyHandle,
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Can filter on provide search filters;
   * - title
   * - minSalary
   * - hasEquity
   * 
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   * 
   * Authorization required: none
   * */

  static async findAll(searchFilters) {
    let query = `SELECT id, 
                        title, 
                        salary,
                        equity,
                        company_handle AS "companyHandle"
                  FROM jobs`;
    let whereExpressions = [];
    let { title, minSalary, hasEquity } = searchFilters;

    if (title !== undefined) {
        whereExpressions.push(`title ILIKE '%${title}%'`);
      }
    if (minSalary !== undefined) {
      minSalary = parseInt(minSalary);
      whereExpressions.push(`salary >= ${minSalary}`);
    }
    if (hasEquity !== undefined) {
      whereExpressions.push(`equity > 0`);
    }

    if (whereExpressions.length > 0) {
      query += ` WHERE ` + whereExpressions.join(" AND ");
    }

    query += ` ORDER BY title`;

    const jobsRes = await db.query(query);
    return jobsRes.rows;
  }

  /** Given a job handle, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle, company }
   *   where company is { handle, name, description, numEmployees, logoURL }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`, [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
    
    const companiesRes = await db.query(
          `SELECT handle, 
                  name,
                  description, 
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`, [job.companyHandle]);
    
    delete job.companyHandle;
    job.company = companiesRes.rows[0];
  
    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No company: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,[id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}


module.exports = Job;
