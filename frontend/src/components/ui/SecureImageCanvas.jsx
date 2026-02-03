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
}) {
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let aborted = false;
    const controller = new AbortController();

    const draw = async () => {
      try {
        if (!src || !canvasRef.current) return;

        setLoaded(false);

        const res = await fetch(src, {
          mode: "cors",
          cache: "no-store",
          signal: controller.signal,
        });
        const blob = await res.blob();
        const imgUrl = URL.createObjectURL(blob);

        const img = new Image();
        img.onload = () => {
          if (aborted || !canvasRef.current) return;

          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");

          const maxW = img.naturalWidth || img.width;
          const maxH = img.naturalHeight || img.height;

          canvas.width = maxW;
          canvas.height = maxH;

          if (fit === "cover") {
            const canvasRatio = canvas.width / canvas.height;
            const imgRatio = img.width / img.height;
            let sx = 0;
            let sy = 0;
            let sWidth = img.width;
            let sHeight = img.height;

            if (imgRatio > canvasRatio) {
              sWidth = img.height * canvasRatio;
              sx = (img.width - sWidth) / 2;
            } else {
              sHeight = img.width / canvasRatio;
              sy = (img.height - sHeight) / 2;
            }

            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
          } else {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }

          const mark = (watermark || DEFAULT_WATERMARK).toString().slice(0, 40);
          if (mark) {
            const fontSize = Math.max(18, Math.floor(canvas.width / 40));
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.fillStyle = "rgba(255,255,255,0.35)";
            ctx.textBaseline = "bottom";
            ctx.textAlign = "right";
            ctx.fillText(mark, canvas.width - 20, canvas.height - 20);
          }

          URL.revokeObjectURL(imgUrl);
          setLoaded(true);
        };

        img.src = imgUrl;
      } catch {
        // ignore
      }
    };

    draw();

    return () => {
      aborted = true;
      controller.abort();
    };
  }, [src, watermark, fit]);

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
        <div className="absolute inset-0 bg-black/10 animate-pulse rounded-2xl" />
      )}
      <span className="sr-only">{alt}</span>
    </div>
  );
}
