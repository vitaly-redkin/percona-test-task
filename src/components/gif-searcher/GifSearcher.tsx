/**
 * The item list component.
 */
import * as React from 'react';
import { Button, Container, AppBar, Toolbar, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import ShowMoreIcon from '@material-ui/icons/ExpandMore';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import * as lodash from 'lodash';

import { GliphyApiResultModel } from '../../models/GliphyApiResultModel';
import { GliphyDataItemModel } from '../../models/GliphyDataItemModel';
import { ServiceError } from '../../service/BaseService';
import { GliphyService } from '../../service/GliphyService';
import GifItem from '../gif-item/GifItem';

import './GifSearcher.css'

/**
 * Component initial state. 
 */
const initialState = {
  query: '',
  newQuery: '',
  items: Array<GliphyDataItemModel>(),
  isLoading: true,
  error: '',
  offset: 0,
  newOffset: 0,
  totalItemCount: 0,
  scrollToEnd: false,
};

/**
 * Interface for the component state object.
 */
type State = typeof initialState;

/**
 * Type for reducer actions.
 */
type Action =
  | { type: 'SET_QUERY'; query: string }
  | { type: 'START_SEARCH' }
  | { type: 'ADD_PAGE_DATA'; result: GliphyApiResultModel }
  | { type: 'SHOW_NEXT_PAGE' }
  | { type: 'SET_ERROR'; error: ServiceError }
  | { type: 'CLEAR_SCROLL_TO_END' };


/**
 * Component state reducer.
 * 
 * @param state current state
 * @param action action to process
 */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_QUERY': 
      return {
        ...state,
        query: action.query,
      };
    case 'START_SEARCH': 
      return {
        ...state,
        newQuery: state.query,
        items: [],
        isLoading: true,
        offset: 0,
        newOffset: 0,
      };
    case 'ADD_PAGE_DATA':
      return {
        ...state,
        items: [
          ...state.items, 
          ...action.result.data.filter(ni => !state.items.find(i => i.id === ni.id))
        ],
        isLoading: false,
        error: '',
        newOffset: action.result.pagination.offset + action.result.pagination.count,
        totalItemCount: action.result.pagination.totalCount,
        scrollToEnd: true,
      }
    case 'SHOW_NEXT_PAGE': {
      return {
        ...state,
        isLoading: true,
        offset: state.newOffset,
      }
    }
    case 'SET_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.error.userMessage,
      }
    case 'CLEAR_SCROLL_TO_END':
      return {
        ...state,
        scrollToEnd: false,
      }
    }
}

/**
 * Component function.
 * 
 * @param props component properties
 */
function GifSearcher(): JSX.Element {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const bottomDivRef = React.useRef<HTMLDivElement>(null);

  /**
   * Handles API call error.
   * 
   * @param error API error to handle
   */
  const onError = React.useCallback(
    (error: ServiceError): void => {
      console.log(error);
      dispatch({type: 'SET_ERROR', error});
    },
    []
  );

  /**
   * Handles fetch images fetching success.
   * 
   * @param result API result to process
   */
  const onFetchImagesSuccess = React.useCallback(
    (result: GliphyApiResultModel): void => {
      dispatch({type: 'ADD_PAGE_DATA', result})
    },
    []
  );

  /**
   * Loads next content item list page.
   */
  const loadNextPage = React.useCallback(
    (): void => {
      if (state.newOffset >= 0) {
        new GliphyService().fetchImages(
          state.newQuery,
          state.newOffset,
          onFetchImagesSuccess,
          onError
        );
      }
    },
    [state.newQuery, state.newOffset, onFetchImagesSuccess, onError]
  );

  /**
   * Shows next page with images.
   */
  const showNextPage = React.useCallback(
    (): void => {
      dispatch({type: 'SHOW_NEXT_PAGE'});
    },
    []
  );

  /**
   * Scrolls to the end of the image list.
   */
  React.useLayoutEffect(
    (): void => {
      if (state.scrollToEnd && state.offset > 0) {
        setTimeout(
          (): void => {
            if (bottomDivRef.current) {
              bottomDivRef.current.scrollIntoView();
            }
          },
          100
        )
        dispatch({type: 'CLEAR_SCROLL_TO_END'});
      }
    },
    [state.scrollToEnd, state.offset]
  );

  /**
   * Loads next image list page.
   */
  React.useEffect(
    (): void => {
      if (state.isLoading) {
        loadNextPage();
      }
    },
    [state.isLoading, loadNextPage]
  );

  /**
   * "Debounced" start search trigger.
   */
  const debouncedStartSearch = React.useRef(
    lodash.debounce(
      () => dispatch({type: 'START_SEARCH'}),
      500
    )
  ).current;

  /**
   * onChange event handler for the query input.
   * 
   * @param event event to handle
   */
  const setQuery = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const query: string = event.target.value;
      dispatch({type: 'SET_QUERY', query});
      debouncedStartSearch();
    },
    [debouncedStartSearch]
  );

  /**
   * Renders image list.
   */
  const renderList = (): JSX.Element => {
    const itemsLeft: number = state.totalItemCount - state.newOffset;

    return (
      <>
        {state.items.map(ci => (
          <GifItem key={ci.id} item={ci} />
        ))}
        {itemsLeft > 0 && 
        <>
          <Button onClick={showNextPage} 
                  title='Show more images'
                  disabled={state.isLoading}
                  variant='contained'
                  className='next-page-button'
          >
            <ShowMoreIcon fontSize='large' />
          </Button>
        </>
        }
        <div ref={bottomDivRef}/>
      </>
    );
  };

  /**
   * Renders component.
   */
  const render = (): JSX.Element => {
    return (
      <Container maxWidth='md' className='gif-searcher'>
        <AppBar position='static'>
          <Toolbar>
            <Typography variant='h6'>
              Gliphy Images
            </Typography>
            <div className='search'>
              <div className='search-icon'>
                <SearchIcon />
              </div>
              <InputBase
                placeholder='Type query to show images...'
                classes={{
                  root: 'input-root',
                  input: 'input-input',
                }}
                inputProps={{ 'aria-label': 'search' }}
                value={state.query}
                onChange={setQuery}
              />
            </div>          
          </Toolbar>
        </AppBar>

        <div className='body-container'>
          <div className='body'>
            {state.isLoading ? (
            <Alert variant='filled' severity='info'>
              Loading data - please wait...
            </Alert>
            ) : state.error ? (
            <Alert variant='filled' severity='error'>
              {state.error}
            </Alert>
            ) : (
              null
            )
            }
            {state.totalItemCount > 0 ? 
             renderList() :
             <Alert variant='filled' severity='warning'>
                {state.newQuery ? 
                 'No images found - please use another query' :
                 'Type some query...'
                }
              </Alert>
           }
          </div>
        </div>
      </Container>
    );
  };

  return render();
}

export default GifSearcher;
