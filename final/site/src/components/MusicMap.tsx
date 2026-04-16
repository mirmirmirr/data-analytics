import { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import type { Song } from "@/types/types";
import SidePanel from "@/components/SidePanel";
import LegendPanel from "@/components/Legend";

type Props = {
  data: Song[];
  colorMode: "cluster" | "genre";
};

export default function MusicMap({ data, colorMode }: Props) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isDrawerHovered, setIsDrawerHovered] = useState(false);

  const mainMapRef = useRef<ReactECharts>(null);
  const zoomBoxRef = useRef<HTMLDivElement>(null);
  const minimapAreaRef = useRef<HTMLDivElement>(null);
  const hoverIntentTimeout = useRef<NodeJS.Timeout | null>(null);

  const isDraggingViewport = useRef(false);
  const dragStartMouse = useRef({ x: 0, y: 0 });
  const dragStartZoom = useRef({ xStart: 0, xEnd: 0, yStart: 0, yEnd: 0 });

  const activeSong = activeTrackId
    ? data.find((d) => d.track_id === activeTrackId)
    : null;

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
        d.track_id,
      ]),
      symbolSize: 10,
      large: true,
      largeThreshold: 2000,
      itemStyle: {
        color: isDimmed ? "#313131" : activeColor,
        opacity: isDimmed ? 0.15 : 0.7,
      },
      emphasis: {
        scale: true,
        // focus: "self",
        itemStyle: {
          opacity: 1,
          borderColor: activeColor,
          borderWidth: 14,
          shadowBlur: 12,
          shadowColor: "rgba(0, 0, 0, 0.4)",
        },
      },
    };
  });

  const mainOptions: echarts.EChartsOption = {
    animation: false,
    backgroundColor: "transparent",
    xAxis: { type: "value", show: false, scale: true },
    yAxis: { type: "value", show: false, scale: true },
    grid: { top: 0, left: 200, right: 360, bottom: 0 },
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
    mouseover: (params: any) => {
      if (isDrawerHovered) return;
      if (params.componentType === "series") {
        if (hoverIntentTimeout.current)
          clearTimeout(hoverIntentTimeout.current);
        hoverIntentTimeout.current = setTimeout(() => {
          setActiveTrackId(params.data[7]);
        }, 150);
      }
    },
    mouseout: (params: any) => {
      if (params.componentType === "series") {
        if (hoverIntentTimeout.current)
          clearTimeout(hoverIntentTimeout.current);
      }
    },
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
        { start: 50, end: 30 },
        { start: 50, end: 30 },
      ],
    });
    if (zoomBoxRef.current) {
      zoomBoxRef.current.style.left = "30%";
      zoomBoxRef.current.style.width = "20%";
      zoomBoxRef.current.style.bottom = "30%";
      zoomBoxRef.current.style.height = "20%";
    }
    echartsInstance.getZr().on("click", (event: any) => {
      if (!event.target) {
        setSelectedGroup(null);
        setActiveTrackId(null);
      }
    });
  };

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

  return (
    <div className="relative w-full h-full overflow-hidden">
      <ReactECharts
        ref={mainMapRef}
        option={mainOptions}
        onEvents={onMainEvents}
        onChartReady={handleMainChartReady}
        style={{ height: "100%", width: "100%" }}
      />

      <div className="absolute bottom-6 left-6 w-40 h-40 bg-gray-1/90 backdrop-blur-md rounded-xl border border-gray-track shadow-xl z-10 hidden sm:block p-2">
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
            className="absolute border-[1.5px] border-white bg-gray-10/30 rounded-lg cursor-grab active:cursor-grabbing hover:bg-blue-10/30 transition-colors pointer-events-auto"
          />
        </div>
      </div>

      <LegendPanel
        uniqueGroups={uniqueGroups}
        colors={colors}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        colorMode={colorMode}
      />

      <SidePanel
        type={colorMode}
        selectedGroup={selectedGroup}
        activeTrackId={activeTrackId}
        activeSong={activeSong}
        onMouseEnter={() => setIsDrawerHovered(true)}
        onMouseLeave={() => setIsDrawerHovered(false)}
      />
    </div>
  );
}
