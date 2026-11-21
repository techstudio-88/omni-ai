import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function isPrivateIpv4(value: string): boolean {
  const octets = value.split(".").map(Number);
  return octets.length !== 4 || octets[0] === 10 || octets[0] === 127 || octets[0] === 0 || octets[0] >= 224 ||
    octets[0] === 169 && octets[1] === 254 || octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31 || octets[0] === 192 && octets[1] === 168;
}
function isPrivateIpv6(value: string): boolean {
  const v = value.toLowerCase();
  return v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80") || v.startsWith("::ffff:127.") || v.startsWith("::ffff:10.");
}
async function validatePublicUrl(input: string): Promise<URL> {
  const url = new URL(input);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("Only public HTTP or HTTPS URLs are allowed.");
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) throw new Error("Private network addresses are blocked.");
  const ipType = isIP(host);
  if (ipType === 4 && isPrivateIpv4(host) || ipType === 6 && isPrivateIpv6(host)) throw new Error("Private network addresses are blocked.");
  if (!ipType) {
    const addresses = await lookup(host, { all: true });
    if (!addresses.length || addresses.some((entry) => isIP(entry.address) === 4 ? isPrivateIpv4(entry.address) : isPrivateIpv6(entry.address))) throw new Error("Private network addresses are blocked.");
  }
  return url;
}
export async function readPublicUrl(input: string): Promise<{ title: string; url: string; text: string }> {
  let target = await validatePublicUrl(input);
  for (let redirect = 0; redirect <= 3; redirect++) {
    const response = await fetch(target, { redirect: "manual", signal: AbortSignal.timeout(8_000), headers: { "User-Agent": "OmniBrainLinkReader/1.0", Accept: "text/html,text/plain" } });
    if ([301,302,303,307,308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location || redirect === 3) throw new Error("Too many redirects.");
      target = await validatePublicUrl(new URL(location, target).toString());
      continue;
    }
    if (!response.ok) throw new Error("The URL could not be read.");
    const type = response.headers.get("content-type") ?? "";
    if (!/text\/html|text\/plain/i.test(type)) throw new Error("Only public web pages and text files can be read.");
    const html = (await response.text()).slice(0, 1_000_000);
    const text = type.includes("html") ? html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim() : html;
    return { title: target.hostname, url: target.toString(), text: text.slice(0, 30_000) };
  }
  throw new Error("The URL could not be read.");
}
