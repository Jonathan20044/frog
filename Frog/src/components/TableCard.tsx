import { Utensils, Users } from "lucide-react";

interface TableCardProps {
  table: {
    id: number;
    name: string;
    status: "disponible" | "ocupada" | "por-pagar";
    capacity?: number;
  };
  onClick: () => void;
}

const statusConfig = {
  disponible: {
    bg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    text: "Disponible",
    textColor: "text-emerald-100",
    icon: "text-white",
    border: "border-emerald-400",
    hover: "hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl hover:scale-105",
    dot: "bg-emerald-400",
  },
  ocupada: {
    bg: "bg-gradient-to-br from-amber-500 to-amber-600",
    text: "Ocupada",
    textColor: "text-amber-100",
    icon: "text-white",
    border: "border-amber-400",
    hover: "hover:from-amber-600 hover:to-amber-700 hover:shadow-xl hover:scale-105",
    dot: "bg-amber-400",
  },
  "por-pagar": {
    bg: "bg-gradient-to-br from-rose-500 to-rose-600",
    text: "Por Pagar",
    textColor: "text-rose-100",
    icon: "text-white",
    border: "border-rose-400",
    hover: "hover:from-rose-600 hover:to-rose-700 hover:shadow-xl hover:scale-105",
    dot: "bg-rose-400",
  },
};

export function TableCard({ table, onClick }: TableCardProps) {
  const config = statusConfig[table.status];

  return (
    <button
      onClick={onClick}
      className={`${config.bg} ${config.hover} rounded-2xl p-6 shadow-lg transition-all duration-300 cursor-pointer border-2 ${config.border} border-opacity-50 relative overflow-hidden group`}
    >
      {/* Ondas sutiles de fondo */}
      <div className="absolute inset-0 opacity-[0.08]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`waves-${table.id}`} x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0 50 Q 25 30, 50 50 T 100 50" fill="none" stroke="white" strokeWidth="2"/>
              <path d="M0 70 Q 25 50, 50 70 T 100 70" fill="none" stroke="white" strokeWidth="1.5"/>
              <path d="M0 30 Q 25 10, 50 30 T 100 30" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#waves-${table.id})`}/>
        </svg>
      </div>

      {/* Círculos decorativos suaves */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

      {/* Destellos diagonales */}
      <div className="absolute top-0 left-0 right-0 bottom-0 opacity-[0.07]">
        <div className="absolute top-1/4 -left-10 w-40 h-0.5 bg-white rotate-45 blur-sm"></div>
        <div className="absolute top-1/2 right-0 w-32 h-0.5 bg-white -rotate-45 blur-sm"></div>
        <div className="absolute bottom-1/4 left-1/4 w-24 h-0.5 bg-white rotate-45 blur-sm"></div>
      </div>

      {/* Textura sutil de ruido */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }}></div>

      {/* Efecto de brillo hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
        {/* Icono */}
        <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg border-2 border-white/40">
          <Utensils className={`w-8 h-8 ${config.icon}`} />
        </div>

        {/* Nombre de la mesa */}
        <h3 className="text-white text-xl font-bold tracking-wide">{table.name}</h3>

        {/* Estado */}
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30">
          <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse shadow-sm`}></div>
          <span className={`text-sm font-semibold text-white`}>
            {config.text}
          </span>
        </div>

        {/* Capacidad */}
        {table.capacity && (
          <div className="flex items-center gap-1.5 text-white/90 text-sm bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
            <Users className="w-3.5 h-3.5" />
            <span className="font-medium">{table.capacity} personas</span>
          </div>
        )}
      </div>

      {/* Indicador de click */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/40 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
    </button>
  );
}
