import React from 'react';
import styles from './AuthLayout.module.css';
import { ShieldCheck, Zap } from 'lucide-react';
import MarketplaceAnimation from '../components/auth/MarketplaceAnimation';
import ErrorAnimation from '../components/auth/ErrorAnimation';
import campusBg from '../assets/campus_students.png';

// leftView can be: 'idle', 'typing', 'error'
const AuthLayout = ({ children, leftView = 'idle' }) => {
  return (
    <div className={styles.pageWrapper}>
      {/* Top Navbar — matches home page dark navy bar */}
      <header className={styles.topNavbar}>
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>S</div>
          <div className={styles.logoTextWrapper}>
            <span className={styles.logoTitle}>SLIIT MARKETPLACE</span>
            <span className={styles.logoSubtitle}>DIGITAL CAMPUS</span>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.leftPanel}>
          {/* Background Image */}
          <div className={styles.bgImageWrapper}>
            <img src={campusBg} alt="Campus students interacting" className={styles.bgImage} />
            <div className={styles.bgOverlay} />
          </div>

          {/* View 1: Default Welcome */}
          <div className={`${styles.contentWrapper} ${leftView === 'idle' ? styles.visible : styles.hidden}`}>
            <div className={styles.badge}>OFFICIAL STUDENT HUB</div>
            
            <h1 className={styles.title}>
              Unlock the power of your <br />
              <span className={styles.highlight}>Campus Network.</span>
            </h1>
            
            <p className={styles.description}>
              Join thousands of students buying, selling, and trading textbooks, electronics, and academic services in a trusted environment.
            </p>
            
            <div className={styles.cardsContainer}>
              <div className={styles.featureCard}>
                <div className={styles.iconWrapper}>
                  <ShieldCheck size={18} />
                </div>
                <h3 className={styles.cardTitle}>Secure Trading</h3>
                <p className={styles.cardDesc}>Exclusive to verified university students only.</p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.iconWrapper}>
                  <Zap size={18} />
                </div>
                <h3 className={styles.cardTitle}>Zero Fees</h3>
                <p className={styles.cardDesc}>Keep 100% of your earnings on every single sale.</p>
              </div>
            </div>
          </div>

          {/* View 2: Marketplace SVG (typing) */}
          <div className={`${styles.animationWrapper} ${leftView === 'typing' ? styles.visible : styles.hidden}`}>
            <MarketplaceAnimation isTyping={leftView === 'typing'} />
          </div>

          {/* View 3: Error SVG */}
          <div className={`${styles.errorWrapper} ${leftView === 'error' ? styles.visible : styles.hidden}`}>
            <ErrorAnimation />
          </div>
        </div>
      
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
