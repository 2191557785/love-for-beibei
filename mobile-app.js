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
