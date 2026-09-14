/** v41 consolidated module: ai-core.js */
// ---- merged source: ai-json.js ----
const _m0 = (() => {
/** TellMe123 AI JSON/text parsing utilities.
 * Pure, dependency-free functions extracted from the legacy runtime. */
function robustParseJson(text) {
  if (!text) throw new Error('模型返回为空');
  let t = String(text).trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  try { return JSON.parse(t); } catch {}
  const m = t.match(/[\{\[]\s*[\s\S]*[\}\]]/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  const fix = t.replace(/[\u201c\u201d]/g, '"').replace(/[\u2018\u2019]/g, "'").replace(/,\s*([}\]])/g, '$1');
  try { return JSON.parse(fix); } catch {}
  const obj = {};
  const re = /"([^"]+)"\s*:\s*("([^"]*)"|\[[\s\S]*?\]|\{[\s\S]*?\})/g;
  let mm;
  while ((mm = re.exec(t)) !== null) {
    try { obj[mm[1]] = JSON.parse(mm[2]); } catch { obj[mm[1]] = mm[2]; }
  }
  if (Object.keys(obj).length) return obj;
  throw new Error('返回不是合法 JSON（已原样保留）');
}

function parseJson(text) { return robustParseJson(text); }

function unwrapAIResult(res) { return (res && typeof res === 'object' && 'text' in res) ? res.text : String(res ?? ''); }

function extractJsonObject(text) {
  if (!text) return null;
  const t = String(text).trim();
  try { return JSON.parse(t); } catch {}
  const m = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) { try { return JSON.parse(m[1].trim()); } catch {} }
  const obj = t.match(/\{[\s\S]*\}/);
  if (obj) { try { return JSON.parse(obj[0]); } catch {} }
  const arr = t.match(/\[[\s\S]*\]/);
  if (arr) { try { return JSON.parse(arr[0]); } catch {} }
  return null;
}

function extractFirstObject(text) {
  const t = String(text ?? '');
  try { const p = JSON.parse(t); if (p && typeof p === 'object' && !Array.isArray(p)) return p; } catch {}
  const m = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) { try { const p = JSON.parse(m[1].trim()); if (p && typeof p === 'object' && !Array.isArray(p)) return p; } catch {} }
  let depth = 0, start = -1, inStr = false, esc = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (esc) { esc = false; continue; }
    if (c === '\\' && inStr) { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '{') { if (start < 0) start = i; depth++; }
    else if (c === '}') {
      depth--;
      if (start >= 0 && depth === 0) {
        try { const o = JSON.parse(t.slice(start, i + 1)); if (o && typeof o === 'object' && !Array.isArray(o)) return o; } catch {}
        start = -1;
      }
    }
  }
  return null;
}

Object.assign(window, { parseJson, robustParseJson, unwrapAIResult, extractJsonObject, extractFirstObject });

return Object.freeze({robustParseJson, parseJson, unwrapAIResult, extractJsonObject, extractFirstObject});
})();

// ---- merged source: ai-contract.js ----
const _m1 = (() => {
const parseJson = _m0.parseJson;


/** TellMe123 AI contract/validation helpers.
 * Pure orchestration around an AI promise; transport stays in ai-client.js.
 * The legacy bridge is temporary while app-legacy.js is migrated block-by-block.
 */
const AI_ERR = {
  TRUNCATED: 'AI_TRUNCATED',
  PARSE_FAIL: 'AI_PARSE_FAIL',
  COUNT_MISMATCH: 'AI_COUNT_MISMATCH',
  SCHEMA_MISS: 'AI_SCHEMA_MISS',
  TIMEOUT: 'AI_TIMEOUT',
  NETWORK: 'AI_NETWORK'
};

async function callAIWithContract(promise, opt={}){
  const out = { ok:false, text:'', data:null, finishReason:'', usage:null, errorCode:'', error:'' };
  try{
    const res = await promise;
    if(res && typeof res === 'object' && ('text' in res)){
      out.text = String(res.text||'');
      out.finishReason = res.finishReason || '';
      out.usage = res.usage || null;
    } else {
      out.text = String(res||'');
    }
    if(out.finishReason === 'length'){ out.errorCode = AI_ERR.TRUNCATED; out.error='响应被截断'; return out; }
    if(opt.needJson !== false){
      try{ out.data = parseJson(out.text); }catch(e){ out.errorCode=AI_ERR.PARSE_FAIL; out.error='JSON解析失败：'+e.message; return out; }
    }
    if(opt.expectedCount != null && opt.countPath){
      const arr = opt.countPath.split('.').reduce((o,k)=> (o&&o[k]!=null)?o[k]:null, out.data);
      if(!Array.isArray(arr) || arr.length !== opt.expectedCount){
        out.errorCode = AI_ERR.COUNT_MISMATCH;
        out.error = `数量不符：期望 ${opt.expectedCount}，实际 ${Array.isArray(arr)?arr.length:'非数组'}`;
        return out;
      }
    }
    if(opt.schemaValidator && typeof opt.schemaValidator === 'function'){
      const schemaErr = opt.schemaValidator(out.data);
      if(schemaErr){ out.errorCode=AI_ERR.SCHEMA_MISS; out.error=schemaErr; return out; }
    }
    out.ok = true;
  }catch(e){
    out.error = e.message || String(e);
    out.errorCode = (e.name==='AbortError' || /timeout/i.test(out.error)) ? AI_ERR.TIMEOUT : AI_ERR.NETWORK;
  }
  return out;
}

function assertCount(arr, expected, label){
  if(!Array.isArray(arr)) throw new Error(`${label} 不是数组`);
  if(arr.length !== expected) throw new Error(`${label} 数量不符：期望 ${expected}，实际 ${arr.length}`);
}


Object.assign(window, { AI_ERR, callAIWithContract, assertCount });

return Object.freeze({AI_ERR, callAIWithContract, assertCount});
})();

// ---- merged source: ai-client.js ----
const _m2 = (() => {
/**
 * Modern provider-agnostic AI transport.
 * Extracted from the legacy UI so the application core can evolve independently.
 */
function createAIClient({ resolveActiveSpec, formatNumber, aiLogPush }) {
  if (typeof resolveActiveSpec !== 'function') throw new TypeError('resolveActiveSpec is required');
  if (typeof formatNumber !== 'function') throw new TypeError('formatNumber is required');
  if (typeof aiLogPush !== 'function') throw new TypeError('aiLogPush is required');

  return async function callDeepSeek(system, user, {temperature=null, topP=null, signal=null, maxTokens=null, onStream=null, retry=2, taskKey=null}={}){
  const _t0 = Date.now();
  function isReasonModel(name){
    const n = String(name||'').toLowerCase();
    return /deepseek-reasoner/.test(n)
      || /(^|[-_/\.])(r1|reasoner|reasoning|think|qwq|1210)([-_/\.]|$)/.test(n)
      || /^(o[134](-[a-z0-9]+)?|grok-4-latest-reasoning|kimi-k2-thinking)$/.test(n);
  }
  const _rec = {
    ts: _t0,
    task: String(system||'').replace(/\s+/g,' ').slice(0,24),
    temp: (temperature==null ? null : temperature),
    sys: String(system||'').slice(0,500),
    user: String(user||'').slice(0,500),
    sysLen: String(system||'').length,
    userLen: String(user||'').length,
    respLen: 0,
    resp: '', ms: null, ok: false, err: '', tm: taskKey || '', tmo: false
  };
  let lastErr;
  for(let attempt=0; attempt<=retry; attempt++){
    try{
      const s = resolveActiveSpec(taskKey);
      if(taskKey) _rec.tmo = !!s.taskOverride;
      if(!s.apiKey) throw new Error('请先在 ⚙️ 配置并选择要使用的 AI 账号（API Key）');
      const url = s.baseUrl + '/chat/completions';
      const streaming = typeof onStream === 'function';
      const _reason = isReasonModel(s.model);
      const body = {
        model: s.model,
        messages: [{role:'system', content: system}, {role:'user', content: user}],
        ...(!_reason ? {
          temperature: formatNumber(temperature==null ? s.temperature : temperature),
          top_p: formatNumber(topP==null ? 0.95 : topP)
        } : {}),   // 推理模型通常不支持 temperature/top_p，省略
        stream: streaming
      };
      if(s.keyInBody) body.api_key = s.apiKey;
      if(_reason){
        body.max_completion_tokens = maxTokens && maxTokens>0 ? Math.max(maxTokens, 32768) : 32768;
      } else if(maxTokens && maxTokens>0){
        body.max_tokens = maxTokens;
      }
      const finalSignal = signal || AbortSignal.timeout(180000);
      let res;
      try{
        const hdrs = {'Content-Type':'application/json'};
        if(!s.keyInBody) hdrs['Authorization'] = 'Bearer '+s.apiKey;   // keyInBody 时不发 Bearer 头，规避中转拦截
        if(streaming){ hdrs['Accept'] = 'text/event-stream'; hdrs['Cache-Control'] = 'no-cache'; }
        res = await fetch(url, {
          method:'POST',
          headers: hdrs,
          body: JSON.stringify(body),
          signal: finalSignal
        });
      }catch(e){
        throw new Error('网络/跨域失败：' + e.message + '。若被拦截，可在设置里填一个代理地址。');
      }
      if(!res.ok){
        if(res.status === 429 && attempt < retry){
          const ra = res.headers.get('Retry-After');
          const wait = ra ? parseInt(ra)*1000 : Math.min(4000, 1000*Math.pow(2, attempt));
          await new Promise(r=>setTimeout(r, wait));
          continue;
        }
        let msg = '请求失败 ('+res.status+')';
        try{ const j = await res.json(); if(j.error && j.error.message) msg = j.error.message; }catch(e){}
        throw new Error(msg);
      }
      if(!streaming){
        const data = await res.json();
        const out = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
        if(!data.choices || !String(out).trim()){
          throw new Error('响应异常（HTTP 200 但无 choices/content）：' + JSON.stringify(data).slice(0, 160));
        }
        const finishReason = (data.choices && data.choices[0] && data.choices[0].finish_reason) || '';
        const usage = data.usage || null;
        _rec.resp = String(out).slice(0,50000); _rec.respLen = String(out).length; _rec.ms = Date.now()-_t0; _rec.ok = true;
        aiLogPush(_rec);
        return { text: out, finishReason, usage };
      }
      const reader = res.body && res.body.getReader ? res.body.getReader() : null;
      if(!reader) throw new Error('当前浏览器不支持流式响应');
      const decoder = new TextDecoder();
      let buf = '', full = '', finishReason = 'stop';
      const feed = (chunk)=>{
        buf += chunk;
        let nl;
        while((nl = buf.indexOf('\n')) >= 0){
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if(!line || !line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if(payload === '[DONE]') continue;
          let j;
          try{ j = JSON.parse(payload); }catch(e){ continue; }
          const delta = (j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content) || '';
          if(delta){ full += delta; onStream(delta); }
          const fr = j.choices && j.choices[0] && j.choices[0].finish_reason;
          if(fr) finishReason = fr;
        }
      };
      while(true){
        const {done, value} = await reader.read();
        if(done) break;
        feed(decoder.decode(value, {stream:true}));
      }
      feed(decoder.decode());
      if(!String(full).trim()){
        throw new Error('响应异常（流式全程无有效内容）');
      }
      _rec.resp = String(full).slice(0,50000); _rec.respLen = String(full).length; _rec.ms = Date.now()-_t0; _rec.ok = true;
      aiLogPush(_rec);
      return { text: full, finishReason, usage: null };
    }catch(e){
      lastErr = e;
      if(signal && signal.aborted){ break; }
      if(attempt >= retry) break;
      await new Promise(r=>setTimeout(r, attempt === 0 ? 2000 : 6000));
    }
  }
  _rec.ms = Date.now()-_t0; _rec.ok = false; _rec.err = (String(lastErr.message||lastErr).slice(0,170) + `（内部已重试 ${retry} 次）`);
  aiLogPush(_rec);
  throw lastErr;
  };
}

return Object.freeze({createAIClient});
})();

export const ai_coreModules = Object.freeze([_m2, _m0, _m1]);
