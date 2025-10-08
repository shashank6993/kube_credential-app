import os from 'os';

export const getWorkerId = (): string => {
  // Use hostname in Kubernetes/Docker, or generate from hostname
  const hostname = os.hostname();

  // If running in Kubernetes, hostname will be like "issuance-deployment-xyz123-abc45"
  // Extract a meaningful worker ID
  const match = hostname.match(/worker-(\d+)|(\w+)-(\w+)$/);

  if (match) {
    return `worker-${hostname.slice(-8)}`;
  }

  return `worker-${hostname}`;
};
