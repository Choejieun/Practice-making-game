/* Life continuity: eligibility, crisis stakes and persistent crossroads. No UI dependencies. */
window.lifeRules = (() => {
  const fresh = () => ({ partner: null, children: 0, vocation: '', kingdom: 'intact', home: 'intact', legacy: 'intact', flags: [], crossroads: [] });
  const add = (list, value) => { if (!list.includes(value)) list.push(value); };
  function eligible(card, s) {
    const w = s.world;
    if (['P03-C01','P04-C01'].includes(card.id) && w.kingdom !== 'intact') return false;
    if (card.id === 'P04-C01' && !['knight','rebuilder'].includes(w.vocation)) return false;
    if (['married','family'].includes(card.requiresFlag) && w.partner?.status !== 'spouse') return false;
    if (card.requiresFlag && !w.flags.includes(card.requiresFlag)) return false;
    if (card.forbidsFlag && w.flags.includes(card.forbidsFlag)) return false;
    if (card.requiresVocation && w.vocation !== card.requiresVocation) return false;
    if (card.requiresKingdom && w.kingdom !== 'intact') return false;
    if (card.relationStep === 'meet') return !w.partner;
    if (card.relationStep === 'court') return w.partner?.status === 'friend';
    if (card.relationStep === 'engage') return w.partner?.status === 'lover';
    if (card.relationStep === 'marry') return w.partner?.status === 'fiance';
    return true;
  }
  function remember(card, success, s) {
    if (!success) return;
    const w = s.world;
    if (card.id === 'P03-C01') w.vocation = 'knight';
    if (card.id === 'P03-C02') w.vocation = 'healer';
    if (card.relationStep === 'meet') w.partner = { name: '리안', status: 'friend' };
    const status = { court: 'lover', engage: 'fiance', marry: 'spouse' }[card.relationStep];
    if (status && w.partner && w.partner.status !== 'dead') w.partner.status = status;
  }
  function candidates(s) {
    const w = s.world, list = [];
    const tags = [...s.traits, ...s.wills].flatMap(x => x.tags);
    const weight = keys => 2 + keys.filter(k => tags.includes(k)).length * 3;
    if (w.partner && ['lover','fiance','spouse'].includes(w.partner.status)) list.push({ kind: 'bond', weight: weight(['bond','care','protect']) });
    if (w.vocation === 'knight' && w.kingdom === 'intact') list.push({ kind: 'kingdom', weight: weight(['lead','protect','endure']) });
    if (s.items.length || s.milestones.some(x => /기록|서고|별|치료/.test(x))) list.push({ kind: 'legacy', weight: weight(['study','truth','notice']) });
    list.push({ kind: 'home', weight: weight(['care','bond','endure']) });
    return list;
  }
  function crisis(s, stage, random = Math.random) {
    const pool = candidates(s).flatMap(x => Array(x.weight).fill(x.kind));
    const kind = pool[Math.floor(random() * pool.length)];
    const p = s.world.partner ? { ...s.world.partner } : null;
    const definitions = {
      bond: ['검은 새벽이 사랑하는 이를 삼킨다', `${p?.name}의 손이 검은 균열 너머로 멀어진다. 함께 쌓아 온 약속을 지켜야 한다.`, 'charm', '매력', ['bond','care','protect'], ['익숙한 이름을 부른다','함께한 기억으로 길을 찾는다']],
      kingdom: ['왕국의 하늘이 무너진다', '왕도 수비대의 문장을 단 영웅 앞에서 성벽과 왕성이 갈라진다. 평생 지켜 온 왕국의 존망이 걸렸다.', 'strength', '근력', ['lead','endure','protect'], ['남은 수비대를 규합한다','무너진 방어선을 다시 세운다']],
      legacy: ['기억을 먹는 신의 불길', '신의 불길이 기록과 유산을 지운다. 평생 모은 지식과 물품 중 무엇을 다음 세대에 남길 것인가.', 'knowledge', '지식', ['study','notice','truth'], ['흩어진 기록의 규칙을 잇는다','사라질 지식을 사람들에게 전한다']],
      home: ['살아온 땅이 갈라진다', `${s.origin.wealth}에서 시작된 삶을 떠올릴 때, 신의 흔적이 삶의 터전을 뒤흔든다. 이곳에서 살아온 사람들의 내일이 걸렸다.`, 'intuition', '직감', ['care','endure','protect'], ['안전한 피난길을 찾는다','남은 사람들과 버틸 방법을 익힌다']]
    };
    const [title,text,stat,statName,tags,efforts] = definitions[kind];
    // History grants a modest preparation advantage; ability growth does not make every crisis trivial.
    const preparation = Math.min(2, s.milestones.length >= 4 ? 2 : s.milestones.length >= 2 ? 1 : 0);
    return { id: `CRISIS-${s.crisisCount + 1}`, stage, catastrophe: true, stakes: { kind, partner: p, item: s.items.at(-1), previous: s.milestones.at(-1) },
      title, text, weight: tags, effect: '일반 진행 중단 · 이 시련의 결말은 인생의 갈림길로 남는다.',
      trial: { title: '재앙의 끝', text: '주어진 세 번의 노력으로 지켜야 할 삶을 구할 수 있을까?', mode: 'turn', base: 3, stat, statName,
        threshold: Math.max(5, s.stats[stat] + 5 - preparation), helpful: tags,
        success: '영웅은 재앙을 넘어섰다. 이제 살아남은 이들의 삶이 달라진다.', failure: '재앙은 끝났지만 지키려던 삶에 돌이킬 수 없는 대가가 남았다.', successGain: 1, failureVitality: 2,
        efforts: efforts.map((title,i) => ({ code: `CRISIS-${kind}-S0${i+1}`, title, text: `${s.traits[0]?.name || '자신'}의 기질과 지난 경험을 붙잡고 다시 시도한다.`, stat, statName, min: i, max: 3 })) }
    };
  }
  function crossroad(card, success, s) {
    const k = card.stakes.kind, p = card.stakes.partner;
    let title, text, effect, change;
    if (k === 'bond') {
      if (!success) {
        title = '돌아오지 못한 약속'; text = `${p.name}은 끝내 돌아오지 못했다. 영웅은 함께 만들려던 미래를 잃었다.`;
        effect = '관계 상실 · 애도의 삶 · 이후 회복과 추모 진행 해금'; change = 'bereaved';
      } else if (p.status === 'fiance') {
        title = '재앙 뒤의 혼인'; text = `${p.name}과 지켜 낸 약속은 혼인이 되었다. 이제 서로의 삶을 함께 책임진다.`;
        effect = '약혼자 → 배우자 · 가족을 지키는 진행 해금'; change = 'married';
      } else if (p.status === 'spouse' && s.stageIndex >= 2 && s.stageIndex <= 3 && !s.world.children) {
        title = '다시 시작되는 생명'; text = `재앙을 견딘 뒤 시간이 흘러, ${p.name}과 영웅의 가정에 아이가 태어났다. 지킬 미래가 한 사람 더 늘었다.`;
        effect = '자녀 탄생 · 양육과 계승 진행 해금'; change = 'parent';
      } else {
        title = '함께 살아갈 내일'; text = `${p.name}과 서로를 다시 선택했다. 살아남은 두 사람은 이전보다 무거운 약속을 나눈다.`;
        effect = p.status === 'lover' ? '연인 → 약혼자 · 혼인 진행 해금' : '가족 유대 강화 · 가족 진행 해금'; change = p.status === 'lover' ? 'engaged' : 'family';
      }
    } else if (k === 'kingdom') {
      title = success ? '재건의 기사가 되다' : '망국의 기사가 되다';
      text = success ? '왕국은 살아남았다. 영웅은 전장에서 얻은 명예 대신 무너진 삶을 다시 세울 책임을 맡았다.' : '왕국은 무너졌다. 지켜 온 문장은 이제 돌아갈 곳 없는 기사의 짐이 되었다.';
      effect = success ? '재건 기사 · 복구와 통솔 진행 해금' : '왕국 멸망 · 망국 기사 · 난민과 유랑 진행 해금'; change = success ? 'rebuilder' : 'exile';
    } else if (k === 'legacy') {
      title = success ? '살아남은 지식의 수호자' : '잿더미에서 시작하는 기록';
      text = success ? '모든 것을 구하지는 못했지만, 전할 지식은 지켰다. 영웅의 경험은 다음 세대의 길이 된다.' : `불길이 ${card.stakes.item || '평생 모아 온 기록'}을 삼켰다. 영웅은 사라진 유산을 기억에서 다시 써야 한다.`;
      effect = success ? '유산 수호 · 전수 진행 해금' : '유산 소실 · 소지 물품 상실 · 복원 진행 해금'; change = success ? 'keeper' : 'lost-legacy';
    } else {
      title = success ? '사람들이 돌아오는 터전' : '돌아갈 집을 잃다';
      text = success ? '함께 버틴 사람들이 영웅 곁으로 모였다. 살아온 땅을 다시 가꿀 책임이 새로운 삶의 중심이 된다.' : '살아온 터전은 지도에서 사라졌다. 영웅은 남은 이들과 낯선 땅에서 삶을 다시 시작해야 한다.';
      effect = success ? '터전 재건 · 공동체 진행 해금' : '터전 상실 · 피난 생활 · 정착 진행 해금'; change = success ? 'community' : 'homeless';
    }
    const memory = card.stakes.previous ? ` ‘${card.stakes.previous}’ 이후 이어온 삶은 이 순간 다른 방향으로 꺾였다.` : '';
    return { id: card.id, title, text: text + memory, effect, change, success, stakes: card.stakes };
  }
  function apply(result, s) {
    const w = s.world;
    if (w.crossroads.some(x => x.id === result.id)) return;
    w.crossroads.push(result); add(w.flags, result.change); add(s.milestones, `인생의 갈림길 · ${result.title}`);
    const p = w.partner;
    if (result.change === 'bereaved' && p) p.status = 'dead';
    if (result.change === 'married' && p) p.status = 'spouse';
    if (result.change === 'engaged' && p) p.status = 'fiance';
    if (result.change === 'parent') w.children += 1;
    if (result.change === 'exile') { w.kingdom = 'fallen'; w.vocation = 'exile'; }
    if (result.change === 'rebuilder') w.vocation = 'rebuilder';
    if (result.change === 'lost-legacy') { w.legacy = 'lost'; s.items = s.items.filter(x => x !== result.stakes.item); }
    if (result.change === 'homeless') w.home = 'lost';
    s.recentTags.push(...(result.success ? ['care','legacy'] : ['endure','truth']));
  }
  const event = (id, title, text, step, requirement, milestone, stat = 'charm') => ({
    id, stages: ['adult','middle','mature','elder'], title, text, relationStep: step, ...requirement,
    weight: ['bond','care'], effect: '이어 온 관계와 삶이 다음 기록을 연다.',
    trial: { title: milestone, text: '지금의 마음과 경험으로 한 걸음을 내딛을 수 있을까?', stat, statName: stat === 'charm' ? '매력' : '지식', threshold: 6, mode: 'turn', base: 2,
      helpful: ['bond','care','endure'], success: `${milestone}.`, failure: '아직 한 걸음을 내딛지 못했다. 마음속에 질문이 남았다.', successGain: 1, milestone,
      efforts: [{ code: `${id}-S01`, title: '서로의 이야기를 듣는다', text: '서두르지 않고 지나온 삶을 헤아린다.', stat, statName: stat === 'charm' ? '매력' : '지식', min: 1, max: 3 }] }
  });
  const events = [
    event('LIFE-MEET','등불 아래에서 리안을 만난다','장터의 일을 함께 마치며 리안과 이야기를 나눈다. 아직은 이름을 알게 된 사이일 뿐이다.','meet',{},'리안과 친구가 되다'),
    event('LIFE-COURT','리안과 마음을 나눈다','함께한 시간이 우정을 넘어선다. 서로 같은 마음인지 조심스레 묻는다.','court',{},'리안과 연인이 되다'),
    event('LIFE-ENGAGE','함께할 미래를 약속한다','연인 리안과 서로의 두려움까지 나누며 혼인을 약속하려 한다.','engage',{},'리안과 약혼하다'),
    event('LIFE-MARRY','약속을 혼인으로 잇는다','약혼자 리안과 앞으로의 삶을 함께 꾸릴 준비를 한다.','marry',{},'리안과 혼인하다'),
    ...[
      ['bereaved','남겨진 이름을 기억한다','상실을 지울 수는 없다. 그 이름을 기억하며 살아갈 방법을 찾는다.'],
      ['married','둘이 살아갈 집을 가꾼다','배우자와 함께 살아갈 공간을 정돈하며 서로의 삶을 배운다.'],
      ['parent','아이에게 첫 이야기를 들려준다','작은 생명의 질문 앞에서 자신이 지켜 온 가치를 돌아본다.'],
      ['family','함께 견딘 세월을 돌아본다','배우자와 재앙을 넘긴 뒤, 남은 시간을 어떻게 살아갈지 이야기한다.'],
      ['rebuilder','무너진 성벽 밖의 집을 세운다','재건의 책임은 왕성보다 먼저 사람들의 집으로 향한다.'],
      ['exile','국경 너머 난민을 이끈다','왕국은 없지만 함께 살아남은 사람들을 버릴 수는 없다.'],
      ['keeper','살아남은 기록을 제자에게 맡긴다','재앙에서 지킨 지식을 다음 세대가 이해할 언어로 바꾼다.'],
      ['lost-legacy','사라진 기록을 다시 쓴다','빈손에 남은 기억부터 한 줄씩 복원한다.'],
      ['community','돌아온 이웃과 마을을 세운다','구해 낸 사람들의 내일을 위해 함께 일한다.'],
      ['homeless','낯선 땅에 첫 기둥을 세운다','돌아갈 집은 없어도 새 삶을 시작할 자리는 만들 수 있다.']
    ].map(([flag,title,text]) => event(`AFTER-${flag}`,title,text,null,{ requiresFlag: flag },title))
  ];
  function describe(s) {
    const w = s.world, labels = { friend:'친구',lover:'연인',fiance:'약혼자',spouse:'배우자',dead:'사별한 인연' };
    return [w.partner && `${labels[w.partner.status]} · ${w.partner.name}`, w.children && `자녀 · ${w.children}명`,
      w.vocation && `삶의 길 · ${{knight:'왕국의 기사',healer:'치유자',rebuilder:'재건의 기사',exile:'망국의 기사'}[w.vocation]}`,
      w.home === 'lost' && '재산 · 터전을 잃고 피난 중', ...w.crossroads.map(x => `갈림길 · ${x.title}`)].filter(Boolean);
  }
  return { fresh, eligible, remember, crisis, crossroad, apply, events, describe };
})();

// v1 dungeon state is independent of relationship/crossroad state.
window.dungeonRules = (() => {
  const types = {
    mine: {name:'무너진 광산',stat:'strength',label:'근력',tags:['endure','care','risk'],story:'폐광에서 검은 흙이 흘러나와 우물을 막았다. 입구 너머에서는 끊어질 듯한 두드림이 이어진다.',efforts:['무너진 돌을 걷어 길을 넓힌다','받침목을 세우고 균열의 핵을 부순다']},
    shrine: {name:'잊힌 지하 성소',stat:'knowledge',label:'지식',tags:['study','notice','truth'],story:'버려진 성소의 종이 땅속에서 울린다. 종소리를 들은 밭부터 싹이 검게 마르고, 계단에는 지워진 문장이 떠오른다.',efforts:['벽화와 문장을 맞추어 봉인의 뜻을 찾는다','틀린 문양을 고쳐 봉인을 잇는다']},
    forest: {name:'가시 미궁',stat:'agility',label:'민첩',tags:['risk','bond','protect'],story:'어제까지 있던 길이 가시덤불에 삼켜졌다. 돌아오지 않은 수레의 방울 소리만 숲 안쪽에서 희미하게 들린다.',efforts:['가시가 움직이는 틈을 익힌다','끊어진 길을 건너 미궁의 뿌리에 닿는다']}
  };
  const fresh = () => ({active:null,ruin:0,pressure:0,serial:0,records:[]});
  function create(s,type) {
    const r=s.realm, t=types[type];
    if (!t || r.active) return false;
    const tier=Math.min(5,Math.max(0,s.stageIndex));
    r.active={...t,type,id:`DUNGEON-${++r.serial}`,age:0,attempts:0,
      threshold:[3,6,10,13,16,18][tier]+Math.floor(s.stats[t.stat]*.35),tier};
    r.records.push(`${t.name} 발생`); return true;
  }
  function tick(s) {
    const d=s.realm.active; if(!d) return;
    d.age++;
    if(d.age%2===0) {s.realm.ruin++;s.realm.pressure++;s.realm.records.push(`${d.name}의 침식 · 황폐도 ${s.realm.ruin}`);}
  }
  function willing(s,random=Math.random) {
    const d=s.realm.active;if(!d || s.stats.vitality<=2) return false;
    const tags=[...s.traits,...s.wills].flatMap(x=>x.tags);
    const affinity=d.tags.filter(x=>tags.includes(x)).length;
    const readiness=s.stats[d.stat]/d.threshold;
    const chance=Math.min(.85,.12+affinity*.16+Math.min(.2,readiness*.15)+Math.min(.15,s.realm.ruin*.03));
    return random()<chance;
  }
  function card(s) {
    const d=s.realm.active, child=s.stageIndex===0;
    return {id:`${d.id}-attempt-${++d.attempts}`,dungeon:true,stage:['childhood','adolescent','adult','middle','mature','elder'][s.stageIndex],
      title:child?`${d.name}의 입구를 돕는다`:`${d.name} 토벌에 나선다`,
      text:d.story,story:d.story+(child?' 아이는 토벌대가 놓친 입구의 흔적을 발견한다. 어른들이 안쪽을 맡는 동안, 작은 손으로 바깥의 봉인을 바로잡기로 한다.':' 영웅은 지나치던 발길을 돌린다. 돌아갈 곳이 남아 있을 때 이 균열을 닫아야 한다.'),
      weight:d.tags,effect:'던전 토벌',trial:{title:child?'입구의 작은 봉인':'던전의 심장',text:'침식을 멈추고 살아 돌아올 수 있을까?',stat:d.stat,statName:d.label,threshold:d.threshold,mode:'turn',base:3,helpful:d.tags,
        success:'균열이 닫히고 검은 기운이 걷혔다. 길가에 남아 있던 이들이 처음으로 고개를 들었다.',failure:'영웅은 균열을 남긴 채 물러났다. 던전은 아직 그곳에 있고 밤의 그림자는 더 길어졌다.',successGain:2,failureVitality:1,
        efforts:d.efforts.map((title,i)=>({code:`${d.id}-S${i+1}`,title:child?['입구의 돌을 작은 것부터 치운다','어른에게 배운 표식을 제자리에 놓는다'][i]:title,text:'검은 기운이 물러나는 틈을 놓치지 않는다.',stat:d.stat,statName:d.label,min:i?1:0,max:3}))}};
  }
  function resolve(s,success) {
    const r=s.realm,d=r.active;if(!d)return;
    if(success){r.ruin=Math.max(0,r.ruin-2);s.items.push(`${d.name}의 봉인 파편`);s.milestones.push(`${d.name} 토벌`);r.records.push(`${d.name} 토벌 성공`);r.active=null;}
    else {r.ruin++;r.pressure++;r.records.push(`${d.name} 토벌 실패 · 침식 확대`);}
  }
  return {fresh,types,create,tick,willing,card,resolve};
})();

// Internal voice: no invented relatives, losses or relationships.
window.oracleRules = (() => {
  const themes=[['strength','근력','대지의 가호','무거운 멍에','발밑에서 전해지는 온기가 두 팔을 받친다.','보이지 않는 무게가 어깨를 짓누른다.'],['agility','민첩','바람의 가호','발목을 붙드는 바람','시원한 바람이 불어오며 발걸음이 한결 가볍게 느껴진다.','맞바람이 옷자락을 잡아당긴다. 익숙한 걸음마저 무겁다.'],['knowledge','지식','별빛의 속삭임','흐려진 문장','흩어져 있던 기억들이 별자리처럼 이어진다.','분명 알던 문장이 안개 속으로 흩어진다.'],['intuition','직감','새벽의 눈','거짓된 징조','어둠 속에서 미처 보지 못한 길 하나가 드러난다.','익숙한 표식이 전혀 다른 방향을 가리킨다.'],['charm','매력','따뜻한 메아리','얼어붙은 목소리','조심스레 꺼낸 말에 누군가 고개를 든다.','마음과 달리 차가운 말이 입술을 떠난다.']];
  function fresh(luck=5){
    const cards=themes.flatMap(([stat,label,good,bad,goodText,badText])=>[1,2,3].flatMap(n=>[1,-1].map(sign=>({id:`${stat}-${sign}-${n}`,stat,label,modifier:n*sign,title:sign>0?good:bad,text:sign>0?goodText:badText,kind:'oracle'}))));
    const positiveCopies=1+Math.floor(Math.max(0,Math.min(10,luck))/2);
    const draw=cards.flatMap(card=>Array.from({length:card.modifier>0?positiveCopies:7-positiveCopies},(_,i)=>({...card,id:`${card.id}-copy${i}`})));
    for(let i=0;i<16;i++)draw.push({id:`watch-${i}`,kind:'watch',title:'지켜보기',text:'신은 손을 거둔다. 다음 걸음은 온전히 이 인간의 것이다.'});
    return {draw,discard:[]};
  }
  function draw(deck,luck,random=Math.random){
    const hand=[],value=Math.max(0,Math.min(10,Number(luck)||0));
    for(let i=0;i<7;i++){
      if(!deck.draw.length){deck.draw=deck.discard.splice(0);}
      if(!deck.draw.length)break;
      const weights=deck.draw.map(c=>c.kind==='watch'?3:c.modifier>0?1+value:11-value);
      let cursor=random()*weights.reduce((a,b)=>a+b,0),index=weights.length-1;
      for(let j=0;j<weights.length;j++){cursor-=weights[j];if(cursor<0){index=j;break;}}
      hand.push(deck.draw.splice(index,1)[0]);
    }
    return hand;
  }
  return {fresh,draw};
})();

window.heroThoughts = (s, phase) => {
  const p=s.progress;if(!p)return [];
  const names=s.traits.map(x=>x.name), child=s.stageIndex===0;
  const dog=p.id==='childhood-B02'||p.id==='childhood-S02';
  let lines;
  if(dog) {
    lines=phase==='success'?['귀여운 아이야.','함께 살면 좋겠다.']:phase==='failure'?['놀라게 하려던 건 아니었어.','조금 더 기다려 줄 걸.']:['불쌍한 아이. 내가 널 도와줄 수 있을까.','괜찮아. 천천히 다가갈게.'];
    if(phase==='success' && s.world?.parentsAlive===false && s.world?.parentsKnown===true) lines.push('너도 부모님이 없니?');
  } else if(p.catastrophe) {
    lines=phase==='success'?['아직 끝나지 않았어. 살아남았으니까.','이제 무엇을 지켜야 할까.']:phase==='failure'?['이 대가를 어떻게 잊을 수 있을까.','그래도 남은 사람들을 찾아야 해.']:['이번에는 누가 도와줄까.','내가 지키려던 것은 아직 저 안에 있어.'];
  } else if(p.dungeon) {
    lines=phase==='success'?['바깥 공기가 이렇게 따뜻했구나.','돌아갈 길이 아직 남아 있어.']:phase==='failure'?['지금은 돌아가야 해.','다음에는 이 길을 잊지 않겠어.']:['저 어둠 너머에는 무엇이 있을까.','돌아갈 곳을 남겨 두어야 해.'];
  } else if(p.trial.stat==='strength') {
    lines=phase==='success'?(child?['내가 옮겼어. 정말로.','이제 나도 도울 수 있어.']:['손이 떨린다. 그래도 해냈어.','이 힘을 누군가에게 보탤 수 있겠구나.']):phase==='failure'?['아직 내 힘으로는 무리였나 봐.','숨부터 고르자.']:child?['조금만 더 힘을 주면 될까.','나도 해 보고 싶어.']:['발을 단단히 딛자.','이 손을 지금 놓을 수는 없어.'];
  } else if(p.relationStep && s.world?.partner) {
    lines=phase==='success'?['이 마음이 전해졌으면 좋겠어.','혼자가 아니라는 건 이런 기분일까.']:phase==='failure'?['하고 싶은 말은 따로 있었는데.','너무 서둘렀던 걸까.']:['어떤 말부터 꺼내야 할까.','진심을 알아주면 좋겠어.'];
  } else {
    lines=phase==='success'?['내가 해냈구나.','오늘의 일을 오래 기억하고 싶어.']:phase==='failure'?['생각했던 것과는 달랐어.','어디서 잘못된 걸까.']:['잠깐. 조금만 더 생각해 보자.','내가 할 수 있는 일이 있을 거야.'];
  }
  // Personality is expressed as voice, never an explanatory trait label.
  if(!dog && !p.catastrophe) {
    if(names.includes('완벽주의자'))lines.push(phase==='success'?'이번에는 마음에 들어.':'이대로 끝내고 싶지는 않아.');
    else if(names.includes('의심 많음'))lines.push(phase==='success'?'아직 놓친 것은 없을까.':'보이는 것만 믿어도 될까.');
    else if(names.includes('야망'))lines.push(phase==='success'?'다음에는 더 멀리 갈 수 있겠어.':'여기서 멈출 수는 없어.');
    else if(names.includes('다정함'))lines.push(phase==='failure'?'다친 사람은 없으면 좋겠어.':'누군가에게 도움이 되었으면.');
  }
  return lines.slice(0,3);
};
