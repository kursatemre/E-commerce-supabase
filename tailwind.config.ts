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
        // Lüks Kontrast ve Derinlik Renk Paleti
        brand: {
          dark: "#1D2A3B", // Ana Renk (Marka Otoritesi - Daha sık kullanılacak)
          DEFAULT: "#1D2A3B",
        },
        action: {
          DEFAULT: "#DA5B40", // Daha Canlı Aksiyon Rengi (Koyu Somon/Kızıl)
          hover: "#C24F35",
        },
        surface: {
          white: "#FFFFFF",
          cream: "#FBFBFB", // Hafif Krem - Derinlik için
          light: "#F0F0F0", // Açık Gri Alanlar - Bölüm ayırma için
        },
        overlay: {
          dark: "rgba(0, 0, 0, 0.5)", // Opak Siyah - Görseller üzerine metin için
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
        // Desktop - Artırılmış letter-spacing ile lüks his
        "h1": ["36px", { lineHeight: "1.2", fontWeight: "600", letterSpacing: "0.02em" }],
        "h2": ["24px", { lineHeight: "1.3", fontWeight: "600", letterSpacing: "0.01em" }],
        "h3": ["20px", { lineHeight: "1.4", fontWeight: "600", letterSpacing: "0.01em" }],
        "body": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        // Mobile
        "h1-mobile": ["28px", { lineHeight: "1.2", fontWeight: "600", letterSpacing: "0.02em" }],
        "h2-mobile": ["20px", { lineHeight: "1.3", fontWeight: "600", letterSpacing: "0.01em" }],
        "body-mobile": ["14px", { lineHeight: "1.6", fontWeight: "400" }],
      },
      letterSpacing: {
        luxury: "0.02em", // Lüks başlıklar için
      },
      borderRadius: {
        button: "6px", // CTA Buton border-radius
      },
      boxShadow: {
        button: "0 2px 8px rgba(0, 0, 0, 0.1)",
        "button-hover": "0 4px 12px rgba(232, 106, 83, 0.25)",
        // Lüks Derinlik - Yeni aksiyon rengi için gölge
        "button-depth": "0 4px 6px rgba(218, 91, 64, 0.4)",
        "button-depth-hover": "0 6px 10px rgba(218, 91, 64, 0.5)",
      },
      animation: {
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-in",
        "cart-pulse": "cartPulse 0.5s ease-in-out",
        "cart-flash": "cartFlash 0.6s ease-in-out", // Sepete ekleme geri bildirimi
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
        cartFlash: {
          "0%, 100%": {
            backgroundColor: "transparent",
            transform: "scale(1)",
          },
          "50%": {
            backgroundColor: "#DA5B40",
            transform: "scale(1.15)",
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
