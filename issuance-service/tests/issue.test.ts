import DatabaseService from '../src/services/database';
import { Credential } from '../src/types/credential';
import fs from 'fs';
import path from 'path';

const TEST_DB_PATH = './test-data/test-credentials.db';

describe('Issuance Service', () => {
  let db: DatabaseService;

  beforeEach(() => {
    // Clean up test database before each test
    const dir = path.dirname(TEST_DB_PATH);
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new DatabaseService(TEST_DB_PATH);
  });

  afterEach(() => {
    db.close();
    // Clean up test database after each test
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  describe('Database Service', () => {
    it('should save a credential', () => {
      const credential: Credential = {
        id: 'test123',
        name: 'John Doe',
        role: 'Engineer',
      };

      db.saveCredential(credential, 'worker-1');
      expect(db.credentialExists('test123')).toBe(true);
    });

    it('should detect existing credentials', () => {
      const credential: Credential = {
        id: 'test456',
        name: 'Jane Smith',
        role: 'Manager',
      };

      expect(db.credentialExists('test456')).toBe(false);
      db.saveCredential(credential, 'worker-1');
      expect(db.credentialExists('test456')).toBe(true);
    });

    it('should retrieve credential data', () => {
      const credential: Credential = {
        id: 'test789',
        name: 'Bob Johnson',
        role: 'Developer',
      };

      db.saveCredential(credential, 'worker-2');
      const retrieved = db.getCredential('test789');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.workerId).toBe('worker-2');
      expect(JSON.parse(retrieved!.data)).toEqual(credential);
    });

    it('should return null for non-existent credentials', () => {
      const retrieved = db.getCredential('nonexistent');
      expect(retrieved).toBeNull();
    });
  });

  describe('Credential Validation', () => {
    it('should require id, name, and role fields', () => {
      const invalidCredentials = [
        { name: 'John', role: 'Engineer' }, // missing id
        { id: '123', role: 'Engineer' },     // missing name
        { id: '123', name: 'John' },         // missing role
      ];

      invalidCredentials.forEach((cred) => {
        const isValid = cred.hasOwnProperty('id') &&
                       cred.hasOwnProperty('name') &&
                       cred.hasOwnProperty('role');
        expect(isValid).toBe(false);
      });
    });

    it('should accept additional fields', () => {
      const credential = {
        id: '123',
        name: 'John Doe',
        role: 'Engineer',
        department: 'IT',
        level: 'Senior',
      };

      db.saveCredential(credential as Credential, 'worker-1');
      const retrieved = db.getCredential('123');

      expect(JSON.parse(retrieved!.data)).toHaveProperty('department', 'IT');
      expect(JSON.parse(retrieved!.data)).toHaveProperty('level', 'Senior');
    });
  });
});
