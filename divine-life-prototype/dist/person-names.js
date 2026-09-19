/* Presentation only: explain people from the current life, never create a relationship. */
window.personNames = (() => {
  function roster(state, npcs = []) {
    const people = new Map();
    const add = (name, description) => { if (name) people.set(name, { name, description }); };
    add(state.name, '당신이 지켜보는 영웅');
    for (const person of state.origin?.caregivers || []) {
      const relation = state.origin.familyType === 'adoptive' ? {아버지:'양아버지',어머니:'양어머니'}[person.relation] || person.relation : person.relation;
      add(person.name, `영웅의 ${relation}`);
    }
    for (const npc of npcs) {
      const encounter = state.world?.social?.encounters?.[npc.id];
      if (encounter || state.progress?.npcId === npc.id) add(npc.name, `${npc.role} · ${encounter?.status === 'friend' ? '영웅의 벗' : encounter ? '영웅과 인사를 나눈 지인' : '지금 이야기를 나누는 인물'}`);
    }
    // Older stories also record named companions directly in the relationship ledger.
    for (const record of state.relationships || []) {
      const parts = record.split(' · ');
      const match = parts.length === 2 ? [null, parts[0], parts[1]] : record.match(/^(소꿉친구|동료 기사|제자) (.+)$/u);
      if (match && /^[가-힣]+(?: [가-힣]+)?$/u.test(match[2]) && !people.has(match[2])) add(match[2], `영웅의 ${match[1]}`);
    }
    const partner = state.world?.partner;
    if (partner) add(partner.name, {acquaintance:'영웅의 지인',friend:'영웅의 친구',lover:'영웅의 연인',fiance:'영웅의 약혼자',spouse:'영웅의 배우자',dead:'세상을 떠난 소중한 인연'}[partner.status] || '영웅과 인연을 맺은 사람');
    else if (state.progress?.relationStep) add(state.gender === 'female' ? '유온' : '리안', '지금 이야기를 나누는 인물');
    const cliff = state.world?.adventure?.cliff;
    if (cliff && cliff !== 'unseen') {
      const relation = people.get('아린 세이란')?.description || (cliff === 'dead' ? '절벽 사건에서 목숨을 잃은 아이' : cliff === 'saved' ? '영웅이 구해 준 아이' : '절벽 아래에서 만난 아이');
      add('아린 세이란', relation); add('아린', relation);
    }
    if (state.progress?.arc === 'archive' || state.history?.some(entry => entry.id?.startsWith('CHRONICLE-ARCHIVE'))) {
      add('이셀', people.get('이셀')?.description || '서고에서 기록을 지키는 인물');
    }
    return [...people.values()].sort((a,b) => b.name.length - a.name.length);
  }

  function segments(text, people) {
    if (!people.length) return [{text}];
    const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(^|[^\\p{L}\\p{N}_])(${people.map(p => escape(p.name)).join('|')})(?=$|[^\\p{L}\\p{N}_]|(?:에게서|에게|한테|이라며|이라고|이라는|이란|이라고는|은|는|이|가|의|을|를|과|와|도|만|부터|까지|처럼|조차|마저|랑|으로|로)(?=$|[^\\p{L}\\p{N}_]))`, 'gu');
    const result = []; let end = 0;
    for (const match of text.matchAll(pattern)) {
      const start = match.index + match[1].length, name = match[2];
      // A lone '단' can mean 'only'; require a name particle in running prose.
      if (name.length === 1 && text.trim() !== name && !/^[가-힣]/u.test(text.slice(start + name.length))) continue;
      if (start > end) result.push({text:text.slice(end,start)});
      result.push({text:name, person:people.find(p => p.name === name)}); end = start + name.length;
    }
    if (end < text.length) result.push({text:text.slice(end)});
    return result;
  }

  function install(getState) {
    if (!window.MutationObserver) return;
    const selectors = '#childRecord,#childName,#heroPanelName,#heroParent,#heroMilestones,#progressStoryText,#progressText,#cardSceneTitle,#trialText,#effortText,#outcomeTitle,#outcomeText,#outcomeTags,#rollDetail,#endingText,#endingRecords,#heroDetailsDialog';
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return; queued = true;
      requestAnimationFrame(refresh);
    });
    const tooltip=document.createElement('div');tooltip.id='personTooltip';tooltip.className='person-tooltip';tooltip.setAttribute('role','tooltip');tooltip.setAttribute('popover','manual');document.body.append(tooltip);
    let active=null;
    const hide=()=>{if(active)active.removeAttribute('aria-describedby');active=null;tooltip.classList.remove('visible');if(tooltip.matches(':popover-open'))tooltip.hidePopover();};
    const show=target=>{
      if(!target?.dataset.personDescription)return;
      hide();active=target;tooltip.textContent=target.dataset.personDescription;target.setAttribute('aria-describedby','personTooltip');tooltip.showPopover();
      const rect=target.getBoundingClientRect(),width=tooltip.offsetWidth,height=tooltip.offsetHeight;
      tooltip.style.left=Math.max(12,Math.min(innerWidth-width-12,rect.left+rect.width/2-width/2))+'px';
      tooltip.style.top=(rect.bottom+height+15<innerHeight?rect.bottom+7:Math.max(12,rect.top-height-7))+'px';
      requestAnimationFrame(()=>{if(active===target)tooltip.classList.add('visible');});
    };
    document.addEventListener('pointerover',event=>{const target=event.target.closest('.person-name');if(target && !target.contains(event.relatedTarget))show(target);});
    document.addEventListener('pointerout',event=>{if(active && event.target.closest('.person-name')===active && !active.contains(event.relatedTarget))hide();});
    document.addEventListener('focusin',event=>{const target=event.target.closest('.person-name');if(target)show(target);});
    document.addEventListener('focusout',event=>{if(event.target===active)hide();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape' && active){hide();event.preventDefault();event.stopPropagation();}},true);
    document.addEventListener('scroll',hide,true);window.addEventListener('resize',hide);
    function refresh() {
      queued = false; observer.disconnect();
      try {
        const people = roster(getState(), window.socialRules?.npcs || []);
        for (const root of document.querySelectorAll(selectors)) {
          for (const span of root.querySelectorAll('.person-name')) {
            const current = people.find(p => p.name === span.dataset.person);
            if (current) { span.dataset.personDescription = current.description; span.setAttribute('aria-label', `${current.name}: ${current.description}`); }
            else span.replaceWith(document.createTextNode(span.textContent));
          }
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), texts = [];
          while (walker.nextNode()) if (!walker.currentNode.parentElement.closest('.person-name,script,style')) texts.push(walker.currentNode);
          for (const text of texts) {
            const parts = segments(text.textContent, people);
            if (!parts.some(part => part.person)) continue;
            const fragment = document.createDocumentFragment();
            for (const part of parts) {
              if (!part.person) { fragment.append(document.createTextNode(part.text)); continue; }
              const span = document.createElement('span');
              span.className = 'person-name'; span.dataset.person = part.person.name; span.textContent = part.text;
              span.dataset.personDescription = part.person.description; span.setAttribute('aria-label', `${part.text}: ${part.person.description}`);
              if (!text.parentElement.closest('button,summary')) span.tabIndex = 0;
              fragment.append(span);
            }
            text.replaceWith(fragment);
          }
        }
        if(active && !active.isConnected)hide();
      } finally { observer.observe(document.body, {childList:true,subtree:true,characterData:true}); }
    }
    refresh();
  }
  return {roster, segments, install};
})();
