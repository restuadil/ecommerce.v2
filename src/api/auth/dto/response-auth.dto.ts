import { ResponseUserDto } from "src/api/users/dto/response-user.dto";

export interface RegisterResponseDto {
  username: string;
  email: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken?: string;
}

export const toRegisterResponseDto = (data: ResponseUserDto): RegisterResponseDto => {
  return {
    username: data.username,
    email: data.email,
  };
};
