import { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';

import 'nextra-theme-docs/style.css';
import '../styles/theme-light.css';
import '../styles/theme-dark.css';
import '../styles/globals.css';

(typeof global !== 'undefined' ? global : window).Prism = Prism;

export default function DocsApp({ Component, pageProps }) {
  useEffect(Prism.highlightAll);
  
  useEffect(() => {
    const listener = (event) => {
      if (document.location.pathname === event.target.getAttribute('href')) {
        event.preventDefault();
      }
    };
    
    document
      .querySelectorAll('a')
      .forEach(a => a.addEventListener('click', listener));
    
    return () => document
      .querySelectorAll('a')
      .forEach(a => a.removeEventListener('click', listener));
  }, []);

  return <Component {...pageProps} />
}

