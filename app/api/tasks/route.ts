import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getDatabase } from "@/lib/mongodb"
import type { Task } from "@/lib/models"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided")
  }

  const token = authHeader.substring(7)
  return jwt.verify(token, JWT_SECRET) as any
}

export async function GET(request: NextRequest) {
  try {
    const decoded = verifyToken(request)

    const db = await getDatabase()

    let query = {}
    if (decoded.role !== "admin") {
      query = { userId: new ObjectId(decoded.userId) }
    }

    const tasks = await db.collection<Task>("tasks").find(query).toArray()

    // Convert ObjectId to string for JSON response
    const formattedTasks = tasks.map((task) => ({
      ...task,
      id: task._id?.toString(),
      userId: task.userId.toString(),
      _id: undefined,
    }))

    return NextResponse.json(formattedTasks)
  } catch (error) {
    console.error("Get tasks error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = verifyToken(request)
    const { title, description, status, priority, dueDate } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const db = await getDatabase()

    const newTask: Omit<Task, "_id"> = {
      title,
      description: description || "",
      status: status || "pending",
      priority: priority || "medium",
      dueDate: dueDate || "",
      userId: new ObjectId(decoded.userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<Task>("tasks").insertOne(newTask)

    const createdTask = {
      id: result.insertedId.toString(),
      ...newTask,
      userId: newTask.userId.toString(),
    }

    return NextResponse.json(createdTask, { status: 201 })
  } catch (error) {
    console.error("Create task error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
