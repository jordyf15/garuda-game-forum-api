/* istanbul ignore file */
const { Pool } = require('pg');

const testConfig = {
  host: process.env.PGHOST_TEST,
  port: process.env.PGPORT_TEST,
  user: process.env.PGUSER_TEST,
  password: process.env.PGPASSWORD_TEST,
  database: process.env.PGDATABASE_TEST,
  sslmode: 'require',
};

const pool = process.env.NODE_ENV === 'test' ? new Pool(testConfig) : new Pool('postgres://tfcsxskubwzkuv:740e1e06dd441fa62aa8996d3e8d0542b10f2587899fd2b84d442fb4e7c13e66@ec2-3-224-125-117.compute-1.amazonaws.com:5432/d46piu4af049j5');

module.exports = pool;
