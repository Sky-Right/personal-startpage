export const defaults = {
  theme: 'system',
  wallpaper: 'mountains',
  engine: 'bing',
  openInNewTab: true,
};

export const wallpapers = [
  {
    id: 'mountains',
    name: 'Mountain view',
    image: './assets/mountains.webp',
    srcset: './assets/mountains-small.webp 960w, ./assets/mountains.webp 2048w',
    credit: 'Dmytro Koplyk',
    source: 'https://unsplash.com/photos/ODcUS4Nqhjg',
  },
  { id: 'solid', name: 'Solid color' },
];

export const favorites = ['chatgpt', 'claude', 'deepseek', 'scholar', 'arxiv', 'github'];

export const categories = [
  {
    id: 'campus', name: 'Campus', icon: 'graduation-cap',
    sites: [
      { id: 'buct', name: 'BUCT Home', url: 'https://www.buct.edu.cn/', logo: 'buct.png', keywords: 'BUCT 北京化工大学 北化官网' },
      { id: 'academic', name: 'Academic Affairs', url: 'https://jwglxt.buct.edu.cn/', icon: 'graduation-cap', note: 'University sign-in', keywords: '选课 成绩 课表 教务系统 统一身份认证' },
      { id: 'portal', name: 'Campus Portal', url: 'https://i.buct.edu.cn/', icon: 'buildings', note: 'WebVPN off campus', keywords: 'i北化 数字校园 办事大厅 信息门户 校外通过 WebVPN' },
      { id: 'library', name: 'BUCT Library', url: 'https://library.buct.edu.cn/', icon: 'books', note: 'Catalog and journals', keywords: '数据库 CARSI 借阅 图书馆 馆藏与订阅资源' },
      { id: 'course', name: 'BUCT Online', url: 'https://course.buct.edu.cn/meol/loginCheck.do', icon: 'book-open', note: 'WebVPN off campus', keywords: '课程 作业 学习 北化在线 校外可用 WebVPN' },
      { id: 'mail', name: 'Campus Email', url: 'https://mail.buct.edu.cn/', icon: 'envelope-simple', keywords: '邮件 邮箱 校园邮箱' },
      { id: 'vpn', name: 'WebVPN', url: 'https://w.buct.edu.cn/', icon: 'shield-check', note: 'Off-campus access', keywords: '校外访问 远程 VPN 校外访问校内服务' },
    ],
  },
  {
    id: 'ai', name: 'AI Tools', icon: 'sparkle',
    sites: [
      { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com/', logo: 'openai.svg', invert: true, keywords: 'OpenAI GPT' },
      { id: 'claude', name: 'Claude', url: 'https://claude.ai/', logo: 'claude.svg', keywords: 'Anthropic' },
      { id: 'deepseek', name: 'DeepSeek', url: 'https://chat.deepseek.com/', logo: 'deepseek.svg', keywords: '深度求索 深度思考' },
      { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com/', logo: 'gemini.svg', keywords: 'Google AI' },
      { id: 'kimi', name: 'Kimi', url: 'https://www.kimi.com/', logo: 'kimi.svg', invert: true, keywords: '月之暗面 Moonshot' },
    ],
  },
  {
    id: 'research', name: 'Research', icon: 'book-open',
    sites: [
      { id: 'scholar', name: 'Google Scholar', url: 'https://scholar.google.com/', logo: 'googlescholar.svg', keywords: 'Google Scholar 谷歌学术 论文 Google 学术' },
      { id: 'arxiv', name: 'arXiv', url: 'https://arxiv.org/', logo: 'arxiv.svg', keywords: '预印本 论文' },
      { id: 'wos', name: 'Web of Science', url: 'https://www.webofscience.com/', logo: 'wos.png', note: 'Via BUCT Library', keywords: 'WOS SCI 科睿唯安 引文 可经北化图书馆访问' },
      { id: 'sciencedirect', name: 'ScienceDirect', url: 'https://www.sciencedirect.com/', logo: 'elsevier.svg', keywords: 'Elsevier 爱思唯尔 文献' },
      { id: 'ieee', name: 'IEEE Xplore', url: 'https://ieeexplore.ieee.org/', logo: 'ieee.svg', keywords: 'IEEE 计算机 会议论文' },
      { id: 'cnki', name: 'CNKI', url: 'https://www.cnki.net/', logo: 'cnki.png', keywords: 'CNKI 中文论文 中国知网' },
    ],
  },
  {
    id: 'dev', name: 'Development', icon: 'code',
    sites: [
      { id: 'github', name: 'GitHub', url: 'https://github.com/', logo: 'github.svg', invert: true, keywords: '代码 仓库 Git' },
      { id: 'huggingface', name: 'Hugging Face', url: 'https://huggingface.co/', logo: 'huggingface.svg', keywords: 'HF 模型 数据集' },
      { id: 'colab', name: 'Colab', url: 'https://colab.research.google.com/', logo: 'googlecolab.svg', keywords: 'Google Colab Notebook GPU Python' },
      { id: 'stackoverflow', name: 'Stack Overflow', url: 'https://stackoverflow.com/', logo: 'stackoverflow.svg', keywords: '编程 问答' },
    ],
  },
  {
    id: 'study', name: 'Productivity', icon: 'folder',
    sites: [
      { id: 'overleaf', name: 'Overleaf', url: 'https://www.overleaf.com/', logo: 'overleaf.svg', keywords: 'LaTeX 排版 论文写作' },
      { id: 'zotero', name: 'Zotero', url: 'https://www.zotero.org/', logo: 'zotero.svg', keywords: '参考文献 引用' },
      { id: 'notion', name: 'Notion', url: 'https://www.notion.so/', logo: 'notion.svg', invert: true, keywords: '笔记 文档' },
      { id: 'deepl', name: 'DeepL', url: 'https://www.deepl.com/translator', logo: 'deepl.svg', invert: true, keywords: '翻译' },
      { id: 'drive', name: 'Google Drive', url: 'https://drive.google.com/', logo: 'googledrive.png', keywords: '网盘 云盘 文档' },
    ],
  },
  {
    id: 'daily', name: 'Explore', icon: 'globe',
    sites: [
      { id: 'bilibili', name: 'Bilibili', url: 'https://www.bilibili.com/', logo: 'bilibili.svg', keywords: 'B站 bilibili 视频 哔哩哔哩' },
      { id: 'zhihu', name: 'Zhihu', url: 'https://www.zhihu.com/', logo: 'zhihu.svg', keywords: '社区 问答 知乎' },
      { id: 'sspai', name: 'SSPAI', url: 'https://sspai.com/', logo: 'sspai.png', keywords: 'sspai 数字生活 软件 少数派' },
    ],
  },
];
