interface Props {
  years: string[];
  value: string;
  onChange: (year: string) => void;
}

export default function YearFilter({ years, value, onChange }: Props) {
  return (
    <div className="year-bar">
      <label htmlFor="yearFilter">📅 选择年份：</label>
      <select id="yearFilter" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="all">全部年份</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y} 年
          </option>
        ))}
      </select>
      <span className="hint">影响下方全部统计图表与明细表</span>
    </div>
  );
}
