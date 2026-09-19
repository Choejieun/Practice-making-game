/* Human encounters are interludes, not tests. Only unmodified, lived abilities shape dialogue. */
window.socialRules = (() => {
  'use strict';
  const labels = { strength: '근력', agility: '민첩', knowledge: '지식', intuition: '직감', charm: '매력', vitality: '체력' };
  const stages = ['childhood', 'adolescent', 'adult', 'middle', 'mature', 'elder'];
  const origins = [
    { id: 'hearth', weight: 22, familyType: 'parents', parent: '몰락한 기사 도란과 약초사 마렌', wealth: '낡은 집과 은화 세 닢', place: '안개가 걷히지 않는 변경 마을', parentsAlive: true, parentsKnown: true,
      caregivers: [{ name: '마렌', relation: '어머니' }, { name: '도란', relation: '아버지' }],
      familyStory: '도란은 더 이상 갑옷을 입지 않지만 비가 오는 날이면 현관의 지붕부터 살핀다. 마렌은 말린 풀을 묶다가도 요람에서 소리가 나면 손을 멈춘다. 잃은 작위에 관해서는 좀처럼 이야기하지 않는 집이다. 대신 오늘 밤 불을 꺼뜨리지 않을 장작이 있는지 서로에게 묻는다.' },
    { id: 'wagon', weight: 20, familyType: 'parents', parent: '떠돌이 악사 벨과 재봉사 유나', wealth: '작은 수레와 갚아 가는 빚', place: '성벽 아래의 오래된 골목', parentsAlive: true, parentsKnown: true,
      caregivers: [{ name: '벨', relation: '아버지' }, { name: '유나', relation: '어머니' }],
      familyStory: '수레가 멈추는 곳마다 창밖의 풍경이 바뀐다. 벨은 아이가 잠든 뒤에야 현을 고르고, 유나는 작아진 옷의 안쪽에 천을 덧댄다. 둘이 다투는 날에도 저녁 밥상에는 자리가 하나 더 마련된다. 아이에게 집은 어느 마을의 이름보다 그 두 목소리에 가깝다.' },
    { id: 'keepers', weight: 20, familyType: 'parents', parent: '묘지기 부부 세온과 나리', wealth: '공동묘지 곁의 오두막과 작은 밭', place: '북쪽 숲의 끝자락', parentsAlive: true, parentsKnown: true,
      caregivers: [{ name: '나리', relation: '어머니' }, { name: '세온', relation: '아버지' }],
      familyStory: '찾아오는 사람들은 대개 낮은 목소리로 말한다. 세온은 누구의 무덤인지 먼저 묻지 않고 문을 열어 주고, 나리는 돌아갈 길에 먹을 빵을 싼다. 아이가 웃으면 방문객도 잠시 얼굴을 든다. 이 집에서는 이별만큼이나 살아 있는 사람의 저녁을 챙기는 일이 중요하다.' },
    { id: 'single-mother', weight: 8, familyType: 'single-parent', parent: '우편 마차를 모는 어머니 로에', wealth: '역참 옆의 작은 방과 튼튼한 장화', place: '두 강이 만나는 역참 마을', parentsAlive: true, parentsKnown: true,
      caregivers: [{ name: '로에', relation: '어머니' }],
      familyStory: '로에는 한 손으로 고삐를, 다른 손으로 아이의 모자를 붙잡는다. 함께 살지 않는 아버지의 편지는 때때로 늦게 도착한다. 로에는 봉투를 숨기지도 답장을 재촉하지도 않는다. 저녁이면 먼 마을에서 보았던 우스운 간판 이야기를 해 주며, 오늘 돌아왔다는 약속부터 지킨다.' },
    { id: 'single-father', weight: 7, familyType: 'single-parent', parent: '등대지기인 아버지 이산', wealth: '등대 아래의 사택과 오래된 요리책', place: '흰 파도가 부서지는 해안', parentsAlive: true, parentsKnown: true,
      caregivers: [{ name: '이산', relation: '아버지' }],
      familyStory: '이산은 먼저 떠난 아내의 요리책에 자기 글씨로 소금의 양을 고쳐 적는다. 잘된 날에는 아이에게 맛을 먼저 보이고, 태운 날에는 둘이 항구로 내려간다. 어머니의 이름을 묻는 질문에는 아는 만큼 답한다. 그 이름 뒤에 언제나 슬픔만 이어지지 않도록, 둘이 함께 웃었던 이야기도 잊지 않는다.' },
    { id: 'grandparents', weight: 9, familyType: 'grandparents', parent: '도공인 할머니 소담과 할아버지 연우', wealth: '가마터 곁의 집과 작은 찻잔들', place: '붉은 흙이 나는 구릉 마을', parentsAlive: null, parentsKnown: false,
      caregivers: [{ name: '소담', relation: '할머니' }, { name: '연우', relation: '할아버지' }],
      familyStory: '바다로 떠난 부모의 소식은 오래 끊겨 있다. 소담은 답을 모르는 일에 거짓말을 보태지 않고, 연우는 아이의 작은 그릇을 자기 작품 곁에 굽는다. 돌아오는 사람을 기다리는 날과 지금 곁에 있는 사람을 사랑하는 날은 다르지 않다. 가마의 불이 꺼지면 셋이 나란히 앉아 저녁을 먹는다.' },
    { id: 'adoptive', weight: 10, familyType: 'adoptive', parent: '양부모인 제본사 단과 지도 제작자 에린', wealth: '책 냄새가 배어 있는 집과 접이식 지도', place: '운하 옆의 제본 거리', parentsAlive: true, parentsKnown: true,
      caregivers: [{ name: '단', relation: '아버지' }, { name: '에린', relation: '어머니' }],
      familyStory: '단과 에린은 아이가 이 집에 처음 왔던 날을 생일만큼 소중히 기억한다. 낡은 담요도 버리지 않고 서랍에 넣어 두었다. 어디에서 왔는지 묻는 날이 오면 함께 찾아보겠다고, 두 사람은 아직 알아듣지 못하는 아이에게 말한다. 그때까지도, 그 뒤에도 이 집의 문은 아이의 것이리라.' },
    { id: 'orphan', weight: 4, familyType: 'orphan', parent: '부모 없음 · 공동 양육소의 돌봄', wealth: '이름표가 달린 작은 상자', place: '강가 구호원의 동쪽 방', parentsAlive: false, parentsKnown: true, caregivers: [],
      familyStory: '부모가 남긴 것은 이름 한 줄과 작은 상자뿐이다. 구호원의 사람들은 돌아가며 요람 곁을 지키고, 앞선 아이들은 빈자리에 자기 장난감을 놓아준다. 누군가 한 사람의 품에서 시작한 삶은 아니지만, 이름을 불러 주는 목소리는 있다. 이 아이가 어떤 사람을 가족이라 부르게 될지는 아직 쓰이지 않았다.' }
  ];
  const npcs = [
    { id: 'tovan', name: '토반', role: '대장장이', stat: 'strength', tags: ['endure', 'protect'], place: '불이 잦아든 대장간', topic: '힘을 오래 나누어 쓰는 법',
      scene: '토반은 식어 가는 쇠를 집게로 뒤집으며 문간에 선 사람에게 자리를 내준다. 굳은살 아래의 손은 뜻밖에 섬세하다. 바닥에는 완성된 칼보다 농부들이 수리를 맡긴 도구가 더 많이 놓여 있다.',
      high: '손잡이를 어느 쪽으로 잡아야 손목이 버티는지 이야기하다가 토반이 망치를 내려놓는다. “아는 손이군.” 그 뒤부터는 쇠가 아니라, 그 손으로 무엇을 지켜 왔는지 묻는다.',
      low: '토반은 무게를 받는 자세를 천천히 보여 준다. 말로는 알 것 같아도 손에 남은 경험은 아직 그만큼 따라오지 않는다. 그는 어려운 이야기를 그만두고 따뜻한 물을 한 잔 내온다. 배척이라기보다, 오늘은 서로에게 익숙한 말이 적은 탓이다.' },
    { id: 'suri', name: '수리', role: '길잡이', stat: 'agility', tags: ['risk', 'notice'], place: '성문 옆의 낮은 담장', topic: '발소리를 남기지 않는 지름길',
      scene: '수리는 진흙 묻은 장화를 담장 아래에서 턴다. 길을 묻는 사람이 없어도 먼저 샛길의 상태를 알려 주는 사람이다. 손가락으로 그린 길은 지도보다 짧지만, 돌이 흔들리는 자리까지 들어 있다.',
      high: '비 오는 날 발을 옮기는 박자가 같다는 것을 알아차리고 수리가 웃는다. 두 사람은 말 대신 담장 위를 몇 걸음 걸어 보인다. 돌아와 앉았을 때는 다음에 함께 걸을 길이 벌써 정해져 있다.',
      low: '샛길의 굽이를 설명하던 수리는 상대가 떠올리는 풍경이 자신과 다르다는 것을 알아차린다. 그는 위험한 지름길 이야기를 접고 넓은 길을 알려 준다. 서로 다른 속도로 길을 익혀 온 두 사람은 성문 앞에서 인사를 나눈다.' },
    { id: 'edrin', name: '에드린', role: '현자', stat: 'knowledge', tags: ['study', 'truth'], place: '창가가 환한 작은 서고', topic: '지워진 기록의 서로 다른 해석',
      scene: '에드린은 펼쳐 둔 책 위에 빈 종이를 올려놓는다. 이미 아는 내용을 옮기는 대신 모르는 부분에 표시를 하는 버릇이다. 누군가 다가오자 책을 덮지 않고 반대편 의자를 손으로 가리킨다.',
      high: '기록의 연대가 맞지 않는 이유를 짚자 에드린의 눈길이 종이에서 얼굴로 옮겨 온다. 서로 다른 근거를 꺼내는 동안 차가 식는다. 그는 다음번에는 자신의 해석이 틀렸다는 증거도 가져와 달라며 문간까지 배웅한다.',
      low: '에드린이 인용한 책을 떠올리지 못해 대답 뒤에 긴 침묵이 생긴다. 현자는 쉬운 이야기로 잠시 말을 돌리지만, 펼쳐 둔 문제를 함께 이어 갈 실마리는 찾지 못한다. 그는 읽기 좋은 책 한 권의 이름을 적어 준 뒤 하던 일로 돌아간다.' },
    { id: 'nera', name: '네라', role: '숲의 약초사', stat: 'intuition', tags: ['notice', 'care'], place: '비 냄새가 머무는 약초 처마', topic: '눈에 보이지 않는 계절의 징후',
      scene: '네라는 말린 풀을 들여놓다가 하늘이 아니라 새들이 앉은 가지를 살핀다. 꽃이 피는 날짜보다 벌이 돌아오는 시간이 더 정확할 때도 있다고 한다. 처마에 나란히 서자 묻지 않은 이야기가 빗소리 사이로 흘러나온다.',
      high: '오늘 숲이 유난히 조용했다는 말에 네라가 고개를 든다. 두 사람은 각자 지나친 작은 징후를 하나씩 맞춰 본다. “다음 비가 오기 전에 다시 들러요.” 약속은 약초를 살 일이 없어도 찾아와도 된다는 뜻처럼 들린다.',
      low: '네라가 가리키는 가지들은 얼핏 모두 비슷해 보인다. 대화를 이어 가려고 한 말은 번번이 다른 계절의 이야기로 돌아간다. 네라는 억지로 고개를 끄덕이게 하지 않고, 비가 약해지면 돌아가기 좋을 길을 알려 준다.' },
    { id: 'morin', name: '모린', role: '이야기꾼', stat: 'charm', tags: ['bond', 'care', 'lead'], place: '공연이 끝난 빈 광장', topic: '말하지 않은 마음을 듣는 일',
      scene: '관객이 떠난 광장에 모린이 작은 종을 거두고 있다. 무대에서 들리던 큰 목소리와 달리 혼잣말은 아주 작다. 지나던 사람이 걸음을 멈추자 그녀는 오늘 이야기에서 무엇이 가장 오래 남았는지 묻는다.',
      high: '화려한 결말보다 잠깐 말을 멈춘 대목이 좋았다고 하자 모린이 웃음을 거둔다. 그 침묵을 알아들은 사람이 있었기 때문이다. 가면을 벗은 뒤의 이야기가 시작되고, 어느새 이름을 부를 때 존댓말의 끝이 조금 부드러워진다.',
      low: '진심을 전하려고 고른 말이 어딘가 격식에 묶인다. 모린도 관객을 대할 때의 웃음으로 답하고, 두 사람은 무대의 이야기에서 더 멀리 나아가지 못한다. 헤어질 때의 인사는 친절하다. 친절과 친밀함 사이에는 아직 채워지지 않은 시간이 있다.' },
    { id: 'haro', name: '하로', role: '순례자', stat: 'vitality', tags: ['endure', 'care'], place: '언덕 위의 물가', topic: '먼 길에서 쉬어 가는 방법',
      scene: '하로는 빨래한 양말을 햇볕에 널고 물가에 앉아 있다. 순례를 시작한 곳보다 쉬었던 장소들을 더 정확히 기억한다. 옆자리를 비우며 그는 목적지를 묻지 않고 발은 괜찮은지 먼저 묻는다.',
      high: '오래 걷고도 몸의 작은 신호를 놓치지 않는 습관을 이야기하자 하로가 자기 여정을 꺼낸다. 빨리 도착하는 법이 아니라 오래 돌아올 수 있는 법에 관한 대화다. 물가를 떠날 때 그는 다음 쉼터에서 기다려도 되겠느냐고 묻는다.',
      low: '대답하는 사이 숨이 조금 가빠진다. 하로는 먼 여정의 이야기를 길게 잇는 대신 자리를 권하고 물통을 건넨다. 오늘은 대화를 잘 이어 가는 것보다 쉬는 편이 낫다. 서로의 이름은 기억하되, 다음 이야기는 몸이 나아진 날에 맡긴다.' },
    { id: 'oren', name: '오렌', role: '수문지기', stat: 'strength', tags: ['protect', 'endure'], place: '강물을 막아 선 오래된 수문', topic: '함께 힘을 쓰는 사람들의 약속',
      scene: '오렌은 수문을 돌리는 긴 손잡이의 금을 살핀다. 강의 힘을 혼자 이기려던 시절에 생긴 흉터라며 손바닥을 펴 보인다. 교대 시간이 지났는데도 그는 다음 사람의 발소리가 들릴 때까지 떠나지 않는다.',
      high: '받치는 사람이 지칠 때를 어떻게 알아보느냐는 질문에 오렌이 몸을 돌린다. 힘에 관한 이야기는 곧 믿고 등을 맡길 사람의 이야기로 바뀐다. 그는 다음 교대가 끝난 뒤 식사를 함께하자며, 늘 혼자 두던 그릇을 하나 더 꺼낸다.',
      low: '수문의 무게를 설명하는 말이 쉽게 와닿지 않는다. 오렌은 직접 손잡이를 잡게 하는 대신 난간 뒤의 안전한 자리를 가리킨다. 수다를 더 나누기에는 물이 차오르는 속도가 빠르다. 그는 다음에 한가할 때 다시 오라며 먼저 일터로 돌아간다.' },
    { id: 'sel', name: '셀', role: '별을 기록하는 수습', stat: 'knowledge', tags: ['study', 'notice', 'legacy'], place: '등불이 하나 남은 관측소', topic: '같은 별을 다르게 기록하는 까닭',
      scene: '셀은 오래된 별자리표 옆에 어젯밤의 하늘을 겹쳐 놓는다. 종이가 자꾸 말려 올라가자 곁에 있던 컵까지 눌림돌로 쓴다. “여기만 어긋나 보여요.” 처음 보는 사람에게도 질문을 감추지 않는 목소리다.',
      high: '기록한 시간이 서로 다르다는 점을 짚자 셀이 급히 의자를 끌어온다. 틀린 것을 알아내는 일이 창피하지 않은 대화는 오랜만이다. 둘이 표의 여백을 채우는 동안 등불이 짧아지고, 다음 관측일 옆에는 두 사람의 이름이 남는다.',
      low: '별의 이름까지는 함께 찾지만 계산이 시작되자 서로의 말을 몇 번 되묻게 된다. 셀은 더 설명하다가 시간을 확인하고 미안한 얼굴로 기록에 돌아간다. 의자는 그대로 두었다. 모르는 것이 줄어드는 날 다시 앉을 자리는 남아 있다.' }
  ];
  const clampRandom = random => Math.min(.999999999, Math.max(0, Number(random()) || 0));
  function weighted(items, random) {
    let cursor = clampRandom(random) * items.reduce((sum, item) => sum + item.weight, 0);
    for (const item of items) { cursor -= item.weight; if (cursor < 0) return item.value; }
    return items.at(-1)?.value;
  }
  const origin = (random = Math.random) => structuredClone(weighted(origins.map(value => ({ value, weight: value.weight })), random));
  const fresh = () => ({ encounters: {}, resolved: {}, slots: [], lastOrdinaryCount: -1 });
  function memory(s) {
    s.world ||= {};
    return s.world.social ||= fresh();
  }
  const tagsOf = s => [...(s.traits || []), ...(s.wills || [])].flatMap(x => x.tags || []);
  const hero = s => s.name || '아이';
  const particle = (name, consonant, vowel) => `${name}${/^[가-힣]$/.test(name.at(-1)) && (name.charCodeAt(name.length - 1) - 44032) % 28 ? consonant : vowel}`;
  const nameSubject = name => particle(name, '은', '는');
  const subject = s => nameSubject(hero(s));
  const slot = s => `${Math.max(0, s.stageIndex || 0)}:${Math.max(0, s.roundInStage || 0)}`;
  function caregivers(s) {
    return Array.isArray(s.origin?.caregivers) ? s.origin.caregivers : [];
  }
  function familyCard(s) {
    const family = caregivers(s), teen = s.stageIndex === 1;
    if (!family.length || s.stageIndex > 1) return null;
    const names = family.map(x => `${x.relation} ${x.name}`).join(' · ');
    const first = family[0];
    return { id: `SOC-FAMILY-${s.stageIndex}`, npcId: `family-${s.origin.id || 'home'}`, social: true, relationship: true, family: true, stage: stages[s.stageIndex], slot: slot(s),
      title: teen ? '집에 돌아와 오늘의 일을 이야기한다' : '잠들기 전, 곁에 있는 목소리', weight: ['bond', 'care'], text: `${particle(names, '과', '와')} 하루의 끝을 함께한다.`,
      story: teen ? `${subject(s)} 문턱에서 흙을 턴다. 밖에서 겪은 일을 어디서부터 말해야 할지 고르는 동안, ${nameSubject(first.name)} 늘 앉던 자리를 비워 준다. 어린 날처럼 무엇이든 대신 결정해 줄 수는 없다는 것을 두 사람 모두 안다.\n\n“오늘은 어땠니.” 짧은 질문 뒤에는 서두르지 않는 기다림이 있다. ${hero(s)}에게도 이제는 집 밖에서 얻은 자기만의 말이 있다.`
        : `${s.origin.familyStory}\n\n잠들기 전의 방에는 낮과 다른 소리가 난다. ${particle(first.name, '이', '가')} 이불을 펴는 동안 ${subject(s)} 오늘 눈에 들어왔던 것을 꺼내 놓는다. 어른에게는 작아 보이는 일도 아이의 입을 거치면 한동안 방 안의 전부가 된다.` };
  }
  function encounter(npc, s) {
    const previous = memory(s).encounters[npc.id];
    return { id: `SOC-${npc.id.toUpperCase()}-${s.stageIndex}`, npcId: npc.id, social: true, relationship: true, stage: stages[s.stageIndex], slot: slot(s),
      title: `${npc.role} ${previous ? particle(npc.name, '을', '를') + ' 다시 만난다' : particle(npc.name, '과', '와') + ' 이야기를 나눈다'}`, text: `${npc.place}에서 잠시 걸음을 멈춘다.`, weight: npc.tags,
      story: `${npc.scene}\n\n${previous ? `예전에 나눈 짧은 대화를 서로 기억하고 있다. ${subject(s)} 그때와 같은 사람으로 이곳에 돌아온 것은 아니다.` : `${subject(s)} 당장 지나가야 할 이유를 잠시 잊는다. 누군가를 만난다는 것은 자기에게 익숙한 세계 밖에 의자를 하나 더 놓는 일인지도 모른다.`} 어떤 이야기를 꺼낼지는 지금까지 살아오며 몸과 마음에 남은 것들이 정한다.` };
  }
  function choose(s, random = Math.random) {
    const m = memory(s), stage = s.stageIndex || 0, round = s.roundInStage || 0;
    // Encounters do not advance the clock: one interlude per eligible slot, never an interlude chain.
    if (stage > 5 || ![1, 3].includes(round) || m.slots.includes(slot(s))) return null;
    if (s.history?.at(-1)?.kind === 'relationship') return null;
    const ordinaryCount = (s.history || []).filter(item => item.kind !== 'relationship').length;
    if (ordinaryCount <= m.lastOrdinaryCount) return null;
    const family = round === 1 && stage <= 1 ? familyCard(s) : null;
    if (family && !(s.usedProgress || []).includes(family.id)) return family;
    const tags = tagsOf(s), available = npcs.filter(npc => {
      const previous = m.encounters[npc.id];
      const id = `SOC-${npc.id.toUpperCase()}-${stage}`;
      return !(s.usedProgress || []).includes(id) && (!previous || (previous.status === 'acquaintance' && stage > previous.stage));
    });
    if (!available.length || (stage === 0 && round === 1)) return null;
    const npc = weighted(available.map(value => ({ value, weight: 2 + value.tags.filter(tag => tags.includes(tag)).length * 2 + (m.encounters[value.id] ? 1 : 3) })), random);
    return encounter(npc, s);
  }
  const topics = {
    strength: ['손으로 무언가를 지탱했던 일', '버틸 힘과 놓아야 할 때의 차이를 이야기한다.'],
    agility: ['익숙한 길을 걷는 방법', '발을 옮기는 박자와 길 위에서 보았던 풍경을 꺼낸다.'],
    knowledge: ['최근에 알게 된 이름 하나', '읽고 들은 것 가운데 아직 답을 얻지 못한 질문을 꺼낸다.'],
    intuition: ['누구도 눈여겨보지 않은 작은 변화', '말보다 먼저 느꼈던 기척을 조심스럽게 설명한다.'],
    charm: ['하루 동안 마주친 사람들', '상대의 표정을 살피며 이야기를 듣고 자기 이야기를 조금 보탠다.'],
    vitality: ['먼 길 끝에서 쉬었던 자리', '몸이 기억하는 피로와 다시 걸을 힘에 관해 말한다.']
  };
  const raw = (s, stat) => Math.max(0, Number(s.stats?.[stat]) || 0);
  function topicFor(s, npc) {
    const stats = Object.keys(labels).filter(stat => stat !== 'vitality' || npc?.stat === 'vitality');
    // A familiar shared subject takes precedence; otherwise the hero speaks from their strongest lived skill.
    const required = threshold(s, npc);
    if (npc && raw(s, npc.stat) >= required) return npc.stat;
    return stats.reduce((best, stat) => raw(s, stat) > raw(s, best) ? stat : best, stats[0]);
  }
  function threshold(s, npc) {
    const mistrust = window.relationshipRules?.difficulty(s,npc?.name || '') || 0;
    if (npc?.stat === 'vitality') return ([4, 5, 6, 6, 6, 5][s.stageIndex || 0] || 6) + mistrust;
    return ([2, 4, 7, 9, 10, 11][s.stageIndex || 0] || 2) + mistrust;
  }
  function voice(s) {
    const names = (s.traits || []).map(x => x.name);
    if (names.includes('고독한 기질')) return '처음에는 짧게 답하지만, 말이 끝날 때마다 상대가 아직 듣고 있다는 것을 확인한다.';
    if (names.includes('의심 많음')) return '쉽게 속내를 꺼내지는 않는다. 그래도 질문을 피하지 않는 상대의 눈을 조금 더 오래 바라본다.';
    if (names.includes('완벽주의자')) return '한 번 꺼낸 말을 고쳐 말하려다가 멈춘다. 이곳에서는 대답을 완성한 뒤에만 입을 열 필요가 없을지도 모른다.';
    if (names.includes('다정함')) return '자기 이야기의 끝에서 상대에게도 같은 질문을 돌려준다. 대답을 기다리는 얼굴에 조급함은 없다.';
    if (names.includes('야망')) return '언젠가 가고 싶은 곳을 숨기지 않는다. 말로 꺼낸 먼 풍경이 잠깐 두 사람 사이에 놓인다.';
    return '말을 다 하고도 잠시 자리를 떠나지 않는다. 대답보다 오래 남는 것은 사람이 말을 들어 주던 표정이다.';
  }
  function resolve(card, s) {
    const m = memory(s);
    if (m.resolved[card.id]) return m.resolved[card.id];
    if (!card.social || !card.relationship) throw new Error('socialRules.resolve requires a social encounter');
    let result, relation;
    if (card.family) {
      const family = caregivers(s);
      if (!family.length || s.stageIndex > 1) return { title: '이미 지나간 저녁', text: '그날의 대화는 기억 속에 남아 있다. 지금의 여정은 다른 곳으로 이어진다.', effect: '인연의 기록 · 시련 없음' };
      const first = family[0], stat = topicFor(s), [topic, detail] = topics[stat];
      result = { title: s.stageIndex === 0 ? '잠들기 전의 대답' : '기다려 주는 사람에게',
        text: `${subject(s)} ${topic}부터 이야기한다. ${detail} ${voice(s)}\n\n${s.stageIndex === 0 ? `${nameSubject(first.name)} 모르는 말이 나오면 아이에게 다시 설명해 달라고 한다. 모든 질문에 답을 주지는 못해도 듣는 일을 그만두지 않는다. 이야기가 느려지고 눈꺼풀이 무거워질 때쯤, 낮 동안 작았던 마음의 자리가 조금 넓어진다.` : `${nameSubject(first.name)} 충고를 꺼내려다가 먼저 말을 끝까지 듣는다. 오래 알고 지냈다는 이유로 아직 모르는 모습까지 다 안다고 할 수는 없다. 두 사람은 오늘 조금 달라진 서로를 바라보며, 식어 가는 저녁을 다시 나눈다.`}`,
        effect: `가족의 대화 · ${labels[stat]}에서 비롯된 화제 · 시련 없음`, topicStat: stat, close: true };
      for (const person of family) {
        relation = `${person.relation} · ${person.name}`;
        s.relationships ||= [];
        if (!s.relationships.includes(relation)) s.relationships.push(relation);
      }
      m.encounters[card.npcId] = { status: 'family', stage: s.stageIndex, names: family.map(x => x.name) };
    } else {
      const npc = npcs.find(x => x.id === card.npcId);
      if (!npc) throw new Error(`Unknown social NPC: ${card.npcId}`);
      const stat = topicFor(s, npc), close = raw(s, npc.stat) >= threshold(s, npc), [topic, detail] = topics[stat];
      const opening = close ? `${subject(s)} ${npc.topic}에 관해 먼저 묻는다.` : `${subject(s)} ${topic}부터 꺼낸다. ${detail}`;
      result = { title: close ? `${npc.name}, 다음 이야기를 기다리는 벗` : `${particle(npc.name, '과', '와')} 인사를 나눈 날`,
        text: `${opening} ${npc[close ? 'high' : 'low']}\n\n${voice(s)} ${close ? `헤어질 때 ${nameSubject(npc.name)} 다음에 들를 곳을 알려 준다. 도움이 필요해서가 아니라 이야기를 더 듣고 싶다는 말이다. 두 사람 사이에 작지만 다음 날까지 이어질 약속이 남는다.` : '더 오래 머문다고 저절로 가까워지는 것은 아닐 것이다. 오늘은 이름을 알고 헤어지는 것으로 충분하다. 서로 다른 날들을 지나 다시 마주친다면 대화도 달라질 수 있다.'}`,
        effect: `${close ? '벗' : '지인'} · ${npc.name} · ${labels[npc.stat]}의 경험이 대화에 반영됨 · 시련 없음`, topicStat: stat, close };
      s.relationships ||= [];
      s.relationships = s.relationships.filter(value => !value.endsWith(` · ${npc.name}`));
      s.relationships.push(`${close ? '벗' : '지인'} · ${npc.name}`);
      m.encounters[npc.id] = { status: close ? 'friend' : 'acquaintance', stage: s.stageIndex, stat: npc.stat, topicStat: stat };
    }
    if (!m.slots.includes(card.slot || slot(s))) m.slots.push(card.slot || slot(s));
    m.lastOrdinaryCount = (s.history || []).filter(item => item.kind !== 'relationship').length;
    m.resolved[card.id] = result;
    return result;
  }
  return { origins, origin, fresh, choose, resolve, npcs, encounter, familyCard, topicFor, memory };
})();
