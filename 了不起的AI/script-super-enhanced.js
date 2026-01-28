// 超级智能治愈系AI聊天平台 - 整合NLP模块
class SuperSmartHealingChatbot {
    constructor() {
        // 基础状态
        this.messages = [];
        this.aiName = '小韬';
        this.aiPersonality = 'gentle';
        this.soundEnabled = true;
        this.autoScroll = true;

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
            lastAnalysis: null
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
            conversationHistory: []
        };

        // 对话记忆（最近15轮对话）
        this.shortTermMemory = [];
        this.shortTermMemoryLimit = 15;

        // 初始化NLP模块
        this.nlpModule = new SmartNLPModule();

        // 知识库增强
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

    // 添加欢迎消息（超级智能版）
    addWelcomeMessage() {
        const welcomeMessages = [
            `Hi，我是${this.aiName}，你的超级智能AI伙伴！🚀`,
            "我升级了最新的NLP技术，现在能更准确地理解你的情感和意图。💡",
            "我可以分析你的情绪、识别话题、提取关键信息，并提供个性化回应。✨",
            "试试对我说些什么吧～无论是分享心情、寻求建议，还是随便聊聊！🌸"
        ];

        welcomeMessages.forEach((msg, index) => {
            setTimeout(() => {
                this.addAIMessage(msg);
            }, index * 800);
        });
    }

    // 发送消息（超级智能版）
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // 添加用户消息
        this.addUserMessage(message);
        this.messageInput.value = '';

        // 使用NLP模块分析用户消息
        const analysis = await this.nlpModule.analyzeMessage(message);
        this.conversationContext.lastAnalysis = analysis;

        // 更新上下文
        this.updateContextFromAnalysis(analysis);

        // 智能生成回复（考虑上下文和NLP分析）
        setTimeout(async () => {
            const aiResponse = await this.generateSuperSmartResponse(message, analysis);
            this.addAIMessage(aiResponse);

            // 更新对话记忆
            this.updateConversationMemory(message, aiResponse, analysis);
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

        // 检查是否需要跟进
        if (analysis.emotion.confidence > 0.7 || analysis.hasQuestion) {
            this.conversationContext.needsFollowUp = true;
        }
    }

    // 生成超级智能回复
    async generateSuperSmartResponse(userMessage, analysis) {
        let response = '';

        // 1. 检查是否需要跟进上一轮对话
        if (this.conversationContext.needsFollowUp && this.conversationContext.followUpQuestion) {
            response = this.generateFollowUpResponse(userMessage, analysis);
            if (response) {
                this.conversationContext.needsFollowUp = false;
                this.conversationContext.followUpQuestion = null;
                return this.processResponse(response);
            }
        }

        // 2. 根据意图生成回复
        const intentResponse = this.generateIntentBasedResponse(analysis);
        if (intentResponse) {
            return this.processResponse(intentResponse);
        }

        // 3. 根据情绪生成回复
        if (analysis.emotion.primary !== 'neutral') {
            response = this.generateEmotionalResponse(analysis);
            if (response) return this.processResponse(response);
        }

        // 4. 根据话题生成回复
        if (analysis.entities.topics.length > 0) {
            response = this.generateTopicResponse(analysis);
            if (response) return this.processResponse(response);
        }

        // 5. 个性化回复
        response = this.generatePersonalizedResponse(analysis);
        if (response) return this.processResponse(response);

        // 6. 默认回复
        return this.processResponse(this.getDefaultResponse());
    }

    // 根据意图生成回复
    generateIntentBasedResponse(analysis) {
        const intents = analysis.intent;
        const primaryIntent = Object.keys(intents).reduce((a, b) => intents[a] > intents[b] ? a : b);

        switch (primaryIntent) {
            case 'greeting':
                return this.getRandomResponse([
                    `你好呀！${this.userProfile.name ? this.userProfile.name + '，' : ''}很高兴见到你！😊`,
                    "嗨～今天过得怎么样？🌸",
                    "你好！我是你的AI伙伴，随时为你服务！✨"
                ]);

            case 'farewell':
                return this.getRandomResponse([
                    "再见啦～期待下次聊天！💕",
                    "拜拜！记得照顾好自己哦～🌸",
                    "晚安，愿你有个好梦！🌙"
                ]);

            case 'question':
                return this.generateKnowledgeResponse(analysis);

            case 'request':
                return this.getRandomResponse([
                    "我很乐意帮助你！有什么具体需要我做的吗？🤗",
                    "请告诉我你需要什么帮助，我会尽力协助你。💪",
                    "没问题，我在这里为你服务！✨"
                ]);

            case 'emotion':
                return this.generateEmotionalResponse(analysis);

            case 'knowledge':
                return this.generateKnowledgeResponse(analysis);

            case 'advice':
                return this.generateAdviceResponse(analysis);

            case 'personal':
                return this.getRandomResponse([
                    "谢谢分享这些信息！这让我更了解你了。💕",
                    "很高兴知道这些关于你的事情！🌸",
                    "我会记住这些信息的，谢谢你的信任！✨"
                ]);

            default:
                return null;
        }
    }

    // 生成情绪回应
    generateEmotionalResponse(analysis) {
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
            let response = this.getRandomResponse(responses[primary]);

            // 添加跟进问题
            if (confidence > 0.6 && Math.random() > 0.3) {
                const followUp = this.generateFollowUpQuestion();
                if (followUp) {
                    response += " " + followUp;
                }
            }

            return response;
        }
        return null;
    }

    // 生成话题回应
    generateTopicResponse(analysis) {
        const topic = analysis.entities.topics[0];
        const topicResponses = {
            work: [
                "工作方面的事情确实需要认真对待呢。💼",
                "职场上保持积极心态很重要，但也别忘了照顾自己。🌟",
                "工作再忙也要记得劳逸结合哦。⏰"
            ],
            study: [
                "学习是持续成长的过程，你已经很棒了！📚",
                "找到适合自己的学习方法很重要，每个人节奏不同。🎓",
                "学习遇到困难时，可以尝试换个角度思考。💡"
            ],
            family: [
                "家人是我们最亲近的人，家庭关系很珍贵。👨‍👩‍👧‍👦",
                "和家人沟通需要耐心和理解。💝",
                "家庭是温暖的港湾，记得常联系家人哦。🏡"
            ],
            friends: [
                "好朋友是生活中的宝贵财富。👭",
                "真正的友谊需要时间和真心来培养。🤝",
                "和朋友分享快乐，快乐会加倍；分享烦恼，烦恼会减半。🎈"
            ],
            hobby: [
                "有爱好的人生活更丰富多彩呢！🎨",
                "坚持自己的兴趣能让生活更有乐趣。🎯",
                "爱好是生活的调味剂，让日常变得有趣。✨"
            ],
            health: [
                "健康是最重要的财富，要好好照顾自己。💪",
                "身体是革命的本钱，定期体检很重要。🏥",
                "均衡饮食、适量运动、充足睡眠是健康的三大支柱。🍎🏃‍♀️😴"
            ],
            love: [
                "感情的事情需要时间和缘分。💖",
                "在爱别人之前，先要学会爱自己。💕",
                "真诚的心总会遇到对的人。🌹"
            ]
        };

        if (topicResponses[topic]) {
            let response = this.getRandomResponse(topicResponses[topic]);

            // 添加个性化元素
            if (this.userProfile.name) {
                response = response.replace(/。/g, `${this.userProfile.name}。`);
            }

            // 添加相关知识
            if (Math.random() > 0.5) {
                const knowledge = this.getRelatedKnowledge(topic);
                if (knowledge) {
                    response += " " + knowledge;
                }
            }

            return response;
        }
        return null;
    }

    // 生成知识回复
    generateKnowledgeResponse(analysis) {
        // 检查是否询问特定知识
        const knowledgeTypes = Object.keys(this.knowledgeBase.facts);
        let selectedType = knowledgeTypes[Math.floor(Math.random() * knowledgeTypes.length)];

        // 根据话题选择相关知识类型
        if (analysis.entities.topics.length > 0) {
            const topic = analysis.entities.topics[0];
            const topicToKnowledge = {
                work: 'science',
                study: 'science',
                health: 'nature',
                hobby: 'nature'
            };
            if (topicToKnowledge[topic]) {
                selectedType = topicToKnowledge[topic];
            }
        }

        const facts = this.knowledgeBase.facts[selectedType];
        if (facts && facts.length > 0) {
            const fact = this.getRandomResponse(facts);

            // 添加相关建议
            let response = fact;
            if (Math.random() > 0.5) {
                const advice = this.getRelatedAdvice(selectedType);
                if (advice) {
                    response += " " + advice;
                }
            }

            return response;
        }
        return null;
    }

    // 生成建议回复
    generateAdviceResponse(analysis) {
        const adviceTypes = Object.keys(this.knowledgeBase.advice);
        let adviceType = 'stress'; // 默认

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
            if (topicToAdvice[topic]) {
                adviceType = topicToAdvice[topic];
            } else {
                adviceType = adviceTypes[Math.floor(Math.random() * adviceTypes.length)];
            }
        }

        const adviceList = this.knowledgeBase.advice[adviceType];
        if (adviceList && adviceList.length > 0) {
            const advice = this.getRandomResponse(adviceList);

            // 个性化
            let response = advice;
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
        return null;
    }

    // 生成个性化回复
    generatePersonalizedResponse(analysis) {
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

        return null;
    }

    // 获取相关知识
    getRelatedKnowledge(topic) {
        const knowledgeMap = {
            work: this.knowledgeBase.facts.science,
            study: this.knowledgeBase.facts.science,
            health: this.knowledgeBase.facts.nature,
            hobby: this.knowledgeBase.facts.nature
        };

        if (knowledgeMap[topic]) {
            return this.getRandomResponse(knowledgeMap[topic]);
        }
        return null;
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

    // 生成跟进回应
    generateFollowUpResponse(userMessage, analysis) {
        if (this.conversationContext.followUpQuestion) {
            const positiveKeywords = ['是的', '对', '嗯', '好', '当然', '确实'];
            const negativeKeywords = ['不', '没有', '不是', '不太'];

            const isPositive = positiveKeywords.some(keyword => userMessage.includes(keyword));
            const isNegative = negativeKeywords.some(keyword => userMessage.includes(keyword));

            if (isPositive) {
                return "很高兴听到你这么说！😊";
            } else if (isNegative) {
                return "我理解，每个人情况不同。🤗";
            }
        }
        return null;
    }

    // 生成跟进问题
    generateFollowUpQuestion() {
        const questions = [
            "你对此有什么看法呢？🤔",
            "能多和我分享一些吗？👂",
            "这件事对你有什么影响吗？💭",
            "你现在感觉怎么样？🌸",
            "想继续聊聊这个话题吗？✨"
        ];

        if (Math.random() > 0.7) {
            this.conversationContext.needsFollowUp = true;
            this.conversationContext.followUpQuestion = this.getRandomResponse(questions);
            return this.conversationContext.followUpQuestion;
        }
        return null;
    }

    // 获取默认回复
    getDefaultResponse() {
        const defaults = [
            "我在这里认真倾听你说的每一句话～💕",
            "谢谢你的分享，这让我更加了解你了呢！✨",
            "无论你想说什么，我都会用心回应你。🌸",
            "你的感受很重要，请继续和我分享吧～🫂",
            "我可能不是最聪明的AI，但我会用最真诚的心陪伴你。💖"
        ];
        return this.getRandomResponse(defaults);
    }

    // 更新对话记忆
    updateConversationMemory(userMessage, aiResponse, analysis) {
        this.shortTermMemory.push({
            user: userMessage,
            ai: aiResponse,
            timestamp: new Date(),
            analysis: analysis,
            topic: this.conversationContext.currentTopic,
            mood: this.conversationContext.userMood
        });

        if (this.shortTermMemory.length > this.shortTermMemoryLimit) {
            this.shortTermMemory.shift();
        }

        // 保存到用户历史
        this.userProfile.conversationHistory.push({
            message: userMessage,
            response: aiResponse,
            timestamp: new Date(),
            emotion: analysis.emotion.primary
        });

        // 限制历史记录长度
        if (this.userProfile.conversationHistory.length > 50) {
            this.userProfile.conversationHistory.shift();
        }
    }

    // 初始化知识库（与原版相同）
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

    // 以下方法与原版相同或类似
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

    processResponse(response) {
        if (!response) return response;
        return response.replace(/{name}/g, this.aiName);
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
            autoScroll: this.autoScroll
        };
        localStorage.setItem('healingChatbotSettings', JSON.stringify(settings));

        // 保存用户档案
        const profile = {
            ...this.userProfile,
            interests: Array.from(this.conversationContext.userInterests),
            mentionedPreferences: Array.from(this.conversationContext.mentionedPreferences),
            conversationHistory: this.userProfile.conversationHistory
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
                // 保存当前对话上下文
                this.saveSettingsToStorage();

                // 重置对话状态（保留用户档案）
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
            <strong>超级智能AI聊天伙伴使用说明：</strong><br>
            1. 我使用先进的NLP技术分析你的消息（意图、情绪、实体）<br>
            2. 我能记住我们的对话内容和你的个人偏好<br>
            3. 我拥有丰富的知识库，可以回答各种问题<br>
            4. 我会根据上下文进行连贯的智能对话<br>
            5. 所有数据仅保存在你的设备中，保护隐私<br><br>
            <strong>试试对我说：</strong><br>
            • "我今天非常开心"（情绪识别）<br>
            • "什么是光合作用？"（知识问答）<br>
            • "工作压力大怎么办"（建议咨询）<br>
            • "我叫小明，今年25岁"（信息提取）<br><br>
            <strong>我会：</strong><br>
            • 准确分析你的情感和意图<br>
            • 在你难过时给予恰当安慰<br>
            • 在你开心时分享喜悦<br>
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
}

// 页面加载后初始化超级智能聊天机器人
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new SuperSmartHealingChatbot();
    window.chatbot = chatbot;
});