// 动态知识库管理系统
class KnowledgeManager {
    constructor() {
        this.knowledgeBase = this.loadKnowledgeBase();
        this.userKnowledge = this.loadUserKnowledge();
        this.knowledgeGraph = this.buildKnowledgeGraph();
        this.categories = ['science', 'nature', 'history', 'technology', 'health', 'psychology', 'life', 'entertainment'];

        // 知识关联权重
        this.associationWeights = {
            sameCategory: 0.8,
            relatedCategory: 0.5,
            userInterest: 0.7,
            recentUsage: 0.6,
            emotionMatch: 0.9
        };
    }

    // 加载基础知识库
    loadKnowledgeBase() {
        const defaultKnowledge = {
            science: [
                { id: 'sci_001', content: "你知道地球有71%的表面被水覆盖吗？🌊", tags: ['地球', '水', '自然'], difficulty: 1 },
                { id: 'sci_002', content: "人类大脑由大约860亿个神经元组成！🧠", tags: ['大脑', '神经元', '人体'], difficulty: 2 },
                { id: 'sci_003', content: "光速是每秒299,792,458米，这是宇宙中最快的速度。⚡", tags: ['光速', '物理', '宇宙'], difficulty: 2 }
            ],
            nature: [
                { id: 'nat_001', content: "树木通过光合作用吸收二氧化碳，释放氧气。🌳", tags: ['树木', '光合作用', '氧气'], difficulty: 1 },
                { id: 'nat_002', content: "蜜蜂的翅膀每分钟能振动200次以上！🐝", tags: ['蜜蜂', '昆虫', '生物'], difficulty: 1 },
                { id: 'nat_003', content: "彩虹有七种颜色：红、橙、黄、绿、蓝、靛、紫。🌈", tags: ['彩虹', '颜色', '光学'], difficulty: 1 }
            ],
            history: [
                { id: 'his_001', content: "中国的长城全长超过21,000公里。🏯", tags: ['长城', '中国', '历史'], difficulty: 1 },
                { id: 'his_002', content: "第一个电子邮件是在1971年发送的。📧", tags: ['电子邮件', '科技', '历史'], difficulty: 2 },
                { id: 'his_003', content: "互联网是在1983年正式诞生的。🌐", tags: ['互联网', '科技', '历史'], difficulty: 2 }
            ],
            technology: [
                { id: 'tech_001', content: "人工智能已经能识别图像、理解语言和玩游戏了！🤖", tags: ['人工智能', '科技', '未来'], difficulty: 2 },
                { id: 'tech_002', content: "量子计算机利用量子比特进行计算，速度远超传统计算机。⚛️", tags: ['量子计算', '科技', '未来'], difficulty: 3 },
                { id: 'tech_003', content: "5G网络的速度比4G快10-100倍！📶", tags: ['5G', '网络', '通信'], difficulty: 1 }
            ],
            health: [
                { id: 'health_001', content: "成年人每天需要喝2升水来保持身体水分平衡。💧", tags: ['健康', '水', '养生'], difficulty: 1 },
                { id: 'health_002', content: "每天30分钟的中等强度运动对心脏健康很有益。🏃‍♀️", tags: ['运动', '健康', '心脏'], difficulty: 1 },
                { id: 'health_003', content: "冥想可以帮助减轻压力和提高注意力。🧘‍♂️", tags: ['冥想', '心理健康', '压力'], difficulty: 2 }
            ],
            psychology: [
                { id: 'psy_001', content: "微笑可以释放内啡肽，让人感到更快乐。😊", tags: ['心理学', '情绪', '快乐'], difficulty: 1 },
                { id: 'psy_002', content: "感恩练习可以显著提高生活满意度。🙏", tags: ['心理学', '感恩', '幸福'], difficulty: 2 },
                { id: 'psy_003', content: "充足的睡眠对记忆巩固和情绪调节至关重要。😴", tags: ['心理学', '睡眠', '记忆'], difficulty: 1 }
            ],
            life: [
                { id: 'life_001', content: "定期整理物品可以让生活空间更清爽，心情更愉快。🧹", tags: ['生活', '整理', '心情'], difficulty: 1 },
                { id: 'life_002', content: "学习新技能可以刺激大脑，延缓认知衰退。🎯", tags: ['学习', '大脑', '成长'], difficulty: 2 },
                { id: 'life_003', content: "与朋友保持联系对心理健康非常重要。👭", tags: ['社交', '心理健康', '友谊'], difficulty: 1 }
            ],
            entertainment: [
                { id: 'ent_001', content: "看电影可以暂时逃离现实，放松心情。🎬", tags: ['娱乐', '电影', '放松'], difficulty: 1 },
                { id: 'ent_002', content: "听音乐可以调节情绪，减轻压力。🎵", tags: ['音乐', '情绪', '放松'], difficulty: 1 },
                { id: 'ent_003', content: "阅读可以拓宽视野，丰富内心世界。📚", tags: ['阅读', '学习', '成长'], difficulty: 1 },
                { id: 'star_001', content: "周杰伦是华语乐坛的天王级歌手，获得过15座金曲奖。🎵", tags: ['周杰伦', '音乐', '歌手', '明星'], difficulty: 1 },
                { id: 'star_002', content: "王楚钦是中国乒乓球新生代代表，世界锦标赛男单冠军。🏓", tags: ['王楚钦', '乒乓球', '体育', '明星'], difficulty: 1 },
                { id: 'star_003', content: "孙颖莎被称为'小魔王'，是中国女乒的未来之星。🏓", tags: ['孙颖莎', '乒乓球', '体育', '明星'], difficulty: 1 },
                { id: 'star_004', content: "樊振东是世界排名第一的乒乓球选手，技术全面力量大。🏓", tags: ['樊振东', '乒乓球', '体育', '明星'], difficulty: 1 },
                { id: 'star_005', content: "文韬是北京大学毕业生，在综艺节目中展现高智商。🎓", tags: ['文韬', '学霸', '综艺', '明星'], difficulty: 1 },
                { id: 'star_006', content: "周峻纬毕业于麦吉尔大学，是多才多艺的艺人。🎭", tags: ['周峻纬', '学霸', '艺人', '明星'], difficulty: 1 },
                { id: 'star_007', content: "JY是狼人杀职业选手，被称为'国服第一狼王'。🎮", tags: ['JY', '狼人杀', '游戏', '明星'], difficulty: 1 }
            ]
        };

        // 尝试加载本地存储的知识库
        try {
            const saved = localStorage.getItem('knowledgeBase');
            if (saved) {
                const custom = JSON.parse(saved);
                return this.mergeKnowledgeBases(defaultKnowledge, custom);
            }
        } catch (error) {
            console.warn('加载自定义知识库失败:', error);
        }

        return defaultKnowledge;
    }

    // 加载用户知识
    loadUserKnowledge() {
        try {
            const saved = localStorage.getItem('userKnowledge');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('加载用户知识失败:', error);
        }

        return {
            added: [],      // 用户添加的知识
            modified: [],   // 用户修改的知识
            favorites: [],  // 用户收藏的知识
            usage: {},      // 知识使用记录
            ratings: {}     // 知识评分
        };
    }

    // 构建知识图谱
    buildKnowledgeGraph() {
        const graph = {
            nodes: new Map(),  // 知识节点
            edges: new Map(),  // 关联关系
            categories: new Map() // 分类关系
        };

        // 添加所有知识到图谱
        for (const [category, items] of Object.entries(this.knowledgeBase)) {
            graph.categories.set(category, new Set());

            items.forEach(item => {
                // 添加节点
                graph.nodes.set(item.id, {
                    id: item.id,
                    content: item.content,
                    category: category,
                    tags: item.tags,
                    difficulty: item.difficulty,
                    usageCount: 0,
                    lastUsed: null,
                    rating: 0
                });

                // 添加到分类
                graph.categories.get(category).add(item.id);

                // 添加标签关联
                item.tags.forEach(tag => {
                    if (!graph.edges.has(tag)) {
                        graph.edges.set(tag, new Set());
                    }
                    graph.edges.get(tag).add(item.id);
                });
            });
        }

        // 添加用户知识
        this.userKnowledge.added.forEach(item => {
            graph.nodes.set(item.id, {
                id: item.id,
                content: item.content,
                category: item.category || 'user',
                tags: item.tags || [],
                difficulty: item.difficulty || 1,
                usageCount: 0,
                lastUsed: null,
                rating: 0,
                userAdded: true
            });
        });

        return graph;
    }

    // 合并知识库
    mergeKnowledgeBases(base, custom) {
        const merged = { ...base };

        for (const [category, items] of Object.entries(custom)) {
            if (!merged[category]) {
                merged[category] = [];
            }

            // 避免重复
            const existingIds = new Set(merged[category].map(item => item.id));
            items.forEach(item => {
                if (!existingIds.has(item.id)) {
                    merged[category].push(item);
                }
            });
        }

        return merged;
    }

    // 保存知识库
    saveKnowledgeBase() {
        try {
            localStorage.setItem('knowledgeBase', JSON.stringify(this.knowledgeBase));
            localStorage.setItem('userKnowledge', JSON.stringify(this.userKnowledge));
            return true;
        } catch (error) {
            console.error('保存知识库失败:', error);
            return false;
        }
    }

    // 添加新知识
    addKnowledge(content, category = 'user', tags = [], difficulty = 1) {
        const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newItem = {
            id: id,
            content: content,
            category: category,
            tags: tags,
            difficulty: difficulty,
            createdAt: new Date().toISOString(),
            createdBy: 'user'
        };

        // 添加到用户知识
        this.userKnowledge.added.push(newItem);

        // 添加到知识库
        if (!this.knowledgeBase[category]) {
            this.knowledgeBase[category] = [];
        }
        this.knowledgeBase[category].push(newItem);

        // 更新知识图谱
        this.updateKnowledgeGraph(newItem);

        // 保存
        this.saveKnowledgeBase();

        return id;
    }

    // 修改知识
    modifyKnowledge(id, updates) {
        let found = false;

        // 在基础知识库中查找
        for (const [category, items] of Object.entries(this.knowledgeBase)) {
            const index = items.findIndex(item => item.id === id);
            if (index !== -1) {
                const original = { ...items[index] };
                items[index] = { ...items[index], ...updates, modifiedAt: new Date().toISOString() };

                // 记录修改
                this.userKnowledge.modified.push({
                    id: id,
                    original: original,
                    updated: items[index],
                    modifiedAt: new Date().toISOString()
                });

                found = true;
                break;
            }
        }

        // 在用户知识中查找
        if (!found) {
            const index = this.userKnowledge.added.findIndex(item => item.id === id);
            if (index !== -1) {
                const original = { ...this.userKnowledge.added[index] };
                this.userKnowledge.added[index] = {
                    ...this.userKnowledge.added[index],
                    ...updates,
                    modifiedAt: new Date().toISOString()
                };
                found = true;
            }
        }

        if (found) {
            // 更新知识图谱
            this.rebuildKnowledgeGraph();
            this.saveKnowledgeBase();
            return true;
        }

        return false;
    }

    // 删除知识
    deleteKnowledge(id) {
        let deleted = false;

        // 从基础知识库删除（只标记，不真正删除）
        for (const [category, items] of Object.entries(this.knowledgeBase)) {
            const index = items.findIndex(item => item.id === id);
            if (index !== -1) {
                const deletedItem = items[index];
                deletedItem.deleted = true;
                deletedItem.deletedAt = new Date().toISOString();
                deleted = true;
                break;
            }
        }

        // 从用户知识删除
        const userIndex = this.userKnowledge.added.findIndex(item => item.id === id);
        if (userIndex !== -1) {
            this.userKnowledge.added.splice(userIndex, 1);
            deleted = true;
        }

        if (deleted) {
            // 从收藏中移除
            const favIndex = this.userKnowledge.favorites.indexOf(id);
            if (favIndex !== -1) {
                this.userKnowledge.favorites.splice(favIndex, 1);
            }

            // 更新知识图谱
            this.rebuildKnowledgeGraph();
            this.saveKnowledgeBase();
            return true;
        }

        return false;
    }

    // 收藏知识
    favoriteKnowledge(id) {
        if (!this.userKnowledge.favorites.includes(id)) {
            this.userKnowledge.favorites.push(id);
            this.saveKnowledgeBase();
            return true;
        }
        return false;
    }

    // 取消收藏
    unfavoriteKnowledge(id) {
        const index = this.userKnowledge.favorites.indexOf(id);
        if (index !== -1) {
            this.userKnowledge.favorites.splice(index, 1);
            this.saveKnowledgeBase();
            return true;
        }
        return false;
    }

    // 记录知识使用
    recordUsage(id, context = {}) {
        if (!this.userKnowledge.usage[id]) {
            this.userKnowledge.usage[id] = {
                count: 0,
                firstUsed: new Date().toISOString(),
                lastUsed: new Date().toISOString(),
                contexts: []
            };
        }

        this.userKnowledge.usage[id].count++;
        this.userKnowledge.usage[id].lastUsed = new Date().toISOString();
        this.userKnowledge.usage[id].contexts.push({
            timestamp: new Date().toISOString(),
            ...context
        });

        // 限制上下文记录数量
        if (this.userKnowledge.usage[id].contexts.length > 10) {
            this.userKnowledge.usage[id].contexts = this.userKnowledge.usage[id].contexts.slice(-10);
        }

        // 更新知识图谱
        const node = this.knowledgeGraph.nodes.get(id);
        if (node) {
            node.usageCount++;
            node.lastUsed = new Date();
        }

        this.saveKnowledgeBase();
    }

    // 评分知识
    rateKnowledge(id, rating) {
        if (rating < 1 || rating > 5) return false;

        this.userKnowledge.ratings[id] = {
            rating: rating,
            ratedAt: new Date().toISOString()
        };

        // 更新知识图谱
        const node = this.knowledgeGraph.nodes.get(id);
        if (node) {
            node.rating = rating;
        }

        this.saveKnowledgeBase();
        return true;
    }

    // 更新知识图谱
    updateKnowledgeGraph(item) {
        const { id, content, category, tags, difficulty } = item;

        // 添加节点
        this.knowledgeGraph.nodes.set(id, {
            id: id,
            content: content,
            category: category,
            tags: tags,
            difficulty: difficulty,
            usageCount: 0,
            lastUsed: null,
            rating: 0,
            userAdded: true
        });

        // 添加到分类
        if (!this.knowledgeGraph.categories.has(category)) {
            this.knowledgeGraph.categories.set(category, new Set());
        }
        this.knowledgeGraph.categories.get(category).add(id);

        // 添加标签关联
        tags.forEach(tag => {
            if (!this.knowledgeGraph.edges.has(tag)) {
                this.knowledgeGraph.edges.set(tag, new Set());
            }
            this.knowledgeGraph.edges.get(tag).add(id);
        });
    }

    // 重建知识图谱
    rebuildKnowledgeGraph() {
        this.knowledgeGraph = this.buildKnowledgeGraph();
    }

    // 搜索知识
    searchKnowledge(query, options = {}) {
        const {
            category = null,
            maxResults = 10,
            minDifficulty = 1,
            maxDifficulty = 3,
            includeUser = true
        } = options;

        const results = [];
        const queryLower = query.toLowerCase();

        // 搜索所有知识
        for (const [id, node] of this.knowledgeGraph.nodes.entries()) {
            // 过滤条件
            if (category && node.category !== category) continue;
            if (node.difficulty < minDifficulty || node.difficulty > maxDifficulty) continue;
            if (!includeUser && node.userAdded) continue;

            // 计算匹配分数
            let score = 0;

            // 内容匹配
            if (node.content.toLowerCase().includes(queryLower)) {
                score += 2;
            }

            // 标签匹配
            const tagMatches = node.tags.filter(tag => tag.toLowerCase().includes(queryLower)).length;
            score += tagMatches * 1.5;

            // 分类匹配
            if (node.category.toLowerCase().includes(queryLower)) {
                score += 1;
            }

            // 使用频率加成
            score += Math.log(node.usageCount + 1) * 0.5;

            // 评分加成
            score += node.rating * 0.3;

            // 检查是否包含明星名字，提高相关知识的权重
            const celebrityNames = ['周杰伦', '王楚钦', '孙颖莎', '樊振东', '文韬', '周峻纬', 'JY'];
            const mentionedCelebrity = celebrityNames.find(name =>
                query.includes(name)
            );

            if (mentionedCelebrity) {
                if (node.tags && node.tags.includes(mentionedCelebrity)) {
                    score *= 1.5; // 提高明星相关知识的权重
                }
            }

            if (score > 0) {
                results.push({
                    id: id,
                    content: node.content,
                    category: node.category,
                    tags: node.tags,
                    difficulty: node.difficulty,
                    score: score,
                    usageCount: node.usageCount,
                    rating: node.rating,
                    userAdded: node.userAdded || false
                });
            }
        }

        // 按分数排序
        results.sort((a, b) => b.score - a.score);

        return results.slice(0, maxResults);
    }

    // 获取相关知识
    getRelatedKnowledge(id, maxResults = 5) {
        const node = this.knowledgeGraph.nodes.get(id);
        if (!node) return [];

        const related = new Map(); // id -> 关联分数

        // 1. 同分类知识
        const sameCategory = this.knowledgeGraph.categories.get(node.category);
        if (sameCategory) {
            sameCategory.forEach(relatedId => {
                if (relatedId !== id) {
                    const currentScore = related.get(relatedId) || 0;
                    related.set(relatedId, currentScore + this.associationWeights.sameCategory);
                }
            });
        }

        // 2. 同标签知识
        node.tags.forEach(tag => {
            const tagEdges = this.knowledgeGraph.edges.get(tag);
            if (tagEdges) {
                tagEdges.forEach(relatedId => {
                    if (relatedId !== id) {
                        const currentScore = related.get(relatedId) || 0;
                        related.set(relatedId, currentScore + this.associationWeights.relatedCategory);
                    }
                });
            }
        });

        // 3. 最近使用的知识（时间关联）
        const now = new Date();
        for (const [otherId, otherNode] of this.knowledgeGraph.nodes.entries()) {
            if (otherId !== id && otherNode.lastUsed) {
                const hoursSince = (now - new Date(otherNode.lastUsed)) / (1000 * 60 * 60);
                if (hoursSince < 24) { // 24小时内使用过
                    const currentScore = related.get(otherId) || 0;
                    const timeWeight = Math.max(0, 1 - hoursSince / 24) * this.associationWeights.recentUsage;
                    related.set(otherId, currentScore + timeWeight);
                }
            }
        }

        // 转换为数组并排序
        const relatedArray = Array.from(related.entries())
            .map(([relatedId, score]) => {
                const relatedNode = this.knowledgeGraph.nodes.get(relatedId);
                return {
                    id: relatedId,
                    content: relatedNode.content,
                    category: relatedNode.category,
                    score: score,
                    reason: score >= this.associationWeights.sameCategory ? '同分类' :
                           score >= this.associationWeights.relatedCategory ? '同标签' : '最近使用'
                };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);

        return relatedArray;
    }

    // 获取随机知识
    getRandomKnowledge(options = {}) {
        const {
            category = null,
            excludeIds = [],
            minDifficulty = 1,
            maxDifficulty = 3,
            preference = 'balanced' // balanced, popular, recent, highRated
        } = options;

        // 过滤符合条件的知识
        let candidates = [];
        for (const [id, node] of this.knowledgeGraph.nodes.entries()) {
            if (excludeIds.includes(id)) continue;
            if (category && node.category !== category) continue;
            if (node.difficulty < minDifficulty || node.difficulty > maxDifficulty) continue;

            candidates.push({
                id: id,
                node: node,
                weight: this.calculateSelectionWeight(node, preference)
            });
        }

        if (candidates.length === 0) return null;

        // 根据权重随机选择
        const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
        let random = Math.random() * totalWeight;

        for (const candidate of candidates) {
            random -= candidate.weight;
            if (random <= 0) {
                return {
                    id: candidate.id,
                    content: candidate.node.content,
                    category: candidate.node.category,
                    tags: candidate.node.tags,
                    difficulty: candidate.node.difficulty,
                    usageCount: candidate.node.usageCount,
                    rating: candidate.node.rating
                };
            }
        }

        // 如果权重计算有问题，返回第一个
        const first = candidates[0];
        return {
            id: first.id,
            content: first.node.content,
            category: first.node.category,
            tags: first.node.tags,
            difficulty: first.node.difficulty,
            usageCount: first.node.usageCount,
            rating: first.node.rating
        };
    }

    // 计算选择权重
    calculateSelectionWeight(node, preference) {
        let weight = 1;

        switch (preference) {
            case 'popular':
                // 更常使用的知识权重更高
                weight += Math.log(node.usageCount + 1) * 2;
                break;

            case 'recent':
                // 最近使用的知识权重更高
                if (node.lastUsed) {
                    const hoursSince = (new Date() - new Date(node.lastUsed)) / (1000 * 60 * 60);
                    weight += Math.max(0, 10 - hoursSince) * 0.5;
                }
                break;

            case 'highRated':
                // 评分高的知识权重更高
                weight += node.rating * 0.5;
                break;

            case 'balanced':
            default:
                // 平衡选择：考虑使用频率、评分和新鲜度
                weight += Math.log(node.usageCount + 1) * 0.5;
                weight += node.rating * 0.3;
                if (node.lastUsed) {
                    const daysSince = (new Date() - new Date(node.lastUsed)) / (1000 * 60 * 60 * 24);
                    weight += Math.max(0, 7 - daysSince) * 0.2;
                }
                break;
        }

        return weight;
    }

    // 获取知识统计
    getStatistics() {
        const stats = {
            total: 0,
            byCategory: {},
            byDifficulty: { 1: 0, 2: 0, 3: 0 },
            userAdded: 0,
            totalUsage: 0,
            averageRating: 0,
            mostUsed: null,
            recentlyAdded: []
        };

        let totalRating = 0;
        let ratedCount = 0;
        let maxUsage = 0;

        // 统计所有知识
        for (const [id, node] of this.knowledgeGraph.nodes.entries()) {
            stats.total++;

            // 分类统计
            if (!stats.byCategory[node.category]) {
                stats.byCategory[node.category] = 0;
            }
            stats.byCategory[node.category]++;

            // 难度统计
            stats.byDifficulty[node.difficulty]++;

            // 用户添加统计
            if (node.userAdded) {
                stats.userAdded++;
            }

            // 使用统计
            stats.totalUsage += node.usageCount;

            // 评分统计
            if (node.rating > 0) {
                totalRating += node.rating;
                ratedCount++;
            }

            // 最常用知识
            if (node.usageCount > maxUsage) {
                maxUsage = node.usageCount;
                stats.mostUsed = {
                    id: id,
                    content: node.content,
                    usageCount: node.usageCount
                };
            }
        }

        // 计算平均评分
        if (ratedCount > 0) {
            stats.averageRating = totalRating / ratedCount;
        }

        // 最近添加的知识（用户添加的）
        stats.recentlyAdded = this.userKnowledge.added
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(item => ({
                id: item.id,
                content: item.content,
                createdAt: item.createdAt
            }));

        return stats;
    }

    // 导出知识库
    exportKnowledge(format = 'json') {
        const data = {
            knowledgeBase: this.knowledgeBase,
            userKnowledge: this.userKnowledge,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);

            case 'csv':
                // 简化的CSV导出
                let csv = 'ID,Content,Category,Tags,Difficulty,UsageCount,Rating\n';
                for (const [id, node] of this.knowledgeGraph.nodes.entries()) {
                    const tags = node.tags.join(';');
                    csv += `"${id}","${node.content.replace(/"/g, '""')}","${node.category}","${tags}",${node.difficulty},${node.usageCount},${node.rating}\n`;
                }
                return csv;

            default:
                return JSON.stringify(data);
        }
    }

    // 导入知识库
    importKnowledge(data, merge = true) {
        try {
            const imported = typeof data === 'string' ? JSON.parse(data) : data;

            if (!imported.knowledgeBase || !imported.userKnowledge) {
                throw new Error('无效的知识库数据格式');
            }

            if (merge) {
                // 合并导入
                this.knowledgeBase = this.mergeKnowledgeBases(this.knowledgeBase, imported.knowledgeBase);
                this.userKnowledge = this.mergeUserKnowledge(this.userKnowledge, imported.userKnowledge);
            } else {
                // 替换现有
                this.knowledgeBase = imported.knowledgeBase;
                this.userKnowledge = imported.userKnowledge;
            }

            // 重建知识图谱
            this.rebuildKnowledgeGraph();

            // 保存
            this.saveKnowledgeBase();

            return {
                success: true,
                importedCount: Object.values(imported.knowledgeBase).flat().length,
                userItems: imported.userKnowledge.added.length
            };

        } catch (error) {
            console.error('导入知识库失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 合并用户知识
    mergeUserKnowledge(existing, imported) {
        const merged = {
            added: [...existing.added],
            modified: [...existing.modified],
            favorites: [...existing.favorites],
            usage: { ...existing.usage },
            ratings: { ...existing.ratings }
        };

        // 合并添加的知识（避免重复）
        const existingIds = new Set(existing.added.map(item => item.id));
        imported.added.forEach(item => {
            if (!existingIds.has(item.id)) {
                merged.added.push(item);
            }
        });

        // 合并修改记录
        merged.modified.push(...imported.modified);

        // 合并收藏
        imported.favorites.forEach(id => {
            if (!merged.favorites.includes(id)) {
                merged.favorites.push(id);
            }
        });

        // 合并使用记录（取最大值）
        for (const [id, usage] of Object.entries(imported.usage)) {
            if (!merged.usage[id] || usage.count > merged.usage[id].count) {
                merged.usage[id] = usage;
            }
        }

        // 合并评分（取最新）
        for (const [id, rating] of Object.entries(imported.ratings)) {
            if (!merged.ratings[id] || new Date(rating.ratedAt) > new Date(merged.ratings[id].ratedAt)) {
                merged.ratings[id] = rating;
            }
        }

        return merged;
    }

    // 清理旧数据
    cleanupOldData(maxAgeDays = 30) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - maxAgeDays);

        let cleaned = 0;

        // 清理旧的使用记录上下文
        for (const [id, usage] of Object.entries(this.userKnowledge.usage)) {
            if (usage.contexts) {
                const originalLength = usage.contexts.length;
                this.userKnowledge.usage[id].contexts = usage.contexts.filter(context => {
                    return new Date(context.timestamp) > cutoff;
                });
                cleaned += originalLength - this.userKnowledge.usage[id].contexts.length;
            }
        }

        // 清理标记为删除的旧知识
        for (const [category, items] of Object.entries(this.knowledgeBase)) {
            const toRemove = [];
            items.forEach((item, index) => {
                if (item.deleted && item.deletedAt && new Date(item.deletedAt) < cutoff) {
                    toRemove.push(index);
                }
            });

            // 从后往前删除
            toRemove.reverse().forEach(index => {
                items.splice(index, 1);
                cleaned++;
            });
        }

        if (cleaned > 0) {
            this.rebuildKnowledgeGraph();
            this.saveKnowledgeBase();
        }

        return cleaned;
    }

    // 获取知识库状态
    getStatus() {
        const stats = this.getStatistics();
        return {
            totalKnowledge: stats.total,
            categories: Object.keys(stats.byCategory).length,
            userAdded: stats.userAdded,
            totalUsage: stats.totalUsage,
            averageRating: stats.averageRating.toFixed(2),
            lastCleanup: new Date().toISOString(),
            graphSize: {
                nodes: this.knowledgeGraph.nodes.size,
                edges: this.knowledgeGraph.edges.size,
                categories: this.knowledgeGraph.categories.size
            }
        };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KnowledgeManager;
}