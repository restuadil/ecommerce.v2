import { UserRole } from "@prisma/client";

export interface UserPayload {
  id: string;
  username: string;
  email: string;
  roles: UserRole[];
}
