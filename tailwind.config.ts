import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sakin Çekicilik Renk Paleti
        brand: {
          dark: "#1D2A3B", // Ana Renk (Marka Otoritesi)
          DEFAULT: "#1D2A3B",
        },
        action: {
          DEFAULT: "#E86A53", // Aksiyon Rengi (Dönüşüm Odaklı)
          hover: "#D65A43",
        },
        surface: {
          white: "#FFFFFF",
          light: "#F9F9F9", // Çok Açık Bej
        },
        error: "#CC0000",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"], // Başlıklar
        body: ["Inter", "sans-serif"], // Gövde Metni
      },
      fontSize: {
        // Desktop
        "h1": ["36px", { lineHeight: "1.2", fontWeight: "600" }],
        "h2": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "h3": ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        "body": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        // Mobile
        "h1-mobile": ["28px", { lineHeight: "1.2", fontWeight: "600" }],
        "h2-mobile": ["20px", { lineHeight: "1.3", fontWeight: "600" }],
        "body-mobile": ["14px", { lineHeight: "1.6", fontWeight: "400" }],
      },
      borderRadius: {
        button: "6px", // CTA Buton border-radius
      },
      boxShadow: {
        button: "0 2px 8px rgba(0, 0, 0, 0.1)",
        "button-hover": "0 4px 12px rgba(232, 106, 83, 0.25)",
      },
      animation: {
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-in",
        "cart-pulse": "cartPulse 0.5s ease-in-out",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        cartPulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
