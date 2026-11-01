import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { build, icon, typed, esc, VO_OFFSET } from "./frame.mjs";

const N = 11;
const nn = (i) => String(i + 1).padStart(2, "0");
const durs = [...Array(N)].map((_, i) =>
  +(+execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 assets/audio/vo-${nn(i)}.mp3`).toString() + 0.9).toFixed(2),
);
const WORDS = [...Array(N)].map((_, i) =>
  JSON.parse(readFileSync(`assets/audio/vo-${nn(i)}.json`, "utf8")).Metadata.map((m) => [m.Data.text.Text.toLowerCase(), m.Data.Offset / 1e7]),
);
// start time of the nth word in scene i starting with w
const T = (i, w, n = 0) => {
  const hits = WORDS[i].filter(([t]) => t.startsWith(w.toLowerCase()));
  if (!hits[n]) throw new Error(`scene ${i + 1}: no word "${w}" #${n}`);
  return +hits[n][1].toFixed(2);
};

const scenes = [];
const HD = `tl.fromTo($(".hd"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: E }, 0.2);`;
const HDCSS = `@R .hd { position:absolute; left:140px; top:96px; }`;
const IN = (sel, t) => `tl.fromTo($("${sel}"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: E }, V(${t}));`;
const POP = (sel, t) => `tl.fromTo($("${sel}"), { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.5, ease: E }, V(${t}));`;
const sp = (s) => esc(s).replace(/ /g, "&nbsp;");
const CARD = `@R .ci { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:18px; text-align:center; }
@R .ci .ic { width:72px; height:72px; stroke-width:1.5; color:var(--green); }`;
const code = (cls, x, y, w, title, lines) => `<div class="term ${cls}" style="left:${x}px; top:${y}px; width:${w}px">
<div class="bar"><i></i><i></i><i></i><span class="mono muted">${title}</span></div>
<div class="body">${lines.map((l, i) => `<div class="mono l${i}">${l}</div>`).join("")}</div></div>`;
const kw = (s) => `<span class="y">${esc(s)}</span>`;

// 01 HOOK
const hook = [
  ["file-text", "Word", T(0, "word")],
  ["sheet", "Excel", T(0, "excel")],
  ["code-xml", "VBA", T(0, "wu")],
  ["graduation-cap", "projekt", T(0, "projekt")],
];
scenes.push({
  css: `${CARD}
@R .t1 { position:absolute; left:0; right:0; top:170px; text-align:center; font-size:112px; }
@R .t2 { position:absolute; left:0; right:0; top:310px; text-align:center; color:var(--muted); }
${hook.map((_, i) => `@R .h${i} { left:${150 + i * 420}px; top:500px; width:360px; height:280px; }`).join("\n")}
@R .t3 { position:absolute; left:0; right:0; top:860px; text-align:center; }`,
  html: `<h1 class="hd t1">Oprogramowanie <span class="g">użytkowe</span></h1>
<div class="lb t2">w dwie minuty</div>
${hook.map(([ic, n], i) => `<div class="card ci h${i}">${icon(ic)}<span class="lb">${n}</span></div>`).join("\n")}
<div class="lb t3">wszystko, co <span class="y">naprawdę</span> musisz wiedzieć</div>`,
  js: `${HD}
${IN(".t2", 1.2)}
${hook.map(([, , t], i) => POP(`.h${i}`, t)).join("\n")}
${IN(".t3", T(0, "wszystko"))}`,
});

// 02 ZASADY
scenes.push({
  css: `${HDCSS}${CARD}
@R .zj { position:absolute; left:140px; top:270px; display:flex; gap:22px; }
@R .zj span { width:200px; height:96px; border-radius:20px; border:1.5px solid var(--line); background:var(--panel); display:flex; align-items:center; justify-content:center; }
@R .p0 { left:140px; top:450px; width:780px; height:260px; }
@R .p1 { left:1000px; top:450px; width:780px; height:260px; }
@R .oc { position:absolute; left:140px; top:800px; width:1640px; text-align:center; }`,
  html: `<h1 class="hd">Jak <span class="g">zaliczyć</span>?</h1>
<div class="zj">${[1, 2, 3, 4, 5, 6, 7].map((z) => `<span class="lb z${z}">zjazd ${z}</span>`).join("")}</div>
<div class="card ci p0">${icon("sheet")}<span class="lb">Projekt 1: Excel + VBA</span></div>
<div class="card ci p1">${icon("database")}<span class="lb">Projekt 2: Access</span></div>
<div class="lb oc">ocena = <span class="g">średnia z projektów</span> + <span class="y">5 pytań</span> do każdego</div>`,
  js: `${HD}
tl.fromTo($(".zj span"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: E, stagger: 0.09 }, V(${T(1, "siedem")}));
${POP(".p0", T(1, "aplikacją"))}
${POP(".p1", T(1, "bazą"))}
${IN(".oc", T(1, "ocena"))}`,
});

// 03 ALGORYTM
const flow = [["dane wejściowe", T(2, "dane")], ["przetwarzanie", T(2, "przetwarzanie")], ["dane wyjściowe", T(2, "dane", 1)]];
const shapes = [
  ["owal", "start / stop", `<rect x="10" y="20" width="220" height="100" rx="50"/>`, T(2, "owal")],
  ["prostokąt", "operacja", `<rect x="10" y="20" width="220" height="100" rx="6"/>`, T(2, "prostokąt")],
  ["romb", "warunek", `<polygon points="120,5 235,70 120,135 5,70"/>`, T(2, "romb")],
  ["równoległobok", "wejście / wyjście", `<polygon points="50,20 235,20 190,120 5,120"/>`, T(2, "równoległobok")],
];
scenes.push({
  css: `${HDCSS}
@R .fl { position:absolute; top:270px; height:130px; width:460px; display:flex; align-items:center; justify-content:center; }
${flow.map((_, i) => `@R .f${i} { left:${140 + i * 590}px; }`).join("\n")}
@R .f1 { border-color:rgba(62,224,143,.55); }
@R .ar { position:absolute; top:312px; color:var(--muted); font-size:56px; }
@R .sh { position:absolute; top:520px; width:380px; display:flex; flex-direction:column; align-items:center; gap:14px; }
@R .sh svg { width:240px; height:140px; }
@R .sh svg * { fill:rgba(62,224,143,.08); stroke:var(--green); stroke-width:3; }
@R .sh .muted { font-size:44px; }
${shapes.map((_, i) => `@R .s${i} { left:${130 + i * 420}px; }`).join("\n")}`,
  html: `<h1 class="hd"><span class="g">Algorytm</span> = przepis</h1>
${flow.map(([n], i) => `<div class="card fl f${i}"><span class="lb">${n}</span></div>`).join("\n")}
<div class="ar a0" style="left:620px">→</div><div class="ar a1" style="left:1210px">→</div>
${shapes.map(([n, d, svg], i) => `<div class="sh s${i}"><svg viewBox="0 0 240 140">${svg}</svg><span class="lb">${n}</span><span class="lb muted">${d}</span></div>`).join("\n")}`,
  js: `${HD}
${flow.map(([, t], i) => IN(`.f${i}`, t)).join("\n")}
${IN(".a0", T(2, "przetwarzanie") - 0.2)}
${IN(".a1", T(2, "dane", 1) - 0.2)}
${shapes.map(([, , , t], i) => POP(`.s${i}`, t)).join("\n")}`,
});

// 04 WORD
const wf = [
  ["=SUM(ABOVE)", "suma powyżej", T(3, "suma")],
  ["=SUM(LEFT)", "suma z lewej", T(3, "suma", 1)],
  ["=AVERAGE(...)", "średnia", T(3, "średnia")],
  ["=MIN() =MAX()", "minimum, maksimum", T(3, "minimum")],
];
scenes.push({
  css: `${HDCSS}
@R .eq { position:absolute; left:140px; top:250px; }
@R .fr { position:absolute; left:140px; width:1000px; display:flex; gap:40px; align-items:center; }
@R .fr .mono { width:520px; color:var(--yellow); }
${wf.map((_, i) => `@R .w${i} { top:${360 + i * 100}px; }`).join("\n")}
@R .fm { left:1240px; top:360px; width:540px; height:390px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:22px; }
@R .fm .big { font-size:64px; }`,
  html: `<h1 class="hd">Word: tabela też <span class="g">liczy</span></h1>
<div class="lb eq muted">formuła zawsze zaczyna się od <span class="y">=</span></div>
${wf.map(([c, d], i) => `<div class="fr w${i}"><span class="mono">${esc(c)}</span><span class="lb">${d}</span></div>`).join("\n")}
<div class="card fm"><span class="lb muted">format liczby</span><span class="mono big g">0,00</span><span class="mono">3346,2 → 3346,20</span></div>`,
  js: `${HD}
${IN(".eq", T(3, "formuła"))}
${wf.map(([, , t], i) => IN(`.w${i}`, t)).join("\n")}
${POP(".fm", T(3, "format"))}`,
});

// 05 MAKRA
scenes.push({
  css: `${HDCSS}${CARD}
@R .rec { left:140px; top:290px; width:1640px; height:200px; flex-direction:row; gap:60px; }
@R .rec .ic { color:#ff6b5b; }
@R .ok { color:var(--green); } @R .no { color:#ff6b5b; }
@R .k0 { left:140px; top:560px; width:780px; height:300px; }
@R .k1 { left:1000px; top:560px; width:780px; height:300px; }
@R .kc { display:flex; gap:14px; }
@R .kc span { padding:10px 26px; border-radius:16px; border:2px solid var(--line); background:#0e1311; }`,
  html: `<h1 class="hd">Makro = program w <span class="g">VBA</span></h1>
<div class="card ci rec">${icon("circle-dot")}<span class="lb">Rejestrator makr</span><span class="lb ok r1">kroki ✓</span><span class="lb no r2">ruchy myszy ✗</span></div>
<div class="card ci k0">${icon("keyboard")}<div class="kc mono"><span>Ctrl</span><span>Alt</span><span>F</span></div><span class="lb muted">skrót klawiszy</span></div>
<div class="card ci k1">${icon("mouse-pointer-click")}<span class="lb">▶ Uruchom makro</span><span class="lb muted">przycisk</span></div>`,
  js: `${HD}
${IN(".rec", T(4, "rejestrator"))}
${IN(".r1", T(4, "kroki"))}
${IN(".r2", T(4, "myszy"))}
${POP(".k0", T(4, "skrótu"))}
${POP(".k1", T(4, "przycisku"))}`,
});

// 06 EXCEL
const G = 120;
scenes.push({
  css: `${HDCSS}
@R .tg { position:absolute; left:140px; top:300px; display:grid; grid-template-columns:80px repeat(3, ${G * 1.6}px); grid-auto-rows:${G * 0.8}px; border:1.5px solid var(--line); border-radius:18px; overflow:hidden; background:var(--panel); }
@R .tg span { display:flex; align-items:center; justify-content:center; border-right:1px solid var(--line); border-bottom:1px solid var(--line); }
@R .tg .h { color:var(--muted); background:#0e1311; }
@R .a1 { outline:4px solid var(--green); outline-offset:-4px; color:var(--green); }
@R .tx { position:absolute; left:900px; width:900px; }
@R .x0 { top:290px; } @R .x1 { top:370px; } @R .x2 { top:450px; }
@R .cp { position:absolute; left:900px; width:900px; display:flex; flex-direction:column; gap:8px; }
@R .c0 { top:600px; } @R .c1 { top:770px; }
@R .cp .mono b { font-weight:500; }`,
  html: `<h1 class="hd"><span class="g">Excel</span>: adres komórki</h1>
<div class="tg mono">${["", "A", "B", "C"].map((c) => `<span class="h">${c}</span>`).join("")}${[1, 2, 3]
    .map((r) => `<span class="h">${r}</span>` + ["A", "B", "C"].map((c) => `<span class="${c}${r === 1 && c === "A" ? " a1" : ""}">${r === 1 && c === "A" ? "A1" : ""}</span>`).join(""))
    .join("")}</div>
<div class="lb tx x0">skoroszyt = <span class="g">plik</span></div>
<div class="lb tx x1">arkusz = <span class="g">karta</span></div>
<div class="lb tx x2">komórka = <span class="g">adres</span></div>
<div class="cp c0"><span class="mono">=A1 <span class="muted">→</span> =C3</span><span class="lb muted">względny: przesuwa się</span></div>
<div class="cp c1"><span class="mono y">=$A$1 <span class="muted">→</span> =$A$1</span><span class="lb muted">bezwzględny: zostaje</span></div>`,
  js: `${HD}
${IN(".tg", 0.9)}
${IN(".x0", T(5, "skoroszyt"))}
${IN(".x1", T(5, "arkusz"))}
${IN(".x2", T(5, "komórka"))}
tl.fromTo($(".a1"), { scale: 1 }, { scale: 1.12, duration: 0.25, yoyo: true, repeat: 1 }, V(${T(5, "przykład")}));
${IN(".c0", T(5, "kopiowaniu"))}
${IN(".c1", T(5, "dolar"))}`,
});

// 07 VBA START
scenes.push({
  css: `${HDCSS}
@R .keys { position:absolute; left:140px; top:290px; display:flex; gap:20px; align-items:center; }
@R .keys span.k { padding:18px 34px; border-radius:18px; border:2px solid var(--line); background:var(--panel); }
@R .fx { position:absolute; left:1100px; top:290px; display:flex; gap:20px; align-items:center; }
@R .fx .ic { width:56px; height:56px; color:var(--green); }
@R .term .body { font-size:48px; }`,
  html: `<h1 class="hd">Start w <span class="g">VBA</span></h1>
<div class="keys mono"><span class="k">Alt</span><span class="muted">+</span><span class="k">F11</span><span class="lb muted">&nbsp;edytor</span></div>
<div class="fx">${icon("file-code")}<span class="mono g">plik.xlsm</span><span class="lb muted">z makrami</span></div>
${code("cd", 140, 460, 1640, "Module1", [typed("Sub Powitanie()"), typed('    MsgBox "Cześć!"'), typed("End Sub")].map((t, i) => (i === 1 ? t : `<span class="y">${t}</span>`)))}`,
  js: `${HD}
${IN(".keys", T(6, "alt"))}
${IN(".fx", T(6, "iks"))}
${IN(".cd", T(6, "kod"))}
type(".l0", V(${T(6, "kod")}) + 0.4, 0.04);
type(".l1", V(${T(6, "między")}), 0.04);
type(".l2", V(${T(6, "end")}), 0.05);`,
});

// 08 INSTRUKCJE
const ins = [
  [`${kw("Dim")} wiek ${kw("As Integer")}`, "deklaruje zmienną", T(7, "dim")],
  [`wiek = ${kw("InputBox")}("Ile masz lat?")`, "pyta użytkownika", T(7, "inputbox")],
  [`${kw("MsgBox")} "Witaj!"`, "pokazuje komunikat", T(7, "msgbox")],
  [`${kw("If")} wiek &gt;= 18 ${kw("Then")} ... ${kw("End If")}`, "wybiera drogę", T(7, "if")],
  [`${kw("For")} i = 1 ${kw("To")} 10 ... ${kw("Next")}`, "powtarza kroki", T(7, "pętle")],
];
scenes.push({
  css: `${HDCSS}
@R .ir { position:absolute; left:140px; width:1640px; display:flex; justify-content:space-between; align-items:center; height:110px; padding:0 34px; border-radius:20px; border:1.5px solid var(--line); background:var(--panel); }
${ins.map((_, i) => `@R .i${i} { top:${270 + i * 130}px; }`).join("\n")}
@R .ir .lb { color:var(--muted); }`,
  html: `<h1 class="hd">Najważniejsze <span class="g">instrukcje</span></h1>
${ins.map(([c, d], i) => `<div class="ir i${i}"><span class="mono">${c.replace(/ (?![^<]*>)/g, "&nbsp;")}</span><span class="lb">${d}</span></div>`).join("\n")}`,
  js: `${HD}
${ins.map(([, , t], i) => IN(`.i${i}`, t)).join("\n")}`,
});

// 09 USERFORM
scenes.push({
  css: `${HDCSS}
@R .uf { left:140px; top:270px; width:820px; height:640px; overflow:hidden; }
@R .uf .tt { height:70px; display:flex; align-items:center; padding:0 28px; border-bottom:1.5px solid var(--line); color:var(--muted); }
@R .el { position:absolute; left:40px; }
@R .lab { top:110px; }
@R .tbx { top:180px; width:740px; height:80px; border-radius:12px; border:2px solid var(--line); background:#0e1311; }
@R .lst { top:290px; width:740px; height:200px; border-radius:12px; border:2px solid var(--line); background:#0e1311; padding:14px 22px; display:flex; flex-direction:column; gap:6px; }
@R .btn { top:520px; padding:16px 40px; border-radius:14px; background:rgba(62,224,143,.14); border:2px solid var(--green); color:var(--green); }
@R .cd2 .body { font-size:44px; }`,
  html: `<h1 class="hd"><span class="g">UserForm</span> = okno aplikacji</h1>
<div class="card uf"><div class="tt mono">UserForm1</div>
<div class="el lab lb">Tytuł:</div><div class="el tbx"></div>
<div class="el lst mono"><span>Life 3.0</span><span class="muted">Deep Learning</span></div>
<div class="el btn lb">Dodaj książkę</div></div>
${code("cd2", 1020, 270, 760, "kod", [
    `<span class="y">Private Sub</span> CommandButton1_Click()`,
    `<span class="muted">' kod przycisku</span>`,
    `<span class="y">End Sub</span>`,
    ``,
    `UserForm1.<span class="g">Show</span>`,
    `<span class="g">Unload Me</span>`,
  ])}`,
  js: `${HD}
${IN(".uf", T(8, "userform"))}
${IN(".lab", T(8, "etykiety"))}
${IN(".tbx", T(8, "pola"))}
${IN(".lst", T(8, "listy"))}
${POP(".btn", T(8, "przyciski"))}
${IN(".cd2", T(8, "dwuklik"))}
tl.fromTo([$(".cd2 .l3"), $(".cd2 .l4")], { opacity: 0 }, { opacity: 1, duration: 0.4 }, V(${T(8, "userform1")}));
tl.fromTo($(".cd2 .l5"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, V(${T(8, "unload")}));
tl.set([$(".cd2 .l3"), $(".cd2 .l4"), $(".cd2 .l5")], { opacity: 0 }, 0);`,
});

// 10 PROJEKT
const verbs = [["Dodaj", T(9, "dodaj")], ["Edytuj", T(9, "edytuj")], ["Sortuj", T(9, "sortuj")], ["Utwórz tabelę przestawną", T(9, "utwórz")]];
scenes.push({
  css: `${HDCSS}
@R .sheet { left:140px; top:260px; width:900px; height:620px; padding:30px; }
@R .run { position:absolute; left:470px; top:36px; white-space:nowrap; padding:14px 30px; border-radius:14px; background:rgba(245,197,24,.12); border:2px solid var(--yellow); color:var(--yellow); }
@R .nw { position:absolute; left:40px; top:52px; color:var(--muted); font-size:44px; }
@R .tbl { position:absolute; left:30px; top:190px; width:840px; }
@R .tbl div { display:flex; height:78px; align-items:center; border-top:1.5px solid var(--line); }
@R .tbl div span { width:270px; padding-left:18px; white-space:nowrap; }
@R .tbl div span:first-child { width:420px; }
@R .tbl div span:last-child { width:150px; }
@R .tbl .th { color:var(--green); border-top:none; }
@R .vb { position:absolute; left:1110px; top:260px; display:flex; flex-direction:column; gap:22px; }
@R .vb span { padding:16px 32px; border-radius:16px; border:2px solid var(--green); background:rgba(62,224,143,.1); }
@R .nt { position:absolute; left:1110px; top:770px; width:720px; color:var(--muted); }`,
  html: `<h1 class="hd">Projekt na <span class="g">zaliczenie</span></h1>
<div class="card sheet"><span class="nw">obszar nieroboczy →</span><div class="run lb">Uruchom aplikację</div>
<div class="tbl lb"><div class="th"><span>Tytuł</span><span>Autor</span><span>Rok</span></div>
<div><span>Life 3.0</span><span>Tegmark</span><span>2017</span></div><div><span>Human Compatible</span><span>Russell</span><span>2019</span></div>
<div><span>Atlas of AI</span><span>Crawford</span><span>2021</span></div></div></div>
<div class="vb lb">${verbs.map(([v], i) => `<span class="v${i}">${v}</span>`).join("")}</div>
<div class="lb nt">przyciski = <span class="g">czasowniki</span><br>kolumny = <span class="y">rzeczowniki</span></div>`,
  js: `${HD}
${IN(".sheet", T(9, "tabela"))}
${POP(".run", T(9, "przycisk"))}
${IN(".nw", T(9, "nieroboczym"))}
${verbs.map(([, t], i) => POP(`.v${i}`, t)).join("\n")}
${IN(".nt", T(9, "kolumny"))}
tl.to($(".tbl .th"), { color: "#f5c518", duration: 0.3 }, V(${T(9, "rzeczownikami")}));`,
});

// 11 OUTRO
const sum = [
  ["workflow", "algorytm", T(10, "algorytm")],
  ["sigma", "formuły", T(10, "formuły")],
  ["circle-dot", "makra", T(10, "makra")],
  ["grid-3x3", "adresowanie", T(10, "adresowanie")],
  ["code-xml", "VBA", T(10, "wu")],
  ["app-window", "UserForm", T(10, "userform")],
];
scenes.push({
  css: `${CARD}
${sum.map((_, i) => `@R .m${i} { left:${150 + (i % 3) * 560}px; top:${120 + Math.floor(i / 3) * 250}px; width:500px; height:210px; }`).join("\n")}
@R .ob { position:absolute; left:0; right:0; top:690px; text-align:center; }
@R .fin { position:absolute; left:0; right:0; top:820px; text-align:center; font-size:110px; }`,
  html: `${sum.map(([ic, n], i) => `<div class="card ci m${i}">${icon(ic)}<span class="lb">${n}</span></div>`).join("\n")}
<div class="lb ob">Na obronie: <span class="y">znaj swój kod</span> i co robi każdy przycisk</div>
<h1 class="hd fin"><span class="g">Powodzenia!</span></h1>`,
  js: `
${sum.map(([, , t], i) => POP(`.m${i}`, t)).join("\n")}
${IN(".ob", T(10, "na"))}
tl.fromTo($(".fin"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: E }, V(${T(10, "powodzenia")}));`,
});

build({
  title: "Oprogramowanie użytkowe w 2 minuty",
  lang: "pl",
  durs,
  scenes,
  sfx: (st) => [
    ["typing", st[6] + VO_OFFSET + T(6, "kod") + 0.4, 1.5, 0.3, 14],
    ...verbs.map(([, t], i) => ["click-soft", st[9] + VO_OFFSET + t, 0.365, 0.4, 13 + (i % 2)]),
    ["chime", st[10] + VO_OFFSET + T(10, "powodzenia"), 2.1, 0.22, 15],
  ],
});
