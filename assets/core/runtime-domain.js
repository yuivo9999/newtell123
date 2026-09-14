/** v39 canonical domain: runtime-domain */
// All previously extracted leaf regions in this business category are registered here.
// Leaf files remain compatibility seams for older tests/tools; runtime ownership belongs to this domain.
import * as m0 from "./boot-ui.js";
import * as m1 from "./legacy-entrypoint.js";
import * as m2 from "./legacy-foundation.js";
import * as m3 from "./runtime-audit.js";

import { domainCapability } from "./domain-capabilities.js";

export const domainName = "runtime-domain";
export const modules = Object.freeze([m0,
  m1,
  m2,
  m3]);

export function install(deps = {}) {
  const installed = [];
  for (const mod of modules) {
    if (typeof mod.install === "function") {
      const result = mod.install(deps);
      if (result) installed.push(result);
    }
  }
  const api = Object.freeze(Object.assign({}, ...modules, ...installed));
  const registry = window.TellMeLegacyDomains = window.TellMeLegacyDomains || {};
  registry[domainName] = api;
  return api;
}

export const api = Object.freeze(Object.assign({}, ...modules));

export function exposeLegacyWindows() {
  window.TellMeLegacyFoundation = m2;
  window.TellMeLegacyDomains = window.TellMeLegacyDomains || {};
  window.TellMeLegacyDomains[domainName] = window.TellMeLegacyDomains[domainName] || api;
  return true;
}
