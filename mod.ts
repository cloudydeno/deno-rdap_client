export const bootstraps = {
  dns: 'https://data.iana.org/rdap/dns.json',
  asn: 'https://data.iana.org/rdap/asn.json',
  ipv4: 'https://data.iana.org/rdap/ipv4.json',
  ipv6: 'https://data.iana.org/rdap/ipv6.json',
};

// https://www.rfc-editor.org/rfc/rfc7482.html
export type QueryType =
| 'ip'
| 'autnum'
| 'domain'
| 'nameserver'
| 'entity'
;

export async function lookupAsn(systemNumber: number) {
  const {services} = await fetch(bootstraps.asn).then(x => x.json()) as BootstrapBody;
  const service = services.find(x => x[0].some(y => checkAsnInRange(y, systemNumber)));
  if (!service) throw new Error(`No match for ASN ${systemNumber}`);
  return await fetch(`${service[1][0]}autnum/${systemNumber}`).then(x => x.json());
}

export async function lookupDomain(domain: string) {
  const tld = domain.slice(domain.lastIndexOf('.')+1);
  const {services} = await fetch(bootstraps.dns).then(x => x.json()) as BootstrapBody;
  const service = services.find(x => x[0].includes(tld));
  if (!service) throw new Error(`No match for TLD ${tld}`);
  return await fetch(`${service[1][0]}domain/${domain}`).then(x => x.json());
}

interface BootstrapBody {
  description: string;
  publication: string;
  services: Array<[Array<string>, Array<string>]>;
  version: '1.0';
}

function checkAsnInRange(range: string, asn: number): boolean {
  const [first, last] = range.split('-').map(x => parseInt(x, 10));
  if (last == null) return first === asn;
  return first <= asn && last >= asn;
}

interface Link {
  value: string;
  rel: 'alternate' | 'related' | 'self';
  type: 'text/html' | 'application/rdap+json';
  href: string;
}

interface Notice {
  title: string;
  description: string[];
  links: Link[];
}
interface Remark {
  description: string[];
}
interface Event {
  eventAction: EventAction[];
  eventActor?: string;
  eventDate: string;
  links?: Link[];
}

// https://www.rfc-editor.org/rfc/rfc7483.html

interface IpNetworkObject {
  objectClassName: 'ip network';
  lang: string;
  rdapConformance: ('rdap_level_0' | 'icann_rdap_technical_implementation_guide_0' | 'icann_rdap_response_profile_0')[];
  notices: Notice[];
  startAddress: string;
  endAddress: string;
  handle: string;
  ipVersion: 'v4' | 'v6';
  name: string;
  parentHandle?: string;
  remarks: Remark[];
}

interface EntityObject {
  objectClassName: 'entity';
  handle: string;
  vcardArray: unknown;
  roles: EntityRole[];
  publicIds: {type: string; identifier: string}[];
  remarks: Remark[];
  links: Link[];
  events: Event[];
  asEventActor: Event[];
  status: ObjectStatus[];
  port43: string;
  networks: IpNetworkObject[];
  // autnums: AutonomousNetworkObject[];
}

interface DomainObject {
  objectClassName: 'domain';
  handle: string;
  ldhName: string;
  remarks: Remark[];
  links: Link[];
  events: Event[];
  asEventActor: Event[];
  status: ObjectStatus[];
  port43: string;
  networks: IpNetworkObject[];
  // autnums: AutonomousNetworkObject[];
}

// https://www.rfc-editor.org/rfc/rfc7483.html#section-10.2.3
type EventAction =
| 'registration'
| 'reregistration'
| 'last changed'
| 'expiration'
| 'deletion'
| 'reinstantiation'
| 'transfer'
| 'locked'
| 'unlocked'
;

// https://www.rfc-editor.org/rfc/rfc7483.html#section-10.2.4
type EntityRole =
/** The entity object instance is the registrant of the registration.  In some registries, this is known as a maintainer. */
| 'registrant'
/** The entity object instance is a technical contact for the registration. */
| 'technical'
/** The entity object instance is an administrative contact for the registration. */
| 'administrative'
/** The entity object instance handles network abuse issues on behalf of the registrant of the registration. */
| 'abuse'
/** The entity object instance handles payment and billing issues on behalf of the registrant of the registration. */
| 'billing'
/** The entity object instance represents the authority responsible for the registration in the registry. */
| 'registrar'
/** The entity object instance represents a third party through which the registration was conducted (i.e., not the registry or registrar). */
| 'reseller'
/** The entity object instance represents a domain policy sponsor, such as an ICANN-approved sponsor. */
| 'sponsor'
/** The entity object instance represents a proxy for another entity object, such as a registrant. */
| 'proxy'
/** An entity object instance designated to receive notifications about association object instances. */
| 'notifications'
/** The entity object instance handles communications related to a network operations center (NOC). */
| 'noc'
;

// https://www.rfc-editor.org/rfc/rfc7483.html#section-10.2.2
type ObjectStatus =
| 'validated'
| 'renew prohibited'
| 'update prohibited'
| 'transfer prohibited'
| 'delete prohibited'
| 'proxy'
| 'private'
| 'removed'
| 'obscured'
| 'associated'
| 'active'
| 'inactive'
| 'locked'
| 'pending create'
| 'pending renew'
| 'pending transfer'
| 'pending update'
| 'pending delete'
;
