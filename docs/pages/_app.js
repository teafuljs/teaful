import { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';

import '../styles/tailwind.css';
import 'nextra-theme-docs/style.css';
import '../styles/globals.css';
import '../styles/theme-light.css';
import '../styles/theme-dark.css';

(typeof global !== 'undefined' ? global : window).Prism = Prism;

const create_ga = (i, s, o, g, r) => {
  i['GoogleAnalyticsObject'] = r;
  i[r] = i[r] || function () {
    (i[r].q = i[r].q || []).push(arguments)
  };
  i[r].l = 1 * new Date();
  const a = s.createElement(o);
  const m = s.getElementsByTagName(o)[0];
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m)
};

const init_ga = () => {
  create_ga(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga')
  ga('create', process.env.NEXT_PUBLIC_GID, 'auto');
  window.ga = ga;
}

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

    init_ga();
    
    return () => document
      .querySelectorAll('a')
      .forEach(a => a.removeEventListener('click', listener));
  }, []);

  return <Component {...pageProps} />
}

