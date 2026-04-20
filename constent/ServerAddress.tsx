const RAW_BASE =
  process.env.NEXT_PUBLIC_UMA_API_URL?.replace(/\/+$/, '') ??
  'http://127.0.0.1:8000';

const ServerAddress = `${RAW_BASE}/api`;

export default ServerAddress;
