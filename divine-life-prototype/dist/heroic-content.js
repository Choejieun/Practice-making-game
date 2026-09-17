/* v1.0.2: authored adventures and non-trial relationship interludes. */
window.heroicRules = (() => {
  const labels = {strength:'근력',agility:'민첩',knowledge:'지식',intuition:'직감',charm:'매력'};
  const add = (list, text) => { if (!list.includes(text)) list.push(text); };
  const memory = s => s.world.adventure || (s.world.adventure = {cliff:'unseen',repaid:false,route:null});
  const make = (id,stage,title,story,stat,threshold,challenge,success,failure,tags,efforts) => ({
    id,stage,heroic:true,title,story,text:story.split('. ')[0]+'.',weight:tags,
    trial:{title:challenge,text:'남겨진 사람들에게 살아 돌아갈 길을 열 수 있을까?',stat,statName:labels[stat],threshold,mode:'turn',base:2,helpful:tags,
      success,failure,successGain:1,milestone:'위기 극복 · '+challenge,
      efforts:efforts.map((title,i)=>({code:id+'-S0'+(i+1),title,text:title+'.',stat,statName:labels[stat],min:i?1:0,max:3}))}
  });
  const cliff = make('ARC-CLIFF-DESCENT','adolescent','절벽 아래에서 누군가 부른다',
    '백로 고개를 지나던 {hero}의 발밑에서 가느다란 목소리가 들린다. 부서진 마차 아래, 푸른 비단옷을 입은 아이가 매달려 있다. 길 위의 화살과 잘린 고삐는 추락이 사고가 아니었음을 말해 준다. 비가 굵어지기 전에 아래로 내려가야 한다.',
    'agility',6,'빗물에 젖은 절벽',
    '마지막 돌턱에 발을 딛자 아이가 소매를 붙잡는다. 숨은 붙어 있지만 다리를 움직이지 못한다. “세이란… 아버지에게 데려다주세요.” 품속에는 이국 상단의 은빛 인장이 있다.',
    '바닥에 닿았을 때는 부르는 소리가 멎어 있었다. 아이는 차가워진 손에 은빛 인장을 움켜쥐고 있었다. 며칠 뒤, 도적에게 습격당한 세이란 상단주가 찾던 막내아들 아린이었다는 사실을 알게 된다.',
    ['care','risk','notice'],['밧줄을 바위에 고정한다','젖지 않은 돌턱을 찾아 발을 옮긴다']);
  const rows = [
    ['adolescent','H02','검은 종이 울리기 전에','폐수도원의 종이 울릴 때마다 길손 한 명이 숲으로 사라진다. 문틈의 문장은 종을 멈추는 순서를 숨기고 있다. {hero}는 마지막 종소리 전에 빗장을 풀어야 한다.','knowledge',6,'일곱 번째 종','문장이 풀리자 종이 잠잠해졌다. 길 잃은 사람들이 서로의 이름을 부르며 돌아온다.','종은 한 번 더 울렸다. 돌아오지 못한 이들의 이름을 수도원 문에 남겼다.',['study','notice'],['금이 간 문장을 탁본한다','반복되는 기호의 순서를 맞춘다']],
    ['adolescent','H03','불붙은 망루 아래로 달려간다','도적이 봉화를 끄려고 망루에 불을 질렀다. 위층에는 다친 파수꾼과 마을에 알릴 마지막 불씨가 남아 있다. {hero}는 기울어진 들보에 어깨를 댄다.','strength',6,'불길 속의 들보','들보가 들리자 파수꾼이 밖으로 기어 나왔다. 되살린 봉화가 다음 산에서 응답한다.','들보가 꺾이며 계단을 덮었다. 파수꾼은 다른 창으로 뛰었지만 봉화는 끝내 꺼졌다.',['endure','protect'],['들보 아래 지렛대를 받친다','젖은 천으로 손을 감고 밀어 올린다']],
    ['adolescent','H04','사라진 아이들의 발자국을 좇는다','마을의 아이들이 잠든 채 숲으로 걸어 들어갔다. 발자국은 늑대 굴이 아니라 뿌리 아래 오래된 문으로 이어진다. {hero}에게만 문 안쪽의 울음이 들린다.','intuition',6,'뿌리 아래의 문','울음이 멎는 틈을 찾아 문을 열었다. 잠에서 깬 아이들이 새벽빛 속으로 걸어 나온다.','울음의 방향을 놓쳤다. 구조대와 돌아왔을 때 문은 흙 속으로 가라앉아 있었다.',['notice','care'],['울음과 바람 소리를 구별한다','동물들이 피하는 뿌리를 살핀다']],
    ['adult','H01','독을 실은 상단을 멈춘다','구호 곡물을 먹은 마을마다 같은 열병이 번진다. 봉인된 자루의 곰팡이는 자연적인 것이 아니다. {hero}는 다음 마을의 문이 열리기 전에 해독법을 찾아야 한다.','knowledge',8,'구호 자루의 검은 가루','독의 정체를 밝혀 물자 배급을 멈췄다. 끓인 약 냄새가 격리소에 퍼진다.','해독법은 늦게 완성됐다. 살아남은 사람들과 함께 빈 침상의 이름을 적었다.',['study','care'],['증상과 운송 기록을 대조한다','소량의 약재로 반응을 확인한다']],
    ['adult','H02','무너지는 성문을 떠받친다','퇴각하는 피난민의 끝이 아직 성문 밖에 있다. 끊어진 사슬이 돌바닥을 때리고 문이 내려앉는다. {hero}는 수레의 축을 문 아래로 밀어 넣는다.','strength',8,'마지막 피난 행렬','문이 버티는 동안 마지막 아이까지 성 안으로 들어왔다. 휘어진 수레 축이 광장에 남는다.','받침이 부러졌다. 밖에 남은 사람들은 먼 샛길로 흩어져야 했다.',['protect','endure'],['받침의 무게를 나누어 건다','문이 흔들리는 박자에 맞춰 밀어낸다']],
    ['adult','H03','협곡의 끊어진 봉화를 잇는다','국경의 봉화 하나가 응답하지 않는다. 적의 척후병이 돌아오기 전, {hero}는 무너진 잔도를 건너 경보를 전해야 한다. 아래에서는 강물이 돌을 삼킨다.','agility',8,'끊어진 잔도','반대편에 닿아 봉화를 올렸다. 밤하늘을 따라 불빛이 왕도까지 이어진다.','잔도를 넘지 못했다. 경보는 지체됐고 변경의 사람들은 짐도 없이 피난을 떠났다.',['risk','protect'],['느슨한 널빤지를 밧줄로 묶는다','벽에 몸을 붙이고 틈을 건넌다']],
    ['adult','H04','가면 쓴 사절의 행렬을 막는다','평화 사절의 수레에서 쇠사슬 소리가 들린다. 호위병은 안을 보려는 사람을 밀쳐 낸다. {hero}는 축제 인파가 문을 열기 전에 위장의 빈틈을 찾아야 한다.','intuition',8,'깃발 아래의 위장','틀린 문장을 짚자 호위병의 손이 칼로 향했다. 포박된 사절을 구해 전쟁의 구실을 막았다.','수레는 문을 통과했다. 그날 밤 울린 경보는 너무 늦은 의심의 답이었다.',['notice','truth'],['깃발과 갑옷의 문장을 비교한다','행렬의 발자국과 말투를 살핀다']],
    ['middle','H01','수몰되는 지하 감옥에 들어간다','폭풍으로 감옥의 수로가 터졌다. 경비대는 죄수들을 버리고 철수했지만 창살 안에서는 살아 있는 목소리가 들린다. {hero}는 잠긴 수문으로 향한다.','strength',9,'쇠창살 너머의 물살','창살이 휘자 젖은 손들이 뻗어 나왔다. 이름을 묻기 전에 모두에게 밧줄을 건넸다.','수위가 어깨를 넘었다. 닿지 못한 방의 번호를 잊지 않으려 벽에 새겼다.',['care','endure'],['녹슨 경첩부터 부순다','수문에 걸린 잔해를 밀어낸다']],
    ['middle','H02','왕도 아래의 봉인을 읽는다','광장 바닥에서 밤마다 검은 김이 오른다. 지하의 봉인은 왕조보다 오래됐고, 수리한 자리마다 균열이 더 벌어진다. {hero}는 원래의 의식을 복원한다.','knowledge',9,'거꾸로 새긴 봉인','뒤집힌 글자를 바로잡자 돌이 맞물렸다. 광장 아래에서 처음으로 고요가 돌아왔다.','의식은 완성되지 않았다. 광장을 비우고 금지선을 세우는 것으로 더 큰 피해를 막았다.',['study','truth'],['시대가 다른 글자를 분리한다','남은 기록에서 의식 순서를 찾는다']],
    ['middle','H03','붉은 안개의 피난길을 연다','안개를 마신 사람은 같은 골목을 맴돈다. {hero}는 벽을 따라 아이들의 손을 하나씩 이어 준다. 안전한 출구는 바람이 돌아오는 짧은 순간에만 보인다.','intuition',9,'되돌아오는 골목','안개가 갈라진 틈으로 대열을 이끌었다. 사람들은 성 밖에서야 서로의 손을 놓았다.','바람의 틈을 놓쳤다. 피난민들과 문을 닫아걸고 구조 신호를 밤새 보냈다.',['notice','protect'],['횃불의 기울기를 기억한다','반복되지 않는 발소리를 좇는다']],
    ['middle','H04','추격대 앞에서 다리를 건넌다','난민의 마지막 수레가 다리 가운데 멈췄다. 추격대의 횃불이 숲을 빠져나온다. {hero}는 끊을 밧줄과 살려 둘 길을 한눈에 가늠한다.','agility',9,'마지막 밧줄','수레가 건너자 다리의 매듭을 끊었다. 강 너머 횃불들이 더는 다가오지 못한다.','매듭에 닿기 전에 추격대가 다리에 올랐다. 난민들은 짐을 버리고 산길로 달아났다.',['risk','protect'],['가벼운 짐부터 강 건너로 보낸다','흔들리는 난간을 잡고 매듭에 접근한다']],
    ['mature','H01','거인의 발자국 앞에 방벽을 세운다','산에서 깨어난 거인이 피난소로 내려온다. 싸워 쓰러뜨릴 수는 없지만 무너진 채석장의 바위를 굴리면 길을 돌릴 수 있다. {hero}는 지렛대를 잡는다.','strength',10,'거인의 길목','바위가 굴러 길을 막았다. 거인은 빈 골짜기로 방향을 틀고 피난소는 밤을 넘겼다.','바위는 제때 움직이지 않았다. 사람들은 피난소마저 떠나야 했다.',['endure','protect'],['받침돌을 견고하게 고른다','일꾼들과 힘을 모아 바위를 민다']],
    ['mature','H02','별 없는 바다의 항로를 찾는다','귀환선들이 별 없는 해역에 갇혔다. 나침반은 서로 다른 북쪽을 가리킨다. {hero}는 밀물의 시간과 오래된 항해일지를 펼친다.','knowledge',10,'돌아오지 않는 항로','조류가 바뀌는 시간을 짚어 불빛을 보냈다. 첫 귀환선이 안개를 뚫고 들어온다.','등대의 불은 밤새 탔지만 배는 돌아오지 않았다. 해안에 수색대를 남겼다.',['study','legacy'],['항해일지의 날짜와 조류를 맞춘다','떠밀려온 나뭇조각의 방향을 기록한다']],
    ['mature','H03','꿈을 빼앗는 순례자를 좇는다','순례자가 다녀간 집마다 사람들은 깨어나지 않는다. {hero}는 텅 빈 발자국이 아니라 아직 남은 꿈의 흔적을 읽는다. 다음 문이 열리기 전에 따라잡아야 한다.','intuition',10,'잠든 마을의 이름','잊힌 이름을 부르자 순례자의 가면이 깨졌다. 집집마다 기침과 울음이 돌아왔다.','가면 뒤의 이름을 알아내지 못했다. 잠든 이들을 돌보는 긴 밤이 시작됐다.',['notice','truth'],['잠꼬대에 반복되는 이름을 모은다','꿈과 현실이 어긋난 문턱을 찾는다']],
    ['mature','H04','무너지는 천문대에서 기록을 구한다','하늘의 균열을 예고한 마지막 기록이 천문대에 남았다. 계단은 한 층씩 붕괴하고 제자들은 밖에서 이름을 부른다. {hero}는 책이 있는 층까지 몸을 낮춘다.','agility',10,'떨어지는 별의 계단','기록을 품고 마지막 계단을 뛰어넘었다. 제자들이 다음 재난의 날짜를 읽기 시작한다.','계단이 먼저 무너졌다. 살아 돌아왔지만 예고의 마지막 장은 잃었다.',['risk','legacy'],['튼튼한 난간에 밧줄을 건다','흔들림이 멎는 순간에 층을 옮긴다']],
    ['elder','H01','마지막 봉화의 불씨를 지킨다','도시를 비운 뒤에도 산 위의 봉화는 누군가 지켜야 한다. {hero}는 젊은 날의 문장을 벗어 바람막이로 두른다. 피난선이 강을 건널 때까지 불이 살아 있어야 한다.','strength',10,'폭풍 앞의 불씨','불은 마지막 배가 닿을 때까지 살아 있었다. 먼 강변에서 답례의 등불이 흔들린다.','폭풍이 불을 껐다. 강변의 사람들은 어둠 속에서 서로를 부르며 길을 찾아야 했다.',['endure','legacy'],['기울어진 바람막이를 받친다','젖지 않은 장작을 하나씩 옮긴다']],
    ['elder','H02','봉인할 이름을 마지막으로 읽는다','옛 적의 이름이 봉인에서 지워지고 있다. {hero}만이 그 이름을 들었던 날을 기억한다. 떨리는 손으로 한 획씩 잃어버린 문장을 복원한다.','knowledge',10,'지워지는 마지막 이름','마지막 획이 새겨지자 문 안쪽의 소리가 멎었다. 제자들은 그 글씨를 오래 보존했다.','이름은 끝내 완성되지 않았다. 다음 세대에 남길 경고부터 기록했다.',['study','legacy'],['서로 다른 기억을 대조한다','닳은 문장의 획을 다시 새긴다']],
    ['elder','H03','죽은 이들의 행렬을 돌려보낸다','전쟁에서 돌아오지 못한 이들이 성문 앞에 섰다. 그들은 복수보다 돌아갈 집을 찾고 있다. {hero}는 살아온 기억 속에서 그들의 길을 짚는다.','intuition',10,'새벽까지 남은 이름들','잊힌 집의 이름을 하나씩 불렀다. 행렬은 새벽빛 속으로 조용히 돌아갔다.','기억하지 못한 이름들이 성문에 남았다. 사람들은 그 이름을 찾는 일을 이어받았다.',['care','truth'],['행렬이 바라보는 방향을 살핀다','옛 지도의 집과 이름을 맞춘다']]
  ];
  const events = [cliff,...rows.map(row=>make(row[0]+'-'+row[1],row[0],...row.slice(2)))];
  function escape(s,random=Math.random) {
    const routes = [
      ['strength',['endure','protect','risk'],'아이를 등에 지고 절벽을 오른다','옷을 찢어 아이를 등에 묶는다. 내려온 길은 젖어 있지만 밧줄을 건 바위는 아직 버티고 있다. 한 걸음마다 등 뒤의 숨을 확인하며 올라야 한다.','아이를 단단히 묶고 매듭을 확인한다','돌턱마다 몸을 쉬며 다시 오른다'],
      ['knowledge',['study','caution'],'옛 운송로를 찾아 마을로 향한다','물건을 나르던 길이라면 절벽 아래에도 출구가 있을 것이다. 마차 바퀴의 폭과 바위에 남은 이정표를 맞춰 보며 아이가 버틸 수 있는 길을 찾는다.','무너진 이정표와 지형을 대조한다','아이의 다리를 고정하고 짧은 길을 찾는다'],
      ['intuition',['notice','care'],'짐승의 물길을 따라 탈출한다','젖은 흙 위로 작은 짐승들의 발자국이 모인다. 마른 계곡 끝에서는 물소리가 난다. 물을 따라가면 사람이 사는 곳에 닿을 수 있으리라, 영웅은 아이를 부축한다.','동물들이 오가는 흔적을 살핀다','물소리가 가까워지는 갈림길을 고른다']
    ];
    const tags=[...s.traits,...s.wills].flatMap(x=>x.tags);
    const pool=routes.flatMap(r=>Array(1+r[1].filter(t=>tags.includes(t)).length*2).fill(r));
    const [stat,tagsForRoute,title,story,a,b]=pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];
    const card=make('ARC-CLIFF-ESCAPE','adolescent',title,story,stat,7,'아린과 살아 돌아오는 길',
      '마을의 불빛 아래서 아이가 마침내 이름을 말한다. 아린 세이란. 바다 건너 대부호의 막내아들은 도적의 습격에서 살아남았다. 치료를 마친 뒤 떠나는 수레에서도 그는 영웅의 이름을 몇 번이나 되뇌었다.',
      '마을의 불빛은 보였지만 아이의 숨은 그보다 먼저 멎었다. 영웅은 아린 세이란이라는 이름과 은빛 인장을 가족에게 전했다. 그 뒤로 비 오는 고갯길은 쉽게 지나칠 수 없는 장소가 되었다.',tagsForRoute,[a,b]);
    card.continuation=true;return card;
  }
  function next(s) {
    const m=memory(s);
    if(m.cliff==='reached')return escape(s);
    if(s.stageIndex===1 && m.cliff==='unseen')return structuredClone(cliff);
    if(s.stageIndex>=2 && m.cliff==='saved' && !m.repaid)return {
      id:'REL-ARIN-RETURN',relationship:true,heroic:true,stage:'adult',title:'바다 건너에서 돌아온 이름',weight:['bond','care','legacy'],
      text:'푸른 돛을 단 상단의 주인이 영웅의 이름을 부른다.',
      story:'항구에 닿은 세이란 상단에서 한 청년이 내려온다. 그는 은빛 인장을 내밀며 말한다. “절벽 아래에서 제 이름을 물어 주셨지요. 아린입니다.” 어린 날 살려 낸 아이가 이제 자기 배를 이끄는 사람이 되어 돌아왔다. 빚을 갚으러 왔다는 말 끝에, 오래 나누지 못한 이야기가 기다린다.'
    };
    return null;
  }
  function remember(card,success,s) {
    const m=memory(s);
    if(card.id==='ARC-CLIFF-DESCENT'){m.cliff=success?'reached':'dead';add(s.milestones,success?'절벽 아래에서 아린을 만나다':'아린에게 너무 늦게 닿다');}
    if(card.id==='ARC-CLIFF-ESCAPE'){
      m.cliff=success?'saved':'dead';m.route=card.trial.stat;
      add(s.milestones,success?'아린 세이란의 생명을 구하다':'아린을 집으로 돌려보내지 못하다');
      if(success)add(s.relationships,'구해 준 아이 · 아린 세이란');
    }
  }
  function resolveRelationship(card,s) {
    if (card.requiresFlag) {
      const stories={bereaved:'돌아오지 않을 사람의 이름을 편지 끝에 적었다. 대답은 없지만 함께 지낸 날들을 지우지 않기로 했다.',married:'서로 다른 버릇을 웃으며 이야기했다. 함께 살아갈 집에는 두 사람의 물건이 조금씩 자리를 잡는다.',parent:'아이는 같은 이야기를 다시 들려 달라고 했다. 익숙한 목소리를 들으며 작은 손이 소매를 놓지 않는다.',family:'함께 견딘 날들을 이야기하다가 긴 침묵이 찾아왔다. 이번에는 그 침묵마저 편안했다.'};
      add(s.milestones,card.title);
      return {title:card.title,text:stories[card.requiresFlag]||card.text,effect:'인연의 기억 · 시련 없음'};
    }
    if(card.id==='REL-ARIN-RETURN'){
      const m=memory(s);if(m.repaid)return m.result;
      m.repaid=true;
      const close=s.stats.charm>=8 || s.stats.knowledge>=10 || s.stats.intuition>=10;
      const bond=close?'벗':'지인';
      s.relationships=s.relationships.filter(x=>!x.includes('아린 세이란'));
      add(s.relationships,bond+' · 아린 세이란');add(s.items,'세이란 상단의 보은 증서');
      add(s.milestones,'성인이 된 아린의 보은');
      const reason=s.stats.charm>=8?'서로의 긴 이야기가 늦은 밤까지 이어졌다.':s.stats.knowledge>=10?'항로와 낯선 땅의 기록을 놓고 대화가 끊이지 않았다.':'그가 말하지 못한 두려움을 먼저 알아보았다.';
      m.result={title:close?'은인을 넘어 벗으로':'잊지 않은 은혜',text:close?reason+' 아린은 은인이 아니라 이름으로 불러도 되겠느냐고 묻는다.': '감사는 진심이었지만 두 사람의 삶은 서로 다른 곳을 향하고 있었다. 아린은 도움이 필요하면 상단을 찾아 달라며 인장을 건넨다.',effect:'보은 증서 획득 · 아린과 '+bond+' 관계'};
      return m.result;
    }
    const step=card.relationStep,threshold={meet:7,court:9,engage:11,marry:12}[step]||9;
    const close=s.stats.charm>=threshold || s.stats.intuition>=threshold+2 || s.stats.knowledge>=threshold+3;
    if(step==='meet' && !close)s.world.partner={name:'리안',status:'acquaintance'};
    else if(close)window.lifeRules.remember(card,true,s);
    const status={meet:'친구',court:'연인',engage:'약혼자',marry:'배우자'}[step];
    const title=close?(status?'리안과 '+status+'가 되다':card.title):'서로의 거리를 존중하다';
    add(s.milestones,title);
    return {title,text:close?'말을 고르는 사이 서로의 망설임을 이해했다. 서두르지 않고 나눈 대화가 두 사람의 관계를 한 걸음 가까이 옮겼다.':'마음을 나누었지만 같은 미래를 약속하지는 않았다. 오늘은 익숙한 인사로 헤어지고, 지금의 관계를 소중히 남겨 두었다.',effect:'관계의 기록 · 현재 능력치로 결정 · 시련 없음'};
  }
  return {events,next,remember,resolveRelationship,memory};
})();
