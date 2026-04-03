export default function Tag({ children, glow = false }) {
  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-mono rounded-full border transition-all duration-300 ${
        glow
          ? 'border-accent/40 text-accent/80 shadow-[0_0_8px_rgba(59,130,246,0.12)]'
          : 'border-border text-mono'
      }`}
    >
      {children}
    </span>
  )
}
