// Храним координаты и содержимое Notepad, создаём папки, анимация загрузки, drag&drop icons с проверкой коллизий и окна приложений с памятью
let notepadData = localStorage.getItem('notepadText') || '';
let desktopIcons = [
  { name: "Мой компьютер", icon: "💻", app: "explorer", x: 40, y: 40 },
  { name: "Корзина", icon: "🗑️", app: "explorer", x: 140, y: 40 },
  { name: "Браузер", icon: "🌐", app: "browser", x: 40, y: 140 },
  { name: "Блокнот", icon: "📝", app: "notepad", x: 140, y: 140 }
];
let folders = [{name: 'Рабочий стол', children: []}];

window.onload = () => {
  showBootScreen();
};

function showBootScreen() {
  const boot = document.createElement('div');
  boot.id = 'boot-screen';
  boot.innerHTML = `
    <code>><b>Взлом системы</b>...<br><span id='hack-text'></span></code>
  `;
  document.body.appendChild(boot);
  let hack = 'Connecting to server...\nAccess granted.\nBypassing security...\nInjecting payload...\nSystem loaded.';
  let i = 0;
  let hackEl = boot.querySelector('#hack-text');
  let interval = setInterval(() => {
    hackEl.innerText = hack.substring(0, i);
    i++;
    if (i > hack.length) {
      clearInterval(interval);
      setTimeout(() => {
        boot.classList.add('hide');
        setTimeout(()=>boot.remove(),400);
        startDesktop();
      }, 750);
    }
  }, 40);
}

function startDesktop() {
  const clockEl = document.getElementById('clock');
  function updateClock() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  setInterval(updateClock, 1000); updateClock();

  renderDesktopIcons();
}

function isOverlap(x, y, skipIndex = -1) {
  const SIZE = 70;
  for(let i=0;i<desktopIcons.length;i++){
    if(i===skipIndex) continue;
    let dx=desktopIcons[i].x,dy=desktopIcons[i].y;
    if (Math.abs(x-dx)<SIZE && Math.abs(y-dy)<SIZE) return true;
  }
  return false;
}

function renderDesktopIcons() {
  const desktopIconsEl = document.getElementById('desktop-icons');
  desktopIconsEl.innerHTML = '';
  desktopIcons.forEach((icon, i) => {
    const iconDiv = document.createElement('div');
    iconDiv.className = 'desktop-icon';
    iconDiv.style.left = icon.x+'px';
    iconDiv.style.top = icon.y+'px';
    iconDiv.innerHTML = `<div style="font-size: 32px;">${icon.icon}</div><div style="font-size: 14px;">${icon.name}</div>`;
    iconDiv.setAttribute('draggable', true);
    iconDiv.addEventListener('dragstart', e => {
      iconDiv.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', i);
    });
    iconDiv.addEventListener('dragend', e => {
      iconDiv.classList.remove('dragging');
    });
    iconDiv.addEventListener('dblclick', () => openApp(icon.app, icon.name));
    desktopIconsEl.appendChild(iconDiv);
  });
  desktopIconsEl.ondragover = e => {e.preventDefault();};
  desktopIconsEl.ondrop = e => {
    e.preventDefault();
    let i = +e.dataTransfer.getData('text/plain');
    let x = e.clientX - 30, y = e.clientY - 60;
    if(!isOverlap(x, y, i)) {
      desktopIcons[i].x = Math.max(0, Math.min(window.innerWidth-70,x));
      desktopIcons[i].y = Math.max(0, Math.min(window.innerHeight-110,y));
      renderDesktopIcons();
    }
  };
}

function openApp(app, name) {
  if(document.getElementById('win-'+app)) return;
  let win = document.createElement('div');
  win.className = 'window';
  win.id = 'win-'+app;
  win.style.top = '100px'; win.style.left = '150px';
  win.innerHTML = `<div style="background:#667eea; color:#fff; padding:10px 18px;font-weight:bold;border-bottom:1px solid #ccc;cursor:move;">
    ${name} <button style='float:right;' onclick='this.closest(".window").remove()'>✖</button></div>
    <div class='wincontent'></div>`;
  document.body.appendChild(win);
  if(app==="notepad") renderNotepad(win);
  if(app==="browser") renderBrowser(win);
  if(app==="explorer") renderExplorer(win);
  dragWindow(win);
}

function renderNotepad(win) {
  let html = `<textarea class='notepad-area' id='ntxt'>${notepadData}</textarea><button id='save-notepad-btn'>💾 Сохранить</button>`;
  win.querySelector('.wincontent').innerHTML = html;
  win.querySelector('#save-notepad-btn').onclick = () => {
    notepadData = document.getElementById('ntxt').value;
    localStorage.setItem('notepadText', notepadData);
    alert('Сохранено!');
  };
}
function renderBrowser(win) {
  if(!window.browserTabs) window.browserTabs = [{title:'Первая вкладка',content:'<h3>Здесь могла бы быть ваша реклама…</h3>'}];
  let tabIdx = 0;
  let draw = () => {
    let tabHtml = window.browserTabs.map((tab,i)=>`<span class='browser-tab' style='${i==tabIdx?"background:#d1f3fd;" :""}'>${tab.title}<button class='browser-tab-close' onclick='window.browserTabs.splice(${i},1);window.document.getElementById(\'win-browser\').remove();window.openApp("browser","Браузер");event.stopPropagation();'>×</button></span>`).join('') + `<button onclick='window.browserTabs.push({title:"Вкладка "+(window.browserTabs.length+1),content:"Новая вкладка"});window.document.getElementById(\'win-browser\').remove();window.openApp("browser","Браузер");'>+ Новая</button>`;
    win.querySelector('.wincontent').innerHTML = `<div style='margin:12px 0;'>${tabHtml}</div><div style='padding:10px 15px;border:1px solid #eee;min-height:110px;' contenteditable>${window.browserTabs[tabIdx]?.content||''}</div>`;
    win.querySelectorAll('.browser-tab').forEach((el,i)=>el.onclick=i=>{tabIdx=i;draw();});
  };
  draw();
}
function renderExplorer(win) {
  win.classList.add('folder-window');
  let html = `<button id='new-folder-btn'>📁 Новая папка</button><ul id='folder-list'>`;
  folders.forEach((f,i)=>{html += `<li>${f.name}</li>`;});
  html += '</ul>';
  win.querySelector('.wincontent').innerHTML = html;
  win.querySelector('#new-folder-btn').onclick = () => {
    let name = prompt('Имя новой папки:','Новая папка');
    if(name){folders.push({name,children:[]});renderExplorer(win);}
  };
}
// drag window by header
function dragWindow(win){
  const header = win.children[0];
  let offsetX, offsetY, drag = false;
  header.onmousedown = (e)=>{
    drag = true;
    offsetX = e.offsetX; offsetY = e.offsetY;
    win.style.zIndex = 9999;
  };
  document.onmousemove = (e)=>{
    if(drag){win.style.left = (e.clientX-offsetX)+"px";win.style.top = (e.clientY-offsetY)+"px";}
  };
  document.onmouseup = ()=>{drag=false;};
}
