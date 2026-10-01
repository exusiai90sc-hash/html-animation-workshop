"use strict";
// 优先使用项目依赖；也可通过环境变量指定已有 node_modules。
const path = require("path");
function dependency(name) {
  try { return require(name); }
  catch (error) {
    if (error.code !== "MODULE_NOT_FOUND" || !error.message.includes("'" + name + "'")) throw error;
    const candidates = [process.env.ANIMATION_RENDER_NODE_MODULES].filter(Boolean);
    for (const root of candidates) {
      try { return require(path.join(root, name)); }
      catch (fallbackError) { if (fallbackError.code !== "MODULE_NOT_FOUND") throw fallbackError; }
    }
    throw new Error("缺少渲染依赖 " + name + "。请按 工具/package.json 准备依赖，或设置 ANIMATION_RENDER_NODE_MODULES 指向已有 node_modules", {cause:error});
  }
}
module.exports = dependency;
