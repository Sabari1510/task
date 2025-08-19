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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const decoded = verifyToken(request)
    const { title, description, status, priority, dueDate } = await request.json()

    const db = await getDatabase()
    const task = await db.collection<Task>("tasks").findOne({ _id: new ObjectId(params.id) })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    if (task.userId.toString() !== decoded.userId && decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updateData = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(dueDate !== undefined && { dueDate }),
      updatedAt: new Date(),
    }

    const result = await db
      .collection<Task>("tasks")
      .findOneAndUpdate({ _id: new ObjectId(params.id) }, { $set: updateData }, { returnDocument: "after" })

    if (!result) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const updatedTask = {
      ...result,
      id: result._id?.toString(),
      userId: result.userId.toString(),
      _id: undefined,
    }

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Update task error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const decoded = verifyToken(request)

    const db = await getDatabase()
    const task = await db.collection<Task>("tasks").findOne({ _id: new ObjectId(params.id) })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    if (task.userId.toString() !== decoded.userId && decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await db.collection<Task>("tasks").deleteOne({ _id: new ObjectId(params.id) })

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Delete task error:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
