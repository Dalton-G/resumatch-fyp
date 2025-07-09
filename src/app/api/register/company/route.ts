import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { companyRegistrationSchema } from "@/schema/auth-schema";
import { CompanyUserCreationModel } from "@/lib/model/user-model";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = companyRegistrationSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        error: validation.error.format(),
      },
      { status: 400 }
    );
  }

  const {
    email,
    password,
    companyName,
    companyDescription,
    companyWebsite,
    companyIndustry,
    companySize,
    companyAddress,
    companyLogo,
  } = validation.data;

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

  const user: CompanyUserCreationModel = {
    name: companyName,
    email: email,
    password: hashedPassword,
    role: UserRole.COMPANY,
    image: companyLogo,
    companyProfile: {
      name: companyName,
      description: companyDescription,
      website: companyWebsite,
      industry: companyIndustry,
      size: companySize,
      address: companyAddress,
      logoUrl: companyLogo,
    },
  };

  const newCompany = await prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      companyProfile: {
        create: user.companyProfile,
      },
    },
  });

  return NextResponse.json(
    {
      message: "Company registered successfully",
      company: {
        id: newCompany.id,
        email: newCompany.email,
        role: newCompany.role,
      },
    },
    { status: 201 }
  );
}
