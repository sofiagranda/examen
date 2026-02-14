import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Users,
} from "lucide-react";

import { getReservations } from "../api/reservations.api";
import { getShows } from "../api/shows.api";


export default function HomePage() {
  const [stats, setStats] = useState({
    shows: 0,
    reservations: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [showRes, reservaRes]: any[] = await Promise.all([
          getShows(),
          getReservations(),
        ]);

        const getCount = (res: any) => {
          if (!res) return 0;
          // 1. Si viene en .count (Paginación DRF)
          if (res.count !== undefined) return res.count;
          // 2. Si viene en .results (Array dentro de objeto)
          if (res.results && Array.isArray(res.results)) return res.results.length;
          // 3. Si es un array directo
          if (Array.isArray(res)) return res.length;
          console.log(res.results.length)
          return 0;
        };

        setStats({
          shows: getCount(showRes),
          reservations: getCount(reservaRes),
        });
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
        console.error();
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { title: "Shows", value: stats.shows, icon: Package, color: "text-cyan-400" },
    { title: "Reservations", value: stats.reservations, icon: Users, color: "text-emerald-400" },
  ];

  return (
    <div className="min-h-screen p-10 bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      {/* HERO */}
      <motion.section
        className="relative overflow-hidden rounded-[2.5rem] mb-24 border border-white/5"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative z-10 p-20">
          <motion.h1
            className="text-6xl font-extrabold mb-6"
            initial={{ letterSpacing: "0.1em" }}
            animate={{ letterSpacing: "0.02em" }}
          >
            Sistema Básico de Gestión de Reservas y Operaciones para un
            Cine
          </motion.h1>
        </div>
      </motion.section>

      {/* STATS REALES */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            className="relative bg-slate-900/80 border border-slate-800 rounded-3xl p-10 shadow-2xl backdrop-blur-xl group"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5, borderColor: "rgba(6, 182, 212, 0.5)" }}
          >
            <card.icon size={46} className={`mb-6 ${card.color} group-hover:scale-110 transition-transform`} />
            <h3 className="text-lg text-slate-500 font-medium uppercase tracking-widest">{card.title}</h3>
            <p className="text-6xl font-black mt-2 tracking-tighter">
              {card.value < 10 ? `0${card.value}` : card.value}
            </p>
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-transparent to-cyan-500 transition-all duration-500 group-hover:w-full" />
          </motion.div>
        ))}
      </section>

    </div>
  );
}