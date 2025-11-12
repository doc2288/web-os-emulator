const desktopIcons = [
  { name: "Мой компьютер", icon: "💻", app: "explorer" },
  { name: "Корзина", icon: "🗑️", app: "explorer" },
  { name: "Браузер", icon: "🌐", app: "browser" },
  { name: "Блокнот", icon: "📝", app: "notepad" }
];

window.onload = () => {
  const clockEl = document.getElementById('clock');
  function updateClock() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Render desktop icons
  const desktopIconsEl = document.getElementById('desktop-icons');
  desktopIconsEl.innerHTML = '';
  desktopIcons.forEach((icon, i) => {
    const iconDiv = document.createElement('div');
    iconDiv.className = 'desktop-icon';
    iconDiv.draggable = true;
    iconDiv.style.margin = '20px';
    iconDiv.innerHTML = `<div style="font-size: 32px;">${icon.icon}</div><div style="font-size: 14px;">${icon.name}</div>`;
    // Basic drag-and-drop
    iconDiv.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', i);
    });
    desktopIconsEl.appendChild(iconDiv);
  });
};
// More application logic and window management will be added soon.