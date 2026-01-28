// AI增强版治愈系聊天平台 - 整合NLP和ML
class AIEnhancedHealingChatbot {
    constructor() {
        // 基础状态
        this.messages = [];
        this.aiName = '小韬';
        this.aiPersonality = 'gentle';
        this.soundEnabled = true;
        this.autoScroll = true;
        this.useMLGeneration = true; // 是否使用机器学习生成

        // 智能模块
        this.nlpModule = new SmartNLPModule();
        this.mlGenerator = new MLDialogueGenerator();

        // 智能增强状态
        this.conversationContext = {
            currentTopic: null,
            userMood: 'neutral',
            lastTopics: [],
            mentionedPreferences: new Set(),
            mentionedPeople: new Set(),
            mentionedActivities: new Set(),
            userInterests: new Set(),
            conversationDepth: 0,
            needsFollowUp: false,
            followUpQuestion: null,
            lastAnalysis: null,
            mlConfidence: 0.5 // 机器学习生成置信度
        };

        // 用户档案
        this.userProfile = {
            name: null,
            age: null,
            location: null,
            occupation: null,
            hobbies: [],
            recentEvents: [],
            emotionalState: 'neutral',
            lastActive: new Date(),
            conversationHistory: [],
            mlTrainingData: [] // 机器学习训练数据
        };

        // 对话记忆
        this.shortTermMemory = [];
        this.shortTermMemoryLimit = 20;

        // 知识库
        this.knowledgeBase = this.initKnowledgeBase();

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
        this.loadUserProfile();
        this.addWelcomeMessage();
        this.setupMLTraining();
    }

    // 初始化事件监听器
    initEventListeners() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.quickReplyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const message = e.target.dataset.message;
                this.messageInput.value = message;
                this.sendMessage();
            });
        });

        this.settingsBtn.addEventListener('click', () => this.showSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.hideSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        this.newChatBtn.addEventListener('click', () => this.newChat());
        this.themeBtn.addEventListener('click', () => this.toggleTheme());
        this.voiceBtn.addEventListener('click', () => this.toggleVoiceInput());
        this.emojiBtn.addEventListener('click', () => this.showEmojiPicker());
        this.helpBtn.addEventListener('click', () => this.showHelp());

        this.settingsPanel.addEventListener('click', (e) => {
            if (e.target === this.settingsPanel) this.hideSettings();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.settingsPanel.classList.contains('active')) {
                this.hideSettings();
            }
        });
    }

    // 设置机器学习训练
    async setupMLTraining() {
        // 检查是否有历史数据可以训练
        if (this.userProfile.conversationHistory.length > 10) {
            console.log('开始使用历史数据训练ML模型...');
            await this.mlGenerator.trainOnHistory(this.userProfile.conversationHistory);
        }

        // 定期训练模型
        setInterval(() => {
            this.autoTrainMLModel();
        }, 300000); // 每5分钟训练一次
    }

    // 自动训练ML模型
    async autoTrainMLModel() {
        if (this.userProfile.mlTrainingData.length > 5) {
            console.log('自动训练ML模型...');
            const success = await this.mlGenerator.trainOnHistory(this.userProfile.mlTrainingData.slice(-10));
            if (success) {
                console.log('ML模型自动训练完成');
            }
        }
    }

    // 添加欢迎消息
    addWelcomeMessage() {
        const welcomeMessages = [
            `Hi，我是${this.aiName}，你的AI增强聊天伙伴！🤖`,
            "我整合了NLP分析和机器学习技术，能更智能地理解你和生成回复。💡",
            "我会从我们的对话中学习，让每次交流都更加个性化和自然。✨",
            "试试和我聊天吧～我会用心倾听并智能回应！🌸"
        ];

        welcomeMessages.forEach((msg, index) => {
            setTimeout(() => {
                this.addAIMessage(msg);
            }, index * 800);
        });
    }

    // 发送消息
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // 添加用户消息
        this.addUserMessage(message);
        this.messageInput.value = '';

        // 使用NLP模块分析
        const analysis = await this.nlpModule.analyzeMessage(message);
        this.conversationContext.lastAnalysis = analysis;

        // 更新上下文
        this.updateContextFromAnalysis(analysis);

        // 生成智能回复
        setTimeout(async () => {
            const aiResponse = await this.generateAIResponse(message, analysis);
            this.addAIMessage(aiResponse);

            // 更新对话记忆
            this.updateConversationMemory(message, aiResponse, analysis);

            // 添加到ML训练数据
            this.addToMLTrainingData(message, aiResponse);
        }, 600 + Math.random() * 600);
    }

    // 从NLP分析更新上下文
    updateContextFromAnalysis(analysis) {
        // 更新情绪
        if (analysis.emotion.primary !== 'neutral') {
            this.conversationContext.userMood = analysis.emotion.primary;
            this.userProfile.emotionalState = analysis.emotion.primary;
        }

        // 更新用户信息
        if (analysis.entities.name) {
            this.userProfile.name = analysis.entities.name;
        }
        if (analysis.entities.age) {
            this.userProfile.age = analysis.entities.age;
        }
        if (analysis.entities.location) {
            this.userProfile.location = analysis.entities.location;
        }

        // 更新话题
        if (analysis.entities.topics.length > 0) {
            this.conversationContext.currentTopic = analysis.entities.topics[0];
            if (!this.conversationContext.lastTopics.includes(analysis.entities.topics[0])) {
                this.conversationContext.lastTopics.unshift(analysis.entities.topics[0]);
                if (this.conversationContext.lastTopics.length > 5) {
                    this.conversationContext.lastTopics.pop();
                }
            }
        }

        // 更新兴趣
        analysis.keywords.forEach(keyword => {
            if (keyword.length > 1) {
                this.conversationContext.userInterests.add(keyword);
                if (!this.userProfile.hobbies.includes(keyword)) {
                    this.userProfile.hobbies.push(keyword);
                }
            }
        });

        // 更新对话深度
        this.conversationContext.conversationDepth++;

        // 调整ML置信度（基于对话质量）
        if (analysis.emotion.confidence > 0.7) {
            this.conversationContext.mlConfidence = Math.min(0.9, this.conversationContext.mlConfidence + 0.1);
        }
    }

    // 生成AI回复
    async generateAIResponse(userMessage, analysis) {
        // 决定使用哪种生成方式
        const useML = this.useMLGeneration &&
                     this.conversationContext.mlConfidence > 0.6 &&
                     this.mlGenerator.getModelStatus().isModelTrained;

        let response = '';

        if (useML) {
            // 使用机器学习生成
            const mlContext = {
                userName: this.userProfile.name,
                emotion: analysis.emotion.primary,
                topic: this.conversationContext.currentTopic
            };

            response = await this.mlGenerator.generateResponse(userMessage, mlContext);

            // 评估ML生成质量
            const mlQuality = this.evaluateMLResponse(response, analysis);
            if (mlQuality < 0.3) {
                // ML生成质量低，回退到规则生成
                response = this.generateRuleBasedResponse(analysis);
                this.conversationContext.mlConfidence = Math.max(0.3, this.conversationContext.mlConfidence - 0.1);
            } else {
                // ML生成质量好，提高置信度
                this.conversationContext.mlConfidence = Math.min(0.95, this.conversationContext.mlConfidence + 0.05);
            }
        } else {
            // 使用规则生成
            response = this.generateRuleBasedResponse(analysis);
        }

        // 后处理
        response = this.postProcessResponse(response, analysis);

        return response;
    }

    // 评估ML回复质量
    evaluateMLResponse(response, analysis) {
        if (!response || response.length < 2) return 0;

        let quality = 0.5;

        // 检查长度
        if (response.length >= 5 && response.length <= 50) {
            quality += 0.2;
        }

        // 检查是否包含结束标点
        if (/[。！？]$/.test(response)) {
            quality += 0.1;
        }

        // 检查是否与情绪相关
        const emotionWords = {
            happy: ['开心', '高兴', '快乐', '喜悦'],
            sad: ['难过', '伤心', '悲伤', '安慰'],
            angry: ['生气', '愤怒', '平静', '理解'],
            tired: ['累', '休息', '放松', '照顾']
        };

        if (analysis.emotion.primary !== 'neutral') {
            const words = emotionWords[analysis.emotion.primary] || [];
            if (words.some(word => response.includes(word))) {
                quality += 0.2;
            }
        }

        return Math.min(1, quality);
    }

    // 生成规则基础回复
    generateRuleBasedResponse(analysis) {
        const intents = analysis.intent;
        const primaryIntent = Object.keys(intents).reduce((a, b) => intents[a] > intents[b] ? a : b);

        // 根据意图选择回复策略
        switch (primaryIntent) {
            case 'greeting':
                return this.getGreetingResponse();

            case 'farewell':
                return this.getFarewellResponse();

            case 'question':
            case 'knowledge':
                return this.getKnowledgeResponse(analysis);

            case 'request':
            case 'advice':
                return this.getAdviceResponse(analysis);

            case 'emotion':
                return this.getEmotionalResponse(analysis);

            case 'personal':
                return this.getPersonalResponse();

            default:
                return this.getContextualResponse(analysis);
        }
    }

    // 问候回复
    getGreetingResponse() {
        const responses = [
            `你好呀！${this.userProfile.name ? this.userProfile.name + '，' : ''}很高兴见到你！😊`,
            "嗨～今天过得怎么样？🌸",
            "你好！我是你的AI伙伴，随时为你服务！✨"
        ];
        return this.getRandomResponse(responses);
    }

    // 告别回复
    getFarewellResponse() {
        const responses = [
            "再见啦～期待下次聊天！💕",
            "拜拜！记得照顾好自己哦～🌸",
            "晚安，愿你有个好梦！🌙"
        ];
        return this.getRandomResponse(responses);
    }

    // 知识回复
    getKnowledgeResponse(analysis) {
        const knowledgeTypes = Object.keys(this.knowledgeBase.facts);
        const selectedType = knowledgeTypes[Math.floor(Math.random() * knowledgeTypes.length)];
        const facts = this.knowledgeBase.facts[selectedType];

        if (facts && facts.length > 0) {
            let response = this.getRandomResponse(facts);

            // 添加相关建议
            if (Math.random() > 0.5) {
                const advice = this.getRelatedAdvice(selectedType);
                if (advice) {
                    response += " " + advice;
                }
            }

            return response;
        }

        return "这个问题很有趣！让我想想怎么回答你。🤔";
    }

    // 建议回复
    getAdviceResponse(analysis) {
        const adviceTypes = Object.keys(this.knowledgeBase.advice);
        let adviceType = 'stress';

        // 根据话题选择建议类型
        if (analysis.entities.topics.length > 0) {
            const topic = analysis.entities.topics[0];
            const topicToAdvice = {
                work: 'stress',
                study: 'study',
                health: 'sleep',
                friends: 'social',
                family: 'social'
            };
            adviceType = topicToAdvice[topic] || adviceType;
        }

        const adviceList = this.knowledgeBase.advice[adviceType];
        if (adviceList && adviceList.length > 0) {
            let response = this.getRandomResponse(adviceList);

            // 个性化
            if (this.userProfile.name) {
                response = `${this.userProfile.name}，${response}`;
            }

            // 添加情感支持
            const supportPhrases = [
                "希望这对你有帮助！💖",
                "慢慢来，你会找到适合自己的方式的。🌟",
                "记住，我一直在你身边支持你。🤗"
            ];

            response += " " + this.getRandomResponse(supportPhrases);
            return response;
        }

        return "我理解你的需求，让我想想有什么好的建议。💭";
    }

    // 情绪回复
    getEmotionalResponse(analysis) {
        const { primary, confidence } = analysis.emotion;
        const responses = {
            happy: [
                confidence > 0.8 ? "哇！感受到你满满的快乐能量！🎉" : "看到你开心，我也感到快乐！😊",
                "真为你感到高兴！愿这份快乐一直陪伴你。✨",
                "快乐是会传染的，谢谢你分享这份喜悦！💖"
            ],
            sad: [
                confidence > 0.8 ? "抱抱你～我知道你现在心里一定很难受。🫂" : "我在这里陪着你，难过的时候有人倾诉会好一些。💕",
                "难过的时候，请允许自己感受这份情绪，我在这里陪着你。🌸",
                "眼泪是心灵的雨，雨后总会有彩虹。🌈"
            ],
            angry: [
                confidence > 0.8 ? "深呼吸～吸气～呼气～ 让情绪慢慢平静下来。🕊️" : "我理解你现在的心情，生气是正常的情绪表达。",
                "要不要跟我说说发生了什么？我在这里倾听你。👂",
                "情绪需要出口，说出来会感觉好一些。💭"
            ],
            tired: [
                confidence > 0.8 ? "辛苦啦～记得要好好休息哦，身体是最重要的！😴" : "累了就停下来歇一歇吧，我会在这里陪着你恢复能量。💫",
                "给自己泡杯热茶，听听轻音乐，好好放松一下吧～🌸",
                "适当的休息是为了走更远的路。🌟"
            ],
            anxious: [
                confidence > 0.8 ? "慢慢来，一步一步走，焦虑的时候深呼吸很有帮助。🌿" : "我在这里陪着你，你不是一个人面对这些。🤗",
                "把担心的事情写下来，有时会让头脑更清晰。📝",
                "焦虑是暂时的，你会找到解决办法的。💡"
            ]
        };

        if (responses[primary]) {
            return this.getRandomResponse(responses[primary]);
        }

        return "我在这里认真倾听你的感受。💕";
    }

    // 个人信息回复
    getPersonalResponse() {
        const responses = [
            "谢谢分享这些信息！这让我更了解你了。💕",
            "很高兴知道这些关于你的事情！🌸",
            "我会记住这些信息的，谢谢你的信任！✨"
        ];
        return this.getRandomResponse(responses);
    }

    // 上下文回复
    getContextualResponse(analysis) {
        let response = '';

        // 使用用户姓名
        if (this.userProfile.name && Math.random() > 0.7) {
            response += `${this.userProfile.name}，`;
        }

        // 提及用户兴趣
        if (this.conversationContext.userInterests.size > 0 && Math.random() > 0.8) {
            const interests = Array.from(this.conversationContext.userInterests);
            const randomInterest = interests[Math.floor(Math.random() * interests.length)];
            response += `记得你提到过喜欢${randomInterest}，`;
        }

        // 根据对话历史
        if (this.conversationContext.lastTopics.length > 0 && Math.random() > 0.6) {
            const lastTopic = this.conversationContext.lastTopics[0];
            const topicMap = {
                work: '工作',
                study: '学习',
                family: '家人',
                friends: '朋友',
                hobby: '爱好'
            };
            if (topicMap[lastTopic]) {
                response += `关于${topicMap[lastTopic]}的事情，`;
            }
        }

        if (response) {
            const continuations = [
                "今天有什么想分享的吗？🌸",
                "想继续聊聊这个话题吗？✨",
                "我在这里认真倾听你呢。💕",
                "你的想法和感受对我都很重要。👂"
            ];
            response += this.getRandomResponse(continuations);
            return response;
        }

        // 默认回复
        const defaults = [
            "我在这里认真倾听你说的每一句话～💕",
            "谢谢你的分享，这让我更加了解你了呢！✨",
            "无论你想说什么，我都会用心回应你。🌸",
            "你的感受很重要，请继续和我分享吧～🫂"
        ];
        return this.getRandomResponse(defaults);
    }

    // 获取相关建议
    getRelatedAdvice(knowledgeType) {
        const adviceMap = {
            science: this.knowledgeBase.advice.study,
            nature: this.knowledgeBase.advice.health,
            history: this.knowledgeBase.advice.social
        };

        if (adviceMap[knowledgeType]) {
            return this.getRandomResponse(adviceMap[knowledgeType]);
        }
        return null;
    }

    // 后处理回复
    postProcessResponse(response, analysis) {
        // 确保回复不为空
        if (!response || response.trim().length === 0) {
            return "我在这里陪伴着你。💕";
        }

        // 添加AI名称（如果包含{name}）
        response = response.replace(/{name}/g, this.aiName);

        // 根据情绪添加表情符号
        if (analysis.emotion.primary !== 'neutral') {
            const emotionEmojis = {
                happy: '😊',
                sad: '🤗',
                angry: '😤',
                tired: '😴',
                anxious: '🤔'
            };

            const emoji = emotionEmojis[analysis.emotion.primary];
            if (emoji && !response.includes(emoji) && response.length < 40) {
                response += ' ' + emoji;
            }
        }

        return response;
    }

    // 添加到ML训练数据
    addToMLTrainingData(userMessage, aiResponse) {
        this.userProfile.mlTrainingData.push(
            { type: 'user', text: userMessage },
            { type: 'ai', text: aiResponse }
        );

        // 限制训练数据大小
        if (this.userProfile.mlTrainingData.length > 100) {
            this.userProfile.mlTrainingData = this.userProfile.mlTrainingData.slice(-100);
        }

        // 定期训练
        if (this.userProfile.mlTrainingData.length % 10 === 0) {
            setTimeout(async () => {
                await this.mlGenerator.trainOnHistory(this.userProfile.mlTrainingData.slice(-20));
            }, 1000);
        }
    }

    // 更新对话记忆
    updateConversationMemory(userMessage, aiResponse, analysis) {
        const memoryEntry = {
            user: userMessage,
            ai: aiResponse,
            timestamp: new Date(),
            analysis: analysis,
            topic: this.conversationContext.currentTopic,
            mood: this.conversationContext.userMood,
            mlUsed: this.conversationContext.mlConfidence > 0.6
        };

        this.shortTermMemory.push(memoryEntry);
        if (this.shortTermMemory.length > this.shortTermMemoryLimit) {
            this.shortTermMemory.shift();
        }

        // 保存到用户历史
        this.userProfile.conversationHistory.push({
            message: userMessage,
            response: aiResponse,
            timestamp: new Date(),
            emotion: analysis.emotion.primary,
            mlGenerated: memoryEntry.mlUsed
        });

        // 限制历史记录长度
        if (this.userProfile.conversationHistory.length > 100) {
            this.userProfile.conversationHistory = this.userProfile.conversationHistory.slice(-100);
        }
    }

    // 初始化知识库
    initKnowledgeBase() {
        return {
            facts: {
                science: [
                    "你知道地球有71%的表面被水覆盖吗？🌊",
                    "人类大脑由大约860亿个神经元组成！🧠",
                    "光速是每秒299,792,458米，这是宇宙中最快的速度。⚡"
                ],
                nature: [
                    "树木通过光合作用吸收二氧化碳，释放氧气。🌳",
                    "蜜蜂的翅膀每分钟能振动200次以上！🐝",
                    "彩虹有七种颜色：红、橙、黄、绿、蓝、靛、紫。🌈"
                ],
                history: [
                    "中国的长城全长超过21,000公里。🏯",
                    "第一个电子邮件是在1971年发送的。📧",
                    "互联网是在1983年正式诞生的。🌐"
                ]
            },
            advice: {
                stress: [
                    "压力大时可以试试深呼吸：吸气4秒，屏气7秒，呼气8秒。🧘‍♀️",
                    "定期运动能有效缓解压力，每周150分钟中等强度运动就很棒！💪",
                    "写日记是很好的情绪宣泄方式，试试每天写3件感恩的事。📓"
                ],
                sleep: [
                    "成年人每天需要7-9小时睡眠，保持规律作息很重要。😴",
                    "睡前1小时避免看手机屏幕，蓝光会影响睡眠质量。📵",
                    "舒适的睡眠环境：温度18-22℃，黑暗安静。🌙"
                ],
                study: [
                    "番茄工作法：工作25分钟，休息5分钟，能提高学习效率。🍅",
                    "主动回忆比被动阅读更有效，试试自己复述学到的内容。📚",
                    "分散学习比集中突击更有利于长期记忆。🎯"
                ],
                social: [
                    "倾听是良好沟通的基础，尝试先理解再回应。👂",
                    "真诚的赞美能增进人际关系，记得具体而不空泛。👍",
                    "设定个人边界很重要，学会温和但坚定地说'不'。🛡️"
                ]
            },
            fun: {
                jokes: [
                    "为什么数学书总是很悲伤？因为它有太多问题！📖😂",
                    "什么茶不能喝？警察（查）！👮‍♂️🍵",
                    "为什么自行车不会自己站起来？因为它太累了！🚲😴"
                ],
                trivia: [
                    "猫的叫声有超过100种不同的含义。🐱",
                    "香蕉是浆果，但草莓不是。🍌🍓",
                    "人的一生平均会走约128,000公里，相当于绕地球三圈！👣"
                ],
                quotes: [
                    "生活就像一盒巧克力，你永远不知道下一颗是什么味道。🍫",
                    "成功不是终点，失败也非末日，重要的是继续前进的勇气。🚀",
                    "昨天是历史，明天是谜团，今天是礼物，所以叫做现在。🎁"
                ]
            }
        };
    }

    // 以下为辅助方法（与之前版本类似）
    addUserMessage(text) {
        const message = {
            type: 'user',
            text: text,
            time: new Date()
        };
        this.messages.push(message);
        this.renderMessage(message);
        if (this.soundEnabled) this.playSound('send');
    }

    addAIMessage(text) {
        const message = {
            type: 'ai',
            text: text,
            time: new Date()
        };
        this.messages.push(message);
        this.renderMessage(message);
        if (this.soundEnabled) this.playSound('receive');
    }

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
        if (this.autoScroll) this.scrollToBottom();
    }

    formatMessageText(text) {
        let formatted = text.replace(/\n/g, '<br>');
        const keywords = {
            '开心': '🎉', '快乐': '😊', '难过': '🤗', '悲伤': '🫂',
            '生气': '😤', '担心': '🤔', '累': '😴', '谢谢': '🙏',
            '爱': '💖', '心': '❤️', '花': '🌸', '星星': '✨',
            '太阳': '☀️', '月亮': '🌙', '加油': '💪', '棒': '👍'
        };
        Object.entries(keywords).forEach(([word, emoji]) => {
            const regex = new RegExp(`(${word})`, 'g');
            formatted = formatted.replace(regex, `$1 ${emoji}`);
        });
        return formatted;
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    playSound(type) {
        console.log(`播放${type === 'send' ? '发送' : '接收'}音效`);
    }

    scrollToBottom() {
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }

    showSettings() {
        this.settingsPanel.classList.add('active');
        this.updateSettingsForm();
    }

    hideSettings() {
        this.settingsPanel.classList.remove('active');
    }

    updateSettingsForm() {
        document.getElementById('aiName').value = this.aiName;
        document.getElementById('aiPersonality').value = this.aiPersonality;
        document.getElementById('soundEnabled').checked = this.soundEnabled;
        document.getElementById('autoScroll').checked = this.autoScroll;
    }

    saveSettings() {
        this.aiName = document.getElementById('aiName').value || '小韬';
        this.aiPersonality = document.getElementById('aiPersonality').value;
        this.soundEnabled = document.getElementById('soundEnabled').checked;
        this.autoScroll = document.getElementById('autoScroll').checked;

        document.querySelector('.sidebar-header h2').textContent = this.aiName;
        this.saveSettingsToStorage();
        this.showToast('设置已保存！');
        this.hideSettings();
    }

    loadSettings() {
        const saved = localStorage.getItem('healingChatbotSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.aiName = settings.aiName || '小韬';
                this.aiPersonality = settings.aiPersonality || 'gentle';
                this.soundEnabled = settings.soundEnabled !== false;
                this.autoScroll = settings.autoScroll !== false;
                document.querySelector('.sidebar-header h2').textContent = this.aiName;
            } catch (e) {
                console.error('加载设置失败:', e);
            }
        }
    }

    loadUserProfile() {
        const saved = localStorage.getItem('healingChatbotUserProfile');
        if (saved) {
            try {
                const profile = JSON.parse(saved);
                Object.assign(this.userProfile, profile);
                // 恢复Set类型
                if (profile.interests) {
                    this.conversationContext.userInterests = new Set(profile.interests);
                }
                if (profile.mentionedPreferences) {
                    this.conversationContext.mentionedPreferences = new Set(profile.mentionedPreferences);
                }
                if (profile.conversationHistory) {
                    this.userProfile.conversationHistory = profile.conversationHistory;
                }
                if (profile.mlTrainingData) {
                    this.userProfile.mlTrainingData = profile.mlTrainingData;
                }
            } catch (e) {
                console.error('加载用户档案失败:', e);
            }
        }
    }

    saveSettingsToStorage() {
        const settings = {
            aiName: this.aiName,
            aiPersonality: this.aiPersonality,
            soundEnabled: this.soundEnabled,
            autoScroll: this.autoScroll,
            useMLGeneration: this.useMLGeneration
        };
        localStorage.setItem('healingChatbotSettings', JSON.stringify(settings));

        // 保存用户档案
        const profile = {
            ...this.userProfile,
            interests: Array.from(this.conversationContext.userInterests),
            mentionedPreferences: Array.from(this.conversationContext.mentionedPreferences),
            conversationHistory: this.userProfile.conversationHistory,
            mlTrainingData: this.userProfile.mlTrainingData
        };
        localStorage.setItem('healingChatbotUserProfile', JSON.stringify(profile));
    }

    clearChat() {
        if (confirm('确定要清空所有聊天记录吗？')) {
            this.messages = [];
            this.shortTermMemory = [];
            this.messageContainer.innerHTML = '';
            this.addWelcomeMessage();
            this.showToast('聊天记录已清空');
        }
    }

    newChat() {
        if (this.messages.length > 3) {
            if (confirm('开始新的对话吗？当前对话将被保存。')) {
                this.saveSettingsToStorage();

                // 重置对话状态
                this.messages = [];
                this.shortTermMemory = [];
                this.conversationContext.currentTopic = null;
                this.conversationContext.userMood = 'neutral';
                this.conversationContext.needsFollowUp = false;
                this.conversationContext.followUpQuestion = null;
                this.conversationContext.conversationDepth = 0;
                this.conversationContext.lastAnalysis = null;

                this.messageContainer.innerHTML = '';
                this.addWelcomeMessage();
                this.showToast('开始新的对话');
            }
        }
    }

    toggleTheme() {
        this.showToast('主题切换功能开发中～');
    }

    toggleVoiceInput() {
        this.showToast('语音输入功能开发中～');
    }

    showEmojiPicker() {
        this.showToast('表情选择器开发中～');
    }

    showHelp() {
        const helpMessage = `
            <strong>AI增强聊天伙伴使用说明：</strong><br>
            1. 我使用NLP技术分析你的消息（意图、情绪、实体）<br>
            2. 我整合了机器学习模型，能从对话中学习并生成更自然的回复<br>
            3. 我会记住我们的对话内容和你的个人偏好<br>
            4. 我拥有丰富的知识库，可以回答各种问题<br>
            5. 所有数据仅保存在你的设备中，保护隐私<br><br>
            <strong>智能特性：</strong><br>
            • 自适应学习：对话越多，回复越个性化<br>
            • 情绪识别：准确理解你的情感状态<br>
            • 上下文感知：基于对话历史进行连贯回应<br>
            • 混合生成：结合规则和机器学习生成最佳回复<br><br>
            <strong>试试对我说：</strong><br>
            • "我今天心情很好"（情绪识别）<br>
            • "机器学习是什么？"（知识问答）<br>
            • "学习压力大怎么办"（建议咨询）<br>
            • "多和我聊聊天"（ML训练）<br><br>
            <strong>我会：</strong><br>
            • 智能分析你的每一句话<br>
            • 从对话中学习并改进<br>
            • 提供个性化回应<br>
            • 永远在这里智能陪伴你💖
        `;
        this.addAIMessage(helpMessage);
    }

    showToast(message) {
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

        setTimeout(() => {
            toast.remove();
            style.remove();
        }, 3000);
    }

    // 获取系统状态
    getSystemStatus() {
        const mlStatus = this.mlGenerator.getModelStatus();
        return {
            nlp: {
                loaded: true,
                lastAnalysis: this.conversationContext.lastAnalysis ? '可用' : '无'
            },
            ml: {
                loaded: mlStatus.isTFLoaded,
                trained: mlStatus.isModelTrained,
                vocabularySize: mlStatus.vocabularySize,
                hasModel: mlStatus.hasModel,
                confidence: this.conversationContext.mlConfidence
            },
            memory: {
                shortTerm: this.shortTermMemory.length,
                history: this.userProfile.conversationHistory.length,
                trainingData: this.userProfile.mlTrainingData.length
            },
            user: {
                name: this.userProfile.name || '未设置',
                interests: Array.from(this.conversationContext.userInterests).length,
                emotion: this.userProfile.emotionalState
            }
        };
    }
}

// 页面加载后初始化AI增强聊天机器人
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new AIEnhancedHealingChatbot();
    window.chatbot = chatbot;

    // 添加系统状态检查（开发用）
    setTimeout(() => {
        const status = chatbot.getSystemStatus();
        console.log('系统状态:', status);
    }, 3000);
});