import { useState, FormEvent } from 'react';
import { verifyCredential } from '../services/api';
import { Credential, VerificationResponse } from '../types/credential';

function VerifyPage() {
  const [formData, setFormData] = useState<Credential>({
    id: '',
    name: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<VerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await verifyCredential(formData);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify credential');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Credential, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Verify Credential</h2>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="id">Credential ID</label>
          <input
            id="id"
            type="text"
            value={formData.id}
            onChange={(e) => handleChange('id', e.target.value)}
            placeholder="e.g., abc123"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., John Doe"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <input
            id="role"
            type="text"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            placeholder="e.g., Engineer"
            required
          />
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Credential'}
        </button>
      </form>

      {response && (
        <div className="alert alert-success">
          <strong>✅ {response.message}</strong>
          <div className="result-details">
            <p><strong>Issued by:</strong> {response.workerId}</p>
            <p><strong>Timestamp:</strong> {response.timestamp ? new Date(response.timestamp).toLocaleString() : 'N/A'}</p>
            {response.credential && (
              <>
                <p><strong>ID:</strong> {response.credential.id}</p>
                <p><strong>Name:</strong> {response.credential.name}</p>
                <p><strong>Role:</strong> {response.credential.role}</p>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <strong>❌ Error:</strong> {error}
        </div>
      )}
    </div>
  );
}

export default VerifyPage;
