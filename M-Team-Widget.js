// M-Team 用户信息小组件
// 使用方法：在Scriptable中添加组件参数为您的API Key

// 获取API Key
const apiKey = args.widgetParameter || "";


if (!apiKey) {
  const errorWidget = new ListWidget();
  errorWidget.backgroundColor = new Color("#FF3B30");
  const errorText = errorWidget.addText("❌ Please set the API Key first.");
  errorText.textColor = Color.white();
  errorText.font = Font.boldSystemFont(12);
  errorText.centerAlignText();
  Script.setWidget(errorWidget);
  Script.complete();
  return;
}

// 格式化字节大小
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 计算天数差
function getDaysDifference(dateString) {
  const targetDate = new Date(dateString);
  const today = new Date();
  const diffTime = today - targetDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// 获取用户数据
async function getUserData() {
  try {
    const request = new Request("https://api.m-team.cc/api/member/profile");
    request.method = "POST";
    request.headers = {
      "X-Api-Key": apiKey,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "M-Team-Widget/1.0"
    };
    
    const response = await request.loadJSON();
    
    if (response.code === "0") {
      return response.data;
    } else {
      throw new Error(response.message || "API request failed.");
    }
  } catch (error) {
    console.error("Failed to retrieve data:", error);
    throw error;
  }
}

// 创建小组件
function createWidget(userData) {
  const widget = new ListWidget();
  widget.backgroundColor = new Color("#1C1C1E");
  widget.spacing = 2;
  
  // 标题栏
  const titleStack = widget.addStack();
  titleStack.layoutHorizontally();
  titleStack.centerAlignContent();
  
  const titleText = titleStack.addText("MTEAM");
  titleText.font = Font.boldSystemFont(14);
  titleText.textColor = new Color("#efcd6b");
  
  titleStack.addSpacer();
  
  const updateTime = new Date(userData.memberCount.lastModifiedDate).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  

  // 更新时间
  const usernameText = titleStack.addText(updateTime);
  usernameText.font = Font.mediumSystemFont(8);
  usernameText.textColor = Color.white();
  
  widget.addSpacer(4);
  
  // 第一行：用户名
  const firstRow = widget.addStack();
  firstRow.layoutHorizontally();
  
  const idText = firstRow.addText(`👤 ${userData.username}`);
  idText.font = Font.mediumSystemFont(12);
  
  const joinDays = getDaysDifference(userData.createdDate);
  const joinText = firstRow.addText(` 📅 ${joinDays}Days`);
  joinText.font = Font.mediumSystemFont(12);
  
  widget.addSpacer(2);
  
  // 第二行：分享率和发布数量
  const secondRow = widget.addStack();
  secondRow.layoutHorizontally();
  const shareRateValue = parseFloat(userData.memberCount.shareRate);
  const shareRateColor = shareRateValue >= 1.0 ? new Color("#30D158") : new Color("#FF3B30");
  const shareRateText = secondRow.addText(`📊 ${shareRateValue.toFixed(2)}`);
  shareRateText.font = Font.mediumSystemFont(12);
  shareRateText.textColor = shareRateColor;
  
  secondRow.addSpacer();

  const uploadCountText = secondRow.addText(`📤 ${userData.memberCount.uploadReset}`);
  uploadCountText.font = Font.mediumSystemFont(12);

  
  
  widget.addSpacer(2);
  
  // 第三行：上传量
  const thirdRow = widget.addStack();
  const uploadText = thirdRow.addText(`⬆️ ${formatBytes(parseInt(userData.memberCount.uploaded))}`);
  uploadText.font = Font.mediumSystemFont(12);
  uploadText.textColor = new Color("#34C759");
  
  widget.addSpacer(2);
  
  // 第四行：下载量
  const fourthRow = widget.addStack();
  const downloadText = fourthRow.addText(`⬇️ ${formatBytes(parseInt(userData.memberCount.downloaded))}`);
  downloadText.font = Font.mediumSystemFont(12);
  downloadText.textColor = new Color("#821c0c");
  
  widget.addSpacer(2);
  
  // 第五行：魔力值
  const fifthRow = widget.addStack();

  const bonusText = fifthRow.addText(`✨ ${parseFloat(userData.memberCount.bonus).toFixed(1)}`);
  bonusText.font = Font.mediumSystemFont(12);



  return widget;
}

// 创建错误组件
function createErrorWidget(error) {
  const widget = new ListWidget();
  widget.backgroundColor = new Color("#FF3B30");
  
  const errorText = widget.addText("❌ Data load failed.");
  errorText.textColor = Color.white();
  errorText.font = Font.boldSystemFont(12);
  errorText.centerAlignText();
  
  widget.addSpacer(4);
  
  const detailText = widget.addText(error.message || "Unknown error.");
  detailText.textColor = Color.white();
  detailText.font = Font.mediumSystemFont(10);
  detailText.centerAlignText();
  
  return widget;
}

// 主函数
async function main() {
  try {
    const userData = await getUserData();
    const widget = createWidget(userData);
    
    if (config.runsInWidget) {
      Script.setWidget(widget);
    } else {
      await widget.presentSmall();
    }
  } catch (error) {
    console.error("小组件运行错误:", error);
    const errorWidget = createErrorWidget(error);
    
    if (config.runsInWidget) {
      Script.setWidget(errorWidget);
    } else {
      await errorWidget.presentSmall();
    }
  }
  
  Script.complete();
}

// 运行主函数
await main(); 