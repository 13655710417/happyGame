// 最终增强版智能聊天机器人 - 整合所有功能
class UltimateSmartChatbot {
    constructor() {
        // 基础配置
        this.config = {
            aiName: '小韬',
            personality: 'gentle',
            soundEnabled: true,
            autoScroll: true,
            useVoiceInput: false,
            useVoiceOutput: false,
            useMLGeneration: true,
            theme: 'light'
        };

        // 智能模块
        this.nlp = new SmartNLPModule();
        this.ml = new MLDialogueGenerator();
        this.knowledge = new KnowledgeManager();
        this.multimodal = new MultimodalModule();
        this.celebrityKnowledge = new CelebrityKnowledge();

        // 对话状态
        this.state = {
            messages: [],
            conversationContext: {
                currentTopic: null,
                userMood: 'neutral',
                lastTopics: [],
                userInterests: new Set(),
                conversationDepth: 0,
                needsFollowUp: false,
                followUpQuestion: null
            },
            userProfile: {
                name: null,
                age: null,
                location: null,
                hobbies: [],
                emotionalHistory: [],
                conversationHistory: []
            },
            shortTermMemory: [],
            memoryLimit: 20
        };

        // 性能优化
        this.cache = new Map();
        this.debounceTimers = new Map();
        this.lastInteractionTime = Date.now();

        // 初始化
        this.initDOM();
        this.initEventListeners();
        this.loadAllData();
        this.setupMultimodalCallbacks();
        this.addWelcomeMessage();
        this.startPerformanceMonitor();
    }

    // 初始化DOM元素
    initDOM() {
        this.elements = {
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn'),
            messageContainer: document.getElementById('messageContainer'),
            quickReplyBtns: document.querySelectorAll('.quick-reply-btn'),
            settingsPanel: document.getElementById('settingsPanel'),
            voiceBtn: document.getElementById('voiceBtn'),
            emojiBtn: document.getElementById('emojiBtn'),
            themeBtn: document.getElementById('themeBtn')
        };

        // 更新按钮状态
        this.updateVoiceButton();
    }

    // 初始化事件监听器
    initEventListeners() {
        // 发送消息
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 快速回复
        this.elements.quickReplyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const message = e.target.dataset.message;
                this.elements.messageInput.value = message;
                this.sendMessage();
            });
        });

        // 语音按钮
        this.elements.voiceBtn.addEventListener('click', () => this.toggleVoiceInput());

        // 表情按钮
        this.elements.emojiBtn.addEventListener('click', () => this.showEmojiPicker());

        // 主题按钮
        this.elements.themeBtn.addEventListener('click', () => this.toggleTheme());

        // 输入框实时分析
        this.elements.messageInput.addEventListener('input', (e) => {
            this.debounce('inputAnalysis', () => {
                this.analyzeInputInRealTime(e.target.value);
            }, 500);
        });

        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onPageHidden();
            } else {
                this.onPageVisible();
            }
        });

        // 窗口大小变化
        window.addEventListener('resize', () => {
            this.debounce('resize', () => {
                this.adjustLayout();
            }, 250);
        });
    }

    // 设置多模态回调
    setupMultimodalCallbacks() {
        this.multimodal.setCallbacks({
            onListeningStart: () => {
                this.showToast('正在聆听...', 'info');
                this.elements.voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
                this.elements.voiceBtn.style.background = 'var(--deep-pink)';
            },

            onListeningEnd: () => {
                this.elements.voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                this.elements.voiceBtn.style.background = '';
            },

            onSpeechRecognized: (text) => {
                this.elements.messageInput.value = text;
                this.sendMessage();
                this.showToast('识别完成', 'success');
            },

            onInterimResult: (text) => {
                // 可以显示临时识别结果
                console.log('临时识别:', text);
            },

            onSpeakingStart: (text) => {
                this.showToast('正在说话...', 'info');
            },

            onSpeakingEnd: (text) => {
                this.showToast('语音播放完成', 'success');
            },

            onError: (error) => {
                this.showToast(`错误: ${error}`, 'error');
            }
        });
    }

    // 加载所有数据
    loadAllData() {
        this.loadConfig();
        this.loadUserProfile();
        this.loadConversationHistory();
        this.setupMLTraining();
    }

    // 加载配置
    loadConfig() {
        try {
            const saved = localStorage.getItem('ultimateChatbotConfig');
            if (saved) {
                const config = JSON.parse(saved);
                Object.assign(this.config, config);
                this.applyConfig();
            }
        } catch (error) {
            console.error('加载配置失败:', error);
        }
    }

    // 加载用户档案
    loadUserProfile() {
        try {
            const saved = localStorage.getItem('ultimateUserProfile');
            if (saved) {
                const profile = JSON.parse(saved);
                Object.assign(this.state.userProfile, profile);

                // 恢复Set类型
                if (profile.interests) {
                    this.state.conversationContext.userInterests = new Set(profile.interests);
                }
            }
        } catch (error) {
            console.error('加载用户档案失败:', error);
        }
    }

    // 加载对话历史
    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('ultimateConversationHistory');
            if (saved) {
                const history = JSON.parse(saved);
                this.state.userProfile.conversationHistory = history.slice(-50); // 只保留最近50条
            }
        } catch (error) {
            console.error('加载对话历史失败:', error);
        }
    }

    // 应用配置
    applyConfig() {
        // 更新AI名称
        document.querySelector('.sidebar-header h2').textContent = this.config.aiName;

        // 更新语音按钮
        this.updateVoiceButton();

        // 应用主题
        this.applyTheme();
    }

    // 更新语音按钮
    updateVoiceButton() {
        const voiceStatus = this.multimodal.getVoiceInputStatus();
        if (!voiceStatus.isSupported) {
            this.elements.voiceBtn.disabled = true;
            this.elements.voiceBtn.title = '浏览器不支持语音输入';
        }
    }

    // 应用主题
    applyTheme() {
        document.body.setAttribute('data-theme', this.config.theme);
    }

    // 切换主题
    toggleTheme() {
        this.config.theme = this.config.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveConfig();
        this.showToast(`切换到${this.config.theme === 'light' ? '浅色' : '深色'}主题`, 'success');
    }

    // 设置ML训练
    async setupMLTraining() {
        if (this.state.userProfile.conversationHistory.length > 10) {
            await this.ml.trainOnHistory(this.state.userProfile.conversationHistory);
        }

        // 定期训练
        setInterval(() => {
            this.autoTrainML();
        }, 300000); // 每5分钟
    }

    // 自动训练ML
    async autoTrainML() {
        if (this.state.userProfile.conversationHistory.length > 5) {
            await this.ml.trainOnHistory(this.state.userProfile.conversationHistory.slice(-10));
        }
    }

    // 添加欢迎消息
    addWelcomeMessage() {
        const welcomeMessages = [
            `你好！我是${this.config.aiName}，你的终极智能聊天伙伴！🚀`,
            "我整合了NLP分析、机器学习、知识库和多模态交互技术。💡",
            "我能理解你的情绪、记住对话、学习你的偏好，并提供智能回应。✨",
            "试试语音输入、表情选择，或者直接和我聊天吧！🌸"
        ];

        welcomeMessages.forEach((msg, index) => {
            setTimeout(() => {
                this.addMessage('ai', msg);
            }, index * 800);
        });
    }

    // 发送消息
    async sendMessage() {
        const text = this.elements.messageInput.value.trim();
        if (!text) return;

        // 添加用户消息
        this.addMessage('user', text);
        this.elements.messageInput.value = '';

        // 分析消息
        const analysis = await this.analyzeMessage(text);

        // 生成回复
        setTimeout(async () => {
            const response = await this.generateResponse(text, analysis);
            this.addMessage('ai', response);

            // 更新状态
            this.updateState(text, response, analysis);

            // 语音输出
            if (this.config.useVoiceOutput) {
                this.multimodal.speakWithEmotion(response, analysis.emotion.primary);
            }
        }, 600 + Math.random() * 600);
    }

    // 分析消息
    async analyzeMessage(text) {
        // 检查缓存
        const cacheKey = `analysis_${text}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // NLP分析
        const nlpAnalysis = await this.nlp.analyzeMessage(text);

        // 情感分析
        const emotion = nlpAnalysis.emotion;

        // 实体提取
        const entities = nlpAnalysis.entities;

        // 意图识别
        const intent = nlpAnalysis.intent;

        // 构建完整分析
        const analysis = {
            text: text,
            nlp: nlpAnalysis,
            emotion: emotion,
            entities: entities,
            intent: intent,
            timestamp: new Date()
        };

        // 缓存结果（5分钟）
        this.cache.set(cacheKey, analysis);
        setTimeout(() => this.cache.delete(cacheKey), 300000);

        return analysis;
    }

    // 生成回复
    async generateResponse(userMessage, analysis) {
        // 检测是否提到明星
        const mentionedCelebrities = this.celebrityKnowledge.detectCelebrityMention(userMessage);

        if (mentionedCelebrities.length > 0) {
            // 优先回复第一个提到的明星
            const celebrityResponse = this.celebrityKnowledge.generateCelebrityResponse(
                mentionedCelebrities[0].id
            );
            if (celebrityResponse) {
                return celebrityResponse;
            }
        }

        // 决定生成策略
        const useML = this.config.useMLGeneration &&
                     this.ml.getModelStatus().isModelTrained &&
                     analysis.emotion.confidence > 0.5;

        let response = '';

        if (useML) {
            // 机器学习生成
            const mlContext = {
                userName: this.state.userProfile.name,
                emotion: analysis.emotion.primary,
                topic: this.state.conversationContext.currentTopic
            };

            response = await this.ml.generateResponse(userMessage, mlContext);

            // 评估质量
            const quality = this.evaluateResponse(response, analysis);
            if (quality < 0.4) {
                // 质量不佳，回退到规则生成
                response = this.generateRuleBasedResponse(analysis);
            }
        } else {
            // 规则生成
            response = this.generateRuleBasedResponse(analysis);
        }

        // 知识库增强
        response = this.enhanceWithKnowledge(response, analysis);

        // 情感适配
        response = this.adaptToEmotion(response, analysis.emotion);

        // 个性化
        response = this.personalizeResponse(response);

        return response;
    }

    // 生成规则基础回复
    generateRuleBasedResponse(analysis) {
        const { intent, emotion } = analysis;

        // 获取主要意图
        const mainIntent = Object.keys(intent).reduce((a, b) => intent[a] > intent[b] ? a : b);

        // 根据意图选择回复模板
        const templates = this.getResponseTemplates(mainIntent, emotion.primary);
        const template = templates[Math.floor(Math.random() * templates.length)];

        return template;
    }

    // 获取回复模板
    getResponseTemplates(intent, emotion) {
        const templates = {
            greeting: [
                `你好呀！${this.state.userProfile.name ? this.state.userProfile.name + '，' : ''}很高兴见到你！😊`,
                "嗨～今天过得怎么样？🌸",
                "你好！我是你的AI伙伴，随时为你服务！✨"
            ],
            farewell: [
                "再见啦～期待下次聊天！💕",
                "拜拜！记得照顾好自己哦～🌸",
                "晚安，愿你有个好梦！🌙"
            ],
            question: [
                "这个问题很有趣呢！让我想想...🤔",
                "我来帮你解答这个问题！💡",
                "这是个好问题，让我思考一下。💭"
            ],
            emotion: {
                happy: [
                    "看到你开心，我也感到快乐！😊",
                    "真为你感到高兴！愿这份快乐一直陪伴你。✨",
                    "快乐是会传染的，谢谢你分享这份喜悦！💖"
                ],
                sad: [
                    "抱抱你～我在这里陪着你。🫂",
                    "难过的时候，有人倾诉会好一些。💕",
                    "我理解你的感受，想说什么都可以。🌸"
                ]
            },
            request: [
                "好的，我会尽力帮助你！💪",
                "没问题，我来帮你！✨",
                "我很乐意为你提供帮助！🌸"
            ],
            joke: [
                "为什么数学书总是很悲伤？因为它有太多问题！😂",
                "什么动物最容易摔跤？狐狸，因为狐狸狡猾（脚滑）！🦊",
                "为什么电脑永远不会感冒？因为它有Windows（窗户）！💻",
                "什么鱼最聪明？金鱼，因为它的记忆只有7秒，所以总是活在当下！🐠",
                "为什么香蕉不会打电话？因为它没有信号！📞🍌"
            ],
            encouragement: [
                "相信自己，你是最棒的！💪",
                "无论遇到什么困难，都要坚持下去，你一定可以！✨",
                "每天进步一点点，未来会有大不同！🌟",
                "你已经做得很好了，继续加油！💖",
                "不要害怕失败，每一次尝试都是成长的机会！🌸"
            ],
            default: [
                "我在这里认真倾听你呢。💕",
                "谢谢你的分享！✨",
                "无论你想说什么，我都会用心回应。🌸"
            ]
        };

        if (intent === 'emotion' && templates.emotion[emotion]) {
            return templates.emotion[emotion];
        }

        return templates[intent] || templates.default;
    }

    // 评估回复质量
    evaluateResponse(response, analysis) {
        if (!response || response.length < 2) return 0;

        let quality = 0.5;

        // 长度合适
        if (response.length >= 5 && response.length <= 100) {
            quality += 0.2;
        }

        // 包含结束标点
        if (/[。！？]$/.test(response)) {
            quality += 0.1;
        }

        // 与情绪相关
        if (this.isEmotionallyRelevant(response, analysis.emotion.primary)) {
            quality += 0.2;
        }

        // 与话题相关
        if (this.isTopicallyRelevant(response, analysis)) {
            quality += 0.1;
        }

        return Math.min(1, quality);
    }

    // 检查情绪相关性
    isEmotionallyRelevant(response, emotion) {
        const emotionWords = {
            happy: ['开心', '高兴', '快乐', '喜悦', '幸福'],
            sad: ['难过', '伤心', '悲伤', '安慰', '陪伴'],
            angry: ['生气', '愤怒', '平静', '理解', '倾听'],
            tired: ['累', '休息', '放松', '照顾', '能量']
        };

        const words = emotionWords[emotion];
        if (!words) return false;

        return words.some(word => response.includes(word));
    }

    // 检查话题相关性
    isTopicallyRelevant(response, analysis) {
        if (!analysis.entities.topics || analysis.entities.topics.length === 0) {
            return false;
        }

        const topicKeywords = {
            work: ['工作', '职业', '职场', '项目'],
            study: ['学习', '考试', '作业', '学校'],
            family: ['家人', '父母', '家庭', '亲戚'],
            hobby: ['爱好', '兴趣', '娱乐', '活动']
        };

        const topic = analysis.entities.topics[0];
        const keywords = topicKeywords[topic];
        if (!keywords) return false;

        return keywords.some(keyword => response.includes(keyword));
    }

    // 知识库增强
    enhanceWithKnowledge(response, analysis) {
        // 如果是知识性问题，添加相关知识
        if (analysis.intent.question > 0.7 || analysis.intent.knowledge > 0.7) {
            const knowledge = this.knowledge.getRandomKnowledge({
                category: this.state.conversationContext.currentTopic || null,
                preference: 'balanced'
            });

            if (knowledge && Math.random() > 0.5) {
                response += ' ' + knowledge.content;
                this.knowledge.recordUsage(knowledge.id, {
                    context: analysis,
                    usedIn: 'response'
                });
            }
        }

        // 如果对话中提到明星，可以添加更多相关知识
        const mentionedCelebrities = this.celebrityKnowledge.detectCelebrityMention(
            this.state.conversationContext.currentTopic || ''
        );

        if (mentionedCelebrities.length > 0 && Math.random() > 0.7) {
            const extraInfo = this.celebrityKnowledge.getAdditionalInfo(
                mentionedCelebrities[0].id
            );
            if (extraInfo) {
                response += '\n\n' + extraInfo;
            }
        }

        return response;
    }

    // 情感适配
    adaptToEmotion(response, emotion) {
        const { primary, confidence } = emotion;

        if (confidence > 0.7) {
            // 添加情感相关的表情符号
            const emotionEmojis = {
                happy: '😊',
                sad: '🤗',
                angry: '😤',
                tired: '😴',
                anxious: '🤔'
            };

            const emoji = emotionEmojis[primary];
            if (emoji && !response.includes(emoji)) {
                response += ' ' + emoji;
            }
        }

        return response;
    }

    // 个性化回复
    personalizeResponse(response) {
        // 使用用户姓名
        if (this.state.userProfile.name && Math.random() > 0.7) {
            response = response.replace(/你/g, this.state.userProfile.name);
        }

        // 提及用户兴趣
        if (this.state.conversationContext.userInterests.size > 0 && Math.random() > 0.8) {
            const interests = Array.from(this.state.conversationContext.userInterests);
            const interest = interests[Math.floor(Math.random() * interests.length)];
            response = `记得你喜欢${interest}，` + response;
        }

        return response;
    }

    // 更新状态
    updateState(userMessage, aiResponse, analysis) {
        // 更新对话上下文
        this.state.conversationContext.conversationDepth++;

        // 更新情绪
        if (analysis.emotion.primary !== 'neutral') {
            this.state.conversationContext.userMood = analysis.emotion.primary;
            this.state.userProfile.emotionalHistory.push({
                emotion: analysis.emotion.primary,
                confidence: analysis.emotion.confidence,
                timestamp: new Date()
            });
        }

        // 更新话题
        if (analysis.entities.topics && analysis.entities.topics.length > 0) {
            this.state.conversationContext.currentTopic = analysis.entities.topics[0];
            if (!this.state.conversationContext.lastTopics.includes(analysis.entities.topics[0])) {
                this.state.conversationContext.lastTopics.unshift(analysis.entities.topics[0]);
                if (this.state.conversationContext.lastTopics.length > 5) {
                    this.state.conversationContext.lastTopics.pop();
                }
            }
        }

        // 更新兴趣
        if (analysis.nlp.keywords) {
            analysis.nlp.keywords.forEach(keyword => {
                if (keyword.length > 1) {
                    this.state.conversationContext.userInterests.add(keyword);
                    if (!this.state.userProfile.hobbies.includes(keyword)) {
                        this.state.userProfile.hobbies.push(keyword);
                    }
                }
            });
        }

        // 更新短期记忆
        this.state.shortTermMemory.push({
            user: userMessage,
            ai: aiResponse,
            analysis: analysis,
            timestamp: new Date()
        });

        if (this.state.shortTermMemory.length > this.state.memoryLimit) {
            this.state.shortTermMemory.shift();
        }

        // 更新对话历史
        this.state.userProfile.conversationHistory.push({
            user: userMessage,
            ai: aiResponse,
            analysis: analysis,
            timestamp: new Date()
        });

        // 限制历史长度
        if (this.state.userProfile.conversationHistory.length > 100) {
            this.state.userProfile.conversationHistory = this.state.userProfile.conversationHistory.slice(-100);
        }

        // 保存数据
        this.saveAllData();
    }

    // 添加消息到界面
    addMessage(type, text) {
        const message = {
            type: type,
            text: text,
            time: new Date()
        };

        this.state.messages.push(message);
        this.renderMessage(message);

        if (this.config.soundEnabled) {
            this.playSound(type === 'user' ? 'send' : 'receive');
        }

        if (this.config.autoScroll) {
            this.scrollToBottom();
        }
    }

    // 渲染消息
    renderMessage(message) {
        const element = document.createElement('div');
        element.className = `message-group ${message.type}-message`;

        const timeString = this.formatTime(message.time);
        const formattedText = this.formatMessageText(message.text);

        // 检查是否是明星相关的回复
        const isStarRelated = message.type === 'ai' &&
            this.celebrityKnowledge.detectCelebrityMention(message.text).length > 0;
        const bubbleClass = isStarRelated ? 'message-bubble star-related' : 'message-bubble';

        element.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${message.type === 'ai' ? 'fa-heart' : 'fa-user'}"></i>
            </div>
            <div class="message-content">
                <div class="${bubbleClass}">
                    ${formattedText}
                </div>
                <div class="message-time">${timeString}</div>
            </div>
        `;

        this.elements.messageContainer.appendChild(element);
    }

    // 格式化消息文本
    formatMessageText(text) {
        // 处理换行
        let formatted = text.replace(/\n/g, '<br>');

        // 添加表情符号
        formatted = this.multimodal.processEmoji(formatted);

        // 高亮关键词
        formatted = this.highlightKeywords(formatted);

        return formatted;
    }

    // 高亮关键词
    highlightKeywords(text) {
        const keywords = ['开心', '快乐', '难过', '生气', '累', '谢谢', '爱'];
        keywords.forEach(keyword => {
            const regex = new RegExp(`(${keyword})`, 'g');
            text = text.replace(regex, '<span class="highlight">$1</span>');
        });
        return text;
    }

    // 格式化时间
    formatTime(date) {
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;

        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    // 滚动到底部
    scrollToBottom() {
        this.elements.messageContainer.scrollTop = this.elements.messageContainer.scrollHeight;
    }

    // 播放音效
    playSound(type) {
        // 简化的音效播放
        console.log(`播放${type === 'send' ? '发送' : '接收'}音效`);
    }

    // 切换语音输入
    toggleVoiceInput() {
        if (this.config.useVoiceInput) {
            this.config.useVoiceInput = false;
            this.multimodal.stopListening();
            this.showToast('语音输入已关闭', 'info');
        } else {
            this.config.useVoiceInput = true;
            if (this.multimodal.toggleVoiceInput()) {
                this.showToast('语音输入已开启，请说话...', 'info');
            } else {
                this.showToast('无法启动语音输入', 'error');
                this.config.useVoiceInput = false;
            }
        }

        this.updateVoiceButton();
        this.saveConfig();
    }

    // 显示表情选择器
    showEmojiPicker() {
        const text = this.elements.messageInput.value;
        const emotion = this.multimodal.inferEmotionFromText(text);
        const emojis = this.multimodal.generateEmojiSuggestions(text, emotion);

        const picker = this.multimodal.createEmojiPickerHTML(emojis, (emoji) => {
            this.elements.messageInput.value += emoji;
            picker.remove();
        });

        // 显示在输入框附近
        const rect = this.elements.emojiBtn.getBoundingClientRect();
        picker.style.position = 'fixed';
        picker.style.top = `${rect.bottom + 10}px`;
        picker.style.right = `${window.innerWidth - rect.right}px`;
        picker.style.zIndex = '1000';

        document.body.appendChild(picker);

        // 点击外部关闭
        const closePicker = (e) => {
            if (!picker.contains(e.target) && e.target !== this.elements.emojiBtn) {
                picker.remove();
                document.removeEventListener('click', closePicker);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closePicker);
        }, 100);
    }

    // 实时分析输入
    analyzeInputInRealTime(text) {
        if (text.length < 3) return;

        // 简单的情感分析
        const emotion = this.multimodal.inferEmotionFromText(text);
        const emojis = this.multimodal.extractEmojis(text);

        // 可以在这里更新UI提示
        console.log('实时分析:', { text, emotion, emojis });
    }

    // 调整布局
    adjustLayout() {
        const width = window.innerWidth;

        if (width < 768) {
            // 移动端优化
            this.elements.messageContainer.style.maxHeight = 'calc(100vh - 200px)';
        } else {
            this.elements.messageContainer.style.maxHeight = '';
        }
    }

    // 页面隐藏时
    onPageHidden() {
        // 暂停语音
        this.multimodal.stopSpeaking();
        this.multimodal.stopListening();

        // 保存数据
        this.saveAllData();
    }

    // 页面显示时
    onPageVisible() {
        this.lastInteractionTime = Date.now();
    }

    // 保存所有数据
    saveAllData() {
        this.saveConfig();
        this.saveUserProfile();
        this.saveConversationHistory();
    }

    // 保存配置
    saveConfig() {
        try {
            localStorage.setItem('ultimateChatbotConfig', JSON.stringify(this.config));
        } catch (error) {
            console.error('保存配置失败:', error);
        }
    }

    // 保存用户档案
    saveUserProfile() {
        try {
            const profile = {
                ...this.state.userProfile,
                interests: Array.from(this.state.conversationContext.userInterests)
            };
            localStorage.setItem('ultimateUserProfile', JSON.stringify(profile));
        } catch (error) {
            console.error('保存用户档案失败:', error);
        }
    }

    // 保存对话历史
    saveConversationHistory() {
        try {
            localStorage.setItem('ultimateConversationHistory',
                JSON.stringify(this.state.userProfile.conversationHistory));
        } catch (error) {
            console.error('保存对话历史失败:', error);
        }
    }

    // 防抖函数
    debounce(key, func, delay) {
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }

        const timer = setTimeout(() => {
            func();
            this.debounceTimers.delete(key);
        }, delay);

        this.debounceTimers.set(key, timer);
    }

    // 显示提示
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // 启动性能监控
    startPerformanceMonitor() {
        setInterval(() => {
            this.checkPerformance();
        }, 60000); // 每分钟检查一次
    }

    // 检查性能
    checkPerformance() {
        const now = Date.now();
        const timeSinceLastInteraction = now - this.lastInteractionTime;

        // 如果长时间无交互，清理缓存
        if (timeSinceLastInteraction > 300000) { // 5分钟
            this.cache.clear();
            console.log('清理缓存（长时间无交互）');
        }

        // 检查内存使用
        if (this.state.shortTermMemory.length > this.state.memoryLimit * 1.5) {
            this.state.shortTermMemory = this.state.shortTermMemory.slice(-this.state.memoryLimit);
            console.log('清理短期记忆（超过限制）');
        }

        // 检查对话历史长度
        if (this.state.userProfile.conversationHistory.length > 150) {
            this.state.userProfile.conversationHistory = this.state.userProfile.conversationHistory.slice(-100);
            console.log('清理对话历史（超过限制）');
        }
    }

    // 获取系统状态
    getSystemStatus() {
        return {
            config: this.config,
            nlp: this.nlp ? '已加载' : '未加载',
            ml: this.ml.getModelStatus(),
            knowledge: this.knowledge.getStatus(),
            multimodal: this.multimodal.getModuleStatus(),
            state: {
                messages: this.state.messages.length,
                memory: this.state.shortTermMemory.length,
                history: this.state.userProfile.conversationHistory.length,
                cache: this.cache.size
            },
            performance: {
                lastInteraction: new Date(this.lastInteractionTime).toLocaleTimeString(),
                debounceTimers: this.debounceTimers.size
            }
        };
    }
}

// 添加CSS样式
const addStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        /* 主题支持 */
        [data-theme="dark"] {
            --primary-pink: #E91E63;
            --light-pink: #F8BBD0;
            --deep-pink: #C2185B;
            --background: #121212;
            --surface: #1E1E1E;
            --text-color: #FFFFFF;
            --light-gray: #2D2D2D;
            --medium-gray: #404040;
        }

        /* 高亮关键词 */
        .highlight {
            color: var(--deep-pink);
            font-weight: bold;
        }

        /* 动画 */
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }

        /* 响应式优化 */
        @media (max-width: 768px) {
            .message-content {
                max-width: 85% !important;
            }

            .quick-replies {
                justify-content: center !important;
            }
        }

        /* 性能优化 */
        .message-group {
            will-change: transform, opacity;
        }

        /* 语音输入状态 */
        .voice-listening {
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    `;
    document.head.appendChild(style);
};

// 页面加载后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 添加样式
    addStyles();

    // 初始化聊天机器人
    const chatbot = new UltimateSmartChatbot();
    window.chatbot = chatbot;

    // 开发工具：按Ctrl+Shift+S显示系统状态
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            const status = chatbot.getSystemStatus();
            console.log('系统状态:', status);
            chatbot.showToast('系统状态已输出到控制台', 'info');
        }
    });
});