export const defaults = {
  theme: 'system',
  wallpaper: 'mountains',
  engine: 'bing',
  openInNewTab: true,
};

export const wallpapers = [
  {
    id: 'mountains',
    name: '山景',
    image: './assets/mountains.webp',
    srcset: './assets/mountains-small.webp 640w, ./assets/mountains.webp 1320w',
    credit: 'Dmytro Koplyk',
    source: 'https://unsplash.com/photos/ODcUS4Nqhjg',
  },
  { id: 'solid', name: '纯色' },
];

export const favorites = ['chatgpt', 'claude', 'deepseek', 'scholar', 'arxiv', 'github'];

export const categories = [
  {
    id: 'campus', name: '北化校园', icon: 'graduation-cap',
    sites: [
      { id: 'buct', name: '北化官网', url: 'https://www.buct.edu.cn/', logo: 'buct.png', keywords: 'BUCT 北京化工大学' },
      { id: 'academic', name: '教务系统', url: 'https://jwglxt.buct.edu.cn/', icon: 'graduation-cap', note: '统一身份认证', keywords: '选课 成绩 课表' },
      { id: 'portal', name: '信息门户', url: 'https://i.buct.edu.cn/', icon: 'buildings', note: '校外通过 WebVPN', keywords: 'i北化 数字校园 办事大厅' },
      { id: 'library', name: '图书馆', url: 'https://library.buct.edu.cn/', icon: 'books', note: '馆藏与订阅资源', keywords: '数据库 CARSI 借阅' },
      { id: 'course', name: '北化在线', url: 'https://course.buct.edu.cn/meol/loginCheck.do', icon: 'book-open', note: '校外可用 WebVPN', keywords: '课程 作业 学习' },
      { id: 'mail', name: '校园邮箱', url: 'https://mail.buct.edu.cn/', icon: 'envelope-simple', keywords: '邮件 邮箱' },
      { id: 'vpn', name: 'WebVPN', url: 'https://w.buct.edu.cn/', icon: 'shield-check', note: '校外访问校内服务', keywords: '校外访问 远程 VPN' },
    ],
  },
  {
    id: 'ai', name: 'AI 工具', icon: 'sparkle',
    sites: [
      { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com/', logo: 'openai.svg', invert: true, keywords: 'OpenAI GPT' },
      { id: 'claude', name: 'Claude', url: 'https://claude.ai/', logo: 'claude.svg', keywords: 'Anthropic' },
      { id: 'deepseek', name: 'DeepSeek', url: 'https://chat.deepseek.com/', logo: 'deepseek.svg', keywords: '深度求索 深度思考' },
      { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com/', logo: 'gemini.svg', keywords: 'Google AI' },
      { id: 'kimi', name: 'Kimi', url: 'https://www.kimi.com/', logo: 'kimi.svg', invert: true, keywords: '月之暗面 Moonshot' },
    ],
  },
  {
    id: 'research', name: '学术科研', icon: 'book-open',
    sites: [
      { id: 'scholar', name: 'Google 学术', url: 'https://scholar.google.com/', logo: 'googlescholar.svg', keywords: 'Google Scholar 谷歌学术 论文' },
      { id: 'arxiv', name: 'arXiv', url: 'https://arxiv.org/', logo: 'arxiv.svg', keywords: '预印本 论文' },
      { id: 'wos', name: 'Web of Science', url: 'https://www.webofscience.com/', logo: 'wos.png', note: '可经北化图书馆访问', keywords: 'WOS SCI 科睿唯安 引文' },
      { id: 'sciencedirect', name: 'ScienceDirect', url: 'https://www.sciencedirect.com/', logo: 'elsevier.svg', keywords: 'Elsevier 爱思唯尔 文献' },
      { id: 'ieee', name: 'IEEE Xplore', url: 'https://ieeexplore.ieee.org/', logo: 'ieee.svg', keywords: 'IEEE 计算机 会议论文' },
      { id: 'cnki', name: '中国知网', url: 'https://www.cnki.net/', logo: 'cnki.png', keywords: 'CNKI 中文论文' },
    ],
  },
  {
    id: 'dev', name: '开发与实验', icon: 'code',
    sites: [
      { id: 'github', name: 'GitHub', url: 'https://github.com/', logo: 'github.svg', invert: true, keywords: '代码 仓库 Git' },
      { id: 'huggingface', name: 'Hugging Face', url: 'https://huggingface.co/', logo: 'huggingface.svg', keywords: 'HF 模型 数据集' },
      { id: 'colab', name: 'Colab', url: 'https://colab.research.google.com/', logo: 'googlecolab.svg', keywords: 'Google Colab Notebook GPU Python' },
      { id: 'stackoverflow', name: 'Stack Overflow', url: 'https://stackoverflow.com/', logo: 'stackoverflow.svg', keywords: '编程 问答' },
    ],
  },
  {
    id: 'study', name: '写作与效率', icon: 'folder',
    sites: [
      { id: 'overleaf', name: 'Overleaf', url: 'https://www.overleaf.com/', logo: 'overleaf.svg', keywords: 'LaTeX 排版 论文写作' },
      { id: 'zotero', name: 'Zotero', url: 'https://www.zotero.org/', logo: 'zotero.svg', keywords: '参考文献 引用' },
      { id: 'notion', name: 'Notion', url: 'https://www.notion.so/', logo: 'notion.svg', invert: true, keywords: '笔记 文档' },
      { id: 'deepl', name: 'DeepL', url: 'https://www.deepl.com/translator', logo: 'deepl.svg', invert: true, keywords: '翻译' },
      { id: 'drive', name: 'Google Drive', url: 'https://drive.google.com/', logo: 'googledrive.png', keywords: '网盘 云盘 文档' },
    ],
  },
  {
    id: 'daily', name: '日常浏览', icon: 'globe',
    sites: [
      { id: 'bilibili', name: '哔哩哔哩', url: 'https://www.bilibili.com/', logo: 'bilibili.svg', keywords: 'B站 bilibili 视频' },
      { id: 'zhihu', name: '知乎', url: 'https://www.zhihu.com/', logo: 'zhihu.svg', keywords: '社区 问答' },
      { id: 'sspai', name: '少数派', url: 'https://sspai.com/', logo: 'sspai.png', keywords: 'sspai 数字生活 软件' },
    ],
  },
];
