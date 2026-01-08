export interface ThemeTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    warning: string;
    success: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
  };
  radii: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Apple-inspirierte Design-Tokens
export interface AppleDesignTokens {
  typography: {
    fontFamily: {
      system: string;
      mono: string;
    };
    fontSize: {
      largeTitle: string;
      title1: string;
      title2: string;
      title3: string;
      headline: string;
      body: string;
      callout: string;
      subheadline: string;
      footnote: string;
      caption1: string;
      caption2: string;
    };
    fontWeight: {
      ultraLight: number;
      thin: number;
      light: number;
      regular: number;
      medium: number;
      semibold: number;
      bold: number;
      heavy: number;
      black: number;
    };
  };
  colors: {
    systemBlue: string;
    systemGreen: string;
    systemIndigo: string;
    systemOrange: string;
    systemPink: string;
    systemPurple: string;
    systemRed: string;
    systemTeal: string;
    systemYellow: string;
    label: string;
    labelSecondary: string;
    labelTertiary: string;
    labelQuaternary: string;
    fillPrimary: string;
    fillSecondary: string;
    fillTertiary: string;
    fillQuaternary: string;
    separator: string;
    separatorOpaque: string;
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
  };
  glassmorphism: {
    background: string;
    backdropBlur: string;
    border: string;
  };
  animation: {
    timing: {
      easeInOut: string;
      easeOut: string;
      easeIn: string;
      spring: string;
    };
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  radii: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export const defaultThemeTokens: ThemeTokens = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  radii: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
};

export const appleDesignTokens: AppleDesignTokens = {
  typography: {
    fontFamily: {
      system:
        "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', sans-serif",
      mono: "'SF Mono', 'Monaco', 'Menlo', monospace",
    },
    fontSize: {
      largeTitle: '34px',
      title1: '28px',
      title2: '22px',
      title3: '20px',
      headline: '17px',
      body: '17px',
      callout: '16px',
      subheadline: '15px',
      footnote: '13px',
      caption1: '12px',
      caption2: '11px',
    },
    fontWeight: {
      ultraLight: 100,
      thin: 200,
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      heavy: 800,
      black: 900,
    },
  },
  colors: {
    systemBlue: '#0a84ff',
    systemGreen: '#30d158',
    systemIndigo: '#5e5ce6',
    systemOrange: '#ff9f0a',
    systemPink: '#ff375f',
    systemPurple: '#bf5af2',
    systemRed: '#ff453a',
    systemTeal: '#40c8e0',
    systemYellow: '#ffd60a',
    label: 'rgba(255, 255, 255, 0.9)',
    labelSecondary: 'rgba(255, 255, 255, 0.6)',
    labelTertiary: 'rgba(255, 255, 255, 0.4)',
    labelQuaternary: 'rgba(255, 255, 255, 0.18)',
    fillPrimary: 'rgba(120, 120, 128, 0.36)',
    fillSecondary: 'rgba(120, 120, 128, 0.32)',
    fillTertiary: 'rgba(120, 120, 128, 0.24)',
    fillQuaternary: 'rgba(120, 120, 128, 0.18)',
    separator: 'rgba(84, 84, 88, 0.65)',
    separatorOpaque: 'rgb(84, 84, 88)',
    background: '#000000',
    backgroundSecondary: '#1c1c1e',
    backgroundTertiary: '#2c2c2e',
  },
  glassmorphism: {
    background: 'rgba(28, 28, 30, 0.8)',
    backdropBlur: 'blur(20px)',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  animation: {
    timing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '40px',
    '3xl': '48px',
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.15)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
  },
};
