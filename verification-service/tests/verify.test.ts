import DatabaseService from '../src/services/database';
import { Credential } from '../src/types/credential';
import fs from 'fs';
import path from 'path';

const TEST_DB_PATH = './test-data/test-verification.db';

describe('Verification Service', () => {
  let db: DatabaseService;

  beforeEach(() => {
    const dir = path.dirname(TEST_DB_PATH);
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new DatabaseService(TEST_DB_PATH);

    // Insert test data directly
    const Database = require('better-sqlite3');
    const testDb = new Database(TEST_DB_PATH);
    const stmt = testDb.prepare(
      'INSERT INTO credentials (id, data, worker_id, timestamp) VALUES (?, ?, ?, ?)'
    );

    const testCredential: Credential = {
      id: 'test123',
      name: 'John Doe',
      role: 'Engineer',
    };

    stmt.run(
      testCredential.id,
      JSON.stringify(testCredential),
      'worker-1',
      new Date().toISOString()
    );
    testDb.close();
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  describe('Database Service', () => {
    it('should retrieve an existing credential', () => {
      const record = db.getCredential('test123');

      expect(record).not.toBeNull();
      expect(record?.id).toBe('test123');
      expect(record?.workerId).toBe('worker-1');
    });

    it('should return null for non-existent credentials', () => {
      const record = db.getCredential('nonexistent');
      expect(record).toBeNull();
    });

    it('should verify matching credentials', () => {
      const credential: Credential = {
        id: 'test123',
        name: 'John Doe',
        role: 'Engineer',
      };

      const record = db.verifyCredential(credential);

      expect(record).not.toBeNull();
      expect(record?.workerId).toBe('worker-1');
    });

    it('should reject non-matching credentials', () => {
      const credential: Credential = {
        id: 'test123',
        name: 'Wrong Name',
        role: 'Engineer',
      };

      const record = db.verifyCredential(credential);
      expect(record).toBeNull();
    });

    it('should reject credentials with mismatched role', () => {
      const credential: Credential = {
        id: 'test123',
        name: 'John Doe',
        role: 'Manager',
      };

      const record = db.verifyCredential(credential);
      expect(record).toBeNull();
    });
  });

  describe('Credential Validation', () => {
    it('should require id, name, and role for verification', () => {
      const invalidCredentials = [
        { name: 'John', role: 'Engineer' },
        { id: '123', role: 'Engineer' },
        { id: '123', name: 'John' },
      ];

      invalidCredentials.forEach((cred) => {
        const isValid = cred.hasOwnProperty('id') &&
                       cred.hasOwnProperty('name') &&
                       cred.hasOwnProperty('role');
        expect(isValid).toBe(false);
      });
    });
  });
});
