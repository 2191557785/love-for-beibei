// 移动端专用 JavaScript
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
  if (!daysEl || !CONFIG.anniversary) return;
  
  const anniversary = new Date(CONFIG.anniversary);
  const today = new Date();
  const diffTime = Math.abs(today - anniversary);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  daysEl.textContent = diffDays;
}

// 设置名字
function setName() {
  const nameEl = $('#yourName');
  if (nameEl && CONFIG.yourName) {
    nameEl.textContent = CONFIG.yourName;
  }
}

// 打字机效果 - 移动端优化
function typewriter() {
  const el = $('#typewriterText');
  if (!el) return;
  
  const lines = JSON.parse(el.dataset.lines || '["贝贝，你好！"]');
  let lineIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  
  function type() {
    const currentLine = lines[lineIndex];
    
    if (isDeleting) {
      el.textContent = currentLine.substring(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = currentLine.substring(0, charIndex + 1);
      charIndex++;
    }
    
    let typeSpeed = isDeleting ? 50 : 100;
    
    if (!isDeleting && charIndex === currentLine.length) {
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      lineIndex = (lineIndex + 1) % lines.length;
      typeSpeed = 500;
    }
    
    setTimeout(type, typeSpeed);
  }
  
  type();
}

// 移动端背景粒子效果（简化版）
function initBackground() {
  const canvas = $('#bg-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
    };
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 限制粒子数量以优化性能
    while (particles.length < 30) {
      particles.push(createParticle());
    }
    
    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      if (particle.x < 0 || particle.x > canvas.width || 
          particle.y < 0 || particle.y > canvas.height) {
        particles[index] = createParticle();
      }
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
      ctx.fill();
    });
    
    requestAnimationFrame(animate);
  }
  
  resize();
  animate();
  
  window.addEventListener('resize', resize);
}

// 音乐播放器 - 移动端优化
function initPlayer() {
  const audio = $('#audio');
  const play = $('#play');
  const volume = $('#volume');
  if (!audio || !play || !volume) return;
  
  // 设置初始音量
  audio.volume = Number(volume.value);
  
  // 移动端自动播放策略
  const tryAutoPlay = () => {
    audio.play().catch(() => {
      // 如果自动播放失败，在用户首次交互时播放
      const playOnInteraction = () => {
        audio.play().catch(()=>{});
        document.removeEventListener('touchstart', playOnInteraction);
        document.removeEventListener('click', playOnInteraction);
      };
      document.addEventListener('touchstart', playOnInteraction, { once: true });
      document.addEventListener('click', playOnInteraction, { once: true });
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

// 甜蜜弹窗
function initSweetDialog() {
  const btn = $('#loveButton');
  const dlg = $('#sweetDialog');
  const note = $('#loveNote');
  if (!btn || !dlg || !note) return;
  
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

// 滚动 Reveal - 移动端优化
function initReveal() {
  const els = $$('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  
  els.forEach(el => observer.observe(el));
}

// 测验游戏
function initQuiz() {
  const opts = $$('.opt');
  const result = $('#quizResult');
  if (!opts.length || !result) return;
  
  opts.forEach(opt => {
    opt.addEventListener('click', () => {
      const isCorrect = opt.dataset.correct === 'true';
      opts.forEach(o => {
        o.classList.add(o.dataset.correct === 'true' ? 'correct' : 'wrong');
        o.disabled = true;
      });
      
      if (isCorrect) {
        result.textContent = '答对了！你最懂我 💕';
        burstHearts(window.innerWidth / 2, window.innerHeight / 2, 30);
      } else {
        result.textContent = '哈哈，再想想～';
      }
    });
  });
}

// Konami Code 彩蛋
(function() {
  const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
  let userSequence = [];
  
  document.addEventListener('keydown', (e) => {
    userSequence.push(e.code);
    userSequence = userSequence.slice(-sequence.length);
    
    if (userSequence.join(',') === sequence.join(',')) {
      const easter = $('#easter');
      if (easter) {
        easter.classList.remove('hidden');
        easter.scrollIntoView({ behavior: 'smooth' });
        burstHearts(window.innerWidth / 2, window.innerHeight / 2, 50);
      }
    }
  });
  
  const megaHeart = $('#megaHeart');
  if (megaHeart) {
    megaHeart.addEventListener('click', () => {
      burstHearts(window.innerWidth / 2, window.innerHeight / 2, 100);
    });
  }
})();

// 移动端触摸爱心雨
function initTouchHearts() {
  setInterval(() => {
    if (Math.random() < 0.15) { // 降低频率
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      heart.textContent = ['❤', '💕', '💖'][Math.floor(Math.random() * 3)];
      heart.style.left = Math.random() * 100 + 'vw';
      heart.style.animationDuration = (5 + Math.random() * 3) + 's';
      heart.style.fontSize = (20 + Math.random() * 15) + 'px';
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 8000);
    }
  }, 4000);
}

// 触摸轨迹特效
function initTouchTrail() {
  let lastTime = 0;
  
  document.addEventListener('touchmove', (e) => {
    // 只在特定元素上阻止滚动，不是全局阻止
    if (e.target.closest('.hero')) {
      const now = Date.now();
      if (now - lastTime < 150) return;
      lastTime = now;
      
      const touch = e.touches[0];
      const trail = document.createElement('div');
      trail.className = 'touch-trail';
      trail.style.left = touch.pageX + 'px';
      trail.style.top = touch.pageY + 'px';
      document.body.appendChild(trail);
      setTimeout(() => trail.remove(), 800);
    }
  }, { passive: true });
}

// 双击烟花效果
function initDoubleTapFireworks() {
  let lastTap = 0;
  
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // 双击触发烟花
      const touch = e.changedTouches[0];
      burstHearts(touch.pageX, touch.pageY, 25);
    }
    lastTap = now;
  });
}

// 摇一摇彩蛋（移动设备专用）
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
    
    if (deltaX + deltaY + deltaZ > 25) { // 降低敏感度
      shakeCount++;
      if (shakeCount > 2) { // 减少需要的摇动次数
        burstHearts(window.innerWidth / 2, window.innerHeight / 2, 40);
        shakeCount = 0;
      }
    }
    
    lastX = acc.x;
    lastY = acc.y;
    lastZ = acc.z;
  });
}

// 长按彩蛋 - 移动端优化
function initLongPressEaster() {
  let pressTimer;
  const hero = $('.hero');
  if (!hero) return;
  
  // 触摸事件
  hero.addEventListener('touchstart', (e) => {
    e.preventDefault();
    pressTimer = setTimeout(() => {
      burstHearts(window.innerWidth / 2, window.innerHeight / 3, 60);
      const msg = document.createElement('div');
      msg.className = 'secret-message';
      msg.textContent = '张贝贝，我爱你！ 💕';
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 3000);
    }, 1500); // 缩短长按时间
  });
  
  hero.addEventListener('touchend', () => clearTimeout(pressTimer));
  hero.addEventListener('touchcancel', () => clearTimeout(pressTimer));
  
  // 鼠标事件（兼容性）
  hero.addEventListener('mousedown', () => {
    pressTimer = setTimeout(() => {
      burstHearts(window.innerWidth / 2, window.innerHeight / 3, 60);
      const msg = document.createElement('div');
      msg.className = 'secret-message';
      msg.textContent = '张贝贝，我爱你！ 💕';
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 3000);
    }, 1500);
  });
  
  hero.addEventListener('mouseup', () => clearTimeout(pressTimer));
  hero.addEventListener('mouseleave', () => clearTimeout(pressTimer));
}

// 创建照片墙背景 - 简化版本
function initPhotoWall() {
  const photoWall = document.createElement('div');
  photoWall.className = 'photo-wall';
  
  // 所有可用照片路径
  const allPhotos = [
    'background_photo/05c667d4c3901466caa43d86605c8896.jpg',
    'background_photo/17c04ded88e2bdad483a73e20aba29a0.jpg',
    'background_photo/18a325bd95025a47cb9bfaa4da42c04c.jpg',
    'background_photo/19d1b3a49ea6e3b6ddbb336d4f586099.jpg',
    'background_photo/19e3b947af4dec061f2a6dbeb798d1d8.jpg',
    'background_photo/1c410e6c22c855c560b8cc585e6d3aa7.jpg',
    'background_photo/2032a170a05dbaa8514ead827f59916a.jpg',
    'background_photo/f05790ae21818af5fa438e1ae075438a.jpg',
    'background_photo/f13c89252e1cd363fd0d4e1ba16d085e.jpg',
    'background_photo/f5b1f76c2785e49e0fb690f174de0d4f.jpg',
    'background_photo/fb72cad14fd7f2752d586861da276a9c.jpg',
    'background_photo/fb97b82439a458a0319b3248e3d5e1ba.jpg',
    'background_photo/fbe3ac859ba2ae672f2cdf4e55cf384d.jpg',
    'background_photo/fd489655f1843ff5d4538e64d4d69e95.jpg'
  ];
  
  // 随机选择10张照片
  const selectedPhotos = [];
  const usedIndices = new Set();
  
  while (selectedPhotos.length < 10) {
    const randomIndex = Math.floor(Math.random() * allPhotos.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      selectedPhotos.push(allPhotos[randomIndex]);
    }
  }
  
  // 创建10张照片
  selectedPhotos.forEach((photoSrc, i) => {
    const item = document.createElement('div');
    item.className = 'photo-item';
    
    const img = document.createElement('img');
    img.src = photoSrc;
    img.alt = '回忆';
    img.loading = 'lazy';
    
    // 移动端适配的尺寸
    const size = 120 + Math.random() * 100;
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const rotation = -30 + Math.random() * 60;
    const zIndex = Math.floor(Math.random() * 10);
    
    item.style.width = size + 'px';
    item.style.height = size * (0.7 + Math.random() * 0.6) + 'px';
    item.style.left = left + '%';
    item.style.top = top + '%';
    item.style.setProperty('--rotation', rotation + 'deg');
    item.style.transform = `rotate(${rotation}deg)`;
    item.style.zIndex = -10 - zIndex;
    
    // 简化的动画延迟
    const delay = i * 0.2 + Math.random() * 0.5;
    const flickerDelay = Math.random() * 4;
    item.style.animationDelay = `${delay}s, ${delay + 2 + flickerDelay}s`;
    item.style.opacity = '0';
    item.classList.add('fade-in-photo');
    
    item.appendChild(img);
    photoWall.appendChild(item);
  });
  
  document.body.insertBefore(photoWall, document.body.firstChild);
  
  // 启动简化的图片轮换
  startSimplePhotoRotation(photoWall, allPhotos);
}

// 简化的照片轮换
function startSimplePhotoRotation(photoWall, allPhotos) {
  const photoItems = Array.from(photoWall.querySelectorAll('.photo-item'));
  
  function rotatePhotos() {
    // 每次随机替换3张照片
    const selectedItems = [];
    const usedIndices = new Set();
    
    while (selectedItems.length < 3 && selectedItems.length < photoItems.length) {
      const randomIndex = Math.floor(Math.random() * photoItems.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        selectedItems.push(photoItems[randomIndex]);
      }
    }
    
    selectedItems.forEach((item, index) => {
      const img = item.querySelector('img');
      const newPhotoSrc = allPhotos[Math.floor(Math.random() * allPhotos.length)];
      const delay = index * 200; // 错开替换时间
      
      setTimeout(() => {
        // 简单的淡出淡入效果
        item.style.transition = 'opacity 0.5s ease';
        item.style.opacity = '0';
        
        setTimeout(() => {
          img.src = newPhotoSrc;
          
          // 重新随机位置和大小
          const size = 120 + Math.random() * 100;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const rotation = -30 + Math.random() * 60;
          
          item.style.width = size + 'px';
          item.style.height = size * (0.7 + Math.random() * 0.6) + 'px';
          item.style.left = left + '%';
          item.style.top = top + '%';
          item.style.setProperty('--rotation', rotation + 'deg');
          item.style.transform = `rotate(${rotation}deg)`;
          
          // 淡入
          item.style.opacity = '0.7';
        }, 500);
      }, delay);
    });
  }
  
  // 每10-15秒轮换一次
  function scheduleNextRotation() {
    const delay = 10000 + Math.random() * 5000;
    setTimeout(() => {
      rotatePhotos();
      scheduleNextRotation();
    }, delay);
  }
  
  setTimeout(scheduleNextRotation, 8000);
}

// 爱心爆炸效果
function burstHearts(x, y, count = 20) {
  for (let i = 0; i < count; i++) {
    const heart = document.createElement('div');
    heart.className = 'firework-particle';
    heart.textContent = ['❤', '💕', '💖'][Math.floor(Math.random() * 3)];
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    heart.style.color = ['#ff6b9d', '#a8e6cf', '#ffd93d'][Math.floor(Math.random() * 3)];
    
    const angle = (Math.PI * 2 * i) / count;
    const velocity = 50 + Math.random() * 50;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    heart.style.setProperty('--vx', vx + 'px');
    heart.style.setProperty('--vy', vy + 'px');
    
    document.body.appendChild(heart);
    
    heart.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${vx}px, ${vy}px) scale(0)`, opacity: 0 }
    ], {
      duration: 1000,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }).onfinish = () => heart.remove();
  }
}

// 灯箱功能
function initLightbox() {
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  if (!lightbox || !lightboxImg) return;
  
  $$('img[src*="memory"], img[src*="assets"]').forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      try { lightbox.showModal(); } catch { lightbox.show?.(); }
    });
  });
}

// 平滑滚动
(function() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a) {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      target?.scrollIntoView({ behavior: 'smooth' });
    }
  });
})();

// 初始化 - 移动端优化（无背景图片）
window.addEventListener('DOMContentLoaded', () => {
  // initPhotoWall(); // 移除背景照片墙
  setName();
  updateDays();
  typewriter();
  initBackground();
  initSweetDialog();
  initReveal();
  initQuiz();
  initPlayer();
  initLightbox();
  initTouchHearts();
  initTouchTrail();
  initDoubleTapFireworks();
  initShakeEaster();
  initLongPressEaster();
});

// 防止移动端缩放（但不阻止滚动）
document.addEventListener('touchstart', function(event) {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
}, { passive: false });

// 防止双击缩放，但允许滚动
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
  const now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    // 只在非滚动元素上阻止双击
    if (!event.target.closest('.section, .timeline, .quiz')) {
      event.preventDefault();
    }
  }
  lastTouchEnd = now;
}, { passive: false });
