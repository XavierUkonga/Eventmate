import LoginForm from './LoginForm'
import SiteFooter from './SiteFooter'

export default function LandingPage() {
  return (
    <div className="landing-page">
      <main className="landing-hero">
        {/* The video is stored in the public folder. */}
        <video
          className="landing-background-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source
            src="/stock_video_landing.mp4"
            type="video/mp4"
          />
        </video>

        <div
          className="landing-video-shade"
          aria-hidden="true"
        />

        <div className="landing-hero-content">
          <section className="landing-headline">
            <h1>
              Discover events.
              <br />
              Meet your people.
            </h1>

            <p>
              Find local experiences and connect with people
              who share your interests.
            </p>
          </section>

          <section
            className="login-panel"
            aria-label="EventMate account login"
          >
            <LoginForm />
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}