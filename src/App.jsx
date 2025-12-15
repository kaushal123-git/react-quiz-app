import { useState } from 'react'
import { questions } from './questions'

export default function App() {
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)

  // SHUFFLED QUESTIONS (used in quiz)
  const [shuffledQuestions, setShuffledQuestions] = useState([])

  // CUSTOM QUESTIONS
  const [customQuestions, setCustomQuestions] = useState(
    JSON.parse(localStorage.getItem("customQuestions")) || []
  )

  // SCOREBOARD
  const [scoreboard, setScoreboard] = useState(
    JSON.parse(localStorage.getItem("scoreboard")) || []
  )

  // ADD QUESTION FORM STATES
  const [showAddForm, setShowAddForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState("")
  const [options, setOptions] = useState(["", "", "", ""])
  const [correctAnswer, setCorrectAnswer] = useState(null)

  // SHUFFLE FUNCTION
  function shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  function startQuiz() {
    const combined = [...questions, ...customQuestions]
    const shuffled = shuffleArray(combined)
    setShuffledQuestions(shuffled)
    setStarted(true)
    setCurrent(0)
    setScore(0)
    setSelected(null)
    setShowFeedback(false)
  }

  function selectAnswer(index) {
    setSelected(index)
    setShowFeedback(true)
    if (index === shuffledQuestions[current].answer) {
      setScore(score + 1)
    }
  }

  function nextQuestion() {
    setSelected(null)
    setShowFeedback(false)
    setCurrent(current + 1)
  }

  function saveQuestion() {
    if (!newQuestion || correctAnswer === null) return

    const newQ = {
      question: newQuestion,
      options,
      answer: correctAnswer
    }

    const updated = [...customQuestions, newQ]
    setCustomQuestions(updated)
    localStorage.setItem("customQuestions", JSON.stringify(updated))

    setNewQuestion("")
    setOptions(["", "", "", ""])
    setCorrectAnswer(null)
    setShowAddForm(false)
  }

  function saveScoreToBoard() {
    const entry = {
      score,
      total: shuffledQuestions.length,
      date: new Date().toLocaleString()
    }

    const updated = [...scoreboard, entry]
    setScoreboard(updated)
    localStorage.setItem("scoreboard", JSON.stringify(updated))
  }

  return (
    <div className="app">

      {/* START SCREEN */}
      {!started ? (
        <>
          <div className="card">
            <h1>Interactive Quiz App</h1>
            <button onClick={startQuiz}>Start Quiz</button>
            <button onClick={() => setShowAddForm(true)}>
              Add Your Own Question
            </button>
          </div>

          {showAddForm && (
            <div className="card">
              <h2>Add a Question</h2>

              <input
                placeholder="Question"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />

              {options.map((opt, i) => (
                <input
                  key={i}
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const updated = [...options]
                    updated[i] = e.target.value
                    setOptions(updated)
                  }}
                />
              ))}

              <select onChange={(e) => setCorrectAnswer(Number(e.target.value))}>
                <option value="">Correct option</option>
                <option value="0">Option 1</option>
                <option value="1">Option 2</option>
                <option value="2">Option 3</option>
                <option value="3">Option 4</option>
              </select>

              <button onClick={saveQuestion}>Save Question</button>
              <button onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          )}
        </>
      ) : (
        // QUIZ SCREEN
        shuffledQuestions.length > 0 && current < shuffledQuestions.length ? (
          <div className="card">

            {/* PROGRESS BAR */}
            <div className="progress-container">
              <div
                className="progress-fill"
                style={{
                  width: `${((current + 1) / shuffledQuestions.length) * 100}%`
                }}
              ></div>
            </div>

            <p className="progress-text">
              Question {current + 1} of {shuffledQuestions.length}
            </p>

            <h2>{shuffledQuestions[current].question}</h2>

            {shuffledQuestions[current].options.map((opt, i) => {
              let className = ''

              if (showFeedback) {
                if (i === shuffledQuestions[current].answer) className = 'correct'
                else if (i === selected) className = 'wrong'
              }

              return (
                <button
                  key={i}
                  className={className}
                  onClick={() => selectAnswer(i)}
                  disabled={showFeedback}
                >
                  {opt}
                </button>
              )
            })}

            {showFeedback && (
              <button onClick={nextQuestion} className="next-btn">
                Next
              </button>
            )}

          </div>
        ) : (
          // RESULT SCREEN
          <div className="card">
            <h2>Quiz Completed 🎉</h2>
            <p className="result-score">
              Your Score: {score} / {shuffledQuestions.length}
            </p>

            <button onClick={saveScoreToBoard}>Save Score</button>

            <h3>Scoreboard</h3>
            <ul className="scoreboard">
              {scoreboard.length === 0 ? (
                <li>No scores yet</li>
              ) : (
                scoreboard.map((entry, index) => (
                  <li key={index}>
                    Attempt {index + 1}: {entry.score} / {entry.total}
                    <br />
                    <small>{entry.date}</small>
                  </li>
                ))
              )}
            </ul>

            <button onClick={() => window.location.reload()}>
              Restart Quiz
            </button>
          </div>
        )
      )}
    </div>
  )
}
