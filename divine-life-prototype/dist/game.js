(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

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
      title: "밤마다 들리는 울음",
      text: "아이는 빈 요람 너머에서 자신을 부르는 듯한 소리를 듣는다.",
      effect: "공포의 첫 기억이 생애에 기록된다.",
      weight: ["notice", "caution"],
      trial: { title: "창가의 검은 그림자", text: "사흘 동안 그림자는 조금씩 요람 가까이 다가온다.", base: 3, helpful: ["notice", "endure"] }
    },
    {
      title: "열병이 찾아오다",
      text: "비가 그치지 않는 밤, 어린 몸에 뜨거운 열이 오른다.",
      effect: "가족의 보살핌과 아이의 기질이 시험받는다.",
      weight: ["care", "endure"],
      trial: { title: "꺼지지 않는 열", text: "열이 가라앉을 때까지 아이는 긴 밤을 버텨야 한다.", base: 3, helpful: ["care", "endure"] }
    },
    {
      title: "금지된 책장",
      text: "아이는 먼지 쌓인 책장에서 낯선 별의 문양을 발견한다.",
      effect: "알아서는 안 될 지식이 아이를 바라보기 시작한다.",
      weight: ["study", "risk"],
      trial: { title: "속삭이는 문장", text: "책을 덮은 뒤에도 문장은 머릿속에서 밤낮으로 반복된다.", base: 2, helpful: ["study", "caution"] }
    },
    {
      title: "길 잃은 아이",
      text: "장터의 군중 속에서 부모의 손을 놓친 아이가 홀로 남는다.",
      effect: "처음으로 낯선 인간과 세계를 마주한다.",
      weight: ["bond", "lead"],
      trial: { title: "해가 지기 전에", text: "낯선 이들을 지나 부모에게 돌아갈 길을 찾아야 한다.", base: 2, helpful: ["bond", "notice"] }
    }
  ];

  const interventions = [
    { title: "작은 징조", cost: "개입 1", text: "시련의 예상 기간을 1턴 줄인다.", kind: "shorten" },
    { title: "보호의 손길", cost: "개입 2", text: "치명적인 실패 한 번을 막는다.", kind: "guard" },
    { title: "속삭임", cost: "개입 1", text: "관련 성격의 힘을 이번 시련에 보탠다.", kind: "whisper" }
  ];

  const state = {
    gender: "male",
    name: "",
    traits: [],
    origin: origins[0],
    progress: null,
    trialTurns: 2,
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
    await typeText($("introNarration"), "단순한 신의 유희인가, 영웅의 탄생을 축복하는 것인가. 오늘 여기 한 인간이 첫 숨을 쉰다.", 48, sequence);
    if (sequence !== state.sequence) return;
    $("introNarration").classList.add("typed");
    await wait(420);
    $("introStoryStep").classList.add("lifted");
    await wait(1320);
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
    await typeText($("introQuestion"), "이 아이가 영웅이 될 아이인가.", 55, sequence);
    if (sequence !== state.sequence) return;
    $("introQuestion").classList.add("typed");
    renderIntroTraits();
    await wait(460);
    $("introActions").classList.remove("hidden");
  }

  function rerollTraits() {
    if (state.rerolled) return;
    state.rerolled = true;
    const box = $("introTraits");
    box.classList.add("dissolve");
    $("introRerollButton").disabled = true;
    setTimeout(() => {
      state.traits = sample(traits, 3);
      renderIntroTraits("return");
      $("introRerollButton").textContent = "아이의 운명은 이미 한번 바뀌었다";
    }, 510);
  }

  function chooseProgress() {
    const heroTags = state.traits.flatMap(trait => trait.tags);
    const weighted = progressPool.flatMap(progress => {
      const matches = progress.weight.filter(tag => heroTags.includes(tag)).length;
      return Array(1 + matches * 2).fill(progress);
    });
    state.progress = sample(weighted)[0];
    const helpful = state.progress.trial.helpful.filter(tag => heroTags.includes(tag)).length;
    const variation = Math.random() < .42 ? 1 : 0;
    state.trialTurns = Math.max(1, Math.min(3, state.progress.trial.base + variation - helpful));
  }

  async function appendRecord(label, value, sequence) {
    const line = document.createElement("p");
    line.innerHTML = `<small>${label}</small><span></span>`;
    $("childRecord").append(line);
    requestAnimationFrame(() => line.classList.add("visible"));
    await typeText(line.querySelector("span"), value, 42, sequence);
    await wait(260);
  }

  function fillHeroPanel() {
    $("heroPanelPortrait").src = `./assets/portraits/${state.gender}-childhood.png`;
    $("heroPanelName").textContent = state.name;
    $("heroParent").textContent = state.origin.parent;
    $("heroWealth").textContent = state.origin.wealth;
    $("heroPanelTraits").innerHTML = state.traits.map(trait => `<span>${trait.name}</span>`).join("");
  }

  function fillCards() {
    chooseProgress();
    $("progressTitle").textContent = state.progress.title;
    $("progressText").textContent = state.progress.text;
    $("progressEffect").textContent = state.progress.effect;
    $("trialTitle").textContent = state.progress.trial.title;
    $("trialText").textContent = state.progress.trial.text;
    $("trialClock").innerHTML = `<strong>${state.trialTurns}턴</strong><span>${Array.from({ length: state.trialTurns }, () => "◆").join(" ")}</span>`;
    const helping = state.traits.filter(trait => trait.tags.some(tag => state.progress.trial.helpful.includes(tag))).map(trait => trait.name);
    $("trialHint").textContent = helping.length ? `${helping.join(" · ")}의 기질이 이 시련에 영향을 준다.` : "이 시련을 도울 기질이 아직 드러나지 않았다.";
  }

  function renderHand() {
    $("handCards").innerHTML = interventions.map((card, index) => `
      <button class="hand-card" type="button" data-kind="${card.kind}" style="--hand-index:${index}">
        <small>${card.cost}</small><strong>${card.title}</strong><span>${card.text}</span>
      </button>
    `).join("");
    $("handCards").querySelectorAll(".hand-card").forEach(card => card.addEventListener("click", () => useIntervention(card)));
  }

  function settleHand(message) {
    $("cardStageLabel").textContent = message;
    $("divineHand").classList.add("resolved");
    $("divineHand").querySelectorAll("button").forEach(button => { button.disabled = true; });
  }

  function useIntervention(card) {
    if (card.disabled) return;
    card.classList.add("chosen");
    const kind = card.dataset.kind;
    if (kind === "shorten" && state.trialTurns > 1) {
      state.trialTurns -= 1;
      $("trialClock").innerHTML = `<strong>${state.trialTurns}턴</strong><span>${Array.from({ length: state.trialTurns }, () => "◆").join(" ")}</span>`;
    }
    const title = card.querySelector("strong").textContent;
    settleHand(`신의 개입 · ${title}이 시련에 스며든다.`);
  }

  async function revealCards(sequence) {
    fillCards();
    $("childReveal").classList.add("departed");
    await wait(360);
    $("firstScreen").classList.add("hero-collapsed");
    await wait(760);
    if (sequence !== state.sequence) return;
    $("firstScreen").classList.add("card-stage-visible");
    $("cardStageLabel").textContent = "아이의 삶은 스스로 다음 장면을 선택한다.";
    await wait(850);
    if (sequence !== state.sequence) return;
    $("progressCard").classList.add("drawn");
    await wait(760);
    $("progressCard").classList.add("flipped");
    await wait(1700);
    if (sequence !== state.sequence) return;
    $("progressCard").classList.add("archived");
    await wait(820);
    $("progressTab").classList.remove("active");
    $("trialTab").classList.add("active");
    $("cardStageLabel").textContent = "이 진행에서 태어난 시련이 모습을 드러낸다.";
    $("trialCard").classList.add("drawn");
    await wait(760);
    $("trialCard").classList.add("flipped");
    await wait(1100);
    if (sequence !== state.sequence) return;
    renderHand();
    $("firstScreen").classList.add("hand-visible");
  }

  async function showFirstScreen() {
    const sequence = ++state.sequence;
    $("introScreen").classList.add("hidden");
    const screen = $("firstScreen");
    screen.className = "first-screen";
    $("heroPanel").classList.remove("pinned");
    $("heroPanelHandle").setAttribute("aria-expanded", "false");
    $("childPortrait").src = `./assets/portraits/${state.gender}-childhood.png`;
    $("childName").textContent = "이름 없는 아이";
    $("childRecord").innerHTML = "";
    $("childTraits").innerHTML = state.traits.map(trait => `<span>${trait.name}</span>`).join("");
    fillHeroPanel();

    requestAnimationFrame(() => requestAnimationFrame(() => screen.classList.add("timeline-visible")));
    await wait(1050);
    if (sequence !== state.sequence) return;
    screen.classList.add("timeline-docked");
    await wait(1350);
    if (sequence !== state.sequence) return;
    screen.classList.add("child-visible");
    await wait(480);
    await appendRecord("이름", state.name, sequence);
    $("childName").textContent = state.name;
    await appendRecord("부모", state.origin.parent, sequence);
    await appendRecord("재산", state.origin.wealth, sequence);
    await appendRecord("태어난 곳", state.origin.place, sequence);
    if (sequence !== state.sequence) return;
    $("childTraits").classList.add("visible");
    await wait(720);
    screen.classList.add("hero-visible");
    await wait(950);
    if (sequence !== state.sequence) return;
    await revealCards(sequence);
  }

  $("introStartButton").addEventListener("click", beginIntro);
  $("introCradleButton").addEventListener("click", revealTraits);
  $("introRerollButton").addEventListener("click", rerollTraits);
  $("introBeginButton").addEventListener("click", showFirstScreen);
  $("watchButton").addEventListener("click", () => settleHand("신은 침묵했다. 아이는 자신의 기질로 시련을 견딘다."));
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
