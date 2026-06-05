/**
 * 상담 FAQ 시뮬레이터 - 비즈니스 로직 및 인터랙션
 * 작성일: 2026-06-05
 * 특징: 질문 무작위 셔플링, 실시간 입력 확인 활성화, Ctrl+Enter 단축키 지원, 한글 상세 주석
 */

// DOM 요소 캐싱 (자주 사용하는 화면 요소를 변수에 저장하여 성능 최적화)
const questionText = document.getElementById('question-text');
const questionCategory = document.getElementById('question-category');
const userAnswerInput = document.getElementById('user-answer-input');
const checkBtn = document.getElementById('check-btn');

const answerPane = document.getElementById('answer-pane');
const solutionCard = document.getElementById('solution-card');
const solutionCategory = document.getElementById('solution-category');
const solutionText = document.getElementById('solution-text');
const nextBtn = document.getElementById('next-btn');

const currentQuestionNumNum = document.getElementById('current-question-num');
const totalQuestionsNumNum = document.getElementById('total-questions-num');
const progressBarFill = document.getElementById('progress-bar-fill');

const quizScreen = document.getElementById('quiz-screen');
const finishScreen = document.getElementById('finish-screen');
const restartBtn = document.getElementById('restart-btn');

// 애플리케이션 상태 전역 객체
let state = {
  shuffledQuestions: [], // 셔플된 질문 목록
  currentIndex: 0        // 현재 진행 중인 문제 인덱스 (0-indexed)
};

/**
 * 1. Fisher-Yates 셔플 알고리즘
 * 배열을 무작위로 섞을 때 가장 공평하고 효율적인 수학적 셔플 알고리즘입니다.
 * 원본 배열을 복사한 후 맨 뒤 요소부터 앞으로 가며 임의의 다른 요소와 교환합니다.
 */
function shuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * 2. 퀴즈 세션 초기화 함수
 * 전체 질문 리스트를 셔플하고 첫 번째 문제를 화면에 띄웁니다.
 */
function initQuiz() {
  if (!window.QUESTIONS || window.QUESTIONS.length === 0) {
    alert("질문 데이터를 불러올 수 없습니다. questions.js 파일이 올바르게 설정되었는지 확인해 주세요.");
    return;
  }
  
  // 전체 문제 수 표시 업데이트
  totalQuestionsNumNum.textContent = window.QUESTIONS.length;
  
  // 질문 무작위 셔플링 실행
  state.shuffledQuestions = shuffle(window.QUESTIONS);
  state.currentIndex = 0;
  
  // 화면 전환 (완료 화면 숨기고 플레이 화면 보이기)
  finishScreen.classList.remove('active');
  quizScreen.classList.add('active');
  
  // 첫 번째 문제 로드
  loadQuestion();
}

/**
 * 3. 특정 인덱스의 질문을 화면에 렌더링하는 함수
 */
function loadQuestion() {
  const currentQuestion = state.shuffledQuestions[state.currentIndex];
  
  // 왼쪽 패널(질문 영역) 초기화 및 텍스트 설정
  questionText.textContent = currentQuestion.question;
  questionCategory.textContent = currentQuestion.category;
  
  // 사용자 입력창 초기화 및 포커싱
  userAnswerInput.value = '';
  userAnswerInput.disabled = false;
  
  // 버튼 상태 초기화 (입력값이 없으므로 비활성화)
  checkBtn.disabled = true;
  
  // 오른쪽 정답 카드 잠금 및 안내 텍스트 설정 (다음 문제는 정답 확인 전까지 비활성화)
  nextBtn.disabled = true;
  solutionCard.classList.add('locked');
  solutionCategory.textContent = "🔒 정답 대기 중";
  solutionText.textContent = "왼쪽 입력창에 답변을 작성하고 [정답 확인하기] 버튼을 누르면 이곳에 정답 가이드가 표시됩니다.";
  
  // 진척도 게이지 및 숫자 텍스트 실시간 업데이트
  currentQuestionNumNum.textContent = state.currentIndex + 1;
  const progressPercent = (state.currentIndex / state.shuffledQuestions.length) * 100;
  progressBarFill.style.width = `${progressPercent}%`;
  
  // 지연 후 텍스트 입력창으로 포커스 이동 (사용자 편의성 향상)
  setTimeout(() => {
    userAnswerInput.focus();
  }, 100);
}

/**
 * 4. 사용자가 적은 답변에 대해 정답 가이드를 열어주는 함수
 */
function checkAnswer() {
  const currentQuestion = state.shuffledQuestions[state.currentIndex];
  
  // 사용자가 수기 입력한 내용 상태에 저장 (나중에 복습 화면에서 사용)
  currentQuestion.userAnswer = userAnswerInput.value;
  
  // 오른쪽 정답 카드 잠금 해제 및 실제 내용 바인딩
  solutionCard.classList.remove('locked');
  solutionText.textContent = currentQuestion.answer;
  solutionCategory.textContent = currentQuestion.category;
  
  // 입력창을 비활성화하여 검토 모드로 변경
  userAnswerInput.disabled = true;
  
  // 다음 문제 넘어가기 버튼 활성화 및 포커싱
  nextBtn.disabled = false;
  nextBtn.focus();
  
  // 모바일 기기 대응: 화면이 위아래로 좁은 경우 정답 영역이 화면 아래로 밀리므로 스크롤을 이동시킵니다.
  if (window.innerWidth <= 992) {
    solutionCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * 5. 다음 문제로 넘어가거나 전체 풀이를 끝마치는 함수
 */
function goToNext() {
  state.currentIndex++;
  
  if (state.currentIndex >= state.shuffledQuestions.length) {
    // 모든 문제를 전부 다 풀었을 때의 처리
    progressBarFill.style.width = '100%';
    showFinishScreen();
  } else {
    // 다음 문제가 남아있는 경우 순차적으로 다음 질문을 로딩
    loadQuestion();
  }
}

/**
 * HTML 특수문자 이스케이프 함수 (사용자 입력값 안전 출력용)
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * 6. 전체 문제 풀이 완료 화면 표시 함수 및 내가 쓴 답과 정답 비교 생성
 */
function showFinishScreen() {
  quizScreen.classList.remove('active');
  finishScreen.classList.add('active');
  
  const reviewList = document.getElementById('review-list');
  reviewList.innerHTML = ''; // 기존 목록 비우기
  
  // 셔플된 전체 문제를 순회하며 복습 카드 생성
  state.shuffledQuestions.forEach((q, idx) => {
    const item = document.createElement('div');
    item.className = 'review-item';
    
    // 답변이 없거나 공백인 경우 처리
    const userAnswerText = (q.userAnswer && q.userAnswer.trim()) 
      ? q.userAnswer 
      : "(입력한 대화 내용이 없습니다)";
    
    item.innerHTML = `
      <div class="review-q">
        <span>Q${idx + 1}. ${q.question}</span>
        <span class="review-q-cat">${q.category}</span>
      </div>
      <div class="review-answers-grid">
        <div class="review-ans-box user">
          <div class="review-ans-title">내가 작성한 답변</div>
          <div class="review-ans-content">${escapeHtml(userAnswerText)}</div>
        </div>
        <div class="review-ans-box official">
          <div class="review-ans-title">기관 공식 가이드 정답</div>
          <div class="review-ans-content">${escapeHtml(q.answer)}</div>
        </div>
      </div>
    `;
    reviewList.appendChild(item);
  });
}

/* 7. 이벤트 리스너 바인딩 및 부가 편의 기능 */

// 입력 필드 실시간 감지: 공백을 제외한 글자가 하나라도 존재하면 "정답 확인하기" 버튼 활성화
userAnswerInput.addEventListener('input', () => {
  const hasText = userAnswerInput.value.trim().length > 0;
  checkBtn.disabled = !hasText;
});

// 단축키 편의 기능: 입력 중 Ctrl+Enter 또는 Cmd+Enter를 누르면 정답 확인이 바로 실행됨
userAnswerInput.addEventListener('keydown', (e) => {
  // 엔터 키이며, Ctrl 또는 Meta(Mac의 Cmd)가 눌린 상태인지 체크
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault(); // 기본 줄바꿈 방지
    
    // 정답 확인 버튼이 활성화되어 있고 아직 정답이 공개되지 않은(locked) 경우에만 확인 진행
    if (!checkBtn.disabled && solutionCard.classList.contains('locked')) {
      checkBtn.click();
    }
  }
});

// "정답 확인하기" 마우스 클릭 이벤트
checkBtn.addEventListener('click', checkAnswer);

// "다음 문제로 넘어가기" 마우스 클릭 이벤트
nextBtn.addEventListener('click', goToNext);

// 완료 화면에서 "다시 처음부터 풀기" 마우스 클릭 이벤트
restartBtn.addEventListener('click', initQuiz);

// 페이지 로드 시 앱 기동
window.addEventListener('DOMContentLoaded', initQuiz);
