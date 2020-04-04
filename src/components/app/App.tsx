/**
 * Application main component.
 */
import React from 'react';

import GifSearcher from '../gif-searcher/GifSearcher';

/**
 * Component function.
 */
function App(): JSX.Element {
  /**
   * Renders the component.
   */
  const render = (): JSX.Element => (
    <GifSearcher /> 
  );

  return render();
}

export default App;
