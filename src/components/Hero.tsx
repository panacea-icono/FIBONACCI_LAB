import * as React from 'react';
import '../styles/Hero.css';

interface HeroProps {
  title?: string;
  description?: string;
}

export const Hero: React.FC<HeroProps> = ({
  title = "Fibonacci Lab",
  description = "Explore nuestra aplicación"
}) => {
  return (
    <div className="hero-container">
      <div className="video-container">
        <video autoPlay loop muted preload="metadata" className="videodefondo">
          <source src="/video/video.mp4" type="video/mp4" />
        </video>
        <div className="content">
          <div className="text-content">
            <h1 className="hero-title">{title}</h1>
            <p className="hero-description">{description}</p>
          </div>
          <div className="cta-container">
            {/* Add call-to-action buttons as needed */}
          </div>
        </div>
      </div>
    </div>
  );
};