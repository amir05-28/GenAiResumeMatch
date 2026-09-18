import React from 'react'
import "../style/Home.scss"

const Home = () => {
  return (
        <main className="home">
            <section className="interview-card" aria-labelledby="page-title">
                <header className="page-heading">
                    <h1 id="page-title">
                        Create Your Custom <span>Interview Plan</span>
                    </h1>
                    <p>Let our AI analyze the job requirements and your unique profile to<br className="desktop-break" /> build a winning strategy.</p>
                </header>

                <div className="interview-input-group">
                    <section className="job-panel" aria-labelledby="job-title">
                        <div className="section-heading">
                            <h2 id="job-title"><span className="section-icon" aria-hidden="true">▥</span> Target Job Description</h2>
                            <span className="required-badge">REQUIRED</span>
                        </div>
                        <textarea
                            name="jobDescription"
                            id="jobDescription"
                            placeholder="Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires\nproficiency in React, TypeScript, and large-scale system\ndesign...'"
                            maxLength={5000}
                        />
                        <span className="character-count">0 / 5000 chars</span>
                    </section>

                    <section className="profile-panel" aria-labelledby="profile-title">
                        <div className="section-heading profile-heading">
                            <h2 id="profile-title"><span className="section-icon" aria-hidden="true">♙</span> Your Profile</h2>
                        </div>

                        <div className="input-group">
                            <div className="field-label-row">
                                <label htmlFor="resume">Upload Resume</label>
                                <span className="best-results">BEST RESULTS</span>
                            </div>
                            <label className="file-dropzone" htmlFor="resume">
                                <span className="upload-icon" aria-hidden="true">⇧</span>
                                <strong>Click to upload or drag &amp; drop</strong>
                                <small>PDF or DOCX (Max 5MB)</small>
                            </label>
                            <input type="file" name="resume" id="resume" accept=".pdf,.docx" />
                        </div>

                        <div className="or-divider"><span>OR</span></div>

                        <div className="input-group self-description-group">
                            <label htmlFor="selfDescription">Quick Self-Description</label>
                            <textarea
                                name="selfDescription"
                                id="selfDescription"
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                        </div>

                        <div className="info-note" role="note">
                            <span aria-hidden="true">i</span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
                        </div>
                    </section>
        </div>

                <footer className="card-footer">
                    <span>AI-Powered Strategy Generation&nbsp; - &nbsp;Approx 30s</span>
                    <button type="button" className="generate-button"><span aria-hidden="true">★</span> Generate My Interview Strategy</button>
                </footer>
            </section>

            <nav className="page-links" aria-label="Footer navigation">
                <a href="#privacy">Privacy Policy</a>
                <a href="#terms">Terms of Service</a>
                <a href="#help">Help Center</a>
            </nav>
    </main>
  )
}

export default Home
