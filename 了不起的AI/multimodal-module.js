// 多模态交互模块
class MultimodalModule {
    constructor() {
        this.speechRecognition = null;
        this.speechSynthesis = null;
        this.isListening = false;
        this.isSpeaking = false;
        this.audioContext = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.supportedFormats = this.checkSupport();

        // 语音识别配置
        this.recognitionConfig = {
            lang: 'zh-CN',
            continuous: false,
            interimResults: true,
            maxAlternatives: 1
        };

        // 语音合成配置
        this.synthesisConfig = {
            lang: 'zh-CN',
            pitch: 1,
            rate: 1,
            volume: 1,
            voice: null
        };

        // 初始化
        this.initSpeechRecognition();
        this.initSpeechSynthesis();
    }

    // 检查浏览器支持
    checkSupport() {
        const supports = {
            speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
            speechSynthesis: 'speechSynthesis' in window,
            getUserMedia: 'getUserMedia' in navigator.mediaDevices || 'webkitGetUserMedia' in navigator.mediaDevices,
            audioContext: 'AudioContext' in window || 'webkitAudioContext' in window
        };

        console.log('多模态支持检查:', supports);
        return supports;
    }

    // 初始化语音识别
    initSpeechRecognition() {
        if (!this.supportedFormats.speechRecognition) {
            console.warn('浏览器不支持语音识别');
            return;
        }

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.speechRecognition = new SpeechRecognition();

            // 配置识别器
            this.speechRecognition.lang = this.recognitionConfig.lang;
            this.speechRecognition.continuous = this.recognitionConfig.continuous;
            this.speechRecognition.interimResults = this.recognitionConfig.interimResults;
            this.speechRecognition.maxAlternatives = this.recognitionConfig.maxAlternatives;

            // 设置事件处理器
            this.speechRecognition.onstart = () => {
                this.isListening = true;
                this.onListeningStart?.();
            };

            this.speechRecognition.onresult = (event) => {
                const result = event.results[event.resultIndex];
                const transcript = result[0].transcript;

                if (result.isFinal) {
                    this.isListening = false;
                    this.onSpeechRecognized?.(transcript);
                } else {
                    this.onInterimResult?.(transcript);
                }
            };

            this.speechRecognition.onerror = (event) => {
                this.isListening = false;
                console.error('语音识别错误:', event.error);
                this.onError?.(event.error);
            };

            this.speechRecognition.onend = () => {
                this.isListening = false;
                this.onListeningEnd?.();
            };

            console.log('语音识别初始化成功');

        } catch (error) {
            console.error('语音识别初始化失败:', error);
        }
    }

    // 初始化语音合成
    initSpeechSynthesis() {
        if (!this.supportedFormats.speechSynthesis) {
            console.warn('浏览器不支持语音合成');
            return;
        }

        this.speechSynthesis = window.speechSynthesis;

        // 加载可用语音
        this.loadAvailableVoices();

        // 监听语音列表变化
        this.speechSynthesis.onvoiceschanged = () => {
            this.loadAvailableVoices();
        };

        console.log('语音合成初始化成功');
    }

    // 加载可用语音
    loadAvailableVoices() {
        if (!this.speechSynthesis) return;

        const voices = this.speechSynthesis.getVoices();
        const chineseVoices = voices.filter(voice => voice.lang.includes('zh') || voice.lang.includes('CN'));

        if (chineseVoices.length > 0) {
            // 优先选择中文语音
            this.synthesisConfig.voice = chineseVoices[0];
            console.log('找到中文语音:', chineseVoices[0].name);
        } else if (voices.length > 0) {
            // 如果没有中文语音，使用第一个可用语音
            this.synthesisConfig.voice = voices[0];
            console.log('使用默认语音:', voices[0].name);
        }

        this.availableVoices = voices;
    }

    // 开始语音识别
    startListening() {
        if (!this.speechRecognition || this.isListening) return false;

        try {
            this.speechRecognition.start();
            return true;
        } catch (error) {
            console.error('开始语音识别失败:', error);
            return false;
        }
    }

    // 停止语音识别
    stopListening() {
        if (!this.speechRecognition || !this.isListening) return;

        try {
            this.speechRecognition.stop();
        } catch (error) {
            console.error('停止语音识别失败:', error);
        }
    }

    // 语音合成
    speak(text, options = {}) {
        if (!this.speechSynthesis || this.isSpeaking) return false;

        // 停止当前语音
        this.stopSpeaking();

        try {
            const utterance = new SpeechSynthesisUtterance(text);

            // 配置语音
            utterance.lang = options.lang || this.synthesisConfig.lang;
            utterance.pitch = options.pitch || this.synthesisConfig.pitch;
            utterance.rate = options.rate || this.synthesisConfig.rate;
            utterance.volume = options.volume || this.synthesisConfig.volume;
            utterance.voice = options.voice || this.synthesisConfig.voice;

            // 设置事件处理器
            utterance.onstart = () => {
                this.isSpeaking = true;
                this.onSpeakingStart?.(text);
            };

            utterance.onend = () => {
                this.isSpeaking = false;
                this.onSpeakingEnd?.(text);
            };

            utterance.onerror = (event) => {
                this.isSpeaking = false;
                console.error('语音合成错误:', event.error);
                this.onError?.(event.error);
            };

            // 开始语音合成
            this.speechSynthesis.speak(utterance);
            return true;

        } catch (error) {
            console.error('语音合成失败:', error);
            return false;
        }
    }

    // 停止语音合成
    stopSpeaking() {
        if (!this.speechSynthesis) return;

        try {
            this.speechSynthesis.cancel();
            this.isSpeaking = false;
        } catch (error) {
            console.error('停止语音合成失败:', error);
        }
    }

    // 切换语音输入
    toggleVoiceInput() {
        if (this.isListening) {
            this.stopListening();
            return false;
        } else {
            return this.startListening();
        }
    }

    // 获取语音输入状态
    getVoiceInputStatus() {
        return {
            isListening: this.isListening,
            isSupported: this.supportedFormats.speechRecognition,
            isAvailable: !!this.speechRecognition
        };
    }

    // 获取语音输出状态
    getVoiceOutputStatus() {
        return {
            isSpeaking: this.isSpeaking,
            isSupported: this.supportedFormats.speechSynthesis,
            isAvailable: !!this.speechSynthesis,
            availableVoices: this.availableVoices?.length || 0,
            currentVoice: this.synthesisConfig.voice?.name
        };
    }

    // 初始化音频上下文（用于音频处理）
    initAudioContext() {
        if (!this.supportedFormats.audioContext) {
            console.warn('浏览器不支持AudioContext');
            return false;
        }

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            console.log('AudioContext初始化成功');
            return true;
        } catch (error) {
            console.error('AudioContext初始化失败:', error);
            return false;
        }
    }

    // 开始录音
    async startRecording() {
        if (!this.supportedFormats.getUserMedia) {
            console.warn('浏览器不支持录音');
            return false;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.onRecordingComplete?.(audioBlob);

                // 停止所有轨道
                stream.getTracks().forEach(track => track.stop());
            };

            this.mediaRecorder.start();
            this.onRecordingStart?.();
            return true;

        } catch (error) {
            console.error('开始录音失败:', error);
            this.onError?.(error);
            return false;
        }
    }

    // 停止录音
    stopRecording() {
        if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') return;

        this.mediaRecorder.stop();
    }

    // 播放音频
    playAudio(audioBlob) {
        if (!this.audioContext) {
            this.initAudioContext();
        }

        if (!this.audioContext) return false;

        try {
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            audio.onplay = () => {
                this.onAudioPlay?.();
            };

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                this.onAudioEnd?.();
            };

            audio.onerror = (error) => {
                console.error('播放音频失败:', error);
                this.onError?.(error);
            };

            audio.play();
            return true;

        } catch (error) {
            console.error('播放音频失败:', error);
            return false;
        }
    }

    // 分析音频情绪（简化版）
    analyzeAudioEmotion(audioBlob) {
        // 这是一个简化版本，实际实现需要音频分析库
        // 这里返回模拟数据
        return new Promise((resolve) => {
            setTimeout(() => {
                const emotions = ['happy', 'sad', 'angry', 'neutral'];
                const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];

                resolve({
                    emotion: randomEmotion,
                    confidence: Math.random() * 0.5 + 0.5, // 0.5-1.0
                    features: {
                        pitch: Math.random() * 100 + 100, // 模拟音高
                        intensity: Math.random() * 50 + 50, // 模拟强度
                        duration: Math.random() * 3000 + 1000 // 模拟时长
                    }
                });
            }, 1000);
        });
    }

    // 文本转语音（带情感）
    speakWithEmotion(text, emotion = 'neutral') {
        const emotionConfigs = {
            happy: { rate: 1.2, pitch: 1.1, volume: 1.0 },
            sad: { rate: 0.8, pitch: 0.9, volume: 0.9 },
            angry: { rate: 1.1, pitch: 1.2, volume: 1.1 },
            excited: { rate: 1.3, pitch: 1.3, volume: 1.2 },
            calm: { rate: 0.9, pitch: 1.0, volume: 0.8 },
            neutral: { rate: 1.0, pitch: 1.0, volume: 1.0 }
        };

        const config = emotionConfigs[emotion] || emotionConfigs.neutral;
        return this.speak(text, config);
    }

    // 处理表情符号
    processEmoji(text) {
        const emojiMap = {
            // 正面情绪
            '开心': '😊', '高兴': '😄', '快乐': '😁', '喜欢': '❤️', '爱': '💖',
            '笑': '😂', '微笑': '🙂', '大笑': '🤣', '满意': '😌', '幸福': '🥰',

            // 负面情绪
            '难过': '😢', '伤心': '😭', '哭': '😥', '失望': '😞', '忧郁': '😔',
            '生气': '😠', '愤怒': '😡', '恼火': '🤬', '烦躁': '😤', '讨厌': '😒',

            // 中性/其他
            '累': '😴', '困': '🥱', '疲惫': '😫', '压力': '😰', '担心': '😟',
            '惊讶': '😲', '疑问': '🤔', '思考': '💭', '明白': '💡', '好的': '👌',

            // 动作
            '谢谢': '🙏', '抱歉': '😔', '加油': '💪', '成功': '🎉', '庆祝': '🥳',
            '睡觉': '😴', '工作': '💼', '学习': '📚', '吃饭': '🍽️', '运动': '🏃‍♀️',

            // 自然
            '太阳': '☀️', '月亮': '🌙', '星星': '✨', '花': '🌸', '树': '🌳',
            '雨': '🌧️', '雪': '❄️', '彩虹': '🌈', '云': '☁️', '风': '💨'
        };

        let processed = text;
        Object.entries(emojiMap).forEach(([word, emoji]) => {
            const regex = new RegExp(`(${word})`, 'g');
            processed = processed.replace(regex, `$1${emoji}`);
        });

        return processed;
    }

    // 提取文本中的表情符号
    extractEmojis(text) {
        const emojiRegex = /[\p{Emoji}]/gu;
        const emojis = text.match(emojiRegex) || [];
        return [...new Set(emojis)]; // 去重
    }

    // 根据表情符号推断情绪
    inferEmotionFromEmojis(emojis) {
        const emojiEmotionMap = {
            '😊': 'happy', '😄': 'happy', '😁': 'happy', '😂': 'happy',
            '😢': 'sad', '😭': 'sad', '😔': 'sad', '😞': 'sad',
            '😠': 'angry', '😡': 'angry', '🤬': 'angry', '😤': 'angry',
            '😴': 'tired', '🥱': 'tired', '😫': 'tired',
            '😰': 'anxious', '😟': 'anxious', '😨': 'anxious'
        };

        const emotionCounts = {};
        emojis.forEach(emoji => {
            const emotion = emojiEmotionMap[emoji];
            if (emotion) {
                emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
            }
        });

        if (Object.keys(emotionCounts).length === 0) {
            return 'neutral';
        }

        // 找到出现最多的情绪
        return Object.entries(emotionCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }

    // 生成表情符号建议
    generateEmojiSuggestions(text, emotion = null) {
        const suggestions = {
            happy: ['😊', '😄', '😂', '🎉', '✨', '💖'],
            sad: ['😢', '😭', '🤗', '💕', '🌸', '🌈'],
            angry: ['😠', '😤', '🕊️', '🌿', '💭', '👂'],
            tired: ['😴', '🥱', '💫', '☕', '🎵', '🛀'],
            anxious: ['😰', '😟', '🤔', '📝', '🌙', '🧘‍♀️'],
            neutral: ['🙂', '💭', '✨', '🌸', '💕', '🌟']
        };

        const emotionToUse = emotion || this.inferEmotionFromText(text);
        return suggestions[emotionToUse] || suggestions.neutral;
    }

    // 从文本推断情绪（简化版）
    inferEmotionFromText(text) {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('开心') || lowerText.includes('高兴') || lowerText.includes('快乐')) {
            return 'happy';
        } else if (lowerText.includes('难过') || lowerText.includes('伤心') || lowerText.includes('哭')) {
            return 'sad';
        } else if (lowerText.includes('生气') || lowerText.includes('愤怒') || lowerText.includes('恼火')) {
            return 'angry';
        } else if (lowerText.includes('累') || lowerText.includes('疲惫') || lowerText.includes('困')) {
            return 'tired';
        } else if (lowerText.includes('担心') || lowerText.includes('焦虑') || lowerText.includes('紧张')) {
            return 'anxious';
        }

        return 'neutral';
    }

    // 创建表情选择器HTML
    createEmojiPickerHTML(emojis, onClickCallback) {
        const container = document.createElement('div');
        container.className = 'emoji-picker';
        container.style.cssText = `
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 10px;
            padding: 15px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            max-width: 300px;
            max-height: 200px;
            overflow-y: auto;
        `;

        emojis.forEach(emoji => {
            const button = document.createElement('button');
            button.textContent = emoji;
            button.style.cssText = `
                font-size: 1.5rem;
                background: none;
                border: none;
                cursor: pointer;
                padding: 5px;
                border-radius: 8px;
                transition: all 0.2s ease;
            `;

            button.onmouseover = () => {
                button.style.background = '#f0f0f0';
                button.style.transform = 'scale(1.2)';
            };

            button.onmouseout = () => {
                button.style.background = 'none';
                button.style.transform = 'scale(1)';
            };

            button.onclick = () => {
                onClickCallback(emoji);
            };

            container.appendChild(button);
        });

        return container;
    }

    // 获取模块状态
    getModuleStatus() {
        return {
            speechRecognition: this.getVoiceInputStatus(),
            speechSynthesis: this.getVoiceOutputStatus(),
            audioRecording: {
                isSupported: this.supportedFormats.getUserMedia,
                isRecording: !!this.mediaRecorder?.state === 'recording'
            },
            audioPlayback: {
                isSupported: this.supportedFormats.audioContext,
                hasContext: !!this.audioContext
            },
            emojiProcessing: {
                supported: true,
                lastProcessed: null
            }
        };
    }

    // 设置事件回调
    setCallbacks(callbacks) {
        if (callbacks.onListeningStart) this.onListeningStart = callbacks.onListeningStart;
        if (callbacks.onListeningEnd) this.onListeningEnd = callbacks.onListeningEnd;
        if (callbacks.onSpeechRecognized) this.onSpeechRecognized = callbacks.onSpeechRecognized;
        if (callbacks.onInterimResult) this.onInterimResult = callbacks.onInterimResult;
        if (callbacks.onSpeakingStart) this.onSpeakingStart = callbacks.onSpeakingStart;
        if (callbacks.onSpeakingEnd) this.onSpeakingEnd = callbacks.onSpeakingEnd;
        if (callbacks.onRecordingStart) this.onRecordingStart = callbacks.onRecordingStart;
        if (callbacks.onRecordingComplete) this.onRecordingComplete = callbacks.onRecordingComplete;
        if (callbacks.onAudioPlay) this.onAudioPlay = callbacks.onAudioPlay;
        if (callbacks.onAudioEnd) this.onAudioEnd = callbacks.onAudioEnd;
        if (callbacks.onError) this.onError = callbacks.onError;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultimodalModule;
}