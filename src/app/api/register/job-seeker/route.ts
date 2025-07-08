import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { jobSeekerSignUpSchema } from "@/schema/auth-schema";
import { JobSeekerUserCreationModel } from "@/lib/model/user-model";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = jobSeekerSignUpSchema.safeParse(body);
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

  const user: JobSeekerUserCreationModel = {
    name: `${firstName} ${lastName}`,
    email,
    password: hashedPassword,
    role: UserRole.JOB_SEEKER,
    jobSeekerProfile: {
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
      jobSeekerProfile: {
        create: user.jobSeekerProfile,
      },
    },
  });

  return NextResponse.json(
    {
      message: "User registered successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    },
    { status: 201 }
  );
}
