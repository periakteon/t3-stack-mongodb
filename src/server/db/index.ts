/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Db, MongoClient, type MongoClientOptions } from "mongodb";

import { env } from "~/env.mjs";

declare global {
  var _clientPromise: Promise<MongoClient>;
  var _dbPromise: Promise<Db>;
}

const uri = env.DATABASE_URL;
const options: MongoClientOptions = {};

const getClient = () => {
  const client = new MongoClient(uri, options);
  return client.connect();
};

const getDb = async (clientPromise: Promise<MongoClient>) => {
  const client = await clientPromise;
  const connection = await client.connect();
  return connection.db(env.DB_NAME);
};

export let clientPromise: Promise<MongoClient>;
export let dbPromise: Promise<Db>;

if (env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._clientPromise) {
    global._clientPromise = getClient();
  }

  clientPromise = global._clientPromise;

  if (!global._dbPromise) {
    global._dbPromise = getDb(clientPromise);
  }

  dbPromise = global._dbPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = getClient();
  dbPromise = getDb(clientPromise);
}
