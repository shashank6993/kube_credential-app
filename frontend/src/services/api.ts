import axios, { AxiosError } from 'axios';
import { Credential, IssuanceResponse, VerificationResponse, ErrorResponse } from '../types/credential';

const ISSUANCE_API_URL = import.meta.env.VITE_ISSUANCE_API_URL || 'http://localhost:3000';
const VERIFICATION_API_URL = import.meta.env.VITE_VERIFICATION_API_URL || 'http://localhost:3001';

export const issueCredential = async (credential: Credential): Promise<IssuanceResponse> => {
  try {
    const response = await axios.post<IssuanceResponse>(
      `${ISSUANCE_API_URL}/issue`,
      credential
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse | IssuanceResponse>;
      if (axiosError.response?.data) {
        throw new Error((axiosError.response.data as any).error || (axiosError.response.data as any).message);
      }
    }
    throw new Error('Failed to issue credential');
  }
};

export const verifyCredential = async (credential: Credential): Promise<VerificationResponse> => {
  try {
    const response = await axios.post<VerificationResponse>(
      `${VERIFICATION_API_URL}/verify`,
      credential
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data) {
        throw new Error(axiosError.response.data.error);
      }
    }
    throw new Error('Failed to verify credential');
  }
};
