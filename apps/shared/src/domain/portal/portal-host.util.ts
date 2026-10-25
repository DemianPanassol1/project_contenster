const DOMAIN_PATTERN =
  /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/;
const LOCALHOST_PATTERN = /^localhost(?::([0-9]{1,5}))?$/;
const IPV6_LOOPBACK_PATTERN = /^\[::1\](?::([0-9]{1,5}))?$/;

export const normalizePortalHost = (rawHost: string): string | null => {
  const value = rawHost.trim().toLowerCase();
  const localhost = LOCALHOST_PATTERN.exec(value);

  if (localhost) {
    const port = localhost[1] === undefined ? null : Number(localhost[1]);

    return port === null || (port >= 1 && port <= 65_535) ? value : null;
  }

  const ipv6Loopback = IPV6_LOOPBACK_PATTERN.exec(value);

  if (ipv6Loopback) {
    const port = ipv6Loopback[1] === undefined ? null : Number(ipv6Loopback[1]);

    return port === null || (port >= 1 && port <= 65_535) ? value : null;
  }

  const hostWithPort = /^(?<host>.+):(?<port>[0-9]{1,5})$/.exec(value);
  const host = (hostWithPort?.groups?.host ?? value).replace(/\.$/, '');
  const port = hostWithPort?.groups?.port === undefined ? null : Number(hostWithPort.groups.port);

  if (port !== null && (port < 1 || port > 65_535)) return null;

  return DOMAIN_PATTERN.test(host) ? host : null;
};
