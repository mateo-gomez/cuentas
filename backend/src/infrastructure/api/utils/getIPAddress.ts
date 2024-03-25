export function getIPAddress() {
  const interfaces = Deno.networkInterfaces();

  const iface = interfaces.find((iface) =>
    iface.family === "IPv4" && iface.address.startsWith("192.168.0")
  );

  return iface?.address || "0.0.0.0";
}
