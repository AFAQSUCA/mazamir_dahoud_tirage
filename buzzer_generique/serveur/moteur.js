/* Moteur de jeu "premier a buzzer a la main" - partage par la page (mode un seul ecran) et par le serveur. */
(function (root, f) { if (typeof module === "object" && module.exports) module.exports = f(); else root.Moteur = f(); })(this, function () {
  function creer(defs) {
    return { phase: "closed", winner: null, excluded: [], round: 0, deadline: 0, last: null,
      teams: defs.map(function (d) { return { n: d.n, c: d.c, score: 0 }; }) };
  }
  // retourne true si l'etat a change
  function appliquer(S, a, P, now) {
    P = P || {};
    switch (a.type) {
      case "open":
        S.phase = "open"; S.winner = null; S.excluded = []; S.round++; S.deadline = 0; S.last = null; return true;
      case "buzz":
        if (S.phase !== "open" || !S.teams[a.team] || S.excluded.indexOf(a.team) >= 0) return false;
        S.phase = "locked"; S.winner = a.team; S.last = null;
        S.deadline = P.reponse > 0 ? now + P.reponse * 1000 : 0; return true;
      case "good":
        if (S.phase !== "locked") return false;
        S.teams[S.winner].score += (P.points || 1);
        S.last = { team: S.winner, res: "good" }; S.phase = "closed"; S.winner = null; S.deadline = 0; return true;
      case "bad":
        if (S.phase !== "locked") return false;
        S.last = { team: S.winner, res: "bad" };
        if (P.exclure !== false) { S.excluded.push(S.winner); S.phase = S.excluded.length < S.teams.length ? "open" : "closed"; }
        else S.phase = "open";
        S.winner = null; S.deadline = 0; return true;
      case "cancel":
        if (S.phase === "closed") return false;
        S.phase = "closed"; S.winner = null; S.deadline = 0; return true;
      case "score":
        if (!S.teams[a.team]) return false;
        S.teams[a.team].score += (a.delta | 0); return true;
      case "resetScores":
        S.teams.forEach(function (t) { t.score = 0; }); return true;
      case "teams":
        S.teams = a.list.map(function (d, i) { return { n: d.n, c: d.c, score: S.teams[i] ? S.teams[i].score : 0 }; });
        if (S.winner !== null && !S.teams[S.winner]) { S.winner = null; S.phase = "closed"; S.deadline = 0; }
        S.excluded = S.excluded.filter(function (i) { return i < S.teams.length; });
        if (S.last && !S.teams[S.last.team]) S.last = null;
        return true;
    }
    return false;
  }
  return { creer: creer, appliquer: appliquer };
});
