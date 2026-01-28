// 智能NLP模块 - 使用TensorFlow.js进行自然语言处理
class SmartNLPModule {
    constructor() {
        this.intentPatterns = this.initIntentPatterns();
        this.entityPatterns = this.initEntityPatterns();
        this.emotionModel = null;
        this.isTFLoaded = false;

        // 加载TensorFlow.js（如果可用）
        this.loadTensorFlow();
    }

    // 初始化意图识别模式
    initIntentPatterns() {
        return {
            greeting: ['你好', 'hi', 'hello', '嗨', '早上好', '晚上好', '午安'],
            farewell: ['再见', '拜拜', '下次聊', '晚安', 'bye', 'goodbye'],
            question: ['什么', '为什么', '怎么', '如何', '哪里', '谁', '何时', '多少', '哪些', '哪儿', '几时'],
            request: ['请', '能不能', '可以吗', '帮我', '需要', '想要', '希望'],
            emotion: ['开心', '高兴', '快乐', '难过', '伤心', '生气', '愤怒', '累', '疲惫', '担心', '焦虑', '心情', '情绪', '感受'],
            knowledge: ['知道', '了解', '解释', '说明', '科普', '知识', '信息'],
            advice: ['建议', '怎么办', '应该', '需要', '帮助', '解决', '方法', '技巧'],
            personal: ['我叫', '我是', '年龄', '住在', '来自', '工作', '职业', '爱好', '喜欢'],
            joke: ['笑话', '搞笑', '幽默', '逗笑', '讲个笑话', '说个笑话', '幽默一下'],
            encouragement: ['鼓励', '加油', '打气', '支持', '鼓励我', '需要鼓励', '给我力量', '鼓舞', '激励', '振作', '坚强', '勇敢']
        };
    }

    // 初始化实体提取模式
    initEntityPatterns() {
        return {
            name: [
                { pattern: /我叫(.{2,4})/, group: 1 },
                { pattern: /我是(.{2,4})/, group: 1 },
                { pattern: /name is (.{2,10})/i, group: 1 }
            ],
            age: [
                { pattern: /(\d{1,2})岁/, group: 1 },
                { pattern: /年龄(\d{1,2})/, group: 1 },
                { pattern: /今年(\d{1,2})/, group: 1 }
            ],
            location: [
                { pattern: /住在(.{2,10})/, group: 1 },
                { pattern: /在(.{2,10})/, group: 1 },
                { pattern: /来自(.{2,10})/, group: 1 }
            ],
            time: [
                { pattern: /今天/, value: 'today' },
                { pattern: /昨天/, value: 'yesterday' },
                { pattern: /明天/, value: 'tomorrow' },
                { pattern: /最近/, value: 'recently' }
            ],
            emotion: [
                { pattern: /非常开心/, value: 'extremely_happy' },
                { pattern: /很开心/, value: 'very_happy' },
                { pattern: /开心/, value: 'happy' },
                { pattern: /难过/, value: 'sad' },
                { pattern: /生气/, value: 'angry' },
                { pattern: /累/, value: 'tired' },
                { pattern: /担心/, value: 'anxious' }
            ]
        };
    }

    // 加载TensorFlow.js
    async loadTensorFlow() {
        try {
            // 尝试加载TensorFlow.js
            if (typeof tf !== 'undefined') {
                this.isTFLoaded = true;
                console.log('TensorFlow.js已加载');
                await this.initEmotionModel();
            } else {
                // 动态加载TensorFlow.js
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest';
                script.onload = async () => {
                    this.isTFLoaded = true;
                    console.log('TensorFlow.js加载成功');
                    await this.initEmotionModel();
                };
                script.onerror = () => {
                    console.warn('TensorFlow.js加载失败，使用备用NLP系统');
                };
                document.head.appendChild(script);
            }
        } catch (error) {
            console.warn('TensorFlow.js初始化失败:', error);
        }
    }

    // 初始化情感分析模型（简化版）
    async initEmotionModel() {
        if (!this.isTFLoaded) return;

        try {
            // 创建一个简单的神经网络模型进行情感分析
            this.emotionModel = tf.sequential();

            // 添加层
            this.emotionModel.add(tf.layers.dense({
                units: 16,
                activation: 'relu',
                inputShape: [10] // 假设有10个特征
            }));

            this.emotionModel.add(tf.layers.dense({
                units: 8,
                activation: 'relu'
            }));

            this.emotionModel.add(tf.layers.dense({
                units: 5, // 5种情绪：happy, sad, angry, tired, anxious
                activation: 'softmax'
            }));

            // 编译模型
            this.emotionModel.compile({
                optimizer: 'adam',
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });

            console.log('情感分析模型初始化完成');
        } catch (error) {
            console.warn('情感分析模型初始化失败:', error);
        }
    }

    // 分析消息的意图
    analyzeIntent(message) {
        const lowerMsg = message.toLowerCase();
        const detectedIntents = [];

        for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
            if (patterns.some(pattern => lowerMsg.includes(pattern))) {
                detectedIntents.push(intent);
            }
        }

        // 计算意图置信度
        const intentScores = {};
        detectedIntents.forEach(intent => {
            let score = 0.5; // 基础分

            // 某些意图有更高的基础分
            if (intent === 'encouragement') {
                score = 0.6; // 鼓励意图更高的基础分
            }

            const patterns = this.intentPatterns[intent];

            // 根据匹配的关键词数量增加分数
            patterns.forEach(pattern => {
                if (lowerMsg.includes(pattern)) {
                    score += 0.1;
                }
            });

            // 根据消息长度调整分数
            score = Math.min(score, 0.9);
            intentScores[intent] = score;
        });

        // 如果没有检测到意图，使用默认意图
        if (Object.keys(intentScores).length === 0) {
            intentScores['conversation'] = 0.3;
        }

        return intentScores;
    }

    // 提取实体
    extractEntities(message) {
        const entities = {
            name: null,
            age: null,
            location: null,
            time: [],
            emotion: [],
            numbers: [],
            topics: []
        };

        // 提取姓名
        for (const { pattern, group } of this.entityPatterns.name) {
            const match = message.match(pattern);
            if (match && match[group]) {
                entities.name = match[group].trim();
                break;
            }
        }

        // 提取年龄
        for (const { pattern, group } of this.entityPatterns.age) {
            const match = message.match(pattern);
            if (match && match[group]) {
                const age = parseInt(match[group]);
                if (!isNaN(age) && age > 0 && age < 120) {
                    entities.age = age;
                    break;
                }
            }
        }

        // 提取地点
        for (const { pattern, group } of this.entityPatterns.location) {
            const match = message.match(pattern);
            if (match && match[group]) {
                entities.location = match[group].trim();
                break;
            }
        }

        // 提取时间
        for (const { pattern, value } of this.entityPatterns.time) {
            if (pattern.test(message)) {
                entities.time.push(value);
            }
        }

        // 提取情绪
        for (const { pattern, value } of this.entityPatterns.emotion) {
            if (pattern.test(message)) {
                entities.emotion.push(value);
            }
        }

        // 提取数字
        const numberMatches = message.match(/\d+/g);
        if (numberMatches) {
            entities.numbers = numberMatches.map(num => parseInt(num));
        }

        // 提取话题（简单关键词匹配）
        const topicKeywords = {
            work: ['工作', '上班', '同事', '老板', '项目'],
            study: ['学习', '考试', '作业', '学校', '老师'],
            family: ['家人', '父母', '妈妈', '爸爸', '家庭'],
            friends: ['朋友', '闺蜜', '兄弟', '聚会'],
            hobby: ['爱好', '兴趣', '游戏', '运动', '音乐'],
            health: ['健康', '身体', '生病', '医院'],
            love: ['恋爱', '喜欢', '爱情', '男朋友', '女朋友']
        };

        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => message.includes(keyword))) {
                entities.topics.push(topic);
            }
        }

        return entities;
    }

    // 情感分析（使用机器学习或规则）
    async analyzeEmotion(message) {
        const lowerMsg = message.toLowerCase();

        // 如果TensorFlow.js可用，使用机器学习模型
        if (this.isTFLoaded && this.emotionModel) {
            try {
                // 将文本转换为特征向量（简化版）
                const features = this.textToFeatures(lowerMsg);
                const prediction = this.emotionModel.predict(tf.tensor2d([features]));
                const emotionProbs = await prediction.data();

                // 情绪标签
                const emotions = ['happy', 'sad', 'angry', 'tired', 'anxious'];
                const maxProbIndex = emotionProbs.indexOf(Math.max(...emotionProbs));

                return {
                    primary: emotions[maxProbIndex],
                    confidence: emotionProbs[maxProbIndex],
                    probabilities: emotions.reduce((obj, emotion, idx) => {
                        obj[emotion] = emotionProbs[idx];
                        return obj;
                    }, {})
                };
            } catch (error) {
                console.warn('机器学习情感分析失败，使用规则:', error);
            }
        }

        // 规则基础的情感分析（备用）
        return this.ruleBasedEmotionAnalysis(lowerMsg);
    }

    // 文本转特征向量（简化版）
    textToFeatures(text) {
        // 10个特征：长度、标点数量、情绪词数量等
        const features = new Array(10).fill(0);

        // 特征1：消息长度归一化
        features[0] = Math.min(text.length / 100, 1);

        // 特征2-6：情绪关键词计数
        const emotionWords = {
            happy: ['开心', '高兴', '快乐', '喜欢', '爱'],
            sad: ['难过', '伤心', '悲伤', '哭', '失望'],
            angry: ['生气', '愤怒', '恼火', '讨厌', '恨'],
            tired: ['累', '疲惫', '困', '疲倦', '辛苦'],
            anxious: ['担心', '焦虑', '紧张', '害怕', '不安']
        };

        Object.values(emotionWords).forEach((words, idx) => {
            const count = words.filter(word => text.includes(word)).length;
            features[1 + idx] = Math.min(count / 3, 1);
        });

        // 特征7：问号数量
        const questionMarks = (text.match(/\?/g) || []).length;
        features[6] = Math.min(questionMarks / 3, 1);

        // 特征8：感叹号数量
        const exclamations = (text.match(/!/g) || []).length;
        features[7] = Math.min(exclamations / 3, 1);

        // 特征9：否定词
        const negations = ['不', '没', '无', '非', '否'].filter(word => text.includes(word)).length;
        features[8] = Math.min(negations / 3, 1);

        // 特征10：积极词比例
        const positiveWords = ['好', '棒', '优秀', '完美', '成功', '胜利'];
        const negativeWords = ['坏', '差', '糟糕', '失败', '错误', '问题'];
        const posCount = positiveWords.filter(word => text.includes(word)).length;
        const negCount = negativeWords.filter(word => text.includes(word)).length;
        features[9] = posCount > negCount ? 0.8 : (posCount < negCount ? 0.2 : 0.5);

        return features;
    }

    // 规则基础的情感分析
    ruleBasedEmotionAnalysis(text) {
        const emotionScores = {
            happy: 0,
            sad: 0,
            angry: 0,
            tired: 0,
            anxious: 0
        };

        // 情绪关键词
        const emotionKeywords = {
            happy: ['开心', '高兴', '快乐', '幸福', '兴奋', '喜欢', '爱', '棒', '好'],
            sad: ['难过', '伤心', '悲伤', '哭', '流泪', '失望', '失落', '忧郁'],
            angry: ['生气', '愤怒', '恼火', '烦躁', '讨厌', '恨', '烦'],
            tired: ['累', '疲惫', '困', '疲倦', '辛苦', '忙', '压力'],
            anxious: ['担心', '焦虑', '紧张', '害怕', '恐惧', '不安']
        };

        // 计算每个情绪的分数
        for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
            keywords.forEach(keyword => {
                if (text.includes(keyword)) {
                    emotionScores[emotion] += 1;

                    // 加强词
                    if (text.includes('非常' + keyword) || text.includes('特别' + keyword)) {
                        emotionScores[emotion] += 2;
                    }
                }
            });
        }

        // 找到最高分的情绪
        let maxEmotion = 'neutral';
        let maxScore = 0;

        for (const [emotion, score] of Object.entries(emotionScores)) {
            if (score > maxScore) {
                maxScore = score;
                maxEmotion = emotion;
            }
        }

        // 如果没有检测到情绪，返回neutral
        if (maxScore === 0) {
            return {
                primary: 'neutral',
                confidence: 0.3,
                probabilities: {
                    happy: 0.2,
                    sad: 0.2,
                    angry: 0.2,
                    tired: 0.2,
                    anxious: 0.2
                }
            };
        }

        // 计算置信度
        const totalScore = Object.values(emotionScores).reduce((a, b) => a + b, 0);
        const confidence = maxScore / totalScore;

        // 计算概率
        const probabilities = {};
        for (const [emotion, score] of Object.entries(emotionScores)) {
            probabilities[emotion] = score / totalScore;
        }

        return {
            primary: maxEmotion,
            confidence: confidence,
            probabilities: probabilities
        };
    }

    // 语义相似度计算（简化版）
    calculateSimilarity(text1, text2) {
        // 简单的Jaccard相似度
        const words1 = new Set(text1.toLowerCase().split(/\s+/));
        const words2 = new Set(text2.toLowerCase().split(/\s+/));

        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);

        return intersection.size / union.size;
    }

    // 提取关键词
    extractKeywords(text, maxKeywords = 5) {
        const words = text.toLowerCase().split(/\s+/);
        const stopWords = new Set(['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这']);

        const wordFreq = {};
        words.forEach(word => {
            if (word.length > 1 && !stopWords.has(word)) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });

        // 按频率排序
        const sortedWords = Object.entries(wordFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, maxKeywords)
            .map(([word]) => word);

        return sortedWords;
    }

    // 综合分析
    async analyzeMessage(message) {
        const intentScores = this.analyzeIntent(message);
        const entities = this.extractEntities(message);
        const emotion = await this.analyzeEmotion(message);
        const keywords = this.extractKeywords(message);

        return {
            intent: intentScores,
            entities: entities,
            emotion: emotion,
            keywords: keywords,
            timestamp: new Date(),
            messageLength: message.length,
            hasQuestion: message.includes('?') || message.includes('？'),
            hasExclamation: message.includes('!') || message.includes('！')
        };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartNLPModule;
}