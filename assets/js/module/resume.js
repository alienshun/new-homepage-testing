document.write(`
  <div id="resume">
    <button id="toggle-btn">
      <span><i class="fas fa-sun"></i></span>
    </button>
    <div id="clock">GMT+8 00:00</div>
    <div class="container">
      <div class="resume-heading">Jinghao Chen</div>
      <div class="contact-info">
        <div>Hefei Anhui, 230026</div>
        <div>Email: chenjinghao@mail.ustc.edu.cn / stardust.math26@gmail.com</div>
        <div>Tel: +86 18806590966</div>
      </div>

      <div class="section">
        <h2>Education</h2>
        <div class="subheading">
          <span class="subheading-title">University of Science and Technology of China</span>
          <span>Expected July 2023 -- July 2027</span>
        </div>
        <div class="subsubheading">Bachelor of Science in Computational and Applied Mathematics (Major)</div>
        <div class="subsubheading">Bachelor of Engineering in Computer Science and Technology (Minor)</div>
      </div>
      
      <div class="section">
        <h2>Honors and Awards</h2>
        <table width="100%">
          <tr>
            <td>"Outstanding Student Scholarship (Grade 2)"</td>
            <td align="right">2025</td>
          </tr>
          <tr>
            <td>"Zhang Zongzhi Sci-Tech Scholarship"</td>
            <td align="right">2024</td>
          </tr>
          <tr>
            <td>"Outstanding Freshman Scholarship (Grade 2)"</td>
            <td align="right">2023</td>
          </tr>
          <tr>
            <td>
              Honorable Mention, Mathematical Contest in Modeling<sup>&reg;</sup> (MCM), Problem B
            </td>
            <td align="right">2025</td>
          </tr>
        </table>
      </div>


      <div class="section">
        <h2>Research Projects</h2>
        <div class="subheading">
          <span class="subheading-title">Demand Information Sharing Under Consumer Inequality Aversion</span>
          <span>July 2025 -- Present</span>
        </div>
        <div class="subsubheading">Cooperating with <strong>Yimin Yu</strong> and <strong>Qian Wang</strong></div>
        <ul><li>Examined a tripartite sequential game within a supply chain, incorporating manufacturers, retailers and consumers endowed with inequality aversion preferences, under fluctuating marketing size. The manufacturer obtains a private demand signal, integrates prior beliefs with this signal's accuracy to determine posterior probabilities and decide on sharing information with the retailer. When information is withheld, a high-type manufacturer has an incentive to mimic a low-type by lowering wholesale prices to increase sales. This strategic interaction necessitated the formulation of a PBE (Perfect Bayesian Equilibrium) for the low-type manufacturer, further refined by applying the LMSE (Lexicographically Maximum Sequential Equilibrium) criterion. In response, the retailer engaged in a Bayesian game, inferring the signal's likelihood based on the observed wholesale price, while consumer behavior was modeled under possible belief systems—transparency, passive, or linear beliefs—incorporating inequality aversion toward the retailer. Ultimately, the solution was derived through backward induction and results demonstrate that inequality aversion, information asymmetry, and prior probability distributions significantly influence information-sharing strategies, pricing, and overall supply chain efficiency and profit allocation.</li></ul>
        
        <div class="subheading">
          <span class="subheading-title">Monopoly Firm’s Bilateral Game Under Ship-then-Shop(STS) and Traditional Business Models</span>
          <span>September 2024 -- August 2025</span>
        </div>
        <div class="subsubheading">Cooperating with <strong>Xiaobei Shen</strong> and <strong>Jiancheng Lv</strong></div>
        <ul><li>Investigated the bilateral game and channel selection strategy of a monopolistic firm, comparing the traditional business model with the Ship-then-Shop (STS) framework. Characterized how customer heterogeneity—driven by variations in subscription fees, search costs, and return costs—shapes the firm's optimal pricing. The model was extended by relaxing key assumptions, specifically regarding consumer awareness of their own types and by employing generalized probability distributions for consumer types and return costs. The analysis robustly demonstrated the absence of a showrooming effect in either channel, thereby extending the theoretical framework on strategic channel management.</li></ul>
      </div>
      
      <div class="section">
        <h2>Work Experience</h2>
        <div class="subheading">
          <span class="subheading-title">Teaching assistant of "Probability Theory and Mathematical Statistics" led by Shuguang Zhang</span>
          <span>Expected September 2025 – January 2026</span>
        </div>
        <div class="subsubheading">Compile the reference answers for "Probability Theory and Mathematical Statistics" (Textbook by Baiqi Miu and Weiping Zhang)</div>
        <a class="download-link" href="./assets/pdf/Reference_Answer_of_''Probability_Theory_and_Mathematical_Statistics''_(by Baiqi_Miu_and_Weiping_Zhang).pdf" download>Repository available at: Reference Answer of "Probability Theory and Mathematical Statistics"</a>
      </div>

      <div class="section">
        <h2>Research Interests</h2>
        <ul>Operations Management, Game Theory, Machine Learning, Deep Learning, etc.</ul>
      </div>
      
      <div class="section">
        <h2>Publications</h2>
      </div>
      
      <div class="section">
        <h2>Additional Skills/Information</h2>
        <ul>
          <li>
          <strong>Technical Skills:</strong> 
          <ul>
            <li>
              <strong>Programming Languages:</strong>
              Python (5 yr), C (3 yr), Mathematica (3 yr)
            </li>
            <li>
              <strong>Scientific Writing and Illustration:</strong>
              LaTeX (Mastery), Visio (Proficient), Adobe Illustrator (Competent), Adobe Photoshop (Competent)
            </li>
          </ul>
          </li>
          
          <li>
          <strong>Languages:</strong>
          Chinese (Native), English (Fluent -- TOEFL Score: Reading 22, Listening 21, Speaking 24, Writing 24)
          </li>
          
          <li>
          <strong>Hobbies:</strong>
          Playing Bamboo Flute, Swimming, Singing
          </li>
          
          <li>
          <strong>Reflections and Essays: </strong>
          ''Stardust Meditations''
          </li>
          <a class="download-link" href="./assets/pdf/Stardust_Meditations.pdf" download>Click here to download: Stardust Meditations</a>
        </ul>
      </div>
    </div>
    
    <a href="#" class="back-btn" id="resume-back-btn">
      <i class="fas fa-arrow-left"></i>
    </a>
  </div>
`);

