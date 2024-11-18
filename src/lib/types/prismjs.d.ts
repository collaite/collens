declare module 'prismjs' {
  const Prism: {
    highlight: (code: string, grammar: any, language: string) => string;
    languages: {
      [key: string]: any;
    };
  };
  export default Prism;
}

declare module 'prismjs/components/prism-markup';
declare module 'prismjs/components/prism-xml';
declare module 'prismjs/themes/prism-tomorrow.css';
