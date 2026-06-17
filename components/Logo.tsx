interface LogoProps {
  size?: number;
  className?: string;
}

/** WinFast mark — gold ascending triangle on a black tile. */
export function Logo({ size = 36, className }: LogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <span
        className="absolute inset-0 rounded-xl blur-md"
        style={{ background: "rgba(214,175,77,0.28)" }}
      />
      <div
        className="relative flex items-center justify-center rounded-xl border"
        style={{
          width: size,
          height: size,
          background: "#000",
          borderColor: "rgba(214,175,77,0.5)",
        }}
      >
        <svg
          width={size * 0.58}
          height={size * 0.58}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="upperGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fbe6a6" />
              <stop offset="0.5" stopColor="#e3b84e" />
              <stop offset="1" stopColor="#b8860b" />
            </linearGradient>
          </defs>
          {/* Ascending triangle */}
          <path
            d="M12 2.5 L21.5 20 L2.5 20 Z"
            fill="url(#upperGold)"
            stroke="#fbe6a6"
            strokeWidth="0.6"
            strokeLinejoin="round"
          />
          {/* Inner facet for depth */}
          <path
            d="M12 8.6 L16.7 17.2 L7.3 17.2 Z"
            fill="#000"
            opacity="0.82"
          />
          <path
            d="M12 11.4 L14.6 16.2 L9.4 16.2 Z"
            fill="url(#upperGold)"
          />
        </svg>
      </div>
    </div>
  );
}
