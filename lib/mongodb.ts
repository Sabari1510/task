import { MongoClient, type Db } from "mongodb"

const MONGODB_URI =
  "mongodb+srv://groktech15:iPJ3tsnK2qQuE1tx@week5n.flmezgc.mongodb.net/?retryWrites=true&w=majority&appName=week5n"

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(MONGODB_URI)
  clientPromise = client.connect()
}

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db("taskmanager")
}

export default clientPromise
