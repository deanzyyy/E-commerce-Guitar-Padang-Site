import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/app/lib/auth";

// Admin credentials (hardcoded for security)
const ADMIN_EMAIL = "admingp@gmail.com";
const ADMIN_PASSWORD = "admingp123";
const ADMIN_USERNAME = "Admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Cek apakah ini adalah admin login
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      if (password === ADMIN_PASSWORD) {
        // Cek atau buat admin user di database
        let adminUser = await prisma.user.findUnique({
          where: { email: ADMIN_EMAIL.toLowerCase() },
        });

        if (!adminUser) {
          // Buat admin user jika belum ada
          const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
          adminUser = await prisma.user.create({
            data: {
              username: ADMIN_USERNAME,
              email: ADMIN_EMAIL.toLowerCase(),
              password: hashedPassword,
              role: "ADMIN",
            },
          });
        } else if (adminUser.role !== "ADMIN") {
          // Update role jika user sudah ada tapi bukan admin
          adminUser = await prisma.user.update({
            where: { id_user: adminUser.id_user },
            data: { role: "ADMIN" },
          });
        }

        // Create session
        await createSession({
          id_user: adminUser.id_user,
          username: adminUser.username,
          email: adminUser.email,
          role: "ADMIN",
        });

        return NextResponse.json(
          {
            message: "Login berhasil sebagai admin",
            user: {
              id_user: adminUser.id_user,
              username: adminUser.username,
              email: adminUser.email,
              role: "ADMIN",
            },
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: "Email atau password salah" },
          { status: 401 }
        );
      }
    }

    // Login untuk user biasa
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Create session
    await createSession({
      id_user: user.id_user,
      username: user.username,
      email: user.email,
      role: user.role as "USER" | "ADMIN",
    });

    return NextResponse.json(
      {
        message: "Login berhasil",
        user: {
          id_user: user.id_user,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  }
}

