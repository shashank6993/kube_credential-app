import { useState, FormEvent } from 'react';
import { issueCredential } from '../services/api';
import { Credential, IssuanceResponse } from '../types/credential';

function IssuePage() {
  const [formData, setFormData] = useState<Credential>({
    id: '',
    name: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<IssuanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await issueCredential(formData);
      setResponse(result);
      setFormData({ id: '', name: '', role: '' }); // Reset form
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to issue credential');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Credential, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Issue Credential</h2>

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
          {loading ? 'Issuing...' : 'Issue Credential'}
        </button>
      </form>

      {response && (
        <div className="alert alert-success">
          <strong>✅ Success!</strong>
          <div className="result-details">
            <p><strong>Message:</strong> {response.message}</p>
            <p><strong>Timestamp:</strong> {new Date(response.timestamp).toLocaleString()}</p>
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

export default IssuePage;
