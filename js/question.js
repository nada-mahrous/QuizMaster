export default class Question {
  // ============================================
  // ** Create constructor(quiz, container, onQuizEnd)
  // ============================================

  constructor(quiz, container, onQuizEnd) {
    /* quiz - Reference to the Quiz instance - 
    has all the data and methods for the object currentQuiz (in quiz.js), 
    and the currentQuiz is an instance of the Quiz class 
    that has these methods and properties, 
    so we can use them to get the current question data and 
    other information about the quiz. */
    this.quiz = quiz;
    this.container = container;
    this.onQuizEnd = onQuizEnd;

    this.questionData = this.quiz.getCurrentQuestion();

    this.index = this.quiz.currentQuestionIndex;

    this.question = this.decodeHtml(this.questionData.question);
    this.correctAnswer = this.decodeHtml(this.questionData.correct_answer);
    this.category = this.decodeHtml(this.questionData.category);

    // loop on all wrong answers and decode them, store in this.wrongAnswers
    this.wrongAnswers = this.questionData.incorrect_answers.map((answer) => {
      return this.decodeHtml(answer);
    });

    this.allAnswers = this.shuffleAnswers();

    this.answered = false;
    this.timerInterval = null;
    this.timeRemaining = 30;
  }

  // ============================================
  // ** Create decodeHtml(html) method
  // ============================================

  decodeHtml(html) {
    /* Create a new DOMParser instance --> convert the html string 
     into something the browser can understand and manipulate */
    const parser = new DOMParser();

    // take the html string and parse it as a document, then get the text content
    // Example: &amp; - &quot; - &#039; --- will convert them to original shape
    const doc = parser.parseFromString(html, "text/html");

    //
    return doc.documentElement.textContent;
  }

  // ============================================
  // ** Create shuffleAnswers() method
  // ============================================

  shuffleAnswers() {
    const answers = [...this.wrongAnswers, this.correctAnswer];

    /* Fisher-Yates shuffle algorithm : 
    make the last element of the array the current element,
    then the second to last element, and so on until the first element.
    EX: answers = ["London", "Rome", "Berlin", "Paris"];
        0          1       2        3
      London     Rome    Berlin   Paris
    So we start with i = 3 (Paris)
    */
    for (let i = answers.length - 1; i > 0; i--) {
      /* Generate a random index from 0 to i (inclusive) 
      Ex: if i = 3, we want an index of 0, 1, 2, or 3
      so we write ( i + 1 ) because Math.random() get a number from 0 to 1 
      So it is will never get the last index
      EX: if Math.random() * 4 it maybe gives us 0.6 , 2.8 , 3.4
      Then we use Math.floor() to remove the fractional part and get an integer index
      EX: if Math.random() * 4 gives us 2.8, then Math.floor(2.8) will give us 2
      */
      const randomIndex = Math.floor(Math.random() * (i + 1));

      /* Swap the current element (i) with the randomIndex element 
      EX: answers = ["London", "Rome", "Berlin", "Paris"];
          i = 3 (Paris), and randomIndex assume = 1 (Rome)
      So we swap Paris with Rome, and the array becomes:
      ["London", "Paris", "Berlin", "Rome"]
      */
      [answers[i], answers[randomIndex]] = [answers[randomIndex], answers[i]];
    }

    // return array of answers after shuffling
    return answers;
  }

  // ============================================
  // ** Create getProgress() method
  // ============================================

  getProgress() {
    const progress = ((this.index + 1) / this.quiz.numberOfQuestions) * 100;

    // Math.round() --> rounds the number to the nearest integer
    return Math.round(progress);
  }

  // ============================================
  // ** Create displayQuestion() method
  // ============================================

  displayQuestion() {
    const answersHTML = this.allAnswers
      .map((answer, index) => {
        return `
        <button class="answer-btn" data-answer="${answer}">
          <span class="answer-key">${index + 1}</span>
          <span class="answer-text">${answer}</span>
        </button>
      `;
      })
      .join("");

    const progress = this.getProgress();

    const questionHTML = `
    <div class="game-card question-card">
      
      <div class="xp-bar-container">
        <div class="xp-bar-header">
          <span class="xp-label">
            <i class="fa-solid fa-bolt"></i> Progress
          </span>
          <span class="xp-value">
            Question ${this.index + 1}/${this.quiz.numberOfQuestions}
          </span>
        </div>

        <div class="xp-bar">
          <div class="xp-bar-fill" style="width: ${progress}%"></div>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-badge category">
          <i class="fa-solid fa-bookmark"></i>
          <span>${this.category}</span>
        </div>

        <div class="stat-badge difficulty ${this.quiz.difficulty}">
          <i class="fa-solid fa-face-smile"></i>
          <span>${this.quiz.difficulty}</span>
        </div>

        <div class="stat-badge timer">
          <i class="fa-solid fa-stopwatch"></i>
          <span class="timer-value">${this.timeRemaining}</span>s
        </div>

        <div class="stat-badge counter">
          <i class="fa-solid fa-gamepad"></i>
          <span>${this.index + 1}/${this.quiz.numberOfQuestions}</span>
        </div>
      </div>

      <h2 class="question-text">${this.question}</h2>

      <div class="answers-grid">
        ${answersHTML}
      </div>

      <p class="keyboard-hint">
        <i class="fa-regular fa-keyboard"></i> Press 1-4 to select
      </p>

      <div class="score-panel">
        <div class="score-item">
          <div class="score-item-label">Score</div>
          <div class="score-item-value">${this.quiz.score}</div>
        </div>
      </div>
    </div>
  `;

    this.container.innerHTML = questionHTML;

    this.addEventListeners();

    this.startTimer();
  }

  // ============================================
  // ** Create addEventListeners() method
  // ============================================

  addEventListeners() {
    const answerButtons = document.querySelectorAll(".answer-btn");

    answerButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.checkAnswer(button);
      });
    });

    this.handleKeydown = (event) => {
      const validKeys = ["1", "2", "3", "4"];

      if (validKeys.includes(event.key)) {
        const buttonIndex = Number(event.key) - 1;

        const selectedButton = answerButtons[buttonIndex];

        if (selectedButton) {
          this.checkAnswer(selectedButton);
        }
      }
    };

    document.addEventListener("keydown", this.handleKeydown);
  }

  // ============================================
  // ** Create removeEventListeners() method
  // ============================================

  removeEventListeners() {
    document.removeEventListener("keydown", this.handleKeydown);
  }

  // ============================================
  // ** Create startTimer() method
  // ============================================

  startTimer() {
    const timerDisplay = document.querySelector(".timer-value");

    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      timerDisplay.textContent = this.timeRemaining;

      const timerBadge = document.querySelector(".stat-badge.timer");

      if (this.timeRemaining <= 10) {
        timerBadge.classList.add("warning");
      }

      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.handleTimeUp();
      }
    }, 1000);
  }

  // ============================================
  // ** Create stopTimer() method
  // ============================================
  stopTimer() {
    clearInterval(this.timerInterval);
  }

  // ============================================
  // ** Create handleTimeUp() method
  // ============================================

  handleTimeUp() {
    this.answered = true;

    this.removeEventListeners();

    const buttons = document.querySelectorAll(".answer-btn");

    buttons.forEach((button) => {
      if (
        button.dataset.answer.toLowerCase() === this.correctAnswer.toLowerCase()
      ) {
        button.classList.add("correct");
      }
    });

    const message = document.createElement("div");

    message.className = "time-up-message";

    message.textContent = "TIME'S UP!";

    this.container.appendChild(message);

    setTimeout(() => {
      this.animateQuestion();
    }, 2000);
  }

  // ============================================
  // ** Create checkAnswer(choiceElement) method
  // ============================================

  checkAnswer(choiceElement) {
    if (this.answered) {
      return;
    }

    this.answered = true;

    this.stopTimer();
    this.removeEventListeners();
    const selectedAnswer = choiceElement.dataset.answer;

    const isCorrect =
      selectedAnswer.toLowerCase() === this.correctAnswer.toLowerCase();

    const correctSound = new Audio("./sounds/correct.mp3");
    const wrongSound = new Audio("./sounds/wrong.mp3");

    if (isCorrect) {
      const correctSound = new Audio("./sounds/correct.mp3");
      correctSound.play();

      choiceElement.classList.add("correct");
      this.quiz.incrementScore();
    } else {
      const wrongSound = new Audio("./sounds/wrong.mp3");
      wrongSound.play();

      choiceElement.classList.add("wrong");
      this.highlightCorrectAnswer();
    }

    const allButtons = document.querySelectorAll(".answer-btn");

    allButtons.forEach((button) => {
      if (button !== choiceElement) {
        button.classList.add("disabled");
      }
    });

    this.animateQuestion();
  }

  // ============================================
  // ** Create highlightCorrectAnswer() method
  // ============================================
  highlightCorrectAnswer() {
    const answerButtons = document.querySelectorAll(".answer-btn");

    answerButtons.forEach((button) => {
      // const answer = button.dataset.answer;
      const answer = button.getAttribute("data-answer");

      if (answer.toLowerCase() === this.correctAnswer.toLowerCase()) {
        button.classList.add("correct-reveal");
      }
    });
  }

  // ============================================
  // ** Create getNextQuestion() method
  // ============================================

  getNextQuestion() {
    const hasNextQuestion = this.quiz.nextQuestion();

    if (hasNextQuestion) {
      const nextQuestion = new Question(
        this.quiz,
        this.container,
        this.onQuizEnd,
      );

      nextQuestion.displayQuestion();
    } else {
      this.container.innerHTML = this.quiz.endQuiz();

      const playAgainBtn = document.querySelector(".btn-restart");

      playAgainBtn.addEventListener("click", () => {
        this.onQuizEnd();
      });
    }
  }

  // ============================================
  // ** Create animateQuestion(duration) method
  // ============================================

  async animateQuestion(duration = 1000) {
    await new Promise((resolve) => {
      setTimeout(resolve, 1500);
    });

    const questionCard = document.querySelector(".question-card");

    if (questionCard) {
      questionCard.classList.add("exit");
    }

    await new Promise((resolve) => {
      setTimeout(resolve, duration);
    });

    this.getNextQuestion();
  }
}
