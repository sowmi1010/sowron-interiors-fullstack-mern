import { useEffect, useRef, useState } from "react";

const DEFAULT_WATERMARK = "SOWRON";

export default function SecureImageCanvas({
  src,
  alt = "",
  className = "",
  onClick,
  watermark,
  fit = "cover",
  rounded = true,
  maxDimension = 1600,
}) {
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let aborted = false;
    if (!src || !canvasRef.current) return;

    setLoaded(false);
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (aborted || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setLoaded(true);
        return;
      }

      const naturalWidth = img.naturalWidth || img.width || 1;
      const naturalHeight = img.naturalHeight || img.height || 1;
      const maxInput = Number(maxDimension);
      const maxAllowed =
        Number.isFinite(maxInput) && maxInput > 0
          ? maxInput
          : Math.max(naturalWidth, naturalHeight);

      const scale = Math.min(1, maxAllowed / Math.max(naturalWidth, naturalHeight));
      const targetWidth = Math.max(1, Math.round(naturalWidth * scale));
      const targetHeight = Math.max(1, Math.round(naturalHeight * scale));

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.clearRect(0, 0, targetWidth, targetHeight);

      if (fit === "cover") {
        const canvasRatio = targetWidth / targetHeight;
        const imgRatio = naturalWidth / naturalHeight;
        let sx = 0;
        let sy = 0;
        let sWidth = naturalWidth;
        let sHeight = naturalHeight;

        if (imgRatio > canvasRatio) {
          sWidth = naturalHeight * canvasRatio;
          sx = (naturalWidth - sWidth) / 2;
        } else {
          sHeight = naturalWidth / canvasRatio;
          sy = (naturalHeight - sHeight) / 2;
        }

        ctx.drawImage(
          img,
          sx,
          sy,
          sWidth,
          sHeight,
          0,
          0,
          targetWidth,
          targetHeight
        );
      } else {
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      }

      const mark = (watermark || DEFAULT_WATERMARK).toString().slice(0, 40);
      if (mark) {
        const fontSize = Math.max(14, Math.floor(targetWidth / 40));
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.textBaseline = "bottom";
        ctx.textAlign = "right";
        ctx.fillText(mark, targetWidth - 20, targetHeight - 20);
      }

      setLoaded(true);
    };

    img.onerror = () => {
      if (!aborted) setLoaded(true);
    };

    img.src = src;

    return () => {
      aborted = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [src, watermark, fit, maxDimension]);

  return (
    <div
      className={`relative ${className}`}
      onClick={onClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${rounded ? "rounded-2xl" : ""}`}
        draggable={false}
      />
      {!loaded && (
        <div
          className={`absolute inset-0 bg-black/10 animate-pulse ${
            rounded ? "rounded-2xl" : ""
          }`}
        />
      )}
      <span className="sr-only">{alt}</span>
    </div>
  );
}
