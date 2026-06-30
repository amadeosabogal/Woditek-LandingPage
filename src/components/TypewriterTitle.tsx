import { useState, useEffect, useRef } from 'react';

interface TypewriterTitleProps {
  text: string;
  className?: string;
  cursorColor?: string;
  speed?: number;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
}

export function TypewriterTitle({ 
  text, 
  className = "", 
  cursorColor = "#00d1ff", 
  speed = 40, 
  delay = 200,
  as: Component = 'h2'
}: TypewriterTitleProps) {
  const [typedText, setTypedText] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted || isFinished) return;

    let index = 0;
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (index < text.length) {
          setTypedText(text.substring(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setIsFinished(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [hasStarted, isFinished, text, speed, delay]);

  return (
    <Component ref={ref as any} className={`${className} relative`}>
      {/* Elemento de accesibilidad para lectores de pantalla */}
      <span className="sr-only">{text}</span>
      
      {/* Elemento invisible para reservar espacio de diseño y evitar variaciones de altura */}
      <span className="invisible select-none" aria-hidden="true">
        {text}
      </span>
      
      {/* Contenedor absoluto con el efecto visual de escritura */}
      <span className="absolute inset-0" aria-hidden="true">
        <span>{typedText}</span>
        {!isFinished && hasStarted && (
          <span 
            className="inline-block w-[3px] md:w-[4px] h-[0.85em] ml-1.5 align-middle animate-pulse"
            style={{ backgroundColor: cursorColor, boxShadow: `0 0 8px ${cursorColor}` }}
          ></span>
        )}
      </span>
    </Component>
  );
}
