var M=Object.defineProperty;var P=(r,t,e)=>t in r?M(r,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[t]=e;var h=(r,t,e)=>P(r,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function e(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(s){if(s.ep)return;s.ep=!0;const o=e(s);fetch(s.href,o)}})();const k="egz_save_",L={entry:"",look:"",items:[]};function v(r,t,e){return r==="together"?`${k}together_${t}_${e}`:`${k}solo_${e}`}class f{constructor(t,e,n){h(this,"state");h(this,"chapter");h(this,"mode");h(this,"roomToMovement");if(this.mode=t,this.chapter=n,this.roomToMovement=f.buildRoomToMovement(n),t==="solo"&&(!n.movements||n.movements.length===0))throw new Error(`Solo chapter "${n.id}" must declare movements.`);let s=e,o=n.starts[e]??Object.keys(n.rooms)[0],a=this.roomToMovement.get(o)??0;if(t==="solo"&&n.movements&&n.movements.length>0){const i=n.movements[0];a=0,o=i.rooms[0]??o,(i.mode==="dreamer"||i.mode==="reckoner")&&(s=i.mode)}this.state={side:s,chapterId:n.id,currentRoom:o,currentMovement:a,inventory:[],journal:[],flags:{},roomStates:{},completed:!1},this.markRoomVisited(this.state.currentRoom)}static buildRoomToMovement(t){const e=new Map;return t.movements&&t.movements.forEach((n,s)=>{for(const o of n.rooms)e.set(o,s)}),e}getCurrentMovement(){return this.chapter.movements?this.chapter.movements[this.state.currentMovement]??null:null}getMovementForRoom(t){const e=this.roomToMovement.get(t);return e===void 0?null:e}getRoom(t){const e=this.chapter.rooms[t];if(!e)throw new Error(`Room not found: ${t}`);return e}getCurrentRoom(){return this.getRoom(this.state.currentRoom)}getCurrentRenderMode(){if(this.mode==="together")return this.state.side;const t=this.getCurrentMovement();return(t==null?void 0:t.mode)??this.state.side}getPerspective(){const t=this.getCurrentRoom();return this.pickPerspective(t)}pickPerspective(t){const e=this.getCurrentRenderMode(),n=t[e];return n||(t.dreamer??t.reckoner??t.neutral??L)}allPerspectives(t){const e=[];return t.dreamer&&e.push(t.dreamer),t.reckoner&&e.push(t.reckoner),t.neutral&&e.push(t.neutral),e}getEffectiveText(t,e){if(t.conditions){for(const n of t.conditions)if(this.state.flags[n.flag]===n.value)return n.text}return t[e]}getEffectiveItems(t){var n;const e=((n=this.state.roomStates[this.state.currentRoom])==null?void 0:n.itemsRemoved)??[];return t.items.filter(s=>!e.includes(s.id))}navigate(t){var d;const n=this.getCurrentRoom().exits.find(u=>u.direction===t),s={roomChanged:!1,movementChanged:!1,previousMovement:this.getCurrentMovement(),currentMovement:this.getCurrentMovement()};if(!n)return{text:this.getCantGoText(t),...s};if(n.blockedBy&&!this.state.flags[n.blockedBy])return{text:n.blocked??"The way is blocked.",...s};const o=this.state.currentMovement,a=this.getCurrentMovement();this.state.currentRoom=n.roomId,this.markRoomVisited(n.roomId);const i=this.roomToMovement.get(n.roomId);let c=!1;if(i!==void 0&&i!==o&&(this.state.currentMovement=i,c=!0,this.mode==="solo")){const u=(d=this.chapter.movements)==null?void 0:d[i];((u==null?void 0:u.mode)==="dreamer"||(u==null?void 0:u.mode)==="reckoner")&&(this.state.side=u.mode)}const l=this.getPerspective();return{text:l.entry?`
${l.entry}
`:this.getEffectiveText(l,"entry"),roomChanged:!0,movementChanged:c,previousMovement:a,currentMovement:this.getCurrentMovement()}}getCantGoText(t){return`You can't go that way. There's ${{north:"a solid wall",south:"a solid wall",east:"a solid wall",west:"a solid wall"}[t]}.`}act(t,e){var a,i,c,l;const n=this.getPerspective(),s=this.getEffectiveItems(n);if(t==="look")return{text:this.getLookText(n,s)};if(!e)return{text:"Nothing to do that with."};const o=s.find(m=>m.id===e)||this.findItemInRoom(this.state.currentRoom,e);if(!o)return{text:"You don't see that here."};if(t==="take")return this.handleTake(o);if(t==="read"){if((a=o.onAction)!=null&&a.read){const m=this.makeContext(o.id),d=o.onAction.read(m);return this.applyEffects(d.effects),{text:d.text}}return{text:o.examine}}if(t==="open"){if((i=o.onAction)!=null&&i.open){const m=this.makeContext(o.id),d=o.onAction.open(m);return this.applyEffects(d.effects),{text:d.text}}return{text:`You can't open the ${o.name}.`}}if(t==="push"){if((c=o.onAction)!=null&&c.push){const m=this.makeContext(o.id),d=o.onAction.push(m);return this.applyEffects(d.effects),{text:d.text}}return{text:`Pushing the ${o.name} does nothing.`}}if(t==="use"){if((l=o.onAction)!=null&&l.use){const m=this.makeContext(o.id),d=o.onAction.use(m);return this.applyEffects(d.effects),{text:d.text}}return{text:`Using the ${o.name} does nothing.`}}return{text:`You can't do that with the ${o.name}.`}}useInventoryItemOnRoom(t,e){var o;const n=this.findItemInRoom(this.state.currentRoom,e);if(!n)return{text:"You don't see that here."};const s=`use_${t}`;if((o=n.onAction)!=null&&o[s]){const a=n.onAction[s];if(a){const i=this.makeContext(e),c=a(i);return this.applyEffects(c.effects),{text:c.text}}}return{text:`Using ${t} on the ${e} doesn't work.`}}handleTake(t){return t.takeable?this.state.inventory.includes(t.id)?{text:`You already have the ${t.name}.`}:(this.state.inventory.push(t.id),this.state.roomStates[this.state.currentRoom]||(this.state.roomStates[this.state.currentRoom]={visited:!0,itemsRemoved:[]}),this.state.roomStates[this.state.currentRoom].itemsRemoved.push(t.id),{text:"Taken."}):{text:`You can't take the ${t.name}.`}}applyEffects(t){if(t){for(const e of t){if(e.setFlags&&Object.assign(this.state.flags,e.setFlags),e.addItem&&!this.state.inventory.includes(e.addItem)&&this.state.inventory.push(e.addItem),e.removeItem){const n=this.state.roomStates[this.state.currentRoom];n&&!n.itemsRemoved.includes(e.removeItem)&&n.itemsRemoved.push(e.removeItem)}if(e.enableExit){const s=this.getRoom(this.state.currentRoom).exits.find(o=>o.direction===e.enableExit.direction);s&&delete s.blockedBy}if(e.addJournalEntry){const n=e.addJournalEntry;this.state.journal.some(s=>s.id===n.id)||this.state.journal.push({...n,addedInMovement:n.addedInMovement??this.state.currentMovement})}e.complete&&(this.state.completed=!0)}this.checkTriggers()}}makeContext(t){return{flags:this.state.flags,inventory:this.state.inventory,journal:this.state.journal,roomId:this.state.currentRoom,itemId:t}}checkTriggers(){for(const t of this.chapter.triggers){const e=this.state.flags[`__trigger_${t.id}`];if(t.once&&e)continue;t.when.every(s=>this.state.flags[s.flag]===s.value)&&(this.state.flags[`__trigger_${t.id}`]=!0,this.applyEffects(t.then))}}markRoomVisited(t){this.state.roomStates[t]?this.state.roomStates[t].visited=!0:this.state.roomStates[t]={visited:!0,itemsRemoved:[]}}getLookTextForCurrentRoom(){const t=this.getPerspective(),e=this.getEffectiveItems(t);return this.buildLookText(t,e)}getLookText(t,e){return this.buildLookText(t,e)}buildLookText(t,e){let n=this.getEffectiveText(t,"look");if(e.length>0){const s=e.map(i=>i.name),o=s.pop(),a=s.length>0?`${s.join(", ")}, and ${o}`:o;n+=`

You can see: ${a}.`}return n}getEntryText(){const t=this.getPerspective(),e=this.getEffectiveItems(t);let n=this.getEffectiveText(t,"entry");if(e.length>0){const s=e.map(i=>i.name),o=s.pop(),a=s.length>0?`${s.join(", ")}, and ${o}`:o;n+=`

You can see: ${a}.`}return n}getItem(t){const e=this.getPerspective(),s=this.getEffectiveItems(e).find(o=>o.id===t);return s?{id:s.id,name:s.name,examine:s.examine,actions:s.actions,takeable:s.takeable}:null}getInventoryItem(t){if(!this.state.inventory.includes(t))return null;for(const e of Object.values(this.chapter.rooms)){const n=this.findItemInRoom(e.id,t);if(n!=null&&n.inventory)return{id:n.id,...n.inventory,actions:n.actions}}return null}findItemInRoom(t,e){const n=this.chapter.rooms[t];if(n)for(const s of this.allPerspectives(n)){const o=s.items.find(a=>a.id===e);if(o)return o}}getSnapshot(){const t=this.getCurrentRoom(),e=this.getPerspective(),n=this.getEffectiveItems(e);return{roomName:t.name,roomId:t.id,side:this.state.side,renderMode:this.getCurrentRenderMode(),description:this.getEntryText(),items:n.map(s=>({id:s.id,name:s.name,actions:s.actions,takeable:s.takeable})),focusedItem:null,focusedIsInventory:!1,inventory:this.state.inventory.map(s=>{for(const o of Object.values(this.chapter.rooms)){const a=this.findItemInRoom(o.id,s);if(a!=null&&a.inventory)return{id:a.id,label:a.inventory.label}}return{id:s,label:s}}),exits:t.exits.filter(s=>!s.blockedBy||this.state.flags[s.blockedBy]).map(s=>s.direction),actions:["look","open","take","push","read","use"],completed:this.state.completed,cast:this.chapter.cast,hasJournal:!!this.chapter.usesJournal,journal:this.state.journal}}save(){const t=v(this.mode,this.state.side,this.state.chapterId),e={state:this.state,chapterId:this.chapter.id};try{localStorage.setItem(t,JSON.stringify(e))}catch{console.warn("Failed to save game state")}}static load(t,e,n){for(const[s,o]of Object.entries(n)){const a=v(t,e,s);try{const i=localStorage.getItem(a);if(i){const c=JSON.parse(i),l=new f(t,c.state.side,o);return l.state=c.state,l.state.currentMovement===void 0&&(l.state.currentMovement=l.roomToMovement.get(l.state.currentRoom)??0),l.state.journal||(l.state.journal=[]),l}}catch{localStorage.removeItem(a)}}return null}static clearSave(t,e,n){localStorage.removeItem(v(t,e,n))}getRoomItems(t){var o;const e=this.getRoom(t),n=this.pickPerspective(e),s=((o=this.state.roomStates[t])==null?void 0:o.itemsRemoved)??[];return n.items.filter(a=>!s.includes(a.id)).map(a=>({id:a.id,name:a.name,examine:a.examine,actions:a.actions,takeable:a.takeable}))}}const T={default:{baseFreq:80,filterFreq:400,filterQ:1,noiseGain:.15,sineGain:.08,lfoRate:.1,lfoDepth:10},"dressing-room":{baseFreq:100,filterFreq:350,filterQ:.8,noiseGain:.1,sineGain:.1,lfoRate:.08,lfoDepth:8},workshop:{baseFreq:60,filterFreq:600,filterQ:2,noiseGain:.2,sineGain:.05,lfoRate:.15,lfoDepth:15},"stage-wing":{baseFreq:70,filterFreq:250,filterQ:.5,noiseGain:.12,sineGain:.06,lfoRate:.05,lfoDepth:12},hallway:{baseFreq:90,filterFreq:500,filterQ:1.5,noiseGain:.18,sineGain:.04,lfoRate:.12,lfoDepth:10}};class F{constructor(){h(this,"ctx",null);h(this,"masterGain",null);h(this,"currentDrone",null);h(this,"initialized",!1);h(this,"muted",!1)}async init(){this.initialized||(this.ctx=new AudioContext,this.masterGain=this.ctx.createGain(),this.masterGain.gain.value=.3,this.masterGain.connect(this.ctx.destination),this.initialized=!0)}setAmbient(t){if(!this.ctx||!this.masterGain)return;this.stopAmbient();const e=T[t]??T.default,n=this.ctx,s=n.createBufferSource(),o=n.sampleRate*2,a=n.createBuffer(1,o,n.sampleRate),i=a.getChannelData(0);let c=0;for(let p=0;p<o;p++){const B=Math.random()*2-1;i[p]=(c+.02*B)/1.02;const w=i[p];c=w,i[p]=w*3.5}s.buffer=a,s.loop=!0;const l=n.createBiquadFilter();l.type="lowpass",l.frequency.value=e.filterFreq,l.Q.value=e.filterQ;const m=n.createGain();m.gain.value=e.noiseGain;const d=n.createOscillator();d.type="sine",d.frequency.value=e.baseFreq;const u=n.createOscillator();u.type="sine",u.frequency.value=e.lfoRate;const g=n.createGain();g.gain.value=e.lfoDepth,u.connect(g),g.connect(d.frequency),u.start();const b=n.createGain();b.gain.value=e.sineGain,s.connect(l),l.connect(m),m.connect(this.masterGain),d.connect(b),b.connect(this.masterGain),s.start(),d.start(),this.currentDrone={nodes:[s,d,u],stop:()=>{try{s.stop()}catch{}try{d.stop()}catch{}try{u.stop()}catch{}}}}stopAmbient(){this.currentDrone&&(this.currentDrone.stop(),this.currentDrone=null)}playSfx(t){if(!this.ctx||!this.masterGain||this.muted)return;const e=this.ctx;if(t==="click"){const n=e.createOscillator();n.type="sine",n.frequency.value=800;const s=e.createGain();s.gain.setValueAtTime(.1,e.currentTime),s.gain.exponentialRampToValueAtTime(.001,e.currentTime+.05),n.connect(s),s.connect(this.masterGain),n.start(),n.stop(e.currentTime+.05)}else if(t==="creak"){const n=e.sampleRate*.3,s=e.createBuffer(1,n,e.sampleRate),o=s.getChannelData(0);for(let l=0;l<n;l++)o[l]=(Math.random()*2-1)*(1-l/n);const a=e.createBufferSource();a.buffer=s;const i=e.createBiquadFilter();i.type="lowpass",i.frequency.value=200;const c=e.createGain();c.gain.setValueAtTime(.15,e.currentTime),c.gain.exponentialRampToValueAtTime(.001,e.currentTime+.3),a.connect(i),i.connect(c),c.connect(this.masterGain),a.start()}else if(t==="paper"){const n=e.sampleRate*.15,s=e.createBuffer(1,n,e.sampleRate),o=s.getChannelData(0);for(let l=0;l<n;l++)o[l]=(Math.random()*2-1)*(1-l/n)*.5;const a=e.createBufferSource();a.buffer=s;const i=e.createBiquadFilter();i.type="highpass",i.frequency.value=2e3;const c=e.createGain();c.gain.setValueAtTime(.06,e.currentTime),c.gain.exponentialRampToValueAtTime(.001,e.currentTime+.15),a.connect(i),i.connect(c),c.connect(this.masterGain),a.start()}else if(t==="footstep"){const n=e.sampleRate*.1,s=e.createBuffer(1,n,e.sampleRate),o=s.getChannelData(0);for(let l=0;l<n;l++)o[l]=(Math.random()*2-1)*Math.pow(1-l/n,2);const a=e.createBufferSource();a.buffer=s;const i=e.createBiquadFilter();i.type="lowpass",i.frequency.value=100;const c=e.createGain();c.gain.setValueAtTime(.2,e.currentTime),c.gain.exponentialRampToValueAtTime(.001,e.currentTime+.1),a.connect(i),i.connect(c),c.connect(this.masterGain),a.start()}else if(t==="lock"){const n=e.createOscillator();n.type="square",n.frequency.value=600;const s=e.createGain();s.gain.setValueAtTime(.08,e.currentTime),s.gain.exponentialRampToValueAtTime(.001,e.currentTime+.08),n.connect(s),s.connect(this.masterGain),n.start(),n.stop(e.currentTime+.08)}}toggleMute(){return this.muted=!this.muted,this.masterGain&&(this.masterGain.gain.value=this.muted?0:.3),this.muted}dispose(){this.stopAmbient(),this.ctx&&(this.ctx.close(),this.ctx=null),this.initialized=!1}}const G=20;class Y{constructor(t){h(this,"element");h(this,"abort",!1);h(this,"currentPromise",null);this.element=t}async show(t,e=!1){this.currentPromise&&(this.abort=!0,await this.currentPromise),this.currentPromise=this.typeText(t,e),await this.currentPromise,this.currentPromise=null}async typeText(t,e){e||(this.element.innerHTML=""),this.abort=!1;const n=document.createElement("div");n.className="text-block",this.element.appendChild(n);for(let s=0;s<t.length;s++){if(this.abort){n.textContent=(n.textContent??"")+t.slice(s);break}n.textContent=(n.textContent??"")+t[s],await this.sleep(G)}this.scrollToBottom()}skip(){this.abort=!0}scrollToBottom(){this.element.scrollTop=this.element.scrollHeight}sleep(t){return new Promise(e=>setTimeout(e,t))}clear(){this.element.innerHTML="",this.abort=!0}appendHtml(t){const e=document.createElement("div");e.className="text-block",e.innerHTML=t,this.element.appendChild(e),this.scrollToBottom()}}function x(r){return r.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function E(r,t){r.innerHTML=`
    <div id="side-select">
      <div class="side-select-content">
        <h1 class="side-select-title">Escape Game</h1>
        <p class="side-select-subtitle">Two paths in.</p>
        <div class="side-select-buttons">
          <button class="side-btn dreamer-btn" data-mode="solo">
            <span class="side-btn-icon">○</span>
            <span class="side-btn-label">Solo</span>
            <span class="side-btn-desc">Alone in the dark</span>
          </button>
          <button class="side-btn reckoner-btn" data-mode="together">
            <span class="side-btn-icon">◇</span>
            <span class="side-btn-label">Together</span>
            <span class="side-btn-desc">Two halves, one mind</span>
          </button>
        </div>
      </div>
    </div>
  `,r.querySelectorAll(".side-btn").forEach(e=>{e.addEventListener("click",()=>{const n=e.dataset.mode;n&&t.onPickMode(n)})})}function O(r,t){r.innerHTML=`
    <div id="side-select">
      <div class="side-select-content">
        <h1 class="side-select-title">Escape Game</h1>
        <p class="side-select-subtitle">Choose your perspective</p>
        <div class="side-select-buttons">
          <button class="side-btn dreamer-btn" data-side="dreamer">
            <span class="side-btn-icon">◈</span>
            <span class="side-btn-label">Dreamer</span>
            <span class="side-btn-desc">Feel the memory</span>
          </button>
          <button class="side-btn reckoner-btn" data-side="reckoner">
            <span class="side-btn-icon">▣</span>
            <span class="side-btn-label">Reckoner</span>
            <span class="side-btn-desc">Record the truth</span>
          </button>
        </div>
      </div>
    </div>
  `,r.querySelectorAll(".side-btn").forEach(e=>{e.addEventListener("click",()=>{const n=e.dataset.side;n&&t.onPickSide(n)})})}function j(){const r=document.getElementById("app");return r.innerHTML=`
    <div id="game-layout">
      <div id="header">
        <span id="header-title"></span>
        <span id="header-side"></span>
        <button id="save-btn" class="header-btn" title="Save">⎔</button>
        <button id="mute-btn" class="header-btn" title="Toggle sound">♫</button>
      </div>
      <div id="text-pane"></div>
      <div id="item-list"></div>
      <div id="focus-line"></div>
      <div id="controls">
        <div id="dpad">
          <button class="dpad-btn" data-dir="north">▲</button>
          <div class="dpad-row">
            <button class="dpad-btn" data-dir="west">◄</button>
            <div class="dpad-center"></div>
            <button class="dpad-btn" data-dir="east">►</button>
          </div>
          <button class="dpad-btn" data-dir="south">▼</button>
        </div>
        <div id="action-bar">
          <button class="action-btn" data-action="look">LOOK</button>
          <button class="action-btn" data-action="open">OPEN</button>
          <button class="action-btn" data-action="take">TAKE</button>
          <button class="action-btn" data-action="push">PUSH</button>
          <button class="action-btn" data-action="read">READ</button>
          <button class="action-btn" data-action="use">USE</button>
        </div>
      </div>
      <div id="inventory-bar">
        <span class="inv-label">🎒</span>
        <div id="inv-items"></div>
      </div>
    </div>
  `,{app:r,header:document.getElementById("header-title"),textPane:document.getElementById("text-pane"),itemList:document.getElementById("item-list"),focusLine:document.getElementById("focus-line"),dpad:document.getElementById("dpad"),actionBar:document.getElementById("action-bar"),inventoryBar:document.getElementById("inv-items"),saveBtn:document.getElementById("save-btn"),muteBtn:document.getElementById("mute-btn")}}class N{constructor(t,e,n,s){h(this,"textRenderer");h(this,"game");h(this,"audio");h(this,"callbacks");h(this,"snapshot");h(this,"headerEl");h(this,"headerSide");h(this,"textPaneEl");h(this,"itemListEl");h(this,"focusLineEl");h(this,"dpadEl");h(this,"actionBarEl");h(this,"inventoryBarEl");h(this,"saveBtnEl");h(this,"muteBtnEl");h(this,"focus",{itemId:null,isInventory:!1});h(this,"usePending",null);this.game=e,this.audio=n,this.callbacks=s;const o=j();this.headerEl=o.header,this.headerSide=document.getElementById("header-side"),this.textPaneEl=o.textPane,this.itemListEl=o.itemList,this.focusLineEl=o.focusLine,this.dpadEl=o.dpad,this.actionBarEl=o.actionBar,this.inventoryBarEl=o.inventoryBar,this.saveBtnEl=o.saveBtn,this.muteBtnEl=o.muteBtn,this.textRenderer=new Y(this.textPaneEl),this.snapshot=this.game.getSnapshot();const a=document.getElementById("game-layout");a&&(a.dataset.side=this.snapshot.renderMode),this.wireEvents(),this.render()}wireEvents(){this.dpadEl.querySelectorAll(".dpad-btn").forEach(t=>{t.addEventListener("click",async e=>{const n=e.currentTarget.dataset.dir;if(!n)return;this.audio.playSfx("footstep");const s=this.callbacks.onNavigate(n);this.usePending=null,s.movementChanged&&await this.showMovementTransition(s.transitionOut,s.transitionIn),this.refreshFromGame(),this.showResultText(s.text)})}),this.actionBarEl.querySelectorAll(".action-btn").forEach(t=>{t.addEventListener("click",e=>{const n=e.currentTarget.dataset.action;n&&this.handleAction(n)})}),this.saveBtnEl.addEventListener("click",()=>{this.callbacks.onSave(),this.showResultText("Game saved.")}),this.muteBtnEl.addEventListener("click",()=>{const t=this.audio.toggleMute();this.muteBtnEl.textContent=t?"♪":"♫",this.showResultText(t?"Sound off.":"Sound on.")}),document.addEventListener("click",t=>{const e=t.target;if(e.classList.contains("item-chip")){const n=e.dataset.itemId;if(!n)return;if(this.usePending){const s=this.callbacks.onUseItemOnRoom(this.usePending,n);this.usePending=null,this.refreshFromGame(),this.showResultText(s);return}this.focusItem(n)}if(e.classList.contains("inv-chip")){const n=e.dataset.itemId;if(!n)return;this.focusInventoryItem(n)}e.classList.contains("journal-chip")&&this.showJournalViewer()})}showJournalViewer(){const t=this.snapshot.journal,e=document.createElement("div");e.className="journal-viewer";const n=t.length===0?'<div class="journal-empty">The journal is open. No entries yet.</div>':t.map((o,a)=>`
          <details class="journal-entry"${a===t.length-1?" open":""}>
            <summary>${x(o.label)}</summary>
            <div class="journal-body">${x(o.body)}</div>
          </details>
        `).join("");e.innerHTML=`
      <div class="journal-frame">
        <div class="journal-header">
          <span class="journal-title">Journal</span>
          <button class="journal-close" type="button" aria-label="Close">✕</button>
        </div>
        <div class="journal-list">${n}</div>
      </div>
    `,document.body.appendChild(e),requestAnimationFrame(()=>e.classList.add("visible"));const s=()=>{e.classList.remove("visible"),setTimeout(()=>e.remove(),250)};e.querySelector(".journal-close").addEventListener("click",s),e.addEventListener("click",o=>{o.target===e&&s()})}handleAction(t){if(this.audio.playSfx("click"),t==="look"){this.focus={itemId:null,isInventory:!1},this.usePending=null,this.refreshFromGame(),this.textRenderer.clear();const s=this.game.getLookTextForCurrentRoom();this.showResultText(s);return}if(t==="use"&&this.focus.isInventory&&this.focus.itemId){this.usePending=this.focus.itemId,this.showResultText("Use it on what? Tap an item in the room.");return}const e=this.focus.itemId??void 0,n=this.callbacks.onAct(t,e);this.refreshFromGame(),this.showResultText(n),t==="take"&&this.focus.itemId&&(this.focus={itemId:null,isInventory:!1},this.refreshFromGame(),this.renderItemList(),this.renderInventory(),this.renderFocusLine())}focusItem(t){const e=this.game.getItem(t);e&&(this.focus={itemId:t,isInventory:!1},this.usePending=null,this.renderFocusLine(),this.renderActions(),this.showResultText(`
── ${e.name} ──
${e.examine}`))}focusInventoryItem(t){const e=this.game.getInventoryItem(t);e&&(this.focus={itemId:t,isInventory:!0},this.usePending=null,this.renderFocusLine(),this.renderActions(),this.showResultText(`
── ${e.label} (inventory) ──
${e.examine}`))}refreshFromGame(){this.snapshot=this.game.getSnapshot(),this.renderHeader(),this.renderInventory(),this.renderDpad(),this.renderActions(),this.renderItemList()}render(){this.renderHeader(),this.renderDpad(),this.renderActions(),this.renderItemList(),this.renderInventory(),this.renderFocusLine(),this.textRenderer.clear(),this.showResultText(this.snapshot.description)}renderHeader(){this.headerEl.textContent=this.snapshot.roomName;const t=this.snapshot.renderMode;t==="neutral"?this.headerSide.textContent="":this.headerSide.textContent="· "+(t==="dreamer"?"Dreamer":"Reckoner");const e=document.getElementById("game-layout");e&&(e.dataset.side=t)}renderItemList(){const t=this.snapshot.items;if(t.length===0){this.itemListEl.innerHTML='<span class="no-items">Nothing of note here.</span>';return}this.itemListEl.innerHTML=t.map(e=>`<button class="item-chip" data-item-id="${e.id}">${e.name}</button>`).join("")}renderFocusLine(){if(!this.focus.itemId){this.focusLineEl.textContent="";return}if(this.focus.isInventory){const t=this.game.getInventoryItem(this.focus.itemId);this.focusLineEl.textContent=t?`» ${t.label} (inventory)`:""}else{const t=this.game.getItem(this.focus.itemId);this.focusLineEl.textContent=t?`» ${t.name}`:""}}renderActions(){this.actionBarEl.querySelectorAll(".action-btn").forEach(t=>{const e=t.dataset.action,n=this.isActionValid(e);if(t.classList.toggle("disabled",!n),e==="take"&&this.focus.itemId&&!this.focus.isInventory){const s=this.game.getItem(this.focus.itemId);s&&this.game.state.inventory.includes(s.id)&&t.classList.add("disabled")}})}isActionValid(t){if(t==="look")return!0;if(!this.focus.itemId)return!1;if(this.focus.isInventory)return t==="use";const e=this.game.getItem(this.focus.itemId);return e?t==="take"?e.takeable&&!this.game.state.inventory.includes(e.id):t==="open"||t==="push"||t==="read"?e.actions.includes(t):t==="use"?e.actions.includes("use"):!1:!1}renderDpad(){const t=this.snapshot.exits;this.dpadEl.querySelectorAll(".dpad-btn").forEach(e=>{const n=e.dataset.dir;e.classList.toggle("disabled",!t.includes(n))})}renderInventory(){const t=this.snapshot.inventory,e=this.snapshot.hasJournal?'<button class="journal-chip" type="button">📓 Journal</button>':"";if(t.length===0&&!this.snapshot.hasJournal){this.inventoryBarEl.innerHTML='<span class="no-items">empty</span>';return}const n=t.map(s=>`<button class="inv-chip" data-item-id="${s.id}">${s.label}</button>`).join("");this.inventoryBarEl.innerHTML=e+n}showResultText(t){t&&(this.textRenderer.skip(),this.textRenderer.show(t,!0))}async showPrologue(t){this.textRenderer.clear(),await this.textRenderer.show(t)}showEpilogue(t){this.textRenderer.clear(),this.textRenderer.appendHtml(`<div class="epilogue">${t}</div>`)}showMovementTransition(t,e){return new Promise(n=>{const s=[t,e].filter(m=>!!(m&&m.trim()));if(s.length===0){n();return}const o=s.join(`

· · ·

`),a=document.createElement("div");a.className="movement-transition",a.innerHTML=`
        <div class="transition-text"></div>
        <div class="transition-hint">tap to continue</div>
      `;const i=a.querySelector(".transition-text");i.textContent=o,document.body.appendChild(a),requestAnimationFrame(()=>a.classList.add("visible"));let c=!1;const l=()=>{c||(c=!0,a.classList.remove("visible"),setTimeout(()=>{a.remove(),n()},500))};a.addEventListener("click",l)})}}const C={id:"ch01",title:"The Apollo",starts:{dreamer:"dressing-room",reckoner:"workshop"},cast:{protagonist:"Anneliese",partner:"Emil",mentor:"Maestro Levin",daughter:"Liesl"},prologue:`A gas lamp flickers. A match is struck. You do not know whose hand holds it.

The smell of velvet and old wood. Somewhere, an orchestra is tuning. The air is cold, then warm, then cold again — like a memory finding its shape.

You are not awake. You are not dreaming. You are between.

The lamp steadies. You see:`,epilogue:`The curtain rises. The audience becomes one body, gasping.

For a moment, everything is as it should be.

Then the hunger stirs again — quiet, patient, already drawing the plans for something bigger.

The memory dims. The lamp flickers.

You are between, again.`,completionFlag:"ch01.complete",rooms:{"dressing-room":{id:"dressing-room",name:"Dressing Room",exits:[{direction:"north",roomId:"stage-wing"}],dreamer:{entry:`Warm amber light spills from the mirror bulbs, catching the rim of a crystal decanter half-drunk. The air is heavy — greasepaint, perfume, the ghost of cigarette smoke.

Your costume hangs on a brass rack — deep velvet, midnight blue, patient. Through the wall, the orchestra is tuning. A voice that might be Emil's carries from somewhere below.

A photograph is tucked into the mirror frame. The Mentor's notebook lies open on the vanity.`,look:`The dressing room breathes. The mirror bulbs cast their warm glow on everything — the decanter, the notebook, the photograph. A small note is tucked beneath the decanter.

Tomorrow's schedule waits on the vanity. Through the wall, the orchestra continues its tuning.`,ambient:"dressing-room",items:[{id:"decanter",name:"crystal decanter",examine:"A heavy crystal decanter, half-full of amber liquid. Numbers are etched into the glass: 7, 3, 1, 4. The glass is warm from the lamp.",actions:["read"],takeable:!0,inventory:{label:"Decanter",examine:"A heavy crystal decanter. Numbers 7-3-1-4 etched on the side."},onAction:{read:()=>({text:"You examine the decanter. The numbers 7, 3, 1, 4 catch the lamplight. Etched cleanly, deliberately — not a wear pattern. Someone put them there on purpose.",effects:[{setFlags:{"ch01.decanter-examined":!0}}]})}},{id:"costume",name:"velvet costume",examine:"Deep velvet, midnight blue. The fabric holds the warmth of a thousand stage lights. You have worn this for every major performance.",actions:["read"],takeable:!1,inventory:{label:"Costume",examine:"Deep velvet, midnight blue."}},{id:"notebook",name:"Mentor's notebook",examine:`The Mentor's notebook, bound in cracked leather. Pages dense with ink — diagrams, symbols, marginalia. Each page seems to shift when you're not looking directly at it.

You turn the pages. A bird in a cage beside a broken cup. A room with two doors. A larger cabinet. A single eye.

One page holds your attention — the bird and the broken cup. Below it, in tiny script: "The release is always at the bottom."`,actions:["read","open"],takeable:!1,inventory:{label:"Notebook",examine:"The Mentor's notebook, cracked leather."},onAction:{read:()=>({text:`You turn to the page with the bird and the broken cup.

Beneath the drawing, in the Mentor's precise hand: "The release is always at the bottom. Check it before every rise of the curtain. The day you skip it is the day it matters."

His voice, across the years.`,effects:[{setFlags:{"ch01.notebook-page-found":!0}}]}),open:()=>({text:"The notebook falls open to a page with a bird and a broken cup."})}},{id:"photograph",name:"photograph",examine:"A small photograph tucked into the mirror frame. A child — eight years old, maybe — squinting in the sun. Liesl. You feel something twist when you look at it.",actions:["read"],takeable:!1,inventory:{label:"Photo",examine:"Liesl, summer 1905."}},{id:"emils-note",name:"Emil's note",examine:"A folded note, tucked beneath the decanter. Emil's handwriting.",actions:["read"],takeable:!0,inventory:{label:"Emil's note",examine:"A folded note in Emil's hand."},onAction:{read:()=>({text:`"Moved the silks to the left wing. Safer there. Trust me."

You smile despite yourself. He's always adjusting things. The silks are in the left wing now.

He's probably right.`,effects:[{setFlags:{"ch01.emils-note-read":!0},addItem:"silks-found"}]})}},{id:"wardrobe",name:"wardrobe",examine:"A tall oak wardrobe. Heavy. The door is slightly ajar.",actions:["open","push"],takeable:!1,inventory:{label:"Wardrobe",examine:"A tall oak wardrobe."},onAction:{open:r=>r.flags["ch01.cabinet-code-entered"]?{text:"The wardrobe swings open. Inside, a small compartment you hadn't noticed before. A photograph falls out — Emil, younger, holding Liesl as a baby.",effects:[{setFlags:{"ch01.wardrobe-opened":!0}}]}:{text:"The wardrobe is mostly empty — a few hangers, an old coat."},push:()=>({text:"The wardrobe is too heavy to move. It might as well be part of the wall."})}}]},reckoner:{entry:`Dressing Room 4 — Apollo-Saal. A typewritten inventory is taped to the door: "Props checked: 12/14." The steam radiator clanks rhythmically.

A steel filing cabinet stands against the far wall. The vanity is organized: program, correspondence, a telegram. 

One item is unchecked: "crystal decanter — see ledger entry: Emil — birth."`,look:"Dressing Room 4. Filing cabinet against the far wall. Vanity with program, correspondence, inventory sheet. Telegram leans against the mirror. Radiator clanking.",ambient:"dressing-room",items:[{id:"inventory-sheet",name:"inventory sheet",examine:`Typewritten inventory: "Dressing Room 4 — Apollo-Saal, 1907." 14 props listed, 12 checked.

Item #7 — Crystal decanter. Notation: "Etched with year of birth. See ledger entry: Emil Roth, b. 1872."

Item #14 — [blank] "Relocated per E. Roth."`,actions:["read"],takeable:!0,inventory:{label:"Inventory sheet",examine:"Dressing Room 4 inventory. 14 props."}},{id:"letter",name:"management letter",examine:'Unopened letter from Apollo-Saal management, addressed to "Madame Vespera, c/o Artist Entrance." Postmarked 3 days ago. Seal intact.',actions:["read"],takeable:!0,inventory:{label:"Mgt letter",examine:"Unopened management letter."}},{id:"telegram",name:"telegram",examine:'Unopened telegram. Addressed to "Becker, c/o Apollo-Saal Vienna." Postmarked Budapest, 3 days ago. Sender: "V."',actions:["read","open"],takeable:!0,inventory:{label:"Telegram",examine:"Telegram from Budapest. Sender: V."}},{id:"filing-cabinet",name:"filing cabinet",examine:'Steel filing cabinet, four drawers. Labels: "Correspondence 1907," "Safety Certificates," "Contracts," "Personal." The Safety drawer is slightly ajar.',actions:["open","push"],takeable:!1,inventory:{label:"Filing cabinet",examine:"Steel filing cabinet."},onAction:{open:()=>({text:`You pull open the Safety drawer. Inside: certificates dating back years. A recent one catches your eye:

"Cabinet apparatus inspected 14 days ago. Counterweight bolt shows wear — replace before next tour." Initialled "E.R."

A separate sheet is tucked behind it — a handwritten note from Emil: "Counterweight replaced. New Cabinet's release is on the RIGHT side, not the left. Don't let her perform without knowing this."`,effects:[{setFlags:{"ch01.safety-cert-found":!0},addItem:"safety-cert"}]}),push:()=>({text:"The cabinet is bolted to the wall."})}},{id:"program",name:"evening program",examine:`Tonight's program. Typewritten:

20:00 — The Cabinet (Madame Vespera)
20:12 — The Silver Bell
20:24 — The Silks
20:36 — Intermission

Scrawled in pencil on the margin: "Cabinet cue at bar 47 — watch conductor's downbeat." Something about the cue annotation seems off — a number crossed out beneath it.`,actions:["read"],takeable:!0,inventory:{label:"Program",examine:"Tonight's program."}}]}},workshop:{id:"workshop",name:"Workshop",exits:[{direction:"south",roomId:"stage-wing"}],dreamer:{entry:`The workshop is cold. Brick and iron and the smell of old fire. The workbench holds shapes you know by touch — a Cabinet mechanism, a Bell's clapper wrapped in felt, the Silks folded in their box.

Emil's coat hangs on the back of the chair. The chalkboard is covered in his handwriting — timings, positions, notes.

Your fingers brush the Cabinet's corner. A memory surfaces: sawdust, Emil laughing at something the Mentor once said.`,look:`The workshop in half-dark. Tools hang in neat rows. The Cabinet looms in the corner, its mechanism exposed. The chalkboard covered in Emil's script.

A safety release is visible on the Cabinet's side, hidden behind a small brass plate.`,ambient:"workshop",items:[{id:"chalkboard",name:"chalkboard",examine:`The running order, in Emil's neat hand. Something catches your attention: a line partially erased.

"Cabinet — counterweight check" has been written and scrubbed out. Beneath it, faintly: "She hasn't checked it yet."`,actions:["read"],takeable:!1,inventory:{label:"Chalkboard",examine:"The chalkboard."}},{id:"cabinet-apparatus",name:"Cabinet apparatus",examine:`The Cabinet. You know it better than your own body — every hinge, every latch. But this one is different. The mechanism is newer, unfamiliar.

A small brass plate on the side hides the safety release. The counterweight is visible at the bottom — a heavy iron cylinder. It has been turned recently.`,actions:["push","open"],takeable:!1,inventory:{label:"Cabinet",examine:"The Cabinet apparatus."},onAction:{push:r=>r.flags["ch01.release-checked"]?{text:"You press the mechanism test. The counterweight engages smoothly. Everything is in order.",effects:[{setFlags:{"ch01.cabinet-tested":!0}}]}:{text:"The mechanism feels firm. The counterweight is heavier than you remember. You should check the safety release before anything else."}}},{id:"safety-release",name:"safety release",examine:`The Mentor taught you this — always check it before every performance. A small brass lever behind a plate on the Cabinet's side.

It disengages the counterweight in an emergency. You haven't checked it tonight.`,actions:["push"],takeable:!1,inventory:{label:"Safety release",examine:"The safety release lever."},onAction:{push:()=>({text:`You press the safety release. It moves smoothly. The counterweight mechanism is properly engaged.

The Mentor's voice, in your memory: "Never build what you cannot dismantle alone."

You let out a breath you didn't realize you were holding.`,effects:[{setFlags:{"ch01.release-checked":!0}}]})}},{id:"emils-coat",name:"Emil's coat",examine:'An old wool coat, worn at the elbows. You lift it — tobacco, sawdust, him. A ticket stub falls from the pocket: "Budapest — Vienna, Oct 29."',actions:["read"],takeable:!1,inventory:{label:"Emil's coat",examine:"An old wool coat."}}]},reckoner:{entry:`Below the stage. Narrow brick room, low ceiling. A single gas lamp illuminates the workbench — apparatus mid-assembly, a small forge cooled to embers.

Steel filing cabinets of diagrams. The chalkboard shows tonight's running order. The conductor's annotated score hangs beside the door.

On the bench: a typewritten contract. A telegram, unopened.`,look:`Workshop. Filing cabinets of schematics. Workbench with apparatus. Chalkboard with running order. Conductor's score on hook. Contract and telegram on bench.

The air smells of iron and cold ash.`,ambient:"workshop",items:[{id:"chalkboard",name:"chalkboard",examine:`Running order:
20:00 — Cabinet (Vespera)
20:12 — Bell
20:24 — Silks
20:36 — Interval

Beneath, in Emil's hand: "A. — check the new Cabinet's counterweight. It's not the one we tested."
Crossed out below: "She hasn't listened yet."`,actions:["read"],takeable:!1,inventory:{label:"Chalkboard",examine:"The chalkboard."}},{id:"conductors-score",name:"conductor's score",examine:`Fauré, "Pavane," Op. 50. The score is heavily annotated. At bar 47: "VANISH CUE — downbeat."

But look closer — the conductor has cut a repeat, renumbering bars 44-49. The original bar 47 is now bar 46. The cue is off by one bar.

If the conductor plays bar 46 and Emil cues the vanish at the marked "bar 47," they'll miss by a full bar.`,actions:["read"],takeable:!1,inventory:{label:"Score",examine:"Conductor's annotated score."}},{id:"contract",name:"management contract",examine:'Apollo-Saal management contract. 4-week run, 6 performances weekly. Clause 7: "Artist responsible for own apparatus safety inspections." Signed by theatre director and "A. Becker." Dated October 1, 1907.',actions:["read"],takeable:!0,inventory:{label:"Contract",examine:"Management contract."}},{id:"cabinet-schematics",name:"Cabinet schematics",examine:`Technical drawing: Cabinet apparatus, Version 2.

Annotations in Emil's hand:
"Counterweight bolt — replace every 6 months."
"Safety release: lower-RIGHT, behind brass plate. Note: this is DIFFERENT from v1 (which was on the LEFT)."
"Prototype only. NOT FOR PERFORMANCE."

A second set of drawings is tucked behind — a larger Cabinet, more compartments. No safety release at all. The note reads: "For when she's ready."`,actions:["read"],takeable:!0,inventory:{label:"Schematics",examine:"Cabinet v2 schematics."},onAction:{read:()=>({text:`You study the schematics carefully.

The v1 Cabinet had the safety release on the left. This new one — the prototype already on stage — has it on the right. A completely different mechanism.

The second set of drawings makes your stomach drop: a larger Cabinet with no safety release at all. The annotation: "For when she's ready."

Ready for what?`,effects:[{setFlags:{"ch01.schematics-read":!0}}]})}},{id:"emils-note-cabinet",name:"Emil's note",examine:"Handwritten, pinned to the bench. Folded and refolded many times.",actions:["read"],takeable:!0,inventory:{label:"Emil's note",examine:"A worn note."},onAction:{read:()=>({text:`"A. — please don't test the new Cabinet tonight. Not without me checking it first. The counterweight isn't the same as the old one. The release is on the wrong side. You'll reach for it where it used to be, and your hand will find nothing.

I know you don't want to hear this. But I promised him I'd keep you safe.

— E."`,effects:[{setFlags:{"ch01.emil-cabinet-note-read":!0}}]})}}]}},"stage-wing":{id:"stage-wing",name:"Stage Wing",exits:[{direction:"south",roomId:"dressing-room"},{direction:"north",roomId:"workshop"},{direction:"east",roomId:"stage"}],dreamer:{entry:`The wings. Velvet drapes heavy with dust and years. Through the curtain gap, the empty audience pit — you hear the echo of tonight's crowd yet to arrive.

The props are laid out on a long table. You touch each one:

The Cabinet — heavy, brass handle cold.
The Bell — wrapped in felt, smells of camphor.
The Silks — they make your fingers feel small.

The fourth position is empty.`,look:"The wings. Dust motes in the worklights. Table with props: Cabinet, Bell, Silks, empty fourth position. Emil's voice somewhere in the theatre.",ambient:"stage-wing",items:[{id:"silks",name:"performance silks",examine:"Folded silk cloths — deep red, gold, black. They shimmer. When you hold them, your fingers feel small and deft. Emil moved them here. He was right — they're safer.",actions:["read","take"],takeable:!0,inventory:{label:"Silks",examine:"Performance silks. Red, gold, black."}},{id:"bell",name:"silver bell",examine:"A handbell in polished silver, clapper wrapped in felt. The metal is cold. Smells faintly of camphor.",actions:["read","use"],takeable:!0,inventory:{label:"Bell",examine:"A silver handbell."}},{id:"cabinet-wing",name:"performance Cabinet",examine:"The Cabinet. From the wings it looks different — larger, more imposing. The brass handle is cold. The wood grain runs in patterns you know by heart.",actions:["open","push"],takeable:!1,inventory:{label:"Cabinet",examine:"The performance Cabinet."}}]},reckoner:{entry:`Stage Left Wing. Prop table at C-4 per chalkboard:

1. Cabinet apparatus — verified
2. Silver Bell — verified
3. Performance Silks — verified
4. EMPTY — item relocated per E. Roth, 18:45

Stage manager's log confirms the relocation. No further details.`,look:"Wings, Stage Left. Prop table C-4. Cabinet, Bell, Silks present. Position 4 empty. Worklights on. Stage visible through curtain gap.",ambient:"stage-wing",items:[{id:"stage-manager-log",name:"stage manager's log",examine:'Log entry, 18:45: "E. Roth relocated item from position 4 to an alternate position. Reason: safety concern. No further action required."',actions:["read"],takeable:!1,inventory:{label:"Log",examine:"Stage manager log entry."}},{id:"prop-inventory",name:"prop inventory list",examine:`Prop inventory — Apollo-Saal, 20:00 performance.

1. Cabinet apparatus
2. Silver Bell
3. Performance Silks
4. [BLANK]

Annotation: "Item 4 relocated. See dressing room — decanter, item #7."`,actions:["read"],takeable:!0,inventory:{label:"Prop list",examine:"Prop inventory."}},{id:"note-on-stand",name:"note on music stand",examine:`Handwritten note, left on the stage manager's stand:

"Props confirmed. Cue 1: Cabinet at 20:00 sharp. Watch for my hand — I'll signal from the wings when we're ready. If the third lamp doesn't light, hold for 10 seconds. — E."

Below, in different ink: "She's already tested it. I saw her."`,actions:["read"],takeable:!0,inventory:{label:"Stand note",examine:"Note from Emil."}}]}},stage:{id:"stage",name:"Stage",exits:[{direction:"west",roomId:"stage-wing"}],dreamer:{entry:`The stage. Empty now, but alive — the boards remember every foot that has crossed them. The footlights cast a warm amber glow across the worn floor.

The Cabinet stands at center stage. Beyond the curtain, the murmur of the arriving audience — a low, warm animal sound.

This is where you come alive.`,look:"The stage. Cabinet at center. Footlights warm. Curtain breathing with the air currents. The audience beyond.",ambient:"stage",items:[{id:"center-cabinet",name:"Center Cabinet",examine:`This is the new Cabinet. The one you've been building quietly for months. The mechanism is smooth, the catch precise.

It feels right. It feels dangerous.`,actions:["open","push"],takeable:!1,inventory:{label:"Center Cabinet",examine:"The new Cabinet."},onAction:{open:()=>({text:"The Cabinet door swings open silently. Velvet-lined darkness inside. Perfect.",effects:[{setFlags:{"ch01.cabinet-opened":!0}}]}),push:()=>({text:"You press the Cabinet's side. Solid. But a faint scratch on the counterweight housing catches your eye — as if recently adjusted."})}},{id:"curtain",name:"curtain",examine:"Deep red velvet, floor to ceiling. On the other side: 300 people waiting.",actions:["push","read"],takeable:!1,inventory:{label:"Curtain",examine:"The main curtain."}}]},reckoner:{entry:`The stage. 300-seat house. Standard proscenium arch. House lights at 30%, footlights at full.

The performance Cabinet is at center stage, DS-C. Trapdoor confirmed operational. Curtain drawn.

Orchestra pit: Fauré "Pavane" underway. Conductor at bar 46 — score still marked at bar 47 for the vanish cue. Discrepancy of 1 bar.`,look:'Stage. Cabinet at DS-C. Trapdoor confirmed. House lights dim. Orchestra running "Pavane" — bar discrepancy noted. Curtain drawn.',ambient:"stage",items:[{id:"trapdoor",name:"trapdoor",examine:'Beneath the Cabinet. Recently oiled — fresh machine oil. A scrap of paper in the hinge: "Counterweight checked — E."',actions:["open","push"],takeable:!1,inventory:{label:"Trapdoor",examine:"The stage trapdoor."}},{id:"orchestra",name:"orchestra pit",examine:'The orchestra plays "Pavane." The conductor gestures emphatically. His score marks the vanish cue at bar 47, but he just finished bar 46 and the music suggests the cue is sooner.',actions:["read"],takeable:!1,inventory:{label:"Orchestra",examine:"The orchestra pit."}}]}}},triggers:[{id:"movement-1-done",when:[{flag:"ch01.emils-note-read",value:!0}],once:!0,then:[{setFlags:{"ch01.running-order-confirmed":!0}}]},{id:"movement-2-dreamer",when:[{flag:"ch01.notebook-page-found",value:!0}],once:!0,then:[{setFlags:{"ch01.safety-release-visible":!0}}]},{id:"movement-2-reckoner",when:[{flag:"ch01.schematics-read",value:!0}],once:!0,then:[{setFlags:{"ch01.counterweight-warning":!0}}]},{id:"movement-3-dreamer",when:[{flag:"ch01.release-checked",value:!0}],once:!0,then:[{setFlags:{"ch01.movement-3-ready":!0}}]},{id:"all-movements-done",when:[{flag:"ch01.running-order-confirmed",value:!0},{flag:"ch01.release-checked",value:!0}],once:!0,then:[{setFlags:{"ch01.complete":!0}}]}]},S={id:"sp01",title:"First Light (stub)",starts:{dreamer:"tomas-desk",reckoner:"tomas-desk"},cast:{protagonist:"Tomás"},usesJournal:!0,prologue:`The lamp is on. The journal is open. The translation has stopped.

Close your eyes.`,epilogue:`You surface, slowly. The radio is still on. The journal is full of a stranger's day.

For a moment you almost wonder. Then you do not.

You close the book.`,completionFlag:"sp01.complete",movements:[{id:"prologue",title:"The Flat",mode:"neutral",rooms:["tomas-desk"],transitionOut:"You lean back. The chair creaks. The lamp is the last thing you see."},{id:"m1-window",title:"The Window",mode:"dreamer",rooms:["capsule"],transitionIn:"Pressure in your ears. Slow breathing that is not yours. Somewhere far below, a surface that does not resolve.",transitionOut:"You wake. Your hand is on the journal. You write."},{id:"m2-desk",title:"The Desk",mode:"reckoner",rooms:["cosmonaut-office"],transitionIn:"The radiator clanks. Morning. You sit at a desk that is not yours and pick up a pen that is not yours either."}],rooms:{"tomas-desk":{id:"tomas-desk",name:"Tomás's Desk",exits:[{direction:"north",roomId:"capsule"}],neutral:{entry:"A small flat. The desk is by the window, the courtyard is dark, the radio is playing something almost recognisable. The journal is open. You have been staring at the same paragraph for an hour.",look:"Your desk, your typewriter, your unwashed coffee cup. The journal lies open. There is nowhere to go but to sleep.",items:[{id:"journal-on-desk",name:"the journal",examine:`Six weeks of entries. Most of them brief. One of them ends, mid-sentence, with "I don't know who he is."`,actions:["read"],takeable:!1,inventory:{label:"",examine:""}}]}},capsule:{id:"capsule",name:"A Small Chamber",exits:[{direction:"north",roomId:"cosmonaut-office",blockedBy:"window.read"}],dreamer:{entry:`Curved walls. One small round window. Pressure. Your breathing — his breathing — slow and trained.

Beyond the window, something that is not sky.`,look:"The chamber is small. The window is small. Your gloved hands rest on a panel of switches you somehow know how to use.",items:[{id:"window",name:"the window",examine:"Curved glass. A number is etched into the inside of the lower rim, where no observer would ever look.",actions:["read"],takeable:!1,inventory:{label:"",examine:""},onAction:{read:r=>({text:`Seven. Three. One. Four.

You write it down without thinking.`,effects:[{setFlags:{"window.read":!0}},{addJournalEntry:{id:"number-7314",label:"A number etched in the window",body:"7 3 1 4. Inside the lower rim of the curved glass. He counted it three times and settled on it."}},{enableExit:{direction:"north",roomId:"cosmonaut-office"}}]})}}]}},"cosmonaut-office":{id:"cosmonaut-office",name:"A Cosmonaut's Office",exits:[],reckoner:{entry:`A narrow institutional room. A wooden desk. A steam radiator. A typewriter. Through the window, a forest road and the corner of a hangar.

On the desk, a signature confirmation form waits for a four-digit code.`,look:'The form is laid out precisely. Above the blank for the confirmation code is the line: "Enter only if you are the addressee and have been given the code orally."',items:[{id:"form",name:"the form",examine:"A typewritten confirmation form. The line for the code is blank.",actions:["use","read"],takeable:!1,inventory:{label:"",examine:""},onAction:{read:r=>({text:"Standard procedural language. Sign, countersign, file."}),use:r=>r.journal.some(e=>e.id==="number-7314")?{text:`You write 7 3 1 4 in the blank, slowly, in his hand.

The form is signed.`,effects:[{setFlags:{"sp01.complete":!0}},{complete:!0}]}:{text:"You do not know the code. Not yet."}}}]}}},triggers:[]},q={ch01:C},$={sp01:S};function D(){const r=document.getElementById("app"),t=new F,e={onPickMode:n=>{if(n==="together")O(r,e);else{const s=f.load("solo","dreamer",$);if(s&&!s.state.completed){I(r,s.state.side,s,t);return}f.clearSave("solo","dreamer","sp01"),A(r,t)}},onPickSide:n=>{const s=f.load("together",n,q);if(s&&!s.state.completed){I(r,n,s,t);return}f.clearSave("together",n,"ch01"),R(r,n,t)},onNewGame:()=>{E(r,e)},onSave:()=>{},onNavigate:()=>({text:"",roomChanged:!1,movementChanged:!1}),onAct:()=>"",onUseItemOnRoom:()=>""};E(r,e)}function A(r,t){const e=new f("solo","dreamer",S);y(r,e.state.side,e,t)}function I(r,t,e,n){const s=e.chapter.title,o=e.getCurrentRoom().name;r.innerHTML=`
    <div id="side-select">
      <div class="side-select-content">
        <h1 class="side-select-title">Resume Game</h1>
        <p class="side-select-subtitle">You have a saved game in ${s} (${o})</p>
        <div class="side-select-buttons">
          <button class="side-btn dreamer-btn" id="resume-yes">
            <span class="side-btn-label">Continue</span>
            <span class="side-btn-desc">Pick up where you left off</span>
          </button>
          <button class="side-btn reckoner-btn" id="resume-no">
            <span class="side-btn-label">New Game</span>
            <span class="side-btn-desc">Start over from the beginning</span>
          </button>
        </div>
      </div>
    </div>
  `,document.getElementById("resume-yes").addEventListener("click",()=>{y(r,t,e,n)}),document.getElementById("resume-no").addEventListener("click",()=>{f.clearSave(e.mode,t,e.chapter.id),e.mode==="solo"?A(r,n):R(r,t,n)})}function R(r,t,e){const n=new f("together",t,C);y(r,t,n,e)}function y(r,t,e,n){var a;n.init().then(()=>{var i;n.setAmbient(((i=e.getPerspective())==null?void 0:i.ambient)??"default")}).catch(()=>{});const s={onNavigate:i=>{var l,m,d;const c=e.navigate(i);return c.roomChanged&&(n.setAmbient(((l=e.getPerspective())==null?void 0:l.ambient)??"default"),e.save()),{text:c.text,roomChanged:c.roomChanged,movementChanged:c.movementChanged,transitionOut:(m=c.previousMovement)==null?void 0:m.transitionOut,transitionIn:(d=c.currentMovement)==null?void 0:d.transitionIn}},onAct:(i,c)=>{const l=e.act(i,c);return e.save(),l.text},onUseItemOnRoom:(i,c)=>{const l=e.useInventoryItemOnRoom(i,c);return e.save(),l.text},onSave:()=>{e.save()},onPickSide:()=>{},onPickMode:()=>{},onNewGame:()=>{}},o=new N(r,e,n,s);!((a=e.state.roomStates[e.state.currentRoom])!=null&&a.visited)&&e.chapter.prologue&&o.showPrologue(e.chapter.prologue)}D();
