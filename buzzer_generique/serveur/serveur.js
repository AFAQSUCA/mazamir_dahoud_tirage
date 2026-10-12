/* Serveur du buzzer par equipes (un appareil par equipe). Aucune dependance : il suffit d'avoir Node.js.
   Lancer :  node serveur.js            (port par defaut 3000 ; changer avec  PORT=8080 node serveur.js) */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path"), os = require("os");
const Moteur = require("./moteur.js");

const PORT = +process.env.PORT || 3000;
const PAGE = path.join(__dirname, "Buzzer_Jury_generique.html");
const PIN = process.env.PIN || String(Math.floor(1000 + Math.random() * 9000));
const HOTE = { open: 1, good: 1, bad: 1, cancel: 1, score: 1, resetScores: 1, config: 1 };

let S = Moteur.creer([{ n: "Équipe 1", c: "#e53935" }, { n: "Équipe 2", c: "#1e88e5" }]);
let P = { points: 1, reponse: 0, exclure: true };
let VUE = null;
const clients = new Set();

function adressesLocales() {
  const out = [];
  const ifs = os.networkInterfaces();
  Object.keys(ifs).forEach(function (k) { ifs[k].forEach(function (a) { if (a.family === "IPv4" && !a.internal) out.push(a.address); }); });
  return out;
}
function estLocal(req) { const a = req.socket.remoteAddress || ""; return a === "127.0.0.1" || a === "::1" || a === "::ffff:127.0.0.1"; }
function connectes() { const c = {}; clients.forEach(function (x) { if (x.role === "team" && x.team !== null) c[x.team] = (c[x.team] || 0) + 1; }); return c; }
function envoyer(c, ev, data) { try { c.res.write("event: " + ev + "\ndata: " + JSON.stringify(data) + "\n\n"); } catch (e) {} }
function diffuserEtat() { const m = { S: S, now: Date.now(), conn: connectes() }; clients.forEach(function (c) { envoyer(c, "state", m); }); }
function diffuserVue() { clients.forEach(function (c) { envoyer(c, "cfg", { view: VUE }); }); }
function json(res, code, obj) { res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store" }); res.end(JSON.stringify(obj)); }

const serveur = http.createServer(function (req, res) {
  const url = new URL(req.url, "http://x");
  if (req.method === "GET" && url.pathname === "/") {
    fs.readFile(PAGE, function (e, d) {
      if (e) { res.writeHead(500); return res.end("Fichier Buzzer_Jury_generique.html introuvable a cote de serveur.js"); }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }); res.end(d);
    });
    return;
  }
  if (req.method === "GET" && url.pathname === "/api/info") {
    const ips = adressesLocales();
    return json(res, 200, { ok: 1, urls: ips.map(function (ip) { return "http://" + ip + ":" + PORT + "/?r=equipe"; }), local: estLocal(req), pin: estLocal(req) ? PIN : null });
  }
  if (req.method === "GET" && url.pathname === "/events") {
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no" });
    res.write("retry: 1500\n\n");
    const t = url.searchParams.get("team");
    const c = { res: res, role: url.searchParams.get("role") === "host" ? "host" : "team", team: t === null || t === "" ? null : +t };
    clients.add(c);
    envoyer(c, "cfg", { view: VUE });
    envoyer(c, "state", { S: S, now: Date.now(), conn: connectes() });
    diffuserEtat();
    req.on("close", function () { clients.delete(c); diffuserEtat(); });
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/action") {
    let body = "";
    req.on("data", function (d) { body += d; if (body.length > 3e6) req.destroy(); });
    req.on("end", function () {
      let a; try { a = JSON.parse(body); } catch (e) { return json(res, 400, { err: "json" }); }
      if (!a || typeof a.type !== "string") return json(res, 400, { err: "type" });
      if (HOTE[a.type] && !estLocal(req) && req.headers["x-pin"] !== PIN) return json(res, 403, { err: "pin" });
      let ch = false;
      if (a.type === "config") {
        if (a.view) VUE = a.view;
        if (a.params) P = { points: +a.params.points || 1, reponse: +a.params.reponse || 0, exclure: a.params.exclure !== false };
        if (Array.isArray(a.teams) && a.teams.length >= 2 && a.teams.length <= 8) Moteur.appliquer(S, { type: "teams", list: a.teams }, P, Date.now());
        diffuserVue(); diffuserEtat(); return json(res, 200, { ok: 1 });
      }
      ch = Moteur.appliquer(S, a, P, Date.now());
      if (ch) diffuserEtat();
      json(res, 200, { ok: 1, changed: ch });
    });
    return;
  }
  res.writeHead(404); res.end("Introuvable");
});
setInterval(function () { clients.forEach(function (c) { try { c.res.write(": ping\n\n"); } catch (e) {} }); }, 15000);

serveur.listen(PORT, "0.0.0.0", function () {
  console.log("\n  BUZZER PAR EQUIPES - serveur demarre\n");
  console.log("  Animateur (cet ordinateur) :  http://localhost:" + PORT + "/");
  const ips = adressesLocales();
  if (ips.length) ips.forEach(function (ip) { console.log("  Equipes (telephones)       :  http://" + ip + ":" + PORT + "/?r=equipe"); });
  else console.log("  (aucune adresse reseau trouvee : connectez cet ordinateur au Wi-Fi ou activez le partage de connexion)");
  console.log("  Code animateur (pour piloter depuis un autre appareil) : " + PIN + "\n");
  console.log("  Laissez cette fenetre ouverte pendant le concours. Ctrl+C pour arreter.\n");
});
