# SkyRight

面向校园事务、AI 工具、科研和开发的个人导航。首屏聚合时间、搜索和 6 个常用网站。界面使用英文。目录收录 30 个入口，按 Campus、AI Tools、Research、Development、Productivity 和 Explore 分组。站内搜索也支持原有中文别名。

## 本地运行

需要 Python 3 和 Node.js 22 或更新版本。项目没有 npm 依赖。

```sh
npm run dev
```

在浏览器打开 [本地预览](http://127.0.0.1:4173/)。更改配置或样式后刷新页面。

```sh
npm run build
python3 -m http.server --bind 127.0.0.1 --directory dist 4173
```

构建会校验分类、常用网站及页面引用的本地资源，并将上线文件复制到 `dist/`。若开发服务器仍在运行，先停止它或为产物预览换一个端口。

## 日常使用

- 按 `/`、`Ctrl + K` 或 `⌘ + K` 聚焦搜索。直接回车会使用选中的引擎搜索网页。按 `↓` 进入站内匹配，回车打开该网站，按 `Esc` 收起匹配列表。
- 在搜索框左侧选 Bing、Google 或百度。设置面板可选跟随系统、浅色或深色，以及山景或纯色背景。选择保存在当前浏览器。
- 校外访问北化信息门户等校内业务时，先打开目录中的 WebVPN，再从其中进入对应服务。教务系统接入统一身份认证。查阅订阅文献时，可从图书馆首页选择资源，具体访问方式以图书馆说明为准。[北化 WebVPN 说明](https://vpn.buct.edu.cn/main.htm) · [在校外访问数字校园的校方说明](https://vpn.buct.edu.cn/2022/0928/c12807a172089/page.htm) · [图书馆校外访问说明](https://library.buct.edu.cn/jszc/list.htm)

## 修改导航

在 [config.js](./config.js) 中维护以下内容。

| 配置 | 修改方式 |
| --- | --- |
| `categories` | 数组顺序决定分类顺序，分类内 `sites` 的顺序决定入口顺序。分类和网站的 ID 各自唯一。 |
| `favorites` | 按顺序填写网站的 `id`。置空即可隐藏常用区。 |
| `defaults` | 修改首次访问时的主题、背景、搜索引擎，以及网站默认是否在新标签页打开。单个网站可通过 `openInNewTab` 覆盖。 |
| `wallpapers` | 将背景图放在 `assets/`，填写相对路径 `image`。可选填 `srcset`、`credit`、`source`。 |

网站配置示例

```js
{
  id: 'github',
  name: 'GitHub',
  url: 'https://github.com/',
  logo: 'github.svg',
  invert: true,
  keywords: '代码 仓库 Git',
}
```

`logo` 使用 `assets/icons/` 内的文件名。小尺寸图标优先用 SVG，位图建议使用清晰的方形 PNG。深色单色标志可以用 `invert: true` 提升深色主题的可见度。还可以用 `icon` 选择 `assets/ui.svg` 中的线条图标。图片缺失时显示配置的线条图标或站名首字。可用 `note` 在站名下显示访问提示，用 `keywords` 添加站内搜索别名。

## 发布到 GitHub Pages

1. 在 GitHub 上创建或选用目标仓库，把这个目录的源文件推送到 `main` 分支。构建产物 `dist/` 由工作流生成。
2. 在仓库的 **Settings → Pages → Build and deployment** 中，将 **Source** 设为 **GitHub Actions**。[GitHub Pages 发布源说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
3. 在 **Actions → Deploy to GitHub Pages** 中选择 **Run workflow**。后续推送到 `main` 会自动部署。发布完成后，从工作流或 **Settings → Pages** 复制站点地址。工作流见 [pages.yml](./.github/workflows/pages.yml)。

将站点 URL 填入 Chrome 或 Edge 的启动页面设置，或 Safari 的主页设置。若要覆盖 Chrome 或 Edge 每次按新建标签页打开的默认页面，还需使用支持自定义 URL 的新标签页扩展。[Chrome 启动页设置](https://support.google.com/chrome/answer/95314) · [Microsoft 浏览器主页说明](https://support.microsoft.com/en-us/edge/change-your-browser-home-page)

## 视觉规范

- SkyRight、Favorites 和 Directory 采用 Pinyon Script，使用字体自带的字偶间距和上下文连字。分类标题用 Instrument Serif，控件和网站名称用 Instrument Sans。时钟采用 48px 等宽数字，日期置于下一行，小屏时钟为 36px。
- 浅色用雾蓝和暖白，深色用石板蓝和炭灰。山景从天空延伸到收藏区上方，经纵向遮罩融入纸面。内容区、分隔线和控件共用 [styles.css](./styles.css) 中的明暗色值。
- 目录采用统一的 8px 间距节奏和 36px 图标容器，收藏图标为 40px。控件和面板分别用 8px 和 16px 圆角，阴影用于搜索框、搜索结果和设置面板。
- 搜索、分类和链接都提供悬停和键盘焦点反馈。入场和背景使用有限次数的 CSS 动画。开启减少动态效果后，界面停止这些动画。

## 设计参考与资源许可

- 青柠起始页提供首屏搜索和快捷访问的参考，Bonjourr 提供时钟与摄影的参考，nightTab 提供书签分组与背景定制的参考，Raycast 提供搜索快捷键与站点别名的参考。页面使用原生 HTML、CSS 和 JavaScript 实现，图标、字体和照片均随站点发布。[青柠起始页](https://limestart.cn/) · [Bonjourr](https://github.com/victrme/Bonjourr) · [nightTab](https://github.com/zombieFox/nightTab) · [Raycast Quicklinks](https://manual.raycast.com/quicklinks)
- 个人站点与摄影作品集方面，调研了 Craig Mod 的图文层级与 Alex Strohl Studio 以照片为主体的页面编排。[Craig Mod](https://craigmod.com/) · [Alex Strohl Studio](https://www.alexstrohl.com/)
- 页面上部使用 Dmytro Koplyk 的阿巴拉契亚山景摄影，按设备分辨率提供 960px 和 2048px 两种 WebP 尺寸。照片遵循 Unsplash License。[照片原页](https://unsplash.com/photos/ODcUS4Nqhjg) · [Unsplash License](https://unsplash.com/license)
- 用真实头像和三个标题在浏览器中比较了 Pinyon Script、Allura、Parisienne、Italianno 和 Great Vibes。Pinyon Script 的字宽、粗细对比和连笔适合当前的展示尺度。三款在用字体均在站内加载，遵循 SIL OFL 1.1。[Pinyon Script](https://fontsource.org/fonts/pinyon-script/about) · [Instrument Serif](https://fontsource.org/fonts/instrument-serif/about) · [Instrument Sans](https://fontsource.org/fonts/instrument-sans/about) · [随附字体许可](./assets/fonts/)
- 个人头像取自 Sky-Right 的公开 GitHub 资料，随站点提供头像缩略图与 favicon。[Sky-Right](https://github.com/Sky-Right)
- 山景进入时以单次 CSS 变换缓慢归位，交互反馈主要使用位移和透明度。视觉处理参考 Linear 的界面层级与 Apple 的动效建议，并调研了 simpleParallax.js、basicScroll 和 Motion 的实现。页面会遵循系统的减少动态效果偏好。[Linear 界面设计](https://linear.app/now/how-we-redesigned-the-linear-ui) · [Apple 动效指南](https://developer.apple.com/design/human-interface-guidelines/motion) · [simpleParallax.js](https://github.com/geosigno/simpleParallax.js) · [basicScroll](https://github.com/electerious/basicScroll) · [Motion](https://github.com/motiondivision/motion)
- 线条图标来自 Phosphor Icons 2.1.1，遵循 MIT。AI 与部分应用品牌图标来自 LobeHub Icons 1.102.0，遵循 MIT。其余部分品牌来自 Simple Icons 16.37.0，项目使用 CC0，单个品牌的权利以品牌方声明为准。[Phosphor 许可](./assets/licenses/phosphor.txt) · [LobeHub 许可](./assets/licenses/lobe-icons.txt) · [Simple Icons 许可](./assets/licenses/simple-icons.txt) · [品牌使用声明](https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md)
- 北化官网、Web of Science、中国知网、Google Drive 和少数派使用对应网站发布的校徽或 favicon。品牌标识仅用于识别对应外部入口，权利归各品牌方所有。[北化校徽](https://www.buct.edu.cn/_upload/tpl/01/f4/500/template500/images/logo1.svg) · [Web of Science](https://www.webofscience.com/wos/static/favicon.png) · [中国知网](https://www.cnki.net/favicon.ico) · [Google Drive](https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png) · [少数派](https://cdn-static.sspai.com/favicon/sspai.ico)
