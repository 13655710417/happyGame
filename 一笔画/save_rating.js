const fs = require('fs');
const path = require('path');

function saveRating(rating, comment = '') {
    const timestamp = new Date().toISOString();
    const ratingData = {
        timestamp: timestamp,
        rating: rating,
        comment: comment,
        version: '1.0'
    };

    // 定义评分文件路径
    const ratingFile = path.join(__dirname, 'game_ratings.json');

    try {
        let ratings = [];

        // 如果文件已存在，读取现有数据
        if (fs.existsSync(ratingFile)) {
            const fileContent = fs.readFileSync(ratingFile, 'utf8');
            try {
                ratings = JSON.parse(fileContent);
                if (!Array.isArray(ratings)) {
                    ratings = [];
                }
            } catch (e) {
                ratings = [];
            }
        }

        // 添加新评分
        ratings.push(ratingData);

        // 保存到文件
        fs.writeFileSync(ratingFile, JSON.stringify(ratings, null, 2), 'utf8');

        return { success: true, message: '评分已保存！' };
    } catch (error) {
        return { success: false, message: '保存失败：' + error.message };
    }
}

module.exports = { saveRating };
