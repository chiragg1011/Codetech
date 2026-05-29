const connectDB = async () => {
  console.log(`[Database] Local File-Based JSON Database Connected successfully!`);
  console.log(`[Database] Storing all data offline in server/data/db.json.`);
};

module.exports = connectDB;
