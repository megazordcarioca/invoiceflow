declare module "@react-pdf/renderer" {
  import { ReactNode } from "react";

  export function Document(props: { children: ReactNode }): React.ReactElement;
  export function Page(props: {
    size?: string;
    style?: React.CSSProperties;
    children: ReactNode;
  }): React.ReactElement;
  export function Text(props: {
    style?: React.CSSProperties;
    children: ReactNode;
  }): React.ReactElement;
  export function View(props: {
    style?: React.CSSProperties;
    children: ReactNode;
  }): React.ReactElement;
  export const StyleSheet: {
    create(styles: Record<string, React.CSSProperties>): Record<string, React.CSSProperties>;
  };
  export function renderToBuffer(element: React.ReactElement): Promise<Buffer>;
}
