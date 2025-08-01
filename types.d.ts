import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-counter': {
        id?: string;
        type?: 'total' | 'today' | 'yesterday' | 'week' | 'month';
        style?: 'classic' | 'modern' | 'retro';
        digits?: string;
        scale?: string;
      };
    }
  }
}