import { Store, UserRole } from "@prisma/client";

export interface UserWithRelations {
  id: string;
  email: string;
  username: string;
  password: string;
  roles: UserRole[];
  status: string;
  activation_code: string | null;
  activationExpiresAt: Date | null;
  fullName: string | null;
  phone: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
  Store?: Store;
}

export interface ResponseUserDto {
  id: string;
  email: string;
  username: string;
  roles: UserRole[];
  status: string;
  password: string;
  activation_code?: string | null;
  activationExpiresAt?: Date | null;
  fullName?: string | null;
  phone?: string | null;
  avatar?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  storeId: string | null;
}

export const toResponseUserDto = (user: UserWithRelations): ResponseUserDto => {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    password: user.password,
    roles: user.roles,
    status: user.status,
    activation_code: user.activation_code,
    activationExpiresAt: user.activationExpiresAt,
    fullName: user.fullName,
    phone: user.phone,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    storeId: user.Store?.id || null,
  };
};
