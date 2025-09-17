import { UserRole, UserStatus } from "@prisma/client";

export interface ResponseUserDto {
  id: string;
  email: string;
  username: string;
  password: string;
  roles: UserRole[];
  status: UserStatus;
  activation_code: string | null;
  activationExpiresAt: Date | null;
  fullName: string | null;
  phone: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}
