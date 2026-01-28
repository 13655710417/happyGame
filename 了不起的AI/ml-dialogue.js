// 机器学习对话生成模块
class MLDialogueGenerator {
    constructor() {
        this.model = null;
        this.vocabulary = new Map();
        this.reverseVocabulary = new Map();
        this.maxSequenceLength = 20;
        this.isTFLoaded = false;
        this.isModelTrained = false;

        // 初始化基础词汇表
        this.initVocabulary();

        // 加载TensorFlow.js
        this.loadTensorFlow();
    }

    // 初始化基础词汇表
    initVocabulary() {
        const baseWords = [
            // 常用词
            '我', '你', '他', '她', '它', '我们', '你们', '他们',
            '是', '的', '了', '在', '有', '和', '就', '不', '人',
            '都', '一', '上', '也', '很', '到', '说', '要', '去',
            '会', '着', '没有', '看', '好', '自己', '这',

            // 情绪词
            '开心', '高兴', '快乐', '难过', '伤心', '生气', '愤怒',
            '累', '疲惫', '担心', '焦虑', '紧张', '害怕',

            // 话题词
            '工作', '学习', '家人', '朋友', '爱好', '健康', '感情',
            '今天', '昨天', '明天', '最近',

            // 功能词
            '什么', '为什么', '怎么', '如何', '哪里', '谁', '何时',
            '建议', '帮助', '需要', '应该', '可以', '可能',

            // 标点
            '。', '，', '！', '？', '、'
        ];

        baseWords.forEach((word, index) => {
            this.vocabulary.set(word, index);
            this.reverseVocabulary.set(index, word);
        });

        // 添加特殊标记
        this.vocabulary.set('<PAD>', this.vocabulary.size);
        this.reverseVocabulary.set(this.vocabulary.size - 1, '<PAD>');

        this.vocabulary.set('<START>', this.vocabulary.size);
        this.reverseVocabulary.set(this.vocabulary.size - 1, '<START>');

        this.vocabulary.set('<END>', this.vocabulary.size);
        this.reverseVocabulary.set(this.vocabulary.size - 1, '<END>');

        this.vocabulary.set('<UNK>', this.vocabulary.size);
        this.reverseVocabulary.set(this.vocabulary.size - 1, '<UNK>');
    }

    // 加载TensorFlow.js
    async loadTensorFlow() {
        try {
            if (typeof tf !== 'undefined') {
                this.isTFLoaded = true;
                console.log('TensorFlow.js已加载，准备初始化模型');
                await this.initModel();
            } else {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest';
                script.onload = async () => {
                    this.isTFLoaded = true;
                    console.log('TensorFlow.js加载成功');
                    await this.initModel();
                };
                script.onerror = () => {
                    console.warn('TensorFlow.js加载失败，使用规则生成');
                };
                document.head.appendChild(script);
            }
        } catch (error) {
            console.warn('TensorFlow.js初始化失败:', error);
        }
    }

    // 初始化模型
    async initModel() {
        if (!this.isTFLoaded) return;

        try {
            // 创建一个简单的序列到序列模型
            this.model = tf.sequential();

            // 编码器
            this.model.add(tf.layers.embedding({
                inputDim: this.vocabulary.size,
                outputDim: 32,
                inputLength: this.maxSequenceLength
            }));

            this.model.add(tf.layers.lstm({
                units: 64,
                returnSequences: true
            }));

            this.model.add(tf.layers.lstm({
                units: 64
            }));

            // 解码器
            this.model.add(tf.layers.repeatVector({
                n: this.maxSequenceLength
            }));

            this.model.add(tf.layers.lstm({
                units: 64,
                returnSequences: true
            }));

            this.model.add(tf.layers.lstm({
                units: 64,
                returnSequences: true
            }));

            this.model.add(tf.layers.timeDistributed({
                layer: tf.layers.dense({
                    units: this.vocabulary.size,
                    activation: 'softmax'
                })
            }));

            // 编译模型
            this.model.compile({
                optimizer: 'adam',
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });

            console.log('对话生成模型初始化完成');

            // 尝试加载预训练权重（如果有）
            await this.loadPretrainedWeights();

        } catch (error) {
            console.warn('模型初始化失败:', error);
            this.model = null;
        }
    }

    // 尝试加载预训练权重
    async loadPretrainedWeights() {
        try {
            // 检查本地存储中是否有保存的模型权重
            const savedWeights = localStorage.getItem('mlDialogueWeights');
            if (savedWeights) {
                const weights = JSON.parse(savedWeights);
                const weightTensors = weights.map(w => tf.tensor(w.data, w.shape));
                this.model.setWeights(weightTensors);
                this.isModelTrained = true;
                console.log('预训练权重加载成功');

                // 清理临时张量
                weightTensors.forEach(t => t.dispose());
            }
        } catch (error) {
            console.warn('加载预训练权重失败:', error);
        }
    }

    // 保存模型权重
    async saveModelWeights() {
        if (!this.model || !this.isTFLoaded) return;

        try {
            const weights = this.model.getWeights();
            const weightData = weights.map(w => ({
                data: Array.from(w.dataSync()),
                shape: w.shape
            }));

            localStorage.setItem('mlDialogueWeights', JSON.stringify(weightData));
            console.log('模型权重保存成功');

            // 清理临时张量
            weights.forEach(w => w.dispose());
        } catch (error) {
            console.warn('保存模型权重失败:', error);
        }
    }

    // 文本转序列
    textToSequence(text) {
        const words = this.tokenizeChinese(text);
        const sequence = [];

        for (const word of words) {
            if (this.vocabulary.has(word)) {
                sequence.push(this.vocabulary.get(word));
            } else {
                // 新词，添加到词汇表
                const newIndex = this.vocabulary.size;
                this.vocabulary.set(word, newIndex);
                this.reverseVocabulary.set(newIndex, word);
                sequence.push(newIndex);
            }
        }

        // 添加开始和结束标记
        sequence.unshift(this.vocabulary.get('<START>'));
        sequence.push(this.vocabulary.get('<END>'));

        // 填充或截断到固定长度
        return this.padSequence(sequence);
    }

    // 序列转文本
    sequenceToText(sequence) {
        // 移除填充和特殊标记
        const filtered = sequence
            .filter(idx => idx !== this.vocabulary.get('<PAD>') &&
                          idx !== this.vocabulary.get('<START>') &&
                          idx !== this.vocabulary.get('<END>'))
            .map(idx => this.reverseVocabulary.get(idx) || '<UNK>');

        return filtered.join('');
    }

    // 中文分词（简化版）
    tokenizeChinese(text) {
        // 简单的基于字符的分词，可以替换为更复杂的分词器
        return text.split('').filter(char => char.trim() !== '');
    }

    // 填充序列
    padSequence(sequence) {
        if (sequence.length > this.maxSequenceLength) {
            return sequence.slice(0, this.maxSequenceLength);
        }

        const padded = [...sequence];
        while (padded.length < this.maxSequenceLength) {
            padded.push(this.vocabulary.get('<PAD>'));
        }

        return padded;
    }

    // 训练模型（在线学习）
    async trainOnExample(inputText, outputText) {
        if (!this.model || !this.isTFLoaded) return false;

        try {
            const inputSeq = this.textToSequence(inputText);
            const outputSeq = this.textToSequence(outputText);

            // 准备训练数据
            const x = tf.tensor2d([inputSeq]);
            const y = tf.tensor3d([this.oneHotEncode(outputSeq)]);

            // 训练一个epoch
            await this.model.fit(x, y, {
                epochs: 1,
                batchSize: 1,
                verbose: 0
            });

            this.isModelTrained = true;

            // 保存更新后的权重
            await this.saveModelWeights();

            // 清理张量
            x.dispose();
            y.dispose();

            console.log('模型训练完成（单样本）');
            return true;
        } catch (error) {
            console.warn('训练失败:', error);
            return false;
        }
    }

    // One-hot编码
    oneHotEncode(sequence) {
        const encoded = [];
        for (let i = 0; i < sequence.length; i++) {
            const oneHot = new Array(this.vocabulary.size).fill(0);
            oneHot[sequence[i]] = 1;
            encoded.push(oneHot);
        }
        return encoded;
    }

    // 生成回复
    async generateResponse(inputText, context = {}) {
        // 如果模型未训练或不可用，使用规则生成
        if (!this.model || !this.isModelTrained || !this.isTFLoaded) {
            return this.ruleBasedGeneration(inputText, context);
        }

        try {
            const inputSeq = this.textToSequence(inputText);
            const x = tf.tensor2d([inputSeq]);

            // 生成预测
            const prediction = this.model.predict(x);
            const predData = await prediction.data();

            // 将预测转换为序列
            const sequence = [];
            const vocabSize = this.vocabulary.size;

            for (let i = 0; i < this.maxSequenceLength; i++) {
                const startIdx = i * vocabSize;
                const endIdx = startIdx + vocabSize;
                const probs = Array.from(predData.slice(startIdx, endIdx));

                // 使用温度采样
                const temperature = 0.7;
                const scaledProbs = this.applyTemperature(probs, temperature);
                const sampledIdx = this.sampleFromDistribution(scaledProbs);

                sequence.push(sampledIdx);

                // 如果遇到结束标记，停止生成
                if (sampledIdx === this.vocabulary.get('<END>')) {
                    break;
                }
            }

            // 转换为文本
            let generatedText = this.sequenceToText(sequence);

            // 清理张量
            x.dispose();
            prediction.dispose();

            // 后处理：确保文本合理
            generatedText = this.postProcessText(generatedText, context);

            return generatedText;

        } catch (error) {
            console.warn('机器学习生成失败，使用规则:', error);
            return this.ruleBasedGeneration(inputText, context);
        }
    }

    // 应用温度采样
    applyTemperature(probs, temperature) {
        const scaled = probs.map(p => Math.exp(Math.log(p) / temperature));
        const sum = scaled.reduce((a, b) => a + b, 0);
        return scaled.map(p => p / sum);
    }

    // 从分布中采样
    sampleFromDistribution(probs) {
        const random = Math.random();
        let cumulative = 0;

        for (let i = 0; i < probs.length; i++) {
            cumulative += probs[i];
            if (random <= cumulative) {
                return i;
            }
        }

        return probs.length - 1;
    }

    // 后处理文本
    postProcessText(text, context) {
        // 移除重复标点
        text = text.replace(/[。，！？]{2,}/g, match => match[0]);

        // 确保以标点结束
        if (!/[。！？]$/.test(text)) {
            text += '。';
        }

        // 根据上下文添加个性化
        if (context.userName && text.includes('你')) {
            text = text.replace(/你/g, context.userName);
        }

        // 添加表情符号（根据情绪）
        if (context.emotion) {
            const emotionEmojis = {
                happy: '😊',
                sad: '🤗',
                angry: '😤',
                tired: '😴',
                anxious: '🤔'
            };

            if (emotionEmojis[context.emotion] && text.length < 30) {
                text += ' ' + emotionEmojis[context.emotion];
            }
        }

        return text;
    }

    // 规则基础的生成（备用）
    ruleBasedGeneration(inputText, context) {
        const lowerInput = inputText.toLowerCase();

        // 根据关键词生成回复
        const responseTemplates = {
            greeting: [
                "你好！今天过得怎么样？🌸",
                "嗨～很高兴见到你！✨",
                "你好呀！有什么想聊的吗？💕"
            ],
            farewell: [
                "再见啦～期待下次聊天！🌟",
                "拜拜！记得照顾好自己哦～🌸",
                "晚安，愿你有个好梦！🌙"
            ],
            question: [
                "这个问题很有趣呢！🤔",
                "让我想想怎么回答你...💭",
                "这是个好问题！✨"
            ],
            emotion: {
                happy: [
                    "看到你开心，我也感到快乐！😊",
                    "真为你感到高兴！🎉",
                    "快乐是会传染的，谢谢你分享这份喜悦！💖"
                ],
                sad: [
                    "抱抱你～我在这里陪着你。🫂",
                    "难过的时候，有人倾诉会好一些。💕",
                    "我理解你的感受。🌸"
                ],
                angry: [
                    "深呼吸～让情绪慢慢平静下来。🕊️",
                    "我在这里倾听你。👂",
                    "情绪需要出口，说出来会感觉好一些。💭"
                ]
            },
            default: [
                "我在这里认真倾听你呢。💕",
                "谢谢你的分享！✨",
                "无论你想说什么，我都会用心回应。🌸"
            ]
        };

        // 检测意图
        let templateType = 'default';

        if (lowerInput.includes('你好') || lowerInput.includes('hi') || lowerInput.includes('hello')) {
            templateType = 'greeting';
        } else if (lowerInput.includes('再见') || lowerInput.includes('拜拜') || lowerInput.includes('bye')) {
            templateType = 'farewell';
        } else if (lowerInput.includes('什么') || lowerInput.includes('为什么') || lowerInput.includes('怎么')) {
            templateType = 'question';
        } else if (context.emotion && responseTemplates.emotion[context.emotion]) {
            templateType = 'emotion';
        }

        // 选择回复
        let responses;
        if (templateType === 'emotion') {
            responses = responseTemplates.emotion[context.emotion];
        } else {
            responses = responseTemplates[templateType] || responseTemplates.default;
        }

        // 随机选择
        const response = responses[Math.floor(Math.random() * responses.length)];

        // 个性化
        let finalResponse = response;
        if (context.userName && response.includes('你')) {
            finalResponse = response.replace(/你/g, context.userName);
        }

        return finalResponse;
    }

    // 批量训练（使用对话历史）
    async trainOnHistory(conversationHistory) {
        if (!this.model || !this.isTFLoaded || conversationHistory.length < 2) {
            return false;
        }

        try {
            console.log(`开始批量训练，样本数: ${conversationHistory.length - 1}`);

            // 准备训练数据
            const inputs = [];
            const outputs = [];

            for (let i = 0; i < conversationHistory.length - 1; i++) {
                if (conversationHistory[i].type === 'user' &&
                    conversationHistory[i + 1].type === 'ai') {

                    const inputSeq = this.textToSequence(conversationHistory[i].text);
                    const outputSeq = this.textToSequence(conversationHistory[i + 1].text);

                    inputs.push(inputSeq);
                    outputs.push(this.oneHotEncode(outputSeq));
                }
            }

            if (inputs.length === 0) {
                console.log('没有足够的训练样本');
                return false;
            }

            // 转换为张量
            const x = tf.tensor2d(inputs);
            const y = tf.tensor3d(outputs);

            // 训练
            await this.model.fit(x, y, {
                epochs: 10,
                batchSize: Math.min(4, inputs.length),
                verbose: 0,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        console.log(`训练周期 ${epoch + 1}, 损失: ${logs.loss.toFixed(4)}`);
                    }
                }
            });

            this.isModelTrained = true;

            // 保存权重
            await this.saveModelWeights();

            // 清理张量
            x.dispose();
            y.dispose();

            console.log('批量训练完成');
            return true;

        } catch (error) {
            console.warn('批量训练失败:', error);
            return false;
        }
    }

    // 获取模型状态
    getModelStatus() {
        return {
            isTFLoaded: this.isTFLoaded,
            isModelTrained: this.isModelTrained,
            vocabularySize: this.vocabulary.size,
            hasModel: !!this.model
        };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MLDialogueGenerator;
}