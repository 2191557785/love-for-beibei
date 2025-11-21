// 基础个性化配置（可自行修改）
const CONFIG = {
  yourName: '给亲爱的贝贝',
  anniversary: '2025-07-04', // 纪念日：YYYY-MM-DD
  loveNotes: [
    '贝贝，从遇见你开始，星星也有了归宿。',
    '贝贝，我会把所有的温柔和偏爱都给你。',
    '贝贝，愿以后每一天，都有你。',
  ],
};

// DOM helpers
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

// 天数计算
function updateDays() {
  const daysEl = $('#daysCounter');
  if (!daysEl) return;
  const start = new Date(CONFIG.anniversary);
  const now = new Date();
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  daysEl.textContent = Math.max(0, diff).toString();
}

// 打字机效果
function typewriter() {
  const el = $('#typewriterText');
  if (!el) return;
  const lines = JSON.parse(el.getAttribute('data-lines') || '[]');
  const custom = CONFIG.loveNotes || [];
  const allLines = custom.length ? custom : lines;
  let line = 0, ch = 0, deleting = false;

  function tick() {
    const current = allLines[line] || '';
    if (!deleting) {
      ch++;
      el.textContent = current.slice(0, ch);
      if (ch >= current.length) {
        deleting = true;
        setTimeout(tick, 1200);
        return;
      }
    } else {
      ch--;
      el.textContent = current.slice(0, ch);
      if (ch <= 0) {
        deleting = false;
        line = (line + 1) % allLines.length;
      }
    }
    const speed = deleting ? 35 : 70;
    setTimeout(tick, speed + Math.random() * 60);
  }
  tick();
}

// 背景粒子与偶发流星
function initBackground() {
  const canvas = $('#bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  const stars = [];
  const STAR_COUNT = 120;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth = window.innerWidth;
    h = canvas.clientHeight = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
  }

  function makeStar() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.2,
      a: Math.random() * Math.PI * 2,
      s: Math.random() * 0.4 + 0.1,
    };
  }

  for (let i = 0; i < STAR_COUNT; i++) stars.push(makeStar());

  let shooting = null;
  function spawnShooting() {
    if (shooting) return;
    shooting = {
      x: Math.random() * w * 0.6 + w * 0.2,
      y: -20,
      vx: -2 - Math.random() * 1.5,
      vy: 6 + Math.random() * 2,
      life: 0,
      maxLife: 90,
    };
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    // stars
    ctx.fillStyle = '#fff8';
    stars.forEach((s) => {
      s.a += s.s * 0.02;
      const twinkle = 0.6 + Math.sin(s.a) * 0.4;
      ctx.globalAlpha = twinkle;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // shooting star
    if (!shooting && Math.random() < 0.006) spawnShooting();
    if (shooting) {
      const { x, y, vx, vy } = shooting;
      ctx.strokeStyle = '#ff84c8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - vx * 6, y - vy * 6);
      ctx.stroke();
      shooting.x += vx * 1.8;
      shooting.y += vy * 1.8;
      shooting.life++;
      if (shooting.life > shooting.maxLife || shooting.x < -50 || shooting.y > h + 50) shooting = null;
    }

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}

// 轻量 confetti/心形粒子
function burstHearts(x, y, count = 28) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.textContent = '❤';
    s.className = 'f-heart';
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;
    const rx = Math.random() * 360;
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    s.style.setProperty('--dx', dx);
    s.style.setProperty('--dy', dy);
    s.style.setProperty('--rot', rx + 'deg');
    s.style.setProperty('--hue', 320 + Math.floor(Math.random() * 60));
    frag.appendChild(s);
    // 自动清除
    setTimeout(() => s.remove(), 1200);
  }
  document.body.appendChild(frag);
}

// 为心形粒子注入样式（避免改动CSS文件）
(function injectHeartStyle(){
  const style = document.createElement('style');
  style.textContent = `
  .f-heart{position:fixed; z-index:9999; pointer-events:none; transform:translate(-50%,-50%);
    animation: fly 1.1s ease-out forwards; font-size:18px; filter: drop-shadow(0 2px 6px rgba(0,0,0,.35));
    color: hsl(var(--hue, 340), 90%, 70%);
  }
  @keyframes fly{
    0%{ opacity:1; transform: translate(-50%,-50%) scale(0.9) rotate(0deg) }
    100%{ opacity:0; transform: translate(calc(-50% + var(--dx)*40px), calc(-50% + var(--dy)*40px)) scale(0.6) rotate(var(--rot)) }
  }
  `;
  document.head.appendChild(style);
})();

// 甜蜜弹窗
function initSweetDialog() {
  const btn = $('#loveButton');
  const dlg = $('#sweetDialog');
  const note = $('#loveNote');
  if (!btn || !dlg) return;
  btn.addEventListener('click', (e) => {
    const r = btn.getBoundingClientRect();
    burstHearts(r.left + r.width / 2, r.top + r.height / 2);
    note.textContent = pickLoveNote();
    try { dlg.showModal(); } catch { dlg.show?.(); }
  });
}

function pickLoveNote(){
  const notes = CONFIG.loveNotes && CONFIG.loveNotes.length ? CONFIG.loveNotes : [
    '贝贝，在所有的喜欢里，我最喜欢你。',
    '贝贝，想把一切最好的都给你。',
    '贝贝，我在，爱也在。',
  ];
  return notes[Math.floor(Math.random()*notes.length)];
}

// 滚动 Reveal
function initReveal() {
  const els = $$('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.18 });
  els.forEach(el => io.observe(el));
}

// 画廊灯箱
function initLightbox() {
  const dialog = $('#lightbox');
  const img = $('#lightboxImg');
  if (!dialog || !img) return;
  $$('#gallery img').forEach(i => {
    i.style.cursor = 'zoom-in';
    i.addEventListener('click', () => {
      img.src = i.src;
      try { dialog.showModal(); } catch { dialog.show?.(); }
    });
  });
}

// 小问答
function initQuiz() {
  const res = $('#quizResult');
  $$('#quiz .opt').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const correct = btn.getAttribute('data-correct') === 'true';
      $$('#quiz .opt').forEach(b => b.classList.remove('correct','wrong'));
      if (correct) {
        btn.classList.add('correct');
        res.textContent = '答对啦！送你小心心～';
        burstHearts(e.clientX, e.clientY, 36);
      } else {
        btn.classList.add('wrong');
        res.textContent = '好像不是这个，再想想～';
      }
    });
  });
}

// Konami Code 解锁彩蛋
function initEaster() {
  const code = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  const buf = [];
  const section = $('#easter');
  window.addEventListener('keydown', (e) => {
    buf.push(e.key);
    if (buf.length > code.length) buf.shift();
    if (code.every((k, i) => buf[i] && buf[i].toLowerCase() === k.toLowerCase())) {
      section?.classList.remove('hidden');
      section?.scrollIntoView({ behavior: 'smooth' });
      burstHearts(window.innerWidth/2, window.innerHeight*0.2, 60);
    }
  });
  $('#megaHeart')?.addEventListener('click', (e) => {
    burstHearts(e.clientX, e.clientY, 72);
  });
}

// 播放器
function initPlayer() {
  const audio = $('#audio');
  const play = $('#play');
  const volume = $('#volume');
  if (!audio || !play || !volume) return;
  
  // 设置初始音量
  audio.volume = Number(volume.value);
  
  // 尝试自动播放
  const tryAutoPlay = () => {
    audio.play().catch(() => {
      // 如果自动播放失败，在用户首次交互时播放
      const playOnInteraction = () => {
        audio.play().catch(()=>{});
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('touchstart', playOnInteraction);
        document.removeEventListener('keydown', playOnInteraction);
      };
      document.addEventListener('click', playOnInteraction, { once: true });
      document.addEventListener('touchstart', playOnInteraction, { once: true });
      document.addEventListener('keydown', playOnInteraction, { once: true });
    });
  };
  
  // 页面加载后尝试播放
  setTimeout(tryAutoPlay, 500);
  
  play.addEventListener('click', () => {
    if (audio.paused) audio.play().catch(()=>{}); else audio.pause();
  });
  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value);
  });
}

// 名称设置
function setName() {
  const el = $('#yourName');
  if (el) el.textContent = CONFIG.yourName || el.textContent;
}

// 平滑滚动提示
(function smoothScrollHint(){
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a) {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      target?.scrollIntoView({ behavior: 'smooth' });
    }
  });
})();

// 随机飘落的爱心雨 - 优化版本
function initFloatingHearts() {
  setInterval(() => {
    if (Math.random() < 0.2) { // 减少频率
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      heart.textContent = ['❤', '💕', '💖'][Math.floor(Math.random() * 3)]; // 减少种类
      heart.style.left = Math.random() * 100 + 'vw';
      heart.style.animationDuration = (4 + Math.random() * 3) + 's';
      heart.style.fontSize = (18 + Math.random() * 12) + 'px';
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 8000);
    }
  }, 3000); // 增加间隔
}

// 鼠标跟随特效 - 优化版本
function initMouseTrail() {
  let lastTime = 0;
  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTime < 120) return; // 增加间隔
    lastTime = now;
    
    const trail = document.createElement('div');
    trail.className = 'mouse-trail';
    trail.style.left = e.pageX + 'px';
    trail.style.top = e.pageY + 'px';
    document.body.appendChild(trail);
    setTimeout(() => trail.remove(), 800); // 减少持续时间
  });
}

// 双击烟花效果
function initDoubleClickFireworks() {
  let lastClick = 0;
  document.addEventListener('click', (e) => {
    const now = Date.now();
    if (now - lastClick < 400) {
      // 双击触发烟花
      createFirework(e.clientX, e.clientY);
    }
    lastClick = now;
  });
}

function createFirework(x, y) {
  const colors = ['#ff6fb5', '#ff95c9', '#7dd3fc', '#c4b5fd', '#fbbf24'];
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'firework-particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    const angle = (Math.PI * 2 * i) / 30;
    const velocity = 2 + Math.random() * 3;
    particle.style.setProperty('--tx', Math.cos(angle) * velocity * 50 + 'px');
    particle.style.setProperty('--ty', Math.sin(angle) * velocity * 50 + 'px');
    
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
  }
}

// 摇一摇彩蛋（移动设备）
function initShakeEaster() {
  if (!window.DeviceMotionEvent) return;
  
  let lastX = 0, lastY = 0, lastZ = 0;
  let shakeCount = 0;
  
  window.addEventListener('devicemotion', (e) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    
    const deltaX = Math.abs(acc.x - lastX);
    const deltaY = Math.abs(acc.y - lastY);
    const deltaZ = Math.abs(acc.z - lastZ);
    
    if (deltaX + deltaY + deltaZ > 30) {
      shakeCount++;
      if (shakeCount > 3) {
        burstHearts(window.innerWidth / 2, window.innerHeight / 2, 50);
        shakeCount = 0;
      }
    }
    
    lastX = acc.x;
    lastY = acc.y;
    lastZ = acc.z;
  });
}

// 长按彩蛋
function initLongPressEaster() {
  let pressTimer;
  const hero = $('.hero');
  if (!hero) return;
  
  hero.addEventListener('mousedown', () => {
    pressTimer = setTimeout(() => {
      burstHearts(window.innerWidth / 2, window.innerHeight / 3, 80);
      const msg = document.createElement('div');
      msg.className = 'secret-message';
      msg.textContent = '张贝贝，我爱你！ 💕';
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 3000);
    }, 2000);
  });
  
  hero.addEventListener('mouseup', () => clearTimeout(pressTimer));
  hero.addEventListener('mouseleave', () => clearTimeout(pressTimer));
}

// 创建照片墙背景
function initPhotoWall() {
  const photoWall = document.createElement('div');
  photoWall.className = 'photo-wall';
  
  // 获取所有照片路径（59张照片，每张出现4次，共236张）
  const photos = [
    'background_photo/05c667d4c3901466caa43d86605c8896.jpg',
    'background_photo/17c04ded88e2bdad483a73e20aba29a0.jpg',
    'background_photo/18a325bd95025a47cb9bfaa4da42c04c.jpg',
    'background_photo/19d1b3a49ea6e3b6ddbb336d4f586099.jpg',
    'background_photo/19e3b947af4dec061f2a6dbeb798d1d8.jpg',
    'background_photo/1c410e6c22c855c560b8cc585e6d3aa7.jpg',
    'background_photo/2032a170a05dbaa8514ead827f59916a.jpg',
    'background_photo/39e2bd8b1fb4babb0656b458cb0ee4d0.jpg',
    'background_photo/3b4d35e21281e5dc360b53846457824b.jpg',
    'background_photo/3eba1e783d72a14e4581e97abb680001.jpg',
    'background_photo/3f6c998942bac50240e204ddf89949c7.jpg',
    'background_photo/46c46a10aa66b883ca51445ff1a0b514.jpg',
    'background_photo/5040ebf843776425a7f1598c483d7b64.jpg',
    'background_photo/507a4d4f4c615432a761444e2e112181.jpg',
    'background_photo/522867c881ee223386343258850d4933.jpg',
    'background_photo/53de0780cfbc6bba89aa51332b79ed49.jpg',
    'background_photo/551a038e4de510397f9631d349af2d04.jpg',
    'background_photo/56e4736a90f5a55b4be590d940d4db09.jpg',
    'background_photo/5a9484f0c660c02323ba20259b56b798.jpg',
    'background_photo/5e337ca8d7432f1fffdd73626aa2ea39.jpg',
    'background_photo/698d602a650cc0c566808953e376aa65.jpg',
    'background_photo/6f6767f2a7e2e7dadab27e2e2df6b16a.jpg',
    'background_photo/7133b3bd47839cab1d754a0dc88dbddd.jpg',
    'background_photo/7184cbe489103a619071d9f9b7e3880e.jpg',
    'background_photo/732c48495f560f6fb6e222403a5126d0.jpg',
    'background_photo/7920afb4846965febc16fc8fcaab701e.jpg',
    'background_photo/89455641a83dd33a6ba4afdd8d03b9bb.jpg',
    'background_photo/8f289522eb633c34b9429a01a3e32657.jpg',
    'background_photo/941d502fb218db7c5cc4882c09077adf.jpg',
    'background_photo/9813a396a753744c945272b47f7461cb.jpg',
    'background_photo/9fdd90a282621bb158c1e7e9cb2a4df3.jpg',
    'background_photo/a351344a988d2f6658e4d025f0d1e65b.jpg',
    'background_photo/a43062165acb22f1160ac7a6ca6f5f3a.jpg',
    'background_photo/a438d14f9068d1eb167bfc29ffefe8d8.jpg',
    'background_photo/a751d88b0c9789535a612e36323b606d.jpg',
    'background_photo/ace1aff5b84896149411df32e6f98f1e.jpg',
    'background_photo/ae54efc49e7381637b649cde982e8bd5.jpg',
    'background_photo/ba7532b8ac9d67bb6d5966e6ed81b49c.jpg',
    'background_photo/bab781f679a425a9144e479486ec22e7.jpg',
    'background_photo/bebfe966c41b821a535955cabdce4cd5.jpg',
    'background_photo/c01cb0f25c8f6132c43d27053e327041.jpg',
    'background_photo/cb744ef6c8cb7821a41fbf5a9b635a1e.jpg',
    'background_photo/d2309937154f467195dad386fac2a156.jpg',
    'background_photo/d3ee167a84c92a7bd8ec7d0b06f78150.jpg',
    'background_photo/dae9adf2fbbb08504efb42cd4bf7ba63.jpg',
    'background_photo/dc4a7b9d6ac2eda1a23cfcc1bd6258e2.jpg',
    'background_photo/deda56bb2d9b75c76db08e27e7107aa1.jpg',
    'background_photo/e67b86dc3c4a9c57a4e1575541094a24.jpg',
    'background_photo/e8b37a9f5baea6424a3fe07605b8433a.jpg',
    'background_photo/ea60da879fc1c92292db863589b1eadf.jpg',
    'background_photo/ecf82842bc9e49d8b6ebcee126db3173.jpg',
    'background_photo/ed0545fdcd4693ec0a2f24d08967419c.jpg',
    'background_photo/efa4130740cbcb3c317dc03f11dd4edd.jpg',
    'background_photo/f05790ae21818af5fa438e1ae075438a.jpg',
    'background_photo/f13c89252e1cd363fd0d4e1ba16d085e.jpg',
    'background_photo/f5b1f76c2785e49e0fb690f174de0d4f.jpg',
    'background_photo/fb72cad14fd7f2752d586861da276a9c.jpg',
    'background_photo/fb97b82439a458a0319b3248e3d5e1ba.jpg',
    'background_photo/fbe3ac859ba2ae672f2cdf4e55cf384d.jpg',
    'background_photo/fd489655f1843ff5d4538e64d4d69e95.jpg'
  ];
  
  let photoIndex = 0;
  const totalPhotos = photos.length * 2; // 每张照片出现2次，优化性能
  
  // 创建所有照片（每张照片出现2次）
  for (let i = 0; i < totalPhotos; i++) {
    const item = document.createElement('div');
    item.className = 'photo-item';
    
    const img = document.createElement('img');
    img.src = photos[photoIndex];
    img.alt = '回忆';
    
    // 随机位置和大小，照片更大且密度更高
    const size = 150 + Math.random() * 200;
    const left = Math.random() * 105 - 5; // 允许超出边界
    const top = Math.random() * 105 - 5;
    const rotation = -30 + Math.random() * 60;
    const zIndex = Math.floor(Math.random() * 10);
    
    item.style.width = size + 'px';
    item.style.height = size * (0.8 + Math.random() * 0.6) + 'px';
    item.style.left = left + '%';
    item.style.top = top + '%';
    item.style.setProperty('--rotation', rotation + 'deg');
    item.style.transform = `rotate(${rotation}deg)`;
    item.style.zIndex = -10 - zIndex;
    
    // 缓缓出现的动画延迟，创造层次感
    const delay = i * 0.03 + Math.random() * 0.2;
    const flickerDelay = Math.random() * 4; // 闪动动画的随机延迟
    item.style.animationDelay = `${delay}s, ${delay + 2 + flickerDelay}s`;
    item.style.opacity = '0';
    item.classList.add('fade-in-photo');
    
    item.appendChild(img);
    photoWall.appendChild(item);
    
    // 每2张照片换下一张图片
    if ((i + 1) % 2 === 0) {
      photoIndex = (photoIndex + 1) % photos.length;
    }
  }
  
  document.body.insertBefore(photoWall, document.body.firstChild);
  
  // 启动持续的图片消失出现效果
  startPhotoRotation(photoWall, photos);
}

// 持续的图片消失出现效果
function startPhotoRotation(photoWall, photos) {
  const photoItems = Array.from(photoWall.querySelectorAll('.photo-item'));
  
  function rotatePhotos() {
    // 随机选或10张照片进行替换，减少卡顿
    const selectedItems = [];
    const usedIndices = new Set();
    
    // 随机选或10张不重复的照片
    while (selectedItems.length < 10 && selectedItems.length < photoItems.length) {
      const randomIndex = Math.floor(Math.random() * photoItems.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        selectedItems.push(photoItems[randomIndex]);
      }
    }
    
    // 为每张选中的照片添加消失动画，带有随机延迟
    selectedItems.forEach((item, index) => {
      const img = item.querySelector('img');
      const newPhotoSrc = photos[Math.floor(Math.random() * photos.length)];
      const disappearDelay = index * 80; // 每张照片间80ms开始消失，减少并发
      
      setTimeout(() => {
        // 停止原有动画并添加消失动画
        item.style.animation = 'none';
        item.classList.remove('fade-in-photo', 'rotating-in');
        item.classList.add('rotating-out');
        
        setTimeout(() => {
          // 更换图片
          img.src = newPhotoSrc;
          
          // 随机调整位置和大小
          const size = 150 + Math.random() * 200;
          const left = Math.random() * 105 - 5;
          const top = Math.random() * 105 - 5;
          const rotation = -30 + Math.random() * 60;
          
          item.style.width = size + 'px';
          item.style.height = size * (0.8 + Math.random() * 0.6) + 'px';
          item.style.left = left + '%';
          item.style.top = top + '%';
          item.style.setProperty('--rotation', rotation + 'deg');
          
          // 添加出现动画
          item.classList.remove('rotating-out');
          item.classList.add('rotating-in');
          
          // 动画完成后恢复原有的闪动效果
          setTimeout(() => {
            item.classList.remove('rotating-in');
            item.classList.add('fade-in-photo');
            item.style.animation = 'photoFlicker 4s ease-in-out infinite';
            const flickerDelay = Math.random() * 4;
            item.style.animationDelay = flickerDelay + 's';
          }, 1200);
        }, 800);
      }, disappearDelay);
    });
  }
  
  // 每6-10秒批量替换10张照片
  function scheduleNextRotation() {
    const delay = 6000 + Math.random() * 4000;
    setTimeout(() => {
      rotatePhotos();
      scheduleNextRotation();
    }, delay);
  }
  
  // 页面加载完成后开始轮换
  setTimeout(scheduleNextRotation, 5000);
}

// 初始化
window.addEventListener('DOMContentLoaded', () => {
  initPhotoWall();
  setName();
  updateDays();
  typewriter();
  initBackground();
  initSweetDialog();
  initReveal();
  initLightbox();
  initQuiz();
  initEaster();
  initPlayer();
  
  // 新增惊喜特效
  initFloatingHearts();
  initMouseTrail();
  initDoubleClickFireworks();
  initShakeEaster();
  initLongPressEaster();
});
