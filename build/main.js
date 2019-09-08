const e=e=>document.querySelector(e),o=e=>document.querySelectorAll(e),a=(e,o,a)=>e.addEventListener(o,a),n=(e,o,a)=>{const n=document.createElement(e);return n.classList.add(o),n.innerHTML=a,n},t=(o,n,s,r)=>{if(e(`.log#${r} .new`))return void setTimeout(()=>t(o,n,s,r),500);const i=document.createElement("p");i.innerHTML=`<span class="icon">${s}</span><span class="${n}">${o}</span>`,n&&i.classList.add(n),i.classList.add("new"),e(`.log#${r}`).prepend(i),"restart"===n&&a(i,"click",k),setTimeout(()=>{i.classList.remove("new")},200)},s=o=>{e(o).style.visibility="visible"},r=o=>{e(o).classList.remove("hidden")},i=o=>{e(o).classList.add("hidden")},l=o=>{e(o).style.visibility="hidden"},d=o=>{s(`#${o}`),e("body").classList.add("blured")},c=o=>{e(`#${o}`).classList.add("closed"),e("body").classList.remove("blured")},p=e=>{let o=0,a=0,n=null;for(o=e.length-1;o>0;o-=1)a=Math.floor(Math.random()*(o+1)),n=e[o],e[o]=e[a],e[a]=n;return e};let u=[];const h=(e,o)=>{u.push(setTimeout(e,o))};let f=[];const g=(e,o)=>{f.push(setInterval(e,o))},m=()=>{u.forEach(clearTimeout),u=[],f.forEach(clearInterval),f=[],clearInterval(ye),clearInterval(ve)},b=()=>{m(),document.body.style.setProperty("--v","0"),o(".actions button").forEach(e=>e.style.visibility="hidden"),o(".project").forEach(e=>e.remove()),e("#island").remove(),e("#main-image").append(D.cloneNode(!0)),o(".log").forEach(e=>e.innerHTML=""),e("#island").style.filter=null,l("#score-board"),s("#ship"),e("#ship").classList.remove("go"),e("#ship").classList.remove("new"),oe(),resetData()},y={foragers:0,foraging:0,hunters:0,hunting:0,loggers:0,wood:0},v=()=>{const a=(Z.getTime()-S.getTime())/864e5,n=e("#leave").disabled,t=o(".project.done").length,s=["Days taken",a,"Population saved",F,"Projects completed",t,"Went back to the sea?",n?"Yes":"No"];n&&(s.push("Survived wrath of god?"),s.push(z<=U?"Yes":"No"));const r=Math.ceil((25*F+7*t+(n?10:0))*(1-z)*(30/a));e("#score-board .modal .content").innerHTML=s.map(e=>`<span>${e}</span>`).join("")+`<p>Final Score</p><p>${r} pts</p>`,d("score-board")},w=(o,a,n,r)=>()=>{y[o]+=n,x();const i=Math.random()<r*W;i?(t(`Wild animals killed ${te().name} while ${"wood"==o?"logging":o}`,"red","💀","info"),P+=a-1,F-=1,M("population","red")):P+=a,he.weapons.unlocked||!i&&"hunting"!==o||(he.weapons.unlocked=!0,t("Hunters found dangerous animals; you need extra protection","blue","🛡","info"),M("projects","blink"),me("weapons")),!N&&V.food+y.foraging>80&&(s("#hunt"),M("hunt","blink"),N=!0,t("Animals were sighted far in the valleys, hunting may be possible.","blue","🏹","info")),"wood"===o&&(!he.carpentry.unlocked&&V.wood+y.wood>5&&(he.carpentry.unlocked=!0,t("Develop carpentry to process wood more efficiently","blue","🔨","info"),me("carpentry"),M("projects","blink")),R||(e("animate").beginElement(),R=!0,t("The crew rejoices the arrival of wood for cooking and heating.",null,"🔥","info"),O.push(()=>{V.wood>0&&(V.wood=Math.max(0,V.wood-2),he.carpentry.done||M("wood","red"))}))),de()};function k(){b(),$e()}const T={leave:()=>{t(`${F} people board the caravela and get ready for departure`,null,"⛵️","info"),e("#ship").classList.add("go"),e("#leave").disabled=!0,l("#fishTrail"),l("#boatTrail"),P=0,de(),m(),h(z>.2?()=>{t("A violent storm suddenly formed. The ship sank and there were no survivors.",null,"⛈","info"),F=0,de(),ke(),h(v,5e3)}:()=>{t("The journey back was long, but the weather was perfect.",null,"🌤","info"),t("Fim.",null,"🌅","info"),h(v,5e3)},7e3)},fetchWood:()=>{P-=1;const e=.6*X;h(w("wood",1,3,.03),e),y.loggers++,x(),de(),le(e,"ft",!0)},pray:()=>{P-=1,J=!0,h(()=>{P+=1,J=!1,z*=.7;const e=ne();t(`${e.name} is feeling envigorated after a day at the house of God. Praise the Lord!`,null,"✝️","info")},X)},forage:()=>{P-=1;const e=.4*X;h(w("foraging",1,H,0),e),y.foragers++,x(),de(),le(e,"ft",!0)},hunt:()=>{P-=2;const e=1.2*X;h(w("hunting",2,20,.1),e),y.hunters+=2,x(),de(),le(e,"huntTrail",!0)},restart:()=>{confirm("Restart current game?")&&k()}},$=()=>{o(".actions button").forEach(e=>{a(e,"click",T[e.id])}),a(e("#projects"),"click",()=>{ue.classList.toggle("closed"),e("#requirements").innerText=null}),a(e("#score-board button"),"click",k),a(e(".dismiss"),"click",()=>{c("score-board")})},j={wood:{r:"wood",e:"🌳"},foraging:{r:"food",e:"🌾"},hunting:{r:"food",e:"🏹"}},L=e=>{y[e]<1||(t(`+${y[e]}`,"green",j[e].e,"tasks"),V[j[e].r]+=y[e],y[e]=0,M(j[e].r,"green"))},x=()=>{clearInterval(Y),Y=setInterval(()=>{["foraging","hunting","wood"].forEach(L),y.foragers&&(t(`${y.foragers}👤 went foraging.`,null,"🌾","tasks"),y.foragers=0),y.hunters&&(t(`${y.hunters}👥 went hunting .`,null,"🏹","tasks"),y.hunters=0),y.loggers&&(t(`${y.loggers}👤 went logging.`,null,"🌳","tasks"),y.loggers=0),de()},G)},M=(o,a)=>{e(`#${o}`).classList.add(a),h(()=>{e(`#${o}`).classList.remove(a)},"no"===a?400:100)},q=()=>{let e=V.food-F;if(M("food","red"),e>=0)A=B,B=0,V.food=e;else{const o=Math.min(B,-e);o>0&&(t(`${re(se(o).map(e=>e.name))} died from starvation.`,"red","💀","info"),F-=o,P-=o,B=0,M("population","red"));const a=Math.min(A,-e);A=Math.min(F-a,-e),a>0?(B=a,t(`${a} are starving and can't work.`,"red","😔","info")):A>0&&t(`${ne().name} ${A>2?`and ${A-1} others are`:"is"} getting hungry`,null,"💭","info"),V.food=0}},I=e=>P-B>=e,_=()=>{if(ce(),q(),F<1)return t("Your population was decimated. <strong>Restart?<strong>","restart","☠️","info"),ke(),void de();O.forEach(e=>e()),de()},E=()=>{e("#island").classList.toggle("night")},S=new Date("1549/08/13");let D,V,F,P,A,B,C,H,N,R,W,G,Y,z,J,O,X,K=9990,Q=1,U=.2,Z=new Date(S);const resetData=()=>{V={wood:0,food:K},F=15,P=15,A=0,B=0,C=0,H=2,N=!1,R=!1,W=1,G=400,Y=null,z=1,J=!1,O=[],X=1e4,Z=new Date(S),D=e("#island").cloneNode(!0)},ee=p([["Abraão","👨🏻‍🦱"],["Simão","👨🏼‍🦱"],["João","👨🏻"],["Jacinto","🧔🏽"],["Paulo","👴🏼"],["Tiago","👦🏻"],["Isaías","🧑🏻"],["Henrique","👨🏼‍🦰"],["Tomás","🧓🏼"],["Amélia","👩🏼‍🦳"],["Camila","👩🏾‍🦱"],["Benedita","👩🏻‍🦱"],["Madalena","👩🏻"],["Teresa","👩🏼"],["Lúcia","👩🏼‍🦰"]]).reduce((o,a)=>{const t=n("div","icon",a[1]);return t.id=a[0],t.title=a[0],e(".people").append(t),o.push({name:a[0],alive:!0}),o},[]),oe=()=>{ee.map(o=>{o.alive=!0,e(`#${o.name}`).classList.remove("dead")})};let ae=0;const ne=()=>{const e=ee.filter(e=>e.alive);return e[Math.round(Math.random()*(e.length-1))]},te=()=>{ae++;const o=ne();return o.alive=!1,e(`#${o.name}`).classList.add("dead"),o},se=e=>{const o=[];for(let a=0;a<e;a++)o.push(te());return o},re=e=>{if(e.length<2)return e[0];const o=e.join(", "),a=o.lastIndexOf(",");return o.substr(0,a)+" and"+o.substr(a+1)};let ie=0;const le=(o,a,n)=>{const t=e(`#${a}`),s=n?t.cloneNode():t;let r=a;n&&(r="trail"+ ++ie,s.id=r,t.after(s)),setTimeout(()=>{const e=Math.round(t.getTotalLength());"huntTrail"==a?s.style.strokeDasharray=`0,${e}px,0.5,1,0.5,1,0.5,1,0.5,100%`:("ft"==a&&(s.style.transform=`scaleX(${1+.7*Math.random()-.2})`),s.style.strokeDasharray=`0,${e}px,${"boatTrail"==a?2:1}`)},100),setTimeout(()=>{s.style.strokeDasharray=null},o/2),n&&h(()=>{s&&s.remove()},o)},de=()=>{e("#wood .value").innerText=V.wood,e("#food .value").innerText=V.food,e("#population .value").innerText=F,e("#ready .value").innerText=Math.max(0,P-B),e("#starving .value").innerText=B,B<1?i("#starving"):r("#starving"),e("#fishers .value").innerText=C,C>1&&r("#fishers"),e("#forage").disabled=!I(1),e("#fetchWood").disabled=!I(1),e("#hunt").disabled=!I(2),e("#pray").disabled=!I(1)||J},ce=()=>{Z.setDate(Z.getDate()+1),e("#days .value").innerText=`${Z.getDate()} / ${Z.getMonth()+1} / ${Z.getFullYear()}`},pe=()=>{const o=e("#ss");o.removeAttribute("transform"),e("#sail").beginElement(),e("#sink").beginElement(),setTimeout(()=>{l("#ship"),o.transform.baseVal.appendItem(o.transform.baseVal.createSVGTransformFromMatrix(e("#island").createSVGMatrix())),o.transform.baseVal.appendItem(o.transform.baseVal.createSVGTransformFromMatrix(e("#island").createSVGMatrix())),o.transform.baseVal.getItem(1).setScale(-1,1),o.transform.baseVal.getItem(0).setTranslate(-20,0)},790*e("#sink").getSimpleDuration())},ue=e(".projects");let he;const fe=()=>{he={fishing:{emoji:"🎣",done:!1,unlocked:!0,cost:{wood:10,food:10,people:4,days:2},description:"Develop fishing tools (+3 food per day)",callback:()=>{t("Fishing preparations have been developed (+3 food per day).","blue","🎣","info"),s("#fh"),P-=1,C++,g(()=>{le(X/3,"fishTrail",!1)},X/3),O.push(()=>{V.food+=3,t("+3🍒","blue","🐟","tasks")})}},high_sea_fishing:{emoji:"🚣‍",done:!1,unlocked:!0,requires:["shipyard","fishing"],cost:{wood:25,food:10,people:5,days:5},description:"Build a fishing boat (+5 food per day).",callback:()=>{P-=1,C++,s("#boatTrail"),g(()=>{le(X/2,"boatTrail",!1)},X/2),O.push(()=>{V.food+=5,t("+5🍒","blue","🐟","tasks")})}},carpentry:{emoji:"🔨",done:!1,unlocked:!1,cost:{wood:10,food:10,people:4,days:2},description:"Recycle wood and build better buildings (+5 wood per day)",callback:()=>{t("Carpentry was perfected, new buildings are now available.","blue","🔨","info"),M("projects","blink"),me("shipyard"),me("spinning_wheel"),me("chapel"),O.push(()=>{V.wood+=5,M("wood","green"),t("+5🌳","blue","🔨","tasks")})}},weapons:{emoji:"🛡",done:!1,unlocked:!1,description:"Produce weapons and armor (-75% chance of animal attack deaths)",cost:{wood:50,food:15,people:4,days:2},callback:()=>{W*=.25}},spinning_wheel:{emoji:"🧶",done:!1,unlocked:!0,description:"Some foragers will start gathering fibers, spinning into thread, producing cloth. (-50% food from foraging)",cost:{wood:10,food:20,people:2,days:3},callback:()=>{t("Foragers have started producing cloth from fibers.","blue","🧶","info"),H-=1,e("#forage .return").innerText=H,M("foraging","blink"),ge()}},shipyard:{emoji:"⚓",done:!1,unlocked:!0,requires:["carpentry"],cost:{wood:100,food:10,people:5,days:7},description:"Build a shipyard where boats and ships can be built.",callback:()=>{t("The shipyard construction has finished!","blue","⚓","info"),s("#sy"),me("high_sea_fishing"),ge()}},caravela:{description:"Build a caravela and return home. Requires a shipyard, carpentry, textiles, as well as food for the trip.",emoji:"⛵️",done:!1,unlocked:!1,requires:["shipyard","spinning_wheel"],cost:{wood:100,food:200,people:10,days:8},callback:()=>{t("The Caravela construction is complete! Shall we?","green","🌊","info"),s("#ship"),e("#ship").classList.add("new"),e("#leave").disabled=!1,s("#leave")}},chapel:{description:"A place where people can gather to support, encorage and service each other.",requires:["carpentry"],emoji:"🙏",cost:{wood:20,food:20,people:3,days:3},callback:()=>{z-=.5,s("#pray"),s("#cp")}}}},ge=()=>{he.spinning_wheel.done&&he.shipyard.done&&(t("The caravela construction project is in sight!","green","🌊","info"),he.caravela.unlocked=!0)},me=e=>{const o=he[e],t=n("div","project",null);t.id=e,t.innerHTML=`<div class="icon">${o.emoji}</div>\n<div class="title caps">${e.replace(/_/g," ")}</div>\n<small class="description">${o.description}</small>\n<div class="cost">\n  ${o.cost.wood} 🌳  ${o.cost.food} 🍒  ${o.cost.people} 👫  ${o.cost.days} days ⏳\n</div>`,ue.append(t),a(t,"click",be(e))},be=o=>()=>{if(ue.classList.contains("closed"))return void ue.classList.remove("closed");const a=he[o];if(a.done)return;if("caravela"===o&&!a.unlocked){const a=he.caravela.requires.filter(e=>!he[e].done).map(e=>`[${e.replace(/_/g," ")}]`);if(a.length>0){M(o,"no");const n=`Construction of the new caravela requires ${a.join(" and ")}.`;return e("#requirements").innerText=n,void t(n,null,"❌","info")}}const n=["wood","food"].filter(e=>V[e]<a.cost[e]);if(n.length>0){M(o,"no");const a=`There is not enough ${n.join(" and ")} to start the ${o} project`;return e("#requirements").innerText=a,void t(a,null,"❌","info")}if(!I(a.cost.people)){if("caravela"!==o){const a=`Not enough people ready to start the ${o} project`;return e("#requirements").innerText=a,void t(a,null,"❌","info")}{const e=P-B,o=a.cost.people*a.cost.days,n=Math.ceil(o/e);t(`The Caravela contruction started, but with only ${e} people, it will take ${n} days.`,null,"⚒","info"),a.cost.people=e,a.cost.days=n}}V.wood-=a.cost.wood,V.food-=a.cost.food,P-=a.cost.people,a.done=!0;const s=e(`.project#${o}`),r=a.cost.days*X;s.style.transition=`height ${r}ms linear`,s.classList.add("in-progress"),ue.classList.add("closed"),h(()=>{s.classList.add("done"),s.classList.remove("in-progress"),s.style.transition=null,P+=a.cost.people,a.callback()},r)};let ye,ve;const we=()=>{clearInterval(ye),clearInterval(ve)},ke=()=>{clearInterval(ye),clearInterval(ve),e("#island").style.filter="brightness(.5) contrast(1.0) saturate(0)"},Te=()=>{ye=setInterval(_,X),ve=setInterval(E,X/2)},$e=()=>{resetData(),ce(),de(),c("intro"),pe(),setTimeout(()=>{document.body.style.setProperty("--v","1")},4e3),h(je,4e3)},je=()=>{resetData(),he={fishing:{emoji:"🎣",done:!1,unlocked:!0,cost:{wood:10,food:10,people:4,days:2},description:"Develop fishing tools (+3 food per day)",callback:()=>{t("Fishing preparations have been developed (+3 food per day).","blue","🎣","info"),s("#fh"),P-=1,C++,g(()=>{le(X/3,"fishTrail",!1)},X/3),O.push(()=>{V.food+=3,t("+3🍒","blue","🐟","tasks")})}},high_sea_fishing:{emoji:"🚣‍",done:!1,unlocked:!0,requires:["shipyard","fishing"],cost:{wood:25,food:10,people:5,days:5},description:"Build a fishing boat (+5 food per day).",callback:()=>{P-=1,C++,s("#boatTrail"),g(()=>{le(X/2,"boatTrail",!1)},X/2),O.push(()=>{V.food+=5,t("+5🍒","blue","🐟","tasks")})}},carpentry:{emoji:"🔨",done:!1,unlocked:!1,cost:{wood:10,food:10,people:4,days:2},description:"Recycle wood and build better buildings (+5 wood per day)",callback:()=>{t("Carpentry was perfected, new buildings are now available.","blue","🔨","info"),M("projects","blink"),me("shipyard"),me("spinning_wheel"),me("chapel"),O.push(()=>{V.wood+=5,M("wood","green"),t("+5🌳","blue","🔨","tasks")})}},weapons:{emoji:"🛡",done:!1,unlocked:!1,description:"Produce weapons and armor (-75% chance of animal attack deaths)",cost:{wood:50,food:15,people:4,days:2},callback:()=>{W*=.25}},spinning_wheel:{emoji:"🧶",done:!1,unlocked:!0,description:"Some foragers will start gathering fibers, spinning into thread, producing cloth. (-50% food from foraging)",cost:{wood:10,food:20,people:2,days:3},callback:()=>{t("Foragers have started producing cloth from fibers.","blue","🧶","info"),H-=1,e("#forage .return").innerText=H,M("foraging","blink"),ge()}},shipyard:{emoji:"⚓",done:!1,unlocked:!0,requires:["carpentry"],cost:{wood:100,food:10,people:5,days:7},description:"Build a shipyard where boats and ships can be built.",callback:()=>{t("The shipyard construction has finished!","blue","⚓","info"),s("#sy"),me("high_sea_fishing"),ge()}},caravela:{description:"Build a caravela and return home. Requires a shipyard, carpentry, textiles, as well as food for the trip.",emoji:"⛵️",done:!1,unlocked:!1,requires:["shipyard","spinning_wheel"],cost:{wood:100,food:200,people:10,days:8},callback:()=>{t("The Caravela construction is complete! Shall we?","green","🌊","info"),s("#ship"),e("#ship").classList.add("new"),e("#leave").disabled=!1,s("#leave")}},chapel:{description:"A place where people can gather to support, encorage and service each other.",requires:["carpentry"],emoji:"🙏",cost:{wood:20,food:20,people:3,days:3},callback:()=>{z-=.5,s("#pray"),s("#cp")}}},ce(),de(),ye=setInterval(_,X),ve=setInterval(E,X/2),me("caravela"),x(),t("People settled by the sea.",null,"⛺️","info"),h(()=>{t(`${ne().name} found good foraging grounds nearby.`,"blue","🌾","info"),s("#forage"),s("#restart"),M("forage","blink")},2e3),h(()=>{t(`${ne().name} made some rudimentary axes for logging`,"blue","🌳","info"),s("#fetchWood"),M("fetchWood","blink")},X),h(()=>{t("The river can provide you food if you develop fishing.","blue","🐟","info"),M("projects","blink"),me("fishing")},2*X)};a(e("#intro button"),"click",()=>{o(".actions button").forEach(e=>{a(e,"click",T[e.id])}),a(e("#projects"),"click",()=>{ue.classList.toggle("closed"),e("#requirements").innerText=null}),a(e("#score-board button"),"click",k),a(e(".dismiss"),"click",()=>{c("score-board")}),$e()}),document.monetization&&"started"===document.monetization.state&&(r("#coil"),U=.3,K=30);