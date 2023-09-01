document.addEventListener('DOMContentLoaded', function () {
  const registration = document.querySelector('.registration');
  const quiz = document.querySelector('.quiz');
  const startButton = document.getElementById('startQuiz');
  const questionElement = document.getElementById('question');
  const optionsElement = document.getElementById('options');
  const timerElement = document.getElementById('timer');
  const timeLeftElement = document.getElementById('time');
  const errorElement = document.querySelector('.error');

  let currentQuestionIndex = 0;
  let score = 0;
  let timeLeft = 20;
  let timerInterval;
  let questions = [];

  const apiUrl = 'https://opentdb.com/api.php';

  async function fetchQuestions(numQuestions, category, difficulty) {
    const response = await fetch(`${apiUrl}?amount=${numQuestions}&category=${category}&difficulty=${difficulty}&type=multiple`);
    if (!response.ok) {
      showError('Failed to fetch questions from the API.');
      return [];
    }
    const data = await response.json();
    return data.results;
  }

  function startQuiz() {
    if (!navigator.onLine) {
      showError("An internet connection is required.");
      return;
    }

    const userName = document.getElementById('userName').value;
    const email = document.getElementById('email').value;
    const category = document.getElementById('category').value;
    const numQuestions = parseInt(document.getElementById('numQuestions').value);
    const difficulty = document.getElementById('difficulty').value;

    if (!userName || !emailIsValid(email) || !category || numQuestions < 5 || isNaN(numQuestions) || !difficulty) {
      showError('Please fill in all fields correctly.');
      return;
    }
 
    registration.style.display = 'none';
    quiz.style.display = 'block';

    fetchQuestions(numQuestions, category, difficulty)
      .then(data => {
        questions = data;
        if (questions.length === 0) {
          showError('No questions found for the selected category and difficulty.');
        } else {
          startQuizSession(userName);
        }
      });
  }

  function startQuizSession(userName) {
    currentQuestionIndex = 0;
    score = 0;
    loadQuestion();
    timerInterval = setInterval(updateTimer, 1000);
  }

  function loadQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    const allOptions = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
    const shuffledOptions = shuffleArray(allOptions);
    questions[currentQuestionIndex].shuffledOptions = shuffledOptions;
  
    questionElement.innerHTML = he.decode(currentQuestion.question);
    optionsElement.textContent = '';
    shuffledOptions.forEach((option, index) => {
      const button = document.createElement('button');
      button.textContent = option;
      button.addEventListener('click', () => selectAnswer(index));
      optionsElement.appendChild(button);
    });
    
  }

  
  function selectAnswer(selectedIndex) {
    clearInterval(timerInterval);
    const currentQuestion = questions[currentQuestionIndex];
  
    // Find the index of the correct answer in the shuffled options
    const correctAnswerIndex = currentQuestion.shuffledOptions.indexOf(currentQuestion.correct_answer);
  
    if (selectedIndex === correctAnswerIndex) {
      score++;
    }
  
    showFeedback(selectedIndex === correctAnswerIndex, currentQuestion.correct_answer);
  }
  

  function showFeedback(isCorrect, correctAnswer) {
    optionsElement.innerHTML = '';
    const feedbackElement = document.createElement('p');
    feedbackElement.textContent = isCorrect ? 'Correct!' : `Incorrect. Correct answer: ${correctAnswer}`;
    optionsElement.appendChild(feedbackElement);
    
    optionsElement.insertAdjacentHTML('beforeend', `<p>Score: ${score}</p>`);
    
    setTimeout(nextQuestion, 2000);
  }

  function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      loadQuestion();
      timeLeft = 20;
      timerInterval = setInterval(updateTimer, 1000);
    } else {
      showResult();
    }
  }

  function updateTimer() {
    if (timeLeft > 0) {
      timeLeft--;
      timeLeftElement.textContent = timeLeft;
    } else {
      clearInterval(timerInterval);
      showFeedback(false, questions[currentQuestionIndex].correct_answer);
    }
  }

  function showResult() {
    quiz.innerHTML = `<h2>Quiz Completed</h2><p>Your score: ${score} / ${questions.length}</p>`;
  }
  
  function showError(message) {
    errorElement.style.display = 'block';
    errorElement.innerHTML = `<p>${message}</p>`;
    registration.style.display = 'none';
    quiz.style.display = 'none';
  }

  function emailIsValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  startButton.addEventListener('click', startQuiz);
  
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
      
    }
    return array;
  }
});
