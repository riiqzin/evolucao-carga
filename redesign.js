(() => {
  const d=document;
  if(d.getElementById('appNav')) return;
  const nav=d.createElement('nav');
  nav.className='app-nav'; nav.id='appNav';
  nav.innerHTML='<button class="active" data-nav="home"><span>⌂</span>Hoje</button><button data-nav="history"><span>▦</span>Histórico</button><button data-nav="progress"><span>↗</span>Progresso</button><button data-nav="exercises"><span>◎</span>Exercícios</button>';
  d.body.appendChild(nav);
  const buttons=[...nav.querySelectorAll('button')];
  const active=btn=>{buttons.forEach(b=>b.classList.remove('active'));btn.classList.add('active')};
  buttons.forEach(btn=>btn.addEventListener('click',()=>{
    active(btn);
    const n=btn.dataset.nav;
    if(n==='home'){try{closeModal('historyModal')}catch(e){} d.querySelector('.hero')?.scrollIntoView({behavior:'smooth',block:'start'})}
    if(n==='history'){openHistoryModal();setTimeout(()=>d.querySelector('.progress-calendar')?.scrollIntoView({behavior:'smooth',block:'start'}),100)}
    if(n==='progress'){openHistoryModal()}
    if(n==='exercises'){try{closeModal('historyModal')}catch(e){} toggleLibrary(true)}
  }));

  function monthCalendarHTML(){
    const now=new Date(),y=now.getFullYear(),m=now.getMonth(),first=new Date(y,m,1),days=new Date(y,m+1,0).getDate();
    const trained=new Set(state.history.filter(h=>h.gymId===state.activeGym).map(h=>new Date(h.date).toLocaleDateString('sv-SE')));
    const monthKeys=[...trained].filter(k=>{const x=new Date(k+'T12:00:00');return x.getFullYear()===y&&x.getMonth()===m});
    const weekdays=['D','S','T','Q','Q','S','S']; let cells=weekdays.map(x=>`<div class="cal-weekday">${x}</div>`).join('');
    for(let i=0;i<first.getDay();i++) cells+='<div class="cal-day empty"></div>';
    for(let day=1;day<=days;day++){const key=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;cells+=`<div class="cal-day ${trained.has(key)?'trained':''} ${key===todayKey()?'today':''}">${day}</div>`}
    const weeks=Math.max(1,Math.round(days/7)),freq=(monthKeys.length/weeks).toFixed(1).replace('.0','');
    const monthName=now.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
    return `<div class="progress-calendar"><div class="cal-head"><strong>Frequência de treino</strong><span>${monthName}</span></div><div class="cal-grid">${cells}</div><div class="cal-stats"><div class="cal-stat"><b>${monthKeys.length}</b><span>treinos no mês</span></div><div class="cal-stat"><b>${freq}x</b><span>média por semana</span></div><div class="cal-stat"><b>${trained.size}</b><span>dias registrados</span></div></div></div>`;
  }
  function progressHeroHTML(stats,records){
    const withData=stats.filter(x=>x.sessions>0),improved=withData.filter(x=>x.delta>0).length,prs=records.reduce((n,h)=>n+(h.prFlags||[]).length,0),score=Math.min(99,Math.max(0,Math.round((improved*12)+(prs*4)+(records.length*1.5)))),best=withData.slice().sort((a,b)=>b.delta-a.delta)[0];
    return `<div class="progress-hero"><div><small>SEU MOMENTO</small><h4>${improved?improved+' exercícios evoluindo':'Construindo sua base'}</h4><p>${best&&best.delta>0?`Maior avanço: ${esc(best.e.name)} +${best.delta.toFixed(1).replace('.0','')} kg`:'Continue registrando para enxergar sua evolução.'}</p></div><div class="progress-score"><div>${score}<span>score</span></div></div></div>`;
  }
  window.renderProgressOverview=function(){
    const xs=state.exercises.filter(e=>e.gymId===state.activeGym),records=state.history.filter(h=>h.gymId===state.activeGym),stats=xs.map(e=>({e,...progressExerciseStats(e)})),withData=stats.filter(x=>x.sessions>0),totalSessions=records.length,prs=records.reduce((n,h)=>n+(h.prFlags||[]).length,0),improved=withData.filter(x=>x.delta>0).length;
    const cards=stats.length?stats.map(x=>{const change=x.delta,deltaText=x.first?`${change>0?'+':''}${change.toFixed(1).replace('.0','')} kg`:'—',lastSummary=x.last?setSummary(x.last.sets):'Sem registro ainda';return `<button class="progress-ex-card" onclick="document.getElementById('historyExercise').value='${x.e.id}';renderHistory()"><div class="progress-ex-head"><div class="progress-ex-icon">${muscleIcon(x.e.muscle)}</div><div class="progress-ex-main"><strong>${esc(x.e.name)}</strong><small>${esc(x.e.muscle)} · ${x.sessions} registro${x.sessions===1?'':'s'}</small></div><div class="progress-ex-load">${x.current||'—'}<small>${x.current?'kg atual':'sem carga'}</small></div></div><div class="progress-ex-meta"><div><small>Melhor</small><b>${x.best?x.best+' kg':'—'}</b></div><div><small>Evolução</small><b class="${change>0?'progress-up':change<0?'progress-down':''}">${deltaText}</b></div><div><small>Último</small><b>${x.last?fmtDate(x.last.date):'—'}</b></div></div><div style="margin-top:9px;color:#7f8997;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(lastSummary)}</div></button>`}).join(''):'<div class="empty"><strong>Nenhum exercício cadastrado</strong>Cadastre exercícios para começar a acompanhar sua evolução.</div>';
    d.getElementById('historyContent').innerHTML=`${progressHeroHTML(stats,records)}${monthCalendarHTML()}<div class="progress-highlight-row"><div class="progress-highlight"><small>Treinos registrados</small><strong>${totalSessions}</strong></div><div class="progress-highlight"><small>PRs conquistados</small><strong class="up">${prs}</strong></div><div class="progress-highlight"><small>Evoluindo</small><strong>${improved}/${xs.length}</strong></div></div><div class="progress-section-label">EXERCÍCIOS E EVOLUÇÃO</div><div class="progress-grid">${cards}</div>`;
  };
})();
