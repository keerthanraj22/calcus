import React, { useMemo } from 'react';
import katex from 'katex';

interface KaTeXViewProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export const KaTeXView: React.FC<KaTeXViewProps> = ({
  latex,
  displayMode = false,
  className = '',
}) => {
  const html = useMemo(() => {
    if (!latex) return '';
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
      });
    } catch (e) {
      return latex;
    }
  }, [latex, displayMode]);

  return (
    <span
      className={`katex-container inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
