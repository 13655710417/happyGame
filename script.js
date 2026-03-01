// tao出个游戏 - 交互功能脚本

document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    initTheme();
    initScrollEffects();
    initFeedbackForm();
    initAnimations();
    initGameCards();
    initCircleProgress();
    initDateTimeClock();
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
                'draw': 'var(--anime-blue)',
                'ai': 'var(--anime-yellow)',
                'puzzle': 'var(--anime-green)'
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
        element.textContent = target === 8 ? '8+' : Math.round(current) + (target === 100 ? '%' : '');
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

// 日期时间时钟功能
function initDateTimeClock() {
    console.log('🔔 日期时间时钟功能初始化中...');

    const dateElement = document.getElementById('currentDate');
    const timeElement = document.getElementById('currentTime');

    if (!dateElement || !timeElement) return;

    // 更新日期时间
    function updateDateTime() {
        console.log('⏰ 更新时间被调用');
        const now = new Date();

        // 格式化日期：2026年2月13日 星期五
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const weekday = weekdays[now.getDay()];

        dateElement.textContent = `${year}年${month}月${day}日 ${weekday}`;

        // 格式化时间：15:30:25
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');

        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
        console.log(`📅 日期更新: ${year}年${month}月${day}日 ${weekday}`);
        console.log(`⏰ 时间更新: ${hours}:${minutes}:${seconds}`);
    }

    // 立即更新一次
    updateDateTime();

    // 每秒更新一次时间（实时更新）
    setInterval(updateDateTime, 1000);
    console.log('✅ 日期时间时钟启动，每秒更新');
}

// 收藏功能
function initFavorites() {
    console.log('❤️ 收藏功能初始化中...');
    console.log('📋 当前页面URL:', window.location.href);
    console.log('📋 当前时间:', new Date().toISOString());

    const favoritesBtn = document.getElementById('favoritesBtn');
    const favoritesModal = document.getElementById('favoritesModal');
    const closeFavoritesModalBtn = document.getElementById('closeFavoritesModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    console.log('🔍 收藏功能元素检查:');
    console.log('  - favoritesBtn:', favoritesBtn ? '✅ 找到' : '❌ 未找到');
    console.log('  - favoritesModal:', favoritesModal ? '✅ 找到' : '❌ 未找到');
    console.log('  - closeFavoritesModalBtn:', closeFavoritesModalBtn ? '✅ 找到' : '❌ 未找到');
    console.log('  - closeModalBtn:', closeModalBtn ? '✅ 找到' : '❌ 未找到');

    if (!favoritesBtn || !favoritesModal) {
        console.error('❌ 收藏功能元素未找到，功能禁用');
        console.error('  可能原因: 1. HTML未加载 2. 元素ID错误 3. 脚本执行过早');
        return;
    }

    console.log('✅ 所有必需元素已找到，继续初始化...');

    // 存储所有游戏数据
    let allGames = [];
    let favorites = JSON.parse(localStorage.getItem('gameFavorites') || '[]');

    // 收集所有游戏数据
    function collectGameData() {
        console.log('🕹️ 开始收集游戏数据...');
        const gameCards = document.querySelectorAll('.game-card');
        console.log(`  找到 ${gameCards.length} 个游戏卡片元素`);

        if (gameCards.length === 0) {
            console.error('❌ 页面中没有找到任何.game-card元素！');
            console.error('  可能原因: 1. 页面加载不完全 2. CSS类名不匹配 3. DOM结构已改变');
            // 尝试其他可能的选择器
            const alternativeCards = document.querySelectorAll('[data-game]');
            console.log(`  备选方案: 找到 ${alternativeCards.length} 个带data-game属性的元素`);
        }

        allGames = [];

        gameCards.forEach((card, index) => {
            const gameId = card.getAttribute('data-game');
            const gameName = card.querySelector('h3')?.textContent || '未知游戏';
            const gamePath = card.querySelector('.play-btn')?.getAttribute('href') || '#';
            const gameIcon = card.querySelector('.game-icon i')?.className || 'fas fa-gamepad';
            const gameTag = card.querySelector('.game-tag')?.textContent || '休闲';

            console.log(`  游戏${index+1}: ${gameName} (ID: ${gameId}, 路径: ${gamePath}, 标签: ${gameTag})`);

            allGames.push({
                id: gameId,
                name: gameName,
                path: gamePath,
                icon: gameIcon,
                tag: gameTag
            });
        });

        console.log(`✅ 成功收集到 ${allGames.length} 个游戏数据`);
        if (allGames.length === 0) {
            console.error('❌ 未收集到任何游戏数据！可能.game-card选择器不匹配');
            console.log('🛠️ 添加测试游戏数据用于调试');

            // 添加测试游戏数据，确保弹窗有内容显示
            allGames = [
                {
                    id: 'test1',
                    name: '测试游戏1',
                    path: '#',
                    icon: 'fas fa-gamepad',
                    tag: '测试'
                },
                {
                    id: 'test2',
                    name: '测试游戏2',
                    path: '#',
                    icon: 'fas fa-dice',
                    tag: '测试'
                },
                {
                    id: 'test3',
                    name: '测试游戏3',
                    path: '#',
                    icon: 'fas fa-puzzle-piece',
                    tag: '测试'
                }
            ];
            console.log('🛠️ 已添加3个测试游戏数据');
        }

        // 调试：输出收集到的游戏数据
        console.log('📊 收集到的游戏数据:', JSON.stringify(allGames, null, 2));
    }

    // 切换收藏状态
    function toggleFavorite(gameId) {
        const index = favorites.indexOf(gameId);

        if (index === -1) {
            // 添加收藏
            favorites.push(gameId);
            console.log(`❤️ 收藏游戏: ${gameId}`);
        } else {
            // 移除收藏
            favorites.splice(index, 1);
            console.log(`💔 取消收藏: ${gameId}`);
        }

        // 保存到本地存储
        localStorage.setItem('gameFavorites', JSON.stringify(favorites));

        // 重新渲染弹窗
        renderFavoritesModal();
    }

    // 渲染收藏弹窗
    function renderFavoritesModal() {
        console.log('🎨 开始渲染收藏弹窗内容...');
        const favoritesList = document.getElementById('favoritesList');
        const allGamesContainer = document.getElementById('allGamesContainer');

        console.log(`  收藏列表元素: ${favoritesList ? '找到' : '未找到'}`);
        console.log(`  所有游戏容器: ${allGamesContainer ? '找到' : '未找到'}`);

        if (!favoritesList || !allGamesContainer) {
            console.error('❌ 无法渲染弹窗：必要的容器元素未找到');
            return;
        }

        console.log(`  当前收藏数量: ${favorites.length} 个`);
        console.log(`  所有游戏数量: ${allGames.length} 个`);

        // 清空容器
        favoritesList.innerHTML = '';
        allGamesContainer.innerHTML = '';
        console.log('  容器已清空');

        // 渲染收藏列表
        if (favorites.length === 0) {
            favoritesList.innerHTML = `
                <div class="empty-favorites">
                    <i class="far fa-heart"></i>
                    <p>暂无收藏的游戏</p>
                    <p class="hint">在下方游戏列表中添加收藏</p>
                </div>
            `;
        } else {
            favorites.forEach(gameId => {
                const game = allGames.find(g => g.id === gameId);
                if (!game) return;

                const favoriteItem = document.createElement('div');
                favoriteItem.className = 'favorite-game-item';
                favoriteItem.innerHTML = `
                    <div class="game-item-info">
                        <div class="game-item-icon">
                            <i class="${game.icon}"></i>
                        </div>
                        <div>
                            <div class="game-item-name">${game.name}</div>
                            <span class="game-item-tag">${game.tag}</span>
                        </div>
                    </div>
                    <div class="favorite-actions">
                        <button class="favorite-btn remove-favorite-btn" data-game="${game.id}" title="取消收藏"
                                style="border: 2px solid #00ff00 !important; box-shadow: 0 0 5px rgba(0,255,0,0.5) !important;">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                `;
                favoritesList.appendChild(favoriteItem);
            });
        }

        // 渲染所有游戏列表
        if (allGames.length === 0) {
            console.log('⚠️ 游戏数据为空，显示空状态提示');
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-favorites';
            emptyMessage.innerHTML = `
                <i class="fas fa-gamepad"></i>
                <p>暂无游戏数据</p>
                <p class="hint">无法加载游戏列表，请刷新页面</p>
            `;
            allGamesContainer.appendChild(emptyMessage);
        } else {
            console.log(`🎮 开始渲染 ${allGames.length} 个游戏到列表`);
            allGames.forEach((game, index) => {
                const isFavorite = favorites.includes(game.id);
                const gameItem = document.createElement('div');
                gameItem.className = 'favorite-game-item';
                gameItem.innerHTML = `
                    <div class="game-item-info">
                        <div class="game-item-icon">
                            <i class="${game.icon}"></i>
                        </div>
                        <div>
                            <div class="game-item-name">${game.name}</div>
                            <span class="game-item-tag">${game.tag}</span>
                        </div>
                    </div>
                    <div class="favorite-actions">
                        <button class="favorite-btn ${isFavorite ? 'remove-favorite-btn' : 'add-favorite-btn'}"
                                data-game="${game.id}"
                                title="${isFavorite ? '取消收藏' : '添加收藏'}"
                                style="border: 2px solid #ff0000 !important; box-shadow: 0 0 5px rgba(255,0,0,0.5) !important;">
                            <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                `;
                allGamesContainer.appendChild(gameItem);
                if (index < 2) {
                    console.log(`  已渲染游戏: ${game.name} (${game.id})`);
                }
            });
        }

        // 绑定收藏按钮事件
        const favoriteBtns = document.querySelectorAll('.favorite-btn');
        console.log(`  找到 ${favoriteBtns.length} 个收藏按钮需要绑定事件`);
        favoriteBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const gameId = this.getAttribute('data-game');
                console.log(`❤️ 收藏按钮被点击，游戏ID: ${gameId}`);
                toggleFavorite(gameId);
            });
        });

        console.log('✅ 弹窗内容渲染完成');
        console.log(`  收藏列表项目: ${favoritesList.children.length} 个`);
        console.log(`  所有游戏项目: ${allGamesContainer.children.length} 个`);
    }

    // 打开收藏弹窗
    function openFavoritesModal() {
        console.log('📂 开始打开收藏弹窗...');
        try {
            console.log('  步骤1: 收集游戏数据');
            collectGameData();
            console.log('  步骤2: 渲染弹窗内容');
            renderFavoritesModal();
            console.log('  步骤3: 显示弹窗');
            favoritesModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            console.log('📂 收藏弹窗已打开');
            console.log('  弹窗显示状态:', favoritesModal.classList.contains('show') ? '显示中' : '隐藏');
        } catch (error) {
            console.error('❌ 打开收藏弹窗时发生错误:', error);
            alert('打开收藏弹窗时出错: ' + error.message);
        }
    }

    // 关闭收藏弹窗
    function closeFavoritesModal() {
        favoritesModal.classList.remove('show');
        document.body.style.overflow = '';
        console.log('📂 关闭收藏弹窗');
    }

    // 事件绑定
    console.log('🔗 开始绑定事件监听器...');

    // 绑定收藏按钮点击事件 - 简单直接的方式
    if (favoritesBtn) {
        console.log('🔗 绑定favoritesBtn点击事件...');

        // 移除所有现有的事件监听器（通过克隆和替换）
        const originalBtn = favoritesBtn;
        const newBtn = originalBtn.cloneNode(true);
        originalBtn.parentNode.replaceChild(newBtn, originalBtn);

        // 使用事件委托的简化版本
        newBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 favoritesBtn被点击了！');
            console.log('  事件类型:', e.type);
            console.log('  触发时间:', new Date().toLocaleTimeString());
            openFavoritesModal();
        };

        console.log('✅ favoritesBtn事件绑定完成');
    } else {
        console.error('❌ 无法绑定favoritesBtn事件：按钮元素不存在');
    }

    // 绑定关闭按钮事件
    if (closeFavoritesModalBtn) {
        closeFavoritesModalBtn.addEventListener('click', closeFavoritesModal);
        console.log('✅ closeFavoritesModalBtn事件绑定完成');
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeFavoritesModal);
        console.log('✅ closeModalBtn事件绑定完成');
    }

    console.log('🔗 所有事件绑定完成');

    // 点击弹窗背景关闭
    favoritesModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeFavoritesModal();
        }
    });

    // ESC键关闭弹窗
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && favoritesModal.classList.contains('show')) {
            closeFavoritesModal();
        }
    });

    console.log('✅ 收藏功能初始化完成');
    console.log(`  事件绑定: favoritesBtn点击事件已绑定`);
    console.log(`  游戏数据: 等待按钮点击时收集`);
    console.log(`  本地收藏: ${favorites.length} 个已收藏游戏`);

    // 调试：检查游戏卡片数量
    setTimeout(() => {
        const gameCards = document.querySelectorAll('.game-card');
        console.log(`🎮 页面游戏卡片数量: ${gameCards.length}`);

        if (gameCards.length === 0) {
            console.error('❌ 未找到任何游戏卡片！可能选择器错误或DOM未完全加载');
        } else {
            console.log('🎮 前3个游戏卡片:', Array.from(gameCards).slice(0, 3).map(card => ({
                id: card.getAttribute('data-game'),
                name: card.querySelector('h3')?.textContent || '未知'
            })));
        }
    }, 100);
}

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