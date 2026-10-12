import re
s=open('src/app_base.html',encoding='utf8').read()
def rep(old,new,count=1):
    global s
    assert s.count(old)>=1, old[:60]
    s=s.replace(old,new,count)

# ---------- CSS ----------
css='''
/* modes equipes */
#mainEq{position:relative;flex:1;display:none;flex-direction:column;gap:1.4vh;padding:0 16px 14px;min-height:0}
#mainEq.on{display:flex}
#eqBar{text-align:center;display:flex;flex-direction:column;align-items:center;gap:4px}
#eqStatus{font-size:clamp(20px,4.2vw,40px);font-weight:800;color:var(--acc2);padding:2px 22px;border-radius:999px;min-height:1.3em;transition:background .2s}
#eqInfo{font-size:clamp(12px,1.8vw,15px);color:var(--sub);word-break:break-all}
#eqZones{flex:1;min-height:0;display:grid;gap:2vmin;grid-template-columns:repeat(var(--cols,2),1fr);grid-auto-rows:1fr}
.zone{border:0;border-radius:3vmin;color:#fff;font-family:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.3em;min-height:0;min-width:0;
  background:radial-gradient(circle at 36% 30%,var(--z1),var(--z) 62%,var(--z2));
  box-shadow:0 0 0 .7vmin rgba(255,255,255,.35),0 2vmin 4vmin rgba(0,0,0,.5),inset 0 -2vmin 4vmin rgba(0,0,0,.25),inset 0 1.5vmin 3vmin rgba(255,255,255,.25);transition:transform .06s,filter .2s,opacity .2s}
.zone:active{transform:scale(.97)}
.zone .zn{font-size:clamp(20px,5.5vw,64px);font-weight:900;text-shadow:0 .06em .18em rgba(0,0,0,.55);padding:0 .3em;text-align:center;line-height:1.05}
.zone .zs{font-size:clamp(18px,3.8vw,42px);font-weight:800;background:rgba(0,0,0,.3);padding:.05em .7em;border-radius:999px;font-variant-numeric:tabular-nums}
.zone.off{filter:grayscale(.8) brightness(.55);cursor:default}
.zone.out{filter:grayscale(1) brightness(.38);cursor:default}
.zone.lose{opacity:.4;cursor:default}
.zone.win{box-shadow:0 0 0 1vmin #fff,0 0 7vmin var(--z),inset 0 1.5vmin 3vmin rgba(255,255,255,.3);animation:gagne .7s ease-in-out infinite alternate}
@keyframes gagne{from{transform:scale(1)}to{transform:scale(1.025)}}
#mainEq.hote .zone,#mainEq.hote .zone:active{cursor:default;transform:none}
#eqScores{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.chip{display:flex;align-items:center;gap:6px;border:2px solid var(--line);background:var(--panel);border-radius:999px;padding:4px 6px 4px 12px;font-size:clamp(13px,2vw,17px)}
.chip i{font-style:normal;font-weight:800;min-width:1.6em;text-align:center;color:var(--acc2);font-variant-numeric:tabular-nums}
.chip button{width:30px;height:30px;border-radius:50%;border:1px solid var(--line);background:rgba(255,255,255,.1);color:var(--txt);font-size:16px;cursor:pointer;padding:0}
#eqCtl{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
#eqCtl .tool{font-weight:700;padding:12px 18px;font-size:clamp(14px,2.2vw,19px)}
#eqCtl .tool[disabled]{opacity:.35;cursor:default}
#g_open{background:linear-gradient(var(--acc2),var(--accd));color:#1a1a1a;border:0}
#g_good{background:#2e7d32;border-color:#66bb6a}#g_bad{background:#c62828;border-color:#ef5350}
#join{position:fixed;inset:0;background:rgba(0,0,0,.72);display:none;align-items:center;justify-content:center;z-index:9;padding:14px}
#join.on{display:flex}
#joinBox{width:min(94vw,440px);background:linear-gradient(160deg,var(--bg1),var(--bg2));border:1px solid var(--line);border-radius:20px;padding:18px;text-align:center}
#joinBox h2{margin:0 0 14px;color:var(--acc);font-size:20px}
#joinBox button{display:block;width:100%;margin:8px 0;padding:16px;font-size:20px;font-weight:800;color:#fff;border:0;border-radius:14px;cursor:pointer;font-family:inherit;text-shadow:0 1px 3px rgba(0,0,0,.5)}
label.chk{display:flex;gap:10px;align-items:center;margin:0 0 14px;font-size:14px;color:var(--sub)}
label.chk input{width:20px;height:20px;accent-color:var(--acc)}
.eqrow{display:flex;gap:10px;align-items:center;margin-bottom:8px}
.eqrow input[type=text]{flex:1;padding:10px 12px;font-size:16px;border-radius:10px;border:1px solid var(--line);background:rgba(0,0,0,.28);color:var(--txt);font-family:inherit}
.mode{display:block;padding:12px 14px;border-radius:14px;cursor:pointer;border:2px solid transparent;background:rgba(0,0,0,.2);margin-bottom:10px}
.mode.sel{border-color:var(--acc);background:rgba(255,255,255,.1)}
.mode b{display:block;font-size:16px}.mode small{display:block;margin-top:3px;color:var(--sub);font-size:13px;line-height:1.35}
'''
rep("#toast{position:fixed",css+"\n#toast{position:fixed")

# ---------- HTML ----------
rep('<header>','<header>',1)
rep('  <button class="tool" id="raz"></button>','  <button class="tool" id="raz"></button>\n  <button class="tool" id="chg" style="display:none"></button>')
rep('<main>\n  <button id="btn">','<main id="mainJury">\n  <button id="btn">')
mainEq='''<main id="mainEq">
  <div id="eqBar"><div id="eqStatus"></div><div id="eqInfo"></div></div>
  <div id="eqZones"></div>
  <div id="eqScores"></div>
  <div id="eqCtl">
    <button class="tool" id="g_open"></button>
    <button class="tool" id="g_good"></button>
    <button class="tool" id="g_bad"></button>
    <button class="tool" id="g_cancel"></button>
  </div>
</main>
<div id="join"><div id="joinBox"><h2 id="joinT"></h2><div id="joinL"></div></div></div>
'''
rep('<div id="reg"><div id="boite">',mainEq+'<div id="reg"><div id="boite">')
panes='''    <div class="pane" data-p="mode">
      <div id="modes"></div>
      <p class="aide" id="netInfo"></p>
      <p class="aide" data-t="keys"></p>
    </div>
    <div class="pane" data-p="equipes">
      <label class="f"><span data-t="f_nbeq"></span><select id="i_nbeq"><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option></select></label>
      <p class="aide" data-t="eq_noms"></p>
      <div id="eqRows"></div>
      <label class="f"><span data-t="f_points"></span><input type="text" inputmode="numeric" id="i_pts" maxlength="3"></label>
      <label class="f"><span data-t="f_rep"></span><input type="text" inputmode="numeric" id="i_rep" maxlength="3"></label>
      <label class="chk"><input type="checkbox" id="i_excl"><span data-t="f_excl"></span></label>
    </div>
'''
rep('    <div class="pane" data-p="theme">',panes+'    <div class="pane" data-p="theme">')

# ---------- textes ----------
fr='''      o_mode:"Mode", o_equipes:"Équipes", keys:"Clavier : Espace = ouvrir la question · G = bonne réponse · M = mauvaise · 1 à 8 = buzzer de l'équipe (écran unique) · en mode jury : Espace/Entrée = buzzer, R = remise à zéro.",
      mode_jury:"Jury — compteur d'erreurs", mode_jury_d:"Un seul buzzer : le jury appuie quand le candidat se trompe.",
      mode_local:"Équipes — un seul écran", mode_local_d:"Une grande zone par équipe sur le même écran. La première équipe qui appuie prend la main.",
      mode_reseau:"Équipes — un appareil par équipe", mode_reseau_d:"Chaque équipe buzze depuis son téléphone ; l'animateur pilote depuis l'ordinateur. Nécessite le petit serveur (voir LISEZ-MOI), sur le même réseau Wi-Fi.",
      f_nbeq:"Nombre d'équipes", eq_noms:"Nom et couleur de chaque équipe (laisser vide = nom par défaut)", f_points:"Points par bonne réponse", f_rep:"Temps pour répondre, en secondes (0 = sans chrono)", f_excl:"Une équipe qui se trompe reste bloquée pour la question", eq:"Équipe",
      g_open:"Ouvrir la question", g_next:"Question suivante", g_good:"✔ Bonne réponse", g_bad:"✘ Mauvaise réponse", g_cancel:"Annuler", g_resetsc:"Scores à zéro", g_resetq:"Remettre tous les scores à zéro ?",
      st_closed:"En attente de la question…", st_open:"Buzzez !", st_has:"{x} a la main", st_you:"Vous avez la main !", st_blocked:"Vous êtes bloqué pour cette question", st_time:"Temps écoulé", st_wait:"En attente de l'animateur…", st_lost:"Connexion perdue… reconnexion",
      net_need:"Ce mode nécessite le serveur : lancez-le sur l'ordinateur de l'animateur, puis ouvrez cette page à l'adresse « Animateur » qu'il affiche (http://localhost:3000).", net_ok:"Serveur connecté.", net_teams:"Équipes, ouvrez :", net_dev:"appareil(s) connecté(s)", net_pin:"Code animateur (affiché par le serveur) ?", join_titre:"Choisissez votre équipe", join_chg:"Changer d'équipe",'''
en='''      o_mode:"Mode", o_equipes:"Teams", keys:"Keyboard: Space = open question · G = correct · M = wrong · 1–8 = team buzz (single screen) · jury mode: Space/Enter = buzz, R = reset.",
      mode_jury:"Jury — mistake counter", mode_jury_d:"A single buzzer: the judges press when the contestant makes a mistake.",
      mode_local:"Teams — single screen", mode_local_d:"One big zone per team on the same screen. The first team to press gets the floor.",
      mode_reseau:"Teams — one device per team", mode_reseau_d:"Each team buzzes from its own phone; the host controls from a computer. Needs the small server (see README), on the same Wi-Fi network.",
      f_nbeq:"Number of teams", eq_noms:"Name and colour of each team (leave empty for the default name)", f_points:"Points per correct answer", f_rep:"Time to answer, in seconds (0 = no timer)", f_excl:"A team that answers wrong stays locked out for the question", eq:"Team",
      g_open:"Open question", g_next:"Next question", g_good:"✔ Correct", g_bad:"✘ Wrong", g_cancel:"Cancel", g_resetsc:"Reset scores", g_resetq:"Reset all scores to zero?",
      st_closed:"Waiting for the question…", st_open:"Buzz now!", st_has:"{x} has the floor", st_you:"You have the floor!", st_blocked:"You are locked out for this question", st_time:"Time's up", st_wait:"Waiting for the host…", st_lost:"Connection lost… reconnecting",
      net_need:"This mode needs the server: start it on the host's computer, then open this page at the “Host” address it shows (http://localhost:3000).", net_ok:"Server connected.", net_teams:"Teams, open:", net_dev:"device(s) connected", net_pin:"Host code (shown by the server)?", join_titre:"Choose your team", join_chg:"Change team",'''
ar='''      o_mode:"النمط", o_equipes:"الفرق", keys:"لوحة المفاتيح: مسافة = فتح السؤال · G = إجابة صحيحة · M = خاطئة · 1–8 = زر الفريق (شاشة واحدة) · نمط اللجنة: مسافة/إدخال = جرس، R = تصفير.",
      mode_jury:"لجنة التحكيم — عدّاد الأخطاء", mode_jury_d:"جرس واحد: تضغط اللجنة عندما يخطئ المتسابق.",
      mode_local:"فرق — شاشة واحدة", mode_local_d:"مساحة كبيرة لكل فريق على الشاشة نفسها. أول فريق يضغط يأخذ الكلمة.",
      mode_reseau:"فرق — جهاز لكل فريق", mode_reseau_d:"كل فريق يضغط من هاتفه، والمقدّم يتحكم من الحاسوب. يتطلب الخادم الصغير (انظر التعليمات) على شبكة الواي فاي نفسها.",
      f_nbeq:"عدد الفرق", eq_noms:"اسم ولون كل فريق (اتركوه فارغًا للاسم الافتراضي)", f_points:"النقاط لكل إجابة صحيحة", f_rep:"وقت الإجابة بالثواني (0 = بلا مؤقت)", f_excl:"الفريق المخطئ يبقى محظورًا في هذا السؤال", eq:"فريق",
      g_open:"فتح السؤال", g_next:"السؤال التالي", g_good:"✔ صحيحة", g_bad:"✘ خاطئة", g_cancel:"إلغاء", g_resetsc:"تصفير النقاط", g_resetq:"تصفير كل النقاط؟",
      st_closed:"في انتظار السؤال…", st_open:"اضغطوا!", st_has:"{x} لديه الكلمة", st_you:"لديكم الكلمة!", st_blocked:"أنتم محظورون في هذا السؤال", st_time:"انتهى الوقت", st_wait:"في انتظار المقدّم…", st_lost:"انقطع الاتصال… إعادة المحاولة",
      net_need:"هذا النمط يتطلب الخادم: شغّلوه على حاسوب المقدّم ثم افتحوا هذه الصفحة على عنوان «المقدّم» (http://localhost:3000).", net_ok:"الخادم متصل.", net_teams:"الفرق، افتحوا:", net_dev:"جهاز متصل", net_pin:"رمز المقدّم (يعرضه الخادم)؟", join_titre:"اختاروا فريقكم", join_chg:"تغيير الفريق",'''
rep('t:{ titre0:"Bienvenue','t:{ titre0:"Bienvenue') if False else None
rep('fr:{ titre0:"Bienvenue — configurez votre concours",','fr:{ titre0:"Bienvenue — configurez votre concours",\n'+fr)
rep('en:{ titre0:"Welcome — set up your contest",','en:{ titre0:"Welcome — set up your contest",\n'+en)
rep('ar:{ titre0:"مرحبًا — أعدّوا مسابقتكم",','ar:{ titre0:"مرحبًا — أعدّوا مسابقتكم",\n'+ar)
# fallback langues
rep('  /* ---------- themes ---------- */','  ["en","ar"].forEach(function(l){ var b=T.fr, o=T[l]; for(var k in b) if(o[k]===undefined) o[k]=b[k]; });\n\n  /* ---------- themes ---------- */')

# ---------- config ----------
rep('var DEF={ nom:"",','var TEAM_COL=["#e53935","#1e88e5","#43a047","#fb8c00","#8e24aa","#00acc1","#fdd835","#6d4c41"];\n  var DEF={ mode:"jury", nbEq:2, teams:TEAM_COL.map(function(c){ return {n:"",c:c}; }), points:1, reponse:0, exclure:true, nom:"",')
rep('cfg={}; for(var k in DEF) cfg[k]=(o[k]===undefined?DEF[k]:o[k]);',
    'cfg={}; for(var k in DEF) cfg[k]=(o[k]===undefined?DEF[k]:o[k]);\n    if(!Array.isArray(cfg.teams)||cfg.teams.length<8) cfg.teams=DEF.teams.map(function(d,i){ return (o.teams&&o.teams[i])?o.teams[i]:d; });')
rep('function sauver(){ var ok','function sauver(){ if(Eq.role==="team") return; var ok')
# L() inchange. appliquer: hooks
rep('    if(!$("msg").dataset.k) $("msg").textContent="";\n  }','    if(!$("msg").dataset.k) $("msg").textContent="";\n    majMode(); pousserConfig();\n  }')
# flash couleur rouge par defaut en jury
rep('    if(!muet) jouerSon(cfg.son);\n    n++;','    if(!muet) jouerSon(cfg.son);\n    flash.style.background="";\n    n++;')
# onglets dynamiques
rep('var ONGLETS=["concours","theme","sons","donnees"], ongletCourant="concours", premierLancement=false;',
    'var ongletCourant="concours", premierLancement=false;\n  function lesOnglets(){ return cfg.mode==="jury"?["concours","mode","theme","sons","donnees"]:["concours","mode","equipes","theme","sons","donnees"]; }')
rep('ONGLETS.forEach(function(o){ var b=document.createElement("button")','lesOnglets().forEach(function(o){ var b=document.createElement("button")')
rep('bs[j].classList.toggle("on",ONGLETS[j]===ongletCourant)','bs[j].classList.toggle("on",lesOnglets()[j]===ongletCourant)')
rep('    textes(); panneaux(); listeThemes(); majCouleurs(); listeSons();\n  }','    remplirMode(); remplirEquipes();\n    textes(); panneaux(); listeThemes(); majCouleurs(); listeSons();\n  }')
# clavier : remplacer handler
old_kb=s[s.index('  document.addEventListener("keydown",function(e){\n    if(e.repeat||reg.classList.contains("on")) return;'):]
old_kb=old_kb[:old_kb.index('  });\n')+6]
new_kb='''  document.addEventListener("keydown",function(e){
    if(e.repeat||reg.classList.contains("on")) return;
    var tag=(e.target&&e.target.tagName)||""; if(tag==="INPUT"||tag==="SELECT"||tag==="TEXTAREA") return;
    if(cfg.mode==="jury"&&Eq.role!=="team"){
      if(e.key===" "||e.key==="Enter"){ e.preventDefault(); erreur(); }
      else if(e.key==="r"||e.key==="R"){ raz(); }
      return;
    }
    clavierEquipes(e);
  });
'''
s=s.replace(old_kb,new_kb)
# demarrage
rep('''  charger();
  var prem=premier();''','''  charger();
  var prem=premier();
  if(/[?&]r=equipe/.test(location.search)){ Eq.role="team"; prem=false; }''')
rep('''  appliquer();
  if(prem) ouvrir(true);
})();''','''  appliquer();
  if(Eq.role==="team") demarrerEquipe(); else { if(prem) ouvrir(true); demarrerMode(); }
})();''')
rep('  /* ---------- demarrage ---------- */','/*EQUIPES*/\n  /* ---------- demarrage ---------- */')
rep('<script>\n(function(){','<script>\n/*MOTEUR*/\n(function(){')
open('src/app_pre.html','w',encoding='utf8').write(s)
print('patched',len(s))
