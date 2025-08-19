import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { getDatabase } from "@/lib/mongodb"
import type { User } from "@/lib/models"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    const db = await getDatabase()
    const existingUser = await db.collection<User>("users").findOne({ email })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser: Omit<User, "_id"> = {
      email,
      password: hashedPassword,
      name,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<User>("users").insertOne(newUser)

    const token = jwt.sign(
      {
        userId: result.insertedId.toString(),
        email: newUser.email,
        role: newUser.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    return NextResponse.json({
      token,
      user: {
        id: result.insertedId.toString(),
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
