import { COLS, ROWS } from "./scenario";

/**
 * 生成网格矢量面要素的 GeoJSON。
 *
 * 这里用规则网格模拟"矢量地图"，每个格子是一个独立的多边形要素，
 * 自带 col/row 属性。真实项目中，可以把这个函数替换为：
 *   - 读取本地 GeoJSON / Shapefile（转换后）文件，按行政区/国界划分要素；
 *   - 或调用后端接口从 PostGIS 中按表名查询并返回 GeoJSON。
 * 后续的着色与动画逻辑只依赖要素的几何形状和一个唯一 id，
 * 不依赖网格这种特定的数据组织方式。
 */
export function buildGridGeoJSON() {
  const features = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x0 = col;
      const x1 = col + 1;
      // y 轴翻转，使 row 0 显示在地图顶部
      const y1 = ROWS - row;
      const y0 = ROWS - row - 1;
      features.push({
        type: "Feature",
        properties: { id: `${col}_${row}`, col, row },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [x0, y0],
              [x1, y0],
              [x1, y1],
              [x0, y1],
              [x0, y0],
            ],
          ],
        },
      });
    }
  }
  return {
    type: "FeatureCollection",
    features,
  };
}
