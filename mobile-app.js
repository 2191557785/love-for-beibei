// 重构移动端 JavaScript
class MobileLoveApp {
  constructor() {
    this.config = {
      yourName: '给亲爱的贝贝',
      anniversary: '2025-07-04',
      loveMessages: [
        '贝贝，遇见你，是我所有美好故事的开始。',
        '贝贝，今天，想把心里的话，慢慢说给你听。',
        '贝贝，愿以后每一天，都有你。'
      ],
      secretMessage: '张贝贝，我爱你！ 💕'
    };
    
    this.elements = {};
    this.isPlaying = false;
    this.longPressTimer = null;
    this.deferredPrompt = null;
    
    this.init();
  }

  // 初始化
  init() {
    this.bindElements();
    this.setupEventListeners();
    this.updateDays();
    this.startTypewriter();
    this.initAudio();
    this.initShakeDetection();
    this.initPhotoWall();
    this.initPWA();
  }

  // 绑定DOM元素
  bindElements() {
    this.elements = {
      typeText: document.getElementById('typeText'),
      days: document.getElementById('days'),
      loveBtn: document.getElementById('loveBtn'),
      heartBtn: document.getElementById('heartBtn'),
      playBtn: document.getElementById('playBtn'),
      audio: document.getElementById('audio'),
      volume: document.getElementById('volume'),
      modal: document.getElementById('modal'),
      modalTitle: document.getElementById('modalTitle'),
      modalText: document.getElementById('modalText'),
      modalClose: document.getElementById('modalClose'),
      effects: document.getElementById('effects'),
      result: document.getElementById('result'),
      options: document.querySelectorAll('.option')
    };
  }

  // 设置事件监听器
  setupEventListeners() {
    // 爱心按钮
    this.elements.loveBtn.addEventListener('click', () => this.showLoveModal());
    
    // 大爱心按钮
    this.elements.heartBtn.addEventListener('click', () => this.createHeartBurst());
    
    // 播放按钮
    this.elements.playBtn.addEventListener('click', () => this.toggleMusic());
    
    // 音量控制
    this.elements.volume.addEventListener('input', (e) => {
      this.elements.audio.volume = e.target.value;
    });
    
    // 弹窗关闭
    this.elements.modalClose.addEventListener('click', () => this.hideModal());
    this.elements.modal.addEventListener('click', (e) => {
      if (e.target === this.elements.modal) this.hideModal();
    });
    
    // 测验选项
    this.elements.options.forEach(option => {
      option.addEventListener('click', (e) => this.handleQuiz(e));
    });
    
    // 长按检测
    document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    document.addEventListener('touchend', () => this.handleTouchEnd(), { passive: true });
    document.addEventListener('touchcancel', () => this.handleTouchEnd(), { passive: true });
    
    // 双击检测
    let lastTap = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTap < 300) {
        this.createFireworks(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
      lastTap = now;
    }, { passive: true });
  }

  // 更新天数
  updateDays() {
    if (!this.config.anniversary) return;
    
    const anniversary = new Date(this.config.anniversary);
    const today = new Date();
    const diffTime = Math.abs(today - anniversary);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    this.elements.days.textContent = diffDays;
  }

  // 打字机效果
  startTypewriter() {
    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    const type = () => {
      const currentMessage = this.config.loveMessages[messageIndex];
      
      if (isDeleting) {
        this.elements.typeText.textContent = currentMessage.substring(0, charIndex - 1);
        charIndex--;
      } else {
        this.elements.typeText.textContent = currentMessage.substring(0, charIndex + 1);
        charIndex++;
      }
      
      let typeSpeed = isDeleting ? 50 : 100;
      
      if (!isDeleting && charIndex === currentMessage.length) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        messageIndex = (messageIndex + 1) % this.config.loveMessages.length;
        typeSpeed = 500;
      }
      
      setTimeout(type, typeSpeed);
    };
    
    type();
  }

  // 音频初始化
  initAudio() {
    this.elements.audio.volume = this.elements.volume.value;
    
    // 尝试自动播放
    const tryAutoPlay = () => {
      this.elements.audio.play()
        .then(() => {
          this.isPlaying = true;
          this.updatePlayButton();
        })
        .catch(() => {
          // 自动播放失败，等待用户交互
          const playOnInteraction = () => {
            this.elements.audio.play()
              .then(() => {
                this.isPlaying = true;
                this.updatePlayButton();
              })
              .catch(() => {});
            document.removeEventListener('touchstart', playOnInteraction);
            document.removeEventListener('click', playOnInteraction);
          };
          
          document.addEventListener('touchstart', playOnInteraction, { once: true, passive: true });
          document.addEventListener('click', playOnInteraction, { once: true });
        });
    };
    
    setTimeout(tryAutoPlay, 1000);
  }

  // 切换音乐播放
  toggleMusic() {
    if (this.isPlaying) {
      this.elements.audio.pause();
      this.isPlaying = false;
    } else {
      this.elements.audio.play()
        .then(() => {
          this.isPlaying = true;
        })
        .catch(() => {});
    }
    this.updatePlayButton();
  }

  // 更新播放按钮
  updatePlayButton() {
    this.elements.playBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
  }

  // 显示爱的弹窗
  showLoveModal() {
    const messages = [
      '贝贝，从遇见你开始，星星也有了归宿。',
      '贝贝，我会把所有的温柔和偏爱都给你。',
      '贝贝，愿以后每一天，都有你。',
      '贝贝，在所有的喜欢里，我最喜欢你。',
      '贝贝，想把一切最好的都给你。'
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    this.elements.modalText.textContent = randomMessage;
    this.elements.modal.classList.add('show');
    
    // 创建爱心特效
    this.createFloatingHearts();
  }

  // 隐藏弹窗
  hideModal() {
    this.elements.modal.classList.remove('show');
  }

  // 处理测验
  handleQuiz(e) {
    const isCorrect = e.target.dataset.correct === 'true';
    
    // 禁用所有选项
    this.elements.options.forEach(option => {
      option.disabled = true;
      option.classList.add(option.dataset.correct === 'true' ? 'correct' : 'wrong');
    });
    
    // 显示结果
    if (isCorrect) {
      this.elements.result.textContent = '答对了！你最懂我 💕';
      this.createHeartBurst();
    } else {
      this.elements.result.textContent = '哈哈，再想想～';
    }
  }

  // 长按处理
  handleTouchStart(e) {
    this.longPressTimer = setTimeout(() => {
      this.showSecretMessage();
    }, 1500);
  }

  handleTouchEnd() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  // 显示秘密消息
  showSecretMessage() {
    const message = document.createElement('div');
    message.className = 'secret-message';
    message.textContent = this.config.secretMessage;
    document.body.appendChild(message);
    
    this.createHeartBurst();
    
    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  // 摇一摇检测
  initShakeDetection() {
    if (!window.DeviceMotionEvent) return;
    
    let lastX = 0, lastY = 0, lastZ = 0;
    let shakeCount = 0;
    
    window.addEventListener('devicemotion', (e) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      
      const deltaX = Math.abs(acc.x - lastX);
      const deltaY = Math.abs(acc.y - lastY);
      const deltaZ = Math.abs(acc.z - lastZ);
      
      if (deltaX + deltaY + deltaZ > 20) {
        shakeCount++;
        if (shakeCount > 2) {
          this.createHeartBurst();
          shakeCount = 0;
        }
      }
      
      lastX = acc.x;
      lastY = acc.y;
      lastZ = acc.z;
    });
  }

  // 创建飘落爱心
  createFloatingHearts() {
    const hearts = ['💕', '💖', '💗', '💝', '❤️'];
    
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.fontSize = (1.2 + Math.random() * 0.8) + 'rem';
        
        this.elements.effects.appendChild(heart);
        
        setTimeout(() => {
          heart.remove();
        }, 4000);
      }, i * 200);
    }
  }

  // 创建爱心爆炸
  createHeartBurst() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    for (let i = 0; i < 15; i++) {
      const heart = document.createElement('div');
      heart.textContent = '💕';
      heart.style.position = 'fixed';
      heart.style.left = centerX + 'px';
      heart.style.top = centerY + 'px';
      heart.style.fontSize = '1.5rem';
      heart.style.pointerEvents = 'none';
      heart.style.zIndex = '1000';
      
      const angle = (Math.PI * 2 * i) / 15;
      const velocity = 100 + Math.random() * 50;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      
      document.body.appendChild(heart);
      
      heart.animate([
        { 
          transform: 'translate(0, 0) scale(1)', 
          opacity: 1 
        },
        { 
          transform: `translate(${vx}px, ${vy}px) scale(0)`, 
          opacity: 0 
        }
      ], {
        duration: 1000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }).onfinish = () => heart.remove();
    }
  }

  // 创建烟花效果
  createFireworks(x, y) {
    const colors = ['#ff6b9d', '#a8e6cf', '#ffd93d', '#ff8fab', '#90ee90'];
    
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = 'firework';
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      
      const angle = (Math.PI * 2 * i) / 12;
      const velocity = 80 + Math.random() * 40;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      
      this.elements.effects.appendChild(particle);
      
      particle.animate([
        { 
          transform: 'translate(0, 0) scale(1)', 
          opacity: 1 
        },
        { 
          transform: `translate(${vx}px, ${vy}px) scale(0)`, 
          opacity: 0 
        }
      ], {
        duration: 800,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }).onfinish = () => particle.remove();
    }
  }

  // 初始化背景照片墙
  initPhotoWall() {
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

    // 创建背景墙容器
    const photoWall = document.createElement('div');
    photoWall.className = 'photo-wall';
    document.body.insertBefore(photoWall, document.body.firstChild);

    // 随机选择10张照片并创建元素
    this.photoItems = [];
    this.currentPhotoSet = this.selectRandomPhotos(allPhotos, 10);
    
    this.currentPhotoSet.forEach((photoSrc, index) => {
      const item = this.createPhotoItem(photoSrc, index);
      photoWall.appendChild(item);
      this.photoItems.push(item);
    });

    // 延迟显示照片，创造层次感
    setTimeout(() => {
      this.photoItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('visible', 'floating');
        }, index * 300);
      });
    }, 1000);

    // 启动照片轮换
    this.startPhotoRotation(allPhotos);
  }

  // 随机选择照片
  selectRandomPhotos(allPhotos, count) {
    const selected = [];
    const used = new Set();
    
    while (selected.length < count) {
      const randomIndex = Math.floor(Math.random() * allPhotos.length);
      if (!used.has(randomIndex)) {
        used.add(randomIndex);
        selected.push(allPhotos[randomIndex]);
      }
    }
    
    return selected;
  }

  // 创建照片元素
  createPhotoItem(photoSrc, index) {
    const item = document.createElement('div');
    item.className = 'photo-item';
    
    const img = document.createElement('img');
    img.src = photoSrc;
    img.alt = '美好回忆';
    img.loading = 'lazy';
    
    // 随机位置和大小
    const size = 100 + Math.random() * 80;
    const left = Math.random() * 85;
    const top = Math.random() * 85;
    const rotation = -20 + Math.random() * 40;
    const zIndex = Math.floor(Math.random() * 10);
    
    item.style.width = size + 'px';
    item.style.height = size * (0.7 + Math.random() * 0.6) + 'px';
    item.style.left = left + '%';
    item.style.top = top + '%';
    item.style.setProperty('--rotation', rotation + 'deg');
    item.style.transform = `rotate(${rotation}deg)`;
    item.style.zIndex = -10 - zIndex;
    
    // 添加随机动画延迟
    item.style.animationDelay = (Math.random() * 4) + 's';
    
    item.appendChild(img);
    return item;
  }

  // 开始照片轮换
  startPhotoRotation(allPhotos) {
    setInterval(() => {
      this.rotatePhotos(allPhotos);
    }, 12000); // 每12秒轮换一次
  }

  // 轮换照片
  rotatePhotos(allPhotos) {
    // 随机选择3张照片进行替换
    const itemsToReplace = [];
    const usedIndices = new Set();
    
    while (itemsToReplace.length < 3) {
      const randomIndex = Math.floor(Math.random() * this.photoItems.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        itemsToReplace.push(this.photoItems[randomIndex]);
      }
    }

    itemsToReplace.forEach((item, index) => {
      setTimeout(() => {
        // 淡出
        item.classList.remove('visible');
        item.classList.add('fade-out');
        
        setTimeout(() => {
          // 更换图片和位置
          const newPhotoSrc = allPhotos[Math.floor(Math.random() * allPhotos.length)];
          const img = item.querySelector('img');
          img.src = newPhotoSrc;
          
          // 重新随机位置
          const size = 100 + Math.random() * 80;
          const left = Math.random() * 85;
          const top = Math.random() * 85;
          const rotation = -20 + Math.random() * 40;
          
          item.style.width = size + 'px';
          item.style.height = size * (0.7 + Math.random() * 0.6) + 'px';
          item.style.left = left + '%';
          item.style.top = top + '%';
          item.style.setProperty('--rotation', rotation + 'deg');
          item.style.transform = `rotate(${rotation}deg)`;
          
          // 淡入
          item.classList.remove('fade-out');
          item.classList.add('fade-in', 'visible', 'floating');
          
          setTimeout(() => {
            item.classList.remove('fade-in');
          }, 1000);
        }, 1000);
      }, index * 500); // 错开替换时间
    });
  }

  // 初始化PWA功能
  initPWA() {
    // 注册Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // 监听PWA安装提示
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    // 监听PWA安装完成
    window.addEventListener('appinstalled', () => {
      console.log('PWA安装成功！');
      this.showInstallSuccess();
    });
  }

  // 显示安装提示
  showInstallPrompt() {
    // 创建安装提示
    const installBanner = document.createElement('div');
    installBanner.className = 'install-banner';
    installBanner.innerHTML = `
      <div class="install-content">
        <div class="install-icon">📱</div>
        <div class="install-text">
          <h3>安装"贝贝的爱"APP</h3>
          <p>添加到主屏幕，随时查看我们的爱</p>
        </div>
        <button class="install-btn" id="installBtn">安装</button>
        <button class="install-close" id="installClose">×</button>
      </div>
    `;

    // 添加样式
    installBanner.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: linear-gradient(45deg, var(--primary), var(--accent));
      border-radius: 15px;
      padding: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideUp 0.3s ease-out;
    `;

    document.body.appendChild(installBanner);

    // 绑定事件
    const installBtn = installBanner.querySelector('#installBtn');
    const closeBtn = installBanner.querySelector('#installClose');

    installBtn.addEventListener('click', () => {
      this.installPWA();
      installBanner.remove();
    });

    closeBtn.addEventListener('click', () => {
      installBanner.remove();
    });

    // 5秒后自动隐藏
    setTimeout(() => {
      if (installBanner.parentNode) {
        installBanner.remove();
      }
    }, 8000);
  }

  // 安装PWA
  async installPWA() {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('用户接受了安装');
    } else {
      console.log('用户拒绝了安装');
    }
    
    this.deferredPrompt = null;
  }

  // 显示安装成功消息
  showInstallSuccess() {
    const successMsg = document.createElement('div');
    successMsg.className = 'install-success';
    successMsg.innerHTML = `
      <div class="success-content">
        <div class="success-icon">🎉</div>
        <h3>安装成功！</h3>
        <p>现在可以从主屏幕直接打开啦</p>
      </div>
    `;

    successMsg.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--card-bg);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 30px;
      text-align: center;
      z-index: 10000;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      animation: modalPop 0.3s ease-out;
    `;

    document.body.appendChild(successMsg);

    setTimeout(() => {
      successMsg.remove();
    }, 3000);
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new MobileLoveApp();
});

// 定期创建飘落爱心
setInterval(() => {
  if (Math.random() < 0.3) {
    const hearts = ['💕', '💖', '💗'];
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.fontSize = (1 + Math.random() * 0.5) + 'rem';
    
    document.getElementById('effects').appendChild(heart);
    
    setTimeout(() => {
      heart.remove();
    }, 4000);
  }
}, 3000);
