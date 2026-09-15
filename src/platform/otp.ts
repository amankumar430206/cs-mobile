// MSG91's web OTP widget can't run natively. A native provider (MSG91's mobile SDK against
// a mobile-specific widget config) plugs in here; cs-api only ever receives the access token
// `verify` resolves with, exactly as it does from cs-web. Null until that config exists, and
// the verify-otp / forgot-password screens fall back to pointing users at the web app.
export interface OtpProvider {
  send(identifier: string): Promise<void>;
  resend(): Promise<void>;
  verify(code: string): Promise<string>;
}

export const otpProvider: OtpProvider | null = null;
