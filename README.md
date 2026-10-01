# HTML 动画与杂物铺

一起制作 HTML 动画，顺手把素材、小工具和零散文件放在这里，方便分享和下载。

## 下载

- **整个项目打包下载：** [点击下载 ZIP](https://github.com/exusiai90sc-hash/html-animation-workshop/archive/refs/heads/main.zip)，解压后查看各目录。
- **下载单个文件：** 打开对应文件，在 GitHub 文件页面点击 **Download raw file（下载原始文件）**。
- **下载发布包：** [进入 Releases](https://github.com/exusiai90sc-hash/html-animation-workshop/releases)，下载以后发布的压缩包或其他附件。目前尚无发布包。

下载公开文件不需要成为项目协作者。

## 放什么、放哪里

| 目录 | 用途 |
| --- | --- |
| [animations/](animations/) | HTML 动画。每个作品单独一个文件夹，入口叫 `index.html`，相关图片、音频和脚本放在同一作品目录内。 |
| [assets/](assets/) | 多个作品共用的图片、音频、字体等素材。 |
| [downloads/](downloads/) | 可直接分享的零散文件、文档和小工具。 |

## 已有作品

- [保安·李长林](animations/baoan-li-changlin/)：60.505 秒 HTML 动画，包含播放页面、素材配置和逐帧视频导出工具。下载整个项目并解压后，打开 `animations/baoan-li-changlin/index.html`。作品目前无音频、无字幕，详见[作品说明](animations/baoan-li-changlin/README.md)。

## 如何一起制作

1. 提需求、讨论效果或报告问题：使用 [Issues](https://github.com/exusiai90sc-hash/html-animation-workshop/issues)。
2. 提交作品或修改：Fork 本仓库，在自己的副本中上传或修改文件，然后发起 Pull Request。
3. 需要直接修改本仓库的人：由仓库所有者在 **Settings → Collaborators** 中邀请；公开下载与直接修改权限是分开的。

上传时可在目标目录选择 **Add file → Upload files**。每个作品附上简短说明：做什么、怎么打开、用了哪些外部素材。

## 打开 HTML 动画

优先把作品做成可离线打开的页面。下载并解压完整作品文件夹后，双击其中的 `index.html`。如果作品需要本地服务、联网或其他运行条件，请在该作品的说明中写清楚。

GitHub 仓库文件页展示 HTML 源码；当前仓库提供文件下载，尚未启用在线动画预览。

## 本地协作

```bash
git clone https://github.com/exusiai90sc-hash/html-animation-workshop.git
cd html-animation-workshop
git switch -c add-my-animation
# 添加或修改作品文件后
git add animations/
git commit -m "Add my animation"
git push -u origin add-my-animation
```

以上推送需要仓库写入权限；通过 Fork 协作时，请克隆自己的副本。

上传内容会公开。仅提交可以公开分享的文件；第三方素材请注明来源和授权。各作品可以单独附带许可说明。
