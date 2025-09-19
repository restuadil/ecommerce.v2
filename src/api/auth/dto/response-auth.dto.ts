import { User } from "@prisma/client";

export interface RegisterResponseDto {
  username: string;
  email: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken?: string;
}

export const toRegisterResponseDto = (data: User): RegisterResponseDto => {
  return {
    username: data.username,
    email: data.email,
  };
};
