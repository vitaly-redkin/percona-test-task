/**
 * The GIF item component.
 */
import * as React from 'react';

import { GliphyDataItemModel } from '../../models/GliphyDataItemModel';

import './GifItem.css';

/**
 * Interface for the component properties.
 */
interface Props {
  item: GliphyDataItemModel;
}

/**
 * Component function.
 * 
 * @param props component properties
 */
function GifItem(props: Props): JSX.Element {
  /**
   * Renders component.
   */
  const render = (): JSX.Element => {
    const imageSrc = 
      `${process.env.REACT_APP_IMAGE_URL_PREFIX}${props.item.id}.${props.item.type}`;
      
    return (
      <img src={imageSrc} alt={props.item.title} />
    );
  };

  return render();
}

export default GifItem;
