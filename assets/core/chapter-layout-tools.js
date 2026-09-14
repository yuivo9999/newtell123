/* v31: cohesive legacy region — chapter-layout-tools */

export function install(deps){
  let {
    BEAT_OPTIONS,
    chTitleHistory,
    currentBeatId,
    esc,
    persist,
    state
  } = deps;
  const $ = (s,r=document) => r.querySelector(s);
  const $$ = (s,r=document) => [...r.querySelectorAll(s)];


function setChapterTitle(i, title){
  const t = String(title||'').trim();
  const o = state.outline;
  if(o && Array.isArray(o.chapters) && o.chapters[i]){
    const oldT = (o.chapters[i].title||'').trim();
    if(oldT && oldT !== t && o.chapters[i].title !== undefined){
      if(!Array.isArray(o.chTitleHistory)) o.chTitleHistory = [];
      o.chTitleHistory.unshift({ i, title: oldT, ts: Date.now() });
      if(o.chTitleHistory.length > 50) o.chTitleHistory.splice(50);
    }
    o.chapters[i].title = t;
  }
  if(state.chapters && state.chapters[i]) { state.chapters[i].title = t; state.chapters[i]._titleByAI = false; state.chapters[i]._titleFinalized = false; }
  persist();
}

function microBeatBlock(){
  const curBeat = BEAT_OPTIONS.find(b=>b.id===currentBeatId()) || {};
  return `<div class="card cp-card beat-card card-theme-microbeat">
    <div class="cp-head card-head-bar" style="cursor:default">
      <div class="ch-left">
        <span class="ch-badge ch-badge-microbeat">🥁</span>
        <h3 class="ch-title">章节微拍节奏</h3>
        <span class="ch-subtag ch-subtag-microbeat">${esc(curBeat.label || '微五拍')}</span>
      </div>
      <div class="ch-right">
        <span class="muted" style="font-size:12px">段落推进节拍</span>
      </div>
    </div>
    <div class="cp-body">
      <div class="cp-micropick">
        <div class="cp-micropick-title">选择章节推进节奏</div>
        <div class="cp-micropick-opts">
          ${BEAT_OPTIONS.map(b=>`
            <label class="cp-micropick-item ${b.id===currentBeatId()?'sel':''}" data-micropick="${b.id}" title="${esc(b.desc||'')}">
              <span class="cp-micropick-ic">${b.emoji||'🥁'}</span>
              <span class="cp-micropick-txt">
                <b>${esc(b.label)}</b>
                <i>${esc(b.desc||'')}</i>
              </span>
              <input type="radio" name="cpMicroPick" value="${b.id}" ${b.id===currentBeatId()?'checked':''} style="display:none">
            </label>
          `).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

  const api = {
    setChapterTitle,
    microBeatBlock
  };
  const ns = window.TellMeLegacyRegions = window.TellMeLegacyRegions || {};
  ns["chapter-layout-tools"] = Object.freeze(api);
  return ns["chapter-layout-tools"];
}
