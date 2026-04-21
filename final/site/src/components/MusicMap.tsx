import { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import type { Song } from "@/types/types";
import SidePanel from "@/components/SidePanel";
import LegendPanel from "@/components/Legend";
import { BookmarkIcon } from "@radix-ui/react-icons";
import { getChartConfigs } from "@/utils/chartOptions";
import { useMinimapDrag } from "@/hooks/useMinimapDrag";

type Props = {
  data: Song[];
  colorMode: "cluster" | "genre";
};

export default function MusicMap({ data, colorMode }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isDrawerHovered, setIsDrawerHovered] = useState(false);

  const mainMapRef = useRef<ReactECharts>(null);
  const zoomBoxRef = useRef<HTMLDivElement>(null);
  const minimapAreaRef = useRef<HTMLDivElement>(null);
  const hoverIntentTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { onViewportDragStart, isDraggingViewport } = useMinimapDrag(
    mainMapRef,
    minimapAreaRef,
    zoomBoxRef,
  );

  const activeSong = activeTrackId
    ? data.find((d) => d.track_id === activeTrackId)
    : null;

  useEffect(() => {
    setSelectedGroup(null);
  }, [colorMode]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setShowLegend(!mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const uniqueGroups = Array.from(
    new Set(
      data.map((d) => (colorMode === "cluster" ? d.cluster : d.track_genre)),
    ),
  ).sort((a, b) => {
    if (colorMode === "cluster") {
      return parseInt(String(a), 10) - parseInt(String(b), 10);
    }
    return String(a).localeCompare(String(b));
  });

  const { mainOptions, minimapOptions, colors } = getChartConfigs(
    data,
    colorMode,
    uniqueGroups,
    selectedGroup,
    isMobile,
  );

  const onMainEvents = {
    mouseover: (params: any) => {
      if (isMobile || isDrawerHovered) return;

      if (params.componentType === "series") {
        if (hoverIntentTimeout.current)
          clearTimeout(hoverIntentTimeout.current);
        hoverIntentTimeout.current = setTimeout(() => {
          setActiveTrackId(params.data[7]);
        }, 150);
      }
    },
    mouseout: (params: any) => {
      if (isMobile) return;
      if (params.componentType === "series") {
        if (hoverIntentTimeout.current)
          clearTimeout(hoverIntentTimeout.current);
      }
    },
    click: (params: any) => {
      if (params.componentType === "series") {
        const clickedData = params.data;

        if (isMobile) {
          setActiveTrackId(clickedData[7]);
          setSelectedGroup(null);
        } else {
          const clickedGroupId =
            colorMode === "cluster" ? clickedData[3] : clickedData[6];
          setSelectedGroup((prev) =>
            prev === String(clickedGroupId) ? null : String(clickedGroupId),
          );
        }
      }
    },
    dataZoom: (_params: any, echartsInstance: any) => {
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

  // Zoom to fit the selected group when it changes
  useEffect(() => {
    if (!mainMapRef.current || selectedGroup === null) return;

    const echartsInstance = mainMapRef.current.getEchartsInstance();

    const groupPoints = data.filter((d) =>
      colorMode === "cluster"
        ? String(d.cluster) === selectedGroup
        : String(d.track_genre) === selectedGroup,
    );

    if (groupPoints.length === 0) return;

    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    groupPoints.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const paddingX = (maxX - minX) * 0.1 || 1;
    const paddingY = (maxY - minY) * 0.1 || 1;

    echartsInstance.dispatchAction({
      type: "dataZoom",
      batch: [
        {
          dataZoomId: "zoomX",
          startValue: minX - paddingX,
          endValue: maxX + paddingX,
        },
        {
          dataZoomId: "zoomY",
          startValue: minY - paddingY,
          endValue: maxY + paddingY,
        },
      ],
    });
  }, [selectedGroup, colorMode, data]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {isMobile && (
        <button
          className="absolute top-4 right-4 z-60 bg-gray-1/90 backdrop-blur-md shadow-lg border border-white/10 text-gray-400 hover:text-white transition-colors p-2.5 rounded-full cursor-pointer hover:bg-white/10 outline-none focus-visible:ring-2 focus-visible:ring-blue-8 hover:scale-105"
          aria-label="Toggle Legend"
          onClick={() => setShowLegend((prev) => !prev)}
        >
          <BookmarkIcon className="w-5 h-5" />
        </button>
      )}

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

      {showLegend && (
        <LegendPanel
          uniqueGroups={uniqueGroups}
          colors={colors}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
          colorMode={colorMode}
          onClose={() => setShowLegend(false)}
        />
      )}

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
