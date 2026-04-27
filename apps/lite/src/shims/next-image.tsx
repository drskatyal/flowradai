/**
 * next/image shim — renders a plain <img> without Next.js optimisation.
 */
import React from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fill?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  loader?: unknown;
  unoptimized?: boolean;
  onLoadingComplete?: unknown;
  sizes?: string;
  style?: React.CSSProperties;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      width,
      height,
      priority: _priority,
      fill,
      quality: _quality,
      placeholder: _placeholder,
      blurDataURL: _blurDataURL,
      loader: _loader,
      unoptimized: _unoptimized,
      onLoadingComplete: _onLoadingComplete,
      style,
      ...rest
    },
    ref
  ) => {
    const computedStyle: React.CSSProperties = fill
      ? { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style }
      : style ?? {};

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        style={computedStyle}
        {...rest}
      />
    );
  }
);

Image.displayName = 'Image';

export default Image;
