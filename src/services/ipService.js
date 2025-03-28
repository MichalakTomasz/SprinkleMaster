import os from 'os'

const getServerIP = () => {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return `${iface.address}:3200`;
      }
    }
  }
  return 'sprinkle-master:3200';
}

export default getServerIP