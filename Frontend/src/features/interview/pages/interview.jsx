import React from 'react'
import '../style/interview.scss'
import {useInterview} from "../hooks/useInterview.js"

const technicalQuestions = [
  'Technical questions',
  'Behavioral questions',
  'Road Map'
]

const behavioralQuestions = [
  {
    id: 1,
    question:
      'Describe a time when you had to optimize a piece of code that was causing production delays. How did you identify the bottleneck?',
    intention:
      'To evaluate problem-solving skills and the use of monitoring/profiling tools.',
    modelAnswer:
      'The candidate should use the STAR method. They should mention using tools like Chrome DevTools, New Relic, or MongoDB Atlas Profiler, the specific metrics they looked at, and the measurable impact of their fix.'
  },
  {
    id: 2,
    question:
      'How do you approach learning a new technology, such as your recent work with the Gemini API?',
    intention: 'To assess adaptability and how the candidate learns and applies new tools quickly.',
    modelAnswer:
      'The candidate should explain a structured learning process: reviewing docs, creating small proof-of-concept experiments, testing edge cases, and then integrating it into production with feedback loops.'
  }
]

const skillGaps = [
  { label: 'Message Queues (Kafka/RabbitMQ)', tone: 'red' },
  { label: 'Advanced Docker & CI/CD Pipelines', tone: 'amber' },
  { label: 'Distributed Systems Design', tone: 'blue' },
  { label: 'Production-level Redis management', tone: 'green' }
]

const preparationPlan = {
  technicalQuestions: 'Technical questions',
  behavioralQuestions: 'Behavioral questions',
  skillGaps: 'Skill Gaps',
  preparationPlan: 'Road Map'
}

const Interview = () => {
  return (
    <main className="interview-page">
      <div className="interview-shell">
        <aside className="interview-sidebar" aria-label="Interview navigation">
          <div className="sidebar-title">SECTIONS</div>

          <nav className="sidebar-nav" aria-label="Sections menu">
            {technicalQuestions.map((section, index) => {
              const active = index === 1
              return (
                <button
                  key={section}
                  type="button"
                  className={`sidebar-item ${active ? 'active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="sidebar-icon" aria-hidden="true">
                    {index === 0 ? '<' : index === 1 ? '▣' : '↗'}
                  </span>
                  {section}
                </button>
              )
            })}
          </nav>
        </aside>

        <section className="interview-main" aria-label="Interview content">
          <header className="panel-header">
            <h1>
              Behavioral Questions
              <span className="count">2 questions</span>
            </h1>
          </header>

          <div className="question-list">
            {behavioralQuestions.map((item) => (
              <article key={item.id} className={`question-card ${item.id === 1 ? 'expanded' : 'collapsed'}`}>
                <div className="question-row">
                  <span className="question-number">Q{item.id}</span>
                  <p>{item.question}</p>
                  <span className="collapse-toggle" aria-hidden="true">
                    {item.id === 1 ? '⌃' : '⌄'}
                  </span>
                </div>

                {item.id === 1 && (
                  <div className="answer-panel">
                    <div className="answer-label intention">INTENTION</div>
                    <p>{item.intention}</p>

                    <div className="answer-label model">MODEL ANSWER</div>
                    <p>{item.modelAnswer}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <aside className="interview-summary" aria-label="Interview summary">
          <div className="summary-block">
            <div className="summary-label">MATCH SCORE</div>
            <div className="score-ring" aria-label="88% match score">
              <div className="score-value">88<span>%</span></div>
            </div>
            <p className="score-text">Strong match for this role</p>
          </div>

          <div className="summary-block skill-block">
            <div className="summary-label">SKILL GAPS</div>
            <div className="skill-gap-list">
              {skillGaps.map((skill) => (
                <span key={skill.label} className={`skill-gap ${skill.tone}`}>
                  {skill.label}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default Interview
