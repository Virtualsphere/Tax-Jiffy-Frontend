import { useRef, useEffect, useState } from 'react';
import styles from './AnimatedExpandable.module.css';

interface AnimatedExpandableProps {
  isExpanded: boolean;
  children: React.ReactNode;
}

export function AnimatedExpandable({ isExpanded, children }: AnimatedExpandableProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      const observer = new ResizeObserver(() => {
        if (contentRef.current) {
          setContentHeight(contentRef.current.scrollHeight);
        }
      });
      observer.observe(contentRef.current);
      setContentHeight(contentRef.current.scrollHeight);
      return () => observer.disconnect();
    }
  }, [children]);

  return (
    <div 
      className={`${styles.wrapper} ${isExpanded ? styles.expanded : ''}`}
      style={{ maxHeight: isExpanded ? `${contentHeight}px` : '0px' }}
    >
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
