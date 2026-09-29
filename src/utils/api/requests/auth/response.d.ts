interface LoginResponsePreview {
  accessToken: string;
  expiresAt: string;
  tokenType: 'Bearer';
}

type LoginResponse = ApiResponse<LoginResponsePreview>;
