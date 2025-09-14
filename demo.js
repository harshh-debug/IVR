// demo.js
const { getSession, closeDriver } = require("./dbconnect");

async function runDemo() {
  const session = await getSession();

  try {
    // create a simple node
    const result = await session.run(
      "CREATE (p:Person {name: $name, age: $age}) RETURN p",
      { name: "Harsh", age: 19 }
    );

    console.log("✅ Node created:", result.records[0].get("p").properties);

    // fetch all Person nodes
    const readResult = await session.run("MATCH (p:Person) RETURN p");
    console.log("📦 All Persons:");
    readResult.records.forEach((record) =>
      console.log(record.get("p").properties)
    );
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await session.close();
    await closeDriver();
  }
}

runDemo();
