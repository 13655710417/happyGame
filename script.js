// tao出个游戏 - 交互功能脚本

document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    initTheme();
    initScrollEffects();
    initFeedbackForm();
    initAnimations();
    initGameCards();
    initCircleProgress();
});

// 主题切换功能
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');

    // 检查本地存储的主题设置
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // 主题切换事件
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);

        // 添加切换动画
        themeToggle.style.transform = 'scale(1.2) rotate(180deg)';
        setTimeout(() => {
            themeToggle.style.transform = '';
        }, 300);
    });

    function updateThemeIcon(theme) {
        themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// 滚动效果
function initScrollEffects() {
    const backToTop = document.getElementById('backToTop');
    const navbar = document.querySelector('.navbar');

    // 返回顶部按钮
    window.addEventListener('scroll', function() {
        // 显示/隐藏返回顶部按钮
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        // 导航栏阴影
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = 'var(--shadow-sm)';
        }

        // 游戏卡片动画
        animateOnScroll('.game-card', 'animate__fadeInUp');
        animateOnScroll('.feature', 'animate__fadeInLeft');
    });

    // 返回顶部功能
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 滚动动画
function animateOnScroll(selector, animationClass) {
    const elements = document.querySelectorAll(selector);

    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add(animationClass);
        }
    });
}

// 留言表单功能
function initFeedbackForm() {
    const feedbackForm = document.getElementById('feedbackForm');
    const messagesList = document.getElementById('messagesList');
    const successToast = document.getElementById('successToast');

    // 加载现有留言
    loadMessages();

    // 表单提交
    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const gameSuggestion = document.getElementById('gameSuggestion').value.trim();
        const message = document.getElementById('message').value.trim();
        const contact = document.getElementById('contact').value.trim();

        if (!username || !gameSuggestion || !message) {
            alert('请填写所有必填字段！');
            return;
        }

        // 创建新留言
        const newMessage = {
            id: Date.now(),
            username: username,
            gameSuggestion: gameSuggestion,
            message: message,
            contact: contact || '未提供',
            timestamp: new Date().toISOString(),
            timeAgo: '刚刚'
        };

        // 保存到本地存储
        saveMessage(newMessage);

        // 添加到留言列表
        addMessageToDOM(newMessage);

        // 显示成功提示
        showSuccessToast();

        // 重置表单
        feedbackForm.reset();
    });

    // 保存留言到本地存储
    function saveMessage(message) {
        let messages = JSON.parse(localStorage.getItem('gameMessages') || '[]');
        messages.unshift(message); // 添加到开头
        messages = messages.slice(0, 20); // 只保留最新的20条
        localStorage.setItem('gameMessages', JSON.stringify(messages));
    }

    // 加载留言
    function loadMessages() {
        const messages = JSON.parse(localStorage.getItem('gameMessages') || '[]');

        // 如果有保存的留言，清空示例留言
        if (messages.length > 0) {
            messagesList.innerHTML = '';
        }

        messages.forEach(message => {
            addMessageToDOM(message);
        });
    }

    // 添加留言到DOM
    function addMessageToDOM(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message-item animate__animated animate__fadeInRight';
        messageElement.innerHTML = `
            <div class="message-header">
                <div class="message-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="message-info">
                    <h4>${escapeHtml(message.username)}</h4>
                    <span class="message-time">${formatTimeAgo(message.timestamp)}</span>
                </div>
            </div>
            <div class="message-content">
                <p class="message-game">建议：${escapeHtml(message.gameSuggestion)}</p>
                <p>${escapeHtml(message.message)}</p>
            </div>
        `;

        messagesList.insertBefore(messageElement, messagesList.firstChild);
    }

    // 显示成功提示
    function showSuccessToast() {
        successToast.classList.add('show');
        setTimeout(() => {
            successToast.classList.remove('show');
        }, 3000);
    }

    // 格式化时间
    function formatTimeAgo(timestamp) {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now - messageTime) / 1000);

        if (diffInSeconds < 60) return '刚刚';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`;
        return `${Math.floor(diffInSeconds / 86400)}天前`;
    }

    // HTML转义
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 动画效果
function initAnimations() {
    // 游戏图标浮动动画
    const icons = document.querySelectorAll('.icon');
    icons.forEach((icon, index) => {
        icon.style.animationDelay = `${index * 0.5}s`;
    });

    // 滚动指示器动画
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            document.querySelector('#games').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }

    // 游戏卡片悬停效果
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const gameType = this.getAttribute('data-game');
            const colors = {
                'story': 'var(--anime-purple)',
                'sudoku': 'var(--anime-green)',
                'sheep': 'var(--anime-pink)',
                'draw': 'var(--anime-blue)'
            };

            this.style.borderColor = colors[gameType] || 'var(--anime-pink)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.borderColor = 'transparent';
        });
    });
}

// 游戏卡片初始化
function initGameCards() {
    const gameCards = document.querySelectorAll('.game-card');

    // 添加延迟动画
    gameCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
        card.classList.add('animate__animated');
    });

    // 检查游戏链接
    gameCards.forEach(card => {
        const playBtn = card.querySelector('.play-btn');
        if (playBtn) {
            const gameUrl = playBtn.getAttribute('href');

            // 验证游戏文件是否存在（简化版本）
            playBtn.addEventListener('click', function(e) {
                // 这里可以添加游戏文件存在性检查
                // 暂时只记录点击
                console.log(`进入游戏: ${gameUrl}`);

                // 添加点击动画
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 200);
            });
        }
    });
}

// 圆形进度条初始化
function initCircleProgress() {
    const progressCircles = document.querySelectorAll('.circle-progress');

    progressCircles.forEach(circle => {
        const value = circle.getAttribute('data-value');
        circle.style.setProperty('--value', `${value}%`);

        // 添加数字动画
        const numberSpan = circle.querySelector('span');
        if (numberSpan) {
            animateNumber(numberSpan, parseInt(value));
        }
    });
}

// 数字动画
function animateNumber(element, target) {
    let current = 0;
    const increment = target / 50; // 50帧完成动画
    const duration = 1000; // 1秒

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = target === 4 ? '4+' : Math.round(current) + (target === 100 ? '%' : '');
    }, duration / 50);
}

// 页面加载动画
window.addEventListener('load', function() {
    // 添加加载完成动画
    document.body.classList.add('loaded');

    // 初始化所有动画
    setTimeout(() => {
        const animatedElements = document.querySelectorAll('.animate__animated');
        animatedElements.forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight) {
                const animationClass = Array.from(el.classList).find(cls =>
                    cls.startsWith('animate__') && cls !== 'animate__animated'
                );
                if (animationClass) {
                    el.classList.add(animationClass);
                }
            }
        });
    }, 100);
});

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    // Ctrl + T 切换主题
    if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        document.getElementById('themeToggle').click();
    }

    // Esc 关闭弹窗（如果有）
    if (e.key === 'Escape') {
        const toast = document.getElementById('successToast');
        if (toast.classList.contains('show')) {
            toast.classList.remove('show');
        }
    }
});

// 页面可见性变化
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 页面重新可见时，更新留言时间
        updateMessageTimes();
    }
});

// 更新留言时间
function updateMessageTimes() {
    const timeElements = document.querySelectorAll('.message-time');
    timeElements.forEach(element => {
        // 这里可以添加更精确的时间更新逻辑
        // 暂时只更新显示
        console.log('更新时间显示');
    });
}

// 错误处理
window.addEventListener('error', function(e) {
    console.error('页面错误:', e.error);
    // 这里可以添加错误上报逻辑
});

// 性能监控
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = window.performance.getEntriesByType('navigation')[0];
            console.log('页面加载性能:', {
                DNS查询: perfData.domainLookupEnd - perfData.domainLookupStart,
                TCP连接: perfData.connectEnd - perfData.connectStart,
                请求响应: perfData.responseEnd - perfData.requestStart,
                DOM解析: perfData.domComplete - perfData.domInteractive,
                页面加载: perfData.loadEventEnd - perfData.loadEventStart
            });
        }, 0);
    });
}