import type { Route } from "./+types/home";
import { useEffect, useState } from 'react';
import styles from './home.module.css';
import GoogleSignIn from '../components/GoogleSignIn';
import { useAuth } from '../context/AuthContext';
import UserInfo from '../components/UserInfo/UserInfo';
import ToolSelectionArea from '../components/ToolSelectionArea/ToolSelectionArea';

export function meta({}: Route.MetaArgs) {
  return [
    {
      title: "visionary.tools",
    },
  ];
}

interface AnimatedLetterProps {
  char: string;
  index: number;
  isVisible: boolean;
}

function AnimatedLetter({ char, index, isVisible }: AnimatedLetterProps) {
  const letterClasses = [
    styles.letter,
    char === '.' ? styles.dot : '',
    isVisible ? styles.visible : ''
  ].filter(Boolean).join(' ');

  const style = {
    transitionDelay: `${index * 20}ms`,
    textShadow: char === '.' ? '0 0 25px rgba(96, 165, 250, 0.7)' : 'none'
  };

  return (
    <span className={letterClasses} style={style}>
      {char === ' ' ? '\u00A0' : char}
    </span>
  );
}

export default function App() {
  const [isVisible, setIsVisible] = useState(false);
  const titleChars = "visionary.tools".split('');
  const { foundUser, user, loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const buttonStyle = {
    transitionDelay: `${titleChars.length * 30}ms`
  };

  if (user) {
    console.log('user is ---------->', user)
  }

  // Show loading state while authentication state is being determined
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.backgroundContainer}>
          <div className={styles.gradientBlur1} />
          <div className={styles.gradientBlur2} />
        </div>
        <div className={styles.content}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingDot} />
            <div className={styles.loadingDot} />
            <div className={styles.loadingDot} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.home}>
      <div className={styles.backgroundContainer}>
        <div className={styles.gradientBlur1} />
        <div className={styles.gradientBlur2} />
      </div>
      <header>
        <h1 className={styles.title}>
          {titleChars.map((char, i) => (
            <AnimatedLetter key={i} char={char} index={i} isVisible={isVisible} />
          ))}
        </h1>
      </header>
      <div className={styles.logoContainer}>
        <div className={styles.legend}>
        </div>
        <img className={styles.logo} src='favicon.svg' />
        <div className={styles.legend}>
        </div>
      </div>
      <main className={styles.content}>
        <div
          className={`${styles.buttonContainer} ${isVisible ? styles.visible : ''}`}
          style={buttonStyle}
        >
          {user ? (
            <>
              <UserInfo />
              <ToolSelectionArea />
            </>
          ) : foundUser ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingDot} />
              <div className={styles.loadingDot} />
              <div className={styles.loadingDot} />
            </div>
          )
            : (
              <GoogleSignIn />
            )}
        </div>
      </main>
      <footer>made with ❤️ by &nbsp;<a href='mailto:mike@mikedonovan.dev'>mikedonovan.dev</a></footer>
    </div>
  );
}