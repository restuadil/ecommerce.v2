import { User } from "@prisma/client";

export class RegisterResponseDto {
  username: string;
  email: string;
}

export class LoginResponseDto {
  accessToken: string;
  refreshToken?: string;
}

export class MeResponseDto {
  id: string;
  email: string;
  username: string;
  roles: string[];
  status: string;
  fullName?: string | null;
  phone?: string | null;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const toRegisterResponseDto = (data: RegisterResponseDto): RegisterResponseDto => {
  return {
    username: data.username,
    email: data.email,
  };
};

export const toMeResponseDto = (data: User): MeResponseDto => {
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    roles: data.roles,
    status: data.status,
    fullName: data.fullName,
    phone: data.phone,
    avatar: data.avatar,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};
