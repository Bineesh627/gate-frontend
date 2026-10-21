import * as React from "react";
import { cn } from "@/lib/utils";
import { resolveAssetUrl } from "@/api/marketApi";


/**
 * @typedef {React.ImgHTMLAttributes<HTMLImageElement> & {
 *   src?: string;
 *   alt?: string;
 *   fittingType?: "fill" | "fit" | string;
 *   aspectRatio?: string | number;
 *   focalPointX?: number;
 *   focalPointY?: number;
 * }} ImageProps
 */

/** @type {React.ForwardRefExoticComponent<ImageProps & React.RefAttributes<HTMLImageElement>>} */
const Image = React.forwardRef(
  (
    /** @type {ImageProps} */
    {
      src,
      alt = "",
      fittingType = "fill",
      className,
      style,
      aspectRatio,
      focalPointX,
      focalPointY,
      ...props
    },
    ref
  ) => {
    const objectFitClass = fittingType === "fit" ? "object-contain" : "object-cover";
    const objectPositionStyle =
      typeof focalPointX === "number" || typeof focalPointY === "number"
        ? {
            objectPosition: `${(focalPointX ?? 0.5) * 100}% ${(focalPointY ?? 0.5) * 100}%`,
          }
        : {};

    return (
      <img
        ref={ref}
        src={resolveAssetUrl(src)}
        alt={alt}
        loading="lazy"

        className={cn(objectFitClass, className)}
        style={{
          aspectRatio,
          ...objectPositionStyle,
          ...style,
        }}
        {...props}
      />
    );
  }
);
Image.displayName = "Image";

export { Image };
