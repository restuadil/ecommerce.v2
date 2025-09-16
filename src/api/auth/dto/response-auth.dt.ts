export class RegisterResponseDto {
  username: string;
  email: string;
}

export class LoginResponseDto {
  accessToken: string;
  refreshToken?: string;
}

export const toRegisterResponseDto = (data: RegisterResponseDto): RegisterResponseDto => {
  return {
    username: data.username,
    email: data.email,
  };
};
