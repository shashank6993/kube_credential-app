export interface Credential {
  id: string;
  name: string;
  role: string;
  [key: string]: string;
}

export interface IssuanceResponse {
  message: string;
  timestamp: string;
}

export interface VerificationResponse {
  message: string;
  workerId?: string;
  timestamp?: string;
  credential?: Credential;
}

export interface ErrorResponse {
  error: string;
}
