export default function Card({ as: Component = "section", children, className = "", ...props }) {
  return (
    <Component className={`rounded-2xl bg-white shadow-card ring-1 ring-forest/10 ${className}`} {...props}>
      {children}
    </Component>
  );
}

