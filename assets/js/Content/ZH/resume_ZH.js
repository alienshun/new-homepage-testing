(function () {
  window.RESUME_ZH_INNER_HTML = `
    <button id="toggle-btn">
      <span><i class="fas fa-sun"></i></span>
    </button>
    <div id="clock">GMT+8 00:00</div>
    <div class="container">

      <div class="section resume-hero" id="resume-hero">
        <div class="resume-hero-avatar">
          <img src="./assets/images/profile.jpg" alt="Profile photo">
        </div>
        <div class="resume-hero-body">
          <div class="resume-hero-name">陈璟皓</div>
          <div class="resume-hero-chips">
            <span class="contact-pill"><strong>电话: </strong><span>+86 18806590966</span></span>
            <span class="contact-pill"><strong>邮箱 1: </strong><a href="mailto:chenjinghao@mail.ustc.edu.cn">chenjinghao@mail.ustc.edu.cn</a></span>
            <span class="contact-pill"><strong>邮箱 2: </strong><a href="mailto:stardust.math26@gmail.com">stardust.math26@gmail.com</a></span>
          </div>
          <p class="resume-hero-intro">
          我是中国科学技术大学 (USTC) 数学专业本科生, 辅修计算机科学. 我主要研究运营管理与运筹学方向, 尤其关注供应链分析、随机建模与博弈论.
          <br><br>
          作为数学专业的学生, 严格的数学训练塑造了我处理应用问题的方式: 在进行计算之前, 我往往会先寻找问题背后的结构. 这种视角常常让我能借助代数或数论中的工具——例如不变量、对称性与离散推理——用更精炼的论证、更清晰的推导与更易于解释的结果, 替代单纯的暴力计算. 即使研究最终目标偏经验或决策导向, 我也会尽量让建模假设清晰可见、推理链条透明可靠. 作为计算机专业的学生, 当工作与计算或人工智能产生交集时, 我能够快速上手 (无论理论还是实操). 与此同时，多年的编程经验也让我能自然高效地使用科研软件进行可视化、分析与学术写作.
          <br><br>
          在我的学术品味中, "结构感"尤为重要: 看似不同的问题往往共享同一副"骨架"/"本质". 我最感兴趣的研究, 是揭示这种共通原则, 并据此设计既有效、又更有原则性与可解释性的模型与方法.
          </p>
        </div>
      </div>

      <div class="section">
        <h2>教育背景</h2>
        <div class="subheading">
          <span class="subheading-title">中国科学技术大学</span>
          <span>2023年9月 -- 2027年7月 (预计)</span>
        </div>

        <div class="subsubheading" style="display: flex; justify-content: space-between;">
          <span>
            数学理学学士; 计算机科学与技术工学学士
            <button class="expander" type="button" data-expand-target="exp-edu-bg-zh" data-expand-key="edu-bg" aria-expanded="false" aria-label="展开详情">
              <i class="fas fa-chevron-right"></i>
            </button>
            <br>
            (PS: AI+X 微专业, 华东五校联盟)
          </span>
          <span>中国·合肥</span>
        </div>

        <div class="expand-row" id="exp-edu-bg-zh" aria-hidden="true" style="display:none;">
          <div class="expand-content">
            <div class="expand-item">
              <img src="./assets/images/Education_Background.jpg" alt="教育背景">
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>研究兴趣</h2>
        <ul><li>运营管理、运筹学、供应链、随机模型、博弈论.</li></ul>
      </div>
      
      <div class="section">
        <h2>科研经历</h2>
        <div class="subheading">
          <span class="subheading-title">具有不平等厌恶偏好的消费者下的需求信息共享</span>
          <span>2025年7月 -- 至今</span>
        </div>
        <div class="subsubheading">
          <div>导师: </div>
          <div style="margin-left: 20px;">
            <div><strong>虞义敏教授</strong>(香港城市大学 决策分析与运营学系)</div>
            <div><strong>汪倩教授</strong>(香港岭南大学 市场营销与国际商务学系)</div>
          </div>
        </div>
        <ul>
          <li>构建包含需求预测不确定性与不平等厌恶消费者的制造商—零售商贝叶斯定价/信号传递模型, 并在 LMSE (least-misleading sequential equilibrium) 准则下求解精炼的完美贝叶斯均衡.</li>
          <li>推导信息不共享与零售商共享两种机制下的闭式"混同/分离"批发价策略与利润表达式.</li>
          <li>证明自愿信息共享与强制信息共享在收益上的等价性, 并给出比较静态: 阐明不同信念设定（被动 vs. 线性）与不平等厌恶如何重塑渠道表现.</li>
        </ul>
        
        <div class="subheading">
          <span class="subheading-title">垄断企业在"先发货后购物 (STS)"与传统商业模式下的双边博弈</span>
          <span>2024年9月 -- 2025年8月</span>
        </div>
        <div class="subsubheading">
          <div>导师: </div>
          <div style="margin-left: 20px;">
            <div><strong>沈晓蓓教授</strong>(中国科学技术大学 管理科学系)</div>
            <div><strong>吕建成博士</strong>(中国科学技术大学 管理科学系)</div>
          </div>
        </div>
        <ul>
          <li>构建比较传统渠道与 STS (Ship-then-Shop) 渠道的双边渠道选择博弈模型, 纳入订阅成本、搜索成本与退货成本等因素.</li>
          <li>刻画企业最优定价, 并证明在均衡中不会出现"展厅效应 (showrooming)"; 该结论在放松消费者类型认知假设, 以及放宽消费者类型与退货成本分布假设后仍然成立.</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>荣誉与奖项</h2>
        <table width="100%">
          <tr>
            <td>优秀学生奖学金 (银奖) <button class="expander" type="button" data-expand-target="exp-ess-silver-zh" data-expand-key="ess-silver" aria-expanded="false" aria-label="展开详情"><i class="fas fa-chevron-right"></i></button></td>
            <td align="right">2025</td>
          </tr>
          <tr class="expand-row" id="exp-ess-silver-zh" aria-hidden="true" style="display:none;">
            <td colspan="2">
              <div class="expand-content">
                <a class="expand-item" href="https://math.ustc.edu.cn/2025/1024/c18650a706019/page.htm" target="_blank" rel="noopener noreferrer" aria-label="打开相关链接">
                  <img src="./assets/images/Excellent_Student_Scholarship--Silver.jpg" alt="优秀学生奖学金（银奖）">
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td>张宗植科技奖学金 <button class="expander" type="button" data-expand-target="exp-zzst-scholarship-zh" data-expand-key="zzst-scholarship" aria-expanded="false" aria-label="展开详情"><i class="fas fa-chevron-right"></i></button></td>
            <td align="right">2024</td>
          </tr>
          <tr class="expand-row" id="exp-zzst-scholarship-zh" aria-hidden="true" style="display:none;">
            <td colspan="2">
              <div class="expand-content">
                <a class="expand-item" href="https://math.ustc.edu.cn/2024/1113/c18650a660488/page.htm" target="_blank" rel="noopener noreferrer" aria-label="打开相关链接">
                  <img src="./assets/images/Zhang_Zongzhi_Sci-Tech_Scholarship.jpg" alt="张宗植科技奖学金">
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td>优秀新生奖学金 (银奖) <button class="expander" type="button" data-expand-target="exp-efs-silver-zh" data-expand-key="efs-silver" aria-expanded="false" aria-label="展开详情"><i class="fas fa-chevron-right"></i></button></td>
            <td align="right">2023</td>
          </tr>
          <tr class="expand-row" id="exp-efs-silver-zh" aria-hidden="true" style="display:none;">
            <td colspan="2">
              <div class="expand-content">
                <a class="expand-item" href="./assets/pdf/Excellent_Freshman_Scholarship--Silver.pdf" download aria-label="下载 PDF">
                  <img src="./assets/images/Excellent_Freshman_Scholarship--Silver.jpg" alt="优秀新生奖学金（银奖）">
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td>
              美国大学生数学建模竞赛 MCM (B题) Honorable Mention (担任队长)
              <button class="expander" type="button" data-expand-target="exp-mcm-hm-zh" data-expand-key="mcm-hm" aria-expanded="false" aria-label="展开详情">
                <i class="fas fa-chevron-right"></i>
              </button>
            </td>
            <td align="right">2025</td>
          </tr>
          <tr class="expand-row" id="exp-mcm-hm-zh" aria-hidden="true" style="display:none;">
            <td colspan="2">
              <div class="expand-content">
                <!-- CHANGED: 点击 MCM 图片下载 PDF -->
                <a class="expand-item" href="./assets/pdf/2025_MCM_Problem_B_Results.pdf" download aria-label="下载 PDF">
                  <img src="./assets/images/Honorable_Mention.jpg" alt="MCM Honorable Mention">
                </a>
              </div>
            </td>
          </tr>

        </table>
      </div>
      
      <div class="section">
        <h2>教学经历</h2>
        <div class="subheading">
          <span class="subheading-title">助教, "概率论与数理统计"</span>
          <span>2025年9月 -- 2026年1月</span>
        </div>
        <div class="subsubheading">授课教师: <strong>张曙光教授</strong></div>
        <ul>
          <li>
            基于缪柏其、张伟平编撰的教材整理并编写详细 LaTeX 习题解答与参考答案；维护开源仓库供同学使用:
            <a class="expand-action-btn" href="https://github.com/Stardust-math/Reference-Answer" target="_blank" rel="noopener noreferrer">Visit</a>
          </li>
          <li>给学生的作业和考试评分, 提供反馈和辅导. 每周开设习题课, 回答问题, 帮助学生准备考试.</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>其他信息</h2>
        <ul>
          <li>
            <strong>技术能力: </strong>
            <ul>
              <li>编程: Python (熟练), C (熟练), Mathematica (熟练)</li>
              <li>工具: LaTeX (高级), Visio, Adobe Illustrator, Adobe Photoshop</li>
            </ul>
          </li>
          <li>
            <strong>语言: </strong> 中文 (母语), 英语 (流利——托福: 阅读 28, 听力 24, 口语 24, 写作 27)
          </li>
        </ul>
      </div>
    </div>
    
    <a href="#" class="back-btn" id="resume-back-btn">
      <i class="fas fa-arrow-left"></i>
    </a>
  `;
})();
