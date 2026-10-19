export const CAMERA_PRESETS = Object.freeze({
  overview: Object.freeze({ label: '整机总览', position: [8.8, 6.4, 10.8], target: [0, 1.5, 0] }),
  board: Object.freeze({ label: '棋盘决定', position: [5.5, 6.8, 6.2], target: [-1.4, 0.7, 0] }),
  tree: Object.freeze({ label: '搜索树', position: [5.9, 4.1, 9.3], target: [1.35, 1.8, 2.35] }),
  node: Object.freeze({ label: '节点分工', position: [4.2, 2.7, 4.9], target: [2.3, 1.8, -0.4] }),
  chip: Object.freeze({ label: '芯片剖面', position: [7.2, 4.1, 4.8], target: [3.25, 1.72, 0.3] }),
});

const source = (id, url, locator) => Object.freeze({ id, url, locator });
const teaching = Object.freeze({ id: 'project-teaching', url: 'https://www.ibm.com/history/deep-blue', locator: '本页教学重建' });

export const STRATEGY_RECORDS = Object.freeze([
  Object.freeze({
    id: 'board-decision', order: 1, label: '01 / 棋盘决定', shortLabel: '决定', camera: 'board', accent: '#e5b36b',
    title: '先看棋盘上的这一手。',
    description: '机器面对的不是一个答案，而是一组必须互相比较的未来。先把局面放到桌面上，再问：如果我走这里，对手最强的回应是什么？',
    note: '教学局面：用于说明搜索关系，不复原某一局完整棋谱。',
    boundary: '棋盘与着法为教学局面；不把它标成 1997 年某局的原始棋谱。', source: teaching,
  }),
  Object.freeze({
    id: 'candidate-moves', order: 2, label: '02 / 候选着法', shortLabel: '候选', camera: 'board', accent: '#6eb5c7',
    title: '把一个局面变成可比较的候选。',
    description: '着法生成先筛掉不合法的走法，再把剩下的选择交给搜索。每支箭头都代表一个待验证的未来，硬件只负责把这一步做得足够快。',
    note: '着法生成、合法性过滤和局面复制是算法层的教学拆解。',
    boundary: '候选箭头是程序化教学数据，不是完整国际象棋引擎的合法着法列表。', source: source('S1', 'https://sjeng.org/ftp/deepblue.pdf', '§2 System Overview'),
  }),
  Object.freeze({
    id: 'minimax', order: 3, label: '03 / MINIMAX', shortLabel: '回传', camera: 'tree', accent: '#d9a85d',
    title: '己方取大，对手取小。',
    description: '轮到己方时取较大的评价，轮到对手时假设对方会把结果压到最小。叶子分值沿着搜索树回到根节点，机器由此比较每个第一步。',
    note: '树上的分值是固定教学参数，用来展示回传顺序。',
    boundary: '叶值不是 Deep Blue 比赛时的搜索日志；评价函数权重也不是公开的完整内部参数。', source: source('S1', 'https://sjeng.org/ftp/deepblue.pdf', '§3 Search'),
  }),
  Object.freeze({
    id: 'alpha-beta', order: 4, label: '04 / ALPHA-BETA', shortLabel: '剪枝', camera: 'tree', accent: '#b5d18b',
    title: '有些分支，已经不必走到底。',
    description: '当一个分支的下界已经不可能超过祖先手里的选择，剩下的叶子不会改变结论。Alpha-Beta 把它们标成可跳过的幽灵节点，根值保持不变。',
    note: '界限 α、β 和跳过原因会随单步事件变化。',
    boundary: '剪枝数来自这棵固定教学树，不代表比赛中的实际访问比例。', source: source('S1', 'https://sjeng.org/ftp/deepblue.pdf', '§3 Search'),
  }),
  Object.freeze({
    id: 'parallel-search', order: 5, label: '05 / 并行搜索', shortLabel: '并行', camera: 'node', accent: '#83b3e8',
    title: '同一棵树，被拆给许多节点。',
    description: '根节点下的工作被分配到搜索节点，再交给板卡上的专用芯片。30 个节点、每节点 2 张卡、每卡 8 颗芯片，是资料中的系统配置口径。',
    note: '速度数字带有历史条件；页面不会把它当成浏览器实测。',
    boundary: '30 × 2 × 8 与约每秒 2 亿局面采用历史来源的条件性口径。', source: source('S1', 'https://sjeng.org/ftp/deepblue.pdf', 'Table 1'),
  }),
  Object.freeze({
    id: 'chip-echo', order: 6, label: '06 / 芯片回声', shortLabel: '芯片', camera: 'chip', accent: '#d6a66d',
    title: '最后，决定落在一块专用芯片里。',
    description: '着法生成、局面评估、搜索控制与重复检测被拆成清晰的功能区。放大后看到的是关系示意：人的知识、软件搜索和硬件并行一起完成这一手。',
    note: '芯片剖面为功能关系的教学重建，不是公开裸片版图。',
    boundary: '功能区、键合线和封装层级用于解释，不声称还原真实裸片坐标。', source: source('S2', 'https://www.computerhistory.org/chess/doc-431615395d43e/', 'IEEE Micro 70–81 页'),
  }),
]);

export const ALGORITHM_CLAIMS = Object.freeze([
  Object.freeze({ id: 'node-configuration', label: '搜索配置', value: '30 节点 · 2 卡 / 节点 · 8 芯片 / 卡', source: 'S1', isTeachingData: true }),
  Object.freeze({ id: 'throughput-conditional', label: '历史速度口径', value: '约 2 亿局面 / 秒', source: 'S1', isTeachingData: true, qualifier: '条件性历史口径，不是本页实测' }),
  Object.freeze({ id: 'evaluation-weights', label: '评价函数', value: '子力 · 机动性 · 王安全 · 兵形', source: 'project-teaching', isTeachingData: true, qualifier: '权重为教学参数' }),
  Object.freeze({ id: 'chip-boundary', label: '芯片功能区', value: '四类功能关系示意', source: 'S2', isTeachingData: true, qualifier: '不是公开裸片版图' }),
]);
