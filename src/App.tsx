import { useEffect, useState } from 'react';
import styles from './App.module.css';

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const buttonStyle = {
    transitionDelay: `${titleChars.length * 30}ms`
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.backgroundContainer}>
          <div className={styles.gradientBlur1} />
          <div className={styles.gradientBlur2} />
        </div>
        <div className={styles.content}>
          <h1 className={styles.title}>
            {titleChars.map((char, i) => (
              <AnimatedLetter
                key={i}
                char={char}
                index={i}
                isVisible={isVisible}
              />
            ))}
          </h1>
          <img className={styles.logo} src='favicon.svg' />
          <div
            className={`${styles.buttonContainer} ${isVisible ? styles.visible : ''}`}
            style={buttonStyle}
          >
            <a href="/inventory" className={styles.button}>
              Inventory
            </a>
          </div>
        </div>
      </div>
      <footer>by mike@mikedonovan.dev</footer>
    </>
  );
}