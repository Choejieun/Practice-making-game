(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const statNames = { strength: "근력", agility: "민첩", knowledge: "지식", intuition: "직감", charm: "매력" };
  const ageSteps = [0, 4, 7, 10, 13, 16, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63, 67, 71, 76];
  const names = ["엘리안", "리아", "에단", "세라핀", "카이렌", "이네스"];

  const traits = [
    { id: "perfectionist", name: "완벽주의자", text: "높은 목표의 진행이 자주 나타나며 실패의 흔적을 오래 남긴다.", tags: ["ambition", "study"] },
    { id: "bookworm", name: "책벌레", text: "지식과 고대 기록에 얽힌 진행이 자주 나타난다.", tags: ["study", "ruin"] },
    { id: "ambitious", name: "야망", text: "권력과 성취를 향한 위험한 길이 열린다.", tags: ["ambition", "court"] },
    { id: "kind", name: "다정함", text: "타인의 곤경과 인연에 얽힌 진행이 자주 나타난다.", tags: ["relation", "mercy"] },
    { id: "fearless", name: "겁없음", text: "전투와 폐허의 길을 피하지 않지만 상처가 잦다.", tags: ["battle", "ruin"] },
    { id: "suspicious", name: "의심 많음", text: "숨겨진 의도와 신의 흔적을 더 빨리 감지한다.", tags: ["divine", "intrigue"] },
    { id: "loner", name: "고독한 기질", text: "홀로 감당하는 진행과 독립적인 의지가 자주 생긴다.", tags: ["solitude", "will"] },
    { id: "charismatic", name: "사람을 끄는 자", text: "조우와 설득의 기회가 늘어나지만 기대도 커진다.", tags: ["relation", "court"] },
    { id: "stubborn", name: "고집", text: "긴 시련을 버티는 힘이 되지만 쉽게 물러서지 않는다.", tags: ["endurance", "will"] }
  ];

  const progressDeck = [
    { id: "letters", min: 4, max: 10, title: "금지된 글자를 따라 쓴다", text: "난롯재 속에서 반쯤 탄 책장을 발견했다.", tag: "유년 · 서재", needs: ["study"], stat: "knowledge", effect: 1, context: "study" },
    { id: "woods", min: 4, max: 14, title: "숲의 울음소리를 좇는다", text: "어른들이 가지 말라던 숲에서 누군가 도움을 청한다.", tag: "유년 · 숲", needs: ["mercy", "battle"], stat: "intuition", effect: 1, context: "danger" },
    { id: "rival", min: 7, max: 18, title: "가장 어려운 문제에 도전한다", text: "모두가 포기한 문제 앞에서 아이는 자리를 뜨지 않았다.", tag: "성장 · 학교", needs: ["ambition", "study"], stat: "knowledge", effect: 1, context: "study" },
    { id: "festival", min: 7, max: 18, title: "마을 축제에 섞여든다", text: "낯선 웃음과 작은 소매치기가 함께 찾아온 밤이다.", tag: "성장 · 마을", needs: ["relation"], stat: "charm", effect: 1, context: "relation" },
    { id: "mira", min: 10, max: 22, title: "말 없는 아이에게 말을 건다", text: "도서관 구석, 같은 책을 붙든 두 손이 마주친다.", tag: "조우 · 도서관", needs: ["study", "relation"], relation: "미라", context: "relation" },
    { id: "mercenary", min: 13, max: 27, title: "피 흘리는 용병을 발견한다", text: "길가의 낯선 이는 검보다 먼저 손을 내민다.", tag: "조우 · 국경", needs: ["mercy", "battle"], relation: "레온", context: "danger" },
    { id: "academy", min: 16, max: 30, title: "왕립 학술원의 문을 두드린다", text: "이름 없는 자에게도 시험지는 공평하게 잔혹하다.", tag: "청년 · 학술원", needs: ["study", "ambition"], flag: "학술원", context: "ambition" },
    { id: "guard", min: 16, max: 32, title: "국경 수비대에 지원한다", text: "전쟁의 냄새가 북쪽 성벽을 타고 내려온다.", tag: "청년 · 국경", needs: ["battle", "ambition"], flag: "수비대", context: "danger" },
    { id: "oldbook", min: 19, max: 38, title: "회수된 고서를 다시 추적한다", text: "어릴 적 놓친 문장이 성인이 된 뒤에도 꿈에 남았다.", tag: "과거 · 폐허", needs: ["study", "ruin"], requiresAny: ["금지된 글자", "학술원"], item: "금이 간 검은 렌즈", context: "study" },
    { id: "court", min: 23, max: 45, title: "왕 앞에서 재능을 증명한다", text: "촛불 백 개가 타는 홀에서 단 한 번의 대답이 운명을 가른다.", tag: "성인 · 왕궁", needs: ["court", "ambition"], flag: "왕실의 신임", context: "authority" },
    { id: "plague", min: 31, max: 54, title: "이름 없는 역병을 연구한다", text: "기적을 기다리는 사람들 앞에서 인간의 지식이 시험받는다.", tag: "중년 · 왕국", needs: ["study", "mercy"], flag: "왕국의 현자", context: "danger" },
    { id: "war", min: 35, max: 59, title: "무너지는 성문을 지킨다", text: "도망치는 군중과 진군하는 적 사이에 영웅이 선다.", tag: "중년 · 전쟁", needs: ["battle", "court"], flag: "구국의 영웅", context: "danger" },
    { id: "temple", min: 39, max: 67, title: "버려진 신전을 조사한다", text: "기도가 끊긴 제단 아래, 신을 향하지 않는 바늘이 잠들어 있다.", tag: "후반 · 신전", needs: ["divine", "ruin"], item: "신을 찌르는 바늘", context: "divine" },
    { id: "heir", min: 43, max: 67, title: "다음 세대에게 지식을 남긴다", text: "삶이 끝나기 전에 한 사람에게라도 진실을 건네려 한다.", tag: "후반 · 계승", needs: ["study", "relation"], stat: "charm", effect: 2, context: "relation" },
    { id: "solitude", min: 27, max: 71, title: "누구도 찾지 않는 길을 걷는다", text: "목적지는 없지만 침묵은 오래된 질문을 선명하게 만든다.", tag: "방랑 · 황야", needs: ["solitude", "will"], stat: "intuition", effect: 1, context: "solitude" },
    { id: "village", min: 4, max: 71, title: "낯선 마을에 머문다", text: "평범한 하루에도 한 사람의 생을 바꿀 선택은 숨어 있다.", tag: "일상 · 마을", needs: [], stat: "charm", effect: 1, context: "relation" },
    { id: "road", min: 4, max: 71, title: "비 내리는 길을 건넌다", text: "진흙과 추위는 영웅이라는 이름을 알지 못한다.", tag: "일상 · 길", needs: [], stat: "strength", effect: 1, context: "endurance" },
    { id: "market", min: 10, max: 71, title: "검은 시장의 속삭임을 듣는다", text: "살 수 없는 것에도 값을 매기는 자들이 모여 있다.", tag: "도시 · 시장", needs: ["intrigue"], item: "검은 동전", context: "intrigue" },
    { id: "memory", min: 47, max: 76, title: "오래된 고향으로 돌아간다", text: "작아진 집과 늙은 나무가 지나온 세월을 대신 말한다.", tag: "후반 · 고향", needs: [], stat: "intuition", effect: 2, context: "solitude" }
  ];

  const synthProgress = [
    { id: "ruin_scholar", title: "혼자 국경의 폐허를 해독한다", text: "책벌레의 집요함과 오래된 실패가 평범한 길에 없던 문을 만든다.", tag: "합성 · 폐허", traits: ["bookworm"], flagsAny: ["학술원", "금지된 글자"], min: 23, item: "금이 간 검은 렌즈", context: "study", stat: "knowledge", effect: 2 },
    { id: "mira_codex", title: "미라와 별 없는 밤의 문서를 펼친다", text: "두 사람의 기억이 서로 다른 절반의 문장을 완성한다.", tag: "합성 · 공동 연구", traits: ["bookworm"], relations: ["미라"], min: 23, flag: "신성문 해독", context: "relation", stat: "knowledge", effect: 2 },
    { id: "royal_sage", title: "왕국의 운명을 계산한다", text: "야망과 학문, 왕실의 신임이 한 인간을 권력의 중심에 세운다.", tag: "합성 · 왕실", traits: ["ambitious"], flagsAll: ["학술원", "왕실의 신임"], min: 31, flag: "왕의 오른팔", context: "authority", stat: "charm", effect: 2 },
    { id: "god_thesis", title: "자신을 바라보는 존재를 논증한다", text: "검은 렌즈와 수정의 흉터가 관찰자의 그림자를 드러낸다.", tag: "합성 · 신의 흔적", items: ["금이 간 검은 렌즈"], flagsAll: ["재앙 생존"], min: 43, flag: "누군가 보고 있다", context: "divine", stat: "intuition", effect: 2 },
    { id: "sever", title: "시선을 자르는 의식을 준비한다", text: "렌즈로 신을 보고 바늘로 연결을 끊는다. 이후의 삶은 기록되지 않는다.", tag: "합성 · 단절", items: ["금이 간 검은 렌즈", "신을 찌르는 바늘"], willsAny: ["신을 의심한다", "도움을 기다리지 않는다"], flagsAll: ["재앙 생존"], min: 51, special: "sever", context: "divine" }
  ];

  const trials = [
    { id: "words", contexts: ["study"], title: "이해할 수 없는 한 문장", text: "모르는 것을 인정할지, 끝내 답을 찾아낼지 시험받는다.", duration: 1, conditions: [{ stat: "knowledge", value: 4 }, { stat: "intuition", value: 5 }], reward: "지식 +2 · ‘금지된 글자’ 기록", rewardStat: "knowledge", rewardValue: 2, flag: "금지된 글자", fail: "끝내 읽지 못한 문장이 마음에 가시처럼 남았다.", failDamage: 0 },
    { id: "exam", contexts: ["ambition"], title: "단 한 번의 시험", text: "완벽한 답을 쓰려는 손이 마감의 종소리보다 느려지고 있다.", duration: 2, conditions: [{ stat: "knowledge", value: 7 }, { stat: "charm", value: 7 }], reward: "지식 +2 · 성취의 기억", rewardStat: "knowledge", rewardValue: 2, flag: "인정받은 재능", fail: "기회는 지나갔지만 실패는 다음 선택에 남았다.", failDamage: 0 },
    { id: "pickpocket", contexts: ["relation", "intrigue"], title: "군중 속의 빈 손", text: "허리춤이 가벼워졌다. 달아나는 그림자를 놓치면 굶주림이 기다린다.", duration: 1, conditions: [{ stat: "agility", value: 5 }, { stat: "intuition", value: 5 }], reward: "민첩 +1 · 도시의 감각", rewardStat: "agility", rewardValue: 1, fail: "도둑을 놓치고 체력을 잃었다.", failDamage: 1 },
    { id: "wounded", contexts: ["danger", "mercy"], title: "피 흘리는 낯선 이", text: "도울 시간은 짧고 길 저편에서는 짐승의 울음이 들린다.", duration: 2, conditions: [{ stat: "intuition", value: 6 }, { stat: "strength", value: 6 }], reward: "직감 +1 · 인연이 깊어진다", rewardStat: "intuition", rewardValue: 1, fail: "머뭇거린 사이 피 냄새가 짐승을 불렀다.", failDamage: 1 },
    { id: "guardian", contexts: ["ruin", "danger", "battle"], title: "폐허의 수호자", text: "돌 사이에서 움직인 것은 짐승도 인간도 아니었다.", duration: 1, conditions: [{ stat: "strength", value: 7 }, { stat: "agility", value: 7 }], reward: "근력 +2 · 폐허의 비밀", rewardStat: "strength", rewardValue: 2, flag: "폐허를 열다", fail: "승리하지 못했으나 살아서 물러났다.", failDamage: 2 },
    { id: "audience", contexts: ["authority"], title: "왕 앞의 증명", text: "의심 많은 귀족들이 한마디 실수만을 기다리고 있다.", duration: 1, conditions: [{ stat: "knowledge", value: 9 }, { stat: "charm", value: 8 }], reward: "매력 +2 · 왕실의 신임", rewardStat: "charm", rewardValue: 2, flag: "왕실의 신임", fail: "조롱은 홀 안에 오래 남았고 명성은 깎였다.", failDamage: 1 },
    { id: "plague_trial", contexts: ["study", "danger"], title: "이름 없는 역병", text: "치료법을 찾을 시간은 사흘. 매일 더 많은 촛불이 꺼진다.", duration: 3, conditions: [{ stat: "knowledge", value: 10 }, { stat: "intuition", value: 10 }], reward: "지식 +2 · 왕국의 현자", rewardStat: "knowledge", rewardValue: 2, flag: "왕국의 현자", fail: "답을 찾지 못한 대가가 영웅의 몸에도 번졌다.", failDamage: 2 },
    { id: "siege", contexts: ["battle", "authority"], title: "무너지는 성문", text: "이 문이 열리면 이름을 아는 모든 이가 죽는다.", duration: 3, conditions: [{ stat: "strength", value: 10 }, { stat: "charm", value: 9 }], reward: "근력 +2 · 구국의 영웅", rewardStat: "strength", rewardValue: 2, flag: "구국의 영웅", fail: "성문은 무너졌고 상처만이 영웅을 증명했다.", failDamage: 2 },
    { id: "godtrace", contexts: ["divine"], title: "기도가 향하지 않는 곳", text: "제단 뒤편의 균열에서 자신의 삶과 닮은 맥박이 느껴진다.", duration: 2, conditions: [{ stat: "intuition", value: 9 }, { stat: "knowledge", value: 9 }], reward: "직감 +2 · 신의 흔적", rewardStat: "intuition", rewardValue: 2, flag: "신의 흔적", fail: "무언가가 먼저 영웅을 들여다보았다.", failDamage: 1 },
    { id: "winter", contexts: ["solitude", "endurance"], title: "긴 겨울의 밤", text: "몸은 약해지고 기억은 자꾸만 먼 곳으로 향한다.", duration: 2, conditions: [{ stat: "strength", value: 8 }, { stat: "intuition", value: 8 }], reward: "체력 +1 · 평온", heal: 1, fail: "세월은 신탁보다 오래 남는 상처를 냈다.", failDamage: 1 }
  ];

  const trialAges = {
    words: [4, 18], exam: [13, 35], pickpocket: [4, 30], wounded: [7, 35], guardian: [19, 50],
    audience: [23, 54], plague_trial: [31, 59], siege: [35, 63], godtrace: [31, 71], winter: [51, 76]
  };

  const oracleTemplates = [
    { id: "spark", name: "작은 깨달음", text: "이번 판정에서 지식 또는 직감 +2", stats: ["knowledge", "intuition"], bonus: 2, cost: 1 },
    { id: "might", name: "붉은 맥박", text: "이번 판정에서 근력 또는 민첩 +3", stats: ["strength", "agility"], bonus: 3, cost: 1 },
    { id: "voice", name: "왕관의 속삭임", text: "이번 판정에서 매력 +4", stats: ["charm"], bonus: 4, cost: 2 },
    { id: "forbidden", name: "금지된 지식", text: "지식 +5. 인간의 그릇에 큰 흔적을 남긴다.", stats: ["knowledge"], bonus: 5, cost: 3 },
    { id: "shield", name: "보이지 않는 방패", text: "이번 실패로 받을 체력 피해를 막는다.", stats: [], bonus: 0, shield: 3, cost: 1 },
    { id: "fate", name: "운명의 편향", text: "현재 시련의 모든 조건에 +3", stats: ["strength", "agility", "knowledge", "intuition", "charm"], bonus: 3, cost: 2 }
  ];

  const catastropheTrials = [
    { title: "손끝의 감각이 사라진다", text: "피부 아래로 투명한 결정이 자라기 시작한다.", conditions: [{ stat: "intuition", value: 7 }, { stat: "strength", value: 7 }], duration: 1 },
    { title: "기억이 결정 속에 갇힌다", text: "이름과 얼굴들이 차가운 광물 안으로 미끄러진다.", conditions: [{ stat: "knowledge", value: 9 }, { stat: "charm", value: 9 }], duration: 1 },
    { title: "재앙의 끝", text: "자신의 몸에서 너무 많은 신의 힘을 분리해야 한다.", conditions: [{ stat: "knowledge", value: 10 }, { stat: "intuition", value: 10 }], duration: 3, finale: true }
  ];

  let state;

  function initialState() {
    return {
      phase: "origin", name: names[Math.floor(Math.random() * names.length)], age: 0, turn: 0,
      traits: [], rerolls: 2, hp: 6, maxHp: 6,
      stats: { strength: 2, agility: 2, knowledge: 2, intuition: 2, charm: 2 },
      intervention: 0, watch: 0, watchThreshold: 10, watchContexts: [], wills: [],
      relations: [], items: [], flags: [], unlockedSynth: [], log: [], milestones: [],
      candidates: [], selectedProgress: null, trial: null, oracles: [], actionUsed: false,
      catastrophe: false, catastropheStage: 0, catastropheTriggered: false, pendingCrossroad: false,
      ended: false, endingType: null, progressHistory: []
    };
  }

  function sample(array, count) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
  }

  function weightedPick(array, weightFn, count) {
    const pool = [...array];
    const result = [];
    while (pool.length && result.length < count) {
      const weights = pool.map(x => Math.max(.1, weightFn(x)));
      const sum = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * sum;
      let index = 0;
      for (; index < pool.length; index++) { r -= weights[index]; if (r <= 0) break; }
      result.push(pool.splice(Math.min(index, pool.length - 1), 1)[0]);
    }
    return result;
  }

  function traitTags() { return state.traits.flatMap(t => t.tags); }
  function hasTrait(id) { return state.traits.some(t => t.id === id); }
  function hasFlag(flag) { return state.flags.includes(flag); }
  function addUnique(list, value) { if (value && !list.includes(value)) list.push(value); }

  function rollTraits() {
    state.traits = sample(traits, 3);
    renderTraits(true);
  }

  function startGame() {
    state.phase = "choose";
    state.turn = 1;
    state.age = ageSteps[1];
    addLog("태어난 아이에게 세 가지 기질이 자리 잡았다.", true, "탄생");
    $("candidateArea").classList.add("hidden");
    $("cardStage").classList.remove("hidden");
    $("divineConsole").classList.add("hidden");
    $("endObservationButton").disabled = false;
    prepareTurn();
  }

  function eligibleSynths() {
    return synthProgress.filter(card => {
      if (state.age < card.min) return false;
      if ((card.traits || []).some(t => !hasTrait(t))) return false;
      if ((card.relations || []).some(r => !state.relations.includes(r))) return false;
      if ((card.items || []).some(i => !state.items.includes(i))) return false;
      if ((card.flagsAll || []).some(f => !hasFlag(f))) return false;
      if (card.flagsAny && !card.flagsAny.some(f => hasFlag(f))) return false;
      if (card.willsAny && !card.willsAny.some(w => state.wills.some(v => v.name === w))) return false;
      return true;
    });
  }

  function updateSynthUnlocks() {
    eligibleSynths().forEach(card => {
      if (!state.unlockedSynth.includes(card.id)) {
        state.unlockedSynth.push(card.id);
        addMilestone(`합성 진행 해금 — ${card.title}`, "삶의 조건들이 겹쳐 새로운 카드가 덱에 추가되었다.");
      }
    });
  }

  function prepareTurn() {
    if (state.ended) return;
    state.actionUsed = false;
    state.selectedProgress = null;
    updateSynthUnlocks();

    if (!state.catastropheTriggered && state.intervention >= 9 && state.age >= 31) {
      startCatastrophe();
      return;
    }
    if (state.catastrophe) {
      prepareCatastropheStage();
      return;
    }
    if (state.turn >= ageSteps.length - 1) {
      endGame("natural");
      return;
    }

    state.phase = "choose";
    $("phaseKicker").textContent = `${state.age}세 · ${lifeStage(state.age)}`;
    $("phaseTitle").textContent = state.trial ? "끝나지 않은 시련을 품고도 삶은 흐른다" : "세 갈래 길이 인간 앞에 놓였다";
    $("phaseSeal").textContent = `제 ${state.turn}막`;
    $("divineConsole").classList.add("hidden");
    $("resultPanel").classList.add("hidden");
    $("candidateArea").classList.remove("hidden");
    $("candidateArea").querySelector(".candidate-heading h3").textContent = "진행 카드 후보";
    $("candidateArea").querySelector(".candidate-heading .eyebrow").textContent = "THREE THREADS";
    $("candidateArea").querySelector(".candidate-heading p").textContent = "성격·의지·관계·과거가 후보를 바꿉니다.";
    $("originActions")?.classList.add("hidden");
    $("rerollButton").classList.add("hidden");
    $("beginButton").classList.add("hidden");

    const eligible = progressDeck.filter(c => state.age >= c.min && state.age <= c.max && (!c.requiresAny || c.requiresAny.some(f => hasFlag(f))));
    const tags = traitTags();
    const normals = weightedPick(eligible, card => {
      let w = 1;
      card.needs.forEach(tag => { if (tags.includes(tag)) w += 2.4; });
      state.wills.forEach(will => { if (will.context === card.context) w += 2; });
      if (state.progressHistory.includes(card.id)) w *= .3;
      if (card.relation && !state.relations.includes(card.relation)) w += 1.4;
      return w;
    }, 3);
    const unlocked = eligibleSynths();
    if (unlocked.length) normals[Math.floor(Math.random() * normals.length)] = sample(unlocked, 1)[0];
    state.candidates = normals;
    renderCandidates();
    renderAll();
  }

  function chooseProgress(card) {
    if (state.phase !== "choose") return;
    state.selectedProgress = card;
    state.phase = "action";
    state.progressHistory.push(card.id);
    if (card.stat && card.effect) state.stats[card.stat] = Math.min(12, state.stats[card.stat] + card.effect);
    if (card.relation) {
      addUnique(state.relations, card.relation);
      const relationWith = card.relation.endsWith("온") ? `${card.relation}과` : `${card.relation}와`;
      addMilestone(`${relationWith}의 인연`, `${card.title}에서 시작된 관계가 삶에 남았다.`);
    }
    if (card.item) {
      addUnique(state.items, card.item);
      addMilestone(`특수 아이템 — ${card.item}`, "지금은 알 수 없는 쓰임이 훗날 다른 길을 연다.");
    }
    if (card.flag) addUnique(state.flags, card.flag);
    addLog(`${card.title}. ${card.text}`, !!(card.relation || card.item || card.special), card.title);

    if (card.special === "sever") {
      state.trial = {
        id: "severance", title: "신과 인간 사이의 실", text: "평생 자신을 내려다본 시선을 마주하고, 그 연결을 끊으려 한다.",
        duration: 3, remaining: 3, conditions: [{ stat: "intuition", value: 11 }, { stat: "knowledge", value: 11 }],
        reward: "신과의 연결 단절", special: "sever", context: "divine", fail: "의식은 흔들렸지만 연결은 아직 남아 있다.", failDamage: 1
      };
    } else if (!state.trial) {
      state.trial = createTrial(card.context);
    }
    dealOracles();
    $("candidateArea").classList.add("hidden");
    $("divineConsole").classList.remove("hidden");
    renderCards();
    renderAll();
  }

  function createTrial(context) {
    const ageEligible = trials.filter(t => state.age >= trialAges[t.id][0] && state.age <= trialAges[t.id][1]);
    const matches = ageEligible.filter(t => t.contexts.includes(context));
    const base = (matches.length ? sample(matches, 1)[0] : sample(ageEligible, 1)[0]);
    const scale = Math.floor(state.age / 22);
    return { ...base, conditions: base.conditions.map(c => ({ ...c, value: Math.min(12, c.value + scale) })), remaining: base.duration, context };
  }

  function dealOracles() {
    const hand = sample(oracleTemplates, 4);
    state.oracles = hand.map(card => ({ ...card }));
  }

  function useOracle(card) {
    if (state.phase !== "action" || state.actionUsed) return;
    state.actionUsed = true;
    state.intervention += card.cost;
    addLog(`신탁 「${card.name}」이 공개되어 즉시 인간에게 닿았다.`, true, "신탁 공개");
    resolveTrial(card);
  }

  function watch() {
    if (state.phase !== "action" || state.actionUsed) return;
    state.actionUsed = true;
    state.watch += 1;
    const context = state.trial?.context || state.selectedProgress?.context || "solitude";
    state.watchContexts.push(context);
    if (state.watchContexts.length > 12) state.watchContexts.shift();
    addLog("신은 손을 뻗지 않았다. 인간은 자신의 힘으로 다음 순간을 맞았다.", false);
    resolveTrial(null);
  }

  function contextualBonus(stat) {
    let bonus = 0;
    state.wills.forEach(will => {
      if (will.stat === stat && (will.context === state.trial?.context || will.context === state.selectedProgress?.context)) bonus += 1;
    });
    state.relations.forEach(rel => {
      if (rel === "미라" && stat === "knowledge" && ["study", "divine"].includes(state.trial?.context)) bonus += 1;
      if (rel === "레온" && stat === "strength" && state.trial?.context === "danger") bonus += 1;
    });
    if (state.items.includes("금이 간 검은 렌즈") && stat === "intuition" && state.trial?.context === "divine") bonus += 1;
    return bonus;
  }

  function resolveTrial(oracle) {
    const trial = state.trial;
    if (!trial) return;
    const values = {};
    Object.keys(state.stats).forEach(stat => {
      const oracleBonus = oracle && oracle.stats.includes(stat) ? oracle.bonus : 0;
      values[stat] = state.stats[stat] + contextualBonus(stat) + oracleBonus;
    });
    const met = trial.conditions.some(c => values[c.stat] >= c.value);
    const shield = oracle?.shield || 0;

    if (met) {
      if (trial.special === "sever") {
        showResult(true, "연결이 끊어졌다", "바늘이 보이지 않는 실을 꿰뚫었다. 신의 기록은 여기서 끝난다.");
        addMilestone("신과의 연결 단절", "그 뒤의 삶은 오직 인간 자신의 것이 되었다.");
        setTimeout(() => endGame("severed"), 550);
        return;
      }
      if (state.catastrophe) {
        resolveCatastropheSuccess(trial);
        return;
      }
      applyReward(trial);
      state.trial = null;
      showResult(true, "시련을 넘어섰다", trial.reward);
      addLog(`시련 「${trial.title}」을 극복했다. ${trial.reward}`, true, trial.title);
    } else {
      trial.remaining -= 1;
      const baseDamage = trial.remaining <= 0 ? (trial.failDamage || 0) : 0;
      const damage = Math.max(0, baseDamage - shield);
      if (trial.remaining <= 0) {
        state.hp -= damage;
        const shieldText = baseDamage > 0 && damage === 0 ? " 보이지 않는 방패가 상처만은 막았다." : "";
        showResult(false, "시련은 실패로 남았다", `${trial.fail}${damage ? ` 체력 -${damage}.` : ""}${shieldText}`);
        addLog(`시련 「${trial.title}」에 실패했다. ${trial.fail}`, true, "실패의 흔적");
        addUnique(state.flags, `${trial.title} 실패`);
        state.trial = null;
      } else {
        showResult(false, "아직 끝나지 않았다", `남은 시간 ${trial.remaining}턴. 다음 삶의 장면에서도 이 시련은 계속된다.`);
        addLog(`「${trial.title}」의 기한이 ${trial.remaining}턴 남았다.`, false);
      }
    }

    if (state.watch >= state.watchThreshold) awakenWill();
    if (state.hp <= 0) { setTimeout(() => endGame("death"), 550); return; }
    renderAll();
  }

  function applyReward(trial) {
    if (trial.rewardStat) state.stats[trial.rewardStat] = Math.min(12, state.stats[trial.rewardStat] + (trial.rewardValue || 1));
    if (trial.heal) state.hp = Math.min(state.maxHp, state.hp + trial.heal);
    if (trial.flag) addUnique(state.flags, trial.flag);
  }

  function showResult(success, title, text) {
    state.phase = "result";
    $("divineConsole").classList.add("hidden");
    $("resultPanel").classList.remove("hidden");
    $("resultPanel").classList.toggle("failure", !success);
    $("resultMark").textContent = success ? "◇" : "†";
    $("resultKicker").textContent = success ? "TRIAL OVERCOME" : "THE MARK REMAINS";
    $("resultTitle").textContent = title;
    $("resultText").textContent = text;
    $("continueButton").textContent = state.catastrophe ? "재앙의 다음 순간" : "시간을 흐르게 한다";
  }

  function nextTurn() {
    if (state.ended) return;
    if (state.pendingCrossroad) { showCrossroad(); return; }
    if (!state.catastrophe) {
      state.turn += 1;
      state.age = ageSteps[Math.min(state.turn, ageSteps.length - 1)];
      if (state.age >= 55 && Math.random() < .22) state.hp -= 1;
    }
    if (state.hp <= 0) { endGame("death"); return; }
    prepareTurn();
  }

  function startCatastrophe() {
    state.catastrophe = true;
    state.catastropheTriggered = true;
    state.catastropheStage = 0;
    state.trial = null;
    addMilestone("재앙 — 수정화", "축적된 신의 힘이 인간의 몸을 안쪽부터 결정으로 바꾸기 시작했다.");
    showModal({
      kicker: "CATASTROPHE",
      title: "재앙 · 수정화",
      body: `<p>너무 많은 기적이 한 인간의 몸에 스며들었다. 피부 아래에서 투명한 결정이 자라며 평범한 진행이 멈춘다.</p><p class="route-note">재앙이 끝날 때까지 오직 특수 턴만 진행된다.</p>`,
      actions: [{ label: "재앙을 마주한다", primary: true, onClick: () => { closeModal(); prepareCatastropheStage(); } }]
    });
    renderAll();
  }

  function prepareCatastropheStage() {
    const base = catastropheTrials[Math.min(state.catastropheStage, catastropheTrials.length - 1)];
    const stageId = `cat-${state.catastropheStage}`;
    if (!state.trial || state.trial.id !== stageId) {
      state.trial = { ...base, id: stageId, remaining: base.duration, context: "divine", fail: "결정이 더 깊이 파고들었다.", failDamage: 1 };
    }
    state.selectedProgress = { title: "수정화가 계속된다", text: "일상의 시간은 멈추고 인간의 몸이 전장이 되었다.", tag: `재앙 특수 턴 ${state.catastropheStage + 1}`, context: "divine" };
    state.phase = "action";
    state.actionUsed = false;
    dealOracles();
    $("candidateArea").classList.add("hidden");
    $("cardStage").classList.remove("hidden");
    $("divineConsole").classList.remove("hidden");
    $("resultPanel").classList.add("hidden");
    $("phaseKicker").textContent = "CATASTROPHE · 수정화";
    $("phaseTitle").textContent = base.finale ? "마지막 시련 — 인간의 몸에서 신을 떼어내라" : "일반 진행이 중단되었다";
    $("phaseSeal").textContent = `특수 ${state.catastropheStage + 1}`;
    renderCards();
    renderAll();
  }

  function resolveCatastropheSuccess(trial) {
    if (trial.finale) {
      state.catastrophe = false;
      state.pendingCrossroad = true;
      state.trial = null;
      addUnique(state.flags, "재앙 생존");
      addLog("인간은 신의 도움과 자신의 힘 사이에서 몸을 되찾았다.", true, "재앙의 끝");
      showResult(true, "재앙의 끝", "살아남은 대가로 인간의 몸에는 되돌릴 수 없는 변화가 남았다.");
    } else {
      state.catastropheStage += 1;
      state.trial = null;
      showResult(true, "결정에 저항했다", "재앙의 한 겹을 벗겨냈다. 그러나 가장 깊은 흔적은 아직 남아 있다.");
    }
    renderAll();
  }

  function showCrossroad() {
    state.pendingCrossroad = false;
    showModal({
      kicker: "LIFE CROSSROAD",
      title: "인생의 갈림길",
      body: `<p>재앙을 견딘 인간은 예전의 몸으로 돌아갈 수 없다. 남은 흔적을 어떻게 받아들일지는 한 생의 다음 장을 바꾼다.</p><div class="choice-list"><button class="choice-button" data-cross="hand"><strong>수정 오른손</strong><small>지식 +2. 신성한 흔적과 공명하며 숨은 진행을 연다.</small></button><button class="choice-button" data-cross="scar"><strong>별빛 흉터</strong><small>직감 +2. 신의 시선을 더 빠르게 알아챈다.</small></button></div>`,
      actions: []
    });
    document.querySelectorAll("[data-cross]").forEach(btn => btn.addEventListener("click", () => {
      if (btn.dataset.cross === "hand") { addUnique(state.items, "수정 오른손"); state.stats.knowledge += 2; addMilestone("갈림길 — 수정 오른손", "결정으로 굳은 손이 신성한 힘에 반응한다."); }
      else { addUnique(state.items, "별빛 흉터"); state.stats.intuition += 2; addMilestone("갈림길 — 별빛 흉터", "밤마다 빛나는 흉터가 보이지 않는 시선을 느낀다."); }
      closeModal();
      state.turn += 1;
      state.age = ageSteps[Math.min(state.turn, ageSteps.length - 1)];
      prepareTurn();
    }));
  }

  function awakenWill() {
    const counts = state.watchContexts.reduce((acc, c) => ((acc[c] = (acc[c] || 0) + 1), acc), {});
    const top = Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0] || "solitude";
    const pools = {
      study: [
        { name: "스스로 답을 찾는다", text: "누군가 알려주기를 기다리지 않고 직접 조사하는 삶을 선호한다.", stat: "knowledge", context: "study" },
        { name: "실패를 기억한다", text: "과거에 풀지 못한 문제를 다시 만났을 때 쉽게 놓지 않는다.", stat: "intuition", context: "study" }
      ],
      danger: [
        { name: "상처를 두려워하지 않는다", text: "위험한 상황에서 버티는 길에 더 강해진다.", stat: "strength", context: "danger" },
        { name: "도움을 기다리지 않는다", text: "위기에서 타인의 손보다 자신의 감각을 믿는다.", stat: "agility", context: "danger" }
      ],
      relation: [
        { name: "인연을 저버리지 않는다", text: "관계가 걸린 사건에서 말과 기억이 힘이 된다.", stat: "charm", context: "relation" },
        { name: "떠난 이를 기억한다", text: "잃은 관계가 이후의 선택에 오래 남는다.", stat: "intuition", context: "relation" }
      ],
      authority: [{ name: "무릎 꿇지 않는다", text: "권력 앞에서 자신의 목소리를 잃지 않는다.", stat: "charm", context: "authority" }],
      divine: [
        { name: "신을 의심한다", text: "기적의 대가와 보이지 않는 의도를 먼저 살핀다.", stat: "intuition", context: "divine" },
        { name: "신을 찾고 싶다", text: "삶에 남은 불가능한 흔적을 끝까지 추적한다.", stat: "knowledge", context: "divine" }
      ],
      solitude: [{ name: "고독을 견딘다", text: "혼자 걷는 길에서 생각이 더 선명해진다.", stat: "intuition", context: "solitude" }],
      endurance: [{ name: "끝까지 버틴다", text: "오래 지속되는 고난 속에서 힘이 쉽게 꺾이지 않는다.", stat: "strength", context: "endurance" }],
      intrigue: [{ name: "모든 호의를 의심한다", text: "감춰진 의도를 살피는 사건에서 예민해진다.", stat: "intuition", context: "intrigue" }]
    };
    const fallback = pools.solitude;
    const candidates = sample([...(pools[top] || fallback), ...fallback], 3);
    const gained = candidates[Math.floor(Math.random() * candidates.length)];
    state.wills.push(gained);
    state.watch -= state.watchThreshold;
    state.watchThreshold = Math.max(6, state.watchThreshold - 1);
    addMilestone(`의지 발현 — ${gained.name}`, gained.text);
    showModal({
      kicker: "THE HUMAN WILL",
      title: `의지 · ${gained.name}`,
      body: `<p>${gained.text}</p><p>최근 신이 방관한 <strong>${contextLabel(top)}</strong>의 기억에서 세 후보가 떠올랐고, 그중 하나가 인간의 서사가 되었다.</p><p class="route-note">이 의지는 지금 당장 독단 행동을 일으키지 않는다. 앞으로 같은 맥락의 판정과 진행 후보에 영향을 준다. 다음 발현 기준은 ${state.watchThreshold}.</p>`,
      actions: [{ label: "그 의지를 기록한다", primary: true, onClick: closeModal }]
    });
  }

  function lifeStage(age) {
    if (age < 13) return "유년";
    if (age < 20) return "성장";
    if (age < 40) return "청년";
    if (age < 60) return "중년";
    return "노년";
  }

  function contextLabel(context) {
    return ({ study: "배움", danger: "위기", relation: "관계", authority: "권력", divine: "신의 흔적", solitude: "고독", endurance: "인내", intrigue: "의심", ambition: "야망", ruin: "폐허", mercy: "자비", battle: "전투", court: "왕실", will: "의지" })[context] || "침묵";
  }

  function addLog(text, important = false, title = "") {
    state.log.unshift({ age: state.age, text });
    if (important) addMilestone(title || text.slice(0, 20), text);
  }

  function addMilestone(title, text) {
    state.milestones.unshift({ age: state.age, title, text });
  }

  function endGame(type) {
    if (state.ended) return;
    state.ended = true;
    state.endingType = type;
    state.phase = "ended";
    const ending = {
      death: { title: "끝내 닿지 못한 숨", text: `${state.name}은 ${state.age}세에 생을 마쳤다. 신은 마지막 순간까지 그 삶을 기록했다.` },
      severed: { title: "기록 밖의 인간", text: `${state.name}은 신과의 연결을 끊었다. 그 뒤에도 삶은 계속되었지만, 신은 더 이상 알 수 없었다.` },
      observed: { title: "눈을 감은 신", text: `신은 ${state.age}세의 ${state.name}에게서 시선을 거두었다. 남은 삶은 관찰되지 않았다.` },
      natural: { title: "한 인간의 완전한 생애", text: `${state.name}은 ${state.age}세에 긴 생을 마쳤다. 기적과 침묵이 함께 만든 한 사람의 시간이 끝났다.` }
    }[type];
    const recapItems = [...state.milestones].reverse().slice(0, 10);
    const recap = recapItems.length ? recapItems.map(m => `<p><strong>${m.age}세 · ${m.title}</strong><br>${m.text}</p>`).join("") : "<p>짧은 삶에도 선택의 흔적은 남았다.</p>";
    showModal({
      kicker: "LIFE REMEMBRANCE",
      title: `엔딩 · ${ending.title}`,
      body: `<p class="ending-title">${ending.text}</p><div class="recap">${recap}</div><p>성격: ${state.traits.map(t => t.name).join(" · ")}<br>의지: ${state.wills.map(w => w.name).join(" · ") || "발현되지 않음"}<br>신성 개입: ${state.intervention} · 중요 사건: ${state.milestones.length}</p>`,
      actions: [{ label: "새로운 생을 기록한다", primary: true, onClick: resetGame }]
    });
    renderAll();
  }

  function resetGame() {
    closeModal();
    state = initialState();
    rollTraits();
    $("candidateArea").classList.remove("hidden");
    $("cardStage").classList.add("hidden");
    $("divineConsole").classList.add("hidden");
    $("resultPanel").classList.add("hidden");
    $("rerollButton").classList.remove("hidden");
    $("beginButton").classList.remove("hidden");
    $("candidateArea").querySelector(".candidate-heading h3").textContent = "타고난 성격";
    $("candidateArea").querySelector(".candidate-heading .eyebrow").textContent = "ORIGIN";
    $("candidateArea").querySelector(".candidate-heading p").textContent = "세 장은 함께 한 인간의 기질이 된다.";
    $("phaseKicker").textContent = "탄생의 밤";
    $("phaseTitle").textContent = "한 인간이 첫 숨을 쉰다";
    $("phaseSeal").textContent = "서막";
    $("endObservationButton").disabled = true;
    renderAll();
  }

  function renderTraits(origin = false) {
    $("traitList").innerHTML = state.traits.map(t => `<span class="chip" title="${t.text}">${t.name}</span>`).join("");
    if (origin) {
      $("candidateGrid").innerHTML = state.traits.map((t, i) => `<article class="candidate-card"><span class="index">0${i + 1} · TRAIT</span><h4>${t.name}</h4><p>${t.text}</p><footer>${t.tags.map(contextLabel).join(" · ")}</footer></article>`).join("");
    }
  }

  function renderCandidates() {
    $("candidateGrid").innerHTML = state.candidates.map((c, i) => `<button class="candidate-card ${synthProgress.some(s => s.id === c.id) ? "synth" : ""}" data-progress="${c.id}" type="button"><span class="index">0${i + 1} · ${c.tag}</span><h4>${c.title}</h4><p>${c.text}</p><footer>${c.stat ? `${statNames[c.stat]} +${c.effect}` : c.relation ? `${c.relation} 조우` : c.item ? "특수 아이템의 씨앗" : "새 서사 해금"}</footer></button>`).join("");
    document.querySelectorAll("[data-progress]").forEach(btn => btn.addEventListener("click", () => chooseProgress(state.candidates.find(c => c.id === btn.dataset.progress))));
  }

  function renderCards() {
    const progress = state.selectedProgress;
    const trial = state.trial;
    $("progressTag").textContent = progress?.tag || "―";
    $("progressTitle").textContent = progress?.title || "진행을 선택하십시오";
    $("progressText").textContent = progress?.text || "영웅의 다음 발걸음이 이곳에 기록됩니다.";
    $("progressEffect").textContent = state.catastrophe ? "재앙이 끝날 때까지 일반 진행은 중단된다." : progress?.stat ? `${statNames[progress.stat]} +${progress.effect} 즉시 적용` : progress?.relation ? `${progress.relation}와의 관계가 생애에 추가되었다.` : progress?.item ? `${progress.item}을 획득했다.` : "과거와 성격이 이 진행을 열었다.";
    if (!trial) return;
    $("trialCard").classList.toggle("catastrophe", state.catastrophe);
    $("trialType").textContent = state.catastrophe ? "재앙 시련" : "활성 시련";
    $("trialTimer").textContent = trial.duration === 1 ? "즉시" : `${trial.remaining}턴 제한`;
    $("trialTitle").textContent = trial.title;
    $("trialText").textContent = trial.text;
    $("trialConditions").innerHTML = trial.conditions.map(c => {
      const current = state.stats[c.stat] + contextualBonus(c.stat);
      return `<span class="condition ${current >= c.value ? "met" : ""}">${statNames[c.stat]} ${current} / ${c.value}</span>`;
    }).join("");
    $("trialReward").textContent = `성공 보상 · ${trial.reward || (trial.finale ? "인생의 갈림길" : "재앙 저항")}`;
    $("oracleRow").innerHTML = state.oracles.map(card => `<button class="oracle-card" data-oracle="${card.id}" type="button"><em>공개 · 개입 +${card.cost}</em><strong>${card.name}</strong><small>${card.text}</small></button>`).join("");
    document.querySelectorAll("[data-oracle]").forEach(btn => btn.addEventListener("click", () => useOracle(state.oracles.find(c => c.id === btn.dataset.oracle))));
  }

  function renderAll() {
    $("topAge").textContent = `${state.age}세`;
    $("topTurn").textContent = state.phase === "origin" ? "서막" : `${state.turn}장`;
    $("topIntervention").textContent = state.intervention;
    $("interventionMeter").style.width = `${Math.min(100, state.intervention / 12 * 100)}%`;
    $("heroName").textContent = state.name;
    $("heroInitial").textContent = state.name[0];
    $("heroEpithet").textContent = state.phase === "origin" ? "이름 없는 아이" : `${lifeStage(state.age)}의 인간`;
    $("heroCondition").textContent = state.catastrophe ? "몸이 신성한 결정으로 변하고 있다." : state.hp <= 2 ? "숨이 가늘다. 죽음이 가까이 있다." : state.intervention >= 7 ? "기적의 흔적이 몸 안에서 꿈틀거린다." : "아직 인간의 시간 안에 머문다.";
    $("rerollCount").textContent = `재추첨 ${state.rerolls}회`;
    $("healthText").textContent = `체력 ${state.hp} / ${state.maxHp}`;
    $("statsList").innerHTML = Object.entries(state.stats).map(([key, val]) => `<div class="stat-row"><span>${statNames[key]}</span><div class="stat-bar"><i style="width:${Math.min(100, val / 12 * 100)}%"></i></div><strong>${val}</strong></div>`).join("");
    renderTraits(false);
    $("relationList").innerHTML = state.relations.length ? state.relations.map(r => `<div class="mini-entry"><strong>${r}</strong><small>${r === "미라" ? "연구 판정에서 지식 +1" : "위기 판정에서 근력 +1"}</small></div>`).join("") : `<p class="empty-copy">아직 맺어진 인연이 없다.</p>`;
    $("itemList").innerHTML = state.items.length ? state.items.map(i => `<div class="mini-entry"><strong>${i}</strong><small>${itemDescription(i)}</small></div>`).join("") : `<p class="empty-copy">빈 손</p>`;
    $("watchCount").textContent = `${state.watch} / ${state.watchThreshold}`;
    $("willThreshold").textContent = `${state.watch} / ${state.watchThreshold}`;
    $("willMeter").style.width = `${Math.min(100, state.watch / state.watchThreshold * 100)}%`;
    $("willList").innerHTML = state.wills.length ? state.wills.map(w => `<div class="will-card"><strong>${w.name}</strong><small>${w.text}</small></div>`).join("") : `<p class="empty-copy">신의 침묵 속에서 의지는 자란다.</p>`;
    $("synthCount").textContent = `${state.unlockedSynth.length} 해금`;
    $("synthesisList").innerHTML = state.unlockedSynth.length ? state.unlockedSynth.map(id => { const s = synthProgress.find(x => x.id === id); return `<div class="synth-entry"><strong>${s.title}</strong><small>${s.tag}</small></div>`; }).join("") : `<p class="empty-copy">아직 운명의 실이 만나지 않았다.</p>`;
    renderLogs();
    if (state.phase === "action") renderCards();
  }

  function itemDescription(item) {
    return ({ "금이 간 검은 렌즈": "신성 판정의 직감 +1. 아직 완전한 용도는 알 수 없다.", "신을 찌르는 바늘": "신과 인간의 연결을 자를 수 있다는 금단의 도구.", "수정 오른손": "재앙의 흔적. 지식 +2와 숨은 진행의 열쇠.", "별빛 흉터": "재앙의 흔적. 직감 +2와 신의 시선을 감지한다.", "검은 동전": "죽은 신의 얼굴이 새겨진 정체불명의 화폐." })[item] || "훗날 다른 삶의 길을 여는 물건.";
  }

  function renderLogs() {
    $("chronicleView").innerHTML = state.log.length ? state.log.map(l => `<div class="log-entry"><span class="log-age">${l.age}세</span><p>${l.text}</p></div>`).join("") : `<p class="empty-copy">첫 숨 이후의 기록이 이곳에 쌓인다.</p>`;
    $("milestonesView").innerHTML = state.milestones.length ? state.milestones.map(m => `<div class="milestone"><strong>${m.title}</strong><span>${m.age}세 · ${m.text}</span></div>`).join("") : `<p class="empty-copy">아직 생을 가르는 사건이 없다.</p>`;
  }

  function showModal({ kicker, title, body, actions = [], closable = false }) {
    $("modalKicker").textContent = kicker;
    $("modalTitle").textContent = title;
    $("modalBody").innerHTML = body;
    $("modalActions").innerHTML = "";
    actions.forEach(action => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = action.primary ? "primary-button" : "secondary-button";
      btn.textContent = action.label;
      btn.addEventListener("click", action.onClick);
      $("modalActions").appendChild(btn);
    });
    $("modalClose").classList.toggle("hidden", !closable);
    $("modalBackdrop").classList.remove("hidden");
  }

  function closeModal() { $("modalBackdrop").classList.add("hidden"); }

  $("rerollButton").addEventListener("click", () => {
    if (state.rerolls <= 0 || state.phase !== "origin") return;
    state.rerolls -= 1;
    state.intervention += 1;
    rollTraits();
    renderAll();
  });
  $("beginButton").addEventListener("click", startGame);
  $("watchButton").addEventListener("click", watch);
  $("continueButton").addEventListener("click", nextTurn);
  $("endObservationButton").addEventListener("click", () => showModal({
    kicker: "FINAL CHOICE", title: "정말 시선을 거두겠습니까?",
    body: `<p>관찰을 끝내면 ${state.name}의 이후 생애는 더 이상 기록되지 않습니다. 지금까지의 삶은 회상으로 남습니다.</p>`,
    closable: true,
    actions: [{ label: "계속 지켜본다", onClick: closeModal }, { label: "관찰을 종료한다", primary: true, onClick: () => { closeModal(); endGame("observed"); } }]
  }));
  $("helpButton").addEventListener("click", () => showModal({
    kicker: "HOW TO PLAY", title: "한 인간의 삶을 지켜보는 법",
    body: `<ol><li>0세에 무작위 성격 3개를 확정합니다. 재추첨은 2회까지 가능하지만 매번 신성 개입이 1 오릅니다.</li><li>매 생애 턴마다 성격·의지·관계·과거를 반영한 진행 후보 3개 중 하나를 고릅니다.</li><li>시련이 없으면 새 시련이 생깁니다. 즉시, 2턴, 3턴 제한 안에 조건을 충족해야 합니다.</li><li>신탁은 누르는 즉시 공개·적용되며 신성 개입이 오릅니다. 지켜보기는 방관을 쌓아 10 → 9 → 8 순으로 의지를 발현시킵니다.</li><li>의지는 즉시 독단 행동을 만들지 않고 이후 후보와 같은 맥락의 판정에 영향을 줍니다.</li><li>개입이 높아지면 재앙이 발생합니다. 일반 진행은 멈추고 ‘재앙의 끝’을 넘으면 인생의 갈림길을 얻습니다.</li></ol>`,
    closable: true, actions: [{ label: "기록으로 돌아간다", primary: true, onClick: closeModal }]
  }));
  $("modalClose").addEventListener("click", closeModal);
  document.querySelectorAll(".log-tabs button").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".log-tabs button").forEach(b => b.classList.toggle("active", b === btn));
    $("chronicleView").classList.toggle("hidden", btn.dataset.tab !== "chronicle");
    $("milestonesView").classList.toggle("hidden", btn.dataset.tab !== "milestones");
  }));

  resetGame();
})();
