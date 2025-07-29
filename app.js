/* ---------- Konstanten ---------- */
const halls   = ['110','111','F','Geb. 23','M','M⁺','M⁺⁺','N','O','Q','S'];
const stations= ['1-1','1-2','…','9-3','F21','F22','F23'];
const levels  = ['Dach','Mitte','Ug'];
const LS_KEY  = 'terminals';
const worker  = Tesseract.createWorker({ logger: m => console.log(m) });

/* ---------- DOM-Refs ---------- */
const sel = id => document.getElementById(id);
['halle','station','ebene'].forEach((id, i) => {
  const opts = (i===0?halls:i===1?stations:levels)
    .map(v=>`<option>${v}</option>`).join('');
  sel(id).insertAdjacentHTML('beforeend', opts);
});

/* ---------- Tab-Handling ---------- */
document.querySelectorAll('nav button').forEach(btn=>{
  btn.onclick = () => {
    ['capture','list'].forEach(id=>{
      sel(id).classList.toggle('hidden', !btn.id.includes(id));
    });
    if (btn.id==='tab-list') renderList();
  };
});

/* ---------- OCR-Handling ---------- */
document.querySelectorAll('.ocr-btn').forEach(btn=>{
  btn.onclick = () => {
    sel('camera').dataset.target = btn.dataset.target;
    sel('camera').click();
  };
});

sel('camera').onchange = async e => {
  const file = e.target.files[0];
  if (!file) return;
  const target = e.target.dataset.target;

  const dataURL = await fileToDataURL(file);
  const { data:{ text } } = await runOCR(dataURL);
  const token = (text.match(/[A-Z0-9]{3,}/) || [''])[0];
  sel(target).value = token;
  e.target.value = '';           // reset input
};

async function fileToDataURL (file) {
  return await new Promise(r=>{
    const fr = new FileReader();
    fr.onload = () => r(fr.result);
    fr.readAsDataURL(file);
  });
}
async function runOCR (img) {
  await worker.load(); await worker.loadLanguage('eng');
  await worker.initialize('eng');
  await worker.setParameters({ tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' });
  const res = await worker.recognize(img);
  await worker.finalize();
  return res;
}

/* ---------- Speichern ---------- */
sel('save').onclick = () => {
  const entry = {
    halle: sel('halle').value,
    station: sel('station').value,
    ebene: sel('ebene').value,
    aos: +sel('terminal').value || null,
    pc:  sel('sn-pc').value.trim(),
    mon: sel('sn-monitor').value.trim()
  };
  if (!validate(entry)) return;

  const arr = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  arr.push(entry);
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
  clearInputs();
  alert('Gespeichert ✔');
};

function validate(o){
  if(!o.halle||!o.station||!o.ebene||!o.aos||!o.pc||!o.mon){
    alert('Bitte alle Felder ausfüllen'); return false;
  }
  return true;
}
function clearInputs(){
  ['terminal','sn-pc','sn-monitor'].forEach(id=>sel(id).value='');
}

/* ---------- Übersicht rendern ---------- */
function renderList(){
  const arr = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  sel('cards').innerHTML = arr.map((t,i)=>`
    <div class="rounded-2xl bg-white shadow p-4">
      <h3 class="font-bold text-lg mb-2">Terminal ${i+1}</h3>
      <p><b>AOS:</b> ${String(t.aos).padStart(2,'0')}</p>
      <p>${t.halle} / ${t.station} / ${t.ebene}</p>
      <p><b>PC:</b> ${t.pc}</p>
      <p><b>Monitor:</b> ${t.mon}</p>
    </div>`).join('');
}

/* ---------- CSV-Export ---------- */
sel('export').onclick = () => {
  const arr = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  if (!arr.length) return alert('Keine Daten');
  const csv = ['Terminal,AOS-ID,Halle,Station,Ebene,RechnerSN,MonitorSN'];
  arr.forEach((t,i)=>csv.push([
    i+1, `AOS ${String(t.aos).padStart(2,'0')}`,
    t.halle, t.station, t.ebene, t.pc, t.mon
  ].join(',')));
  download('terminals.csv', csv.join('\n'));
};
function download(filename, text){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text],{type:'text/csv'}));
  a.download = filename; a.click();
  URL.revokeObjectURL(a.href);
}
