/* Small life interludes and point-of-view prose. Pure helpers, no UI or timers. */
window.narrativeRules = (() => {
  // Resolve the placeholder together with its particle; never rewrite arbitrary names in prose.
  function nameText(text, name) {
    const value=String(name || '그 사람'),last=value.charCodeAt(value.length-1);
    const jong=last>=0xac00 && last<=0xd7a3?(last-0xac00)%28:0;
    const pairs={은:['은','는'],는:['은','는'],이:['이','가'],가:['이','가'],을:['을','를'],를:['을','를'],과:['과','와'],와:['과','와'],아:['아','야'],야:['아','야'],
      이라고:['이라고','라고'],라고:['이라고','라고'],이라는:['이라는','라는'],라는:['이라는','라는'],이란:['이란','란'],란:['이란','란'],이라:['이라','라'],라:['이라','라'],이면:['이면','면'],면:['이면','면'],
      이었다:['이었다','였다'],였다:['이었다','였다'],이었:['이었','였'],였:['이었','였'],이어서:['이어서','여서'],여서:['이어서','여서'],이에요:['이에요','예요'],예요:['이에요','예요'],이다:['이다','다'],다:['이다','다']};
    const suffixes=[...Object.keys(pairs),'으로','로'].sort((a,b)=>b.length-a.length).join('|');
    return String(text || '').replace(new RegExp(`\\{hero\\}(${suffixes})?`,'g'),(_,suffix)=>{
      if(!suffix)return value;
      if(suffix==='으로'||suffix==='로')return value+(jong && jong!==8?'으로':'로');
      return value+pairs[suffix][jong?0:1];
    });
  }
  const initialLuck = (random = Math.random) => Math.min(100, Math.floor(Math.max(0, random()) * 101));
  const birthBonuses = {
    '완벽주의자':{knowledge:1,intuition:1}, '책벌레':{knowledge:2},
    '야망':{strength:1,charm:1}, '다정함':{charm:1,vitality:1},
    '겁없음':{strength:1,agility:1}, '의심 많음':{intuition:2},
    '고독한 기질':{knowledge:1,vitality:1}, '사람을 끄는 자':{charm:2},
    '고집':{strength:1,vitality:1}
  };
  function birthStats(traits, luck) {
    const stats={vitality:6,strength:1,agility:1,knowledge:1,intuition:1,charm:1,luck};
    for(const name of new Set(traits.map(trait=>typeof trait==='string'?trait:trait.name)))
      for(const [stat,bonus] of Object.entries(birthBonuses[name] || {}))stats[stat]+=bonus;
    for(const key of ['strength','agility','knowledge','intuition','charm'])stats[key]=Math.min(3,stats[key]);
    stats.vitality=Math.min(9,stats.vitality);return stats;
  }
  function luckEvent(s, random = Math.random) {
    const p = s.progress;
    if (!p || p.catastrophe || p.relationship || p.luckChecked) return null;
    p.luckChecked = true;
    if (s.stats.luck >= 100 || random() >= .01) return null;
    const before = s.stats.luck;
    s.stats.luck = Math.min(100, before + 1);
    const text = '바람에 날려 온 작은 씨앗이 손바닥에 앉는다. 아무것도 아닌 우연인데, 오늘은 이상하게 놓아주기 아쉽다.';
    const record = { title: '손바닥에 내려앉은 우연', text, before, after: s.stats.luck, progressId: p.id };
    (s.luckMemories ||= []).push(record);
    return record;
  }
  const voices = {
    '완벽주의자': ['한동안 결과를 들여다보다가, 그제야 굳어 있던 손을 푼다. 오늘만큼은 고칠 곳을 찾지 않는다.', '다른 이들이 돌아간 뒤에도 그 자리를 쉽게 떠나지 못한다. 다시 한다면 어디부터 달라질까, 손끝으로 흔적을 더듬는다.'],
    '책벌레': ['잊기 전에 남겨 두려는 듯 눈앞의 일을 천천히 되짚는다. 종이에 없던 한 줄이 기억 속에 생겼다.', '알고 있던 말들이 오늘의 일을 모두 설명해 주지는 못한다. 그래도 답이 없다는 이유로 질문까지 버리지는 않는다.'],
    '야망': ['기쁨을 오래 드러내지는 않는다. 돌아서는 시선은 벌써 조금 더 먼 곳을 향하지만, 오늘의 발자국만은 지우지 않는다.', '고개를 숙이는 시간은 짧다. 다만 다음을 이야기하는 목소리에, 전에는 없던 조심스러움이 묻어난다.'],
    '다정함': ['자신의 손보다 곁에 남은 사람들의 얼굴을 먼저 살핀다. 누군가 편히 숨을 쉬는 것을 보고서야 미소가 번진다.', '끝난 일을 바꿀 수는 없어도 남겨진 이를 혼자 두고 싶지는 않다. 할 말을 찾지 못한 채 잠시 곁에 머문다.'],
    '겁없음': ['돌아온 뒤에야 손이 떨리는 것을 알아차린다. 웃어 보이지만, 한동안은 가쁜 숨을 고르느라 말이 없다.', '상처를 털어 내는 몸짓만은 여전하다. 그러나 돌아가는 길에서는 두 번쯤 멈춰 뒤를 돌아본다.'],
    '의심 많음': ['모두 끝났다는 말에도 마지막 흔적을 한 번 더 살핀다. 아무것도 놓치지 않았다는 확신은 천천히 찾아온다.', '눈앞에서 지나쳤던 작은 징후가 자꾸 되돌아온다. 다음에는 무엇을 믿고 무엇을 의심해야 할지, 쉽게 답하지 못한다.'],
    '고독한 기질': ['돌아가는 길에야 조용히 입가가 풀린다. 누구에게 말하지 않아도 오늘 해낸 일은 사라지지 않는다.', '괜찮다는 말을 먼저 꺼내고 혼자 걸음을 옮긴다. 아무도 보지 않는 곳에 이르러서야 어깨가 조금 내려앉는다.'],
    '사람을 끄는 자': ['곁에서 건네는 말들을 하나씩 받아 준다. 웃음이 잦아든 뒤에도 누군가는 조금 더 머물러 이야기를 잇는다.', '괜찮다고 사람들을 먼저 돌려보낸다. 마지막 발소리가 멀어지고 나서야 억지로 지키던 표정이 풀린다.'],
    '고집': ['끝까지 손을 놓지 않았다는 사실을 마음속으로 되뇐다. 닳은 손바닥을 펴 보며 아주 작게 고개를 끄덕인다.', '끝났다는 말이 귀에 들어와도 발이 떨어지지 않는다. 오늘 물러나는 것과 영영 포기하는 것은 다르다고 생각한다.']
  };
  function outcome(s, success) {
    const p = s.progress, t = p.trial;
    const source = s.traits.map(trait => ({trait, score: trait.tags.filter(tag => [...p.weight, ...t.helpful].includes(tag)).length})).sort((a,b) => b.score-a.score)[0]?.trait;
    const authored = adaptFamily(nameText(t[success ? 'success' : 'failure'].split(' · ')[0], s.name),s);
    const reflection = voices[source?.name]?.[success ? 0 : 1] || '그날의 감각은 돌아오는 길에도 손끝에 오래 남았다.';
    return {title: t.title + (success ? ' · 극복' : ' · 남겨진 흔적'), text: [authored, reflection, s.fateOutcomeText].filter(Boolean).join('\n\n'),
      tags: [s.gender === 'male' ? '남성' : '여성', source?.name, p.chronicle ? '연대기의 한 장' : p.dungeon ? '던전의 기억' : '삶의 기록', success ? '시련 성공' : '시련 실패'].filter(Boolean)};
  }
  function adaptFamily(text, s) {
    // Authored family stories intentionally mention missing parents alongside present guardians.
    if(s.progress?.social || s.progress?.family)return text;
    // Generic old childhood copy must not conjure parents missing from this origin.
    if (s.origin.familyType && s.origin.familyType !== 'parents') {
      const caregiver=s.origin.caregivers?.[0];
      const label = s.origin.familyType==='adoptive'?'양부모':caregiver?[caregiver.relation,caregiver.name].filter(Boolean).join(' '):'양육소의 돌봄 어른';
      return String(text).replace(/(^|[^\p{L}\p{N}_])부모(은|는|이|가|을|를|과|와)?/gu,(_,prefix,suffix)=>prefix+nameText('{hero}'+(suffix || ''),label));
    }
    return text;
  }
  return {initialLuck, luckEvent, outcome, adaptFamily, nameText, birthStats, birthBonuses};
})();
