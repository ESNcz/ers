import { Box } from "@mantine/core";
import React, { useState } from "react";
import Cropper, { CropperProps } from "react-easy-crop";

interface ImageEditorProps {
  cropper: Partial<CropperProps>;
}

const ImageEditor = ({ cropper }: ImageEditorProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  return (
    <>
      <Cropper
        image={cropper.image}
        crop={crop}
        zoom={zoom}
        aspect={1}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        {...cropper}
      />
      <Box display="none">
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => {
            setZoom(Number(e.target.value));
          }}
        />
      </Box>
    </>
  );
};

export default ImageEditor;
