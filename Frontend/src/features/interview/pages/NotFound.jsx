import { Link } from 'react-router'
import './NotFound.scss'

function NotFound() {
    return (
        <main className="not-found-page">
            <div className="not-found-card">
                <span className="not-found-code">404</span>
                <h1>We can’t find that page</h1>
                <p>The page may have moved, or the link might be incorrect.</p>
                <Link className="not-found-link" to="/">Back to interview plans</Link>
            </div>
        </main>
    )
}

export default NotFound
