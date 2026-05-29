export interface TokenGenerator {
  generateTokens(
    userId: string,
  ): Promise<{ access_token: string; refresh_token: string }>;
}
