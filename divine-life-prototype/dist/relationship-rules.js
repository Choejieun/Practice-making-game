/* Personal reputation is local to witnesses/participants, not a global morality score. */
window.relationshipRules = (() => {
  const canonical = name => name === '아린' ? '아린 세이란' : name.replace(/^서기 /u, '');
  const clamp = value => Math.max(-5, Math.min(5, value));
  function snapshot(s) {
    const stored=s.world?.reputation?.people || {}, people=new Map();
    for(const person of window.personNames.roster(s,window.socialRules?.npcs || [])) {
      if(person.name===s.name)continue;
      const name=canonical(person.name),saved=stored[name];
      const family=(s.origin?.caregivers || []).some(p=>p.name===name);
      const dead=(name==='아린 세이란' && s.world?.adventure?.cliff==='dead') || (name===s.world?.partner?.name && s.world.partner.status==='dead');
      people.set(name,{name,score:0,thought:family?'무사히 돌아오너라.':'다음에는 어떤 이야기를 들려줄까.',history:[],...saved,description:person.description,family,dead});
    }
    for(const [name,person] of Object.entries(stored)) if(!people.has(name))people.set(name,{...person});
    return [...people.values()];
  }
  function affected(s,card) {
    const known=snapshot(s), names=new Set(card.relatedPeople || []);
    const text=[card.title,card.text,card.story,card.trial?.title,card.trial?.text].filter(Boolean).join(' ');
    for(const part of window.personNames.segments(text,known))if(part.person)names.add(part.person.name);
    const npc=window.socialRules?.npcs.find(n=>n.id===card.npcId);if(npc)names.add(npc.name);
    if(card.id?.startsWith('ARC-CLIFF'))names.add('아린 세이란');
    if(card.arc==='archive')names.add('이셀');
    if(card.stakes?.kind==='bond' && s.world?.partner)names.add(s.world.partner.name);
    if(card.family || (s.stageIndex===0 && !card.catastrophe && !card.dungeon && /블록|옷|단추|그림|그린|글씨|글자|장난감|퍼즐|칭찬|정리/.test(text)))
      for(const parent of s.origin?.caregivers || [])names.add(parent.name);
    return known.filter(person=>names.has(person.name));
  }
  function classify(card) {
    const text=[card.title,card.trial?.title,card.text].join(' ');
    if(card.catastrophe)return {kind:'재앙',loss:3,thought:'그날 잃은 것을 쉽게 잊을 수는 없어.'};
    if(/약속|맹세|맡긴|기한/.test(text))return {kind:'약속',loss:2,thought:'다시 믿어도 괜찮을까.'};
    if(/구조|구하|구해|절벽|피난|지키|보호/.test(text))return {kind:'구조·보호',loss:2,thought:'당신에게 맡기기에는 아직 두려워.'};
    if(card.trial?.stat==='knowledge'||card.trial?.stat==='intuition')return {kind:'판단',loss:1,thought:'다음에는 조금 더 신중히 생각해 줘.'};
    return {kind:'미숙함',loss:1,thought:'아직은 서툴구나.'};
  }
  function record(s,card,success,meeting=false) {
    const world=s.world ||= {}, memory=world.reputation ||= {people:{},resolved:{}};
    const key=`${s.sequence || 0}:${s.stageIndex}:${s.roundInStage}:${card.id}:${meeting?'meeting':'trial'}`;
    if(memory.resolved[key])return [];
    const kind=classify(card), changes=[];
    for(const person of affected(s,card)) {
      // A deceased person cannot form a new opinion. Keep the loss as a memory instead.
      const delta=person.dead?0:success?1:meeting?-1:-kind.loss;
      const score=clamp(person.score+delta), actual=score-person.score;
      const thought=person.dead?'끝내 나누지 못한 말이 남았다.':success?(person.family?'조금씩 제 몫을 해내는구나.':'당신을 조금 더 믿어도 되겠어.'):(person.family && kind.loss===1?'아직은 서툴구나. 곁에서 더 지켜봐야겠다.':meeting?'아직은 서로에게 익숙한 말이 적구나.':kind.thought);
      const entry={id:card.id,title:card.trial?.title || card.title,stage:s.stageIndex,kind:meeting?'대화':kind.kind,success,delta:actual,thought};
      const updated={...person,score,thought,history:[...person.history,entry]};memory.people[person.name]=updated;
      changes.push({name:person.name,delta:actual,score,thought,kind:entry.kind});
    }
    memory.resolved[key]=true;return changes;
  }
  const difficulty=(s,name)=>Math.min(2,Math.floor(Math.max(0,-(s.world?.reputation?.people?.[canonical(name)]?.score || 0))/2));
  const label=person=>person.dead?'남겨진 기억':person.score<=-3?'불신':person.score<0?'걱정 · 실망':person.score>=3?'깊어진 신뢰':person.score>0?'호감 · 믿음':'알아가는 중';
  function familyEdges(s) {
    const family=s.origin?.caregivers || [];
    return family.length===2 && ['parents','grandparents','adoptive'].includes(s.origin.familyType)?[{from:family[0].name,to:family[1].name,label:'부부'}]:[];
  }
  return {snapshot,affected,classify,record,difficulty,label,familyEdges};
})();
