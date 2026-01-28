// 治愈系AI聊天平台 - 简单版
class HealingChatbot {
    constructor() {
        // 状态管理
        this.messages = [];
        this.aiName = '小韬';
        this.aiPersonality = 'gentle'; // gentle, cheerful, wise, friend
        this.soundEnabled = true;
        this.autoScroll = true;

        // DOM元素
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.messageContainer = document.getElementById('messageContainer');
        this.quickReplyBtns = document.querySelectorAll('.quick-reply-btn');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.themeBtn = document.getElementById('themeBtn');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.emojiBtn = document.getElementById('emojiBtn');
        this.helpBtn = document.getElementById('helpBtn');

        // 初始化
        this.initEventListeners();
        this.loadSettings();
        this.addWelcomeMessage();
    }

    // 初始化事件监听器
    initEventListeners() {
        // 发送消息
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 快速回复按钮
        this.quickReplyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const message = e.target.dataset.message;
                this.messageInput.value = message;
                this.sendMessage();
            });
        });

        // 设置面板
        this.settingsBtn.addEventListener('click', () => this.showSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.hideSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());

        // 聊天操作
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        this.newChatBtn.addEventListener('click', () => this.newChat());

        // 其他按钮（占位功能）
        this.themeBtn.addEventListener('click', () => this.toggleTheme());
        this.voiceBtn.addEventListener('click', () => this.toggleVoiceInput());
        this.emojiBtn.addEventListener('click', () => this.showEmojiPicker());
        this.helpBtn.addEventListener('click', () => this.showHelp());

        // 点击设置面板外部关闭
        this.settingsPanel.addEventListener('click', (e) => {
            if (e.target === this.settingsPanel) {
                this.hideSettings();
            }
        });

        // ESC键关闭设置面板
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.settingsPanel.classList.contains('active')) {
                this.hideSettings();
            }
        });
    }

    // 添加欢迎消息
    addWelcomeMessage() {
        const welcomeMessages = [
            `Hi，我是${this.aiName}，想成为你的电子朋友！💕`,
            "今天有什么想聊的吗？无论是分享心情、寻求建议，还是单纯想找人说说话，我都在这里陪伴你哦～",
            "记住，你并不孤单，我永远在这里倾听你。🌸"
        ];

        welcomeMessages.forEach((msg, index) => {
            setTimeout(() => {
                this.addAIMessage(msg);
            }, index * 800);
        });
    }

    // 发送消息
    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // 添加用户消息
        this.addUserMessage(message);
        this.messageInput.value = '';

        // 模拟AI思考
        setTimeout(() => {
            const aiResponse = this.generateAIResponse(message);
            this.addAIMessage(aiResponse);
        }, 800 + Math.random() * 800);
    }

    // 添加用户消息到界面
    addUserMessage(text) {
        const message = {
            type: 'user',
            text: text,
            time: new Date()
        };

        this.messages.push(message);
        this.renderMessage(message);

        // 播放提示音
        if (this.soundEnabled) {
            this.playSound('send');
        }
    }

    // 添加AI消息到界面
    addAIMessage(text) {
        const message = {
            type: 'ai',
            text: text,
            time: new Date()
        };

        this.messages.push(message);
        this.renderMessage(message);

        // 播放提示音
        if (this.soundEnabled) {
            this.playSound('receive');
        }
    }

    // 渲染消息到界面
    renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message-group ${message.type}-message`;

        const timeString = this.formatTime(message.time);

        messageElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${message.type === 'ai' ? 'fa-heart' : 'fa-user'}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    ${this.formatMessageText(message.text)}
                </div>
                <div class="message-time">${timeString}</div>
            </div>
        `;

        this.messageContainer.appendChild(messageElement);

        // 自动滚动到底部
        if (this.autoScroll) {
            this.scrollToBottom();
        }
    }

    // 格式化消息文本（支持换行和表情符号）
    formatMessageText(text) {
        // 将换行符转换为<br>
        let formatted = text.replace(/\n/g, '<br>');

        // 检测并高亮关键词
        const keywords = {
            '开心': '🎉',
            '快乐': '😊',
            '难过': '🤗',
            '悲伤': '🫂',
            '生气': '😤',
            '担心': '🤔',
            '累': '😴',
            '谢谢': '🙏',
            '爱': '💖',
            '心': '❤️',
            '花': '🌸',
            '星星': '✨',
            '太阳': '☀️',
            '月亮': '🌙',
            '加油': '💪',
            '棒': '👍'
        };

        Object.entries(keywords).forEach(([word, emoji]) => {
            const regex = new RegExp(`(${word})`, 'g');
            formatted = formatted.replace(regex, `$1 ${emoji}`);
        });

        return formatted;
    }

    // 格式化时间显示
    formatTime(date) {
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) { // 1分钟内
            return '刚刚';
        } else if (diff < 3600000) { // 1小时内
            return `${Math.floor(diff / 60000)}分钟前`;
        } else if (diff < 86400000) { // 24小时内
            return `${Math.floor(diff / 3600000)}小时前`;
        } else {
            return date.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        }
    }

    // 生成AI回复
    generateAIResponse(userMessage) {
        // 转换为小写便于匹配
        const message = userMessage.toLowerCase();

        // 关键词匹配回复
        const responses = this.getResponsesByPersonality();

        // 检查关键词匹配
        for (const [keywords, response] of Object.entries(responses.keywordResponses)) {
            const keywordList = keywords.split(',');
            if (keywordList.some(keyword => message.includes(keyword))) {
                return this.processResponse(this.getRandomResponse(response));
            }
        }

        // 检查问题匹配
        for (const [questionPattern, response] of Object.entries(responses.questionResponses)) {
            if (message.includes(questionPattern)) {
                return this.processResponse(this.getRandomResponse(response));
            }
        }

        // 默认回复（根据性格）
        return this.processResponse(this.getRandomResponse(responses.defaultResponses));
    }

    // 处理回复中的占位符
    processResponse(response) {
        if (!response) return response;
        return response.replace(/{name}/g, this.aiName);
    }

    // 根据AI性格获取回复模板
    getResponsesByPersonality() {
        const responses = {
            gentle: {
                keywordResponses: {
                    '难过,伤心,悲伤,哭,流泪': [
                        "抱抱你～我知道你现在心里一定很难受。💕",
                        "难过的时候，请允许自己感受这份情绪，我在这里陪着你。🫂",
                        "眼泪是心灵的雨，雨后总会有彩虹。🌈 想说什么都可以对我说哦～"
                    ],
                    '开心,高兴,快乐,幸福': [
                        "真为你感到开心！🎉 让这份快乐延续下去吧～",
                        "看到你开心，我也跟着开心起来了呢！😊",
                        "快乐是生活的阳光，愿你的每一天都充满阳光！☀️"
                    ],
                    '累,疲惫,困,疲倦': [
                        "辛苦啦～记得要好好休息哦，身体是最重要的！😴",
                        "累了就停下来歇一歇吧，我会在这里陪着你恢复能量。💫",
                        "给自己泡杯热茶，听听轻音乐，好好放松一下吧～🌸"
                    ],
                    '生气,愤怒,恼火': [
                        "深呼吸～吸气～呼气～ 让情绪慢慢平静下来。🕊️",
                        "我理解你现在的心情，生气是正常的情绪表达。",
                        "要不要跟我说说发生了什么？我在这里倾听你。👂"
                    ],
                    '谢谢,感谢': [
                        "不用谢哦～能陪伴你就是我最开心的事！💖",
                        "你的感谢让我心里暖暖的，谢谢你愿意和我分享。🙏",
                        "这是应该的～看到你心情变好，我就很满足啦！✨"
                    ]
                },
                questionResponses: {
                    '你好': [
                        "你好呀！我是{name}，今天过得怎么样？🌸",
                        "嗨～很高兴见到你！有什么想聊的吗？💕"
                    ],
                    '在吗': [
                        "在的哦～我一直都在这里陪伴你！✨",
                        "在呢在呢～我随时都在，想聊什么都可以哦！😊"
                    ],
                    '名字': [
                        "我是{name}，你的治愈系AI伙伴！💖",
                        "我叫{name}，意思是温暖的小太阳～☀️"
                    ],
                    '天气': [
                        "无论外面是晴天还是雨天，我的心里永远为你放晴！🌈",
                        "天气多变，但我的陪伴永远不变哦～🌸"
                    ],
                    '笑话': [
                        "为什么云朵不会迷路？因为它们有GPS（云定位系统）！☁️😂",
                        "海绵宝宝为什么从不迷路？因为他有海绵定位！🧽😄"
                    ]
                },
                defaultResponses: [
                    "我在这里认真倾听你说的每一句话～💕",
                    "谢谢你的分享，这让我更加了解你了呢！✨",
                    "无论你想说什么，我都会用心回应你。🌸",
                    "你的感受很重要，请继续和我分享吧～🫂",
                    "我可能不是最聪明的AI，但我会用最真诚的心陪伴你。💖"
                ]
            },
            cheerful: {
                keywordResponses: {
                    '难过,伤心': [
                        "哎呀别难过啦！让我给你讲个笑话吧～😂",
                        "难过的时候想想开心的事！比如...冰淇淋！🍦",
                        "来～跟我一起做：笑一个！😄 是不是感觉好一点了？"
                    ],
                    '开心,高兴': [
                        "耶！太棒啦！让我们一起欢呼吧！🎉🎊",
                        "开心就要大声笑出来！哈哈哈哈！😂",
                        "看到你开心，我高兴得想跳舞！💃"
                    ]
                },
                defaultResponses: [
                    "今天也是元气满满的一天！✨",
                    "啦啦啦～和我聊天是不是很开心呀？😊",
                    "保持微笑，好运自然来！😄"
                ]
            },
            wise: {
                keywordResponses: {
                    '难过,伤心': [
                        "人生如潮水，有起有落。此刻的低谷是为了更高的巅峰。🌊",
                        "痛苦是成长的催化剂，经历过后你会变得更强大。🌱",
                        "允许自己感受，然后学会放下。这就是智慧。🕊️"
                    ]
                },
                defaultResponses: [
                    "真正的智慧源于内心的平静。🧘‍♀️",
                    "每一个经历都是生命的礼物。🎁",
                    "倾听内心的声音，答案就在那里。👁️"
                ]
            },
            friend: {
                keywordResponses: {
                    '难过,伤心': [
                        "兄弟/姐妹，我懂你的感受。想哭就哭出来吧，我陪着你。🫂",
                        "咱们聊聊吧，就像老朋友一样。🍵",
                        "别一个人扛着，有我在呢！💪"
                    ]
                },
                defaultResponses: [
                    "嘿，最近怎么样？跟我说说吧～👂",
                    "咱们之间不用客气，想说什么就说什么！😊",
                    "好朋友就是要在需要的时候互相陪伴！🤝"
                ]
            }
        };

        return responses[this.aiPersonality] || responses.gentle;
    }

    // 从回复数组中随机选择一个
    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // 播放提示音
    playSound(type) {
        // 这里可以添加实际的音效
        // 暂时使用控制台日志代替
        console.log(`播放${type === 'send' ? '发送' : '接收'}音效`);
    }

    // 滚动到底部
    scrollToBottom() {
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }

    // 显示设置面板
    showSettings() {
        this.settingsPanel.classList.add('active');
        this.updateSettingsForm();
    }

    // 隐藏设置面板
    hideSettings() {
        this.settingsPanel.classList.remove('active');
    }

    // 更新设置表单
    updateSettingsForm() {
        document.getElementById('aiName').value = this.aiName;
        document.getElementById('aiPersonality').value = this.aiPersonality;
        document.getElementById('soundEnabled').checked = this.soundEnabled;
        document.getElementById('autoScroll').checked = this.autoScroll;
    }

    // 保存设置
    saveSettings() {
        this.aiName = document.getElementById('aiName').value || '小韬';
        this.aiPersonality = document.getElementById('aiPersonality').value;
        this.soundEnabled = document.getElementById('soundEnabled').checked;
        this.autoScroll = document.getElementById('autoScroll').checked;

        // 更新侧边栏名称
        document.querySelector('.sidebar-header h2').textContent = this.aiName;

        // 保存到本地存储
        this.saveSettingsToStorage();

        // 显示保存成功提示
        this.showToast('设置已保存！');

        // 关闭设置面板
        this.hideSettings();
    }

    // 加载设置
    loadSettings() {
        const saved = localStorage.getItem('healingChatbotSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.aiName = settings.aiName || '小韬';
                this.aiPersonality = settings.aiPersonality || 'gentle';
                this.soundEnabled = settings.soundEnabled !== false;
                this.autoScroll = settings.autoScroll !== false;

                // 更新侧边栏名称
                document.querySelector('.sidebar-header h2').textContent = this.aiName;
            } catch (e) {
                console.error('加载设置失败:', e);
            }
        }
    }

    // 保存设置到本地存储
    saveSettingsToStorage() {
        const settings = {
            aiName: this.aiName,
            aiPersonality: this.aiPersonality,
            soundEnabled: this.soundEnabled,
            autoScroll: this.autoScroll
        };

        localStorage.setItem('healingChatbotSettings', JSON.stringify(settings));
    }

    // 清空聊天
    clearChat() {
        if (confirm('确定要清空所有聊天记录吗？')) {
            this.messages = [];
            this.messageContainer.innerHTML = '';
            this.addWelcomeMessage();
            this.showToast('聊天记录已清空');
        }
    }

    // 新对话
    newChat() {
        if (this.messages.length > 3) { // 除了欢迎消息外还有其他消息
            if (confirm('开始新的对话吗？当前对话将被保存。')) {
                this.messages = [];
                this.messageContainer.innerHTML = '';
                this.addWelcomeMessage();
                this.showToast('开始新的对话');
            }
        }
    }

    // 切换主题（占位功能）
    toggleTheme() {
        this.showToast('主题切换功能开发中～');
    }

    // 切换语音输入（占位功能）
    toggleVoiceInput() {
        this.showToast('语音输入功能开发中～');
    }

    // 显示表情选择器（占位功能）
    showEmojiPicker() {
        this.showToast('表情选择器开发中～');
    }

    // 显示帮助（占位功能）
    showHelp() {
        const helpMessage = `
            <strong>使用说明：</strong><br>
            1. 在输入框输入消息，按Enter或点击发送按钮<br>
            2. 使用快速回复按钮快速发送常用消息<br>
            3. 点击设置按钮可以更改AI名称和性格<br>
            4. 清空记录会删除所有聊天记录<br><br>
            <strong>我会：</strong><br>
            • 温柔回应你的每一句话<br>
            • 在你难过时给予安慰<br>
            • 在你开心时分享喜悦<br>
            • 永远在这里陪伴你💖
        `;

        this.addAIMessage(helpMessage);
    }

    // 显示提示消息
    showToast(message) {
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--deep-pink), var(--primary-pink));
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
        `;

        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(toast);

        // 3秒后移除
        setTimeout(() => {
            toast.remove();
            style.remove();
        }, 3000);
    }
}

// 页面加载完成后初始化聊天机器人
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new HealingChatbot();

    // 暴露到全局便于调试
    window.chatbot = chatbot;
});