import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import ReactECharts from "echarts-for-react";

export function useMinimapDrag(
  mainMapRef: RefObject<ReactECharts | null>,
  minimapAreaRef: RefObject<HTMLDivElement | null>,
  zoomBoxRef: RefObject<HTMLDivElement | null>,
) {
  const isDraggingViewport = useRef(false);
  const dragStartMouse = useRef({ x: 0, y: 0 });
  const dragStartZoom = useRef({ xStart: 0, xEnd: 0, yStart: 0, yEnd: 0 });

  const onViewportDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!mainMapRef.current || !minimapAreaRef.current) return;

    isDraggingViewport.current = true;
    dragStartMouse.current = { x: e.clientX, y: e.clientY };

    const echartsInstance = mainMapRef.current.getEchartsInstance();
    const dz = echartsInstance.getOption().dataZoom as any[];
    dragStartZoom.current = {
      xStart: dz[0].start,
      xEnd: dz[0].end,
      yStart: dz[1].start,
      yEnd: dz[1].end,
    };

    window.addEventListener("mousemove", onViewportDragMove);
    window.addEventListener("mouseup", onViewportDragEnd);
  };

  const onViewportDragMove = (e: MouseEvent) => {
    if (
      !isDraggingViewport.current ||
      !mainMapRef.current ||
      !minimapAreaRef.current
    )
      return;

    const deltaX = e.clientX - dragStartMouse.current.x;
    const deltaY = e.clientY - dragStartMouse.current.y;
    const minimapWidth = minimapAreaRef.current.clientWidth;
    const minimapHeight = minimapAreaRef.current.clientHeight;

    const percentDeltaX = (deltaX / minimapWidth) * 100;
    const percentDeltaY = -(deltaY / minimapHeight) * 100;

    const startZoom = dragStartZoom.current;

    let newXStart = startZoom.xStart + percentDeltaX;
    let newXEnd = startZoom.xEnd + percentDeltaX;
    let newYStart = startZoom.yStart + percentDeltaY;
    let newYEnd = startZoom.yEnd + percentDeltaY;

    const xRange = startZoom.xEnd - startZoom.xStart;
    if (newXStart < 0) {
      newXStart = 0;
      newXEnd = xRange;
    }
    if (newXEnd > 100) {
      newXEnd = 100;
      newXStart = 100 - xRange;
    }

    const yRange = startZoom.yEnd - startZoom.yStart;
    if (newYStart < 0) {
      newYStart = 0;
      newYEnd = yRange;
    }
    if (newYEnd > 100) {
      newYEnd = 100;
      newYStart = 100 - yRange;
    }

    if (zoomBoxRef.current) {
      zoomBoxRef.current.style.left = `${newXStart}%`;
      zoomBoxRef.current.style.bottom = `${newYStart}%`;
    }

    mainMapRef.current.getEchartsInstance().dispatchAction({
      type: "dataZoom",
      batch: [
        { dataZoomId: "zoomX", start: newXStart, end: newXEnd },
        { dataZoomId: "zoomY", start: newYStart, end: newYEnd },
      ],
    });
  };

  const onViewportDragEnd = () => {
    isDraggingViewport.current = false;
    window.removeEventListener("mousemove", onViewportDragMove);
    window.removeEventListener("mouseup", onViewportDragEnd);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", onViewportDragMove);
      window.removeEventListener("mouseup", onViewportDragEnd);
    };
  }, []);

  return { onViewportDragStart, isDraggingViewport };
}
