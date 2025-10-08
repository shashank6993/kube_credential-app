export interface Credential {
  id: string;
  name: string;
  role: string;
  [key: string]: string; // Allow additional fields
}

export interface IssuanceResponse {
  message: string;
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
}
