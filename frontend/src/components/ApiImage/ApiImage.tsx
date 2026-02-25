"use client";

import { apiImageURL } from "@/utils/apiImageURL";
import { Image as MantineImage, ImageProps as MantineImageProps } from "@mantine/core";

interface ImagePlaceholderProps extends MantineImageProps {}

const ImagePlaceholder = ({ ...props }: ImagePlaceholderProps) => {
  return <MantineImage src="/imagePlaceholder.svg" alt="Placeholder Image" {...props} />;
};

interface ImageEPProps extends MantineImageProps {}

const ImageEP = ({ src, ...props }: ImageEPProps) => {
  return <MantineImage src={apiImageURL(src)} alt="Image from API" {...props} />;
};

interface ApiImageProps extends MantineImageProps {
  src: string | undefined;
}

const ApiImage = ({ src, ...props }: ApiImageProps) => {
  if (!src) return <ImagePlaceholder {...props} />;

  if (src?.startsWith("http") || src?.startsWith("https")) {
    return <MantineImage src={src} alt="Image from API" {...props} />;
  }

  return <ImageEP src={src} {...props} />;
};

export default ApiImage;
