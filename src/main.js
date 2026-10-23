import './styles.css';

const SAVE_KEY = 'bench-to-mlb-save-v1';

const batterStyles = [
  {position:'포수 / 1루수', name:'홈런타자', stats:[56,47,46,45,53,52], growth:['파워','정확']},
  {position:'포수 / 1루수', name:'안타머신', stats:[49,54,52,50,53,54], growth:['정확','선구']},
  {position:'포수 / 1루수', name:'해결사', stats:[51,55,53,48,54,53], growth:['정확','선구']},
  {position:'2루수 / 유격수', name:'홈런타자', stats:[54,48,46,51,52,51], growth:['파워','정확']},
  {position:'2루수 / 유격수', name:'매의 눈', stats:[46,53,53,53,53,53], growth:['정확','선구']},
  {position:'2루수 / 유격수', name:'빠른발', stats:[43,50,54,58,54,47], growth:['선구','주력']},
  {position:'지명타자', name:'거포', stats:[57,54,50,45,30,52], growth:['파워','정확']},
  {position:'지명타자', name:'타점머신', stats:[50,57,55,47,30,52], growth:['정확','선구']},
  {position:'지명타자', name:'지명타자', stats:[55,55,51,48,30,50], growth:['파워','정확']},
  {position:'외야수', name:'장타자', stats:[52,53,50,48,54,46], growth:['정확','수비']},
  {position:'외야수', name:'빠른발', stats:[43,50,54,58,54,47], growth:['선구','주력']},
  {position:'외야수', name:'클러치 히터', stats:[50,55,52,50,50,50], growth:['정확','주력']}
];
const pitcherStyles = [
  {position:'선발투수', name:'파이어볼러', stats:[57,53,45,46,53,46], growth:['구속','제구']},
  {position:'선발투수', name:'철완', stats:[50,55,50,53,45,52], growth:['구위','체력']},
  {position:'선발투수', name:'해저드 브레이커', stats:[49,52,52,57,49,49], growth:['제구','멘탈']},
  {position:'선발투수', name:'어쌔신', stats:[45,53,57,49,48,55], growth:['구위','제구']},
  {position:'중간계투', name:'레이저볼러', stats:[57,53,47,45,50,30], growth:['구속','제구']},
  {position:'중간계투', name:'세이비어', stats:[48,54,48,57,48,34], growth:['구위','멘탈']},
  {position:'중간계투', name:'이닝 이터', stats:[49,50,52,50,50,42], growth:['제구','체력']},
  {position:'마무리투수', name:'터미네이터', stats:[60,53,51,53,46,15], growth:['구속','구위']},
  {position:'마무리투수', name:'돌부처', stats:[51,60,53,55,45,15], growth:['구속','구위']},
  {position:'마무리투수', name:'Born To K', stats:[52,52,60,50,43,15], growth:['구위','제구']}
];
const batterAttrs = ['파워','정확','선구','주력','수비','멘탈'];
const pitcherAttrs = ['구속','구위','제구','멘탈','수비','체력'];
const positions = ['포수','1루수','2루수','3루수','유격수','좌익수','중견수','우익수','지명타자','선발투수','중간계투','마무리투수'];
const teams = ['서울 스카이즈','부산 웨이브','인천 하버스','대전 스파크','광주 타이거즈','대구 팔콘스','수원 블루윙즈','창원 그린즈'];

function newSave() {
  return {
    version:1, created:false, tab:'home', name:'', age:17, position:'유격수', styleName:'매의 눈',
    level:'고교 1학년', year:1, segment:0, season:1, team:teams[0],
    stats:[], baseStats:[], growth:['정확','선구'], career:[], feed:[],
    teamRecord:{w:0,d:0,l:0}, seasonStats:{games:0,pa:0,ab:0,h:0,hr:0,rbi:0,bb:0,sb:0,ip:0,k:0,er:0},
    totalStats:{games:0,pa:0,ab:0,h:0,hr:0,rbi:0,bb:0,sb:0,ip:0,k:0,er:0},
    gameHistory:[], awards:[], lastEvent:'아직 경기를 치르지 않았어. 첫 시즌을 시작해 봐!', lastGrade:'—'
  };
}
function loadSave() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (parsed && parsed.version === 1) return {...newSave(), ...parsed};
  } catch {}
  return newSave();
}
let state = loadSave();
let toastTimer;
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch {}
}
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function sum(a) { return a.reduce((n,x)=>n+x,0); }
function isHighSchool() { return state.level.startsWith('고교'); }
function segmentLabels() { return isHighSchool()?['일반 경기','전국대회 토너먼트']:['전반기','후반기','포스트시즌']; }
function isPitcher() { return state.created ? state.statsType === 'pitcher' : positions.slice(9).includes(state.position); }
function statNames() { return isPitcher() ? pitcherAttrs : batterAttrs; }
function stylesForPosition(pos) {
  if (positions.slice(9).includes(pos)) {
    const p = pos === '선발투수' ? '선발투수' : pos === '중간계투' ? '중간계투' : '마무리투수';
    return pitcherStyles.filter(s=>s.position===p);
  }
  if (['포수','1루수'].includes(pos)) return batterStyles.filter(s=>s.position==='포수 / 1루수');
  if (['2루수','유격수','3루수'].includes(pos)) return batterStyles.filter(s=>s.position==='2루수 / 유격수');
  if (pos==='지명타자') return batterStyles.filter(s=>s.position==='지명타자');
  return batterStyles.filter(s=>s.position==='외야수');
}
function getStyle() { return stylesForPosition(state.position).find(s=>s.name===state.styleName) || stylesForPosition(state.position)[0]; }
function moneylessNum(n) { return new Intl.NumberFormat('ko-KR').format(n); }
function toast(message) {
  let el = document.querySelector('.toast');
  if (!el) { el=document.createElement('div'); el.className='toast'; document.body.appendChild(el); }
  el.textContent=message;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.remove(),2400);
}
function iconForTab(tab) { return ({home:'⌂',reactions:'♡',season:'▦',player:'♙',records:'▤'})[tab]; }
function nav() {
  const tabs=[['home','홈'],['reactions','반응'],['season','시즌'],['player','선수'],['records','기록']];
  return `<nav class="bottom-nav">${tabs.map(([id,label])=>`<button class="nav-item ${state.tab===id?'active':''}" data-tab="${id}"><span class="nav-icon">${iconForTab(id)}</span><span>${label}</span></button>`).join('')}</nav>`;
}
function topbar() {
  return `<header class="topbar"><div class="brand">⚾ <span>벤치에서</span> 믈브까지</div><div class="top-actions"><button class="icon-btn" title="언어" data-action="language">한</button><button class="icon-btn" title="알림" data-action="notifications">♧</button><button class="icon-btn" title="소셜" data-action="social">◎</button><button class="icon-btn" title="설정" data-action="settings">⚙</button></div></header>`;
}
function heading(eyebrow,title,sub='') {
  return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${sub?`<p class="subtle" style="margin-top:5px">${sub}</p>`:''}</div>${state.created?`<span class="pill green">${esc(state.level)}</span>`:''}</div>`;
}
function cardHead(title,right='') { return `<div class="card-head"><h2>${title}</h2>${right}</div>`; }
function playerHeader() {
  const style=getStyle();
  return `<div class="card">${cardHead('선수 프로필',`<span class="pill green">${esc(state.position)}</span>`)}
    <div style="display:flex;align-items:center;gap:13px">
      <div style="width:58px;height:58px;display:grid;place-items:center;border-radius:17px;background:#e9f4ed;font-size:29px">⚾</div>
      <div style="flex:1;min-width:0"><h2 style="font-size:19px">${esc(state.name)}</h2><p class="subtle" style="margin-top:4px">${esc(state.team)} · ${esc(style.name)}</p><p class="subtle" style="margin-top:3px">${esc(state.level)} · ${state.age}세</p></div>
    </div>
    <div class="stats-grid" style="margin-top:16px">
      <div class="stat-tile"><div class="label">시즌</div><div class="value">${state.season}<span class="unit">년차</span></div></div>
      <div class="stat-tile"><div class="label">경기</div><div class="value">${state.totalStats.games}</div></div>
      <div class="stat-tile"><div class="label">평균 능력치</div><div class="value">${Math.round(sum(state.stats)/Math.max(1,state.stats.length))}</div></div>
    </div>
  </div>`;
}
function renderHome() {
  if (!state.created) return renderCreate(true);
  const s=state.seasonStats, total=state.totalStats;
  const isP=isPitcher();
  const line=isP?`ERA ${total.games?((total.er*9)/Math.max(total.ip,1)).toFixed(2):'—'} · 탈삼진 ${total.k}`:`타율 ${total.ab?(total.h/total.ab).toFixed(3).replace(/^0/,''):'.000'} · 홈런 ${total.hr} · 타점 ${total.rbi}`;
  return `${heading('CAREER HUB','오늘도 야구 인생을 시작해','벤치에서 출발해 프로 무대, 그리고 MLB를 향해.')}
    <section class="card hero"><div class="eyebrow">YOUR BASEBALL STORY</div><h1>${esc(state.name)}의 야구 인생</h1><p>${esc(state.level)} · ${esc(state.team)}<br>시즌을 진행하며 꿈의 무대에 도전하자.</p><button class="primary-btn" data-action="advance">${segmentLabels()[state.segment]||'다음 구간'} 진행하기　→</button></section>
    ${playerHeader()}
    <div class="section-title"><h2>이번 시즌 성적</h2><button class="text-btn" data-tab="season">시즌 보기 →</button></div>
    <div class="card"><div class="stats-grid">
      <div class="stat-tile"><div class="label">팀 전적</div><div class="value">${state.teamRecord.w}<span class="unit">승</span></div><p class="subtle">${state.teamRecord.l}패 ${state.teamRecord.d}무</p></div>
      <div class="stat-tile"><div class="label">${isP?'탈삼진':'안타'}</div><div class="value">${isP?s.k:s.h}</div><p class="subtle">${isP?'K':'H'}</p></div>
      <div class="stat-tile"><div class="label">${isP?'평균자책':'홈런'}</div><div class="value">${isP?(s.games?((s.er*9)/Math.max(s.ip,1)).toFixed(2):'—'):s.hr}</div><p class="subtle">${isP?'ERA':'HR'}</p></div>
    </div><p class="subtle" style="margin-top:13px">${line}</p></div>
    <div class="section-title"><h2>최근 소식</h2><button class="text-btn" data-tab="reactions">전체 보기 →</button></div>
    ${state.feed.length?feedPost(state.feed[0]):`<div class="card empty">아직 팬 반응이 없어.<br>첫 경기를 치르면 반응이 도착할 거야!</div>`}
    <div class="footer-note">현재 버전은 오프라인 저장형 프로토타입이야.</div>`;
}
function renderCreate(inHome=false) {
  const pos=state.position;
  const options=stylesForPosition(pos);
  if (!options.some(s=>s.name===state.styleName)) state.styleName=options[0].name;
  const chosen=options.find(s=>s.name===state.styleName);
  const attrs=positions.slice(9).includes(pos)?pitcherAttrs:batterAttrs;
  return `${heading('NEW CAREER','나만의 야구 선수 만들기','선수 정보를 정하고 첫 커리어를 시작하자.')}
  <form id="create-form">
    <div class="card">${cardHead('기본 정보','<span class="pill">STEP 1</span>')}
      <div class="form-grid">
        <div class="field full-width"><label for="player-name">선수 이름</label><input id="player-name" name="name" maxlength="16" placeholder="예: 김야구" required value="${esc(state.name)}"></div>
        <div class="field"><label for="player-age">나이</label><select id="player-age" name="age"><option value="17" ${state.age===17?'selected':''}>17세 · 고교 1학년</option><option value="18" ${state.age===18?'selected':''}>18세 · 고교 2학년</option><option value="19" ${state.age===19?'selected':''}>19세 · 고교 3학년</option></select></div>
        <div class="field"><label for="player-position">포지션</label><select id="player-position" name="position">${positions.map(p=>`<option ${p===pos?'selected':''}>${p}</option>`).join('')}</select></div>
        <div class="field full-width"><label for="player-team">고교 팀</label><select id="player-team" name="team">${teams.map(t=>`<option ${t===state.team?'selected':''}>${t}</option>`).join('')}</select></div>
      </div>
    </div>
    <div class="card">${cardHead('선수 스타일','<span class="pill">STEP 2</span>')}
      <div class="choice-grid">${options.map(st=>`<button type="button" class="choice ${st.name===state.styleName?'selected':''}" data-style="${esc(st.name)}"><strong>${esc(st.name)}</strong><small>성장: ${st.growth.join(' · ')}<br>초기 총합 ${sum(st.stats)}</small></button>`).join('')}</div>
      <div class="notice" style="margin-top:13px">선택한 스타일의 시작 능력치 6개가 그대로 적용돼. 지정된 성장 스탯은 시즌 구간이 끝날 때마다 성장해.</div>
    </div>
    <div class="card">${cardHead('시작 능력치',`<span class="pill green">${sum(chosen.stats)} 총합</span>`)}
      <div class="attribute-list">${attrs.map((a,i)=>`<div class="attribute"><span class="attr-name">${a}</span><div class="progress"><span style="width:${Math.min(100,chosen.stats[i])}%"></span></div><span class="attr-value">${chosen.stats[i]}</span></div>`).join('')}</div>
      <p class="subtle" style="margin-top:13px">이 값들은 네가 정한 스타일 수치야. 현재 버전에서는 임의로 보정하지 않아.</p>
    </div>
    <button class="primary-btn full" type="submit">${state.created?'새 커리어 시작하기':'선수 생성하고 시작하기'}　→</button>
    ${state.created?'<button class="secondary-btn full" type="button" data-action="cancel-create" style="margin-top:8px">돌아가기</button>':''}
  </form>`;
}
function renderPlayer() {
  if (!state.created) return `${heading('PLAYER','선수','커리어를 만들면 선수 정보가 여기에 표시돼.')}${renderCreate()}`;
  const attrs=statNames();
  const style=getStyle();
  return `${heading('PLAYER PROFILE','선수 정보','능력치와 성장 방향을 확인해 보자.')}
    ${playerHeader()}
    <div class="card">${cardHead('능력치',`<span class="pill">평균 ${Math.round(sum(state.stats)/6)}</span>`)}
      <div class="attribute-list">${attrs.map((a,i)=>`<div class="attribute"><span class="attr-name">${a}</span><div class="progress"><span style="width:${Math.min(100,state.stats[i])}%;background:${style.growth.includes(a)?'#27845a':'#9aa6b5'}"></span></div><span class="attr-value">${state.stats[i]}</span></div>`).join('')}</div>
      <div class="notice" style="margin-top:15px"><strong>집중 성장:</strong> ${style.growth.join(' · ')}<br>현재 스타일의 핵심 능력치가 시즌 구간마다 2씩 상승해. 능력치는 100을 넘지 않아.</div>
    </div>
    <div class="card">${cardHead('커리어 정보')}
      ${[['포지션',state.position],['스타일',state.styleName],['소속',state.team],['단계',state.level],['시즌',`${state.season}년차`],['능력치 총합',sum(state.stats)]].map(([a,b])=>`<div class="list-row"><div class="row-main"><strong>${a}</strong></div><span class="row-value">${esc(b)}</span></div>`).join('')}
    </div>
    <button class="secondary-btn full" data-action="edit-player">선수 정보 수정</button>`;
}
function renderSeason() {
  if (!state.created) return `${heading('SEASON','시즌 진행','먼저 선수를 생성해 커리어를 시작해.')}${renderCreate()}`;
  const segmentNames=segmentLabels();
  const s=state.seasonStats, p=isPitcher();
  const statRows=p?[['경기',s.games],['이닝',s.ip],['탈삼진',s.k],['평균자책점',s.games?((s.er*9)/Math.max(s.ip,1)).toFixed(2):'—']]:[['경기',s.games],['타율',s.ab?(s.h/s.ab).toFixed(3).replace(/^0/,''):'.000'],['홈런',s.hr],['타점',s.rbi],['볼넷',s.bb],['도루',s.sb]];
  return `${heading('SEASON','시즌 진행','경기를 치르고 성장하며 다음 단계로 나아가자.')}
    <div class="card">${cardHead('현재 시즌',`<span class="pill green">${esc(state.level)}</span>`)}
      <div class="stats-grid">
        <div class="stat-tile"><div class="label">시즌</div><div class="value">${state.season}<span class="unit">년차</span></div></div>
        <div class="stat-tile"><div class="label">진행 구간</div><div class="value">${state.segment+1}<span class="unit">/ ${segmentNames.length}</span></div></div>
        <div class="stat-tile"><div class="label">경기 수</div><div class="value">${s.games}</div></div>
      </div>
      <div style="margin-top:17px" class="segment-row">${segmentNames.map((n,i)=>`<div class="segment ${i===state.segment?'active':''}">${i<state.segment?'✓ ':''}${n}</div>`).join('')}</div>
      <p class="subtle" style="margin-top:12px">각 구간은 여러 경기의 결과를 요약해 진행해. 구간이 끝나면 팀 전적과 개인 성적, 팬 반응을 확인할 수 있어.</p>
    </div>
    <div class="card">${cardHead('팀 전적')}
      <div class="stats-grid">
        <div class="stat-tile"><div class="label">승리</div><div class="value">${state.teamRecord.w}</div></div>
        <div class="stat-tile"><div class="label">무승부</div><div class="value">${state.teamRecord.d}</div></div>
        <div class="stat-tile"><div class="label">패배</div><div class="value">${state.teamRecord.l}</div></div>
      </div>
    </div>
    <div class="card">${cardHead('개인 시즌 성적')}
      ${statRows.map(([label,value])=>`<div class="list-row"><div class="row-main"><strong>${label}</strong></div><span class="row-value">${value}</span></div>`).join('')}
    </div>
    <div class="card">${cardHead('최근 경기 결과')}<div class="game-results">${(state.gameHistory||[]).slice(-12).reverse().map(g=>`<div class="list-row"><div class="row-main"><strong>${esc(g.segment)} ${g.number}경기 · ${g.won?'승':g.tie?'무':'패'} ${g.score}</strong><small>${g.played?'출전':'미출전 · 자동 스킵'}</small></div></div>`).join('')||'<p class="subtle">아직 경기 기록이 없어.</p>'}</div></div>
    <div class="card">${cardHead('다음 경기')}
      <p class="subtle" style="margin-bottom:14px">능력치와 현재 시즌에 따라 결과가 생성돼. 시즌 구간 종료 시 집중 성장 스탯이 상승해.</p>
      <button class="primary-btn full" data-action="advance">⚾ ${segmentNames[state.segment]||'다음 구간'} 진행하기</button>
      <button class="secondary-btn full" data-action="reset-segment" style="margin-top:8px">이번 시즌 기록 초기화</button>
    </div>`;
}
function feedPost(post) {
  return `<article class="feed-post"><div class="feed-top"><div class="avatar">${post.mood==='good'?'🎉':post.mood==='bad'?'😤':'⚾'}</div><div class="feed-user"><strong>${esc(post.user)}</strong><small>${esc(post.source)} · ${esc(post.when)}</small></div><span class="pill ${post.mood==='good'?'green':''}">${esc(post.tag)}</span></div><p>${esc(post.text)}</p><div class="feed-reactions"><span>♡ ${post.likes}</span><span>↗ ${post.shares}</span><span>💬 ${post.comments} 댓글</span></div></article>`;
}
function renderReactions() {
  if (!state.created) return `${heading('FAN REACTIONS','팬 반응','선수 커리어를 시작하면 팬들의 반응이 모여.') }<div class="card empty">첫 경기를 진행하면 팬 반응이 생겨.</div>`;
  return `${heading('FAN REACTIONS','팬 반응','활약에 따라 달라지는 야구 팬들의 여론.')}
    <div class="card">${cardHead('이번 시즌 여론',`<span class="pill">${state.feed.length}개 게시물</span>`)}<p class="subtle">좋은 활약에는 응원과 기대가, 부진에는 비판과 걱정이 나타나. 아래 반응은 게임 내 시뮬레이션이야.</p></div>
    ${state.feed.length?state.feed.map(feedPost).join(''):`<div class="card empty">아직 게시물이 없어.<br>시즌 구간을 진행해 팬 반응을 받아 보자.</div>`}`;
}
function renderRecords() {
  if (!state.created) return `${heading('CAREER RECORDS','커리어 기록','선수의 시즌별 성적과 수상 기록이 쌓이는 곳이야.') }<div class="card empty">선수 생성 후 기록을 확인할 수 있어.</div>`;
  const p=isPitcher(), t=state.totalStats;
  const rows=p?[['등판',t.games],['이닝',t.ip],['탈삼진',t.k],['자책점',t.er],['평균자책점',t.games?((t.er*9)/Math.max(t.ip,1)).toFixed(2):'—']]:[['경기',t.games],['타수',t.ab],['안타',t.h],['홈런',t.hr],['타점',t.rbi],['볼넷',t.bb],['도루',t.sb],['타율',t.ab?(t.h/t.ab).toFixed(3).replace(/^0/,''):'.000']];
  return `${heading('CAREER RECORDS','커리어 기록','시즌이 쌓일수록 선수의 이야기도 길어져.')}
    <div class="card">${cardHead('통산 성적',`<span class="pill green">${state.career.length}시즌</span>`)}
      <div class="stats-grid"><div class="stat-tile"><div class="label">출전 경기</div><div class="value">${t.games}</div></div><div class="stat-tile"><div class="label">시즌 완료</div><div class="value">${state.career.length}</div></div><div class="stat-tile"><div class="label">수상</div><div class="value">${state.awards.length}</div></div></div>
      ${rows.map(([label,value])=>`<div class="list-row"><div class="row-main"><strong>${label}</strong></div><span class="row-value">${value}</span></div>`).join('')}
    </div>
    <div class="card">${cardHead('시즌 기록')}
      ${state.career.length?`<div class="table-wrap"><table><thead><tr><th>시즌</th><th>단계</th><th>전적</th><th>${p?'탈삼진':'홈런'}</th><th>${p?'ERA':'타율'}</th></tr></thead><tbody>${state.career.slice().reverse().map(c=>`<tr><td>${c.season}년차</td><td>${esc(c.level)}</td><td>${c.w}-${c.l}-${c.d}</td><td>${p?c.stats.k:c.stats.hr}</td><td>${p?c.era:c.avg}</td></tr>`).join('')}</tbody></table></div>`:`<div class="empty">아직 완료한 시즌이 없어.<br>시즌 구간을 세 번 진행해 보자.</div>`}
    </div>
    <div class="card">${cardHead('수상 및 주요 기록')}
      ${state.awards.length?state.awards.map(a=>`<div class="list-row"><div class="row-main"><strong>${esc(a.title)}</strong><small>${esc(a.detail)}</small></div><span class="pill green">${esc(a.season)}년차</span></div>`).join(''):`<div class="empty">아직 수상 기록이 없어.<br>좋은 성적을 쌓아 첫 수상을 노려 보자!</div>`}
    </div>`;
}
function render() {
  if (!['home','reactions','season','player','records'].includes(state.tab)) state.tab='home';
  const page=({home:renderHome,reactions:renderReactions,season:renderSeason,player:renderPlayer,records:renderRecords})[state.tab]();
  document.querySelector('#app').innerHTML=`<div class="app-shell">${topbar()}<main class="content">${page}</main>${nav()}</div>`;
}
function addFeed(mood, tag, text, source='야구 커뮤니티') {
  const goodNames=['직관러99','야구보는곰','홈런은사랑','오늘도야구','KBO새싹'];
  const badNames=['냉정한야구팬','직구승부','야구는결과','답답한팬','기록충'];
  const names=mood==='good'?goodNames:mood==='bad'?badNames:['야구소식통'];
  state.feed.unshift({mood,tag,text,user:names[Math.floor(Math.random()*names.length)],source,when:`${state.season}년차 ${segmentLabels()[state.segment]||'시즌 종료'}`,likes:Math.floor(Math.random()*500)+12,shares:Math.floor(Math.random()*80)+1,comments:Math.floor(Math.random()*70)+2});
  state.feed=state.feed.slice(0,35);
}
function randomInt(min,max) { return Math.floor(Math.random()*(max-min+1))+min; }
let playback=null;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function appearanceChance() {
  if (state.position==='선발투수') return .24;
  if (state.position==='중간계투') return .42;
  if (state.position==='마무리투수') return .28;
  return isHighSchool()? .55+Math.min(.22,(state.season-1)*.09):.72;
}
function simulateGame(number, tournament=false) {
  const p=isPitcher(), ability=sum(state.stats)/6;
  const chance=Math.max(.28,Math.min(.72,.49+(ability-50)*.009));
  const win=Math.random()<chance;
  const tie=!tournament&&!win&&Math.random()<.06;
  const runs=randomInt(1,8), against=win?Math.max(0,runs-randomInt(1,4)):tie?runs:runs+randomInt(1,4);
  const home=win?runs:against, away=win?against:runs;
  const played=Math.random()<appearanceChance();
  const stats={games:played?1:0,pa:0,ab:0,h:0,hr:0,rbi:0,bb:0,sb:0,ip:0,k:0,er:0};
  const logs=[];
  if(played && p) {
    const ip=state.position==='선발투수'?randomInt(4,7):randomInt(1,2);
    stats.ip=ip;stats.k=Math.max(0,Math.round(ip*(state.stats[1]/50)*randomInt(2,5)/4));
    stats.er=randomInt(0,Math.max(1,Math.round(ip/2)));
    logs.push(`${randomInt(1,5)}회 · ${state.name} 마운드 등판!`,`${ip}이닝 ${stats.k}탈삼진 ${stats.er}자책점으로 투구 종료`);
  } else if(played) {
    stats.ab=randomInt(3,5);
    const avg=Math.max(.12,Math.min(.48,.22+(state.stats[1]-50)*.008));
    stats.h=Array.from({length:stats.ab},()=>Math.random()<avg?1:0).reduce((a,b)=>a+b,0);
    stats.hr=stats.h&&Math.random()<Math.max(.02,Math.min(.27,(state.stats[0]-40)*.008))?1:0;
    stats.rbi=stats.hr?randomInt(1,3):stats.h&&Math.random()<.28?1:0;
    stats.bb=Math.random()<.2?1:0;stats.sb=Math.random()<.08?1:0;
    stats.pa=stats.ab+stats.bb;
    logs.push(`1회 · ${state.name} ${Math.random()<.65?'선발 출전':'교체 출전'}!`,
      `${randomInt(2,5)}회 · ${state.name}, ${stats.h?'안타로 출루!':'타구가 야수 정면으로 향합니다.'}`,
      `${randomInt(6,9)}회 · ${state.name}, ${stats.hr?'홈런!':stats.rbi?'적시타로 타점 기록!':'타석 종료'}`,
      `${stats.ab}타수 ${stats.h}안타 ${stats.hr}홈런 ${stats.rbi}타점`);
  }
  return {number,tournament,win,tie,played,stats,logs,score:`${home}:${away}`};
}
function makeGames() {
  const high=isHighSchool(), tournament=high&&state.segment===1;
  const count=high?(tournament?5:12):(state.segment===2?randomInt(3,7):72);
  const games=[];
  for(let i=0;i<count;i++) {
    const g=simulateGame(i+1,tournament);games.push(g);
    if(tournament&&!g.win)break;
  }
  return games;
}
function playbackMarkup() {
  const x=playback, g=x.games[x.index];
  return `<div class="game-overlay"><section class="game-dialog card">
    <div class="eyebrow">LIVE GAME SIMULATION</div><h2>${esc(x.title)}</h2>
    <p class="subtle">${g?`${x.index+1} / ${x.games.length}경기 · ${g.tournament?['32강','16강','8강','4강','결승'][g.number-1]:'일반 경기'}`:'구간 결산'} · 미출전 경기는 자동 스킵</p>
    <div class="game-progress"><span style="width:${Math.round(x.index/x.games.length*100)}%"></span></div>
    <div class="game-log" id="game-log" aria-live="polite">${x.lines.map(l=>`<p>${esc(l)}</p>`).join('')}</div>
    <div class="game-controls"><button data-play="pause" class="secondary-btn">${x.paused?'▶ 재개':'Ⅱ 일시정지'}</button><button data-play="skip" class="secondary-btn">⏭ 결과로 건너뛰기</button></div>
    <div class="game-speeds">${[1,2,5,10].map(v=>`<button data-speed="${v}" class="${x.speed===v?'selected':''}">${v}×</button>`).join('')}</div>
  </section></div>`;
}
function paintPlayback() {
  if(!playback)return;
  let overlay=document.querySelector('.game-overlay');
  if(!overlay){document.body.insertAdjacentHTML('beforeend',playbackMarkup());return;}
  overlay.outerHTML=playbackMarkup();
  const log=document.querySelector('#game-log');if(log)log.scrollTop=log.scrollHeight;
}
function applyGame(g) {
  if(g.win)state.teamRecord.w++;else if(g.tie)state.teamRecord.d++;else state.teamRecord.l++;
  for(const [key,val] of Object.entries(g.stats)) {
    state.seasonStats[key]=(state.seasonStats[key]||0)+val;
    state.totalStats[key]=(state.totalStats[key]||0)+val;
  }
  state.gameHistory=state.gameHistory||[];
  state.gameHistory.push({season:state.season,level:state.level,segment:segmentLabels()[state.segment],number:g.number,score:g.score,won:g.win,tie:g.tie,played:g.played,stats:g.stats});
  state.gameHistory=state.gameHistory.slice(-500);
}
function finishPlayback() {
  const x=playback;if(!x)return;
  x.games.forEach(applyGame);
  const played=x.games.filter(g=>g.played).length;
  const wins=x.games.filter(g=>g.win).length;
  state.lastEvent=`${x.title} 종료! ${x.games.length}경기 ${wins}승 · 개인 ${played}경기 출전`;
  addFeed(wins>=x.games.length/2?'good':'neutral','구간 결산',state.lastEvent,'시즌 리포트');
  if(state.segment >= segmentLabels().length-1) {
    const avg=s.ab?(s.h/s.ab).toFixed(3).replace(/^0/,''):'.000';
    const era=s.games?((s.er*9)/Math.max(s.ip,1)).toFixed(2):'—';
    state.career.push({season:state.season,level:state.level,w:state.teamRecord.w,l:state.teamRecord.l,d:state.teamRecord.d,stats:{...s},avg,era});
    if((isP?s.k:s.hr)>=Math.max(5,Math.round(state.season*3))) state.awards.push({title:isP?'탈삼진 유망주상':'장타 유망주상',detail:`${state.season}년차 시즌 주요 기록`,season:state.season});
    state.feed.unshift({mood:'neutral',tag:'시즌 결산',user:'구단 공식 소식',source:'시즌 리포트',when:`${state.season}년차 종료`,likes:0,shares:0,comments:0,text:`${state.level} 시즌 종료! 팀 전적 ${state.teamRecord.w}승 ${state.teamRecord.l}패 ${state.teamRecord.d}무. ${isP?`탈삼진 ${s.k}개, ERA ${era}`:`타율 ${avg}, ${s.hr}홈런 ${s.rbi}타점`}.`});
    const style=getStyle();
    state.stats=state.stats.map((v,i)=>Math.min(100,v+(style.growth.includes(names[i])?2:0)));
    state.lastEvent=`${state.season}년차 시즌이 끝났어. 집중 성장 스탯(${style.growth.join(', ')})이 상승했어!`;
    state.season++;
    state.segment=0;
    state.teamRecord={w:0,d:0,l:0};
    state.seasonStats={games:0,pa:0,ab:0,h:0,hr:0,rbi:0,bb:0,sb:0,ip:0,k:0,er:0};
    if(state.level==='고교 1학년') {state.level='고교 2학년';state.age=Math.max(state.age,18);}
    else if(state.level==='고교 2학년') {state.level='고교 3학년';state.age=Math.max(state.age,19);}
    else if(state.level==='고교 3학년') {state.level='KBO 드래프트';state.age=20;addFeed('neutral','드래프트',`${state.name}, 고교 생활을 마치고 KBO 드래프트에 도전한다!`,'야구 뉴스');}
    else if(state.level==='KBO 드래프트') {state.level='퓨처스리그';state.team=teams[randomInt(0,teams.length-1)];state.age=20;addFeed('neutral','프로 입단',`${state.name}, ${state.team}에 합류해 프로 생활을 시작한다!`,'구단 공식 소식');}
    else if(state.level==='퓨처스리그') {state.level='KBO 1군';state.age=21;addFeed('good','1군 승격',`${state.name}, 꾸준한 활약 끝에 1군 승격 기회를 얻었다!`,'구단 공식 소식');}
    else if(state.level==='KBO 1군' && state.season>=7 && Math.random()<.3) {state.level='MLB 도전';state.team='MLB 도전';addFeed('good','해외 진출',`${state.name}, 빅리그를 향한 도전을 시작한다!`,'야구 뉴스');}
    else if(state.level==='MLB 도전') {state.level='MLB';state.team='MLB 구단';addFeed('good','MLB 진출',`${state.name}, 마침내 MLB 무대에 도착했다!`,'야구 뉴스');}
    toast('시즌 종료! 성장 스탯이 상승했어.');
  } else {
    state.segment++;
    toast('구간 진행 완료!');
  }
  save();playback=null;document.querySelector('.game-overlay')?.remove();render();
  toast('경기 결과와 개인 기록이 저장됐어!');
}
async function runPlayback() {
  const x=playback;if(!x||x.running)return;
  x.running=true;
  while(playback===x&&x.index<x.games.length&&!x.skip) {
    if(x.paused){await wait(120);continue;}
    const g=x.games[x.index];
    if(!g.played){x.lines.push(`${g.number}경기 미출전 · ${g.win?'승':g.tie?'무':'패'} (${g.score}) · 자동 스킵`);x.index++;paintPlayback();await wait(80);continue;}
    const messages=[`${g.number}경기 시작`,...g.logs,`경기 종료 · ${g.win?'승리':g.tie?'무승부':'패배'} (${g.score})`];
    for(const line of messages) {
      if(x.skip||playback!==x)break;
      while(x.paused&&!x.skip&&playback===x)await wait(120);
      if(x.skip||playback!==x)break;
      x.lines.push(line);x.lines=x.lines.slice(-65);paintPlayback();
      let elapsed=0;const delay=900/x.speed;
      while(elapsed<delay&&!x.skip&&playback===x){if(!x.paused)elapsed+=50;await wait(50);}
    }
    x.index++;paintPlayback();
  }
  if(playback===x)finishPlayback();
}
function advance() {
  if(!state.created){state.tab='player';render();return;}
  if(playback)return;
  playback={title:`${state.level} · ${segmentLabels()[state.segment]}`,games:makeGames(),index:0,lines:[],speed:2,paused:false,skip:false,running:false};
  paintPlayback();runPlayback();
}
function startCareer(formData) {
  const name=String(formData.get('name')||'').trim();
  if(!name) {toast('선수 이름을 입력해 줘!');return;}
  const age=Number(formData.get('age')||17);
  const pos=String(formData.get('position')||'유격수');
  const team=String(formData.get('team')||teams[0]);
  state={...newSave(),created:true,name,age,position:pos,team,level:age===17?'고교 1학년':age===18?'고교 2학년':'고교 3학년',year:1,season:1,segment:0};
  const style=stylesForPosition(pos)[0];
  state.styleName=style.name;
  state.stats=[...style.stats];
  state.baseStats=[...style.stats];
  state.growth=[...style.growth];
  state.statsType=positions.slice(9).includes(pos)?'pitcher':'batter';
  state.tab='home';
  state.lastEvent=`${name}, ${team}에서 야구 커리어를 시작한다!`;
  addFeed('neutral','커리어 시작',state.lastEvent,'선수 프로필');
  save(); render(); toast(`${name} 선수 생성 완료!`);
}
function resetSeason() {
  if(!state.created) return;
  if(!confirm('이번 시즌 기록과 팀 전적을 초기화할까? 통산 기록은 유지돼.')) return;
  state.seasonStats={games:0,pa:0,ab:0,h:0,hr:0,rbi:0,bb:0,sb:0,ip:0,k:0,er:0};
  state.teamRecord={w:0,d:0,l:0};
  save();render();toast('이번 시즌 기록을 초기화했어.');
}
function handleClick(e) {
  const play=e.target.closest('[data-play]');
  if(play&&playback){if(play.dataset.play==='skip')playback.skip=true;else playback.paused=!playback.paused;paintPlayback();return;}
  const speed=e.target.closest('[data-speed]');
  if(speed&&playback){playback.speed=Number(speed.dataset.speed);paintPlayback();return;}
  if(playback)return;
  const tab=e.target.closest('[data-tab]');
  if(tab) {state.tab=tab.dataset.tab;save();render();return;}
  const styleBtn=e.target.closest('[data-style]');
  if(styleBtn) {
    state.styleName=styleBtn.dataset.style;
    const st=stylesForPosition(state.position).find(s=>s.name===state.styleName);
    if(st) state.growth=[...st.growth];
    render();return;
  }
  const action=e.target.closest('[data-action]')?.dataset.action;
  if(!action)return;
  if(action==='advance') advance();
  else if(action==='edit-player') {state.tab='player';renderCreate();state.tab='player';document.querySelector('#app').innerHTML=`<div class="app-shell">${topbar()}<main class="content">${renderCreate()}</main>${nav()}</div>`; }
  else if(action==='cancel-create') {state.tab='home';render();}
  else if(action==='reset-segment') resetSeason();
  else if(action==='settings') {
    const ok=confirm('저장된 커리어를 초기화할까? 이 작업은 되돌릴 수 없어.');
    if(ok) {state=newSave();save();render();toast('저장 데이터를 초기화했어.');}
  } else if(action==='language') toast('현재 프로토타입은 한국어를 지원해.');
  else if(action==='notifications') toast(state.created?state.lastEvent:'아직 알림이 없어.');
  else if(action==='social') {state.tab='reactions';render();}
}
document.addEventListener('click',handleClick);
document.addEventListener('change',e=>{
  if(e.target.id==='player-position') {
    state.position=e.target.value;
    state.styleName=stylesForPosition(state.position)[0].name;
    render();
  }
});
document.addEventListener('submit',e=>{
  if(e.target.id==='create-form') {
    e.preventDefault();
    const data=new FormData(e.target);
    const pos=String(data.get('position')||'유격수');
    const selected=state.styleName;
    const matching=stylesForPosition(pos).find(s=>s.name===selected);
    startCareer(data);
    if(matching) {
      state.styleName=matching.name;state.stats=[...matching.stats];state.baseStats=[...matching.stats];state.growth=[...matching.growth];state.statsType=positions.slice(9).includes(pos)?'pitcher':'batter';save();render();
    }
  }
});
window.addEventListener('storage',e=>{if(e.key===SAVE_KEY){state=loadSave();render();}});
render();