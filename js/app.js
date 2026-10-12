const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let TX={},PX={},ovr=0,pages=[],docs=[],cd=null,S={wm:0,wmt:'Mehra Scanner',pin:'',pat:'',cred:''};
const st={get(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return 1}catch(e){toast('Storage full hai, kuch docs delete karo');return 0}}};
Object.assign(S,st.get('ms_s',{}));docs=st.get('ms_d',[]);
const sv=()=>st.set('ms_s',S),svd=()=>st.set('ms_d',docs);
function toast(m){const t=$('#toast');t.textContent=m;t.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.opacity=0,2400)}
const esc=s=>String(s).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';');
const hs=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const rd=f=>new Promise(r=>{const x=new FileReader;x.onload=()=>r(x.result);x.readAsDataURL(f)});
const ld=s=>new Promise(r=>{const i=new Image;i.onload=()=>r(i);i.src=s});
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c};
const cp=c=>{const n=mk(c.width,c.height);n.getContext('2d').drawImage(c,0,0);return n};
function go(n){$('#sw').hidden=!(n==1||n==2);$$('.tab').forEach((e,i)=>e.hidden=i!=n);$$('nav button').forEach((b,i)=>b.classList.toggle('on',i==n));if(n==1)rp();if(n==2)rdocs()}

/* import */
async function add(fs){toast('Load ho raha hai...');try{for(const f of fs){if(f.type=='application/pdf'){const d=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;for(let i=1;i<=d.numPages;i++){const p=await d.getPage(i),v=p.getViewport({scale:2}),c=mk(v.width,v.height);await p.render({canvasContext:c.getContext('2d'),viewport:v}).promise;const u=c.toDataURL('image/jpeg',.9);try{const tc=await p.getTextContent();TX[u]=tc.items.map(t=>t.str).join(' ');PX[u]={W:c.width,H:c.height,i:tc.items.map(t=>{const m=pdfjsLib.Util.transform(v.transform,t.transform),h=Math.hypot(m[2],m[3]);return[t.str,m[4],m[5]-h,t.width*v.scale,h*1.15]})}}catch(e){}pages.push(u)}}
else if(f.type.startsWith('image/')){const i=await ld(await rd(f)),s=Math.min(1,2200/Math.max(i.width,i.height)),c=mk(i.width*s,i.height*s);c.getContext('2d').drawImage(i,0,0,c.width,c.height);pages.push(c.toDataURL('image/jpeg',.9))}else if(/\.docx$/i.test(f.name)){await txtPages((await mammoth.extractRawText({arrayBuffer:await f.arrayBuffer()})).value)}else if(/\.xlsx?$/i.test(f.name)){const w=XLSX.read(await f.arrayBuffer());await txtPages(w.SheetNames.map(n=>n+'\n'+XLSX.utils.sheet_to_csv(w.Sheets[n])).join('\n\n'))}else if(/^text|json|csv|xml/.test(f.type)||/\.(txt|md|csv|json|html?)$/i.test(f.name)){await txtPages(await f.text())}}go(1)}catch(e){toast('File khul nahi payi')}}
$('#cam').onchange=e=>{add([...e.target.files]);e.target.value=''};$('#gal').onchange=e=>{add([...e.target.files]);e.target.value=''};

/* pages */
function rp(){$('#cnt').textContent=pages.length;$('#pg').innerHTML=pages.map((p,i)=>`<div class="th"><b>${i+1}</b><img src="${p}" alt="Page ${i+1}"><div class="ac"><button onclick="ed(${i})">✎</button><button onclick="mv(${i},-1)">←</button><button onclick="mv(${i},1)">→</button><button onclick="pages.splice(${i},1);rp()">✕</button></div></div>`).join('')||'<p class="mu">Abhi koi page nahi. Scan tab se photo lo ya file import karo.</p>';srch()}
function mv(i,d){const j=i+d;if(j<0||j>=pages.length)return;[pages[i],pages[j]]=[pages[j],pages[i]];rp()}
function clr(){if(pages.length&&!confirm('Saare pages hata dein?'))return;pages=[];cd=null;rp()}

/* export */
async function wm(src,mime,kb){const i=await ld(src),c=mk(i.width,i.height),x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(i,0,0);
if(S.wm){x.save();x.globalAlpha=.18;x.fillStyle='#000';x.font=`bold ${c.width/12}px sans-serif`;x.textAlign='center';x.translate(c.width/2,c.height/2);x.rotate(-Math.atan(c.height/c.width));x.fillText(S.wmt||'Mehra Scanner',0,0);x.restore()}return kb&&mime=='image/jpeg'?toKB(c,kb):c.toDataURL(mime,.92)}
async function dlf(F){for(const f of F){const a=document.createElement('a');a.href=URL.createObjectURL(f.blob);a.download=f.name;a.click();await new Promise(r=>setTimeout(r,300))}}
async function out(n,arr,fmt,pw,act,kb){let F=[];if(fmt=='pdf'){const J=window.jspdf.jsPDF,o={unit:'mm',format:'a4'};if(pw)o.encryption={userPassword:pw,ownerPassword:pw,userPermissions:['print']};const pd=new J(o);
for(let i=0;i<arr.length;i++){const u=await wm(arr[i],'image/jpeg',kb),im=await ld(u),s=Math.min(200/im.width,287/im.height),w=im.width*s,h=im.height*s;if(i)pd.addPage();pd.addImage(u,'JPEG',(210-w)/2,(297-h)/2,w,h)}
if(act=='dl'){pd.save(n+'.pdf');return}F.push({name:n+'.pdf',blob:pd.output('blob')})}
else for(let i=0;i<arr.length;i++){const u=await wm(arr[i],fmt=='png'?'image/png':'image/jpeg',kb);F.push({name:`${n}_${i+1}.${fmt}`,blob:await (await fetch(u)).blob()})}
if(act=='zip'){const z=new JSZip();F.forEach(f=>z.file(f.name,f.blob));F=[{name:n+'.zip',blob:await z.generateAsync({type:'blob'})}]}
if(act=='share'){const fl=F.map(f=>new File([f.blob],f.name,{type:f.blob.type}));if(navigator.canShare&&navigator.canShare({files:fl})){try{await navigator.share({files:fl,title:n})}catch(e){}return}toast('Share is device par nahi chala, download kar raha hoon')}
await dlf(F)}
function oex(){if(!pages.length)return toast('Pehle pages jodo');$('#en').value=cd!=null?docs[cd].name:'Scan_'+new Date().toLocaleDateString('en-IN').replace(/\//g,'-');$('#ex').hidden=0}
async function doex(){const n=$('#en').value.trim()||'Scan',fmt=$('#ef').value,act=$('#ea').value,kb=+$('#ek').value||0,pw=$('#ep').value,lk=$('#el').checked;
if(lk&&!(S.pin||S.pat||S.cred)){toast('Pehle Settings me lock set karo');return}
$('#ex').hidden=1;toast('Ban raha hai...');try{if(act!='none')await out(n,pages,fmt,pw,act,kb)}catch(e){toast('Export fail ho gaya');return}
const o={name:n,pages:[...pages],date:new Date().toLocaleDateString('en-IN'),lk,tx:pages.map(p=>TX[p]||'')};if(cd!=null)docs[cd]=o;else{docs.unshift(o);cd=0}
if(svd())toast('Save ho gaya');$('#ep').value=''}

/* docs */
function rdocs(){$('#dl').innerHTML=docs.map((d,i)=>({d,i})).filter(({d})=>{const q=$('#sq').value.trim().toLowerCase();return !q||d.name.toLowerCase().includes(q)||(d.tx||[]).join(' ').toLowerCase().includes(q)}).map(({d,i})=>`<div class="row"><img src="${d.pages[0]}" alt=""><div class="g"><b>${esc(d.name)}</b><small>${d.pages.length} page, ${d.date}${d.lk?' 🔒':''}</small></div><button class="dots" aria-label="Menu" onclick="menu(${i})">⋮</button></div>`).join('')||'<p class="mu">Koi document save nahi hai. Pages tab se export karo.</p>'}
function menu(i){const s=$('#sh');s.hidden=0;const b=[['ren','✏️ Rename'],['open','📝 Edit (text, highlight, crop, resize)'],['pdf','📄 PDF download'],['jpg','🖼 JPG images download'],['png','🖼 PNG images download'],['zip','🗜 ZIP me download (JPG)'],['share','📤 Share (PDF)'],['del','🗑 Delete'],['x','Band karo']];
s.innerHTML=b.map(x=>`<button onclick="act(${i},'${x[0]}')">${x[1]}</button>`).join('')}
async function act(i,a){$('#sh').hidden=1;const d=docs[i];if(a=='x'||!d)return;if(d.lk&&a!='del'&&!(await ask(1)))return;
if(a=='ren'){const n=prompt('Naya naam',d.name);if(n){d.name=n;svd();rdocs()}}
else if(a=='open'){pages=[...d.pages];(d.tx||[]).forEach((t,k)=>TX[d.pages[k]]=t);cd=i;go(1)}
else if(a=='del'){if(confirm('Delete karein?')){docs.splice(i,1);cd=null;svd();rdocs()}}
else if(a=='zip')out(d.name,d.pages,'jpg','','zip',0);else if(a=='share')out(d.name,d.pages,'pdf','','share',0);else out(d.name,d.pages,a,'','dl',0)}

/* lock */
function mkPat(el){el.seq=[];el.innerHTML=[...Array(9)].map((_,i)=>`<button type="button" data-i="${i}" aria-label="Dot ${i+1}"></button>`).join('');el.onclick=e=>{const b=e.target.closest('button');if(!b||el.seq.includes(b.dataset.i))return;el.seq.push(b.dataset.i);b.textContent=el.seq.length;b.classList.add('on')}}
const hasLk=()=>S.pin||S.pat||S.cred;
function ask(cn){return new Promise(res=>{if(!hasLk())return res(1);const o=$('#lk'),done=ok=>{o.hidden=1;res(ok)};o.hidden=0;$('#lkc').hidden=!cn;$('#lpin').hidden=!S.pin;$('#lpat').hidden=!S.pat;$('#lbio').hidden=!S.cred;$('#lpi').value='';mkPat($('#lpt'));
$('#lpb').onclick=async()=>await hs($('#lpi').value)==S.pin?done(1):toast('Galat PIN');
$('#lpab').onclick=async()=>{const q=$('#lpt');if(await hs(q.seq.join(''))==S.pat)done(1);else{toast('Galat pattern');mkPat(q)}};
$('#lbio').onclick=async()=>{if(await bioChk())done(1);else toast('Verify nahi hua')};$('#lkc').onclick=()=>done(0)})}
async function spin(){const v=$('#np').value;if(v.length<4)return toast('PIN kam se kam 4 digit ka ho');S.pin=await hs(v);sv();$('#np').value='';toast('PIN set ho gaya')}
async function spat(){const q=$('#pt');if(q.seq.length<4)return toast('Kam se kam 4 dots tap karo');S.pat=await hs(q.seq.join(''));sv();mkPat(q);toast('Pattern set ho gaya')}
async function bioSet(){try{const c=await navigator.credentials.create({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),rp:{name:'Mehra Scanner'},user:{id:crypto.getRandomValues(new Uint8Array(16)),name:'mehra',displayName:'Mehra'},pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{authenticatorAttachment:'platform',userVerification:'required'}}});S.cred=btoa(String.fromCharCode(...new Uint8Array(c.rawId)));sv();toast('Fingerprint / Face set ho gaya')}catch(e){toast('Is device ya browser me biometric nahi chala')}}
async function bioChk(){try{await navigator.credentials.get({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),allowCredentials:[{type:'public-key',id:Uint8Array.from(atob(S.cred),c=>c.charCodeAt(0))}],userVerification:'required'}});return 1}catch(e){return 0}}
async function rmlk(){if(hasLk()&&!(await ask(1)))return;S.pin=S.pat=S.cred='';sv();toast('Lock hat gaye')}
$('#wmo').checked=!!S.wm;$('#wmt').value=S.wmt;$('#wmo').onchange=e=>{S.wm=e.target.checked?1:0;sv()};$('#wmt').oninput=e=>{S.wmt=e.target.value;sv()};mkPat($('#pt'));

/* editor */
let C=$('#C'),X=C.getContext('2d'),B,f,hist,idx,mode,dm='hl',pm,pend,pts;
function draw(){C.width=B.width;C.height=B.height;X.filter=f.p+` brightness(${f.b}) contrast(${f.c})`;X.drawImage(B,0,0);X.filter='none';if($('#eq').value)esr()}
function commit(){B=cp(C);f={p:'',b:1,c:1};$('#sb').value=100;$('#sc').value=100}
function op(){ovr=0;commit();hist.push(cp(B));if(hist.length>12)hist.shift()}
function undo(){if(hist.length){B=hist.pop();f={p:'',b:1,c:1};draw()}}
async function ed(i){idx=i;const im=await ld(pages[i]);B=mk(im.width,im.height);B.getContext('2d').drawImage(im,0,0);f={p:'',b:1,c:1};hist=[];pend=0;ovr=0;$('#eq').value=$('#sq').value;draw();$('#ed').hidden=0;$('#epn').textContent=(i+1)+'/'+pages.length;ts('f')}
function edx(){$('#ed').hidden=1}
async function edn(d){const j=idx+d;if(j<0||j>=pages.length)return;commit();const o=pages[idx];pages[idx]=ovr||B.toDataURL('image/jpeg',.92);if(TX[o])TX[pages[idx]]=TX[o];rp();await ed(j)}
function esr(){$$('.hh').forEach(e=>e.remove());const q=$('#eq').value.trim().toLowerCase(),r=$('#er');if(!q){r.textContent='';return}const P=PX[pages[idx]];let n=0;if(P&&B.width==P.W&&B.height==P.H)P.i.forEach(t=>{if(t[0].toLowerCase().includes(q)){n++;const d=document.createElement('div');d.className='hh';d.style.cssText=`left:${t[1]/P.W*100}%;top:${t[2]/P.H*100}%;width:${t[3]/P.W*100}%;height:${t[4]/P.H*100}%`;$('#wr').append(d)}});const o=pages.map((p,i)=>(TX[p]||'').toLowerCase().includes(q)?i+1:0).filter(x=>x&&x!=idx+1);r.textContent=(n?n+' match is page par. ':'Is page par nahi mila. ')+(o.length?'Baaki: page '+o.join(', '):'')}
$('#eq').oninput=esr;
function eds(){commit();const o=pages[idx];pages[idx]=ovr||B.toDataURL('image/jpeg',.92);if(TX[o])TX[pages[idx]]=TX[o];edx();rp()}
function flt(p){ovr=0;f.p=p;draw()}
$('#sb').oninput=e=>{ovr=0;f.b=e.target.value/100;draw()};$('#sc').oninput=e=>{ovr=0;f.c=e.target.value/100;draw()};
function ai(){op();const d=X.getImageData(0,0,C.width,C.height),a=d.data,h=new Array(256).fill(0),n=a.length/4;for(let i=0;i<a.length;i+=4)h[(a[i]*.3+a[i+1]*.59+a[i+2]*.11)|0]++;let lo=0,hi=255,s=0;while(lo<254&&(s+=h[lo])<n*.01)lo++;s=0;while(hi>1&&(s+=h[hi])<n*.01)hi--;const k=255/Math.max(hi-lo,1);for(let i=0;i<a.length;i+=4)for(let j=0;j<3;j++)a[i+j]=(a[i+j]-lo)*k;X.putImageData(d,0,0);B=cp(C);toast('AI se saaf ho gaya')}
function rot(d){op();const n=mk(d==2?B.width:B.height,d==2?B.height:B.width),x=n.getContext('2d');x.translate(n.width/2,n.height/2);x.rotate(d*Math.PI/2);x.drawImage(B,-B.width/2,-B.height/2);B=n;draw()}
const cv=k=>+$('#c'+k).value;
function cbox(){const b=$('#cb');b.hidden=$('#tt .on')?.dataset.p!='c';b.style.cssText=`left:${cv('l')}%;top:${cv('t')}%;right:${cv('r')}%;bottom:${cv('bm')}%`}
['l','t','r','bm'].forEach(k=>{$('#c'+k).max=95;$('#c'+k).oninput=cbox});
function crp(){op();const l=cv('l')/100*B.width,t=cv('t')/100*B.height,w=B.width*(1-(cv('l')+cv('r'))/100),h=B.height*(1-(cv('t')+cv('bm'))/100),n=mk(w,h);n.getContext('2d').drawImage(B,l,t,w,h,0,0,n.width,n.height);B=n;['l','t','r','bm'].forEach(k=>$('#c'+k).value=0);draw();cbox()}
function scl(k){if(Math.max(B.width,B.height)*k>6000)return toast('Isse bada nahi ho sakta');op();const n=mk(B.width*k,B.height*k);n.getContext('2d').drawImage(B,0,0,n.width,n.height);B=n;draw();$('#rw').value=B.width;$('#rh').value=B.height;$('#ks').textContent='Ab '+B.width+'x'+B.height+' px, lagbhag '+kbOf(B.toDataURL('image/jpeg',.92))+' KB'}
function rsz(){const w=+$('#rw').value,h=+$('#rh').value;if(!w||!h)return toast('Width aur height daalo');op();const n=mk(w,h);n.getContext('2d').drawImage(B,0,0,n.width,n.height);B=n;draw()}
$('#rw').oninput=()=>{if($('#rl').checked&&B)$('#rh').value=Math.round($('#rw').value*B.height/B.width)};$('#rh').oninput=()=>{if($('#rl').checked&&B)$('#rw').value=Math.round($('#rh').value*B.width/B.height)};
$('#ipi').onchange=async e=>{if(!e.target.files[0])return;pend=await ld(await rd(e.target.files[0]));mode='img';C.style.touchAction='none';toast('Ab page par tap karo');e.target.value=''};
$('#rpi').onchange=async e=>{if(!e.target.files[0])return;const i=await ld(await rd(e.target.files[0]));op();B=mk(i.width,i.height);B.getContext('2d').drawImage(i,0,0);draw();e.target.value=''};
function sm(m){dm=m;mode=m}
function ts(p){$$('#tt button').forEach(b=>b.classList.toggle('on',b.dataset.p==p));$$('.pn').forEach(e=>e.hidden=e.id!='p_'+p);mode=p=='t'?'text':p=='d'?dm:p=='c'?'crop':null;C.style.touchAction=mode?'none':'auto';if(p=='s'){$('#rw').value=B.width;$('#rh').value=B.height;$('#ks').textContent='Abhi size lagbhag '+kbOf(B.toDataURL('image/jpeg',.92))+' KB'}cbox()}
$$('#tt button').forEach(b=>b.onclick=()=>ts(b.dataset.p));
const ps=e=>{const r=C.getBoundingClientRect();return[(e.clientX-r.left)*C.width/r.width,(e.clientY-r.top)*C.height/r.height]};
C.onpointerdown=e=>{if(!mode)return;const[x,y]=ps(e);if(mode=='crop'){pm=[x,y];C.setPointerCapture(e.pointerId);return}
if(mode=='text'){const v=$('#tx').value;if(!v)return toast('Pehle text likho');op();X.fillStyle=$('#tc').value;X.font=`bold ${C.width*$('#ts').value/100}px sans-serif`;X.textBaseline='middle';X.fillText(v,x,y);B=cp(C)}
else if(mode=='img'){if(!pend)return;op();const w=C.width*$('#iw').value/100,h=w*pend.height/pend.width;X.drawImage(pend,x-w/2,y-h/2,w,h);B=cp(C)}
else{op();pm=[x,y];pts=[pm];C.setPointerCapture(e.pointerId)}};
C.onpointermove=e=>{if(!pm)return;const[x,y]=ps(e),hl=mode=='hl';if(mode=='crop'){const c=(a,m)=>Math.max(0,Math.min(95,a/m*100));$('#cl').value=c(Math.min(pm[0],x),C.width);$('#ct').value=c(Math.min(pm[1],y),C.height);$('#cr').value=c(C.width-Math.max(pm[0],x),C.width);$('#cbm').value=c(C.height-Math.max(pm[1],y),C.height);cbox();return}pts.push([x,y]);X.drawImage(B,0,0);X.globalCompositeOperation=hl?'multiply':'source-over';X.strokeStyle=hl?'#ffe600':mode=='wh'?'#fff':$('#pc').value;X.lineWidth=C.width*$('#pw').value/(hl?250:mode=='wh'?150:1000);X.lineCap=X.lineJoin='round';X.beginPath();X.moveTo(pts[0][0],pts[0][1]);pts.forEach(q=>X.lineTo(q[0],q[1]));X.stroke();X.globalCompositeOperation='source-over';pm=[x,y]};
C.onpointerup=()=>{if(pm){if(mode!='crop')B=cp(C);pm=null}};

const kbOf=u=>Math.round(u.length*.75/1024);
async function toKB(src,kb){const im=src;let s=1,c;for(let t=0;t<10;t++){c=mk(im.width*s,im.height*s);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);let lo=.05,hi=.92,best=null;for(let k=0;k<7;k++){const m=(lo+hi)/2,u=c.toDataURL('image/jpeg',m);if(kbOf(u)<=kb){best=u;lo=m}else hi=m}if(best)return best;s*=.8}return c.toDataURL('image/jpeg',.05)}
async function cmp(){const kb=+$('#kb').value;if(!kb)return toast('Target KB daalo');op();draw();const u=await toKB(B,kb),im=await ld(u);B=mk(im.width,im.height);B.getContext('2d').drawImage(im,0,0);ovr=u;draw();$('#ks').textContent=`Ab size ${kbOf(u)} KB (${im.width}x${im.height})`;if(kbOf(u)>kb)toast('Itna chhota nahi ho paya')}
function blank(){const c=mk(1240,1754),x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,1240,1754);pages.push(c.toDataURL('image/jpeg',.9));rp()}
async function txtPages(t){const W=1240,H=1754,M=90,fs=30,L=fs*1.5;let c,x,y,cur='',buf=[];const np=()=>{c=mk(W,H);x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,W,H);x.fillStyle='#111';x.font=fs+'px sans-serif';y=M};const fin=()=>{const u=c.toDataURL('image/jpeg',.9);TX[u]=buf.join(' ');buf=[];pages.push(u)};const flush=()=>{if(y>H-M){fin();np()}buf.push(cur);x.fillText(cur,M,y);y+=L;cur=''};np();
for(const ln of t.split('\n')){cur='';for(const w of ln.split(' ')){const tt=cur?cur+' '+w:w;if(x.measureText(tt).width>W-2*M&&cur){flush();cur=w}else cur=tt}flush()}fin()}
function srch(){const q=($('#sq').value||'').trim().toLowerCase(),hit=[];$$('#pg .th').forEach((t,i)=>{const m=q&&(TX[pages[i]]||'').toLowerCase().includes(q);t.style.outline=m?'3px solid #ffb300':'';if(m)hit.push(i+1)});$('#sr').textContent=!q?'':hit.length?'Mila: page '+hit.join(', ')+' (peele frame me)':Object.keys(TX).length?'Kisi page me nahi mila':'Search ke liye text wali PDF ya text file chahiye. Photo ke andar ka text abhi search nahi hota.'}
$('#sq').oninput=()=>{srch();rdocs()};$('#g2').onchange=e=>{add([...e.target.files]);e.target.value=''};
/* batch camera */
let ST=null,cmc=0;
async function camOn(){try{ST=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920}},audio:false});$('#cmv').srcObject=ST;cmc=0;$('#cmn').textContent='0 photo';$('#cm').hidden=0}catch(e){toast('Live camera nahi khula. "Phone camera app se 1 photo" button use karo')}}
function snap(){const v=$('#cmv');if(!v.videoWidth)return;const s=Math.min(1,2200/Math.max(v.videoWidth,v.videoHeight)),c=mk(v.videoWidth*s,v.videoHeight*s);c.getContext('2d').drawImage(v,0,0,c.width,c.height);pages.push(c.toDataURL('image/jpeg',.9));cmc++;$('#cmn').textContent=cmc+' photo';toast('Page '+pages.length+' add hua')}
function camX(){if(ST)ST.getTracks().forEach(t=>t.stop());ST=null;$('#cm').hidden=1;if(cmc){go(1);ed(pages.length-cmc)}}
rp();if(hasLk())ask(0);

// --- Theme Toggle Logic ---
const themeBtn = document.getElementById('themeToggleBtn');
if (themeBtn) {
  const currentTheme = localStorage.getItem('app-theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', currentTheme);
  themeBtn.textContent = currentTheme === 'dark' ? '☀️ Light' : '🌙 Dark';

  themeBtn.addEventListener('click', () => {
    const active = document.documentElement.getAttribute('data-theme');
    const nextTheme = active === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('app-theme', nextTheme);
    themeBtn.textContent = nextTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
  });
}

// --- Help Modal Logic ---
const helpModal = document.getElementById('helpModal');
const helpBtn = document.getElementById('helpBtn');
const closeHelpBtn = document.getElementById('closeHelpBtn');

if (helpBtn && helpModal) {
  helpBtn.addEventListener('click', () => {
    helpModal.style.display = 'flex';
  });
}
if (closeHelpBtn && helpModal) {
  closeHelpBtn.addEventListener('click', () => {
    helpModal.style.display = 'none';
  });
}
window.addEventListener('click', (e) => {
  if (e.target === helpModal) {
    helpModal.style.display = 'none';
  }
});

// --- Auto Orientation Handler ---
window.addEventListener('resize', () => {
  const isLandscape = window.innerWidth > window.innerHeight;
  document.body.classList.toggle('landscape-mode', isLandscape);
});
