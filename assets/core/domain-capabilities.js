/** v46 explicit runtime capability bridge.
 * Browser bootstrap still registers legacy domain APIs on window, but every
 * cross-domain call is now checked against a static capability allow-list.
 */
'use strict';
import { allowedCapability, capabilityPolicy } from './capability-policy.js';

const REGISTRY_KEY = 'TellMeLegacyDomains';
function registry(){ return typeof window==='undefined' ? null : window[REGISTRY_KEY]||null; }

export function domainCapability(domain,name,...args){
  if(!allowedCapability(domain,name)) throw new Error(`[domain-capabilities] forbidden capability: ${domain}.${name}`);
  const api=registry()?.[domain], fn=api?.[name];
  if(typeof fn!=='function') throw new Error(`[domain-capabilities] unavailable: ${domain}.${name}`);
  return Reflect.apply(fn,api,args);
}
export function hasDomainCapability(domain,name){ return allowedCapability(domain,name) && typeof registry()?.[domain]?.[name]==='function'; }
export function domainCapabilitySnapshot(){
  const r=registry()||{};
  return Object.freeze(Object.fromEntries(Object.entries(capabilityPolicy()).map(([domain,names])=>[
    domain,Object.freeze(names.filter(name=>typeof r[domain]?.[name]==='function'))
  ])));
}
export { capabilityPolicy };
