import { UserRole, UserStatus } from "@prisma/client";

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  roles: UserRole[];
  status: UserStatus;
  activation_code: string;
  activationExpiresAt: Date;
}
