import pandas as pd
import matplotlib.pyplot as plt

# 1. 读取数据
df = pd.read_json('youtube_comments.json', lines=True)

# 查看实际字段名
print("实际字段名:")
print(df.columns.tolist())

# 2. 数据清洗
# 使用实际存在的字段
core_df = df[['author', 'text', 'time', 'votes', 'replies']].copy()

# 转换时间格式
core_df['time'] = pd.to_datetime(core_df['time'], errors='coerce')

# 添加评论长度字段
core_df['text_length'] = core_df['text'].str.len()

print("\n清洗后的数据基本信息:")
print(core_df.info())

# 3. 数据分析
# 点赞数统计
print("\n点赞数统计:")
print(core_df['votes'].describe())

# 评论长度统计
print("\n评论长度统计:")
print(core_df['text_length'].describe())

# 点赞数最高的10条评论
print("\n点赞数最高的10条评论:")
top_liked = core_df.sort_values(by='votes', ascending=False).head(10)
print(top_liked[['author', 'text', 'votes']])

# 4. 可视化
plt.figure(figsize=(10, 6))
core_df['votes'].hist(bins=50)
plt.title('评论点赞数分布')
plt.xlabel('点赞数')
plt.ylabel('评论数')
plt.savefig('likes_distribution.png')
plt.close()

# 5. 导出结果
core_df.to_csv('youtube_comments_analysis.csv', index=False, encoding='utf-8')
print("\n分析完成！结果已导出到 youtube_comments_analysis.csv")
