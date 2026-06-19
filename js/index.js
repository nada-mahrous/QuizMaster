
import Quiz from "./quiz.js";
import Question from "./question.js";

// ============================================
// ** Get DOM Element References
// ============================================
const quizOptionsForm = document.getElementById("quizOptions");

const playerNameInput = document.getElementById("playerName");

const categoryInput = document.getElementById("categoryMenu");

const difficultyOptions = document.getElementById("difficultyOptions");

const questionsNumber = document.getElementById("questionsNumber");

const startQuizBtn = document.getElementById("startQuiz");

const questionsContainer = document.querySelector(".questions-container");

// ============================================
// ** Create variable to store current quiz
// ============================================
let currentQuiz = null;

// ============================================
// ** Create showLoading() function
// ============================================
function showLoading() {
  questionsContainer.innerHTML = `
    <div class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading Questions...</p>
    </div>
  `;
}

// ============================================
// ** Create hideLoading() function
// ============================================
function hideLoading() {
  const loadingOverlay = questionsContainer.querySelector(".loading-overlay");
  if (loadingOverlay) {
    loadingOverlay.remove();
  }
}

// ============================================
// ** Create showError(message) function
// ============================================
// Set questionsContainer.innerHTML to error HTML
// Include the message parameter in the display
// Add click listener to retry button that calls resetToStart()

// when API fails or any unexpected error occurs
function showError(message) {
  questionsContainer.innerHTML = `
    <div class="game-card error-card">
      <div class="error-icon">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>

      <h3 class="error-title">
        Oops! Something went wrong
      </h3>

      <p class="error-message">
        ${message}
      </p>

      <button class="btn-play retry-btn">
        <i class="fa-solid fa-rotate-right"></i>
        Try Again
      </button>
    </div>
  `;

  const retryBtn = document.querySelector(".retry-btn");

  //   retryBtn.addEventListener("click", resetToStart);

  //   retryBtn.addEventListener("click", function () {
  //     resetToStart();
  //   });

  retryBtn.addEventListener("click", () => {
    resetToStart();
  });
}

// ============================================
// ** Create validateForm() function
// ============================================
function validateForm() {
  const numberOfQuestions = Number(questionsNumber.value);

  if (!questionsNumber.value) {
    return {
      isValid: false,
      error: "Please enter the number of questions",
    };
  }

  if (numberOfQuestions < 1) {
    return {
      isValid: false,
      error: "Minimum 1 question required.",
    };
  }

  if (numberOfQuestions > 50) {
    return {
      isValid: false,
      error: "Maximum 50 questions allowed.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

// ============================================
// ** Create showFormError(message) function
// ============================================
// when validation fails
function showFormError(message) {
  //  Check if there's already an error message
  const oldError = document.querySelector(".form-error");

  // If there is, remove it
  if (oldError) {
    oldError.remove();
  }

  // Create a div with class 'form-error'
  const formError = document.createElement("div");
  formError.className = "form-error";

  // Set innerHTML to include the message and an icon
  formError.innerHTML = `
    <i class="fa-solid fa-circle-exclamation"></i>
    ${message}
  `;

  // Insert before the start button
  startQuizBtn.before(formError);

  // Remove after 3 seconds
  setTimeout(() => {
    formError.remove();
  }, 3000);
}
// ============================================
// ** Create resetToStart() function
// ============================================
function resetToStart() {
  // Clear questionsContainer
  questionsContainer.innerHTML = "";

  // Reset form values
  playerNameInput.value = "";
  categoryInput.value = "";
  difficultyOptions.value = "easy";
  questionsNumber.value = "";

  // Show the form (remove 'hidden' class)
  quizOptionsForm.classList.remove("hidden");

  // Set currentQuiz = null
  currentQuiz = null;
}

// ============================================
// ** Create async startQuiz() function
// ============================================
async function startQuiz() {
  // Validate the form
  const validation = validateForm();

  if (!validation.isValid) {
    showFormError(validation.error);
    return;
  }

  const playerName = playerNameInput.value.trim() || "Player";

  const category = categoryInput.value;

  const difficulty = difficultyOptions.value;

  const numberOfQuestions = Number(questionsNumber.value);

  // Create new Quiz instance from quiz class in quiz.js
  currentQuiz = new Quiz(category, difficulty, numberOfQuestions, playerName);

  // Hide the form (add 'hidden' class)
  quizOptionsForm.classList.add("hidden");

  showLoading();

  try {
    await currentQuiz.getQuestions();

    hideLoading();

    if (currentQuiz.questions.length === 0) {
      throw new Error("No questions found");
    }

    const firstQuestion = new Question(
      currentQuiz,
      questionsContainer,
      resetToStart,
    );

    firstQuestion.displayQuestion();
  } catch (error) {
    hideLoading();

    showError(error.message);
  }
}

// ============================================
// ** Add Event Listeners
// ============================================
startQuizBtn.addEventListener("click", startQuiz);

questionsNumber.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    startQuiz();
  }
});
