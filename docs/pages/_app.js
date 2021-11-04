import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';

import 'nextra-theme-docs/style.css';
import '../styles/theme-light.css';
import '../styles/theme-dark.css';
import '../styles/globals.css';

(typeof global !== "undefined" ? global : window).Prism = Prism;

export default function DocsApp({ Component, pageProps }) {
  const { pathname } = useRouter();
  
  useEffect(() => {
    Prism.highlightAll();
  }, [pathname]);

  return <Component {...pageProps} />
}

