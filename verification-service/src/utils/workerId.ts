import os from 'os';

export const getWorkerId = (): string => {
  const hostname = os.hostname();
  const match = hostname.match(/worker-(\d+)|(\w+)-(\w+)$/);

  if (match) {
    return `worker-${hostname.slice(-8)}`;
  }

  return `worker-${hostname}`;
};
