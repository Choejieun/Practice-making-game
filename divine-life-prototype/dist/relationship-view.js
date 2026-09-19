window.relationshipView = (() => {
  function install(getState, onClose) {
    const $=id=>document.getElementById(id),dialog=$('relationshipDialog');
    let limit=6,selected=null,previousPositions=new Map();
    const node=(tag,text,className)=>{const e=document.createElement(tag);if(text!=null)e.textContent=text;if(className)e.className=className;return e;};
    function detail(person) {
      const box=$('relationshipDetail');box.replaceChildren();
      if(!person){box.append(node('h3','한 사람을 바라본다'),node('p','주변 인물을 누르면 영웅을 어떻게 생각하는지, 어떤 일이 관계에 남았는지 볼 수 있습니다.'));return;}
      box.append(node('small',person.description),node('h3',person.name),node('p',window.relationshipRules.label(person),'relationship-standing'),node('blockquote',person.thought));
      box.append(node('p',person.dead?'이 인연의 기록은 남지만, 새로운 평판은 생기지 않습니다.':`개인 평판 ${person.score > 0 ? '+' : ''}${person.score} · ${window.relationshipRules.difficulty(getState(),person.name) ? '쌓인 불신으로 다음 대화에서 더 깊은 이해가 필요합니다.' : '이 사람과 쌓아 온 신뢰의 기록입니다.'}`));
      const list=node('ol');
      for(const entry of [...person.history].reverse()){
        const item=node('li');item.append(node('strong',entry.title),node('small',`${entry.kind} · ${entry.success?'함께 남긴 성취':'남겨진 실패'} · 평판 ${entry.delta>0?'+':''}${entry.delta}`),node('p',entry.thought));list.append(item);
      }
      if(!person.history.length)list.append(node('li','아직 이 관계에 남은 사건은 없습니다.'));
      box.append(list);
    }
    function render() {
      if(!dialog.open)return;
      const s=getState(),all=window.relationshipRules.snapshot(s).sort((a,b)=>Number(b.family)-Number(a.family)||a.name.localeCompare(b.name,'ko'));
      const people=all.slice(0,limit),canvas=$('relationshipCanvas'),nodes=$('relationshipNodes'),svg=$('relationshipLines');
      const width=canvas.clientWidth,height=Math.max(510,people.length*62);
      canvas.style.height=height+'px';svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.replaceChildren();nodes.replaceChildren();
      const cx=width/2,cy=height/2,positions=new Map(),ns='http://www.w3.org/2000/svg';
      const shape=(tag,attrs,text)=>{const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text)e.textContent=text;svg.append(e);return e;};
      const defs=shape('defs',{}),marker=document.createElementNS(ns,'marker');for(const[k,v]of Object.entries({id:'relationArrow',viewBox:'0 0 10 10',refX:8,refY:5,markerWidth:5,markerHeight:5,orient:'auto-start-reverse'}))marker.setAttribute(k,v);const arrow=document.createElementNS(ns,'path');arrow.setAttribute('d','M 0 0 L 10 5 L 0 10 z');arrow.setAttribute('fill','#97805a');marker.append(arrow);defs.append(marker);
      const central=node('div',null,'relationship-hero');central.style.left=cx+'px';central.style.top=cy+'px';
      const portrait=node('img');portrait.src=$('hudPortrait').src;portrait.alt='영웅의 초상';central.append(portrait,node('strong',s.name),node('small','당신의 영웅'));nodes.append(central);
      people.forEach((person,index)=>{
        // A single perimeter with unique angles: no outer person hides behind an inner person.
        const angle=(people.length<=6?[-150,150,-90,-30,30,90][index]:150+index*360/people.length)*Math.PI/180;
        const radiusX=Math.max(70,width/2-86),radiusY=height/2-70;
        const x=cx+Math.cos(angle)*radiusX,y=cy+Math.sin(angle)*radiusY;positions.set(person.name,{x,y});
        const distance=Math.hypot(x-cx,y-cy),endX=cx+(x-cx)*55/distance,endY=cy+(y-cy)*55/distance;
        const bend=10,controlX=(x+endX)/2-Math.sin(angle)*bend,controlY=(y+endY)/2+Math.cos(angle)*bend;
        shape('path',{d:`M ${x} ${y} Q ${controlX} ${controlY} ${endX} ${endY}`,fill:'none',class:person.dead?'relation-line departed':person.score<0?'relation-line strained':'relation-line','marker-end':'url(#relationArrow)'});
        const label=person.dead?'남겨진 기억':person.score<0?'걱정 · 실망':person.score>0?'믿고 있어':person.family?'지켜볼게':'알아가는 중';
        shape('text',{x:cx+(x-cx)*.55,y:cy+(y-cy)*.55-8,'text-anchor':'middle',class:'relation-line-label'},label);
        const button=node('button',null,'relationship-node'+(person.dead?' departed':person.score<0?' strained':''));button.type='button';button.style.left=x+'px';button.style.top=y+'px';button.setAttribute('aria-label',`${person.name}, ${person.description}, ${window.relationshipRules.label(person)}`);
        button.append(node('strong',person.name),node('small',person.dead?'남겨진 인연':person.description.replace(/^영웅의 /,'')));
        button.addEventListener('click',()=>{selected=person.name;for(const b of nodes.querySelectorAll('button'))b.classList.remove('selected');button.classList.add('selected');detail(person);});
        if(selected===person.name)button.classList.add('selected');nodes.append(button);
        const previous=previousPositions.get(person.name);
        if(previous && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)button.animate([{translate:`${previous.x-x}px ${previous.y-y}px`},{translate:'0 0'}],{duration:650,easing:'cubic-bezier(.22,.76,.2,1)'});
      });
      for(const edge of window.relationshipRules.familyEdges(s)){
        const a=positions.get(edge.from),b=positions.get(edge.to);if(!a||!b)continue;
        shape('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:'relation-family-line'});
        shape('text',{x:(a.x+b.x)/2-12,y:(a.y+b.y)/2,'text-anchor':'end',class:'relation-line-label'},edge.label);
      }
      $('relationshipCount').textContent=`드러난 인연 ${people.length} / ${all.length} · 선의 화살표는 영웅을 향한 마음입니다.`;
      $('expandRelationships').hidden=people.length>=all.length;
      $('collapseRelationships').hidden=limit<=6;
      if(!people.length)nodes.append(node('p','아직 이름을 나눈 인연이 없습니다. 새로운 만남이 이 지도를 채웁니다.','relationship-empty'));
      detail(people.find(p=>p.name===selected));
      previousPositions=positions;
    }
    for(const button of document.querySelectorAll('[data-relationship-map]'))button.addEventListener('click',()=>{limit=6;selected=null;if(!dialog.open)dialog.showModal();render();});
    $('expandRelationships').addEventListener('click',()=>{limit+=6;render();});
    $('collapseRelationships').addEventListener('click',()=>{limit=6;selected=null;render();});
    $('closeRelationships').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',onClose);
    new ResizeObserver(()=>{if(dialog.open)render();}).observe($('relationshipCanvas'));
  }
  return {install};
})();
