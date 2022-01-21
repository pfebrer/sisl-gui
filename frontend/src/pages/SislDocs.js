import { useState, useEffect } from 'react';

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}

const SislDocs = props => {
    const { height } = useWindowDimensions();

    return <iframe 
        src={"https://zerothi.github.io/sisl/"} title="Sisl documentation" aria-label="Sisl documentation" 
        style={{height: height - 20, width: "99%"}}/>

}

export default SislDocs;