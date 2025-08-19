import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  password: string
  name: string
  role: "admin" | "user"
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  _id?: ObjectId
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate: string
  userId: ObjectId
  createdAt: Date
  updatedAt: Date
}
