export interface CookieResponse {
  clearCookie(
    name: string,
    options: { httpOnly: true; path: string; sameSite: 'lax'; secure: boolean },
  ): void;
  cookie(
    name: string,
    value: string,
    options: { httpOnly: true; maxAge: number; path: string; sameSite: 'lax'; secure: boolean },
  ): void;
}
