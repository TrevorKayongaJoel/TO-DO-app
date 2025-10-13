import { Link } from "react-router-dom";
import styles from './HomePage.module.css';
import Navigation from './Navigation';

export default function HomePage() {
  return (
    <div>
      <Navigation />
      <div className={styles['home-page']}>
        <div className={styles['content']}> 
          <img src="/Blackman.png" alt="Left Image" className={styles['home-image-left']} />
          <div className={styles['home-content']}>
            <h1>Welcome to Docket</h1>
            <p>Your personal task manager.</p>
            <div className={styles['home-links']}>
              <Link to="/register" className={styles['home-link']}>Get Started for Free</Link>
            </div>
          </div>
          <img src="/Comp&plant.png" alt="Right Image" className={styles['home-image-right']} />
        </div>
        
      </div>
      <div className={styles['about-us-section']}>
        <h2>About Us</h2>
        <p>
          Docket is a simple, yet powerful task manager designed to help you stay organized and productive.
          We believe that managing your tasks should be easy and enjoyable.
        </p>
        <p>
          Our mission is to provide you with the best tools to achieve your goals, one task at a time.
        </p>
      </div>
    </div>
  );
}
