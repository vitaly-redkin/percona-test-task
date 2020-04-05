/**
 * The GIF item component.
 */
import * as React from 'react';

import { GliphyDataItemModel } from '../../models/GliphyDataItemModel';
import { GliphyImageModel } from '../../models/GliphyImageModel';
import { useSafeState as useState } from '../utils/custom-hooks/CustomHooks'; 

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
  const imageSrc = 
    `${process.env.REACT_APP_IMAGE_URL_PREFIX}${props.item.id}.${props.item.type}`;
  const image: GliphyImageModel = props.item.images?.original;
  const hasSize: boolean = !!image && !!image.width && !!image.height;

  const [imageLoaded, setImageLoaded] = useState<boolean>(!hasSize);

  /**
   * Handles image onLoad event.
   */
  const onImageLoad = React.useCallback(
    () => setImageLoaded(true),
    []
  );

  /**
   * Renders component.
   */
  const render = (): JSX.Element => {
    return (
      <>
        {!imageLoaded &&
        <div style={{width: `${image.width}px`, height: `${image.height}px`}} 
             className='gif-item-image-placeholder'
        >
          <p>{`Loading "${props.item.title}"...`}</p>
        </div>
        }
        <img src={imageSrc} 
             alt={props.item.title} 
             className='gif-item'
             style={{display: (imageLoaded ? 'inline-grid' : 'none')}}
             onLoad={onImageLoad}
        />
      </>
    );
  };

  return render();
}

export default GifItem;
