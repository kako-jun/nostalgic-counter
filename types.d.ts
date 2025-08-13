import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-counter': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        type?: 'total' | 'today' | 'yesterday' | 'week' | 'month';
        theme?: 'classic' | 'modern' | 'retro';
        digits?: string;
        scale?: string;
      };
      'nostalgic-like': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        theme?: 'classic' | 'modern' | 'retro';
      };
      'nostalgic-ranking': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        max?: string;
        theme?: 'classic' | 'modern' | 'retro';
      };
      'nostalgic-bbs': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        max?: string;
        theme?: 'classic' | 'modern' | 'retro';
      };
    }
  }
}