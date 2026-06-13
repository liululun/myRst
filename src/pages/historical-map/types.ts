export interface CountryDef {
  id: string;
  name: string;
  color: string;
}

export interface TimelineEvent {
  year: number;
  description: string;
}

export interface GridCell {
  col: number;
  row: number;
}
