const alphabet25 = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // J wird mit I zusammengelegt
const $ = (id) => document.getElementById(id);

const passwordEl = $("password");
const plainTextEl = $("plainText");
const cipherOutEl = $("cipherOut");
const cipherInEl = $("cipherIn");
const decryptOutEl = $("decryptOut");
const keyViewEl = $("keyView");
const tableEl = $("codeTable");

function normalizeText(text) {
  return text
    .toUpperCase()
    .replaceAll("Ä", "AE")
    .replaceAll("Ö", "OE")
    .replaceAll("Ü", "UE")
    .replaceAll("ẞ", "SS")
    .replaceAll("ß", "SS")
    .replaceAll("J", "I")
    .replace(/[^A-Z]/g, "");
}

function makeKey(password) {
  const raw = normalizeText(password);
  let key = "";
  for (const ch of raw + alphabet25) {
    if (alphabet25.includes(ch) && !key.includes(ch)) key += ch;
    if (key.length === 5) break;
  }
  return key;
}

function makeSquare() {
  const rows = [];
  for (let i = 0; i < alphabet25.length; i += 5) {
    rows.push(alphabet25.slice(i, i + 5).split(""));
  }
  return rows;
}

function getCipherMap(key) {
  const square = makeSquare();
  const enc = new Map();
  const dec = new Map();
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const letter = square[r][c];
      const pair = key[c] + key[r]; // erster Buchstabe = Spalte, zweiter = Zeile
      enc.set(letter, pair);
      dec.set(pair, letter === "I" ? "I/J" : letter);
    }
  }
  return { enc, dec, square };
}

function groupInFives(text) {
  return text.match(/.{1,5}/g)?.join(" ") ?? "";
}

function updateTable() {
  const key = makeKey(passwordEl.value);
  keyViewEl.textContent = key;
  const { square } = getCipherMap(key);

  let html = "<table><tr><th class='corner'>✍</th>";
  for (const ch of key) html += `<th>${ch}</th>`;
  html += "</tr>";

  for (let r = 0; r < 5; r++) {
    html += `<tr><th>${key[r]}</th>`;
    for (let c = 0; c < 5; c++) {
      const letter = square[r][c] === "I" ? "I+J" : square[r][c];
      html += `<td>${letter}</td>`;
    }
    html += "</tr>";
  }
  html += "</table>";
  tableEl.innerHTML = html;
}

function encrypt() {
  const key = makeKey(passwordEl.value);
  const { enc } = getCipherMap(key);
  const clear = normalizeText(plainTextEl.value);
  let cipher = "";
  for (const ch of clear) cipher += enc.get(ch) ?? "";
  cipherOutEl.textContent = groupInFives(cipher);
  cipherInEl.value = cipherOutEl.textContent;
}

function decrypt() {
  const key = makeKey(passwordEl.value);
  const { dec } = getCipherMap(key);
  const raw = normalizeText(cipherInEl.value);

  if (raw.length % 2 !== 0) {
    decryptOutEl.textContent = "Der Geheimtext hat eine ungerade Anzahl Zeichen. Prüfe eine fehlende Stelle.";
    return;
  }

  let clear = "";
  for (let i = 0; i < raw.length; i += 2) {
    const pair = raw.slice(i, i + 2);
    if (!dec.has(pair)) {
      decryptOutEl.textContent = `Das Zeichenpaar ${pair} passt nicht zum aktuellen Passwort.`;
      return;
    }
    clear += dec.get(pair);
  }
  decryptOutEl.textContent = clear;
}

passwordEl.addEventListener("input", updateTable);
$("encryptBtn").addEventListener("click", encrypt);
$("decryptBtn").addEventListener("click", decrypt);
$("clearBtn").addEventListener("click", () => {
  plainTextEl.value = "";
  cipherOutEl.textContent = "";
  cipherInEl.value = "";
  decryptOutEl.textContent = "";
});
$("exampleBtn").addEventListener("click", () => {
  passwordEl.value = "LAMPE";
  plainTextEl.value = "SCHULE";
  updateTable();
  encrypt();
});
$("copyBtn").addEventListener("click", async () => {
  await navigator.clipboard.writeText(cipherOutEl.textContent);
  $("copyBtn").textContent = "Kopiert";
  setTimeout(() => $("copyBtn").textContent = "Kopieren", 900);
});

updateTable();
plainTextEl.value = "SCHULE";
encrypt();
