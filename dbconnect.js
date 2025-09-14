
require("dotenv").config();
const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

async function getSession() {
  return driver.session({ database: process.env.NEO4J_DATABASE });
}

async function closeDriver() {
  await driver.close();
}

module.exports = { getSession, closeDriver };
