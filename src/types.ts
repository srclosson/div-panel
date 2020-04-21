import { PanelProps } from '@grafana/data';

export interface DivPanelOptions {
  command: string;
  content: string;
}

export interface DivPanelProps extends PanelProps<DivPanelOptions> {}
