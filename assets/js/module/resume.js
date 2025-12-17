document.write(`
  <div id="resume">
    <button id="toggle-btn">
      <span><i class="fas fa-sun"></i></span>
    </button>
    <div id="clock">GMT+8 00:00</div>
    <div class="container">
      <div class="resume-heading">Jinghao Chen</div>
      <div class="contact-info">
        <div>Email: chenjinghao@mail.ustc.edu.cn | Tel: +86 18806590966 | Personal Website: <a href="https://stardust-math.github.io/" target="_blank">stardust-math.github.io</a></div>
      </div>

      <div class="section">
        <h2>Education</h2>
        <div class="subheading">
          <span class="subheading-title">University of Science and Technology of China</span>
          <span>Sep. 2023 – Jul. 2027 (Expected)</span>
        </div>
        <div class="subsubheading">B.Sc. in Mathematics (Major); B.Eng. in Computer Science and Technology (Minor)</div>
        <div class="subsubheading">Hefei, China</div>
        <ul>
          <li>GPA: 3.42/4.3 (Average Score: 84.36/100); Ranking: 18/50 in major, 51/128 in School of Mathematical Sciences.</li>
          <li>Selected Coursework: Probability Theory and Mathematical Statistics (94), Mathematical Analysis A1 (90), Mathematical Experiments (A+), Mathematical Software (A+), Foundations of Geometry (86), Operations Research (in progress), Machine Learning (in progress), Numerical Algebra (in progress).</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Research Interests</h2>
        <ul><li>Operations Management, Operations Research, Supply Chain, Stochastic Models, Game Theory.</li></ul>
      </div>
      
      <div class="section">
        <h2>Research Experience</h2>
        <div class="subheading">
          <span class="subheading-title">Demand Information Sharing with Inequality-Averse Consumers</span>
          <span>Jul. 2025 -- Present</span>
        </div>
        <div class="subsubheading">Advisors: <strong>Prof. Yimin Yu</strong> (Department of Decision Analytics and Operations, City University of Hong Kong), <strong>Prof. Qian Wang</strong> (Department of Marketing & International Business, Lingnan University)</div>
        <ul>
          <li>Formulated a Bayesian manufacturer-retailer pricing/signaling model with demand-forecast uncertainty and inequality-averse consumers, and solved Perfect Bayesian equilibria refined by the least-misleading sequential equilibrium (LMSE) criterion.</li>
          <li>Derived closed-form pooling and separating wholesale-price policies and profit expressions across no-sharing and retailer-sharing regimes.</li>
          <li>Established payoff equivalence between voluntary and mandatory information sharing, and characterized comparative statics showing how belief specifications (passive vs. linear) and inequality aversion reshape channel performance.</li>
        </ul>
        
        <div class="subheading">
          <span class="subheading-title">Monopoly Firm's Bilateral Game Under Ship-then-Shop (STS) and Traditional Business Models</span>
          <span>Sep. 2024 -- Aug. 2025</span>
        </div>
        <div class="subsubheading">Advisors: <strong>Prof. Xiaobei Shen</strong> (Department of Management Science, USTC), <strong>Dr. Jiancheng Lyu</strong> (Department of Management Science, USTC)</div>
        <ul>
          <li>Formulated a bilateral channel-selection game comparing a traditional channel with a Ship-then-Shop (STS) channel for a monopolistic firm, incorporating subscription, search, and return costs.</li>
          <li>Characterized the firm's optimal pricing and proved that showrooming does not arise in equilibrium, even after relaxing assumptions on consumer type awareness and the distributions of consumer types and return costs.</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Honors and Awards</h2>
        <table width="100%">
          <tr>
            <td>Excellent Student Scholarship--Silver (About top 20% in School of Mathematical Sciences)</td>
            <td align="right">2025</td>
          </tr>
          <tr>
            <td>Zhang Zongzhi Sci-Tech Scholarship (About top 25% in School of Mathematical Sciences)</td>
            <td align="right">2024</td>
          </tr>
          <tr>
            <td>Excellent Freshman Scholarship--Silver</td>
            <td align="right">2023</td>
          </tr>
          <tr>
            <td>Honorable Mention, Mathematical Contest in Modeling<sup>&reg;</sup> (MCM), Problem B (Team Captain)</td>
            <td align="right">2025</td>
          </tr>
        </table>
      </div>
      
      <div class="section">
        <h2>Teaching Experience</h2>
        <div class="subheading">
          <span class="subheading-title">Teaching Assistant, "Probability Theory and Mathematical Statistics"</span>
          <span>Sep. 2025 -- Jan. 2026</span>
        </div>
        <div class="subsubheading">Instructor: <strong>Prof. Shuguang Zhang</strong></div>
        <ul>
          <li>Compiled detailed LaTeX solutions and reference answers based on the textbook by Baiqi Miu and Weiping Zhang; maintained an open-source repository for students: <a href="https://github.com/Stardust-math/Reference-Answer" target="_blank">https://github.com/Stardust-math/Reference-Answer</a></li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Additional Information</h2>
        <ul>
          <li>
            <strong>Technical Skills:</strong>
            <ul>
              <li>Programming: Python (proficient), C (proficient), Mathematica (proficient)</li>
              <li>Tools: LaTeX (advanced), Visio, Adobe Illustrator, Adobe Photoshop</li>
            </ul>
          </li>
          <li>
            <strong>Languages:</strong> Mandarin (Native), English (Fluent)
          </li>
        </ul>
      </div>
    </div>
    
    <a href="#" class="back-btn" id="resume-back-btn">
      <i class="fas fa-arrow-left"></i>
    </a>
  </div>
`);
