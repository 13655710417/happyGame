// 游戏状态和配置
const GameState = {
    stories: [
        {
            id: 1,
            fragment: "一个男人走进一家酒吧，点了一杯水。酒保看了他一眼，然后从柜台下拿出一把枪。男人说了声'谢谢'就走了出去。",
            fullStory: "这个男人一直打嗝，他听说突然的惊吓可以治愈打嗝。他走进酒吧点了一杯水，希望酒保会做点什么来吓唬他。酒保明白了他的意图，从柜台下拿出一把枪指向他。男人被吓到，打嗝停止了，于是他说了声'谢谢'就走了出去。",
            keywords: ["打嗝", "惊吓", "治愈", "枪", "意图", "明白", "健康", "问题", "疾病", "生病", "治疗", "吓唬", "害怕", "恐怖", "手枪", "武器", "帮助", "协助", "目的", "原因", "动机", "为什么", "水", "喝水", "口渴", "酒吧", "酒馆"],
            questions: [
                { question: "这个男人认识酒保吗？", answer: "否" },
                { question: "这个男人有什么健康问题吗？", answer: "是" },
                { question: "酒保想伤害这个男人吗？", answer: "否" },
                { question: "这把枪是真的吗？", answer: "与此无关" },
                { question: "这个男人点水是为了喝吗？", answer: "否" },
                { question: "酒保拿出枪是为了吓唬这个男人吗？", answer: "是" },
                { question: "这个男人离开是因为害怕吗？", answer: "否" },
                { question: "这个男人打嗝吗？", answer: "是" }
            ]
        },
        {
            id: 2,
            fragment: "一个女人在沙漠中发现了一瓶水。她打开瓶子喝了一口，然后立刻把水倒掉了。",
            fullStory: "这个女人在沙漠中迷路了，她发现了一瓶水。但当她打开瓶子时，闻到水里有奇怪的气味，她意识到水可能被污染了或者有毒。为了不冒中毒的风险，她决定把水倒掉，继续寻找其他水源。",
            keywords: ["迷路", "沙漠", "污染", "有毒", "气味", "风险", "口渴", "喝水", "水源", "安全", "危险", "中毒", "毒药", "味道", "臭味", "寻找", "生存", "求生", "倒掉", "丢弃", "浪费", "谨慎", "小心", "怀疑"],
            questions: [
                { question: "这个女人口渴吗？", answer: "是" },
                { question: "这瓶水是干净的吗？", answer: "否" },
                { question: "这个女人倒掉水是因为她不渴吗？", answer: "否" },
                { question: "这瓶水里有毒吗？", answer: "与此无关" },
                { question: "这个女人在沙漠中迷路了吗？", answer: "是" },
                { question: "这个女人闻到奇怪的气味了吗？", answer: "是" }
            ]
        },
        {
            id: 3,
            fragment: "一个男人在阅读报纸时突然大笑起来，然后立刻哭了。",
            fullStory: "这个男人在报纸上读到一则笑话，觉得非常有趣就大笑起来。但随后他注意到笑话的作者是他已故的好友，这让他想起了好友的去世，于是悲伤地哭了起来。",
            keywords: ["报纸", "笑话", "作者", "已故", "好友", "悲伤", "阅读", "大笑", "哭泣", "眼泪", "难过", "伤心", "死亡", "去世", "逝世", "朋友", "熟人", "认识", "有趣", "幽默", "搞笑", "情绪", "情感", "反应", "突然", "转变"],
            questions: [
                { question: "报纸上的内容有趣吗？", answer: "是" },
                { question: "这个男人认识笑话的作者吗？", answer: "是" },
                { question: "作者还活着吗？", answer: "否" },
                { question: "这个男人情绪不稳定吗？", answer: "与此无关" },
                { question: "这个男人哭是因为笑话不好笑吗？", answer: "否" },
                { question: "这个男人想起了悲伤的往事吗？", answer: "是" }
            ]
        }
    ],

    currentStoryIndex: 0,
    questionCount: 0,
    startTime: null,
    timerInterval: null,
    gameActive: true,
    questionsHistory: []
};

// DOM元素引用
const DOM = {
    questionInput: document.getElementById('question-input'),
    askBtn: document.getElementById('ask-btn'),
    questionCount: document.getElementById('question-count'),
    gameStatus: document.getElementById('game-status'),
    gameTime: document.getElementById('game-time'),
    storyFragment: document.getElementById('story-fragment'),
    historyList: document.getElementById('history-list'),
    answerDisplay: document.getElementById('answer-display'),
    reconstructBtn: document.getElementById('reconstruct-btn'),
    answerBtn: document.getElementById('answer-btn'),
    resetBtn: document.getElementById('reset-btn'),
    hintBtn: document.getElementById('hint-btn'),

    // 答案按钮
    yesBtn: document.querySelector('.yes-btn'),
    noBtn: document.querySelector('.no-btn'),
    irrelevantBtn: document.querySelector('.irrelevant-btn'),

    // 模态对话框
    reconstructModal: document.getElementById('reconstruct-modal'),
    answerModal: document.getElementById('answer-modal'),
    resultModal: document.getElementById('result-modal'),
    hintModal: document.getElementById('hint-modal'),

    // 模态按钮
    cancelReconstruct: document.getElementById('cancel-reconstruct'),
    submitReconstruct: document.getElementById('submit-reconstruct'),
    closeAnswer: document.getElementById('close-answer'),
    closeHint: document.getElementById('close-hint'),
    playAgain: document.getElementById('play-again'),
    viewAnswerResult: document.getElementById('view-answer-result'),

    // 结果元素
    resultMessage: document.getElementById('result-message'),
    resultQuestions: document.getElementById('result-questions'),
    resultTime: document.getElementById('result-time'),

    // 完整故事
    fullStory: document.getElementById('full-story')
};

// 初始化游戏
function initGame() {
    // 重置游戏状态
    GameState.currentStoryIndex = Math.floor(Math.random() * GameState.stories.length);
    GameState.questionCount = 0;
    GameState.startTime = new Date();
    GameState.gameActive = true;
    GameState.questionsHistory = [];

    // 更新显示
    updateQuestionCount();
    updateGameStatus('推理中');
    updateStoryFragment();
    clearHistory();
    clearAnswerDisplay();
    startTimer();

    // 绑定事件
    bindEvents();

    console.log('游戏初始化完成，当前故事:', GameState.stories[GameState.currentStoryIndex].fragment);
}

// 更新问题计数
function updateQuestionCount() {
    DOM.questionCount.textContent = GameState.questionCount;
}

// 更新游戏状态
function updateGameStatus(status) {
    DOM.gameStatus.textContent = status;
}

// 更新故事片段
function updateStoryFragment() {
    const story = GameState.stories[GameState.currentStoryIndex];
    DOM.storyFragment.textContent = story.fragment;
    DOM.fullStory.textContent = story.fullStory;
}

// 清除历史记录
function clearHistory() {
    DOM.historyList.innerHTML = `
        <div class="empty-history">
            <i class="fas fa-comment-dots"></i>
            <p>还没有提问记录，开始你的第一个提问吧！</p>
        </div>
    `;
}

// 清除答案显示
function clearAnswerDisplay() {
    DOM.answerDisplay.innerHTML = `
        <div class="empty-answer">
            <i class="fas fa-robot"></i>
            <p>系统回答将显示在这里</p>
        </div>
    `;
}

// 启动计时器
function startTimer() {
    if (GameState.timerInterval) {
        clearInterval(GameState.timerInterval);
    }

    GameState.timerInterval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now - GameState.startTime) / 1000);
        const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
        const seconds = (diff % 60).toString().padStart(2, '0');
        DOM.gameTime.textContent = `${minutes}:${seconds}`;
    }, 1000);
}

// 绑定事件
function bindEvents() {
    // 提问按钮
    DOM.askBtn.addEventListener('click', handleQuestionSubmit);
    DOM.questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleQuestionSubmit();
        }
    });

    // 答案按钮
    DOM.yesBtn.addEventListener('click', () => showManualAnswer('是'));
    DOM.noBtn.addEventListener('click', () => showManualAnswer('否'));
    DOM.irrelevantBtn.addEventListener('click', () => showManualAnswer('与此无关'));

    // 游戏控制按钮
    DOM.reconstructBtn.addEventListener('click', showReconstructModal);
    DOM.answerBtn.addEventListener('click', showAnswerModal);
    DOM.resetBtn.addEventListener('click', initGame);
    DOM.hintBtn.addEventListener('click', showHintModal);

    // 模态对话框按钮
    DOM.cancelReconstruct.addEventListener('click', () => hideModal(DOM.reconstructModal));
    DOM.submitReconstruct.addEventListener('click', handleReconstructSubmit);
    DOM.closeAnswer.addEventListener('click', () => hideModal(DOM.answerModal));
    DOM.closeHint.addEventListener('click', () => hideModal(DOM.hintModal));
    DOM.playAgain.addEventListener('click', () => {
        hideModal(DOM.resultModal);
        initGame();
    });
    DOM.viewAnswerResult.addEventListener('click', () => {
        hideModal(DOM.resultModal);
        showAnswerModal();
    });

    // 点击模态框外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    });
}

// 处理问题提交
function handleQuestionSubmit() {
    if (!GameState.gameActive) return;

    const question = DOM.questionInput.value.trim();
    if (!question) {
        alert('请输入问题！');
        return;
    }

    // 增加问题计数
    GameState.questionCount++;
    updateQuestionCount();

    // 获取答案
    const answer = getAnswerForQuestion(question);

    // 添加到历史记录
    addToHistory(question, answer);

    // 显示答案
    showAnswer(answer);

    // 清空输入框
    DOM.questionInput.value = '';

    // 聚焦到输入框
    DOM.questionInput.focus();
}

// 获取问题的答案
function getAnswerForQuestion(question) {
    const currentStory = GameState.stories[GameState.currentStoryIndex];

    // 首先检查预定义的问题（完全匹配）
    for (const q of currentStory.questions) {
        if (question.toLowerCase() === q.question.toLowerCase()) {
            return q.answer;
        }
    }

    const lowerQuestion = question.toLowerCase();

    // 检查问题类型和相关性
    const questionType = analyzeQuestionType(lowerQuestion, currentStory);

    // 根据问题类型返回相应的答案
    switch (questionType) {
        case 'direct':
            // 直接相关的问题，尝试根据关键词给出合理答案
            return getDirectAnswer(lowerQuestion, currentStory);
        case 'indirect':
            // 间接相关的问题，给出提示性答案
            return getIndirectAnswer(lowerQuestion, currentStory);
        case 'unrelated':
            // 完全无关的问题
            return '与此无关';
        default:
            // 无法确定，保守起见返回"与此无关"
            return '与此无关';
    }
}

// 分析问题类型
function analyzeQuestionType(question, story) {
    // 首先检查判断依据类问题（这些应该优先处理，即使包含其他模式）
    const judgmentPatterns = ['判断', '依据', '根据', '通过', '怎么知道', '如何知道', '为什么认为',
                             '为何觉得', '怎么判断', '如何判断', '凭什么说', '根据什么', '依据什么',
                             '怎么想到', '如何想到', '怎么推测', '如何推测'];
    for (const pattern of judgmentPatterns) {
        if (question.includes(pattern)) {
            return 'direct'; // 判断依据类问题应该被视为直接相关
        }
    }

    // 检查问题是否明显无关（但排除判断依据类问题）
    const unrelatedPatterns = ['星期', '日期', '时间', '天气', '数字', '年龄', '身高', '体重'];
    let isUnrelated = false;
    for (const pattern of unrelatedPatterns) {
        if (question.includes(pattern)) {
            isUnrelated = true;
            break;
        }
    }

    if (isUnrelated) {
        return 'unrelated';
    }

    // 检查是否包含故事的关键词
    let hasKeyword = false;
    for (const keyword of story.keywords) {
        if (question.includes(keyword.toLowerCase())) {
            hasKeyword = true;
            break;
        }
    }

    // 检查问题是否涉及故事的核心元素
    const coreElements = getCoreElementsForStory(story.id);
    let hasCoreElement = false;
    for (const element of coreElements) {
        if (question.includes(element)) {
            hasCoreElement = true;
            break;
        }
    }

    if (hasKeyword || hasCoreElement) {
        return 'direct';
    } else {
        // 检查是否是一般疑问句（可以用是/否回答的问题）
        const yesNoQuestionPatterns = [
            '吗', '是否', '有没有', '是不是', '能否', '会不会', '可否', '可不可以',
            '行不行', '好不好', '对不对', '是不是', '有没有', '是否', '吗'
        ];

        // 检查是否是特殊疑问句（需要解释性回答）
        const specialQuestionPatterns = ['为什么', '怎么样', '怎么', '如何', '为何', '什么原因', '什么'];

        // 首先检查是否包含一般疑问句模式
        for (const pattern of yesNoQuestionPatterns) {
            if (question.includes(pattern)) {
                return 'direct'; // 一般疑问句应该给出确定性答案
            }
        }

        // 然后检查是否包含特殊疑问句模式
        for (const pattern of specialQuestionPatterns) {
            if (question.includes(pattern)) {
                return 'indirect'; // 特殊疑问句可以给出提示性答案
            }
        }

        // 如果都不匹配，尝试根据句子结构判断
        // 检查是否以问号结尾且不包含特殊疑问词（可能是隐含的一般疑问句）
        if (question.trim().endsWith('？') || question.trim().endsWith('?')) {
            // 不包含特殊疑问词，可能是一般疑问句
            let hasSpecialWord = false;
            for (const pattern of specialQuestionPatterns) {
                if (question.includes(pattern)) {
                    hasSpecialWord = true;
                    break;
                }
            }
            if (!hasSpecialWord) {
                return 'direct'; // 可能是一般疑问句
            }
        }

        return 'unrelated';
    }
}

// 获取故事的核心元素
function getCoreElementsForStory(storyId) {
    const coreElements = {
        1: ['男人', '酒吧', '酒保', '水', '枪', '谢谢', '走出', '离开'],
        2: ['女人', '沙漠', '水', '瓶子', '打开', '喝', '倒掉'],
        3: ['男人', '报纸', '阅读', '大笑', '哭', '哭泣']
    };
    return coreElements[storyId] || [];
}

// 获取直接相关问题的答案
function getDirectAnswer(question, story) {
    // 尝试根据问题内容给出合理答案
    const storyId = story.id;

    if (storyId === 1) {
        // 第一个故事：打嗝的男人 - 增强的语义理解

        // 事实1: 男人是否有健康问题（打嗝）
        const healthPatterns = ['健康', '生病', '疾病', '打嗝', '呃逆', '身体不适', '不舒服', '有问题'];
        for (const pattern of healthPatterns) {
            if (question.includes(pattern)) {
                return '是'; // 他有打嗝问题
            }
        }

        // 事实2: 是否认识酒保
        const acquaintancePatterns = ['认识', '熟悉', '朋友', '熟人', '见过', '认识酒保', '认识吗'];
        for (const pattern of acquaintancePatterns) {
            if (question.includes(pattern)) {
                return '否'; // 不认识酒保
            }
        }

        // 事实3: 酒保是否想伤害男人
        const harmPatterns = ['伤害', '攻击', '杀死', '谋杀', '害死', '威胁', '危险', '伤害他'];
        for (const pattern of harmPatterns) {
            if (question.includes(pattern)) {
                return '否'; // 酒保不想伤害他
            }
        }

        // 事实4: 男人是否想喝水
        if (question.includes('喝水') || question.includes('口渴') || question.includes('饮用') ||
            (question.includes('水') && (question.includes('喝') || question.includes('想喝') || question.includes('需要')))) {
            return '否'; // 他不是真的想喝水
        }

        // 事实5: 酒保是否想帮助/治疗男人
        const helpPatterns = ['帮助', '协助', '治疗', '治愈', '帮忙', '援助', '支援'];
        for (const pattern of helpPatterns) {
            if (question.includes(pattern)) {
                return '是'; // 酒保想帮助他
            }
        }

        // 事实6: 男人是否被吓到
        if (question.includes('吓') || question.includes('惊吓') || question.includes('恐怖') ||
            question.includes('害怕') || question.includes('恐惧') || question.includes('吃惊')) {
            return '是'; // 他被枪吓到了
        }

        // 事实7: 枪是否是真的（与此无关）
        if (question.includes('枪') && (question.includes('真') || question.includes('假') ||
            question.includes('真的') || question.includes('假的') || question.includes('实弹'))) {
            return '与此无关'; // 枪的真假与此无关
        }

        // 检查是否在问判断依据/推理过程（一般疑问句形式）
        const judgmentPatterns1 = ['判断', '依据', '根据', '通过', '怎么知道', '如何知道', '为什么认为',
                                  '为何觉得', '怎么判断', '如何判断', '凭什么说', '根据什么', '依据什么',
                                  '怎么想到', '如何想到', '怎么推测', '如何推测'];

        // 对于判断依据类的一般疑问句，给出确定性答案
        // 例如："她是通过气味判断的吗？" -> "是"
        // 但需要检查是否是一般疑问句形式（包含"吗"或疑问词）
        let isYesNoQuestion = false;
        const yesNoMarkers = ['吗', '是否', '是不是', '有没有', '能否', '会不会', '可否'];
        for (const marker of yesNoMarkers) {
            if (question.includes(marker)) {
                isYesNoQuestion = true;
                break;
            }
        }

        for (const pattern of judgmentPatterns1) {
            if (question.includes(pattern)) {
                if (isYesNoQuestion) {
                    // 是一般疑问句形式的判断依据问题，给出确定性答案
                    if (question.includes('伤害') || question.includes('攻击') || question.includes('杀死')) {
                        return '否'; // 酒保不想伤害他
                    }
                    if (question.includes('帮助') || question.includes('治疗') || question.includes('治愈')) {
                        return '是'; // 酒保想帮助他
                    }
                    return '是'; // 默认，判断依据存在
                } else {
                    // 不是一般疑问句形式，可能是特殊疑问句，应该由getIndirectAnswer处理
                    // 但既然进入了getDirectAnswer，说明被识别为direct类型
                    // 保守起见返回"是"
                    return '是';
                }
            }
        }
    } else if (storyId === 2) {
        // 第二个故事：沙漠中的水 - 增强的语义理解

        // 首先检查事实性问题
        // 事实1: 她是否口渴
        if (question.includes('口渴') || question.includes('渴了') ||
            question.includes('需要水') || question.includes('想喝水') ||
            (question.includes('喝') && question.includes('水') && (question.includes('想') || question.includes('需要')))) {
            return '是';
        }

        // 事实2: 她是否迷路了
        if (question.includes('迷路') || question.includes('迷失') || question.includes('走失') ||
            question.includes('找不到路') || question.includes('方向') || question.includes('丢失')) {
            return '是';
        }

        // 事实3: 她是否闻到了奇怪的气味（直接询问是否"闻到"）
        if (question.includes('闻到') || question.includes('嗅到')) {
            return '是'; // 她确实闻到了奇怪的气味
        }

        // 询问水是否有气味/味道（间接询问水质）
        if (question.includes('气味') || question.includes('味道') || question.includes('臭味') || question.includes('异味')) {
            if (question.includes('没有') || question.includes('不') || question.includes('无')) {
                return '否'; // "没有气味吗?" -> "否" (事实上水有气味)
            }
            // 间接询问水质，推断用户想知道水是否安全
            return '否'; // "有气味吗?" -> "否" (水不安全/有问题)
        }

        // 事实4: 她是否倒掉了水
        if (question.includes('倒掉') || question.includes('倒水') || question.includes('倒出') ||
            question.includes('丢弃') || question.includes('扔掉') || question.includes('浪费')) {
            return '是';
        }

        // 然后检查对水质的判断性问题（这些需要推理）
        // 水质安全相关的问题
        const waterQualityPatterns = [
            // 直接询问安全性
            '安全吗', '能喝吗', '可以喝吗', '适合喝吗', '卫生吗',
            // 询问干净程度
            '干净吗', '清洁吗', '纯净吗', '清澈吗', '卫生吗',
            // 询问是否有问题
            '有问题吗', '不对劲吗', '正常吗', '变质了吗',
            // 污染相关
            '污染了吗', '被污染', '有毒吗', '毒',
            // 间接询问（通过状态判断）
            '好不好', '行不行', '可不可以'
        ];

        for (const pattern of waterQualityPatterns) {
            if (question.includes(pattern)) {
                return '否'; // 水不安全/不干净
            }
        }

        // 检查是否在问"为什么"倒掉水（如果是一般疑问句形式）
        if ((question.includes('为什么') || question.includes('为何') || question.includes('原因')) &&
            (question.includes('倒') || question.includes('扔') || question.includes('丢弃'))) {
            // 检查是否是一般疑问句形式（包含"吗"等）
            if (question.includes('吗') || question.includes('是否') || question.includes('是不是')) {
                // 是一般疑问句，需要确定性答案
                // "她倒掉水是因为水有问题吗？" -> "是"
                return '是';
            }
            // 不是一般疑问句形式，应该由getIndirectAnswer处理
            // 但既然进入了getDirectAnswer，说明被识别为direct类型
            // 保守起见返回"是"
            return '是';
        }

        // 检查是否在问判断依据/推理过程
        const judgmentPatterns = ['判断', '依据', '根据', '通过', '怎么知道', '如何知道', '为什么认为',
                                 '为何觉得', '怎么判断', '如何判断', '凭什么说', '根据什么', '依据什么'];
        for (const pattern of judgmentPatterns) {
            if (question.includes(pattern)) {
                // 如果是询问判断依据，回答"是"（她通过气味判断）
                return '是';
            }
        }

        // 检查是否在问水本身的性质（而非故事中的具体事实）
        if (question.includes('水') && (
            question.includes('是什么') || question.includes('什么样的') ||
            question.includes('种类') || question.includes('类型'))) {
            return '与此无关'; // 水的具体种类与此无关
        }

        // 检查是否在问颜色相关（故事中没有提到颜色）
        if (question.includes('颜色') || question.includes('色泽') || question.includes('色')) {
            if (question.includes('水') || question.includes('瓶子')) {
                return '与此无关'; // 故事没有提到水的颜色
            }
        }

        // 检查是否在问有害/有毒（虽然预设说"与此无关"，但实际故事中水可能有害）
        if (question.includes('有害') || question.includes('有毒') || question.includes('毒')) {
            if (question.includes('水') || question.includes('瓶子')) {
                // 实际上水可能被污染/有问题，但不是明确有毒
                // 根据预设问题，水是否有毒与此无关
                return '与此无关';
            }
        }
    } else if (storyId === 3) {
        // 第三个故事：报纸上的笑话 - 增强的语义理解

        // 事实1: 报纸内容是否有趣
        const funnyPatterns = ['有趣', '好笑', '幽默', '搞笑', '滑稽', '逗笑', '引人发笑', '笑点'];
        for (const pattern of funnyPatterns) {
            if (question.includes(pattern)) {
                return '是'; // 内容确实有趣
            }
        }

        // 事实2: 是否认识作者
        const authorPatterns = ['认识', '熟悉', '朋友', '熟人', '作者', '写笑话的', '撰稿人'];
        for (const pattern of authorPatterns) {
            if (question.includes(pattern) && (question.includes('作者') || question.includes('写') ||
                question.includes('笑话') || question.includes('报纸') || !question.includes('不认识'))) {
                return '是'; // 认识作者
            }
        }

        // 事实3: 作者是否在世
        const alivePatterns = ['活着', '在世', '健在', '还在世', '生存', '活着的'];
        const deadPatterns = ['死亡', '去世', '逝世', '已故', '死了', '过世', '离世', '不在'];

        for (const pattern of alivePatterns) {
            if (question.includes(pattern)) {
                return '否'; // 作者已故
            }
        }

        for (const pattern of deadPatterns) {
            if (question.includes(pattern)) {
                return '是'; // 作者已故
            }
        }

        // 事实4: 是否悲伤/难过
        const sadPatterns = ['悲伤', '难过', '伤心', '悲痛', '悲哀', '哭', '哭泣', '流泪', '眼泪'];
        for (const pattern of sadPatterns) {
            if (question.includes(pattern)) {
                return '是'; // 他确实悲伤
            }
        }

        // 事实5: 情绪是否稳定（与此无关）
        if (question.includes('情绪') && (question.includes('稳定') || question.includes('不稳定') ||
            question.includes('正常') || question.includes('不正常'))) {
            return '与此无关'; // 根据预设问题
        }

        // 检查是否在问判断依据/推理过程（一般疑问句形式）
        const judgmentPatterns3 = ['判断', '依据', '根据', '通过', '怎么知道', '如何知道', '为什么认为',
                                  '为何觉得', '怎么判断', '如何判断', '凭什么说', '根据什么', '依据什么',
                                  '怎么想到', '如何想到', '怎么推测', '如何推测'];

        // 检查是否是一般疑问句形式
        let isYesNoQuestion3 = false;
        const yesNoMarkers3 = ['吗', '是否', '是不是', '有没有', '能否', '会不会', '可否'];
        for (const marker of yesNoMarkers3) {
            if (question.includes(marker)) {
                isYesNoQuestion3 = true;
                break;
            }
        }

        for (const pattern of judgmentPatterns3) {
            if (question.includes(pattern)) {
                if (isYesNoQuestion3) {
                    // 是一般疑问句形式的判断依据问题，给出确定性答案
                    if (question.includes('笑') || question.includes('好笑') || question.includes('有趣')) {
                        return '是'; // 他笑是因为内容有趣
                    }
                    if (question.includes('哭') || question.includes('悲伤') || question.includes('难过')) {
                        return '是'; // 他哭是因为悲伤
                    }
                    return '是'; // 默认
                } else {
                    // 不是一般疑问句形式，应该由getIndirectAnswer处理
                    // 但既然进入了getDirectAnswer，说明被识别为direct类型
                    return '是'; // 保守回答
                }
            }
        }
    }

    // 默认：对于未匹配的问题，尝试给出确定性答案
    // 既然问题进入了getDirectAnswer，说明它被识别为direct类型（一般疑问句）
    // 我们需要给出"是"、"否"或"与此无关"

    // 扩展的关键词列表，用于推断问题意图
    const positiveClues = ['帮助', '治疗', '治愈', '有趣', '好笑', '幽默', '口渴', '认识', '朋友',
                          '快乐', '高兴', '喜欢', '爱', '成功', '胜利', '好', '积极', '正面'];
    const negativeClues = ['伤害', '攻击', '杀死', '浪费', '污染', '有毒', '坏', '不好', '负面',
                          '失败', '失去', '死亡', '悲伤', '痛苦', '困难', '问题', '危险'];

    // 检查是否包含明显无关的词汇
    const unrelatedClues = ['颜色', '星期', '日期', '时间', '天气', '年龄', '身高', '体重', '数字'];
    for (const clue of unrelatedClues) {
        if (question.includes(clue)) {
            return '与此无关';
        }
    }

    // 根据正面/负面线索给出合理推断
    let positiveCount = 0;
    let negativeCount = 0;

    for (const clue of positiveClues) {
        if (question.includes(clue)) {
            positiveCount++;
        }
    }

    for (const clue of negativeClues) {
        if (question.includes(clue)) {
            negativeCount++;
        }
    }

    // 如果有明显的线索倾向，根据倾向回答
    if (positiveCount > negativeCount * 2) {
        return '是';
    } else if (negativeCount > positiveCount * 2) {
        return '否';
    } else if (positiveCount > 0 || negativeCount > 0) {
        // 有线索但不明显，保守回答"是"（假设问题相关）
        return '是';
    }

    // 如果没有任何线索，但问题是direct类型，说明可能相关
    // 保守起见返回"是"，而不是"与此无关"
    return '是';
}

// 获取间接相关问题的答案（提示性答案）
function getIndirectAnswer(question, story) {
    // 对于间接问题（特殊疑问句），给出提示性答案
    // 根据问题类型提供更有针对性的提示

    const storyId = story.id;

    if (storyId === 1) {
        // 第一个故事提示
        if (question.includes('为什么') && question.includes('点水')) {
            return '考虑男人点水的真正目的';
        }
        if (question.includes('为什么') && question.includes('枪')) {
            return '思考酒保拿出枪的意图';
        }
        if (question.includes('怎么') || question.includes('如何')) {
            return '关注故事中的异常行为';
        }
    } else if (storyId === 2) {
        // 第二个故事提示
        if (question.includes('为什么') && question.includes('倒掉')) {
            return '思考水可能存在的问题';
        }
        if (question.includes('怎么') || question.includes('如何')) {
            return '注意角色在沙漠中的处境';
        }
    } else if (storyId === 3) {
        // 第三个故事提示
        if (question.includes('为什么') && (question.includes('笑') || question.includes('哭'))) {
            return '考虑情感变化的原因';
        }
        if (question.includes('怎么') || question.includes('如何')) {
            return '关注故事中的细节关联';
        }
    }

    // 通用提示
    const prompts = [
        '这个问题可能需要从另一个角度思考',
        '试着关注故事中的异常细节',
        '考虑角色的动机可能是什么',
        '也许这个问题与故事的核心谜题有关',
        '继续探索，你离真相更近了'
    ];

    return prompts[Math.floor(Math.random() * prompts.length)];
}

// 添加到历史记录
function addToHistory(question, answer) {
    GameState.questionsHistory.push({ question, answer });

    // 移除空状态
    if (DOM.historyList.querySelector('.empty-history')) {
        DOM.historyList.innerHTML = '';
    }

    // 创建新的历史记录项
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';

    // 确定答案的样式类和图标
    let answerClass = '';
    let icon = '';

    if (answer === '是' || answer === '可能是') {
        answerClass = 'answer-yes';
        icon = 'check';
    } else if (answer === '否' || answer === '可能不是') {
        answerClass = 'answer-no';
        icon = 'times';
    } else if (answer === '与此无关') {
        answerClass = 'answer-irrelevant';
        icon = 'ban';
    } else {
        // 提示性答案或其他类型
        answerClass = 'answer-hint';
        icon = 'lightbulb';
    }

    historyItem.innerHTML = `
        <div class="history-question">${question}</div>
        <div class="history-answer ${answerClass}">
            <i class="fas fa-${icon}"></i>
            <span>${answer}</span>
        </div>
    `;

    // 添加到列表顶部
    DOM.historyList.prepend(historyItem);
}

// 显示答案
function showAnswer(answer) {
    let answerClass = '';
    let icon = '';

    // 根据答案类型设置样式
    if (answer === '是' || answer === '可能是') {
        answerClass = 'answer-yes';
        icon = 'check';
    } else if (answer === '否' || answer === '可能不是') {
        answerClass = 'answer-no';
        icon = 'times';
    } else if (answer === '与此无关') {
        answerClass = 'answer-irrelevant';
        icon = 'ban';
    } else {
        // 提示性答案或其他类型
        answerClass = 'answer-hint';
        icon = 'lightbulb';
    }

    DOM.answerDisplay.innerHTML = `
        <div class="answer-content ${answerClass}">
            <i class="fas fa-${icon} fa-3x"></i>
            <h2>${answer}</h2>
            <p>${getAnswerExplanation(answer)}</p>
        </div>
    `;
}

// 手动显示答案（用于按钮点击）
function showManualAnswer(answer) {
    if (!GameState.gameActive) return;

    showAnswer(answer);

    // 添加到历史记录
    addToHistory(`[手动答案] ${answer}`, answer);
}

// 获取答案解释
function getAnswerExplanation(answer) {
    const explanations = {
        '是': '是的，你的猜测正确。',
        '否': '不，事实并非如此。',
        '与此无关': '这个问题与故事的核心情节无关。',
        // 保留旧的提示类型，但理论上getDirectAnswer不再返回这些
        '可能是': '可能有关，继续探索这个方向。',
        '可能不是': '可能无关，尝试其他角度思考。',
        '可能有关': '这个问题可能相关，但需要更多线索确认。',
        // 通用提示
        '这个问题可能需要从另一个角度思考': '试着换一种方式思考问题。',
        '试着关注故事中的异常细节': '注意故事里不寻常的地方。',
        '考虑角色的动机可能是什么': '想想角色为什么会有这样的行为。',
        '也许这个问题与故事的核心谜题有关': '你问的问题可能接近真相了。',
        '继续探索，你离真相更近了': '保持提问，你正在接近正确答案。',
        // 第一个故事特定提示
        '考虑男人点水的真正目的': '男人点水可能有特殊原因。',
        '思考酒保拿出枪的意图': '酒保的行为可能有特定目的。',
        '关注故事中的异常行为': '注意故事中不寻常的举动。',
        // 第二个故事特定提示
        '思考水可能存在的问题': '水可能不是表面看起来那么简单。',
        '注意角色在沙漠中的处境': '考虑她在沙漠中的生存状况。',
        // 第三个故事特定提示
        '考虑情感变化的原因': '情绪变化可能有特定触发因素。',
        '关注故事中的细节关联': '注意不同细节之间的联系。'
    };
    return explanations[answer] || '请继续提问来探索故事真相。';
}

// 显示重构模态框
function showReconstructModal() {
    if (!GameState.gameActive) return;

    DOM.reconstructModal.style.display = 'flex';
    document.getElementById('reconstruct-text').value = '';
    document.getElementById('reconstruct-text').focus();
}

// 处理重构提交
function handleReconstructSubmit() {
    const userStory = document.getElementById('reconstruct-text').value.trim();
    if (!userStory) {
        alert('请输入你推理出的故事！');
        return;
    }

    hideModal(DOM.reconstructModal);

    // 验证故事
    const isCorrect = validateStory(userStory);

    if (isCorrect) {
        // 游戏胜利
        GameState.gameActive = false;
        updateGameStatus('已完成');

        // 显示胜利模态框
        showResultModal(true);
    } else {
        // 故事不正确
        alert('你还原的故事不完全正确，请继续提问推理！');
    }
}

// 验证故事
function validateStory(userStory) {
    const currentStory = GameState.stories[GameState.currentStoryIndex];
    const userLower = userStory.toLowerCase();
    const fullLower = currentStory.fullStory.toLowerCase();

    // 简单的关键词匹配验证
    let matchedKeywords = 0;
    for (const keyword of currentStory.keywords) {
        if (userLower.includes(keyword.toLowerCase())) {
            matchedKeywords++;
        }
    }

    // 如果匹配了至少一半的关键词，认为基本正确
    return matchedKeywords >= Math.ceil(currentStory.keywords.length / 2);
}

// 显示答案模态框
function showAnswerModal() {
    GameState.gameActive = false;
    updateGameStatus('已查看答案');
    DOM.answerModal.style.display = 'flex';
}

// 显示提示模态框
function showHintModal() {
    DOM.hintModal.style.display = 'flex';
}

// 显示结果模态框
function showResultModal(isVictory) {
    DOM.resultMessage.textContent = isVictory
        ? '恭喜！你成功还原了故事！'
        : '很遗憾，故事还原不正确。';

    DOM.resultQuestions.textContent = GameState.questionCount;
    DOM.resultTime.textContent = DOM.gameTime.textContent;

    DOM.resultModal.style.display = 'flex';
}

// 隐藏模态框
function hideModal(modal) {
    modal.style.display = 'none';
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    initGame();

    // 添加一些样式到答案内容
    const style = document.createElement('style');
    style.textContent = `
        .answer-content {
            text-align: center;
            padding: 20px;
        }
        .answer-content h2 {
            font-size: 3rem;
            margin: 15px 0;
            font-weight: 700;
        }
        .answer-content p {
            font-size: 1.1rem;
            color: #64748b;
            margin-top: 10px;
        }
        .answer-yes h2 { color: #10b981; }
        .answer-no h2 { color: #ef4444; }
        .answer-irrelevant h2 { color: #8b5cf6; }
        .answer-hint h2 { color: #f59e0b; }
    `;
    document.head.appendChild(style);
});