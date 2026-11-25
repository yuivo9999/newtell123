/* ================================================================
 * oneclick.js · v1.0.596 · 「一键校长」与完善的「一键老师」+ 步骤间隔
 *
 * 一键校长（仅分层模式；一次性校长模式本来就是一次生成）：
 *   全书层（没做/已过期才做）→ 逐组：细化本组 →（有增补清单且未增补过）词典增补 → 下一组 …
 *   已「已细化」的组跳过，已增补的跳过，所以中断后再点一次就是续做。
 *   任何一步失败/有诊断（组细化不完整）→ 停下并说明原因（后一组依赖前一组的交接卡）。
 *   「确认回写粗章表」不自动执行（保留人工决定）。
 * 一键老师：逐位备课（章数多的老师组自动走分批）→ 备好后自动「切割教案」→ 下一位。
 *   已备的跳过；校长对应组尚未细化 / 任一步失败 → 停下并说明原因（下一位老师依赖上一位的章末交接）。
 * 步骤间隔：state.school.stepGapSec（0–600 秒，默认 3），每个 AI 步骤结束后等待再做下一步；
 *   校长面板和老师面板各有一个输入框，同一个值。等待期间也可以点「⏹ 停止」。
 * 注意：页面必须保持打开；手机切到后台可能被浏览器暂停请求，已完成的步骤都已保存，再点一次即可续做。
 * 依赖 app.js / principal-tiered.js / dict-supplement.js 的全局函数，必须在它们之后加载。
 * ================================================================ */
const OC_GAP_DEFAULT = 3, OC_GAP_MAX = 600;
let _ocRun = null;   // { kind:'principal'|'teacher', stop:false, ctl:null, msg:'' }

function ocGapSec(){
  const v = Number(state && state.school && state.school.stepGapSec);
  return Number.isFinite(v) && v >= 0 && v <= OC_GAP_MAX ? Math.round(v) : OC_GAP_DEFAULT;
}
function ocSetGapSec(v){
  let n = Math.round(Number(v)); if(!Number.isFinite(n)) n = OC_GAP_DEFAULT;
  n = Math.max(0, Math.min(OC_GAP_MAX, n));
  if(!state.school || typeof state.school !== 'object') state.school = {};
  state.school.stepGapSec = n; persist();
  document.querySelectorAll('[data-oc-gap]').forEach(el => { if(String(el.value) !== String(n)) el.value = n; });
  return n;
}
function ocGapInputHtml(){
  return `<span class="sc-oc-gap" style="display:inline-flex;gap:4px;align-items:center;font-size:12px" title="每个 AI 步骤结束后等待几秒再做下一步（0=不等待）">⏱ 步骤间隔 <input type="number" min="0" max="${OC_GAP_MAX}" step="1" value="${ocGapSec()}" data-oc-gap style="width:60px;padding:2px 4px;font-size:12px"> 秒</span>`;
}
function ocPrincipalRowHtml(){
  return `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:6px 0"><button type="button" class="sc-step sc-oc-principal" data-oc-principal title="自动完成：全书层 → 逐组细化 → 词典增补；已完成的步骤跳过，失败会停下，再点可续做">🪄 一键校长</button>${ocGapInputHtml()}<span class="muted" style="font-size:11px">全程自动（含词典增补）；运行中再点一次＝停止</span></div>`;
}
function ocStopRequested(ctl){ return !!((_ocRun && _ocRun.stop) || (ctl && ctl.signal && ctl.signal.aborted)); }
function ocSleep(ms){ return new Promise(r => setTimeout(r, ms)); }
function ocPaint(){
  const pb = document.querySelector('[data-oc-principal]'), tb = document.querySelector('[data-scp-teacher-all]');
  if(pb){
    const on = !!(_ocRun && _ocRun.kind === 'principal');
    pb.classList.toggle('running', on);
    pb.innerHTML = on ? `⏹ 停止一键校长 · ${esc(_ocRun.msg || '进行中…')}` : '🪄 一键校长';
    pb.disabled = !!(_ocRun && !on);
  }
  if(tb && _ocRun && _ocRun.kind === 'teacher'){
    tb.classList.add('running'); tb.disabled = false;
    tb.innerHTML = `⏹ 停止一键老师 · ${esc(_ocRun.msg || '进行中…')}`;
  }
}
function ocLabel(msg){ if(_ocRun){ _ocRun.msg = msg; ocPaint(); } }
function ocBeginStep(){ const ctl = new AbortController(); _abortCtl = ctl; if(_ocRun) _ocRun.ctl = ctl; return ctl; }
function ocRequestStop(){
  if(!_ocRun) return;
  _ocRun.stop = true;
  try{ if(_ocRun.ctl) _ocRun.ctl.abort(); }catch(_e){}
  ocLabel('正在停止…');
}
/* 步骤间隔等待：完成返回 true；等待期间被停止返回 false。一键流程和单个老师的分批步骤都用它。 */
async function ocGapWait(label){
  const sec = ocGapSec(); if(sec <= 0) return true;
  const ctl = _abortCtl;
  if(!_ocRun) toast(`⏱ 步骤间隔 ${sec} 秒…（可点停止）`);
  for(let s = sec; s > 0; s--){
    if(ocStopRequested(ctl)) return false;
    ocLabel(`${label ? label + ' · ' : ''}等待 ${s} 秒…`);
    await ocSleep(1000);
  }
  return !ocStopRequested(ctl);
}
function ocFinish(){ _ocRun = null; ocPaint(); try{ ptRefresh(); }catch(_e){} try{ refreshTeacherBatchUi(); }catch(_e){} }

/* ---------------------------------------------------------------- 一键校长 */
async function ocPrincipalAll(){
  if(_ocRun){ if(_ocRun.kind === 'principal') ocRequestStop(); else toast('一键老师正在运行，请先等它结束或点停止'); return; }
  if(genBusy() || state._teacherBatchRunning){ toast('已有生成任务进行中，请稍候'); return; }
  if(typeof principalTieredEnabled === 'function' && !principalTieredEnabled()){ toast('当前是「一次性校长」模式：直接点上方「生成校长」即可（一键校长用于分层模式）'); return; }
  const total = ptTotal(); if(!total){ toast('请先填写有效的全书章节数（1-200）'); return; }
  const groups = ptAssignment().groups; if(!groups.length){ toast('老师章节分配校验失败，请先检查章节数与老师分配'); return; }
  if(!scDone('dictEnrich')){ toast('校长必须接收完整词典后再统筹，请先完成“词典充实”'); return; }
  _ocRun = { kind: 'principal', stop: false, ctl: null, msg: '准备中…' }; ocPaint();
  let first = true, stoppedBy = '', done = [];
  const before = async label => { if(!first){ if(!(await ocGapWait(label))) return false; } first = false; return true; };
  const hasGlobal = () => { const P = scState().principal || {}, T = ptPeek(); return !!(P.tiered && T && Object.keys(T.rough || {}).length) && (!Number(P.targetChapterCount) || Number(P.targetChapterCount) === total); };
  try{
    if(!hasGlobal()){
      ocLabel('全书层统筹中…'); ocBeginStep();
      const ok = await ptGenGlobal(null);
      if(_ocRun.stop){ stoppedBy = '已停止'; }
      else if(!ok || !hasGlobal()){ stoppedBy = '全书层未完成（原因见提示）；修好后再点一键校长从这里续做'; }
      else done.push('全书层');
      first = false;
    }
    for(let gi = 0; gi < groups.length && !stoppedBy; gi++){
      if(_ocRun.stop){ stoppedBy = '已停止'; break; }
      if(ptGroupEffectiveStatus(gi) !== 'detailed'){
        if(!(await before(`第${gi + 1}组`))){ stoppedBy = '已停止'; break; }
        ocLabel(`第${gi + 1}/${groups.length}组细化中…`); ocBeginStep();
        const ok = await ptGenGroup(gi, null);
        if(_ocRun.stop){ stoppedBy = '已停止'; break; }
        if(!ok){ stoppedBy = `第${gi + 1}组细化失败（原因见提示）；修好后再点一键校长从这里续做`; break; }
        if(ptGroupEffectiveStatus(gi) !== 'detailed'){ stoppedBy = `第${gi + 1}组细化有诊断（状态不是“已细化”）；请到该组「读本组」检查修改后，再点一键校长续做`; break; }
        done.push(`第${gi + 1}组细化`);
      }
      const T = ptEnsure(), needs = (typeof dsNeedsText === 'function') ? dsNeedsText(gi) : '';
      if(needs && !(T.supplements && T.supplements[gi])){
        if(!(await before(`第${gi + 1}组词典增补`))){ stoppedBy = '已停止'; break; }
        ocLabel(`第${gi + 1}/${groups.length}组词典增补中…`); ocBeginStep();
        const ok = await dsGen(gi, null, { oneClick: true });
        if(_ocRun.stop){ stoppedBy = '已停止'; break; }
        if(!ok){ stoppedBy = `第${gi + 1}组词典增补失败（原因见提示）；修好后再点一键校长从这里续做（该组细化已保存）`; break; }
        done.push(`第${gi + 1}组增补`);
      }
    }
    if(stoppedBy) toast(`一键校长已停止：${stoppedBy}${done.length ? `（本次完成：${done.slice(-6).join('、')}${done.length > 6 ? '…' : ''}）` : ''}`);
    else toast(`一键校长完成：全书层 + ${groups.length}组细化${done.some(x => /增补/.test(x)) ? ' + 词典增补' : ''} 均已就绪；请检查各组「偏离记录」后再去做老师`);
  }catch(e){
    console.error('[ocPrincipalAll]', e);
    toast('一键校长异常停止：' + String(e && e.message || e));
  }finally{ ocFinish(); }
}

/* ---------------------------------------------------------------- 一键老师 */
async function ocTeacherAll(){
  if(_ocRun){ if(_ocRun.kind === 'teacher') ocRequestStop(); else toast('一键校长正在运行，请先等它结束或点停止'); return; }
  if(genBusy() || state._teacherBatchRunning){ toast('已有生成任务进行中，请稍候'); return; }
  const groups = teacherAssignmentGroups(); if(!groups.length){ toast('请先填写章节数，才能一键老师'); return; }
  if(!scDone('principal')){ toast('请先完成校长；老师只读取“读校长成果”当前保存版本。'); return; }
  _ocRun = { kind: 'teacher', stop: false, ctl: null, msg: '准备中…' };
  state._teacherBatchRunning = { startedAt: Date.now(), total: groups.length, completed: groups.filter((g, i) => scTeacherGroupComplete(i)).length };
  ocPaint();
  let first = true, stoppedBy = '', done = [];
  try{
    for(let i = 0; i < groups.length; i++){
      if(_ocRun.stop){ stoppedBy = '已停止'; break; }
      if(scTeacherGroupComplete(i)){
        const t = teacherCurrentResult(i), cut = (typeof teacherChapterCutStatus === 'function') ? teacherChapterCutStatus(i) : null;
        if(!(cut && cut.status === 'ready') && t){ /* 已备但没切割：补切 */
          try{ await cutTeacherChapterCardsManually(i); }catch(_e){}
        }
        continue;
      }
      const guard = (typeof ptTeacherGuard === 'function') ? ptTeacherGuard(i) : '';
      if(guard){ stoppedBy = `第${i + 1}位老师无法开始：${guard}`; break; }
      if(!first){ if(!(await ocGapWait(`老师${i + 1}`))){ stoppedBy = '已停止'; break; } }
      first = false;
      ocLabel(`老师${i + 1}/${groups.length}备课中…`); ocBeginStep();
      const ok = await genTeacher(null, i);
      if(_ocRun.stop){ stoppedBy = '已停止'; break; }
      if(!ok){ stoppedBy = `老师${i + 1}备课失败（原因见提示；已完成的部分已保留）；修好后再点一键老师从这里续做`; break; }
      scMark('t' + i, true, false); persist();
      done.push(`老师${i + 1}`);
      state._teacherBatchRunning.completed = groups.filter((g, k) => scTeacherGroupComplete(k)).length;
      ocLabel(`老师${i + 1}教案切割中…`);
      let cutOk = false; try{ cutOk = await cutTeacherChapterCardsManually(i); }catch(_e){}
      if(!cutOk){ stoppedBy = `老师${i + 1}教案已备好，但自动切割失败（原因见提示）；请处理后点该老师的「切割教案」，再点一键老师续做`; break; }
    }
    const allDone = groups.every((g, i) => scTeacherGroupComplete(i));
    if(allDone) scMark('teacher', true, false);
    if(stoppedBy) toast(`一键老师已停止：${stoppedBy}${done.length ? `（本次完成：${done.join('、')}）` : ''}`);
    else toast(`一键老师完成：${groups.length}位老师教案均已备好并切割${done.length ? `（本次新完成：${done.join('、')}）` : ''}`);
  }catch(e){
    console.error('[ocTeacherAll]', e);
    toast('一键老师异常停止：' + String(e && e.message || e));
  }finally{ state._teacherBatchRunning = null; persist(); ocFinish(); }
}

/* ---------------------------------------------------------------- 事件委托 */
if(!document._ocDelegate){
  document._ocDelegate = 1;
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-oc-principal]');
    if(!b) return;
    e.preventDefault(); e.stopPropagation();
    ocPrincipalAll();
  }, true);
  document.addEventListener('change', e => {
    const el = e.target.closest && e.target.closest('[data-oc-gap]');
    if(!el) return;
    const n = ocSetGapSec(el.value);
    toast(`步骤间隔已设为 ${n} 秒`);
  }, true);
}
