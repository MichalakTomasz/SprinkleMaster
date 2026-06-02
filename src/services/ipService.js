import os from 'os'

const PORT = 3200
const DEFAULT_RETRIES = 10
const DEFAULT_DELAY_MS = 1000
const FALLBACK_ADDRESS = `sprinkle-master:${PORT}`

const wait = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs))

const resolveServerIP = () => {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    if (!interfaces) {
      continue;
    }

    for (const iface of interfaces) {
      if ((iface.family === 'IPv4' || iface.family === 4) && !iface.internal) {
        return `${iface.address}:${PORT}`;
      }
    }
  }

  return null;
}

const getServerIP = async ({ retries = DEFAULT_RETRIES, delayMs = DEFAULT_DELAY_MS } = {}) => {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const ipAddress = resolveServerIP()
    if (ipAddress) {
      return ipAddress
    }

    if (attempt < retries) {
      await wait(delayMs)
    }
  }

  return FALLBACK_ADDRESS;
}

export default getServerIP