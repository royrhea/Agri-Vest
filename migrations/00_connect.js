// Set DNS servers programmatically to bypass loopback DNS issues in node environment
require('dns').setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const { MongoClient } = require('mongodb');

const URI = "mongodb+srv://royrishita744_db_user:dk5jAUszdOjMZ3ls@cluster0.kzfs2rf.mongodb.net/?appName=Cluster0";
const DB_NAME = "agrivest_db";

let client = null;

async function connect() {
  if (!client) {
    client = new MongoClient(URI);
    await client.connect();
  }
  return client.db(DB_NAME);
}

async function close() {
  if (client) {
    await client.close();
    client = null;
  }
}

module.exports = {
  connect,
  close,
  URI,
  DB_NAME
};
