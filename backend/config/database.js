const authDB    = require('./databases/authDB');
const clientDB  = require('./databases/clientDB');
const schemeDB  = require('./databases/schemeDB');
const portDB    = require('./databases/portDB');

const invoiceHistoryDB = require('./databases/invoiceHistoryDB'); // ✅ NEW LINE

const testConnections = async () => {
  try {
    await authDB.authenticate();
    console.log("✅ auth_db connected");

    await clientDB.authenticate();
    console.log("✅ client_db connected");

    await schemeDB.authenticate();
    console.log("✅ scheme_db connected");

    await portDB.authenticate();
    console.log("✅ port_db connected");

;

    await invoiceHistoryDB.authenticate(); 
    console.log("✅ invoice_history_db connected");

  } catch (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  }
};

testConnections();

module.exports = {
  authDB,
  clientDB,
  schemeDB,
  portDB,
  invoiceHistoryDB, // ✅ EXPORTING IT
};
