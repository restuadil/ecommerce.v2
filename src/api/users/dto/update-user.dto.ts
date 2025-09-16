import { UserRole, UserStatus } from "@prisma/client";

export interface UpdateUserDto {
  email?: string;
  username?: string;
  password?: string;
  fullName?: string | null;
  phoneNumber?: string | null;
  avatar?: string | null;
  status?: UserStatus;
  roles?: UserRole[];
  activation_code?: string | null;
  activationExpiresAt?: Date | null;
}
