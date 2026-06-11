interface Props {
  generatedAt: string;
}

export default function Header({ generatedAt }: Props) {
  return (
    <header>
      <h1>跑步数据分析报告</h1>
      <p>
        生成时间：{generatedAt} ｜ 数据来源：Neon 数据库 health_workouts ＋ 导出 XML
        跑步时段心率/距离/消耗明细
      </p>
    </header>
  );
}
