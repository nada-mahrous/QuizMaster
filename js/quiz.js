export default class Quiz {
  // ============================================
  // ** Create constructor
  // ============================================

  // ** Initialize all properties mentioned above
  constructor(category, difficulty, numberOfQuestions, playerName) {
    this.category = category;
    this.difficulty = difficulty;
    this.numberOfQuestions = numberOfQuestions;
    this.playerName = playerName;

    this.score = 0;
    this.questions = [];
    this.currentQuestionIndex = 0;
  }

  // ============================================
  // ** Create buildApiUrl() method
  // ============================================

  buildApiUrl() {
    const params = new URLSearchParams();

    params.append("amount", this.numberOfQuestions);
    params.append("difficulty", this.difficulty);

    if (this.category) {
      params.append("category", this.category);
    }

    return `https://opentdb.com/api.php?${params.toString()}`;
  }

  // ============================================
  // ** Create async getQuestions() method
  // ============================================
 
  async getQuestions() {
    const apiUrl = this.buildApiUrl();

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch questions");
    }

    const data = await response.json();

    if (data.response_code !== 0) {
      throw new Error("No questions found");
    }

    this.questions = data.results;

    return this.questions;
  }

  // ============================================
  // ** Create incrementScore() method
  // ============================================

  incrementScore() {
    this.score += 1;
  }

  // ============================================
  // ** Create getCurrentQuestion() method
  // ============================================
  getCurrentQuestion() {
    if (
      this.currentQuestionIndex < 0 ||
      this.currentQuestionIndex >= this.questions.length
    ) {
      return null;
    }

    return this.questions[this.currentQuestionIndex];
  }

  // ============================================
  // ** Create nextQuestion() method
  // ============================================
  
  nextQuestion() {
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex < this.questions.length) {
      return true;
    }

    return false;
  }

  // ============================================
  // ** Create isComplete() method
  // ============================================

  isComplete() {
    if (this.currentQuestionIndex >= this.questions.length) {
      return true;
    }

    return false;
  }

  // ============================================
  // ** Create getScorePercentage() method
  
  getScorePercentage() {
    if (this.numberOfQuestions === 0) {
      return 0;
    }
    const percentage = (this.score / this.numberOfQuestions) * 100;
    return Math.round(percentage);
  }

  // ============================================
  // ** Create getHighScores() method
  // ============================================
  
  getHighScores() {
    try {
      // Get Data from localStorage
      const highScores = localStorage.getItem("quizHighScores");

      /* we return an empty array not null because if someone used this method ,
      they would do highScores.length OR highScores.map(...) --> 
      and these work with only arrays
      */
      /* If there isn't anything saved, highScores returns null, 
     then we should return empty array  
     */
      // !Null (falsy value) = True, so if highScores is null, return empty array
      if (!highScores) {
        return [];
      }
      // Parse --> convert the string to an array and return it
      return JSON.parse(highScores);
    } catch (error) {
      // If parsing fails, return empty array
      return [];
    }
  }

  // ============================================
  // ** Create saveHighScore() method
  // ============================================
  
  saveHighScore() {
    // Get existing high scores
    const highScores = this.getHighScores();

    // Create new score object
    const newScore = {
      name: this.playerName,
      score: this.score,
      total: this.numberOfQuestions,
      percentage: this.getScorePercentage(),
      difficulty: this.difficulty,
      date: new Date().toISOString(),
    };

    // Push to array that we got from this.getHighScores()
    highScores.push(newScore);

    // Sort by percentage (highest first)
    highScores.sort((a, b) => b.percentage - a.percentage);

    // Keep only top 10
    const topScores = highScores.slice(0, 10);

    // Save to localStorage
    localStorage.setItem("quizHighScores", JSON.stringify(topScores));
  }

  // ============================================
  // ** Create isHighScore() method
  // ============================================
  
  isHighScore() {
    // Get existing high scores
    const highScores = this.getHighScores();

    // If there are less than 10 high scores, set the current score
    if (highScores.length < 10) {
      return true;
    }

    // get user's current percentage using this.getScorePercentage()
    const currentPercentage = this.getScorePercentage();

    // get lowest saved percentage (last item in sorted array)
    const lowestScore = highScores[highScores.length - 1].percentage;

    // Return true if current percentage larger than the lowest saved score
    return currentPercentage > lowestScore;
  }

  // ============================================
  // ** Create endQuiz() method
  // ============================================
  
  endQuiz() {
    // Calculate percentage
    const percentage = this.getScorePercentage();

    const completeSound = new Audio("./sounds/complete.mp3");
    completeSound.play();

    // Check if it's a high score
    const isNewHighScore = this.isHighScore();

    // If yes, save it BEFORE getting high scores
    if (isNewHighScore) {
      this.saveHighScore();
    }

    // Get high scores AFTER saving
    const highScores = this.getHighScores();

    // Generate HTML string for results screen
    const html = `
    <div class="game-card results-card">
      <h2 class="results-title">Quiz Complete!</h2>

      <p class="results-score-display">
        ${this.score}/${this.numberOfQuestions}
      </p>

      <p class="results-percentage">
        ${percentage}% Accuracy
      </p>

      ${
        isNewHighScore
          ? `
            <div class="new-record-badge">
              <i class="fa-solid fa-star"></i> New High Score!
            </div>
          `
          : ""
      }

      <div class="leaderboard">
        <h4 class="leaderboard-title">
          <i class="fa-solid fa-trophy"></i> Leaderboard
        </h4>

        <ul class="leaderboard-list">
          ${highScores
            .map((score, index) => {
              let rankClass = "";

              if (index === 0) {
                rankClass = "gold";
              } else if (index === 1) {
                rankClass = "silver";
              } else if (index === 2) {
                rankClass = "bronze";
              }

              return `
                <li class="leaderboard-item ${rankClass}">
                  <span class="leaderboard-rank">#${index + 1}</span>
                  <span class="leaderboard-name">${score.name}</span>
                  <span class="leaderboard-score">${score.percentage}%</span>
                </li>
              `;
            })
            .join("")}
        </ul>
      </div>

      <div class="action-buttons">
        <button class="btn-restart">
          <i class="fa-solid fa-rotate-right"></i> Play Again
        </button>
      </div>
    </div>
  `;
    return html;
  }
}
