interface LoginResponsePreview {
  accessToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
}

type LoginResponse = ApiResponse<LoginResponsePreview>;
