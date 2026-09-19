/* Life continuity: eligibility, crisis stakes and persistent crossroads. No UI dependencies. */
window.lifeRules = (() => {
  const freshFate = () => ({ benevolent: 0, harsh: 0, watched: 0, honor: 0, scars: 0, choices: [], outcomes: [], encounters: [] });
  const fresh = () => ({ partner: null, children: 0, vocation: '', kingdom: 'intact', home: 'intact', legacy: 'intact', flags: [], crossroads: [], fate: freshFate() });
  const partnerIdentity = s => s.world?.partner ? {name:s.world.partner.name,gender:s.world.partner.gender || (s.gender === 'female' ? 'male' : 'female')} : s.gender === 'female' ? {name:'유온',gender:'male'} : {name:'리안',gender:'female'};
  const add = (list, value) => { if (!list.includes(value)) list.push(value); };
  // Prerequisites are gates, not weighting hints. requiresAny/All inspect exact
  // milestone names; traits/wills inspect exact names or IDs. Arrays of flags
  // require all entries; forbidsFlag excludes any entry. stage filtering belongs
  // to the caller. Historical flags never override a relationship's live state.
  function eligible(card, s) {
    const w = s.world;
    if (!card) return false;
    const list = value => value == null ? [] : Array.isArray(value) ? value : [value];
    const flags = list(card.requiresFlag), forbidden = list(card.forbidsFlag);
    if (card.requiresHonor && (w.fate?.honor || 0) < card.requiresHonor) return false;
    if (card.requiresScars && (w.fate?.scars || 0) < card.requiresScars) return false;
    if (card.fateEncounter && w.fate?.encounters?.some(x => x.id === card.id)) return false;
    if (card.requiresAny?.length && !card.requiresAny.some(x => s.milestones.includes(x))) return false;
    if (card.requiresAll?.some(x => !s.milestones.includes(x))) return false;
    if (list(card.requiresTraits).some(x => !s.traits.some(t => t.name === x || t.id === x))) return false;
    if (list(card.requiresWills).some(x => !s.wills.some(t => t.name === x || t.id === x))) return false;
    if (card.requiresRelationship && !s.relationships.length) return false;
    if (['P03-C01','P04-C01'].includes(card.id) && w.kingdom !== 'intact') return false;
    if (card.id === 'P04-C01' && !['knight','rebuilder'].includes(w.vocation)) return false;
    if (flags.some(f => ['married','family'].includes(f)) && w.partner?.status !== 'spouse') return false;
    if (flags.includes('parent') && w.children < 1) return false;
    if (flags.includes('bereaved') && w.partner?.status !== 'dead') return false;
    if (flags.includes('rebuilder') && w.vocation !== 'rebuilder') return false;
    if (flags.includes('exile') && w.kingdom !== 'fallen') return false;
    if (flags.includes('homeless') && w.home !== 'lost') return false;
    if (flags.includes('keeper') && w.legacy === 'lost') return false;
    if (flags.includes('lost-legacy') && w.legacy !== 'lost') return false;
    if (flags.some(f => !w.flags.includes(f))) return false;
    if (forbidden.some(f => w.flags.includes(f))) return false;
    if (card.requiresVocation && w.vocation !== card.requiresVocation) return false;
    if (card.requiresKingdom && w.kingdom !== 'intact') return false;
    if (card.id === 'LIFE-RECONNECT') return w.partner?.status === 'acquaintance' && s.stageIndex > (w.partner.metStage ?? 2);
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
    if (card.relationStep === 'meet') w.partner = { ...partnerIdentity(s), status: 'friend', metStage: w.partner?.metStage ?? s.stageIndex };
    const status = { court: 'lover', engage: 'fiance', marry: 'spouse' }[card.relationStep];
    if (status && w.partner && w.partner.status !== 'dead') w.partner.status = status;
    if (card.id === 'AFTER-homeless') { w.home = 'intact'; add(w.flags,'resettled'); }
    if (card.id === 'AFTER-lost-legacy') { w.legacy = 'restored'; add(w.flags,'restored-legacy'); }
  }
  function candidates(s) {
    const w = s.world, list = [];
    const tags = [...s.traits, ...s.wills].flatMap(x => x.tags);
    const weight = keys => 2 + keys.filter(k => tags.includes(k)).length * 3;
    if (s.stageIndex >= 1 && w.partner && ['lover','fiance','spouse'].includes(w.partner.status)) list.push({ kind: 'bond', weight: weight(['bond','care','protect']) });
    if (s.stageIndex >= 2 && ['knight','rebuilder'].includes(w.vocation) && w.kingdom === 'intact') list.push({ kind: 'kingdom', weight: weight(['lead','protect','endure']) });
    if (s.items.length || s.milestones.some(x => /기록|서고|별|치료/.test(x))) list.push({ kind: 'legacy', weight: weight(['study','truth','notice']) });
    list.push({ kind: 'home', weight: weight(['care','bond','endure']) });
    if (s.stageIndex >= 1) list.push({ kind: 'tempest', weight: weight(['risk','protect','lead']) });
    if (s.stageIndex >= 1 && (w.vocation === 'healer' || s.milestones.some(x => /치료|간호|역병|열병/.test(x)))) list.push({ kind: 'plague', weight: weight(['study','care','endure']) });
    if (s.realm && (s.realm.active || s.realm.ruin > 0 || s.realm.records.some(x => /토벌 성공/.test(x)))) list.push({ kind: 'abyss', weight: weight(['notice','truth','protect']) });
    return list;
  }
  function crisis(s, stage, random = Math.random) {
    const pool = candidates(s).flatMap(x => Array(x.weight).fill(x.kind));
    const kind = pool[Math.min(pool.length - 1, Math.floor(Math.max(0, random()) * pool.length))];
    const p = s.world.partner ? { ...s.world.partner } : null;
    const definitions = {
      bond: ['검은 새벽이 사랑하는 이를 삼킨다', `${p?.name}의 손이 검은 균열 너머로 멀어진다. 바로 전까지 나누던 사소한 이야기가 끝나지 않은 채 남았다. 영웅은 함께 돌아가기로 한 길을 바라본다. 아직 대답해야 할 말이 있고, 함께 맞기로 한 아침이 있다.`, 'charm', '매력', ['bond','care','protect'], ['익숙한 이름을 부른다','함께한 기억으로 길을 찾는다']],
      kingdom: ['왕국의 하늘이 무너진다', '왕도 수비대의 문장을 단 영웅 앞에서 성벽과 왕성이 갈라진다. 훈련장에서 수도 없이 들었던 종이 오늘은 도망치라고 울린다. 문 안쪽에는 아직 나가지 못한 시민들이 있다. 영웅은 익숙한 문장을 한 번 쥐고 무너지는 성문 쪽으로 걸어간다.', 'strength', '근력', ['lead','endure','protect'], ['남은 수비대를 규합한다','무너진 방어선을 다시 세운다']],
      legacy: ['기억을 먹는 신의 불길', '종이는 타지 않는데 글자만 재가 되어 떨어진다. 그동안 모아 둔 물건과 기록에서 흔적이 하나씩 지워진다. 영웅은 처음 그것을 손에 넣었던 날을 떠올린다. 전부를 가져갈 수는 없다. 하지만 아무것도 없었던 일로 만들고 싶지도 않다.', 'knowledge', '지식', ['study','notice','truth'], ['흩어진 기록의 규칙을 잇는다','사라질 지식을 사람들에게 전한다']],
      home: ['살아온 땅이 갈라진다', s.world.home === 'lost' ? '낯선 피난처의 바닥에도 같은 금이 번진다. 짐을 풀어 보지도 못한 사람들이 다시 문밖으로 나온다. 더 물러날 곳이 없는 이들 사이에서 영웅은 아직 무너지지 않은 길을 찾는다.' : '집으로 돌아가던 길에 처음 보는 금이 생긴다. 우물의 물은 소리 없이 빠지고, 매일 열리던 문들이 비스듬히 기운다. 영웅은 길모퉁이에서 걸음을 멈춘다. 낯익은 골목 끝에는 아직 밖으로 나오지 못한 사람들이 있다.', 'intuition', '직감', ['care','endure','protect'], ['안전한 피난길을 찾는다','남은 사람들과 버틸 방법을 익힌다']],
      tempest: ['하늘의 바다가 도시로 쏟아진다', '비가 아래에서 위로 솟구친다. 구름 속에 매달려 있던 검은 바다가 기울자 종탑보다 높은 파도가 거리로 밀려온다. 지붕 위에서 흔드는 천 조각 하나가 영웅의 눈에 걸린다. 아직 저곳에는 사람이 있다.', 'agility', '민첩', ['risk','protect','lead'], ['지붕 사이에 밧줄을 건넨다','물이 차오르기 전에 마지막 손을 잡는다']],
      plague: ['잠들지 못하는 종이 울린다', '치료하던 이들의 숨소리 위로 종이 울린다. 종을 치는 사람은 없는데 한 번 울릴 때마다 사람들의 기억이 한 조각씩 사라진다. 영웅은 자기 이름을 잊은 환자의 손을 붙든 채, 전에 적어 둔 처방의 빈칸을 바라본다.', 'knowledge', '지식', ['study','care','endure'], ['남은 증언과 처방을 다시 맞춘다','종소리 사이에 사람들의 이름을 되돌려 준다']],
      abyss: ['닫힌 균열이 이름을 부른다', '던전이 남긴 검은 자국이 밤새 길을 따라 번졌다. 땅 아래에서 사람의 목소리가 들리고, 대답한 이들은 제 그림자를 잃는다. 영웅은 어둠을 바라본다. 낯익은 던전의 흔적이 이번에는 마을 전체를 안쪽으로 끌어당기고 있다.', 'intuition', '직감', ['notice','truth','protect'], ['목소리와 발자국이 어긋나는 곳을 찾는다','진짜 새벽이 들어오는 틈을 지킨다']]
    };
    const [title,text,stat,statName,tags,efforts] = definitions[kind];
    // History grants a modest preparation advantage; ability growth does not make every crisis trivial.
    const preparation = Math.min(2, s.milestones.length >= 4 ? 2 : s.milestones.length >= 2 ? 1 : 0);
    return { id: `CRISIS-${s.crisisCount + 1}`, stage, catastrophe: true, stakes: { kind, partner: p, item: s.items.at(-1), previous: s.milestones.at(-1) },
      title, text, story: text, weight: tags, effect: '이 밤을 건넌 뒤에는 이전의 삶으로 돌아갈 수 없다.',
      trial: { title: '재앙의 끝', text: '주어진 세 번의 노력으로 지켜야 할 삶을 구할 수 있을까?', mode: 'turn', base: 3, stat, statName,
        threshold: Math.max(5, s.stats[stat] + 5 - preparation), helpful: tags,
        success: '영웅은 재앙을 넘어섰다. 이제 살아남은 이들의 삶이 달라진다.', failure: '재앙은 끝났지만 지키려던 삶에 돌이킬 수 없는 대가가 남았다.', successGain: 1, failureVitality: 2,
        efforts: efforts.map((title,i) => ({ code: `CRISIS-${kind}-S0${i+1}`, title, text: i ? '손끝의 떨림이 가라앉기도 전에 다음 일을 붙든다. 누군가는 끝까지 이 자리에 남아야 한다.' : '익숙하던 길이 낯설어졌다. 숨을 한 번 고른 뒤, 눈앞에서 아직 바꿀 수 있는 일부터 시작한다.', stat, statName, min: 0, max: 3 })) }
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
    } else if (k === 'demon') {
      title = success ? '밤의 끝에 남긴 맹세' : '검은 왕의 시대를 살아가다';
      text = success ? '마지막 문양에 새벽빛이 들었다. 밤을 삼키던 왕의 목소리가 끊어진 뒤에도 영웅은 한동안 검을 내려놓지 못했다. 사람들이 성문 밖으로 나왔다. 그들은 구원자의 이름을 부르지만, 영웅은 닫힌 문을 다시 확인한다. 승리란 끝이 아니라, 이 문을 다시 열리게 하지 않겠다는 맹세였다.' : '문은 닫히지 않았다. 검은 왕의 이름이 밤마다 종소리처럼 퍼지고, 해가 떠도 사람들은 창을 열지 않았다. 영웅은 살아남았다는 이유로 다음 날을 맡았다. 사라진 길 위에 작은 등불을 놓는 일부터, 누구도 약속해 주지 않은 아침을 다시 만들어야 했다.';
      effect = success ? '마왕 봉인 · 밤을 건넌 맹세의 기록 해금' : '마왕의 지배 · 터전 상실 · 어둠 속 피난길 해금'; change = success ? 'demon-sealed' : 'demon-victorious';
    } else if (k === 'tempest') {
      title = success ? '물 위에 남긴 길' : '돌아오지 않는 불빛';
      text = success ? '마지막 밧줄을 건넌 뒤에야 영웅은 자기 손바닥이 찢어진 것을 보았다. 피난민들이 길을 묻기 시작했다. 사람들의 신뢰는 훈장보다 무겁고, 그들이 돌아갈 거리는 아직 물 아래에 있다.' : '마지막 창의 불빛이 물속으로 사라졌다. 영웅은 끊어진 밧줄을 오래 놓지 못했다. 살아남은 이들의 이름과 끝내 부르지 못한 이름 사이에서, 이후의 삶은 돌아갈 길을 만드는 일로 기울었다.';
      effect = success ? '피난길의 인도자 · 구호선 건설 해금' : '대홍수의 생존자 · 잃어버린 이름의 기록 해금'; change = success ? 'flood-guide' : 'flood-survivor';
    } else if (k === 'plague') {
      title = success ? '이름을 돌려주는 사람' : '지워진 이름의 병동';
      text = success ? '처음으로 환자가 자신의 이름을 말했다. 뒤이어 가족도, 직업도, 집으로 돌아가는 길도 기억해 냈다. 영웅의 처방은 한 권의 책이 되었고, 그 책을 배우러 오는 발소리가 오래 끊이지 않았다.' : '새벽이 왔지만 빈 침상 옆의 명패들은 읽을 수 없었다. 영웅은 누가 살았는지조차 잊힐까 두려워 밤마다 기억나는 얼굴을 그렸다. 이후의 치료에는 고칠 수 없는 것을 곁에서 견디는 시간도 들어갔다.';
      effect = success ? '기억의 치유자 · 구휼소 전수 해금' : '지워진 이름의 증인 · 추모 진료소 해금'; change = success ? 'memory-healer' : 'nameless-witness';
    } else if (k === 'abyss') {
      title = success ? '균열을 지키는 파수꾼' : '그림자를 잃은 생존자';
      text = success ? '발밑에 제 그림자가 돌아왔다. 영웅은 닫힌 틈 위에 작은 돌탑을 쌓았다. 사람들은 그것을 승리의 표식이라 불렀지만, 영웅에게는 밤마다 다시 확인해야 하는 약속이었다.' : '땅은 잠잠해졌으나 길은 이전의 길이 아니었다. 이웃 마을로 향하던 이정표가 아무 곳도 가리키지 않는다. 영웅은 사라진 자리의 가장자리를 걸으며, 돌아오지 않은 사람들의 흔적을 기록하기 시작했다.';
      effect = success ? '균열 파수꾼 · 봉인 순례 해금' : '심연의 생존자 · 사라진 길의 탐색 해금'; change = success ? 'rift-warden' : 'shadow-survivor';
    } else {
      title = success ? '사람들이 돌아오는 터전' : '돌아갈 집을 잃다';
      text = success ? '함께 버틴 사람들이 영웅 곁으로 모였다. 살아온 땅을 다시 가꿀 책임이 새로운 삶의 중심이 된다.' : '살아온 터전은 지도에서 사라졌다. 영웅은 남은 이들과 낯선 땅에서 삶을 다시 시작해야 한다.';
      effect = success ? '터전 재건 · 공동체 진행 해금' : '터전 상실 · 피난 생활 · 정착 진행 해금'; change = success ? 'community' : 'homeless';
    }
    return { id: card.id, title, text, effect, change, success, stakes: card.stakes };
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
    if (result.change === 'community') w.home = 'intact';
    if (result.change === 'keeper') w.legacy = 'intact';
    if (result.change === 'memory-healer') w.vocation = 'healer';
    if (result.change === 'demon-victorious') { w.home = 'lost'; if (s.realm) s.realm.ruin += 2; }
    if (result.change === 'demon-sealed' && s.realm) s.realm.ruin = Math.max(0,s.realm.ruin - 2);
    s.recentTags.push(...(result.success ? ['care','legacy'] : ['endure','truth']));
  }
  const labels = {strength:'근력',agility:'민첩',knowledge:'지식',intuition:'직감',charm:'매력'};
  const effortVoices = {strength:['남은 자재를 한곳으로 나른다','몸을 낮추어 무게를 받친다. 함께 일하는 이들의 숨이 가까이 들린다.'],agility:['끊어진 길을 조금씩 연결한다','발을 놓을 자리를 확인하고, 뒤따라올 사람이 잡을 줄을 남긴다.'],knowledge:['흩어진 증언을 한 줄씩 맞춘다','빨리 끝내려던 마음을 내려놓는다. 읽을 수 있는 마지막 글자까지 옮겨 적는다.'],intuition:['이전과 달라진 흔적을 살핀다','잊고 지나쳤던 자리에 멈춰 선다. 익숙한 풍경 안의 작은 차이가 길을 알려 준다.'],charm:['서로의 이야기를 듣는다','서두르지 않고 지나온 삶을 헤아린다. 침묵이 길어져도 먼저 자리를 뜨지 않는다.']};
  const event = (id, title, text, step, requirement, milestone, stat = 'charm') => ({
    id, stages: ['adult','middle','mature','elder'], title, text, relationStep: step, ...requirement,
    weight: ['bond','care'], effect: '이어 온 관계와 삶이 다음 기록을 연다.',
    trial: { title: milestone, text: '지금의 마음과 경험으로 한 걸음을 내딛을 수 있을까?', stat, statName: labels[stat], threshold: 6, mode: 'turn', base: 2,
      helpful: ['bond','care','endure'], success: `${milestone}.`, failure: '아직 한 걸음을 내딛지 못했다. 마음속에 질문이 남았다.', successGain: 1, milestone,
      efforts: [{ code: `${id}-S01`, title: effortVoices[stat][0], text: effortVoices[stat][1], stat, statName: labels[stat], min: 0, max: 3 }] }
  });
  const events = [
    event('LIFE-MEET','등불 아래에서 {partner}을 만난다','장터의 일을 함께 마치며 {partner}과 이야기를 나눈다. 아직은 이름을 알게 된 사이일 뿐이다.','meet',{},'{partner}과 친구가 되다'),
    {...event('LIFE-RECONNECT','멀어진 계절 뒤에 다시 만난다','장터의 등불 아래서 {partner}이 먼저 고개를 든다. 처음 만났던 날에는 하지 못했던 이야기가 서로의 얼굴에 남아 있다. 이번에는 조금 더 오래 걸어도 좋을 것 같다.','meet',{},'{partner}과 친구가 되다'),stages:['middle','mature','elder'],story:'오래전 가볍게 인사만 나누던 사람이 장터의 등불 아래 서 있다. {partner}은 영웅의 이름을 기억하고 있었다. 두 사람은 달라진 거리의 이름을 이야기하다가, 자연스럽게 그동안 어디에서 어떻게 살았는지를 묻게 된다.'},
    event('LIFE-COURT','{partner}과 마음을 나눈다','함께한 시간이 우정을 넘어선다. 서로 같은 마음인지 조심스레 묻는다.','court',{},'{partner}과 연인이 되다'),
    event('LIFE-ENGAGE','함께할 미래를 약속한다','연인 {partner}과 서로의 두려움까지 나누며 혼인을 약속하려 한다.','engage',{},'{partner}과 약혼하다'),
    event('LIFE-MARRY','약속을 혼인으로 잇는다','약혼자 {partner}과 앞으로의 삶을 함께 꾸릴 준비를 한다.','marry',{},'{partner}과 혼인하다'),
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
      ['homeless','낯선 땅에 첫 기둥을 세운다','돌아갈 집은 없어도 새 삶을 시작할 자리는 만들 수 있다.'],
      ['flood-guide','물가에 구호선을 띄운다','물이 빠진 거리에는 집 대신 문턱만 남았다. 영웅은 그 문턱마다 배를 대고 오래 기다린다. 배에 오르는 사람들이 이름을 밝힐 때마다, 다음번에는 아무도 밧줄 끝에 남기지 않겠다는 생각이 조용히 자리를 잡는다.'],
      ['flood-survivor','돌아오지 않은 이름을 적는다','구호소 벽에 젖은 종이가 한 장씩 붙는다. 영웅은 잉크가 번지기 전에 읽을 수 있는 이름을 옮겨 적는다. 누군가 그 종이를 찾아 울고, 누군가는 아무 말 없이 돌아선다. 끝내 대답을 듣지 못한 사람들에게도 기다릴 자리를 남겨 두고 싶다.'],
      ['memory-healer','작은 진료소의 문을 연다','배움을 청하러 온 사람에게 영웅은 먼저 환자의 이름을 물으라고 말한다. 효능이 좋은 약초를 가르치는 일보다 오래 걸리는 수업이다. 이름을 되찾은 이들이 문밖에서 서로를 부르는 동안, 영웅은 약장을 닦으며 그 소리를 듣는다.'],
      ['nameless-witness','아무도 기억하지 못하는 이를 돌본다','진료소 구석의 노인은 날마다 다른 이름을 말한다. 영웅은 그중 어느 것도 틀렸다고 하지 않는다. 따뜻한 물을 갈아 놓고 같은 자리에 앉는다. 기억을 되돌릴 수 없는 날에도, 혼자 기다리게 하지는 않을 수 있다.'],
      ['rift-warden','봉인의 돌탑을 다시 찾는다','아이들이 쌓아 놓은 작은 돌이 옛 표식 옆에 늘어났다. 영웅은 웃다가 문득 발밑의 소리를 듣는다. 이번에는 아무것도 들리지 않는다. 그 고요를 오래 지키기 위해, 돌아가는 길의 이정표부터 바로 세운다.'],
      ['shadow-survivor','지도 밖으로 사라진 길을 걷는다','지도에 그려진 다리는 눈앞에 없다. 영웅은 물가에 앉아 오래전 건너편에서 들리던 소리를 떠올린다. 여기에 누군가 살았다고 새 종이에 적고, 빈칸을 지우지 않은 채 지도를 접는다.'],
      ['demon-sealed','닫힌 문 너머의 고요를 듣는다','봉인 앞에 놓인 꽃이 바뀌어 있다. 이름을 남기지 않은 누군가가 여기까지 왔다 간 모양이다. 영웅은 마른 꽃을 치우고 새것을 물에 꽂는다. 문 너머에서 아무 소리도 들리지 않는 하루를, 승리 뒤에도 오래 지켜 나가려 한다.'],
      ['demon-victorious','밤의 검문을 피해 사람들을 이끈다','아이의 신발에 천을 감아 발소리를 죽였다. 영웅은 달이 가려질 때까지 담장 밑에서 기다린다. 오래전에는 누구나 걷던 길을 이제 목숨을 걸고 건너야 한다. 그래도 건너편에서 손짓하는 사람이 있다는 사실만은 어둠이 빼앗지 못했다.']
    ].map(([flag,title,text]) => ({ ...event(`AFTER-${flag}`,title,text,null,{ requiresFlag: flag },title, ({rebuilder:'strength',homeless:'strength',community:'strength',exile:'agility','flood-guide':'agility','flood-survivor':'knowledge',keeper:'knowledge','lost-legacy':'knowledge','memory-healer':'knowledge','nameless-witness':'charm','rift-warden':'intuition','shadow-survivor':'intuition','demon-sealed':'intuition','demon-victorious':'agility'})[flag] || 'charm'), heroic: !['bereaved','married','parent','family'].includes(flag), story: text })),
    {
      id:'FATE-HONOR',fateEncounter:true,relationship:true,heroic:true,stages:['adult','middle','mature','elder'],requiresHonor:4,weight:['protect','care','lead'],
      title:'자기 이름이 아닌 이야기로 불리는 날',text:'장터에서 이름을 부르는 목소리가 들린다. 서로 모르는 사람들이 영웅을 위해 자리를 내준다.',
      story:'장을 거두려던 사람이 영웅을 알아보고 의자를 가져온다. 누군가는 어려울 때 보태 준 손을, 누군가는 끝까지 물러서지 않던 모습을 이야기한다. 영웅이 기억하지 못하는 작은 일까지 다른 사람의 삶에서는 오래 남아 있었다. 말이 끝날 때마다 낯선 사람들이 고개를 끄덕인다. 오늘은 무언가를 해내 보일 필요가 없는 자리다.',effect:'도움을 기억하는 사람들 · 시련 없는 만남'
    },
    {
      id:'FATE-REFUGE',fateEncounter:true,relationship:true,heroic:true,stages:['adult','middle','mature','elder'],requiresScars:4,weight:['endure','bond','care'],
      title:'아무것도 묻지 않는 저녁',text:'여관의 빈자리에 앉자 주인이 따뜻한 그릇을 밀어 준다. 오늘 겪은 일을 설명하라는 말은 없다.',
      story:'어디에서 왔느냐는 질문을 기다리며 문가에 서 있었지만, 여관 주인은 먼저 의자를 빼 준다. 떨리는 손으로 숟가락을 드는 동안에도 실패한 일의 이름을 묻지 않는다. 난롯불 옆에서는 다른 여행자가 젖은 신발을 말린다. 영웅은 그 조용한 일을 한참 바라본다. 계속 견뎌 내야만 자리를 얻을 수 있는 것은 아니라는 듯, 저녁이 천천히 지나간다.',effect:'상처 입은 여행자의 쉼 · 시련 없는 만남'
    },
    {
      id:'FATE-BOTH',fateEncounter:true,relationship:true,heroic:true,stages:['adult','middle','mature','elder'],requiresHonor:4,requiresScars:4,weight:['truth','legacy','endure'],
      title:'칭송이 닿지 않는 자리까지',text:'노래를 짓는 사람이 영웅을 찾아와, 이야기에 빠진 부분이 있다면 알려 달라고 한다.',
      story:'사람들이 부르는 노래에서는 언제나 영웅이 제때 도착한다. 노래를 지은 사람이 그 가사를 읽어 주자 영웅은 한 줄 앞에서 오래 말을 멈춘다. 이겼던 날도 있었고, 그러지 못한 날도 있었다. 상대는 성급히 다음 구절을 읽지 않는다. 둘 사이에 놓인 종이에는 처음으로 환호가 아닌 침묵이 들어갈 자리가 생긴다.',effect:'명예와 상처가 함께 남는 기록 · 시련 없는 만남'
    }
  ];
  // Call only when a hand choice or an outcome commits, not while rendering.
  // The stage/round/event key makes repeats harmless. These counters describe
  // intervention intent and lived consequences; they never change base stats.
  const fateFor = s => s.world.fate || (s.world.fate = freshFate());
  const fateKey = (s, card) => `${s.stageIndex}:${s.roundInStage || 0}:${card?.id || 'unknown'}`;
  function recordDivineChoice(s, card) {
    if (!card || s.progress?.catastrophe) return '';
    const fate = fateFor(s), key = fateKey(s, s.progress);
    if (fate.choices.some(x => x.key === key)) return '';
    const kind = card.kind === 'watch' ? 'watched' : card.modifier > 0 ? 'benevolent' : card.modifier < 0 ? 'harsh' : null;
    if (!kind) return '';
    fate[kind]++;
    fate.choices.push({key, kind, card:card.title, stat:card.stat, modifier:card.modifier || 0});
    return kind === 'harsh' ? '아무도 보지 못한 곳에서 신의 손이 길을 조금 더 가파르게 만들었다.' : kind === 'benevolent' ? '그에게는 우연처럼 느껴질 작은 온기가 발걸음을 받쳤다.' : '누구의 손도 닿지 않은 순간, 그는 자기 힘으로 다음 말을 골랐다.';
  }
  function recordOutcome(s, card, success) {
    if (!card || card.relationship) return '';
    const fate = fateFor(s), key = fateKey(s, card);
    if (fate.outcomes.some(x => x.key === key)) return '';
    fate.outcomes.push({key, success: Boolean(success)});
    const weight = card.weight || [];
    if (success && (card.heroic || card.catastrophe || card.dungeon || weight.some(x => ['care','protect','lead'].includes(x)))) {
      fate.honor += card.catastrophe ? 2 : 1;
      return fate.honor >= 4 ? '그가 지나간 곳에서 이름을 기억하는 사람들이 조금씩 늘어났다.' : '그 일을 기억하는 사람이 한 사람 생겼다.';
    }
    if (!success) {
      fate.scars += card.catastrophe ? 2 : 1;
      return fate.scars >= 4 ? '지난 상처가 아물기도 전에, 그는 다시 하루를 견뎌야 했다.' : '그날의 망설임은 한동안 잠들기 전마다 돌아왔다.';
    }
    return '';
  }
  function resolveFateEncounter(card, s) {
    if (!card?.fateEncounter) return null;
    const fate=fateFor(s);fate.encounters ||= [];
    const remembered=fate.encounters.find(x=>x.id===card.id);
    if(remembered)return remembered;
    if(!eligible(card,s))return null;
    const traits=s.traits.map(t=>t.name);
    const response=traits.includes('야망') ? '시선이 자신에게 모이는 순간을 피하지 않는다. 다만 앞으로 얼마나 더 멀리 가고 싶은지는 쉽게 입 밖에 내지 않는다.' : traits.includes('의심 많음') ? '처음에는 말 뒤에 숨은 부탁을 기다렸다. 아무것도 요구하지 않는 침묵이 이어지자 굳어 있던 어깨가 조금 내려간다.' : traits.includes('다정함') ? '자기 이야기를 하다가도 상대가 비워 둔 잔을 먼저 살핀다. 이야기를 듣는 사람도 오늘 하루를 살아냈다는 것을 잊지 않는다.' : traits.includes('완벽주의자') ? '잘한 일보다 놓친 일이 먼저 입술에 걸린다. 상대가 서둘러 위로하지 않고 끝까지 들어 주는 동안, 말을 고르는 숨이 한결 길어진다.' : '쉽게 꺼내지 못하던 말이 몇 번의 침묵 사이로 조금씩 나온다. 상대는 그 말의 속도를 재촉하지 않는다.';
    const endings={
      'FATE-HONOR':['그 일을 기억하는 사람들','돌아가는 길에 누군가 작은 꽃을 건넨다. 영웅은 그것을 짐 깊숙한 곳에 구겨 넣지 않고 손에 든 채 걷는다. 내일도 누군가의 부탁을 받을지 모르지만, 오늘 들은 감사만큼은 아무 대가 없이 자기 몫으로 남겨 둔다.','세간의 기억 · 이름을 기억하는 사람들'],
      'FATE-REFUGE':['견디지 않아도 되는 잠깐의 시간','빈 그릇을 내려놓자 주인은 말없이 물을 더 따라 준다. 잠시 뒤에 다시 길을 떠나야 할 것이다. 그래도 이 저녁에는, 아무 일도 증명하지 않은 채 따뜻한 자리에 머물렀다는 기억이 남는다.','삶의 흔적 · 조건 없이 머물렀던 저녁'],
      'FATE-BOTH':['영웅담의 빈 줄','영웅은 지우려던 한 줄을 남겨 달라고 한다. 끝내 해내지 못한 일도 있었다는 문장이다. 노래를 짓는 사람은 고개를 끄덕인다. 이후에 불리는 이야기에서는 승리한 이름 곁에, 그 이름이 감당하며 살아온 침묵도 조금 남아 있다.','세간의 기억 · 명예와 상처를 함께 전한 이야기']
    };
    const ending=endings[card.id];if(!ending)return null;
    const result={id:card.id,title:ending[0],text:response+' '+ending[1],effect:ending[2],kind:'fate'};
    fate.encounters.push(result);add(s.milestones,ending[2]);
    return result;
  }
  function describe(s) {
    const w = s.world, labels = { acquaintance:'지인',friend:'친구',lover:'연인',fiance:'약혼자',spouse:'배우자',dead:'사별한 인연' };
    const fate = fateFor(s);
    return [w.partner && `${labels[w.partner.status]} · ${w.partner.name}`, w.children && `자녀 · ${w.children}명`,
      w.vocation && `삶의 길 · ${{knight:'왕국의 기사',healer:'치유자',rebuilder:'재건의 기사',exile:'망국의 기사'}[w.vocation]}`,
      w.home === 'lost' && '재산 · 터전을 잃고 피난 중', fate.honor >= 4 && '세간의 기억 · 도움을 청할 수 있는 이름', fate.scars >= 4 && '삶의 흔적 · 여러 번 무너져도 살아남은 사람', ...w.crossroads.map(x => `갈림길 · ${x.title}`)].filter(Boolean);
  }
  return { fresh, eligible, remember, candidates, crisis, crossroad, apply, events, describe, recordDivineChoice, recordOutcome, partnerIdentity, resolveFateEncounter };
})();

// v1 dungeon state is independent of relationship/crossroad state.
window.dungeonRules = (() => {
  const types = {
    mine: {name:'무너진 광산',stat:'strength',label:'근력',tags:['endure','care','risk'],story:'폐광에서 검은 흙이 흘러나와 우물을 막았다. 입구 너머에서는 끊어질 듯한 두드림이 이어진다.',efforts:['무너진 돌을 걷어 길을 넓힌다','받침목을 세우고 균열의 핵을 부순다']},
    shrine: {name:'잊힌 지하 성소',stat:'knowledge',label:'지식',tags:['study','notice','truth'],story:'버려진 성소의 종이 땅속에서 울린다. 종소리를 들은 밭부터 싹이 검게 마르고, 계단에는 지워진 문장이 떠오른다.',efforts:['벽화와 문장을 맞추어 봉인의 뜻을 찾는다','틀린 문양을 고쳐 봉인을 잇는다']},
    forest: {name:'가시 미궁',stat:'agility',label:'민첩',tags:['risk','bond','protect'],story:'어제까지 있던 길이 가시덤불에 삼켜졌다. 돌아오지 않은 수레의 방울 소리만 숲 안쪽에서 희미하게 들린다.',efforts:['가시가 움직이는 틈을 익힌다','끊어진 길을 건너 미궁의 뿌리에 닿는다']},
    mirror: {name:'물거울의 회랑',stat:'intuition',label:'직감',tags:['notice','truth','risk'],story:'우물에 비친 하늘이 실제 하늘보다 늦게 어두워진다. 물을 길러 간 사람들은 같은 골목을 거듭 돌아오고, 한 번도 없었던 계단이 수면 아래로 이어진다.',efforts:['거울마다 다르게 비치는 그림자를 살핀다','자신의 발소리가 돌아오는 길을 고른다']},
    court: {name:'메아리의 폐정',stat:'charm',label:'매력',tags:['bond','care','lead'],story:'폐정의 빈 의자에서 서로를 탓하는 목소리가 흘러나온다. 그 말을 들은 마을 사람들은 오래된 다툼을 다시 시작한다. 누군가 끝맺지 못한 말을 들으러 안으로 들어가야 한다.',efforts:['분노 아래 묻힌 부탁을 끝까지 듣는다','서로 다른 목소리가 함께 부를 이름을 건넨다']}
  };
  const fresh = () => ({active:null,ruin:0,pressure:0,serial:0,records:[]});
  function create(s,type) {
    const r=s.realm, t=types[type];
    if (!t || r.active) return false;
    const tier=Math.min(5,Math.max(0,s.stageIndex));
    r.active={...t,type,id:`DUNGEON-${++r.serial}`,age:0,attempts:0,pendingAttempt:null,
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
    if (!d) return null;
    if (!d.pendingAttempt) d.pendingAttempt = `${d.id}-attempt-${++d.attempts}`;
    const childEfforts={strength:['작은 돌부터 하나씩 바깥으로 나른다','힘을 모아 입구의 받침목을 지탱한다'],agility:['어른들이 건넨 밧줄 끝을 묶는다','좁은 입구에 남겨진 짐을 꺼낸다'],knowledge:['입구의 표식을 배운 글자와 비교한다','틀린 문양을 어른들에게 짚어 보인다'],intuition:['다른 방향을 가리키는 그림자를 찾는다','진짜 출구에 작은 돌을 줄지어 놓는다'],charm:['겁먹은 이들의 이름을 하나씩 부른다','밖으로 나오는 사람들에게 익숙한 노래를 들려준다']};
    return {id:d.pendingAttempt,dungeon:true,stage:['childhood','adolescent','adult','middle','mature','elder'][s.stageIndex],
      title:child?`${d.name}의 입구를 돕는다`:`${d.name} 토벌에 나선다`,
      text:d.story,story:d.story+(child?' 아이는 토벌대가 놓친 입구의 흔적을 발견한다. 어른들이 안쪽을 맡는 동안, 작은 손으로 바깥의 봉인을 바로잡기로 한다.':' 영웅은 지나치던 발길을 돌린다. 돌아갈 곳이 남아 있을 때 이 균열을 닫아야 한다.'),
      weight:d.tags,effect:'던전 토벌',trial:{title:child?'입구의 작은 봉인':'던전의 심장',text:'침식을 멈추고 살아 돌아올 수 있을까?',stat:d.stat,statName:d.label,threshold:d.threshold,mode:'turn',base:3,helpful:d.tags,
        success:'균열이 닫히고 검은 기운이 걷혔다. 길가에 남아 있던 이들이 처음으로 고개를 들었다.',failure:'영웅은 균열을 남긴 채 물러났다. 던전은 아직 그곳에 있고 밤의 그림자는 더 길어졌다.',successGain:2,failureVitality:1,
        efforts:d.efforts.map((title,i)=>({code:`${d.id}-S${i+1}`,title:child?childEfforts[d.stat][i]:title,text:child?'안쪽에서는 어른들의 발소리가 들린다. 아이는 자기가 맡은 자리에서 다음 신호를 기다린다.':'돌아가는 길을 한 번 확인하고, 아직 끝내지 못한 일 앞으로 몸을 돌린다.',stat:d.stat,statName:d.label,min: 0,max:3}))}};
  }
  function resolve(s,success) {
    const r=s.realm,d=r.active;if(!d)return;
    if(success){r.ruin=Math.max(0,r.ruin-2);s.items.push(`${d.name}의 봉인 파편`);s.milestones.push(`${d.name} 토벌`);r.records.push(`${d.name} 토벌 성공`);r.active=null;}
    else {r.ruin++;r.pressure++;r.records.push(`${d.name} 토벌 실패 · 침식 확대`);d.pendingAttempt=null;}
  }
  return {fresh,types,create,tick,willing,card,resolve};
})();

// Internal voice: no invented relatives, losses or relationships.
window.oracleRules = (() => {
  const themes=[['strength','근력','대지의 가호','무거운 멍에','발밑에서 전해지는 온기가 두 팔을 받친다.','보이지 않는 무게가 어깨를 짓누른다.'],['agility','민첩','바람의 가호','발목을 붙드는 바람','시원한 바람이 불어오며 발걸음이 한결 가볍게 느껴진다.','맞바람이 옷자락을 잡아당긴다. 익숙한 걸음마저 무겁다.'],['knowledge','지식','별빛의 속삭임','흐려진 문장','흩어져 있던 기억들이 별자리처럼 이어진다.','분명 알던 문장이 안개 속으로 흩어진다.'],['intuition','직감','새벽의 눈','거짓된 징조','어둠 속에서 미처 보지 못한 길 하나가 드러난다.','익숙한 표식이 전혀 다른 방향을 가리킨다.'],['charm','매력','따뜻한 메아리','얼어붙은 목소리','조심스레 꺼낸 말에 누군가 고개를 든다.','마음과 달리 차가운 말이 입술을 떠난다.']];
  const luckPercent = value => Number.isFinite(Number(value)) ? Math.max(0,Math.min(100,Number(value))) : 50;
  function fresh(luck=50){
    const cards=themes.flatMap(([stat,label,good,bad,goodText,badText])=>[1,2,3].flatMap(n=>[1,-1].map(sign=>({id:`${stat}-${sign}-${n}`,stat,label,modifier:n*sign,title:sign>0?good:bad,text:sign>0?goodText:badText,kind:'oracle'}))));
    // Physical composition stays stable; current luck, rather than luck at birth,
    // controls each draw. A 1% life event can therefore affect the very next hand.
    const draw=cards.flatMap(card=>Array.from({length:4},(_,i)=>({...card,id:`${card.id}-copy${i}`})));
    for(let i=0;i<16;i++)draw.push({id:`watch-${i}`,kind:'watch',title:'지켜보기',text:'신은 손을 거둔다. 다음 걸음은 온전히 이 인간의 것이다.'});
    return {draw,discard:[],luck:luckPercent(luck)};
  }
  function draw(deck,luck=50,random=Math.random){
    const hand=[],value=luckPercent(luck);deck.luck=value;
    for(let i=0;i<7;i++){
      if(!deck.draw.length){deck.draw=deck.discard.splice(0);}
      if(!deck.draw.length)break;
      const counts={watch:0,good:0,bad:0},kind=c=>c.kind==='watch'?'watch':c.modifier>0?'good':'bad';
      deck.draw.forEach(c=>counts[kind(c)]++);
      // When both signs remain, luck is the exact positive probability among
      // oracle draws. Watch occupies 20% of a fresh pool, never a guaranteed slot.
      // Exhausted categories fall back to remaining physical cards, preserving
      // deck/discard conservation even at 0% and 100% luck.
      const category={watch:25,good:value,bad:100-value};
      let weights=deck.draw.map(c=>category[kind(c)]/counts[kind(c)]);
      if(!weights.some(w=>w>0))weights=deck.draw.map(()=>1);
      let cursor=random()*weights.reduce((a,b)=>a+b,0),index=weights.length-1;
      for(let j=0;j<weights.length;j++){cursor-=weights[j];if(cursor<0){index=j;break;}}
      hand.push(deck.draw.splice(index,1)[0]);
    }
    return hand;
  }
  return {fresh,draw,luckPercent};
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
  } else if(p.relationship) {
    lines=['오래전의 일이 이렇게 돌아오는구나.','무슨 이야기부터 꺼내야 할까.'];
  } else if(p.trial?.stat==='strength') {
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
