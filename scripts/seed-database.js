import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

const MONGODB_URI =
  "mongodb+srv://groktech15:iPJ3tsnK2qQuE1tx@week5n.flmezgc.mongodb.net/?retryWrites=true&w=majority&appName=week5n"

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db("taskmanager")

    // Clear existing data
    await db.collection("users").deleteMany({})
    await db.collection("tasks").deleteMany({})

    // Create demo users
    const hashedPassword = await bcrypt.hash("password", 10)

    const users = [
      {
        email: "admin@example.com",
        password: hashedPassword,
        name: "Admin User",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "user@example.com",
        password: hashedPassword,
        name: "Regular User",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const userResult = await db.collection("users").insertMany(users)
    const adminId = userResult.insertedIds[0]
    const userId = userResult.insertedIds[1]

    // Create demo tasks
    const tasks = [
      {
        title: "Complete project proposal",
        description: "Write and submit the Q4 project proposal",
        status: "in-progress",
        priority: "high",
        dueDate: "2024-12-31",
        userId: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Review team performance",
        description: "Conduct quarterly performance reviews",
        status: "pending",
        priority: "medium",
        dueDate: "2024-12-25",
        userId: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Update documentation",
        description: "Update API documentation for new features",
        status: "pending",
        priority: "low",
        dueDate: "2024-12-20",
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await db.collection("tasks").insertMany(tasks)

    console.log("Database seeded successfully!")
    console.log(`Created ${users.length} users and ${tasks.length} tasks`)
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
