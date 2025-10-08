import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import IssuePage from '../pages/IssuePage';
import * as api from '../services/api';

vi.mock('../services/api');

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('IssuePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the issue form', () => {
    renderWithRouter(<IssuePage />);

    expect(screen.getByText('Issue Credential')).toBeInTheDocument();
    expect(screen.getByLabelText('Credential ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /issue credential/i })).toBeInTheDocument();
  });

  it('handles successful credential issuance', async () => {
    const mockResponse = {
      message: 'credential issued by worker-1',
      timestamp: '2025-10-07T10:00:00Z',
    };

    vi.mocked(api.issueCredential).mockResolvedValueOnce(mockResponse);

    renderWithRouter(<IssuePage />);

    fireEvent.change(screen.getByLabelText('Credential ID'), { target: { value: 'test123' } });
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'Engineer' } });

    fireEvent.click(screen.getByRole('button', { name: /issue credential/i }));

    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
      expect(screen.getByText(/credential issued by worker-1/i)).toBeInTheDocument();
    });
  });

  it('handles credential issuance error', async () => {
    vi.mocked(api.issueCredential).mockRejectedValueOnce(new Error('credential already issued'));

    renderWithRouter(<IssuePage />);

    fireEvent.change(screen.getByLabelText('Credential ID'), { target: { value: 'test123' } });
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'Engineer' } });

    fireEvent.click(screen.getByRole('button', { name: /issue credential/i }));

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.getByText(/credential already issued/i)).toBeInTheDocument();
    });
  });

  it('requires all fields to be filled', () => {
    renderWithRouter(<IssuePage />);

    const submitButton = screen.getByRole('button', { name: /issue credential/i });
    const idInput = screen.getByLabelText('Credential ID') as HTMLInputElement;
    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    const roleInput = screen.getByLabelText('Role') as HTMLInputElement;

    expect(idInput.required).toBe(true);
    expect(nameInput.required).toBe(true);
    expect(roleInput.required).toBe(true);
  });
});
