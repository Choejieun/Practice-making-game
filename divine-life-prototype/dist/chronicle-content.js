/* Conditional life chronicles. A memory opens a door; traits and a chosen will decide which one. */
window.chronicleRules = (() => {
  const stageKeys = ['childhood','adolescent','adult','middle','mature','elder'];
  const labels = {strength:'근력',agility:'민첩',knowledge:'지식',intuition:'직감',charm:'매력'};
  const heroText=(text,s)=>{
    const name=s.name||'그 사람';
    if(window.narrativeRules?.nameText)return window.narrativeRules.nameText(text,name);
    // This small standalone fallback supports tools that inspect this module without the app scripts.
    const code=name.charCodeAt(name.length-1),jong=code>=0xac00&&code<=0xd7a3?(code-0xac00)%28:0;
    const pair={은:['은','는'],는:['은','는'],이:['이','가'],가:['이','가'],을:['을','를'],를:['을','를'],과:['과','와'],와:['과','와']};
    return String(text).replace(/\{hero\}(은|는|이|가|을|를|과|와)?/g,(_,suffix)=>name+(suffix?pair[suffix][jong?0:1]:''));
  };
  const arcInfo = {
    oath: {name:'종이 울리지 않는 밤',trait:'겁없음',willTag:'protect',seeds:['아린 세이란의 생명을 구하다','위기 극복 · 불길 속의 들보','위기 극복 · 마지막 피난 행렬'],image:'oath.png',alt:'비 내리는 성문 앞에서 횃불을 든 피난민을 지키는 작은 인영'},
    archive: {name:'지워진 이름의 서고',trait:'책벌레',willTag:'truth',seeds:['별 이름을 익히다','위기 극복 · 일곱 번째 종','위기 극복 · 구호 자루의 검은 가루'],image:'archive.png',alt:'어두운 서고에서 펼친 낡은 장부 위로 떨어지는 금빛 등잔불'},
    lantern: {name:'돌아오는 이들의 등불',trait:'다정함',willTag:'legacy',seeds:['작은 생명을 돌보다','작은 비막이를 세우다','아린 세이란의 생명을 구하다'],image:'lantern.png',alt:'안개 낀 강가의 작은 등불과 그 곁을 지키는 사람의 뒷모습'},
    demon: {name:'밤을 삼키는 왕',probabilistic:true,image:'demon.png',alt:'붉은 일식 아래 먼 성채를 덮는 거대한 왕관 모양의 어둠'}
  };
  const stageOf = s => stageKeys[Math.max(0,Math.min(5,s.stageIndex || 0))];
  const peek = s => s.world?.chronicles || {outcomes:{},arcs:{}};
  function memory(s) {
    s.world ||= {};
    return s.world.chronicles ||= {outcomes:{},arcs:{}};
  }
  function init(s,random=Math.random) {
    const m=memory(s);
    if (typeof m.demonEligible!=='boolean') {
      m.demonEligible=random()<0.25;
      m.demonChance=25;
    }
    return m;
  }
  const add = (list,value) => { if (!list.includes(value)) list.push(value); };
  const idFor = (arc,step) => `CHRONICLE-${arc.toUpperCase()}-${step}`;
  function make(arc,step,stages,title,text,story,stat,threshold,challenge,question,success,failure,efforts) {
    const info=arcInfo[arc], id=idFor(arc,step);
    return {
      id,arc,step,stages,heroic:true,chronicle:true,title,text,story,
      weight:arc==='oath'?['protect','risk','endure']:arc==='archive'?['study','truth','notice']:arc==='demon'?['risk','truth','protect']:['care','legacy','bond'],
      ...(step===1?{cutscene:{src:`./assets/cutscenes/${info.image}`,alt:info.alt,caption:info.name,insertAfter:1}}:{}),
      trial:{title:challenge,text:question,stat,statName:labels[stat],threshold,mode:'turn',base:2,
        helpful:arc==='archive'?['study','truth']:arc==='oath'?['protect','endure']:['care','legacy'],
        success,failure,successGain:1,milestone:`연대기 · ${challenge}`,
        efforts:efforts.map((title,index)=>({code:`${id}-S0${index+1}`,title,text:`${title}.`,stat,statName:labels[stat],min: 0,max:3}))}
    };
  }
  const events = [
    make('oath',1,['adolescent','adult','middle'],'종이 울리지 않는 밤','검은 비 속에서, 성문 밖의 마지막 불빛을 지킨다.',
      '검은 비가 내리던 날, 성벽의 종은 끝내 울리지 않았다. 문밖에 남은 사람들은 경보보다 먼저 달아난 종지기를 탓했다. {hero}는 불평하는 입보다 떨리는 손을 보았다. 한때 누군가의 손을 놓지 않았던 감각이 손바닥 안에서 되살아났다.\n\n성문을 닫으라는 명령이 위에서 떨어졌다. 수레 한 대가 진창에 박혀 있고, 그 뒤로 아직 작은 등불들이 이어진다. {hero}는 문틀 아래 굴러온 통나무를 세운다. 오늘 밤, 문이 닫히는 때만은 다른 사람이 정하게 둘 수 없었다.',
      'strength',7,'성문 아래의 마지막 통나무','피난민이 지날 동안 내려오는 문을 버틸 수 있을까?',
      '통나무가 갈라지는 소리 뒤로 마지막 수레바퀴가 문턱을 넘었다. 성문이 닫힌 뒤에도 사람들은 서로를 놓지 않았다. 젖은 옷자락에 묶인 작은 청동 방울 하나를 누군가 감사의 표시로 남겼다.',
      '문이 내려앉자 행렬은 둘로 끊겼다. 밖에 남은 이들은 둑길로 달아났고, 그 불빛 중 몇 개는 밤새 돌아오지 않았다. {hero}는 부러진 통나무 앞에서 손을 펴지 못했다.',
      ['문틀 사이에 받침을 깊이 밀어 넣는다','다른 사람들과 숨을 맞추어 무게를 버틴다']),
    make('oath',2,['adult','middle','mature','elder'],'닫힌 명령서의 봉인을 뜯는다','그날의 성문을 둘러싼 명령이 다시 사람들을 가른다.',
      '시간이 흐른 뒤, {hero} 앞으로 같은 붉은 밀랍이 찍힌 명령서가 도착했다. 국경의 마을을 비우고, 늦는 사람은 기다리지 말라는 문장이 정갈했다. 잉크는 마르기 쉬웠지만 문밖의 얼굴은 지워지지 않았다.\n\n대장이 지도를 접으려 할 때 {hero}의 손이 종이 모서리를 누른다. 하천 아래 버려진 제분소를 거치면 행렬을 둘로 나눌 수 있다. 말뿐인 반항으로 끝나지 않으려면, 기다릴 수 있는 길을 먼저 찾아내야 했다.',
      'intuition',11,'지도에 없는 피난길','정찰대보다 먼저 돌아갈 길과 남을 길을 구별할 수 있을까?',
      '제분소의 마른 수로가 피난로가 되었다. 앞서 떠난 수레와 뒤늦은 사람들이 강 건너에서 다시 만났다. 명령서 뒷면에는 버려진 사람이 아니라 도착한 사람의 이름이 적혔다.',
      '수로 끝은 오래전에 무너져 있었다. 피난민들을 되돌리는 동안 말 탄 추격대가 능선을 넘었다. 짐을 버리고 살아 나온 사람들의 침묵을, {hero}는 승리라고 부를 수 없었다.',
      ['폐수로의 물때와 발자국을 대조한다','갈림길마다 돌아올 표식을 남긴다']),
    make('oath',3,['middle','mature','elder'],'깃발 아래에 이름을 남긴다','오래된 선택을 안고, 또 한 번 피난 행렬 앞에 선다.',
      '흰 깃발을 든 사람들이 오래된 성문 앞에 모였다. 이번에는 성벽을 지키는 병사가 아니라 집을 떠나온 사람들이 {hero}의 이름을 불렀다. 그들이 원하는 것은 승전보가 아니었다. 마지막 사람까지 길을 잃지 않는 약속이었다.\n\n곡식 수레와 다친 사람의 걸음이 서로 다른 속도로 움직인다. 어느 쪽도 버리지 않겠다는 말은 이제 많은 손을 빌려야 지킬 수 있는 말이 되었다. {hero}는 높은 말 위가 아니라 맨 뒤 수레 곁에서 사람들의 눈을 맞춘다.',
      'charm',14,'마지막 사람의 속도','두려움에 흩어지는 사람들을 한 행렬로 이끌 수 있을까?',
      '첫 수레가 멈추면 마지막 수레도 기다렸다. 강을 건넌 뒤 사람들은 깃발에 누구의 문장도 그리지 않았다. 대신 함께 도착한 이름들을 작은 글씨로 채웠다. {hero}의 이름도 그 많은 이름 사이에 남았다.',
      '행렬은 끝내 여러 갈래로 갈라졌다. 살아남은 사람들의 길목마다 {hero}는 물과 식량을 두고 돌아섰다. 모두를 이끌지는 못했어도, 흩어진 길을 잊지 않는 일이 남았다.',
      ['사람마다 감당할 수 있는 짐을 다시 나눈다','뒤처지는 이의 이야기를 앞선 이들에게 전한다']),
    make('archive',1,['adolescent','adult','middle'],'장부에서 지워진 이름을 발견한다','반듯한 기록 한가운데, 살아 있던 사람들의 빈칸이 남아 있다.',
      '오래된 서고의 장부에서 한 줄만 유난히 희었다. 긁어 낸 종이 위에 다른 해의 날짜가 덧씌워져 있었다. {hero}는 책장을 넘기지 않았다. 외웠던 별 하나가 지도에서 빠졌을 때처럼, 빈칸이 남은 문장보다 선명했다.\n\n서기 이셀은 폐광의 사람들은 모두 떠났다고 말했다. 그러나 물품 장부에는 그 뒤로도 식량이 들어갔다. 누군가가 사라진 사람들의 몫을 받아 갔거나, 사라진 사람들이 아직 그곳에 있거나. {hero}는 등잔을 더 가까이 끌어왔다.',
      'knowledge',7,'긁어 낸 장부의 날짜','서로 어긋난 기록에서 사라진 사람들의 행방을 찾을 수 있을까?',
      '옛 달력의 윤달을 맞추자 식량이 보내진 날짜가 이어졌다. 폐광 사람들은 비밀 징발에 끌려간 것이었다. 이셀은 말없이 장부의 사본을 묶었다. 이제 빈칸에는 찾아야 할 이름이 생겼다.',
      '종이를 적시자 덧씌운 잉크와 남은 흔적이 함께 번졌다. 사라진 사람들의 행방은 알아내지 못했다. 이셀은 젖은 장부를 덮지 않고 말렸다. 빈칸조차 누군가가 남긴 증거일 수 있었다.',
      ['운송 장부와 옛 달력의 날짜를 맞춘다','남은 글자의 획을 빛에 비추어 옮긴다']),
    make('archive',2,['adult','middle','mature','elder'],'서고의 불빛이 꺼지기 전에','검은 밀랍을 찍은 손이 기록을 회수하러 온다.',
      '이셀이 보낸 편지에는 인사보다 먼저 잉크 번진 손자국이 찍혀 있었다. 서고를 비우라는 명령이 내려왔고, 옛 장부들은 새벽에 태워질 예정이었다. {hero}가 도착했을 때 창문 틈으로 종이가 타는 냄새가 새어 나왔다.\n\n안뜰에는 문지기가, 지붕 아래에는 가벼운 환기창이 있었다. 모든 책을 들고 나올 수는 없었다. 그러나 한 권을 포기하는 것과 누군가가 지웠던 삶을 다시 지우는 것은 같은 일이 아니었다.',
      'agility',11,'재 속에서 건질 페이지','붕괴하는 서고에서 증거를 담은 기록을 꺼낼 수 있을까?',
      '외투 안에 넣은 종이 가장자리는 검게 탔지만 이름들은 읽을 수 있었다. 이셀은 살아 나온 {hero}의 손에서 책보다 먼저 피 묻은 유리 조각을 떼어 냈다. 두 사람은 새벽이 밝을 때까지 살아남은 페이지를 말렸다.',
      '지붕이 내려앉자 더 들어갈 수 없었다. 이셀과 {hero}는 담장 밖으로 물러서서 서고가 무너지는 모습을 보았다. 살아남은 것은 몇 장의 사본과, 두 사람이 같은 문장을 읽었다는 기억뿐이었다.',
      ['무너지지 않은 창틀에 밧줄을 건다','연기가 옅어지는 틈에 짧게 움직인다']),
    {
      id:idFor('archive',3),arc:'archive',step:3,stages:['middle','mature','elder'],heroic:true,chronicle:true,relationship:true,
      title:'빈 책상에 두 잔의 차를 놓는다',text:'오래된 기록을 나누던 이셀이, 기록에 없는 이야기를 건넨다.',weight:['study','truth','bond'],
      story:'작은 서고의 창은 예전보다 낮았다. 이셀은 그을린 책장 하나를 버리지 않고 새 책상 옆에 세워 두었다. {hero}가 들어서자 그는 차를 두 잔 따라 놓고 오랫동안 비워 둔 의자를 당겼다.\n\n“우리가 적지 못한 건 무엇이었을까요.” 질문은 장부의 날짜에서 시작해 그날의 망설임으로 옮겨 갔다. 이번에는 풀어야 할 봉인도, 쫓아오는 발소리도 없었다. 남은 것은 두 사람이 어디까지 서로의 문장을 이해할 수 있는가 하는 일뿐이었다.'
    },
    make('lantern',1,['adolescent','adult','middle'],'강가에 돌아올 불을 켠다','안개 너머의 짖는 소리에, 작은 등불 하나를 들고 나선다.',
      '강가의 빈 집에서 개 짖는 소리가 들렸다. 낮에는 아무도 없던 곳이었다. {hero}는 그 소리를 뒤로한 채 몇 걸음이나 걸어갔다가 다시 돌아섰다. 작은 생명의 체온을 손에 느껴 본 사람에게, 들은 소리를 듣지 않은 척하는 일은 쉽지 않았다.\n\n물에 잠긴 마루 끝에서 개 한 마리가 목줄에 걸려 있었다. 허리까지 찬 안개 때문에 돌아갈 둑길도 잘 보이지 않았다. {hero}는 기둥에 등불을 매달았다. 저 불만 놓치지 않으면, 둘이 돌아올 수 있을 것 같았다.',
      'agility',7,'안개 아래 잠긴 마루','목줄을 풀고 꺼지기 전의 등불로 돌아갈 수 있을까?',
      '끊어진 목줄이 손에 남고 젖은 몸 하나가 품으로 뛰어들었다. 강둑에 닿자 개는 도망가지 않고 {hero}의 발등에 턱을 얹었다. 이름을 묻는 사람에게 {hero}는 잠시 생각하다 누리라고 답했다.',
      '썩은 마루가 먼저 가라앉았다. 물살에서 벗어났을 때 손에는 끊어진 목줄만 남아 있었다. {hero}는 강둑의 등불을 바로 끄지 못했다. 돌아오지 않는 소리를 기다리는 동안 밤이 깊었다.',
      ['떠오른 널빤지에 몸의 무게를 나눈다','등불을 기준으로 되돌아올 길을 확인한다']),
    make('lantern',2,['adult','middle','mature','elder'],'안개 속에 길의 표식을 세운다','한 생명을 부르던 불빛이, 길 잃은 사람들의 표식이 된다.',
      '강가에 안개가 내릴 때면 {hero}는 기둥의 불을 확인했다. 처음에는 이유를 묻던 나그네들이 어느새 그 불을 보며 강을 건넜다. 그러던 날, 상류의 둑이 무너졌다는 소식과 함께 피난 수레들이 몰려왔다.\n\n낡은 나루터 쪽으로 가면 빠르지만 물결이 평소와 달랐다. 갈대 사이에서 돌아 나오는 바람이 작은 불을 같은 방향으로 눕혔다. {hero}는 첫 수레를 세우고, 눈에 보이지 않는 강바닥의 길을 가늠했다.',
      'intuition',11,'물 위에 남은 안전한 길','불빛과 갈대의 움직임으로 수레가 건널 얕은 곳을 찾을 수 있을까?',
      '수레바퀴가 자갈밭에 닿자 뒤따르던 사람들이 처음으로 말을 하기 시작했다. 누군가는 건너편에도 같은 등불을 걸었다. 저녁이면 강 양쪽의 불이 서로를 확인하듯 켜졌다.',
      '얕아 보인 곳에서 물살이 수레를 돌렸다. 사람들은 짐을 버리고 서로를 잡아당겨 강둑으로 올라왔다. 등불 아래 쌓인 빈 손을 보며 {hero}는 무사하다는 말만으로는 충분하지 않음을 알았다.',
      ['갈대와 떠내려오는 가지의 방향을 살핀다','밧줄을 잡고 단단한 바닥을 짧게 짚어 본다']),
    make('lantern',3,['middle','mature','elder'],'누군가 돌아올 집을 짓는다','길을 비추던 등불 아래, 머물 곳이 없는 이들을 위한 지붕을 올린다.',
      '등불 아래 머무는 사람들이 해마다 달라졌다. 전쟁에서 돌아오는 이, 장사를 접은 이, 아무 데도 돌아갈 곳이 없다는 이. {hero}는 그들에게 이유를 먼저 묻지 않는 법을 배웠다. 비가 내리는 밤이면 좁은 처마부터 내주었다.\n\n이제 기둥 몇 개를 더 세우면 젖지 않고 아침을 맞을 자리가 생긴다. 오래된 손에는 망치가 전보다 무거웠다. 그래도 첫 기둥이 서기 전까지는 등불을 옮길 수 없었다. 아직 길에서 그 불을 찾는 사람이 있을 터였다.',
      'strength',14,'등불을 매달 마지막 기둥','폭우가 오기 전에 지친 사람들을 맞을 지붕을 세울 수 있을까?',
      '새 지붕 아래서 비가 다른 소리를 냈다. 찾아온 사람들은 각자의 길을 이야기했고, 아무 이야기도 하지 않는 사람에게도 따뜻한 그릇이 놓였다. 등불은 이제 길뿐 아니라 머물 자리를 가리켰다.',
      '기둥은 밤이 오기 전에 서지 못했다. {hero}는 자기 자리를 비워 젖은 사람들을 들였다. 완성되지 않은 집 밖에서도 등불은 꺼지지 않았다. 다음 날에는 더 많은 손이 기둥을 잡았다.',
      ['기둥을 받칠 돌부터 단단히 다진다','지나온 사람들과 힘을 모아 들보를 올린다']),
    make('demon',1,['adolescent','adult'],'밤이 낮의 길이를 삼킨다','한낮에 길어진 그림자가 주인보다 먼저 성채 쪽으로 향한다.',
      '장터의 해시계가 아침으로 되돌아갔다. 사람들은 망가진 물건이라며 웃었지만, 그 옆을 지나던 새의 그림자는 서쪽이 아닌 산 위의 폐성으로 날아갔다. {hero}의 그림자도 발끝에서 조금 떨어져 있었다. 한 걸음 물러나자 그것이 뒤늦게 따라왔다.\n\n그날 저녁 돌아온 역참의 말에는 기수가 없었다. 안장에 묶인 천 조각에는 이름 대신 일곱 개의 검은 고리가 그려져 있었다. 어둠을 보고도 문을 닫을 수 있었던 사람들은 집으로 돌아갔다. {hero}는 아무도 가져가지 않은 천 조각을 펼쳤다.',
      'intuition',8,'주인 없는 그림자의 흔적','사라지는 햇빛과 검은 고리가 가리키는 장소를 알아낼 수 있을까?',
      '천 조각을 빛에 비추자 일곱 고리가 폐성의 우물과 겹쳤다. 우물 안에서는 누군가 왕의 이름을 부르고 있었다. {hero}는 돌아오는 길에 검은 돌 하나를 주웠다. 돌은 새벽이 와도 차가워지지 않았다.',
      '천 조각의 기호는 끝내 길이 되지 못했다. 며칠 뒤 산 아래 마을에서 정오의 종이 끊겼다. 사람들은 그 어둠을 밤을 삼키는 왕이라 불렀다. {hero}는 늦게나마 이름을 얻은 두려움을 가슴에 남겼다.',
      ['그림자가 어긋나는 순간을 기억한다','천의 기호를 산등성이와 겹쳐 본다']),
    make('demon',2,['adult','middle','mature'],'왕의 이름을 지운 성채로 간다','어둠을 쓰러뜨릴 칼보다 먼저, 묻혀 있던 진짜 이름을 찾는다.',
      '몇 번의 계절이 흐르는 동안 폐성 주위에는 새가 둥지를 틀지 않았다. 어둠은 산을 넘지 않았지만, 산을 넘은 사람들이 돌아오지 않았다. {hero}는 오래된 지도 가장자리에 남겨 두었던 표시를 손끝으로 더듬었다.\n\n성채의 문에는 왕의 승리가 아니라 왕을 잊으라는 명령이 새겨져 있었다. 이름을 빼앗긴 존재는 어떤 상처도 자기 것으로 받아들이지 않는다고 했다. 폐허 속의 조각들을 잇는 일은 무기를 벼리는 일과 다르지 않았다. 누군가 싸워야 하는 날이 오기 전에, 상처를 입힐 이름부터 되찾아야 했다.',
      'knowledge',13,'지워진 일곱 글자','흩어진 왕의 이름을 읽어 마지막 봉인의 조건을 알아낼 수 있을까?',
      '일곱 글자를 맞추자 벽의 그림자가 처음으로 흔들렸다. 왕에게 이름이 있었다. {hero}는 그 이름과 봉인의 순서를 천 안쪽에 적고 성채를 빠져나왔다. 다가올 밤은 막지 못했지만 밤에도 끝을 만들 수 있었다.',
      '마지막 글자를 읽기도 전에 벽이 무너졌다. 불완전한 이름을 품고 성채를 빠져나왔을 때 하늘 한쪽이 먹물처럼 번지고 있었다. 이제 준비되지 않았다는 이유로 싸움을 미룰 수는 없었다.',
      ['서로 다른 시대의 비문을 순서대로 맞춘다','지워진 글자의 뜻을 남은 문장에서 찾는다']),
    make('demon',3,['middle','mature','elder'],'밤을 삼키는 왕이 내려온다','왕의 그림자가 성벽을 넘는 밤, 한 사람의 삶이 세상의 길목에 선다.',
      '별이 하나씩 사라졌다. 구름은 없었다. 밤을 삼키는 왕이 산에서 내려올 때 발소리는 들리지 않았고, 성문 앞의 사람들은 자기 이름을 잊기 시작했다. {hero}는 오래 품어 온 천을 손목에 묶었다. 지나온 날들을 지워지는 쪽에 두고 싶지 않았다.\n\n봉인은 눈앞의 어둠을 밀어 넣은 뒤에야 닫힐 수 있었다. 누군가는 그 문턱에서 왕의 무게를 받아야 했다. 보이지 않는 신이 무엇을 바랐든, 지금 성벽 아래 서 있는 것은 늙어 가는 한 사람의 몸이었다. {hero}는 뒤쪽에서 부르는 목소리를 듣고 발을 한 뼘 더 앞으로 옮겼다.',
      'strength',23,'왕을 돌려보낼 마지막 문턱','어둠을 봉인의 안쪽으로 밀어 세상에 새벽을 돌려줄 수 있을까?',
      '문턱 너머에서 일곱 고리가 닫혔다. 무릎이 땅에 닿았을 때 {hero}는 사람들의 이름이 다시 들리는 것을 알았다. 새벽은 승리의 함성보다 먼저 왔다. 살아남은 사람들은 그 빛 속에서 서로가 아직 여기 있음을 확인했다.',
      '봉인은 왕의 무게를 견디지 못했다. {hero}를 끌어낸 사람들이 뒤돌아보았을 때 성채도 성벽도 같은 어둠에 잠겨 있었다. 살아남았다는 말 뒤에는 돌아갈 수 없다는 말이 붙었다. 그날부터 지도의 한쪽에는 해가 뜨지 않았다.',
      ['남은 봉인석을 어둠의 가장자리에 세운다','갈라지는 문턱을 몸과 지렛대로 밀어 붙인다'])
  ];
  const demonCrisis=events.find(card=>card.id===idFor('demon',3));
  Object.assign(demonCrisis,{catastrophe:true,storyCrisis:true,stakes:{kind:'demon',name:'밤을 삼키는 왕',chronicle:'demon',previous:'왕의 이름을 지운 성채로 간다'}});
  demonCrisis.trial.base=3;
  const byId = new Map(events.map(card=>[card.id,card]));
  function eligible(card,s) {
    if (!card.chronicle) return true;
    const source=byId.get(card.id);
    if (!source || !source.stages.includes(stageOf(s))) return false;
    const m=peek(s);
    if (m.outcomes[card.id] || s.usedProgress?.includes(card.id)) return false;
    if (source.step>1) return Boolean(m.outcomes[idFor(source.arc,source.step-1)]);
    const info=arcInfo[source.arc];
    if (info.probabilistic) return m.demonEligible===true;
    return (s.traits||[]).some(t=>t.name===info.trait) &&
      (s.wills||[]).some(w=>w.tags?.includes(info.willTag)) &&
      info.seeds.some(seed=>(s.milestones||[]).includes(seed));
  }
  function materialize(card,s) {
    const result=structuredClone(card);
    if (!card.chronicle) return result;
    if (result.trial) for (const key of ['success','failure']) result.trial[key]=heroText(result.trial[key],s);
    const prior=peek(s).outcomes[idFor(card.arc,card.step-1)];
    if (prior) {
      result.precedent={id:idFor(card.arc,card.step-1),success:prior.success};
      result.branch=prior.success?'honoured-memory':'unhealed-memory';
      const paragraphs = {
        'oath-2':prior.success?'성문 아래서 구한 사람들이 명령서의 봉인을 알아보았다. 그중 한 사람이 청동 방울을 쥐여 주었다. 이번에도 뒤처진 발소리를 들어 달라는 말 대신이었다.':'그날 돌아오지 못한 등불들의 수를 {hero}는 아직 기억했다. 이번 명령서에도 뒤처지는 사람을 기다리지 말라는 글자가 있었다. 같은 문장을 두 번 따를 수는 없었다.',
        'oath-3':prior.success?'마른 수로를 따라 함께 돌아온 사람들이 먼저 깃발 아래 섰다. 그들은 {hero}를 흠 없는 영웅이라 부르지 않았다. 기다려 준 사람이라 불렀다.':'피난길에서 짐을 잃었던 사람들이 깃발을 멀리서 바라보았다. {hero}는 앞선 실패를 변명하지 않고 빈 수레부터 끌어왔다. 믿음은 부탁하기 전에 다시 쌓아야 했다.',
        'archive-2':prior.success?'장부에서 되찾은 이름들은 아직 누구의 입에서도 공개되지 않았다. 그 이름을 기다릴 사람이 있다는 사실만으로도 {hero}가 서고를 향할 이유는 충분했다.':'번진 장부에서는 끝내 이름을 읽어 내지 못했다. 이셀이 지키던 운송표가 마지막 실마리였다. 불이 그것마저 삼키기 전에 손을 뻗어야 했다.',
        'archive-3':prior.success?'책상 한쪽에는 불 속에서 꺼낸 장부가 펼쳐져 있었다. 그 이름을 찾으러 온 사람들이 남긴 답장이 책보다 두꺼워졌다.':'새 책장의 첫 칸은 비어 있었다. 불에 탄 기록을 모두 되찾지는 못했지만, 이셀은 누군가가 다시 찾아올 때 빈자리를 숨기지 않기로 했다.',
        'lantern-2':prior.success?'강바람이 달라질 때마다 누리가 낮게 짖던 모습을 {hero}는 기억했다. 그 작은 생명이 알려 주었던 버릇을 떠올리며 갈대밭을 살폈다. 구해 낸 온기가 시간이 흘러도 시선을 돌려주고 있었다.':'오래전 건져 낸 빈 목줄은 등불 기둥 안쪽에 걸려 있었다. 그날의 짖는 소리는 돌아오지 않았다. {hero}는 오늘 들리는 사람의 목소리만큼은 물에 잃지 않으려 했다.',
        'lantern-3':prior.success?'강 양쪽에서 등불을 밝혔던 사람들이 목재를 들고 찾아왔다. 한때 길을 건넌 사람이 이제 다른 이가 머물 자리를 만들고 있었다.':'강에서 잃어버린 짐을 아직 찾는 사람들이 있었다. {hero}는 안전할 것이라는 약속 대신 밤을 함께 지새울 자리를 내밀고 싶었다.',
        'demon-2':prior.success?'처음 그 우물을 찾았을 때 주웠던 검은 돌은 아직 손 안에서 미지근했다. {hero}는 돌을 지도 위에 놓고 오래전 닿았던 길을 다시 짚었다.':'처음 어긋난 그림자를 보았을 때는 아무것도 알아내지 못했다. 지도 위 검게 지워진 마을이 늘어날 때마다, {hero}는 펼치지 못한 천 조각을 다시 꺼냈다.',
        'demon-3':prior.success?'손목의 천에는 되찾은 일곱 글자가 남아 있었다. {hero}가 이름을 부르자 검은 왕관에 금이 갔다. 오랜 준비가 지금, 어둠의 무게를 조금 덜어 주었다.':'손목에 묶인 이름은 끝내 한 글자가 비어 있었다. {hero}는 그 빈칸을 숨기지 않았다. 불완전한 봉인이 버틸 만큼 더 버티는 것, 남은 길은 그것뿐이었다.'
      };
      result.story=`${paragraphs[`${card.arc}-${card.step}`]}\n\n${result.story}`;
      if (card.arc==='demon' && card.step===3) {
        result.trial.threshold=prior.success?19:23;
        result.stakes.prepared=prior.success;
      }
      if (card.arc==='lantern' && card.step===3) {
        // The dog is never resurrected or assumed alive decades later.
        result.story += '\n\n첫 등불을 켠 밤은 멀어졌지만, 그 밤에 놓지 못했던 마음은 기둥의 오래된 못자리처럼 남아 있었다.';
      }
    }
    return result;
  }
  function next(s) {
    init(s);
    const choices=events.filter(card=>eligible(card,s));
    const selected=choices.find(card=>card.arc==='demon'&&card.step>1) || choices.find(card=>card.step>1) || choices.find(card=>card.arc==='demon') || choices.find(card=>card.step===1);
    return selected?materialize(selected,s):null;
  }
  function remember(card,success,s) {
    const source=byId.get(card.id);
    if (!source || typeof success!=='boolean') return false;
    const m=memory(s);
    if (m.outcomes[card.id]) return false;
    if (source.step>1 && !m.outcomes[idFor(source.arc,source.step-1)]) return false;
    if (!source.stages.includes(stageOf(s))) return false;
    if (source.step===1) {
      const info=arcInfo[source.arc];
      if (info.probabilistic ? m.demonEligible!==true : (!(s.traits||[]).some(t=>t.name===info.trait) || !(s.wills||[]).some(w=>w.tags?.includes(info.willTag)) || !info.seeds.some(seed=>(s.milestones||[]).includes(seed)))) return false;
    }
    m.outcomes[card.id]={success,stage:stageOf(s),title:source.title};
    m.arcs[source.arc]={step:source.step,complete:source.step===3,lastSuccess:success,name:arcInfo[source.arc].name};
    s.world.flags ||= []; s.milestones ||= [];
    add(s.world.flags,`chronicle:${source.arc}:${source.step}:${success?'success':'failure'}`);
    add(s.milestones,`연대기 · ${source.title} · ${success?'지켜 낸 기억':'남겨진 흔적'}`);
    if (source.step===3) add(s.world.flags,`chronicle:${source.arc}:${success?'fulfilled':'scarred'}`);
    if (source.arc==='demon') {
      if (source.step===1) add(s.world.flags,'demon-awakened');
      if (source.step===2) add(s.world.flags,success?'demon-seal-prepared':'demon-seal-broken');
      if (source.step===3) add(s.world.flags,success?'demon-sealed':'demon-victorious');
    }
    return true;
  }
  function resolveRelationship(card,s) {
    if (card.id!==idFor('archive',3)) return null;
    const existing=peek(s).outcomes[card.id];
    if (existing?.result) return structuredClone(existing.result);
    if (!peek(s).outcomes[idFor('archive',2)]) return null;
    const close=(s.stats?.knowledge||0)>=12;
    const result={
      title:close?'기록 너머의 벗':'서로에게 남겨 둔 여백',
      text:close?'두 사람의 말은 오래된 달력에서 시작해 잊히는 사람들의 이름으로 이어졌다. 이셀이 문득 웃으며 말했다. “당신 앞에서는 내가 모르는 것도 말할 수 있군요.” {hero}가 떠날 때, 서고의 여분 열쇠가 찻잔 옆에 놓여 있었다. 다음에는 할 일이 없어도 와 달라는 뜻이었다.':'이셀이 오래된 표기의 뜻을 설명하는 동안 {hero}는 차가 식는 것을 바라보았다. 질문은 몇 번이나 문턱에서 멎었고, 이셀도 더 깊은 이야기는 꺼내지 않았다. 헤어지는 인사는 따뜻했지만 두 번째 찻잔이 다시 놓일 약속까지 이어지지는 않았다.',
      effect:`이셀과 ${close?'벗':'지인'} · 현재 지식으로 이어진 대화 · 시련 없음`
    };
    result.text=heroText(result.text,s);
    if (!remember(card,close,s)) return null;
    s.relationships ||= [];
    s.relationships=s.relationships.filter(x=>!x.endsWith(' · 서기 이셀'));
    add(s.relationships,`${close?'벗':'지인'} · 서기 이셀`);
    memory(s).outcomes[card.id].result=result;
    return structuredClone(result);
  }
  return {events,arcInfo,eligible,next,remember,materialize,resolveRelationship,memory,init};
})();
