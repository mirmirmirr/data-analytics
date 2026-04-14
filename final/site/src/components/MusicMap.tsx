import { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import type { Song } from "@/types/song";

type Props = {
  data: Song[];
  colorMode: "cluster" | "genre";
};

export default function MusicMap({ data, colorMode }: Props) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  /* REFS SETUP FOR SYNCHRONIZATION */
  const mainMapRef = useRef<ReactECharts>(null);
  const zoomBoxRef = useRef<HTMLDivElement>(null);
  const minimapAreaRef = useRef<HTMLDivElement>(null);

  // Refs for viewport dragging math
  const isDraggingViewport = useRef(false);
  const dragStartMouse = useRef({ x: 0, y: 0 });
  const dragStartZoom = useRef({ xStart: 0, xEnd: 0, yStart: 0, yEnd: 0 });

  useEffect(() => {
    setSelectedGroup(null);
  }, [colorMode]);

  const uniqueGroups = Array.from(
    new Set(
      data.map((d) => (colorMode === "cluster" ? d.cluster : d.track_genre)),
    ),
  ).sort();

  const colors = [
    "#FF3B30",
    "#FF9F0A",
    "#FFCC00",
    "#34C759",
    "#00C7BE",
    "#32ADE6",
    "#007AFF",
    "#5856D6",
    "#AF52DE",
    "#FF2D55",
  ];

  const series = uniqueGroups.map((groupId, index) => {
    const groupData = data.filter((d) =>
      colorMode === "cluster"
        ? d.cluster === groupId
        : d.track_genre === groupId,
    );

    const isDimmed =
      selectedGroup !== null && selectedGroup !== String(groupId);
    const activeColor = colors[index % colors.length];

    return {
      type: "scatter",
      id: `group-${index}`,
      name: `${colorMode === "cluster" ? "Cluster" : "Genre"} ${groupId}`,
      data: groupData.map((d) => [
        d.x,
        d.y,
        d.track_name,
        d.cluster,
        d.artists,
        d.album_name,
        d.track_genre,
      ]),
      symbolSize: 10,
      large: true,
      largeThreshold: 2000,
      itemStyle: {
        color: isDimmed ? "#CECECE" : activeColor,
        opacity: isDimmed ? 0.15 : 0.8,
      },
      emphasis: { scale: true, itemStyle: { opacity: 1 } },
    };
  });

  const mainOptions: echarts.EChartsOption = {
    animation: false,
    backgroundColor: "transparent",
    legend: {
      show: true,
      type: "scroll",
      orient: "vertical",
      left: 16,
      top: "middle",
      icon: "circle",
      textStyle: { color: "#4B5563", fontSize: 12, fontWeight: 500 },
    },
    tooltip: {
      trigger: "item",
      backgroundColor: "transparent",
      borderColor: "transparent",
      borderWidth: 0,
      padding: 0,
      extraCssText:
        "box-shadow: none; border: none; pointer-events: none; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 12px;",
      formatter: (params: any) => {
        const item = params.data;
        return `
           <div class="flex flex-col gap-1.5 p-3 bg-white rounded-xl shadow-2xl border border-gray-300" style="pointer-events: auto;">
            <h3 class="text-sm font-semibold text-gray-900 tracking-tight leading-none">
              ${item[2]}
            </h3>
            <p class="text-xs text-gray-600 font-medium leading-none">
              ${item[4].split(";").join(", ")}
            </p>
            <div class="flex flex-row items-start gap-1">
              <div class="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-black/5 w-fit">
          <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Cluster ${item[3]}
          </span>
              </div>
              <div class="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-black/5 w-fit">
          <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            ${item[6]}
          </span>
              </div>
            </div>
          </div>
        `;
      },
    },
    xAxis: { type: "value", show: false, scale: true },
    yAxis: { type: "value", show: false, scale: true },
    grid: { top: 0, left: 140, right: 0, bottom: 0 },
    dataZoom: [
      {
        id: "zoomX",
        type: "inside",
        xAxisIndex: 0,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        filterMode: "none",
      },
      {
        id: "zoomY",
        type: "inside",
        yAxisIndex: 0,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        filterMode: "none",
      },
    ],
    series: series,
  };

  const minimapOptions: echarts.EChartsOption = {
    animation: false,
    xAxis: { type: "value", show: false, scale: true },
    yAxis: { type: "value", show: false, scale: true },
    grid: { top: 0, left: 0, right: 0, bottom: 0 },
    series: series.map((s) => ({
      ...s,
      symbolSize: 2,
      itemStyle: { ...s.itemStyle, opacity: 0.4 },
      emphasis: { disabled: true },
    })),
  };

  const onMainEvents = {
    click: (params: any) => {
      if (params.componentType === "series") {
        const clickedData = params.data;
        const clickedGroupId =
          colorMode === "cluster" ? clickedData[3] : clickedData[6];
        setSelectedGroup((prev) =>
          prev === String(clickedGroupId) ? null : String(clickedGroupId),
        );
      }
    },
    // Direction 1: Main Map updates the Box
    dataZoom: (params: any, echartsInstance: any) => {
      if (isDraggingViewport.current) return;

      const dz = echartsInstance.getOption().dataZoom;
      if (dz && dz.length >= 2 && zoomBoxRef.current) {
        zoomBoxRef.current.style.left = `${dz[0].start}%`;
        zoomBoxRef.current.style.width = `${dz[0].end - dz[0].start}%`;
        zoomBoxRef.current.style.bottom = `${dz[1].start}%`;
        zoomBoxRef.current.style.height = `${dz[1].end - dz[1].start}%`;
      }
    },
  };

  const handleMainChartReady = (echartsInstance: any) => {
    echartsInstance.setOption({
      dataZoom: [
        { start: 30, end: 50 },
        { start: 30, end: 50 },
      ],
    });

    if (zoomBoxRef.current) {
      zoomBoxRef.current.style.left = "30%";
      zoomBoxRef.current.style.width = "20%";
      zoomBoxRef.current.style.bottom = "30%";
      zoomBoxRef.current.style.height = "20%";
    }

    echartsInstance.getZr().on("click", (event: any) => {
      if (!event.target) setSelectedGroup(null);
    });
  };

  const onViewportDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!mainMapRef.current || !minimapAreaRef.current) return;

    isDraggingViewport.current = true;

    // Save starting mouse position
    dragStartMouse.current = { x: e.clientX, y: e.clientY };

    // Get exact current zoom bounds from the main ECharts instance
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

    // Calculate how many pixels the mouse moved
    const deltaX = e.clientX - dragStartMouse.current.x;
    const deltaY = e.clientY - dragStartMouse.current.y;

    // Convert pixels to percentages based on the minimap's width/height
    const minimapWidth = minimapAreaRef.current.clientWidth;
    const minimapHeight = minimapAreaRef.current.clientHeight;

    const percentDeltaX = (deltaX / minimapWidth) * 100;

    // ECharts Y-axis is inverted (0 is bottom, 100 is top), so we invert deltaY
    const percentDeltaY = -(deltaY / minimapHeight) * 100;

    const startZoom = dragStartZoom.current;

    // Calculate new bounds
    let newXStart = startZoom.xStart + percentDeltaX;
    let newXEnd = startZoom.xEnd + percentDeltaX;
    let newYStart = startZoom.yStart + percentDeltaY;
    let newYEnd = startZoom.yEnd + percentDeltaY;

    // Clamp values so you can't drag the box off the edge of the minimap
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

    // Update the visual box immediately for 0-lag feedback
    if (zoomBoxRef.current) {
      zoomBoxRef.current.style.left = `${newXStart}%`;
      zoomBoxRef.current.style.bottom = `${newYStart}%`;
    }

    // Tell the main map to pan to these new coordinates!
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

  return (
    <div className="relative w-full h-full overflow-hidden">
      <ReactECharts
        ref={mainMapRef}
        option={mainOptions}
        onEvents={onMainEvents}
        onChartReady={handleMainChartReady}
        style={{ height: "100%", width: "100%" }}
      />

      <div className="absolute bottom-6 right-6 w-56 h-48 bg-white/80 backdrop-blur-md rounded-xl border border-gray-200 shadow-xl z-10 hidden sm:block p-2">
        <div ref={minimapAreaRef} className="relative w-full h-full">
          <div className="absolute inset-0 pointer-events-none">
            <ReactECharts
              option={minimapOptions}
              style={{ height: "100%", width: "100%" }}
            />
          </div>

          <div
            ref={zoomBoxRef}
            onMouseDown={onViewportDragStart}
            className="absolute border-[1.5px] border-indigo-600 bg-indigo-500/20 rounded cursor-grab active:cursor-grabbing hover:bg-indigo-500/30 transition-colors pointer-events-auto"
          />
        </div>
      </div>
    </div>
  );
}
