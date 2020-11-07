// deno install --name rdap --allow-{read,write}=$XDG_RUNTIME_DIR/rdap-bootstrap --allow-net cmd.ts
import { lookupAsn, lookupDomain } from "./mod.ts";

switch (Deno.args[0]) {

  case 'asn': {
    const asn = Deno.args[1];
    if (!asn) break;
    const asNum = parseInt(asn, 10);
    console.log(await lookupAsn(asNum));
    Deno.exit(0);
  }

  case 'domain': {
    const domain = Deno.args[1];
    if (!domain) break;
    console.log(await lookupDomain(domain));
    Deno.exit(0);
  }

}
