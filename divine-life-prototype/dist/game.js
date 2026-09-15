(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const wait = ms => {
    const sequence = state.sequence;
    return new Promise((resolve, reject) => setTimeout(() => sequence === state.sequence ? resolve() : reject(new Error("sequence-cancelled")), ms));
  };
  const action = fn => (...args) => Promise.resolve(fn(...args)).catch(error => {
    if (error.message !== "sequence-cancelled") throw error;
  });

  const heroNames = {
    male: ["에단", "엘리안", "카이렌"],
    female: ["리아", "세라핀", "이네스"]
  };

  const traits = [
    { name: "완벽주의자", text: "높은 목표를 향하지만 실패의 흔적을 오래 마음에 남긴다.", tags: ["study", "endure"] },
    { name: "책벌레", text: "지식과 오래된 기록에 자연스럽게 이끌린다.", tags: ["study", "notice"] },
    { name: "야망", text: "평범한 삶보다 더 높은 곳을 바라본다.", tags: ["risk", "lead"] },
    { name: "다정함", text: "타인의 곤경을 지나치지 못하고 인연을 소중히 여긴다.", tags: ["bond", "care"] },
    { name: "겁없음", text: "위험 앞에서 물러서지 않지만 상처를 입기 쉽다.", tags: ["risk", "endure"] },
    { name: "의심 많음", text: "숨겨진 의도와 보이지 않는 흔적을 먼저 살핀다.", tags: ["notice", "caution"] },
    { name: "고독한 기질", text: "홀로 생각하고 스스로 감당하는 일에 익숙하다.", tags: ["endure", "caution"] },
    { name: "사람을 끄는 자", text: "조우와 설득의 기회가 늘어나지만 기대도 커진다.", tags: ["bond", "lead"] },
    { name: "고집", text: "긴 시련을 견디지만 한 번 정한 길에서 쉽게 물러서지 않는다.", tags: ["endure", "risk"] }
  ];

  const origins = [
    { parent: "몰락한 기사와 약초사", wealth: "낡은 집과 은화 세 닢", place: "안개가 걷히지 않는 변경 마을" },
    { parent: "떠돌이 악사와 재봉사", wealth: "작은 수레와 빚 한 장", place: "성벽 아래의 오래된 골목" },
    { parent: "이름 없는 묘지기 부부", wealth: "공동묘지 곁의 오두막", place: "북쪽 숲의 끝자락" }
  ];

  const progressPool = [
    {
      id: "P01-C01", age: "3~4세", title: "블록을 가지런히 쌓는다", text: "삐뚤어진 블록이 마음에 들지 않는다. 전부 반듯하게 맞추고 싶다.", effect: "완벽주의자의 첫 기준이 드러난다.", weight: ["notice"],
      trial: { title: "삐뚤어진 탑", text: "원하는 모양의 탑을 완성할 수 있을까?", mode: "instant", stat: "intuition", statName: "직감", threshold: 1, helpful: ["notice"], success: "원하는 모양의 탑을 완성했다.", successGain: 1, failure: "화가 나 탑을 무너뜨렸다." }
    },
    {
      id: "P01-C02", age: "3~4세", title: "혼자 옷을 입으려 한다", text: "단추 하나까지 제대로 잠그고 싶어 스스로 옷을 입는다.", effect: "도움을 거절하고 자신의 손을 믿는다.", weight: ["endure"],
      trial: { title: "엇갈린 단추", text: "끝까지 혼자 단추를 잠글 수 있을까?", mode: "instant", stat: "agility", statName: "민첩", threshold: 1, helpful: ["endure"], success: "혼자 옷을 입었다.", successGain: 1, failure: "결국 단추를 다시 풀어버렸다." }
    },
    {
      id: "P01-C03", age: "3~5세", title: "눈앞의 것을 똑같이 그린다", text: "자신이 본 것과 그림이 조금이라도 다르면 만족하지 못한다.", effect: "관찰한 대상을 완벽하게 옮기려 한다.", weight: ["study", "notice"],
      trial: {
        title: "마음에 들지 않는 그림", text: "똑같이 그려낼 수 있을까?", mode: "turn", base: 2, stat: "intuition", statName: "직감", threshold: 4, helpful: ["study", "endure"], success: "만족스러운 그림을 완성했다.", successGain: 1, failure: "그림을 구겨버렸다. · 미완성된 그림",
        efforts: [
          { code: "P01-C03-S01", title: "몇 번이고 다시 그린다", text: "똑같이 그리기 위해 지우고 다시 그리기를 반복한다.", stat: "intuition", statName: "직감", min: 0, max: 3 },
          { code: "P01-C03-S02", title: "대상을 자세히 관찰한다", text: "그리기 전에 모양과 색을 한참 들여다본다.", stat: "intuition", statName: "직감", min: 1, max: 2 },
          { code: "P01-C03-S03", title: "처음부터 다시 그린다", text: "지금까지 그린 그림을 버리고 처음부터 시작한다.", stat: "intuition", statName: "직감", min: 0, max: 4, vitalityCostOnZero: 1 }
        ]
      }
    },
    {
      id: "P01-C04", age: "3~5세", title: "장난감을 완벽하게 정리한다", text: "장난감의 크기와 종류에 맞춰 정확한 자리를 정하려 한다.", effect: "질서가 흐트러지는 것을 견디지 못한다.", weight: ["notice"],
      trial: { title: "마지막 장난감의 자리", text: "모든 물건이 있어야 할 곳을 찾아낼 수 있을까?", mode: "instant", stat: "intuition", statName: "직감", threshold: 2, helpful: ["notice"], success: "모든 물건을 정리했다.", successGain: 1, failure: "마지막 물건의 자리를 정하지 못했다." }
    },
    {
      id: "P01-C05", age: "4~6세", title: "글씨를 반듯하게 쓰려 한다", text: "같은 글자를 몇 번이고 다시 쓰며 마음에 드는 모양을 찾는다.", effect: "한 획의 차이도 그냥 넘기지 않는다.", weight: ["study"],
      trial: {
        title: "한 글자가 마음에 들지 않는다", text: "만족스러운 글씨를 완성할 수 있을까?", mode: "turn", base: 2, stat: "knowledge", statName: "지식", threshold: 4, helpful: ["study", "endure"], success: "만족스러운 글씨를 완성했다.", successGain: 1, failure: "종이만 가득 채우고 포기했다. · 미완성된 연습",
        efforts: [
          { code: "P01-C05-S01", title: "같은 글자를 반복해 쓴다", text: "한 획씩 비교하며 계속 반복한다.", stat: "knowledge", statName: "지식", min: 0, max: 3 },
          { code: "P01-C05-S02", title: "천천히 한 획씩 쓴다", text: "속도를 줄이고 모양을 정확히 익힌다.", stat: "knowledge", statName: "지식", min: 1, max: 2 }
        ]
      }
    },
    {
      id: "P01-C06", age: "4~6세", title: "한 번 칭찬받은 일을 다시 한다", text: "전에 잘했다고 들었던 일을 이번에는 더 잘해내고 싶다.", effect: "지난 성취가 새로운 기준이 된다.", weight: ["lead"],
      trial: {
        title: "지난번보다 잘해야 한다", text: "과거의 자신을 넘어설 수 있을까?", mode: "turn", base: 2, stat: "intuition", statName: "직감", threshold: 5, helpful: ["endure", "lead"], success: "이전보다 뛰어난 결과를 만들었다.", successGain: 1, failure: "기대보다 못했다고 느꼈다. · 스스로에 대한 실망",
        efforts: [
          { code: "P01-C06-S01", title: "전에 했던 방식을 반복한다", text: "이전에 성공했던 방식을 다시 따라 한다.", stat: "intuition", statName: "직감", min: 0, max: 3 },
          { code: "P01-C06-S02", title: "잘못된 부분을 찾아낸다", text: "지난번 결과와 지금 결과를 비교한다.", stat: "intuition", statName: "직감", min: 1, max: 2, nextBonus: 1 }
        ]
      }
    },
    {
      id: "P01-C07", age: "5~6세", title: "어려운 퍼즐에 도전한다", text: "쉬운 퍼즐에는 관심이 없다. 끝까지 완성해야 마음이 편하다.", effect: "난도가 높을수록 더 깊이 몰두한다.", weight: ["study", "risk"],
      trial: {
        title: "마지막 조각", text: "마지막 조각이 들어갈 자리를 찾아낼 수 있을까?", mode: "turn", base: 3, stat: "knowledge", statName: "지식", threshold: 6, helpful: ["study", "endure"], success: "퍼즐을 완성했다. · 직감 +1 · 지식 +1", successGain: 1, bonusGain: { stat: "intuition", amount: 1 }, failure: "끝내 완성하지 못했다. · 풀지 못한 퍼즐",
        efforts: [
          { code: "P01-C07-S01", title: "하나씩 맞춰본다", text: "가능한 위치를 차례대로 시험한다.", stat: "intuition", statName: "직감", min: 0, max: 3 },
          { code: "P01-C07-S02", title: "규칙을 찾아본다", text: "그림과 모양 사이의 규칙을 분석한다.", stat: "knowledge", statName: "지식", min: 1, max: 3 },
          { code: "P01-C07-S03", title: "쉴 생각 없이 계속한다", text: "퍼즐 앞에서 떠나지 않고 계속 시도한다.", stat: "intuition", statName: "직감", min: 0, max: 4, vitalityCost: 1 }
        ]
      }
    },
    {
      id: "P01-C08", age: "5~6세", title: "다른 아이의 결과와 비교한다", text: "자신이 만든 것이 다른 아이보다 부족해 보이는 순간 눈을 떼지 못한다.", effect: "비교 속에서 자신의 기준을 다시 세운다.", weight: ["notice"],
      trial: { title: "내 것이 부족해 보인다", text: "비교 속에서도 자신의 장점을 발견할 수 있을까?", mode: "instant", stat: "intuition", statName: "직감", threshold: 3, helpful: ["notice"], success: "자신의 장점을 발견했다.", successGain: 1, failure: "결과를 계속 신경 썼다. · 비교 경험" }
    },
    {
      id: "P01-C09", age: "5~6세", title: "전에 실패했던 일을 다시 한다", text: "한 번 실패한 채로 남겨두는 것을 견디기 어렵다.", effect: "과거의 실패를 다시 마주한다.", weight: ["endure"],
      trial: {
        title: "이번에는 성공해야 한다", text: "같은 실패를 이번에는 넘어설 수 있을까?", mode: "turn", base: 2, stat: "intuition", statName: "직감", threshold: 5, helpful: ["endure"], success: "과거 실패를 극복했다.", successGain: 2, failure: "다시 실패했다. · 반복된 실패",
        efforts: [
          { code: "P01-C09-S01", title: "실패했던 부분만 반복한다", text: "잘못했던 순간을 떠올리며 같은 동작을 연습한다.", stat: "intuition", statName: "직감", min: 1, max: 3 },
          { code: "P01-C09-S02", title: "처음부터 다시 연습한다", text: "기초부터 하나하나 다시 확인한다.", stat: "intuition", statName: "직감", min: 0, max: 4 }
        ]
      }
    },
    {
      id: "P01-C10", age: "6세", title: "처음으로 스스로 목표를 정한다", text: "누가 시키지 않았지만 자신이 만족할 수준까지 해내고 싶다.", effect: "자신만의 목표가 생애에 처음 기록된다.", weight: ["lead", "endure"],
      trial: {
        title: "내가 정한 목표", text: "스스로 세운 목표를 끝까지 달성할 수 있을까?", mode: "turn", base: 3, stat: "intuition", statName: "직감", threshold: 7, helpful: ["lead", "endure"], success: "첫 목표를 달성했다. · 첫 목표 달성", successGain: 2, failure: "제한 시간이 끝났다. · 미완성된 목표",
        efforts: [
          { code: "P01-C10-S01", title: "매일 조금씩 연습한다", text: "목표를 여러 단계로 나누어 차근차근 진행한다.", stat: "intuition", statName: "직감", min: 1, max: 2 },
          { code: "P01-C10-S02", title: "될 때까지 반복한다", text: "만족스러운 결과가 나올 때까지 반복한다.", stat: "intuition", statName: "직감", min: 0, max: 3 },
          { code: "P01-C10-S03", title: "무리해서 몰두한다", text: "다른 일을 제쳐두고 목표에만 집중한다.", stat: "intuition", statName: "직감", min: 0, max: 4, vitalityCost: 1 }
        ]
      }
    }
  ];

  const stages = [
    { key: "childhood", label: "유년기", range: "3~6세", age: 4, portrait: "childhood", description: "세상의 모양을 처음 배우고, 타고난 성격이 작은 선택마다 모습을 드러낸다.", turns: 2 },
    { key: "adolescent", label: "청소년기", range: "13~18세", age: 15, portrait: "adolescent", description: "타인의 시선과 자신의 바람 사이에서, 처음으로 삶의 방향을 고민한다.", turns: 2 },
    { key: "adult", label: "성인", range: "22~39세", age: 27, portrait: "adult", description: "선택에는 대가가 따르고, 쌓아 온 능력과 인연이 삶의 무게를 결정한다.", turns: 2 },
    { key: "middle", label: "중년", range: "40~54세", age: 46, portrait: "middle", description: "지나온 길이 현재의 선택을 붙든다. 중요한 인연은 시험대에 오른다.", turns: 2 },
    { key: "mature", label: "장년", range: "55~69세", age: 61, portrait: "mature", description: "남은 힘보다 남긴 뜻이 중요해진다. 신의 흔적 또한 더 선명해진다.", turns: 2 },
    { key: "elder", label: "노년", range: "70세 이후", age: 76, portrait: "elder", description: "한 생애의 끝에서, 인간은 자신의 의지로 마지막 의미를 선택한다.", turns: 2 }
  ];

  const laterProgress = [
    {
      id: "P02-C01", stage: "adolescent", title: "금지된 서고의 문 앞에 선다", text: "스승이 감춘 오래된 기록이 밤마다 마음을 끌어당긴다.", effect: "책과 의심의 기질, 유년기의 배움이 선택을 밀어 올린다.", weight: ["study", "notice"],
      trial: { title: "봉인된 문장", text: "경고를 이해하고 기록의 뜻을 읽어낼 수 있을까?", mode: "instant", stat: "knowledge", statName: "지식", threshold: 5, helpful: ["study", "notice"], success: "봉인된 문장을 읽고 재앙의 전조를 기억했다.", successGain: 1, failure: "문장은 끝내 의미를 내어주지 않았다.", milestone: "봉인된 문장을 읽다", item: "별빛이 밴 종이 조각" }
    },
    {
      id: "P02-C02", stage: "adolescent", title: "괴롭힘 받는 아이 곁에 멈춘다", text: "모두가 외면한 골목에서 한 아이가 홀로 버티고 있다.", effect: "다정함과 겁없음이 강할수록 이 만남은 오래 남는다.", weight: ["care", "bond", "risk"],
      trial: { title: "외면하지 않는 마음", text: "두려움을 견디며 아이를 지켜낼 수 있을까?", mode: "turn", base: 2, stat: "charm", statName: "매력", threshold: 5, helpful: ["care", "bond", "endure"], success: "아이를 구했고 오래 함께할 친구를 얻었다.", successGain: 1, failure: "한발 늦었지만, 외면했던 얼굴을 잊지 않았다.", milestone: "처음 타인을 지키다", relationship: "소꿉친구 미라", efforts: [
        { code: "P02-C02-S01", title: "떨리는 목소리로 막아선다", text: "두려움을 감추고 상대의 눈을 똑바로 본다.", stat: "charm", statName: "매력", min: 0, max: 3 },
        { code: "P02-C02-S02", title: "주변 어른을 설득한다", text: "무슨 일이 있었는지 차근차근 설명한다.", stat: "charm", statName: "매력", min: 1, max: 2 }
      ] }
    },
    {
      id: "P03-C01", stage: "adult", title: "왕도 수비대의 시험에 오른다", text: "오랫동안 다듬은 몸과 마음을 세상 앞에서 증명할 때가 왔다.", effect: "과거의 목표 달성과 반복된 실패가 집중력에 영향을 준다.", weight: ["risk", "lead", "endure"], requiresAny: ["첫 목표 달성", "처음 타인을 지키다"],
      trial: { title: "세 번의 관문", text: "마지막 관문까지 집중력을 잃지 않을 수 있을까?", mode: "turn", base: 3, stat: "strength", statName: "근력", threshold: 7, helpful: ["risk", "endure", "lead"], success: "수비대의 문장을 받으며 이름을 알렸다.", successGain: 1, failure: "마지막 관문에서 쓰러졌지만 다시 설 힘을 배웠다.", milestone: "왕도 수비대 입단", relationship: "동료 기사 로웬", efforts: [
        { code: "P03-C01-S01", title: "기본 자세를 되짚는다", text: "유년기처럼 작은 어긋남부터 바로잡는다.", stat: "strength", statName: "근력", min: 1, max: 3 },
        { code: "P03-C01-S02", title: "숨을 고르고 다시 일어선다", text: "서두르지 않고 남은 힘을 한곳에 모은다.", stat: "strength", statName: "근력", min: 0, max: 4, vitalityCostOnZero: 1 },
        { code: "P03-C01-S03", title: "동료의 조언을 따른다", text: "혼자 해내려는 고집을 잠시 내려놓는다.", stat: "strength", statName: "근력", min: 1, max: 2 }
      ] }
    },
    {
      id: "P03-C02", stage: "adult", title: "역병이 번진 마을에 남는다", text: "떠날 수 있지만, 남겨진 사람들의 숨이 점점 가빠진다.", effect: "지식과 인연, 과거에 읽은 기록이 생존 가능성을 바꾼다.", weight: ["study", "care", "bond"], requiresAny: ["봉인된 문장을 읽다"],
      trial: { title: "검은 열병", text: "쌓아 온 지식으로 치료법을 찾아낼 수 있을까?", mode: "instant", stat: "knowledge", statName: "지식", threshold: 7, helpful: ["study", "care"], success: "오래된 기록에서 치료법을 찾아 마을을 살렸다.", successGain: 1, failure: "많은 이를 살리지 못했고 그 이름들을 기록했다.", milestone: "검은 열병을 견디다", relationship: "약초사 네브", item: "은빛 약초낫" }
    },
    {
      id: "P04-C01", stage: "middle", title: "왕의 거짓 명령을 받는다", text: "충성을 증명하려면 무고한 변경 마을을 불태우라는 명령을 따라야 한다.", effect: "중요 사건과 발현된 의지가 판단의 중심이 된다.", weight: ["notice", "caution", "lead"],
      trial: { title: "충성과 진실 사이", text: "거짓을 간파하고 자신의 뜻을 지켜낼 수 있을까?", mode: "instant", stat: "intuition", statName: "직감", threshold: 8, helpful: ["notice", "caution", "truth"], success: "명령의 거짓을 밝혀 마을과 동료를 지켰다.", successGain: 1, failure: "명령을 거부했지만 누명을 피하지 못했다.", milestone: "왕의 거짓을 거부하다" }
    },
    {
      id: "P04-C02", stage: "middle", title: "사라진 동료의 흔적을 좇는다", text: "오래된 인연이 북쪽 폐허에서 마지막 구조 신호를 보냈다.", effect: "지켜 온 관계가 있다면 노력의 최솟값이 높아진다.", weight: ["bond", "care", "endure"], requiresRelationship: true,
      trial: { title: "무너지는 폐허", text: "시간 안에 동료에게 닿을 수 있을까?", mode: "turn", base: 2, stat: "agility", statName: "민첩", threshold: 8, helpful: ["bond", "care", "endure"], success: "무너지는 돌틈에서 동료의 손을 붙잡았다.", successGain: 1, failure: "손에 남은 것은 부서진 문장뿐이었다.", milestone: "끝까지 인연을 놓지 않다", item: "동료의 낡은 문장", efforts: [
        { code: "P04-C02-S01", title: "발자국을 따라 달린다", text: "무너지는 통로 사이로 가장 짧은 길을 찾는다.", stat: "agility", statName: "민첩", min: 1, max: 3 },
        { code: "P04-C02-S02", title: "익숙한 목소리를 부른다", text: "먼지 속 작은 대답을 놓치지 않으려 귀를 기울인다.", stat: "agility", statName: "민첩", min: 0, max: 4, vitalityCostOnZero: 1 }
      ] }
    },
    {
      id: "P05-C01", stage: "mature", title: "제자에게 마지막 가르침을 건넨다", text: "자신이 겪은 성공과 실패를 다음 세대의 손에 맡길 때가 왔다.", effect: "남긴 기록과 관계가 가르침의 깊이를 정한다.", weight: ["study", "care", "lead"],
      trial: { title: "이어지는 뜻", text: "한 생애의 경험을 온전히 전할 수 있을까?", mode: "turn", base: 2, stat: "charm", statName: "매력", threshold: 9, helpful: ["study", "care", "lead", "legacy"], success: "제자는 그 뜻을 이어가겠다고 맹세했다.", successGain: 1, failure: "모든 뜻을 전하지 못했지만 한 문장은 남았다.", milestone: "뜻을 다음 세대에 남기다", relationship: "제자 아렌", efforts: [
        { code: "P05-C01-S01", title: "실패부터 들려준다", text: "빛나는 승리보다 오래 남은 상처를 먼저 꺼낸다.", stat: "charm", statName: "매력", min: 1, max: 3 },
        { code: "P05-C01-S02", title: "직접 시범을 보인다", text: "쇠한 몸으로도 익숙한 동작을 천천히 되짚는다.", stat: "charm", statName: "매력", min: 0, max: 4, vitalityCost: 1 }
      ] }
    },
    {
      id: "P05-C02", stage: "mature", title: "별이 사라진 밤을 기록한다", text: "어린 날 보았던 문양과 닮은 공백이 밤하늘에 번져 간다.", effect: "오래된 기록과 직감이 재앙의 징후를 해석하게 한다.", weight: ["study", "notice", "truth"],
      trial: { title: "별 없는 지도", text: "사라진 별 사이에서 다가올 위험의 방향을 찾을 수 있을까?", mode: "instant", stat: "knowledge", statName: "지식", threshold: 8, helpful: ["study", "notice", "truth"], success: "재앙이 올 방향을 지도에 남겨 사람들을 피신시켰다.", successGain: 1, failure: "지도의 마지막 선을 잇지 못했다.", milestone: "별 없는 밤을 기록하다", item: "별 없는 지도" }
    },
    {
      id: "P05-CALAMITY", stage: "mature", catastrophe: true, title: "하늘에 붉은 눈이 열린다", text: "오랜 신성 개입의 흔적이 세계를 찢고 재앙이 생애를 덮친다.", effect: "재앙 동안 일반 진행은 멈춘다. 지금까지의 의지와 사건만이 길을 만든다.", weight: ["endure", "truth", "protect"],
      trial: { title: "재앙의 끝", text: "신의 흔적이 만든 균열을 인간의 의지로 닫을 수 있을까?", mode: "turn", base: 3, stat: "intuition", statName: "직감", threshold: 10, helpful: ["endure", "truth", "protect"], success: "붉은 눈을 닫고 인생의 마지막 갈림길을 얻었다.", successGain: 1, failure: "재앙은 물러났지만 생명의 불꽃이 크게 약해졌다.", milestone: "재앙의 끝을 목격하다", item: "갈림길의 성흔", failureVitality: 2, efforts: [
        { code: "P05-X01-S01", title: "과거의 기록을 하나로 잇는다", text: "흩어진 사건 속에서 재앙의 규칙을 찾아낸다.", stat: "intuition", statName: "직감", min: 1, max: 3 },
        { code: "P05-X01-S02", title: "소중한 이름들을 되뇐다", text: "지켜 온 인연을 붙잡고 정신을 잃지 않는다.", stat: "intuition", statName: "직감", min: 0, max: 4 },
        { code: "P05-X01-S03", title: "신의 시선을 거슬러 걷는다", text: "자신의 의지로 균열의 중심까지 나아간다.", stat: "intuition", statName: "직감", min: 1, max: 4, vitalityCost: 1 }
      ] }
    },
    {
      id: "P05-CALAMITY-STARFALL", stage: "mature", catastrophe: true, title: "별들이 땅으로 추락한다", text: "신이 고쳐 쓴 운명의 조각들이 불타는 별이 되어 왕국 전역에 쏟아진다.", effect: "일반 진행이 멈춘다. 피난길과 오래된 인연이 생존의 방향을 정한다.", weight: ["bond", "notice", "protect"],
      trial: { title: "별비가 그친 자리", text: "무너지는 하늘 아래에서 사람들을 안전한 곳으로 이끌 수 있을까?", mode: "turn", base: 3, stat: "agility", statName: "민첩", threshold: 10, helpful: ["bond", "notice", "protect"], success: "마지막 별이 떨어지기 전 모두를 지하 성소로 이끌었다.", successGain: 1, failure: "별비는 멎었지만 피난길에는 돌아오지 못한 이름들이 남았다.", milestone: "별의 낙하를 견디다", item: "식어 버린 별의 파편", failureVitality: 2, efforts: [
        { code: "P05-X02-S01", title: "별의 궤적 사이를 달린다", text: "불길이 닿기 전 가장 가까운 피난로를 찾아 몸을 던진다.", stat: "agility", statName: "민첩", min: 1, max: 3 },
        { code: "P05-X02-S02", title: "흩어진 사람들을 불러 모은다", text: "연기 너머로 익숙한 이름들을 외치며 대열을 만든다.", stat: "agility", statName: "민첩", min: 0, max: 4 },
        { code: "P05-X02-S03", title: "무너지는 다리를 건넌다", text: "마지막 사람의 손을 붙잡고 갈라지는 돌바닥을 뛰어넘는다.", stat: "agility", statName: "민첩", min: 1, max: 4, vitalityCost: 1 }
      ] }
    },
    {
      id: "P05-CALAMITY-SILENCE", stage: "mature", catastrophe: true, title: "태양과 시간이 함께 멎는다", text: "거듭된 신의 손길이 시간의 실을 얽어, 정오의 태양과 살아 있는 모든 순간을 얼린다.", effect: "일반 진행이 멈춘다. 평생 남긴 기록과 인간의 의지만이 멎은 시간 속에서 움직인다.", weight: ["study", "truth", "endure"],
      trial: { title: "멎은 시간의 심장", text: "뒤엉킨 생애의 순간들을 바로잡아 시간을 다시 흐르게 할 수 있을까?", mode: "turn", base: 3, stat: "knowledge", statName: "지식", threshold: 10, helpful: ["study", "truth", "endure"], success: "생애의 기억을 제자리에 놓자 태양의 그림자가 다시 움직였다.", successGain: 1, failure: "시간은 흐르기 시작했지만 영웅의 소중한 기억 하나가 사라졌다.", milestone: "멎은 정오를 다시 움직이다", item: "금이 간 시간의 바늘", failureVitality: 2, efforts: [
        { code: "P05-X03-S01", title: "생애 기록의 순서를 되짚는다", text: "유년기의 첫 기억부터 지금까지의 사건을 하나씩 이어 붙인다.", stat: "knowledge", statName: "지식", min: 1, max: 3 },
        { code: "P05-X03-S02", title: "신이 바꾼 흔적을 찾아낸다", text: "자연스럽지 않은 운명의 매듭을 기록 속에서 골라낸다.", stat: "knowledge", statName: "지식", min: 0, max: 4 },
        { code: "P05-X03-S03", title: "자신의 기억을 대가로 건다", text: "멎은 시간을 밀어내기 위해 가장 선명한 기억을 불태운다.", stat: "knowledge", statName: "지식", min: 2, max: 4, vitalityCost: 1 }
      ] }
    },
    {
      id: "P06-C01", stage: "elder", title: "고향으로 향하는 마지막 길을 택한다", text: "낯익은 길 위에서 지난 인연과 선택이 하나씩 이름을 되찾는다.", effect: "중요 사건의 수와 관계가 마지막 여정을 돕는다.", weight: ["bond", "legacy", "endure"],
      trial: { title: "돌아갈 곳", text: "쇠한 몸으로 마지막 언덕을 넘을 수 있을까?", mode: "turn", base: 2, stat: "vitality", statName: "체력", threshold: 8, helpful: ["bond", "legacy", "endure"], success: "기다리던 사람들의 곁으로 돌아왔다.", successGain: 0, failure: "언덕 아래에서 멈췄지만 발자국은 고향을 향했다.", milestone: "마지막 귀향", efforts: [
        { code: "P06-C01-S01", title: "지팡이를 짚고 한 걸음 더 걷는다", text: "숨이 고르게 돌아올 때까지 기다렸다 다시 걷는다.", stat: "vitality", statName: "체력", min: 1, max: 2 },
        { code: "P06-C01-S02", title: "함께한 이의 어깨를 빌린다", text: "홀로 버티려는 마음을 내려놓고 도움을 받아들인다.", stat: "vitality", statName: "체력", min: 1, max: 3 }
      ] }
    },
    {
      id: "P06-C02", stage: "elder", final: true, title: "한 생애의 마지막 문장을 고른다", text: "영웅은 신의 침묵 너머에서 자신의 삶을 스스로 정의하려 한다.", effect: "성격, 의지, 중요한 사건이 마지막 문장의 의미를 결정한다.", weight: ["truth", "protect", "legacy", "endure"],
      trial: { title: "나의 이름으로", text: "신의 뜻이 아니라 자신의 의지로 삶을 마무리할 수 있을까?", mode: "instant", stat: "intuition", statName: "직감", threshold: 9, helpful: ["truth", "protect", "legacy", "endure"], success: "누구의 장기말도 아닌 자신의 이름으로 눈을 감았다.", successGain: 0, failure: "마지막까지 답을 찾았고, 질문 그 자체를 남겼다.", milestone: "자신의 이름으로 생을 마치다" }
    }
  ];

  const willCandidates = [
    { name: "끝까지 이해하겠다", tags: ["study", "notice", "truth"], context: ["study", "notice"] },
    { name: "누구도 버리지 않겠다", tags: ["care", "bond", "protect"], context: ["care", "bond"] },
    { name: "다시는 물러서지 않겠다", tags: ["risk", "endure", "legacy"], context: ["risk", "endure", "lead"] }
  ];

  const interventions = [
    { title: "작은 징조", cost: 1, text: "이번 노력의 주사위 결과에 +1을 더한다.", kind: "bless" },
    { title: "보호의 손길", cost: 2, text: "이번 시련 동안 노력과 실패로 잃는 체력을 보호한다.", kind: "guard" },
    { title: "속삭임", cost: 1, text: "성격과 의지의 힘을 판정 또는 첫 노력에 +2로 보탠다.", kind: "whisper" }
  ];

  const statMeta = [
    { key: "vitality", label: "체력", color: "#b57a74", max: 12 },
    { key: "strength", label: "근력", color: "#aa8258", max: 10 },
    { key: "agility", label: "민첩", color: "#7f9d87", max: 10 },
    { key: "knowledge", label: "지식", color: "#7b9eaa", max: 10 },
    { key: "intuition", label: "직감", color: "#c4a66d", max: 10 },
    { key: "charm", label: "매력", color: "#a4879f", max: 10 }
  ];

  const state = {
    gender: "male",
    name: "",
    traits: [],
    origin: origins[0],
    progress: null,
    trialTurns: 2,
    stats: { vitality: 6, strength: 2, agility: 2, knowledge: 2, intuition: 2, charm: 2 },
    stageIndex: 0,
    roundInStage: 0,
    divine: 5,
    divineMax: 5,
    watchRemaining: 10,
    usedProgress: [],
    wills: [],
    milestones: [],
    relationships: [],
    items: [],
    history: [],
    recentTags: [],
    outcomeSuccesses: 0,
    outcomeFailures: 0,
    catastropheSeen: false,
    resolving: false,
    intervention: "watch",
    effortResolver: null,
    rollResolver: null,
    rerolled: false,
    sequence: 0
  };

  function sample(list, count = 1) {
    return [...list].sort(() => Math.random() - .5).slice(0, count);
  }

  function typeText(element, text, speed, sequence) {
    element.textContent = "";
    element.classList.remove("typed");
    return new Promise(resolve => {
      let index = 0;
      const write = () => {
        if (sequence !== state.sequence) return resolve();
        element.textContent += text[index] || "";
        index += 1;
        if (index < text.length) setTimeout(write, speed);
        else resolve();
      };
      write();
    });
  }

  function resetIntro() {
    state.sequence += 1;
    state.gender = Math.random() < .5 ? "male" : "female";
    state.name = sample(heroNames[state.gender])[0];
    state.traits = sample(traits, 3);
    state.origin = sample(origins)[0];
    state.rerolled = false;
    state.stats = { vitality: 6, strength: 2, agility: 2, knowledge: 2, intuition: 2, charm: 2 };
    state.stageIndex = 0;
    state.roundInStage = 0;
    state.progress = null;
    state.divine = 5;
    state.watchRemaining = 10;
    state.usedProgress = [];
    state.wills = [];
    state.milestones = [];
    state.relationships = [];
    state.items = [];
    state.history = [];
    state.recentTags = [];
    state.outcomeSuccesses = 0;
    state.outcomeFailures = 0;
    state.catastropheSeen = false;
    state.resolving = false;
    state.intervention = "watch";
    state.effortResolver = null;
    state.rollResolver = null;

    $("introScreen").classList.remove("hidden");
    $("firstScreen").className = "first-screen hidden";
    $("introTitleStep").classList.remove("hidden");
    $("introStoryStep").className = "intro-step intro-story-step hidden";
    $("introReveal").classList.add("hidden");
    $("introActions").classList.add("hidden");
    $("introCradleButton").className = "intro-cradle hidden";
    $("introCradleButton").disabled = true;
    $("introStartButton").disabled = false;
    $("introRerollButton").disabled = false;
    $("introRerollButton").textContent = "아이의 성격이 마음에 안 드는가?";
    $("introNarration").textContent = "";
    $("introQuestion").textContent = "";
    $("introTraits").innerHTML = "";
    $("endingOverlay").classList.remove("visible");
    $("rollOverlay").className = "roll-overlay";
    $("rollOverlay").setAttribute("aria-hidden", "true");
    $("stageCurtain").classList.remove("visible");
    $("catastropheCurtain").classList.remove("visible");
    $("catastropheCurtain").setAttribute("aria-hidden", "true");
    $("childReveal").classList.remove("departed");
    $("introBeginButton").disabled = false;
    state.pendingWill = "";
    state.ended = false;
    state.advancing = false;
  }

  function renderIntroTraits(effect = "arrive") {
    const box = $("introTraits");
    box.className = `intro-traits ${effect}`;
    box.innerHTML = state.traits.map(trait => `<span tabindex="0" data-tooltip="${trait.text}">${trait.name}</span>`).join("");
  }

  async function beginIntro() {
    const sequence = ++state.sequence;
    $("introStartButton").disabled = true;
    $("introTitleStep").classList.add("hidden");
    $("introStoryStep").classList.remove("hidden");
    await typeText($("introNarration"), "단순한 신의 유희인가, 영웅의 탄생을 축복하는 것인가. 오늘 여기 한 인간이 첫 숨을 쉰다.", 38, sequence);
    if (sequence !== state.sequence) return;
    $("introNarration").classList.add("typed");
    await wait(560);
    $("introStoryStep").classList.add("lifted");
    await wait(1720);
    if (sequence !== state.sequence) return;
    const cradle = $("introCradleButton");
    cradle.classList.remove("hidden");
    requestAnimationFrame(() => requestAnimationFrame(() => cradle.classList.add("revealed")));
    cradle.disabled = false;
  }

  async function revealTraits() {
    const sequence = state.sequence;
    $("introCradleButton").disabled = true;
    $("introStoryStep").classList.add("traits-revealed");
    $("introReveal").classList.remove("hidden");
    await typeText($("introQuestion"), "이 아이가 영웅이 될 아이인가.", 42, sequence);
    if (sequence !== state.sequence) return;
    $("introQuestion").classList.add("typed");
    renderIntroTraits();
    await wait(650);
    $("introActions").classList.remove("hidden");
  }

  function rerollTraits() {
    if (state.rerolled) return;
    state.rerolled = true;
    state.divine = Math.max(0, state.divine - 1);
    const box = $("introTraits");
    box.classList.add("dissolve");
    $("introRerollButton").disabled = true;
    $("introBeginButton").disabled = true;
    const sequence = state.sequence;
    setTimeout(() => {
      if (sequence !== state.sequence) return;
      state.traits = sample(traits, 3);
      renderIntroTraits("return");
      $("introRerollButton").textContent = "아이의 운명은 이미 한번 바뀌었다";
      $("introBeginButton").disabled = false;
    }, 510);
  }

  stages.forEach(stage => { stage.turns = 4; });
  const allProgress = [...progressPool.map(card => ({ ...card, stage: "childhood" })), ...laterProgress, ...(window.lifeContent || [])];
  progressPool.find(card => card.id === "P01-C07").trial.alternativeStat = "intuition";
  const currentStage = () => stages[Math.min(state.stageIndex, stages.length - 1)];
  const allHeroTags = () => [...state.traits.flatMap(trait => trait.tags), ...state.wills.flatMap(will => will.tags)];

  function chooseProgress() {
    const stage = currentStage();
    const forcedCase = new URLSearchParams(window.location.search).get("case");
    let candidates = allProgress.filter(card => card.stage === stage.key && !state.usedProgress.includes(card.id));
    const tags = allHeroTags();
    candidates = candidates.filter(card => !card.id.startsWith("P01") || state.traits.some(trait => trait.name === "완벽주의자"));
    if (stage.key === "childhood") {
      const age = 3 + state.roundInStage;
      candidates = candidates.filter(card => {
        if (!card.age) return true;
        const ages = card.age.match(/\d+/g).map(Number);
        return age >= ages[0] && age <= (ages[1] || ages[0]);
      });
    }
    candidates = candidates.filter(card => {
      if (card.id === "P01-C06") return state.outcomeSuccesses > 0;
      if (card.id === "P01-C09" || card.id === "middle-B01") return state.outcomeFailures > 0;
      if (card.requiresRelationship) return state.relationships.length > 0;
      if (card.final) return state.roundInStage === stage.turns - 1;
      return true;
    });
    if (stage.key === "elder" && state.roundInStage === stage.turns - 1) candidates = allProgress.filter(card => card.final);
    const forced = allProgress.find(card => card.id === forcedCase && card.stage === stage.key);
    if (stage.key === "mature") {
      const shouldFaceCatastrophe = state.divineMax - state.divine >= 3 && !state.catastropheSeen;
      candidates = candidates.filter(card => shouldFaceCatastrophe ? card.catastrophe : !card.catastrophe);
    }
    if (!candidates.length) candidates = allProgress.filter(card => card.stage === stage.key && !card.catastrophe);
    const weighted = candidates.flatMap(card => {
      let score = 1 + card.weight.filter(tag => tags.includes(tag)).length * 2;
      if (card.requiresAny?.some(record => state.milestones.includes(record))) score += 3;
      if (card.requiresRelationship && state.relationships.length) score += 3;
      return Array(score).fill(card);
    });
    state.progress = structuredClone(forced && !state.usedProgress.includes(forced.id) ? forced : sample(weighted)[0]);
    const memory = state.history.filter(item => state.progress.id.includes("C09") || state.progress.id === "middle-B01" ? !item.success : item.success).at(-1);
    if (["P01-C06", "P01-C09", "middle-B01"].includes(state.progress.id) && memory) {
      state.progress.text += ` ‘${memory.trial}’의 경험을 떠올린다.`;
      if (["P01-C06", "P01-C09"].includes(state.progress.id)) {
        const stat = memory.stat;
        const statName = statMeta.find(meta => meta.key === stat).label;
        Object.assign(state.progress.trial, { stat, statName });
        state.progress.trial.efforts.forEach(effort => Object.assign(effort, { stat, statName }));
      }
    }
    const influences = [...state.traits, ...state.wills].filter(source => source.tags.some(tag => state.progress.weight.includes(tag)));
    if (influences.length) state.progress.effect = `${influences.map(source => source.name).join(" · ")}에 이끌렸다.`;
    state.usedProgress.push(state.progress.id);
    state.trialTurns = state.progress.trial.mode === "turn" ? state.progress.trial.base : 0;
    if (state.progress.catastrophe) state.catastropheSeen = true;
  }

  async function appendRecord(label, value, sequence) {
    const line = document.createElement("p");
    line.innerHTML = `<small>${label}</small><span></span>`;
    $("childRecord").append(line);
    requestAnimationFrame(() => line.classList.add("visible"));
    await typeText(line.querySelector("span"), value, 26, sequence);
    await wait(260);
  }

  function renderTimeline() {
    document.querySelectorAll(".first-life-stage").forEach((node, index) => {
      node.classList.toggle("active", index === state.stageIndex);
      node.classList.toggle("completed", index < state.stageIndex);
      node.querySelector("i").innerHTML = index === state.stageIndex ? '<img src="./assets/icons/divine-star.png" alt="현재 단계" />' : "";
    });
    const progress = state.stageIndex / (stages.length - 1) * 100;
    document.querySelector(".first-progress-line i").style.width = `${progress}%`;
  }

  function renderResources() {
    $("divineCount").textContent = `${state.divine} / ${state.divineMax}`;
    $("watchCount").textContent = `의지까지 ${state.watchRemaining}회`;
  }

  function renderHud() {
    const stage = currentStage();
    const portrait = `./assets/portraits/${state.gender}-${stage.portrait}.png`;
    $("hudPortrait").src = portrait;
    $("heroPanelPortrait").src = portrait;
    $("hudName").textContent = state.name;
    const ages = [[3,4,5,6],[13,15,17,18],[22,27,33,39],[40,45,50,54],[55,60,65,69],[70,74,78,82]];
    const age = state.progress ? ages[Math.min(state.stageIndex, 5)][Math.min(state.roundInStage, 3)] : 0;
    $("hudAge").textContent = `${age}세 · ${stage.label}`;
    $("heroAge").textContent = `${age}세 · ${stage.label}`;
    const health = Math.max(0, state.stats.vitality);
    $("hudHealthText").textContent = `${health} / 12`;
    $("hudHealthBar").style.width = `${Math.min(100, health / 12 * 100)}%`;
  }

  function renderRecords() {
    $("heroWills").innerHTML = state.wills.length ? state.wills.map(will => `<span>${will.name}</span>`).join("") : "<span>아직 발현되지 않았다</span>";
    const records = [
      ...state.milestones.map(value => `사건 · ${value}`),
      ...state.relationships.map(value => `인연 · ${value}`),
      ...state.items.map(value => `물품 · ${value}`)
    ];
    $("heroMilestones").innerHTML = records.length ? records.slice(-7).map(value => `<span>${value}</span>`).join("") : "<span>아직 기록이 없다</span>";
  }

  function fillHeroPanel() {
    $("heroPanelName").textContent = state.name;
    $("heroParent").textContent = state.origin.parent;
    $("heroWealth").textContent = state.origin.wealth;
    $("heroPanelTraits").innerHTML = state.traits.map(trait => `<span title="${trait.text}">${trait.name}</span>`).join("");
    renderStats();
    renderRecords();
    renderHud();
    renderResources();
  }

  function renderStats() {
    $("heroStats").innerHTML = statMeta.map(stat => {
      const value = state.stats[stat.key];
      const percent = Math.min(100, value / stat.max * 100);
      return `<div class="hero-stat" data-stat="${stat.key}"><span>${stat.label}</span><i><b style="width:${percent}%;background:${stat.color}"></b></i><strong>${value}</strong></div>`;
    }).join("");
    renderHud();
  }

  function animateStat(statKey) {
    const previous = Number($("heroStats").querySelector(`[data-stat="${statKey}"] strong`)?.textContent);
    renderStats();
    const row = $("heroStats").querySelector(`[data-stat="${statKey}"]`);
    if (row) {
      const target = state.stats[statKey];
      const start = Date.now();
      const sequence = state.sequence;
      const label = row.querySelector("strong");
      const tick = () => {
        if (sequence !== state.sequence) return;
        const fraction = Math.min(1, (Date.now() - start) / 550);
        label.textContent = String(Math.round(previous + (target - previous) * fraction));
        if (fraction < 1) requestAnimationFrame(tick);
      };
      row.classList.add("raised");
      requestAnimationFrame(tick);
    }
    $("heroPanelHandle").classList.remove("stat-pulse");
    requestAnimationFrame(() => $("heroPanelHandle").classList.add("stat-pulse"));
    document.querySelector(".persistent-hero-hud").classList.remove("stat-pulse");
    requestAnimationFrame(() => document.querySelector(".persistent-hero-hud").classList.add("stat-pulse"));
  }

  function relevantHeroSource(progress = state.progress) {
    const tags = [...progress.weight, ...progress.trial.helpful];
    return [...state.traits, ...state.wills]
      .map(item => ({ item, score: item.tags.filter(tag => tags.includes(tag)).length + (state.wills.includes(item) ? .25 : 0) }))
      .sort((a, b) => b.score - a.score)[0]?.item || state.traits[0];
  }

  function progressMemory() {
    const lastHistory = state.history.at(-1);
    if (state.wills.at(-1)) return `마음에 싹튼 ‘${state.wills.at(-1).name}’이라는 의지${state.milestones.at(-1) ? `와 ‘${state.milestones.at(-1)}’의 기억` : ""}`;
    if (state.milestones.at(-1)) return `‘${state.milestones.at(-1)}’이라는 중요한 사건`;
    if (state.relationships.at(-1)) return `${state.relationships.at(-1)}와 이어진 인연`;
    if (lastHistory) return `지난 ‘${lastHistory.trial}’에서 ${lastHistory.success ? "얻은 확신" : "남은 실패의 흔적"}`;
    return `${state.origin.parent}에게서 시작된 삶`;
  }

  function composeProgressStory() {
    const progress = state.progress;
    const trial = progress.trial;
    const source = relevantHeroSource(progress);
    const actor = state.name;
    const previous = state.history.at(-1);
    const memory = previous ? `지난 ‘${previous.trial}’의 ${previous.success ? "성공" : "실패"}를 떠올린다.` : `${state.origin.parent}의 ${state.gender === "male" ? "아들" : "딸"}이다.`;
    const bridge = progress.catastrophe
      ? `평생 쌓은 ${trial.statName}과 의지로 재앙에 맞서야 한다.`
      : trial.mode === "instant"
        ? `이제 쌓아 온 ${trial.statName}이 시험받는다.`
        : `남은 ${state.trialTurns}번의 노력으로 ${trial.statName}을 길러야 한다.`;
    return `${progress.text} ${withParticle(actor, "은", "는")} ${memory} ‘${source.name}’${state.wills.includes(source) ? "이라는 의지가" : "의 기질이"} 이끄는 걸음을 멈추지 않는다. ${bridge}`;
  }

  function fillCards() {
    chooseProgress();
    const trial = state.progress.trial;
    renderHud();
    $("cardScenePhase").textContent = `${currentStage().label} · ${state.progress.age || "현재"}`;
    $("cardSceneTitle").textContent = state.progress.title;
    $("progressTitle").textContent = state.progress.title;
    $("progressText").textContent = composeProgressStory();
    $("progressEffect").textContent = `장면의 근거 · ${relevantHeroSource().name}`;
    $("trialTitle").textContent = trial.title;
    $("trialText").textContent = trial.text;
    renderTrialRequirement(trial);
    $("trialClock").innerHTML = trial.mode === "instant"
      ? "<strong>즉시</strong><span>누적 능력치 판정</span>"
      : `<strong>${state.trialTurns}턴</strong><span>${Array.from({ length: state.trialTurns }, () => "◆").join(" ")}</span>`;
    const helping = [...state.traits.map(item => item.name), ...state.wills.map(item => item.name)].filter(name => {
      const source = [...state.traits, ...state.wills].find(item => item.name === name);
      return source?.tags.some(tag => trial.helpful.includes(tag));
    });
    const modeHint = trial.mode === "instant" ? "지금까지 쌓은 능력치로 즉시 판정한다." : "정해진 턴 동안 노력하며 능력치를 성장시킨다.";
    $("trialHint").textContent = helping.length ? `성격·의지의 영향 · ${helping.join(" · ")}` : modeHint;
  }

  function renderTrialRequirement(trial) {
    if (trial.alternativeStat) {
      const alternativeName = statMeta.find(stat => stat.key === trial.alternativeStat)?.label || "대체 능력";
      $("trialRequiredStat").textContent = `${trial.statName} 또는 ${alternativeName} ${trial.threshold}`;
      $("trialCurrentStat").textContent = `${trial.statName} ${state.stats[trial.stat]} · ${alternativeName} ${state.stats[trial.alternativeStat]}`;
      return;
    }
    $("trialRequiredStat").textContent = `${trial.statName} ${trial.threshold}`;
    $("trialCurrentStat").textContent = `${trial.statName} ${state.stats[trial.stat]}`;
  }

  function renderHand() {
    $("watchButton").disabled = false;
    $("handCards").innerHTML = interventions.map((card, index) => {
      const disabled = state.divine < card.cost;
      return `<button class="hand-card" type="button" data-kind="${card.kind}" data-cost="${card.cost}" style="--hand-index:${index}" ${disabled ? "disabled" : ""}>
        <small>개입 ${card.cost}</small><strong>${card.title}</strong><span>${disabled ? "신성 개입이 부족하다." : card.text}</span>
      </button>`;
    }).join("");
    $("handCards").querySelectorAll(".hand-card").forEach(card => card.addEventListener("click", action(() => useIntervention(card))));
  }

  function awaitEffortClick() {
    $("effortButton").disabled = false;
    return new Promise(resolve => { state.effortResolver = resolve; });
  }

  function awaitRollClose() {
    return new Promise(resolve => { state.rollResolver = resolve; });
  }

  async function showEffortRoll(effort, trial) {
    const popup = $("rollOverlay");
    const die = $("statDie");
    $("rollKind").textContent = `노력의 결과 · ${effort.code}`;
    $("rollTitle").textContent = "운명의 주사위";
    $("rollResult").textContent = `${effort.statName} +${effort.min}~${effort.max}`;
    $("rollDetail").textContent = "반복한 노력의 결과를 기다린다.";
    $("rollCondition").textContent = "";
    $("rollContinue").disabled = true;
    popup.className = "roll-overlay visible rolling";
    popup.setAttribute("aria-hidden", "false");
    let face = effort.min;
    const rolling = setInterval(() => {
      face = face >= effort.max ? effort.min : face + 1;
      die.textContent = String(face);
    }, 80);
    try { await wait(1350); } finally { clearInterval(rolling); }
    let gain = effort.min + Math.floor(Math.random() * (effort.max - effort.min + 1));
    gain += state.nextEffortBonus || 0;
    state.nextEffortBonus = effort.nextBonus || 0;
    if (!state.interventionBonusUsed && state.intervention === "bless") gain += 1;
    if (!state.interventionBonusUsed && state.intervention === "whisper") gain += 2;
    state.interventionBonusUsed = true;
    if (state.progress.requiresRelationship && state.relationships.length) gain += 1;
    const before = state.stats[effort.stat];
    state.stats[effort.stat] = effort.stat === "vitality" ? Math.min(12, before + gain) : before + gain;
    const cost = effort.vitalityCost || (effort.vitalityCostOnZero && gain === 0 ? effort.vitalityCostOnZero : 0);
    if (cost && state.intervention !== "guard") {
      state.stats.vitality = Math.max(0, state.stats.vitality - cost);
      animateStat("vitality");
    }
    die.textContent = String(gain);
    popup.classList.remove("rolling");
    await wait(350);
    $("rollResult").textContent = `${effort.statName} +${gain}`;
    $("rollDetail").textContent = `${effort.statName} ${before} → ${state.stats[effort.stat]}`;
    animateStat(effort.stat);
    renderTrialRequirement(trial);
    const reached = trialReached(trial);
    await wait(620);
    $("rollCondition").textContent = state.stats.vitality <= 0 ? "생명의 불꽃이 꺼졌다" : reached ? "시련 조건 달성" : `조건까지 ${Math.max(0, trial.threshold - trialValue(trial))} 필요`;
    $("rollCondition").className = `roll-condition ${reached ? "met" : "pending"}`;
    $("rollContinue").disabled = false;
    await awaitRollClose();
    return reached && state.stats.vitality > 0;
  }

  const trialValue = trial => trial.alternativeStat ? Math.max(state.stats[trial.stat], state.stats[trial.alternativeStat]) : state.stats[trial.stat];
  const trialReached = trial => trialValue(trial) >= trial.threshold;

  function setEffortCard(effort, trial, turnIndex) {
    const remaining = state.trialTurns - turnIndex;
    $("effortCode").textContent = effort.code;
    $("effortChallenge").textContent = trial.text;
    $("effortTime").textContent = Array.from({ length: state.trialTurns }, (_, index) => index < remaining ? "●" : "○").join("");
    $("effortNeedLabel").textContent = trial.alternativeStat ? "직감 또는 지식" : `필요 ${trial.statName}`;
    $("effortNeed").textContent = String(trial.threshold);
    $("effortCurrentLabel").textContent = trial.alternativeStat ? "현재 높은 능력" : `현재 ${trial.statName}`;
    $("effortCurrent").textContent = String(trialValue(trial));
    $("effortTitle").textContent = effort.title;
    $("effortText").textContent = effort.text;
    $("effortRange").textContent = `주사위 · ${effort.statName} +${effort.min}~${effort.max}`;
  }

  function recordOutcome(success) {
    const trial = state.progress.trial;
    state.history.push({ stage: currentStage().label, title: state.progress.title, trial: trial.title, stat: trial.stat, success });
    if (success) {
      state.outcomeSuccesses += 1;
      if (trial.milestone && !state.milestones.includes(trial.milestone)) state.milestones.push(trial.milestone);
      if (trial.relationship && !state.relationships.includes(trial.relationship)) state.relationships.push(trial.relationship);
      if (trial.item && !state.items.includes(trial.item)) state.items.push(trial.item);
    } else {
      state.outcomeFailures += 1;
      if (trial.failureVitality && state.intervention !== "guard") state.stats.vitality = Math.max(0, state.stats.vitality - trial.failureVitality);
      if (state.stageIndex >= 2 && state.intervention !== "guard") state.stats.vitality = Math.max(0, state.stats.vitality - 1);
    }
    const memory = success ? trial.success.split(" · ")[1] : trial.failure.split(" · ")[1];
    if (memory && !state.milestones.includes(memory)) state.milestones.push(memory);
    renderRecords();
    renderStats();
  }

  const traitOutcomeVoice = {
    "완벽주의자": { success: "작은 어긋남도 끝내 바로잡으려는 끈기", failure: "스스로 세운 높은 기준을 쉽게 놓지 못하는 마음" },
    "책벌레": { success: "배운 것을 차분히 되짚는 습관", failure: "답을 찾을 때까지 기록을 놓지 못하는 집념" },
    "야망": { success: "지금보다 더 높은 곳을 바라보는 열망", failure: "패배조차 다음 목표로 바꾸려는 야심" },
    "다정함": { success: "타인의 마음을 먼저 헤아리는 다정함", failure: "상처 속에서도 다른 이를 외면하지 못하는 마음" },
    "겁없음": { success: "두려움보다 먼저 앞으로 나아가는 용기", failure: "상처를 입고도 물러서지 않는 무모한 용기" },
    "의심 많음": { success: "보이지 않는 징후까지 살피는 신중함", failure: "끝난 뒤에도 의문을 놓지 않는 경계심" },
    "고독한 기질": { success: "홀로 생각을 견디며 답을 찾는 인내", failure: "도움을 청하지 않고 혼자 감당하려는 버릇" },
    "사람을 끄는 자": { success: "곁의 사람을 움직이게 하는 온기", failure: "기대와 시선의 무게를 홀로 떠안는 마음" },
    "고집": { success: "한 번 정한 길을 끝까지 밀고 가는 고집", failure: "꺾인 뒤에도 같은 자리를 다시 두드리는 고집" }
  };

  function withParticle(text, consonant, vowel) {
    const last = text.charCodeAt(text.length - 1);
    const hasFinal = last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0;
    return `${text}${hasFinal ? consonant : vowel}`;
  }

  function composeOutcome(success) {
    const trial = state.progress.trial;
    const tags = [...state.progress.weight, ...trial.helpful];
    const trait = state.traits
      .map(item => ({ item, score: item.tags.filter(tag => tags.includes(tag)).length }))
      .sort((a, b) => b.score - a.score)[0]?.item || state.traits[0];
    const voice = traitOutcomeVoice[trait.name]?.[success ? "success" : "failure"] || `${trait.name}의 기질`;
    const actor = state.stageIndex <= 1
      ? (state.gender === "male" ? "소년" : "소녀")
      : (state.gender === "male" ? "남성 영웅" : "여성 영웅");
    const feature = state.wills.at(-1)
      ? `마음속 ‘${state.wills.at(-1).name}’이라는 의지`
      : state.relationships.at(-1)
        ? `${state.relationships.at(-1)}와 이어진 인연`
        : state.milestones.at(-1)
          ? `‘${state.milestones.at(-1)}’의 기억`
          : `${state.origin.parent}에게서 시작된 삶`;
    const ending = success ? trial.success.split(" · ")[0] : trial.failure.split(" · ")[0];
    return {
      title: success ? `${trial.title} · 극복` : `${trial.title} · 흔적`,
      text: `${actor} ${withParticle(state.name, "은", "는")} ‘${state.progress.title}’의 순간을 지나며 ${withParticle(voice, "이", "가")} 삶의 표면으로 드러났다. ${feature}도 이 선택에 조용히 스며들었다. ${ending}`,
      tags: [state.gender === "male" ? "남성" : "여성", trait.name, currentStage().label, success ? "시련 성공" : "시련 실패"]
    };
  }

  function finishTrial(success, message) {
    recordOutcome(success);
    const screen = $("firstScreen");
    const outcome = composeOutcome(success);
    screen.classList.add(success ? "trial-success" : "trial-failure", "outcome-visible");
    $("cardScenePhase").textContent = "기록의 결과";
    $("cardStageLabel").textContent = message + (state.pendingWill || "");
    $("outcomeKind").textContent = success ? "진행과 시련의 결과 · 성공" : "진행과 시련의 결과 · 실패";
    $("outcomeTitle").textContent = outcome.title;
    $("outcomeText").textContent = outcome.text;
    $("outcomeTags").innerHTML = outcome.tags.map(tag => `<span>${tag}</span>`).join("");
    $("outcomeSummary").setAttribute("aria-hidden", "false");
    state.pendingWill = "";
    $("nextTurnButton").textContent = state.stats.vitality <= 0 ? "생애를 회상한다" : "다음 기록을 펼친다";
    $("nextTurnButton").classList.remove("hidden");
  }

  async function runLimitedTrial() {
    const trial = state.progress.trial;
    const screen = $("firstScreen");
    screen.classList.add("trial-effort");
    screen.classList.remove("hand-visible");
    $("cardScenePhase").textContent = "시련을 넘어서는 중";
    state.nextEffortBonus = 0;
    let reached = trialReached(trial);
    if (reached) screen.classList.remove("trial-effort");
    const effortPool = sample(trial.efforts, trial.efforts.length);
    for (let turn = 0; turn < state.trialTurns && !reached && state.stats.vitality > 0; turn += 1) {
      const effort = effortPool[turn % effortPool.length];
      setEffortCard(effort, trial, turn);
      $("cardStageLabel").textContent = `시련을 극복하기 위한 노력 · ${turn + 1}/${state.trialTurns}`;
      $("effortCard").className = "fate-card effort-card";
      await wait(150);
      $("effortCard").classList.add("drawn");
      await wait(760);
      $("effortCard").classList.add("flipped");
      await wait(850);
      await awaitEffortClick();
      reached = await showEffortRoll(effort, trial);
      $("effortCurrent").textContent = String(trialValue(trial));
      if (!reached && turn < state.trialTurns - 1) {
        $("effortCard").classList.remove("flipped");
        await wait(520);
        $("effortCard").classList.remove("drawn");
        await wait(520);
      }
    }
    if (state.stats.vitality <= 0) reached = false;
    if (reached) {
      const before = state.stats[trial.stat];
      state.stats[trial.stat] += trial.successGain || 0;
      if (trial.bonusGain) state.stats[trial.bonusGain.stat] += trial.bonusGain.amount;
      animateStat(trial.stat);
      renderTrialRequirement(trial);
      finishTrial(true, `시련 조건 달성 · ${trial.success}${trial.successGain ? ` · ${trial.statName} ${before} → ${state.stats[trial.stat]}` : ""}`);
    } else {
      finishTrial(false, `제한 시간 종료 · ${trial.failure}`);
    }
  }

  async function runInstantTrial() {
    const trial = state.progress.trial;
    const tags = allHeroTags();
    const traitBonus = trial.helpful.filter(tag => tags.includes(tag)).length;
    const interventionBonus = state.intervention === "whisper" ? 2 : state.intervention === "bless" ? 1 : 0;
    const eventBonus = state.progress.requiresAny?.some(record => state.milestones.includes(record)) ? 1 : 0;
    const score = trialValue(trial) + traitBonus + interventionBonus + eventBonus;
    let success = score >= trial.threshold;
    $("firstScreen").classList.add("instant-resolve");
    $("firstScreen").classList.remove("hand-visible");
    $("rollKind").textContent = "즉시 시련 · 누적 능력치 판정";
    $("rollTitle").textContent = trial.title;
    $("rollResult").textContent = `${trial.statName} ${score} / 필요 ${trial.threshold}`;
    $("rollDetail").textContent = success ? trial.success : trial.failure;
    $("rollCondition").textContent = success ? "시련 조건 달성" : "시련 조건 미달";
    $("rollCondition").className = `roll-condition ${success ? "met" : "failed"}`;
    $("rollContinue").disabled = false;
    $("rollOverlay").className = "roll-overlay visible instant";
    $("rollOverlay").setAttribute("aria-hidden", "false");
    await awaitRollClose();
    if (success && trial.successGain) {
      state.stats[trial.stat] += trial.successGain;
      animateStat(trial.stat);
    }
    renderTrialRequirement(trial);
    finishTrial(success, success ? `시련 조건 달성 · ${trial.success}` : `시련 실패 · ${trial.failure}`);
  }

  function awakenWill() {
    if (state.wills.length >= willCandidates.length) { state.watchRemaining = 8; return ""; }
    const candidates = willCandidates.filter(candidate => !state.wills.some(will => will.name === candidate.name));
    const ranked = candidates.map(candidate => ({ candidate, score: candidate.context.filter(tag => state.recentTags.includes(tag)).length })).sort((a, b) => b.score - a.score);
    const will = ranked[0].candidate;
    state.wills.push(will);
    state.pendingWill = ` · 의지 발현: ${will.name}`;
    state.watchRemaining = Math.max(6, 10 - state.wills.length);
    renderRecords();
    return ` 인간의 의지 ‘${will.name}’가 조용히 싹텄다.`;
  }

  async function settleHand(message, intervention = "watch") {
    if (state.resolving) return;
    state.resolving = true;
    state.intervention = intervention;
    state.interventionBonusUsed = false;
    if (intervention === "watch") {
      state.recentTags.push(...state.progress.weight);
      state.recentTags = state.recentTags.slice(-12);
      state.watchRemaining = Math.max(0, state.watchRemaining - 1);
      if (state.watchRemaining === 0) message += awakenWill();
      renderResources();
    }
    $("cardStageLabel").textContent = message;
    $("divineHand").classList.add("resolved");
    $("divineHand").querySelectorAll("button").forEach(button => { button.disabled = true; });
    await wait(980);
    if (state.progress.trial.mode === "turn") await runLimitedTrial();
    else await runInstantTrial();
  }

  function useIntervention(card) {
    if (card.disabled || state.resolving) return;
    const cost = Number(card.dataset.cost);
    if (state.divine < cost) return;
    state.divine -= cost;
    renderResources();
    card.classList.add("chosen");
    return settleHand(`신의 개입 · ${card.querySelector("strong").textContent}이 시련에 스며든다.`, card.dataset.kind);
  }

  function resetCardStage() {
    const screen = $("firstScreen");
    screen.classList.remove("hand-visible", "trial-effort", "trial-success", "trial-failure", "instant-resolve", "card-stage-visible", "outcome-visible");
    $("progressCard").className = "fate-card progress-card";
    $("trialCard").className = "fate-card trial-card";
    $("effortCard").className = "fate-card effort-card";
    $("divineHand").className = "divine-hand";
    $("shuffleDeck").className = "shuffle-deck";
    $("shuffleDeck").setAttribute("aria-hidden", "true");
    $("cardScenePhase").textContent = "현재의 장면";
    $("cardSceneTitle").textContent = "";
    $("nextTurnButton").classList.add("hidden");
    $("outcomeSummary").setAttribute("aria-hidden", "true");
    state.resolving = false;
    state.intervention = "watch";
    state.effortResolver = null;
    state.rollResolver = null;
  }

  async function showCatastrophePrelude(sequence) {
    const curtain = $("catastropheCurtain");
    $("catastropheTitle").textContent = state.progress.title;
    $("catastropheText").textContent = `${state.progress.text} 지금까지 사용한 신성 개입 ${state.divineMax - state.divine}회가 세계에 거대한 흔적을 남겼다.`;
    curtain.setAttribute("aria-hidden", "false");
    await wait(80);
    if (sequence !== state.sequence) return;
    curtain.classList.add("visible");
    await wait(2600);
    curtain.classList.remove("visible");
    await wait(750);
    curtain.setAttribute("aria-hidden", "true");
  }

  async function shuffleFateCards(kind, sequence) {
    const deck = $("shuffleDeck");
    const isTrial = kind === "trial";
    $("shuffleIcon").src = isTrial ? "./assets/icons/trial.png" : "./assets/icons/divine-star.png";
    $("shuffleLabel").textContent = isTrial ? "이어질 시련을 섞는 중" : "이어질 기록을 섞는 중";
    deck.setAttribute("aria-hidden", "false");
    deck.className = "shuffle-deck visible";
    await wait(120);
    if (sequence !== state.sequence) return;
    deck.classList.add("mixing");
    await wait(1550);
    if (sequence !== state.sequence) return;
    deck.classList.remove("mixing");
    await wait(330);
    deck.className = "shuffle-deck";
    deck.setAttribute("aria-hidden", "true");
  }

  async function revealCards(sequence) {
    resetCardStage();
    fillCards();
    $("childReveal").classList.add("departed");
    await wait(420);
    if (state.progress.catastrophe) await showCatastrophePrelude(sequence);
    if (sequence !== state.sequence) return;
    $("firstScreen").classList.add("hero-collapsed", "card-stage-visible");
    $("cardStageLabel").textContent = state.progress.catastrophe ? "재앙이 시작되었다. 일반 진행이 멈춘다." : `${state.name}의 삶에서 다음 장면을 고른다.`;
    await wait(700);
    if (sequence !== state.sequence) return;
    await shuffleFateCards("progress", sequence);
    if (sequence !== state.sequence) return;
    $("progressCard").classList.add("drawn");
    await wait(850);
    $("progressCard").classList.add("flipped");
    await wait(Math.max(5200, $("progressText").textContent.length * 45));
    if (sequence !== state.sequence) return;
    $("progressCard").classList.add("archived");
    await wait(920);
    $("cardScenePhase").textContent = "다가오는 시련";
    $("cardStageLabel").textContent = `‘${state.progress.title}’의 결과가 ‘${state.progress.trial.title}’이라는 시련을 불러온다.`;
    await shuffleFateCards("trial", sequence);
    if (sequence !== state.sequence) return;
    $("trialCard").classList.add("drawn");
    await wait(850);
    $("trialCard").classList.add("flipped");
    await wait(1120);
    if (sequence !== state.sequence) return;
    $("cardScenePhase").textContent = state.progress.trial.mode === "instant" ? "즉시 시련" : `${state.trialTurns}턴 제한 시련`;
    renderHand();
    $("firstScreen").classList.add("hand-visible");
  }

  async function transitionStage() {
    const sequence = state.sequence;
    const stage = currentStage();
    resetCardStage();
    renderHud();
    const screen = $("firstScreen");
    window.scrollTo({ top: 0, behavior: "smooth" });
    screen.classList.remove("timeline-advancing");
    screen.classList.add("stage-transitioning");
    screen.classList.remove("timeline-docked");
    $("stageNumber").textContent = `현재 성장기 · 생애 ${String(state.stageIndex + 1).padStart(2, "0")}`;
    $("stageTitle").textContent = stage.label;
    $("stageDescription").textContent = stage.description;
    await wait(1050);
    if (sequence !== state.sequence) return;
    $("stageCurtain").classList.add("visible");
    screen.classList.add("timeline-advancing");
    renderTimeline();
    await wait(2600);
    if (sequence !== state.sequence) return;
    screen.classList.remove("timeline-advancing");
    await wait(650);
    screen.classList.add("timeline-docked");
    await wait(1900);
    $("stageCurtain").classList.remove("visible");
    screen.classList.remove("stage-transitioning");
    await wait(760);
    await revealCards(sequence);
  }

  function showEnding(reason = "completed") {
    if (state.ended) return;
    state.ended = true;
    state.sequence += 1;
    $("rollOverlay").className = "roll-overlay";
    $("rollOverlay").setAttribute("aria-hidden", "true");
    $("stageCurtain").classList.remove("visible");
    $("firstScreen").classList.remove("stage-transitioning");
    resetCardStage();
    const success = state.outcomeSuccesses >= state.outcomeFailures;
    const disconnected = state.divine === 0 && state.catastropheSeen && !success;
    $("endingTitle").textContent = reason === "observed" ? "신은 시선을 거두었다" : state.stats.vitality <= 0 ? "꺼진 생명의 불꽃" : disconnected ? "끊어진 신의 연결" : success ? "자신의 이름으로 남은 생애" : "미완의 기록";
    $("endingText").textContent = reason === "observed"
      ? `${state.name}의 삶은 신의 시선 밖에서도 계속된다.`
      : `${state.name}은 ${state.outcomeSuccesses}번의 시련을 넘어섰고 ${state.outcomeFailures}번 쓰러졌다. ${state.wills.length ? `마지막까지 ‘${state.wills.map(will => will.name).join(" · ")}’라는 의지를 품었다.` : "끝내 신의 뜻과 자신의 뜻 사이에서 답을 찾았다."}`;
    const highlights = state.history.map(item => `<p><span>${item.stage}</span><strong>${item.success ? "성공" : "실패"} · ${item.trial}</strong></p>`).join("");
    $("endingRecords").innerHTML = highlights || "<p><strong>아직 기록되지 않은 생애</strong></p>";
    $("endingOverlay").classList.add("visible");
  }

  async function advanceTurn() {
    if (state.advancing || state.ended) return;
    state.advancing = true;
    $("nextTurnButton").classList.add("hidden");
    if (state.stats.vitality <= 0) return showEnding();
    state.roundInStage += 1;
    if (state.roundInStage >= currentStage().turns) {
      state.stageIndex += 1;
      state.roundInStage = 0;
      if (state.stageIndex >= stages.length) return showEnding();
      await transitionStage();
    } else {
      await revealCards(state.sequence);
    }
    state.advancing = false;
  }

  async function showFirstScreen() {
    if ($("introBeginButton").disabled) return;
    $("introBeginButton").disabled = true;
    const sequence = ++state.sequence;
    $("introScreen").classList.add("hidden");
    const screen = $("firstScreen");
    screen.className = "first-screen";
    $("heroPanel").classList.remove("pinned");
    $("heroPanelHandle").setAttribute("aria-expanded", "false");
    $("childPortrait").src = `./assets/portraits/${state.gender}-childhood.png`;
    $("childName").textContent = "이름 없는 아이";
    $("childRecord").innerHTML = "";
    $("childTraits").innerHTML = state.traits.map(trait => `<span title="${trait.text}">${trait.name}</span>`).join("");
    fillHeroPanel();
    renderTimeline();
    requestAnimationFrame(() => requestAnimationFrame(() => screen.classList.add("timeline-visible")));
    await wait(1350);
    if (sequence !== state.sequence) return;
    screen.classList.add("timeline-docked");
    await wait(1800);
    screen.classList.add("child-visible");
    await wait(540);
    await appendRecord("이름", state.name, sequence);
    $("childName").textContent = state.name;
    await appendRecord("부모", state.origin.parent, sequence);
    await appendRecord("재산", state.origin.wealth, sequence);
    await appendRecord("태어난 곳", state.origin.place, sequence);
    if (sequence !== state.sequence) return;
    $("childTraits").classList.add("visible");
    await wait(850);
    screen.classList.add("hero-visible");
    await wait(980);
    await revealCards(sequence);
  }

  $("introStartButton").addEventListener("click", action(beginIntro));
  $("introCradleButton").addEventListener("click", action(revealTraits));
  $("introRerollButton").addEventListener("click", rerollTraits);
  $("introBeginButton").addEventListener("click", action(showFirstScreen));
  $("watchButton").addEventListener("click", action(() => settleHand("신은 침묵했다. 영웅은 자신의 성격과 의지로 시련을 마주한다.")));
  $("nextTurnButton").addEventListener("click", action(advanceTurn));
  $("endObserveButton").addEventListener("click", () => showEnding("observed"));
  $("restartButton").addEventListener("click", resetIntro);
  $("helpButton").addEventListener("click", () => $("helpDialog").showModal());
  $("closeHelpButton").addEventListener("click", () => $("helpDialog").close());
  $("effortButton").addEventListener("click", () => {
    if (!state.effortResolver) return;
    $("effortButton").disabled = true;
    const resolve = state.effortResolver;
    state.effortResolver = null;
    resolve();
  });
  $("rollContinue").addEventListener("click", () => {
    if (!state.rollResolver) return;
    $("rollOverlay").className = "roll-overlay";
    $("rollOverlay").setAttribute("aria-hidden", "true");
    const resolve = state.rollResolver;
    state.rollResolver = null;
    resolve();
  });
  $("heroPanelHandle").addEventListener("click", event => {
    event.stopPropagation();
    const panel = $("heroPanel");
    const pinned = panel.classList.toggle("pinned");
    $("heroPanelHandle").setAttribute("aria-expanded", String(pinned));
  });
  document.addEventListener("click", event => {
    const panel = $("heroPanel");
    if (!panel.classList.contains("pinned") || panel.contains(event.target)) return;
    panel.classList.remove("pinned");
    $("heroPanelHandle").setAttribute("aria-expanded", "false");
  });

  resetIntro();
})();
