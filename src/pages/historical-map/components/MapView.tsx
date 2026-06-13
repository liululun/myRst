import { useEffect, useRef } from "react";
import "ol/ol.css";
import OLMap from "ol/Map";
import View from "ol/View";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Fill, Stroke } from "ol/style";
import { buildGridGeoJSON } from "../data/grid";
import { COLS, ROWS } from "../data/scenario";
import { getCellColor, type DelayGrid } from "../utils/animation";

interface MapViewProps {
  progress: number;
  delays: DelayGrid[];
}

const styleCache = new Map<string, Style>();

function styleForColor(color: string): Style {
  // 量化颜色，避免每帧创建大量样式对象
  const quantized = color
    .match(/[0-9a-f]{2}/g)!
    .map((h) => Math.round(parseInt(h, 16) / 4) * 4)
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
  let style = styleCache.get(quantized);
  if (!style) {
    style = new Style({
      fill: new Fill({ color: `#${quantized}` }),
      stroke: new Stroke({ color: "#ffffff", width: 1 }),
    });
    styleCache.set(quantized, style);
    if (styleCache.size > 4096) styleCache.clear();
  }
  return style;
}

export default function MapView({ progress, delays }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<VectorSource | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const source = new VectorSource({
      features: new GeoJSON().readFeatures(buildGridGeoJSON()),
    });
    sourceRef.current = source;

    const layer = new VectorLayer({
      source,
      style: (feature) => styleForColor((feature.get("color") as string | undefined) ?? "#cccccc"),
    });

    const map = new OLMap({
      target: containerRef.current,
      layers: [layer],
      view: new View({ center: [COLS / 2, ROWS / 2], zoom: 2 }),
      controls: [],
    });

    map.getView().fit([0, 0, COLS, ROWS], { padding: [20, 20, 20, 20] });

    return () => {
      map.setTarget(undefined);
      sourceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const source = sourceRef.current;
    if (!source) return;
    for (const feature of source.getFeatures()) {
      const col = feature.get("col") as number;
      const row = feature.get("row") as number;
      feature.set("color", getCellColor(col, row, progress, delays), true);
    }
    source.changed();
  }, [progress, delays]);

  return <div ref={containerRef} className="map-view" />;
}
