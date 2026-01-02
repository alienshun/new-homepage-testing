(function () {
  const mount = document.getElementById("mount-resume") || document.body;
  mount.insertAdjacentHTML("beforeend", `
  <div id="resume">
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
          <div class="resume-hero-name">Jinghao Chen</div>
          <div class="resume-hero-chips">
            <span class="contact-pill"><strong>Tel:</strong><span>+86 18806590966</span></span>
            <span class="contact-pill"><strong>Email 1:</strong><a href="mailto:chenjinghao@mail.ustc.edu.cn">chenjinghao@mail.ustc.edu.cn</a></span>
            <span class="contact-pill"><strong>Email 2:</strong><a href="mailto:stardust.math26@gmail.com">stardust.math26@gmail.com</a></span>
          </div>
          <p class="resume-hero-intro">
          I am an undergraduate at the University of Science and Technology of China (USTC), majoring in Mathematics with a minor in Computer Science. My primary research interests lie in operations management and operations research, with a particular focus on supply chain analytics, stochastic modeling, and game theory.
          <br><br>
          My training in rigorous mathematics shapes how I approach applied problems: I tend to look for underlying structure before reaching for computation. This perspective often lets me use tools and ways of thinking drawn from algebra and number theory—such as invariance, symmetry, and discrete reasoning—to replace brute-force calculations with concise arguments, cleaner derivations, and more interpretable results. Even when the end goal is empirical or decision-oriented, I strive to make the modeling assumptions explicit and the logic transparent. When my work intersects with computing or AI, I can ramp up fast—both conceptually and in implementation. Meanwhile, years of programming experience make it natural for me to use research software efficiently for visualization, analysis, and academic writing.
          <br><br>
          At the core of my academic taste is an appreciation for structure—the sense that seemingly different problems share the same “skeleton.” I am most excited by research that reveals these shared principles and uses them to design models and methods that are not only effective, but also principled and explainable.
          </p>
        </div>
      </div>

      <div class="section">
        <h2>Education</h2>
        <div class="subheading">
          <span class="subheading-title">University of Science and Technology of China</span>
          <span>Sep. 2023 – Jul. 2027 (Expected)</span>
        </div>
        <div class="subsubheading" style="display: flex; justify-content: space-between;">
          <span>B.Sc. in Mathematics (Major)<br>B.Eng. in Computer Science and Technology (Minor)<br>AI+X Micro-Program (East China Five Universities Consortium)</span>
          <span>Hefei, China</span>
        </div>
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
        <div class="subsubheading">
          <div>Advisors:</div>
          <div style="margin-left: 20px;">
            <div><strong>Prof. Yimin Yu</strong> (Department of Decision Analytics and Operations, City University of Hong Kong)</div>
            <div><strong>Prof. Qian Wang</strong> (Department of Marketing & International Business, Lingnan University)</div>
          </div>
        </div>
        <ul>
          <li>Formulated a Bayesian manufacturer-retailer pricing/signaling model with demand-forecast uncertainty and inequality-averse consumers, and solved Perfect Bayesian equilibria refined by the least-misleading sequential equilibrium (LMSE) criterion.</li>
          <li>Derived closed-form pooling and separating wholesale-price policies and profit expressions across no-sharing and retailer-sharing regimes.</li>
          <li>Established payoff equivalence between voluntary and mandatory information sharing, and characterized comparative statics showing how belief specifications (passive vs. linear) and inequality aversion reshape channel performance.</li>
        </ul>
        
        <div class="subheading">
          <span class="subheading-title">Monopoly Firm's Bilateral Game Under Ship-then-Shop (STS) and Traditional Business Models</span>
          <span>Sep. 2024 -- Aug. 2025</span>
        </div>
        <div class="subsubheading">
          <div>Advisors:</div>
          <div style="margin-left: 20px;">
            <div><strong>Prof. Xiaobei Shen</strong> (Department of Management Science, University of Science and Technology of China)</div>
            <div><strong>Dr. Jiancheng Lyu</strong> (Department of Management Science, University of Science and Technology of China)</div>
          </div>
        </div>
        <ul>
          <li>Formulated a bilateral channel-selection game comparing a traditional channel with a Ship-then-Shop (STS) channel for a monopolistic firm, incorporating subscription, search, and return costs.</li>
          <li>Characterized the firm's optimal pricing and proved that showrooming does not arise in equilibrium, even after relaxing assumptions on consumer type awareness and the distributions of consumer types and return costs.</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Honors and Awards</h2>
        <table width="100%">
          <tr>
            <td>Excellent Student Scholarship--Silver</td>
            <td align="right">2025</td>
          </tr>
          <tr>
            <td>Zhang Zongzhi Sci-Tech Scholarship</td>
            <td align="right">2024</td>
          </tr>
          <tr>
            <td>Excellent Freshman Scholarship--Silver</td>
            <td align="right">2023</td>
          </tr>
          <tr>
            <td>Honorable Mention, Mathematical Contest in Modeling<sup>&reg;</sup> (MCM), Problem B</td>
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
          <li>Compiled detailed LaTeX solutions and reference answers based on the textbook by Baiqi Miu and Weiping Zhang; maintained an open-source repository for students: <a href="https://github.com/Stardust-math/Reference-Answer" target="_blank" style="color: lightblue;">https://github.com/Stardust-math/Reference-Answer</a></li>
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
})();
