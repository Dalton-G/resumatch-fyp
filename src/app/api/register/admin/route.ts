import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { adminRegistrationSchema } from "@/schema/auth-schema";
import { AdminUserCreationModel } from "@/lib/model/user-model";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = adminRegistrationSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        error: validation.error.format(),
      },
      { status: 400 }
    );
  }

  const { firstName, lastName, email, password } = validation.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Email already exists" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user: AdminUserCreationModel = {
    name: `${firstName} ${lastName}`,
    email,
    password: hashedPassword,
    role: UserRole.ADMIN,
    adminProfile: {
      firstName,
      lastName,
    },
  };

  const newUser = await prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      adminProfile: {
        create: user.adminProfile,
      },
    },
  });

  return NextResponse.json(
    {
      message: "Admin registered successfully",
      admin: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    },
    { status: 201 }
  );
}
