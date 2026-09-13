"use client";

import { apiImageURL } from "@/utils/apiImageURL";
import { Image as MantineImage, ImageProps as MantineImageProps } from "@mantine/core";

interface ImagePlaceholderProps extends MantineImageProps {
  alt?: string;
}

const ImagePlaceholder = ({ ...props }: ImagePlaceholderProps) => {
  // Placeholder is decorative, hide it from screen readers
  return <MantineImage src="/imagePlaceholder.svg" {...props} alt="" />;
};

interface ImageEPProps extends MantineImageProps {
  alt?: string;
}

const ImageEP = ({ src, alt = "", ...props }: ImageEPProps) => {
  return <MantineImage src={apiImageURL(src)} alt={alt} {...props} />;
};

interface ApiImageProps extends MantineImageProps {
  src: string | undefined;
  alt?: string;
}

const ApiImage = ({ src, alt = "", ...props }: ApiImageProps) => {
  if (!src) return <ImagePlaceholder {...props} />;

  if (src?.startsWith("http") || src?.startsWith("https")) {
    return <MantineImage src={src} alt={alt} {...props} />;
  }

  return <ImageEP src={src} alt={alt} {...props} />;
};

export default ApiImage;
