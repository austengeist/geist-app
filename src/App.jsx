function Card({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function Button({ className = "", children, disabled, ...props }) {
  return (
    <button
      className={`${className} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
