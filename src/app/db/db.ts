import { UserRole } from '@prisma/client';

import bcrypt from "bcryptjs";
import prisma from "../../shared/prisma";

export const initiateSuperAdmin = async () => {
  const payload = {
    name: "Super Admin",
    email: "superadmin@yopmail.com",
    password: "123456",
    role: UserRole.ADMIN,
  };

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingSuperAdmin) {
    return;
  }

  interface SuperAdminPayload {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }

  interface Admin {
    id: number;
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
  }

  await prisma.$transaction(async (TransactionClient: any): Promise<void> => {
    const hashedPassword: string = await bcrypt.hash(payload.password, 12);

    const admin: Admin = await TransactionClient.user.create({
      data: {
        fullName: payload.name,
        email: payload.email,
        password: hashedPassword,
        role: payload.role,
      },
    });

    await TransactionClient.revenue.create({
      data: {
        adminId: admin.id,
      },
    });
  });
};
