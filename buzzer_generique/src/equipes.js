  /* ================= MODES EQUIPES ================= */
  var Eq={ S:null, role:"local", team:null, es:null, off:0, dispo:false, info:null, conn:{}, ok:false, pin:"", last:"", timer:null, pushH:null };

  function nomEq(i){ var t=cfg.teams[i]; return (t&&t.n&&t.n.trim())||(L().eq+" "+(i+1)); }
  function teamDefs(){ var o=[]; for(var i=0;i<cfg.nbEq;i++) o.push({n:nomEq(i),c:cfg.teams[i].c}); return o; }
  function params(){ return { points:Math.max(1,parseInt(cfg.points,10)||1), reponse:Math.max(0,parseInt(cfg.reponse,10)||0), exclure:cfg.exclure!==false }; }
  function vue(){ return { nom:cfg.nom, sous:cfg.sous, logo:cfg.logo, c:couleursActives(), c3:cfg.c3, lang:cfg.lang, son:cfg.son }; }
  function eclaircir(hex,l){ var h=hsl(hex); return hsl2hex(h[0],h[1],l); }

  /* ----- actions ----- */
  function agir(a){
    if(Eq.role==="local"){ if(Moteur.appliquer(Eq.S,a,params(),Date.now())) etatChange(); }
    else poster(a);
  }
  function poster(a,retry){
    var h={"Content-Type":"application/json"}; if(Eq.pin) h["x-pin"]=Eq.pin;
    fetch("/api/action",{method:"POST",headers:h,body:JSON.stringify(a),keepalive:true}).then(function(r){
      if(r.status===403&&!retry&&Eq.role==="host"){ var p=prompt(L().net_pin); if(p){ Eq.pin=p.trim(); poster(a,true); } }
    }).catch(function(){});
  }
  function pousserConfig(){
    if(Eq.role!=="host"||!Eq.ok) return;
    clearTimeout(Eq.pushH);
    Eq.pushH=setTimeout(function(){ poster({type:"config",view:vue(),teams:teamDefs(),params:params()}); },350);
  }

  /* ----- demarrage selon le mode ----- */
  function arreterReseau(){ if(Eq.es){ try{ Eq.es.close(); }catch(e){} Eq.es=null; } Eq.ok=false; }
  function demarrerMode(){
    arreterReseau();
    if(cfg.mode==="local"){ Eq.role="local"; Eq.S=Moteur.creer(teamDefs()); Eq.last=""; }
    else if(cfg.mode==="reseau"){
      Eq.role="host"; Eq.S=Eq.S||Moteur.creer(teamDefs());
      detecterServeur(function(){ if(Eq.dispo) connecter(); else { rendreEq(); } });
    } else { Eq.role="local"; }
    majMode(); rendreEq();
  }
  function detecterServeur(cb){
    fetch("/api/info",{cache:"no-store"}).then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(i){ Eq.dispo=true; Eq.info=i; if(i.pin&&!Eq.pin) Eq.pin=i.pin; cb(); })
      .catch(function(){ Eq.dispo=false; Eq.info=null; cb(); });
  }
  function demarrerEquipe(){
    try{ var t=sessionStorage.getItem("buzgen_team"); if(t!==null&&t!=="") Eq.team=+t; }catch(e){}
    Eq.dispo=true; connecter(); majMode(); rendreEq();
  }
  function connecter(){
    arreterReseau();
    var url="/events?role="+(Eq.role==="host"?"host":"team")+(Eq.role==="team"&&Eq.team!==null?"&team="+Eq.team:"");
    var es=new EventSource(url); Eq.es=es;
    es.addEventListener("state",function(e){
      var m=JSON.parse(e.data); Eq.off=m.now-Date.now(); Eq.S=m.S; Eq.conn=m.conn||{};
      if(!Eq.ok){ Eq.ok=true; if(Eq.role==="host") pousserConfig(); }
      etatChange();
    });
    es.addEventListener("cfg",function(e){ var m=JSON.parse(e.data); if(Eq.role==="team"&&m.view) vueServeur(m.view); });
    es.onopen=function(){ };
    es.onerror=function(){ Eq.ok=false; rendreEq(); };
  }
  function vueServeur(v){
    cfg.nom=v.nom||""; cfg.sous=v.sous||""; cfg.logo=v.logo||""; cfg.theme="perso"; cfg.c1=v.c[0]; cfg.c2=v.c[1]; cfg.c3=v.c3||cfg.c3; cfg.lang=v.lang||cfg.lang; cfg.son=v.son||cfg.son;
    appliquer();
  }

  /* ----- affichage ----- */
  function colonnes(n){
    var port=window.innerHeight>window.innerWidth;
    if(Eq.role==="team") return 1;
    if(port) return n<=2?1:2;
    return n<=3?n:(n<=4?2:(n<=6?3:4));
  }
  function majMode(){
    var eqMode=(Eq.role==="team")||cfg.mode!=="jury";
    $("mainJury").style.display=eqMode?"none":"";
    $("mainEq").className=eqMode?("on"+(Eq.role==="host"?" hote":"")):"";
    $("raz").style.display=(eqMode)?"none":"";
    var team=Eq.role==="team";
    $("rg").style.display=team?"none":"";
    $("chg").style.display=team?"":"none"; $("chg").textContent=L().join_chg;
    $("eqCtl").style.display=team?"none":"flex";
    $("g_open").textContent=(Eq.S&&Eq.S.round>0&&Eq.S.phase!=="closed")||(Eq.S&&Eq.S.last)?L().g_next:L().g_open;
    $("g_good").textContent=L().g_good; $("g_bad").textContent=L().g_bad; $("g_cancel").textContent=L().g_cancel;
  }
  function statut(){
    var S=Eq.S, t=L();
    if(Eq.role==="host"||Eq.role==="team"){
      if(Eq.role==="team"||cfg.mode==="reseau"){
        if(!Eq.dispo&&Eq.role==="host") return {txt:t.net_need};
        if(!Eq.ok) return {txt:t.st_lost};
      }
    }
    if(!S) return {txt:t.st_wait};
    if(Eq.role==="team"&&Eq.team===null) return {txt:""};
    var me=Eq.role==="team"?Eq.team:null;
    if(S.phase==="closed"){
      if(S.last&&S.teams[S.last.team]) return {txt:(S.last.res==="good"?"✔ ":"✘ ")+S.teams[S.last.team].n, col:S.teams[S.last.team].c};
      return {txt:(Eq.role==="team"&&!S.round)?t.st_wait:t.st_closed};
    }
    if(S.phase==="open"){
      if(me!==null&&S.excluded.indexOf(me)>=0) return {txt:t.st_blocked};
      return {txt:t.st_open};
    }
    var w=S.teams[S.winner]; var txt=(me!==null&&me===S.winner)?t.st_you:t.st_has.replace("{x}",w.n);
    if(S.deadline){ var rem=Math.ceil((S.deadline-(Date.now()+Eq.off))/1000); txt+=rem>0?"  ·  "+rem+" s":"  ·  "+t.st_time; }
    return {txt:txt,col:w.c};
  }
  function rendreStatut(){
    var st=statut(), el=$("eqStatus");
    el.textContent=st.txt||" ";
    if(st.col){ el.style.background=st.col; el.style.color="#fff"; el.style.textShadow="0 1px 4px rgba(0,0,0,.5)"; }
    else { el.style.background=""; el.style.color=""; el.style.textShadow=""; }
    var info=$("eqInfo");
    if(Eq.role==="host"&&Eq.dispo&&Eq.info){
      var n=0; for(var k in Eq.conn) n+=Eq.conn[k];
      info.textContent=L().net_teams+" "+(Eq.info.urls.length?Eq.info.urls.join("   "):"—")+"   ·   "+n+" "+L().net_dev+(Eq.info.pin?"   ·   PIN : "+Eq.info.pin:"");
    } else info.textContent="";
  }
  function rendreEq(){
    majMode(); rendreStatut();
    var S=Eq.S, zones=$("eqZones"), sc=$("eqScores"), role=Eq.role;
    if(!S||(cfg.mode==="jury"&&role!=="team")){ zones.innerHTML=""; zones.dataset.k=""; sc.innerHTML=""; return; }
    var vis=[]; if(role==="team"){ if(Eq.team!==null&&S.teams[Eq.team]) vis=[Eq.team]; } else S.teams.forEach(function(_,i){ vis.push(i); });
    var key=role+"|"+vis.join(",")+"|"+S.teams.map(function(x){ return x.n+x.c; }).join("|")+"|"+colonnes(vis.length||1);
    if(zones.dataset.k!==key){
      zones.dataset.k=key; zones.innerHTML=""; zones.style.setProperty("--cols",colonnes(vis.length||1));
      vis.forEach(function(i){
        var b=document.createElement("button"); b.className="zone"; b.setAttribute("data-i",i);
        var c=S.teams[i].c; b.style.setProperty("--z",c); b.style.setProperty("--z1",eclaircir(c,.68)); b.style.setProperty("--z2",eclaircir(c,.28));
        b.innerHTML='<span class="zn"></span><span class="zs"></span>';
        if(role!=="host") b.addEventListener("pointerdown",function(e){ e.preventDefault(); buzzer(role==="team"?Eq.team:i); });
        zones.appendChild(b);
      });
    }
    var zs=zones.children;
    for(var j=0;j<zs.length;j++){
      var i=+zs[j].getAttribute("data-i"), cl="zone";
      if(S.phase==="closed") cl+=" off";
      else if(S.phase==="open"){ if(S.excluded.indexOf(i)>=0) cl+=" out"; }
      else { if(i===S.winner) cl+=" win"; else cl+=(S.excluded.indexOf(i)>=0?" out":" lose"); }
      zs[j].className=cl;
      zs[j].firstChild.textContent=S.teams[i].n; zs[j].lastChild.textContent=S.teams[i].score;
    }
    // bandeau des scores
    sc.innerHTML="";
    var gere=(role!=="team");
    S.teams.forEach(function(tm,i){
      var d=document.createElement("div"); d.className="chip"; d.style.borderColor=tm.c;
      d.innerHTML='<b>'+esc(tm.n)+'</b>'+(gere?'<button data-d="-1">−</button>':'')+'<i>'+tm.score+'</i>'+(gere?'<button data-d="1">+</button>':'');
      if(gere){ var bs=d.querySelectorAll("button"); for(var q=0;q<bs.length;q++) bs[q].addEventListener("click",function(){ agir({type:"score",team:i,delta:+this.getAttribute("data-d")}); }); }
      sc.appendChild(d);
    });
    if(gere){ var r=document.createElement("button"); r.className="btnS"; r.textContent=L().g_resetsc;
      r.addEventListener("click",function(){ if(confirm(L().g_resetq)) agir({type:"resetScores"}); }); sc.appendChild(r); }
    // boutons animateur
    var ph=S.phase;
    $("g_good").disabled=(ph!=="locked"); $("g_bad").disabled=(ph!=="locked"); $("g_cancel").disabled=(ph==="closed");
    // choix d'equipe (appareil d'equipe)
    var jn=$("join");
    if(role==="team"&&Eq.team===null&&S){
      $("joinT").textContent=L().join_titre; var jl=$("joinL"); jl.innerHTML="";
      S.teams.forEach(function(tm,i){ var b=document.createElement("button"); b.textContent=tm.n; b.style.background=tm.c;
        b.addEventListener("click",function(){ Eq.team=i; try{ sessionStorage.setItem("buzgen_team",i); }catch(e){} jn.className=""; connecter(); rendreEq(); });
        jl.appendChild(b); });
      jn.className="on";
    } else jn.className="";
    clearInterval(Eq.timer); if(S.phase==="locked"&&S.deadline) Eq.timer=setInterval(rendreStatut,250);
  }
  function esc(x){ return String(x).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }

  /* effets au moment ou une equipe prend la main */
  function etatChange(){
    var S=Eq.S, k=S?(S.phase==="locked"?S.round+":"+S.winner:""):"";
    if(k&&k!==Eq.last){
      if(!muet) jouerSon(cfg.son);
      var c=S.teams[S.winner].c;
      flash.style.background="radial-gradient(circle,"+c+"aa,"+c+"dd)";
      flash.classList.add("on"); void flash.offsetWidth; flash.classList.remove("on");
      if(navigator.vibrate){ try{ navigator.vibrate(Eq.role==="team"&&Eq.team===S.winner?[200,80,200]:[80]); }catch(e){} }
    }
    Eq.last=k; rendreEq();
  }
  function buzzer(i){
    if(i===null||i===undefined) return;
    var S=Eq.S; if(!S||S.phase!=="open"||S.excluded.indexOf(i)>=0) return;
    agir({type:"buzz",team:i});
  }
  function clavierEquipes(e){
    if(Eq.role==="team"){ if(e.key===" "||e.key==="Enter"){ e.preventDefault(); buzzer(Eq.team); } return; }
    var k=e.key;
    if(k===" "||k==="Enter"){ e.preventDefault(); agir({type:"open"}); }
    else if(k==="g"||k==="G") agir({type:"good"});
    else if(k==="m"||k==="M") agir({type:"bad"});
    else if(Eq.role==="local"&&/^[1-8]$/.test(k)) buzzer(+k-1);
  }
  $("g_open").addEventListener("click",function(){ agir({type:"open"}); });
  $("g_good").addEventListener("click",function(){ agir({type:"good"}); });
  $("g_bad").addEventListener("click",function(){ agir({type:"bad"}); });
  $("g_cancel").addEventListener("click",function(){ agir({type:"cancel"}); });
  $("chg").addEventListener("click",function(){ Eq.team=null; try{ sessionStorage.removeItem("buzgen_team"); }catch(e){} connecter(); rendreEq(); });
  window.addEventListener("resize",function(){ var z=$("eqZones"); if(z) z.dataset.k=""; if(Eq.S) rendreEq(); });

  /* ----- reglages : mode et equipes ----- */
  function remplirMode(){
    var t=L(), box=$("modes"); box.innerHTML="";
    [["jury","mode_jury"],["local","mode_local"],["reseau","mode_reseau"]].forEach(function(m){
      var d=document.createElement("div"); d.className="mode"+(cfg.mode===m[0]?" sel":"");
      d.innerHTML="<b>"+t[m[1]]+"</b><small>"+t[m[1]+"_d"]+"</small>";
      d.addEventListener("click",function(){
        if(cfg.mode===m[0]) return; cfg.mode=m[0]; sauver(); demarrerMode(); appliquer(); remplir();
      });
      box.appendChild(d);
    });
    var ni=$("netInfo");
    if(cfg.mode==="reseau"){
      if(Eq.dispo&&Eq.info) ni.textContent=t.net_ok+" "+t.net_teams+" "+(Eq.info.urls.join("   ")||"—");
      else ni.textContent=t.net_need;
    } else ni.textContent="";
  }
  function remplirEquipes(){
    $("i_nbeq").value=String(cfg.nbEq); $("i_pts").value=cfg.points; $("i_rep").value=cfg.reponse; $("i_excl").checked=cfg.exclure!==false;
    var box=$("eqRows"); box.innerHTML="";
    for(var i=0;i<cfg.nbEq;i++){ (function(i){
      var r=document.createElement("div"); r.className="eqrow";
      var c=document.createElement("input"); c.type="color"; c.value=cfg.teams[i].c;
      var n=document.createElement("input"); n.type="text"; n.maxLength=24; n.value=cfg.teams[i].n; n.placeholder=L().eq+" "+(i+1);
      c.addEventListener("input",function(){ cfg.teams[i].c=c.value; majEquipes(); });
      n.addEventListener("input",function(){ cfg.teams[i].n=n.value; majEquipes(); });
      r.appendChild(c); r.appendChild(n); box.appendChild(r);
    })(i); }
  }
  function majEquipes(){
    sauver();
    if(Eq.S&&Eq.role==="local") Moteur.appliquer(Eq.S,{type:"teams",list:teamDefs()},params(),Date.now());
    if(Eq.role==="host") Moteur.appliquer(Eq.S,{type:"teams",list:teamDefs()},params(),Date.now());
    rendreEq(); pousserConfig();
  }
  $("i_nbeq").addEventListener("change",function(){ cfg.nbEq=+this.value; sauver(); majEquipes(); remplirEquipes(); });
  $("i_pts").addEventListener("input",function(){ cfg.points=this.value.replace(/\D/g,""); sauver(); pousserConfig(); });
  $("i_rep").addEventListener("input",function(){ cfg.reponse=this.value.replace(/\D/g,""); sauver(); pousserConfig(); });
  $("i_excl").addEventListener("change",function(){ cfg.exclure=this.checked; sauver(); pousserConfig(); });
