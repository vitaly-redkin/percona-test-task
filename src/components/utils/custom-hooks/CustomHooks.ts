import * as React from 'react';

/**
 * Custom hook similar to useState() which checks 
 * if the component is still mounted before calling setState().
 * 
 * @param initialState initial state to set
 */
export function useSafeState<T>(initialState: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const isMountedRef = React.useRef<boolean>(false);

  React.useEffect(
    () => {
      isMountedRef.current = true;

      return () => { 
        isMountedRef.current = false; 
      }
    }, 
  []);

  const [state, setState] = React.useState<T>(initialState);
  const setSafeState = React.useCallback(
    (newState: T): void => {
      if (isMountedRef.current) {
        setState(newState);
      }/* else {
        console.log('Unmounted!');
        console.log(newState);
      }*/
    },
    []
  );

  return [state, setSafeState];
}
