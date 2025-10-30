import { type Collection, type Db, MongoClient, type ObjectId } from "mongodb";

let db: Db;
let client: MongoClient;

export interface Snippet {
	_id?: ObjectId;
	title: string;
	code: string;
	createdAt: Date;
}

export const connectDB = async (): Promise<Db> => {
	if (db) return db;

	const mongoUrl = process.env.MONGODB_URL || "mongodb://localhost:27017";
	client = new MongoClient(mongoUrl);

	try {
		await client.connect();
		console.log("✅ Connected to MongoDB");

		db = client.db("kastor_suite");

		// Create indexes if needed
		await db.collection("snippets").createIndex({ createdAt: -1 });

		return db;
	} catch (error) {
		console.log("❌ MongoDB connection failed:", error);
		throw error;
	}
};

export const getSnippetsCollection = (): Collection<Snippet> => {
	if (!db) {
		throw new Error("Database not connected. Call connectDB() first.");
	}
	return db.collection<Snippet>("snippets");
};

export const closeConnection = async (): Promise<void> => {
	if (client) {
		await client.close();
		console.log("✅ MongoDB connection closed");
	}
};
