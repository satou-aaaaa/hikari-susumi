// 光の進み方あての問題を作る（ブラウザと node の両方で使う）。
// 中身は、大阪府教育委員会・千葉県教育委員会の中学1年理科プリント（解答）・茨城県教育研修センター・高知県教育委員会・群馬県教育委員会の理科の指導案・キヤノン「サイエンスラボ・キッズ」（下の SRC。2026-11-17 に読んだ）で確かめたことだけ。
// 1問は、身のまわりの光の場面を見て、光の進み方（直進・反射・乱反射・屈折・全反射）を選ぶ。正解したら2段目「光はどうなった？」を選ぶ。
// 凸レンズの像（実像・虚像）と光の色（分光）は扱わない。
// 選び肢は、ほかの4つから選ぶ（やさしいは2つ、ふつう・むずかしいは3つ）。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。同じ tag なら、どの端末でも同じ問題になる。
// KINDS・言い回しの並びは最後に足すだけにする（並べ替え・削除をすると過去の日の問題が変わる）。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];

  // 出典（画面の「なぜ」に出す）
  const SRC = {
    osaka: ["大阪府教育委員会「中学1年理科 光と音」確認プリント（解答）", "https://www.pref.osaka.lg.jp/documents/25642/rika_hikari_kakunin_kai_01.pdf"],
    chiba: ["千葉県教育委員会「やる気アップ 理科」中学1年 光の反射・屈折（解答つき）", "https://www.pref.chiba.lg.jp/kyouiku/shidou/gakuryoku/yaruki/rika/documents/01r01.pdf"],
    ibk: ["茨城県教育研修センター 中学1年理科「光の性質」の学習指導案", "https://www.center.ibk.ed.jp/wysiwyg/file/download/1/1742"],
    ibk3: ["茨城県教育研修センター 小学3年理科「太陽と光」の学習指導案", "https://www.center.ibk.ed.jp/wysiwyg/file/download/1/2400"],
    kochi: ["高知県教育委員会 中学1年理科「光と音」単元構想表", "https://www.pref.kochi.lg.jp/doc/2024051000046/file_contents/file_2024118592214_1.pdf"],
    gunma: ["群馬県教育委員会 中学1年理科「光の性質」の学習指導案", "https://gunma-boe.gsn.ed.jp/wysiwyg/file/download/506/1534"],
    canon: ["キヤノン「サイエンスラボ・キッズ」鏡ってなに？", "https://global.canon/ja/technology/kids/mystery/m_02_05.html"],
  };

  // 答えになる5つ
  const CLASSES = ["直進", "反射", "乱反射", "屈折", "全反射"];

  // 2段目「光はどうなった？」の3つ
  const GROUPS = {
    sugu: { name: "まっすぐ進んだ", sub: "向きを変えずに" },
    hane: { name: "面ではね返った", sub: "物質の中へ進まずに" },
    magaru: { name: "境界面を通りぬけて曲がった", sub: "ちがう物質へ進んで" },
  };
  // どこで（「なぜ」に出す）
  const CATS = { onaji: "同じ物質の中", nameraka: "鏡のようななめらかな面", dekoboko: "細かいでこぼこのある面", kyokai: "空気と水・ガラスの境界面", uchigawa: "水やガラスの中から空気へ出ようとする境界面" };
  // 答えごとの決まり。2段目・どこで・決め手はこの表で決まる（qa/run.mjs が別に持った表でも確かめる）
  const RULE = {
    "直進": { grp: "sugu", cat: "onaji", key: "光は、同じ物質の中ではまっすぐ進みます。これを光の直進といいます。" },
    "反射": { grp: "hane", cat: "nameraka", key: "光が物体ではね返ることを反射といい、入射角と反射角は等しくなります（反射の法則）。" },
    "乱反射": { grp: "hane", cat: "dekoboko", key: "でこぼこした面に当たった光は、四方八方に飛び散るようにはね返ります。これが乱反射です。" },
    "屈折": { grp: "magaru", cat: "kyokai", key: "光がちがう物質へななめに進むとき、境界面で曲がります。これを光の屈折といいます。" },
    "全反射": { grp: "hane", cat: "uchigawa", key: "水やガラスから空気へ進むとき、入射角が一定以上大きいと、光はすべて境界面で反射します。" },
  };

  const ri = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  function shuffle(R, a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = ri(R, 0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  function pickN(R, a, n) { return shuffle(R, a).slice(0, n); }
  const MEDIA = ["理科室で", "理科の授業で", "実験ノートで", "家で", "テスト勉強で"];
  // 問いの前につく言い方（どれでも答えは同じ）
  const PRE = ["実験した。", "観察した。", "身のまわりで。", "こんな場面。", "見つけた。"];

  // どれかを当てる問題。ans：答え、sit：言い方。選び肢は、ほかの4つから（やさしいは2つ、ふつう・むずかしいは3つ）
  function which(ans, sit) {
    const near = CLASSES.filter((c) => c !== ans);
    return (R, lv) => {
      const si = ri(R, 0, sit.length - 1), mi = ri(R, 0, MEDIA.length - 1);
      const n = lv === 0 ? 2 : 3, ds = pickN(R, near, n);
      const q = sit[si] + "　光はどう進んだ？";
      return { type: "act", media: MEDIA[mi], q, opts: shuffle(R, [ans, ...ds]), ans, rev: false, v: `${si}:${mi}` };
    };
  }
  // 1つの種類を作る。grp・cat・key は答えの決まり RULE から。clue は手がかりの文（PRE と組む）
  function K(id, lv, ans, name, src, look, why, clue) {
    const r = RULE[ans];
    return { id, lv, grp: r.grp, cat: r.cat, ans, name, src, look, key: r.key, why, make: which(ans, clue.flatMap((c) => PRE.map((p) => p + c))) };
  }

  const KINDS = [
    // ---- やさしい ----
    K("c_kemuri", 0, "直進", "煙の中の光の筋", ["gunma", "ibk"], "光の筋の形を見ましょう。",
      "線香の煙を入れて光を当てると、光の道すじがまっすぐ見えます。光は同じ物質の中では直進します（群馬県の指導案）。",
      ["線香の煙を入れた箱に光を当てると、光の筋が一本のまっすぐな線に見えた。", "光源装置の光が、空気の中を一本の細い筋のまま進んだ。"]),
    K("h_kagami", 0, "反射", "鏡ではね返る", ["osaka", "chiba"], "なめらかな鏡の面に当たりました。",
      "光が鏡ではね返るとき、入射角と反射角は等しくなります（大阪府・千葉県のプリント）。これが反射です。",
      ["鏡に光を当てると、当てた角度と同じ角度ではね返った。", "鏡に当たった光が、決まった一つの向きにはね返った。"]),
    K("r_refu", 0, "乱反射", "レフ板で光が散る", ["canon"], "面の細かいでこぼこに注目。",
      "表面に細かいでこぼこのある面では、光が四方八方に飛び散るようにはね返ります（キヤノン サイエンスラボ・キッズ）。",
      ["細かいでこぼこのある白い板に光を当てると、光が四方八方に飛び散った。", "表面にしわをつけた鏡に光を当てると、光がいろいろな向きに散らばった。"]),
    K("k_straw", 0, "屈折", "水に入れたストロー", ["chiba", "ibk"], "水面で何が起きたでしょう。",
      "水中の物からの光は、水面で曲がって目に届きます。そのため、ストローや鉛筆が短く・曲がって見えます（千葉県のプリント・茨城県の指導案）。",
      ["水に入れたストローの、水の中の部分が短く見えた。", "水に入れた鉛筆が、水面のところで折れ曲がって見えた。"]),
    K("z_fiber", 0, "全反射", "光ファイバー", ["osaka", "ibk"], "光が外へもれずに進みます。",
      "光ファイバーは、中を進む光が境界面ですべてはね返る性質を利用しています（大阪府のプリント・茨城県の指導案）。",
      ["光ファイバーの中を、光が外へもれずに先まで進んでいった。"]),
    // ---- ふつう ----
    K("c_suichoku", 1, "直進", "ガラスにまっすぐ当てる", ["kochi"], "面に対してまっすぐ当てました。",
      "鏡やガラスに光をまっすぐ（垂直に）当てると、光は向きを変えずに進みます（高知県の単元構想表）。",
      ["厚いガラスの面に対して、光を垂直に当てた。光は向きを変えずにガラスの中を進んだ。"]),
    K("h_sayu", 1, "反射", "鏡の顔は左右が逆", ["ibk"], "鏡に映った像です。",
      "鏡に映った顔は左右が逆に見えます。万華鏡も、鏡ではね返る光でもようがいくつも見えます（茨城県の指導案）。",
      ["鏡に映った自分の顔は、左右が逆になって見えた。", "万華鏡をのぞくと、中の鏡で同じもようがいくつも見えた。"]),
    K("r_suimen", 1, "乱反射", "波立つ水面できらきら", ["ibk", "gunma", "canon"], "面が平らではありません。",
      "水面に光が乱反射する様子は、ふだんの生活でも見られます（茨城県の指導案）。光がいろいろな方向へ散ります（群馬県の指導案）。",
      ["波立った水面に光が当たり、光がいろいろな方向へ散ってきらきら見えた。"]),
    K("k_coin", 1, "屈折", "コップのコインが浮く", ["kochi", "chiba"], "水からの光が目に届くまでに注目。",
      "水中の物体からの光は水面で曲がって目に届くので、コインが浮かんで見えます（高知県の単元構想表・千葉県のプリント）。",
      ["コップの底のコインが、水を入れると浮かび上がって見えた。"]),
    K("z_mizu", 1, "全反射", "水中から水面へななめに", ["osaka", "kochi"], "角度を大きくしていきました。",
      "水から空気へ進むとき、入射角を大きくしていくと、光がすべて境界面で反射します（大阪府のプリント・高知県の単元構想表）。",
      ["水の中から水面へななめに光を当てた。角度を大きくすると、光がすべて水面ではね返った。"]),
    // ---- むずかしい ----
    K("c_nichiko", 2, "直進", "鏡のあとの日光の進み方", ["ibk3"], "はね返ったあと、どう進んだか。",
      "鏡ではね返した日光も、そのあとはまっすぐに進みます（茨城県 小学3年の指導案）。光は同じ物質の中では直進します。",
      ["鏡ではね返した日光が、そのあと的まで向きを変えずに空気の中を進んだ。"]),
    K("h_zenshin", 2, "反射", "全身を映す鏡", ["kochi"], "鏡の大きさと像の関係です。",
      "全身を映すには、身長の半分の大きさの鏡があればよく、鏡との距離は関係ありません（高知県の単元構想表）。鏡で光がはね返るためです。",
      ["身長の半分の高さの鏡があれば、鏡からの距離に関係なく全身を映せた。"]),
    K("r_shashin", 2, "乱反射", "写真のレフ板", ["canon"], "光を一方向にそろえないのが目的です。",
      "写真用のレフ板は、面に細かいでこぼこを作り、光を散らして当てます（キヤノン サイエンスラボ・キッズ）。",
      ["写真をとるとき、面に細かいでこぼこのある板で光を散らし、顔全体を明るくした。"]),
    K("k_garasu", 2, "屈折", "空気からガラスへななめに", ["chiba", "kochi"], "入射角とくらべてどうなったか。",
      "空気からガラスや水へななめに進む光は、境界面で曲がり、入射角より角が小さくなります（千葉県のプリント・高知県の単元構想表）。",
      ["空気からガラスへななめに光を当てると、境界面で向きが変わり、面に垂直な線に近づいた。"]),
    K("z_garasu", 2, "全反射", "ガラスの中から空気へ", ["osaka"], "空気へ出られたでしょうか。",
      "水やガラスから空気へ進むとき、入射角が一定以上大きいと、光は空気へ出ずにすべて境界面ではね返ります（大阪府のプリント）。",
      ["ガラスの中から空気へ進もうとした光が、入射角が大きいため空気へ出ず、全部ガラスの中へはね返った。"]),
  ];
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);

  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // 1問を作る。tag は「種類|種」（例 "c_kemuri|2026-11-18:d0"）。同じ tag ならいつも同じ問題
  function make(tag) {
    const [kind] = String(tag).split("|"), k = BY[kind];
    if (!k) return null;
    const p = k.make(rng(seedOf(tag)), k.lv);
    return { tag, kind, lv: k.lv, name: k.name, look: k.look, key: k.key, why: k.why, grp: k.grp, cat: k.cat, src: k.src.map((s) => SRC[s]), ...p };
  }
  const keyOf = (P) => `${P.kind}:${P.q}:${P.opts.slice().sort().join("/")}`;

  // 今日の5問（やさしい2・ふつう2・むずかしい1）。種類は重ねない
  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOf(0), 2), n = pickN(R, kindsOf(1), 2), h = pickN(R, kindsOf(2), 1);
    return [...e, ...n, ...h].map((id, i) => `${id}|${date}:d${i}`);
  }
  // 上級の3問（むずかしいだけ・今日の5問のむずかしいとは別の種類）
  function hardTags(date) {
    const dh = dailyTags(date)[4].split("|")[0], R = rng(seedOf("hard:" + date)), h = pickN(R, kindsOf(2).filter((x) => x !== dh), 3);
    return h.map((id, i) => `${id}|${date}:h${i}`);
  }

  const HKS = { KINDS, BY, GROUPS, CATS, RULE, LV, SRC, CLASSES, kindsOf, seedOf, rng, make, keyOf, dailyTags, hardTags, pickN };
  if (typeof module !== "undefined" && module.exports) module.exports = HKS; else root.HKS = HKS;
})(typeof self !== "undefined" ? self : this);
