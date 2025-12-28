"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  ArrowRight,
  Utensils,
  ScrollText,
  Backpack,
  Map,
  CheckCircle2,
  Circle,
  Navigation,
  Sparkles,
  Thermometer,
  Calendar,
  Bot,
  Sun,
  Landmark,
} from "lucide-react";

import { Mood, MOOD_THEMES } from "@/lib/mood";
import {
  SMOOTH_EASE,
  VIEWPORT_CONFIG,
  containerVariants,
  itemVariants,
  scaleUpVariants,
} from "@/lib/animation";
import Navbar from "@/components/landing-page/Navbar";
import Marquee from "@/components/shared/Marqee";
import Footer from "@/components/landing-page/Footer";

const AUTHENTIC_IMAGES = [
  {
    src: "/images/juju-dhau.jpg",
    alt: "Juju Dhau (King Curd) from Bhaktapur",
  },
  {
    src: "/images/momo.jpg",
    alt: "Nepali momos and traditional food",
  },
];

export default function Page() {
  const [mood, setMood] = useState<Mood>("calm");
  const [isMounted, setIsMounted] = useState(false);

  const [authenticIndex, setAuthenticIndex] = useState(0);

useEffect(() => {
  setTimeout(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("userMood") as Mood | null;
    if (saved && MOOD_THEMES[saved]) setMood(saved);
  }, 0);
}, []);


  useEffect(() => {
    const interval = setInterval(() => {
      setAuthenticIndex((prev) => (prev + 1) % AUTHENTIC_IMAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const changeMood = (newMood: Mood) => {
    setMood(newMood);
    localStorage.setItem("userMood", newMood);
  };

  const theme = MOOD_THEMES[mood];

  if (!isMounted) return null;

  return (
    <div
      className={`min-h-screen ${theme.pageBg} transition-colors duration-700 antialiased font-sans selection:${theme.accentBg} selection:text-white`}
    >
      <Navbar
        mood={mood}
        theme={theme}
        onChangeMood={changeMood}
      />

      <main className="pt-22 md:pt-24">
        {/* HERO SECTION */}
        <section className="relative px-6 md:px-8 pb-12 overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="order-1 flex flex-col justify-center"
            >
              <motion.div
                variants={itemVariants}
                className={`inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-white border ${theme.border} shadow-sm mb-6`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full animate-pulse ${theme.accentBg}`}
                />
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
                  AI-Powered Nepal Travel
                </span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className={`text-5xl sm:text-6xl lg:text-[4.2rem] font-bold tracking-tight mb-6 leading-[1.1] ${theme.heading}`}
              >
                Experience Nepal, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">
                  beyond the weather.
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className={`text-lg leading-relaxed mb-8 max-w-lg ${theme.mutedText}`}
              >
                Don&apos;t just check the temperature. Ask our AI to plan your
                trip based on local festivals, hidden temples, authentic Newari
                food, and the perfect mountain views.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-center gap-4"
              >
                <Link
                  href="/auth/register"
                  className={`h-12 px-8 rounded-full text-white font-semibold text-base shadow-lg shadow-slate-200 hover:shadow-xl transition-all hover:-translate-y-1 flex items-center justify-center ${theme.accentBg}`}
                >
                  Start Planning Free
                </Link>
                <button className="h-12 px-6 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold text-base hover:bg-slate-50 transition-colors flex items-center gap-2 group">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform text-xs">
                    ▶
                  </span>
                  See Pokhara Demo
                </button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: SMOOTH_EASE }}
              viewport={{ once: true }}
              className="relative order-2 h-[450px] lg:h-[500px] w-full"
            >
              <div className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl border-[6px] border-white ring-1 ring-slate-200/50 bg-slate-200">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mood}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={theme.heroImage}
                      alt={`${mood} mood in Nepal`}
                      fill
                      priority={true}
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </motion.div>
                </AnimatePresence>

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />

                <div className="absolute top-6 right-6 bg-black/30 backdrop-blur-md text-white px-4 py-1.5 rounded-full border border-white/20 flex items-center gap-2 text-xs font-semibold tracking-wide z-20">
                  <MapPin className="w-3 h-3" /> NEPAL
                </div>
              </div>

              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: SMOOTH_EASE }}
                className="absolute bottom-8 -left-4 md:-left-12 bg-white/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl w-72 border border-white/50 z-30"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Live Forecast
                  </span>
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                    Excellent
                  </div>
                </div>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900">22°C</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Lakeside, Pokhara
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded-full ${theme.softAccentBg} ${theme.accentText}`}
                  >
                    <theme.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">
                      AI Suggestion
                    </p>
                    <p className="text-xs font-semibold text-slate-800 leading-snug">
                      &quot;Perfect visibility for World Peace Pagoda sunset
                      hike. Pack a light windbreaker.&quot;
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <Marquee theme={theme} />

        {/* AI SECTION */}
        <section
          id="ai-planner"
          className="py-12 bg-white relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_CONFIG}
                variants={{
                  hidden: { opacity: 0, x: -50 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: 1, ease: SMOOTH_EASE },
                  },
                }}
                className="order-2 lg:order-1"
              >
                <div className="relative bg-slate-50 border border-slate-200 rounded-[2.5rem] p-6 shadow-sm max-w-md mx-auto lg:mx-0">
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      whileInView={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        transition: {
                          delay: 0.2,
                          duration: 0.5,
                          ease: SMOOTH_EASE,
                        },
                      }}
                      viewport={VIEWPORT_CONFIG}
                      className="flex justify-end"
                    >
                      <div className="bg-slate-900 text-white text-sm px-5 py-3 rounded-2xl rounded-tr-sm shadow-md">
                        Plan a 2-day spiritual trip to Bhaktapur, vegan food
                        only.
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      whileInView={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        transition: {
                          delay: 0.6,
                          duration: 0.5,
                          ease: SMOOTH_EASE,
                        },
                      }}
                      viewport={VIEWPORT_CONFIG}
                      className="flex justify-start"
                    >
                      <div className="bg-white border border-slate-100 text-slate-700 text-sm px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm w-full">
                        <p className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-amber-500" /> Wander
                          AI
                        </p>
                        <ul className="space-y-2 mb-3">
                          <li className="flex gap-2">
                            <span className="text-slate-500">08:00</span>
                            <span>Yoga near Nyatapola Temple</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-slate-500">12:00</span>
                            <span>Vegan Samay Baji at Café Nyatapola</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-slate-500">16:00</span>
                            <span>Pottery workshop in Pottery Square</span>
                          </li>
                        </ul>
                        <button
                          className={`text-xs font-semibold ${theme.accentText}`}
                        >
                          + View full itinerary
                        </button>
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0, rotate: -10 }}
                    whileInView={{
                      opacity: 1,
                      scale: 1,
                      rotate: 0,
                      transition: {
                        delay: 0.5,
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      },
                    }}
                    viewport={VIEWPORT_CONFIG}
                    className="absolute -right-8 -bottom-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hidden sm:block"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Food Check
                        </p>
                        <p className="text-xs text-slate-500">
                          100% Vegan Options Found
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_CONFIG}
                variants={containerVariants}
                className="order-1 lg:order-2"
              >
                <motion.div
                  variants={itemVariants}
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${theme.softAccentBg} ${theme.accentText} text-xs font-bold uppercase tracking-wider mb-4`}
                >
                  <Bot className="w-4 h-4" /> Ask AI
                </motion.div>
                <motion.h2
                  variants={itemVariants}
                  className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
                >
                  Your personal <br /> travel genius.
                </motion.h2>
                <motion.p
                  variants={itemVariants}
                  className="text-lg text-slate-500 mb-6 leading-relaxed"
                >
                  Nepal is complex. Weather changes fast, and the best places
                  aren&apos;t on Google Maps. Our AI combines live weather data
                  with deep local knowledge to build your perfect itinerary in
                  seconds.
                </motion.p>
                <motion.ul
                  variants={containerVariants}
                  className="space-y-4 mb-8"
                >
                  {[
                    "Find hidden waterfalls active only during monsoon",
                    "Locate quiet temples for meditation away from crowds",
                    "Suggest rooftops with the best mountain visibility right now",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      variants={itemVariants}
                      className="flex items-start gap-3"
                    >
                      <div
                        className={`mt-1 w-5 h-5 rounded-full ${theme.accentBg} flex items-center justify-center text-white flex-shrink-0`}
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-slate-700">{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section
          id="features"
          className="py-12 bg-slate-50 relative scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
              variants={containerVariants}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <motion.h2
                variants={itemVariants}
                className="text-4xl font-bold text-slate-900 mb-4"
              >
                Everything you need <br /> to travel smarter.
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-lg text-slate-500"
              >
                Traditional apps show you the map. We show you the experience.
                Powered by real-time data and local intelligence.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]"
            >
              <motion.div
                variants={itemVariants}
                className={`md:col-span-2 rounded-[2.5rem] p-8 relative overflow-hidden group border ${theme.border} ${theme.surface} hover:shadow-2xl transition-all duration-500`}
              >
                <div
                  className={`absolute top-0 right-0 w-[500px] h-[500px] ${theme.softAccentBg} rounded-full blur-[100px] opacity-30 -mr-24 -mt-24 pointer-events-none`}
                />

                <div className="relative z-10 flex flex-col md:flex-row h-full gap-8">
                  <div className="flex-1">
                    <div
                      className={`w-12 h-12 rounded-2xl ${theme.softAccentBg} ${theme.accentText} flex items-center justify-center mb-6`}
                    >
                      <Calendar className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      Dynamic Itineraries
                    </h3>
                    <p className="text-slate-500 mb-6 leading-relaxed">
                      Plans that adapt to the weather. If it rains in Pokhara,
                      we switch your boating trip to a cozy museum visit
                      automatically.
                    </p>
                    <div
                      className={`inline-flex items-center gap-2 text-sm font-bold ${theme.accentText}`}
                    >
                      Generate Trip <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex-1 bg-white/60 backdrop-blur-md border border-slate-100/50 rounded-2xl p-5 shadow-sm self-center w-full max-w-sm hover:scale-[1.02] transition-transform duration-500">
                    <div className="flex justify-between items-center mb-4 border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        Today&apos;s Plan
                      </span>
                      <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                        Oct 24
                      </span>
                    </div>
                    <div className="space-y-0 relative">
                      <div className="absolute left-[19px] top-3 bottom-3 w-[2px] bg-slate-100" />
                      <div className="flex gap-3 relative z-10">
                        <div className="w-10 text-[10px] font-bold text-slate-400 pt-1 text-right">
                          09:00
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300 mt-1.5 ring-4 ring-white" />
                        <div className="bg-slate-50 p-2 rounded-lg flex-1 mb-3">
                          <p className="text-xs font-bold text-slate-700">
                            Breakfast at Lakeside
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 relative z-10">
                        <div className="w-10 text-[10px] font-bold text-slate-900 pt-1 text-right">
                          11:00
                        </div>
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${theme.accentBg} mt-1.5 ring-4 ring-white`}
                        />
                        <div
                          className={`${theme.softAccentBg} p-2 rounded-lg flex-1 mb-3 border ${theme.border}`}
                        >
                          <div className="flex justify-between items-start">
                            <p
                              className={`text-xs font-bold ${theme.accentText}`}
                            >
                              Sarangkot Viewpoint
                            </p>
                            <Sun className="w-3 h-3 text-amber-500" />
                          </div>
                          <p className="text-[10px] text-slate-600 mt-1">
                            Visibility: Perfect
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 relative z-10">
                        <div className="w-10 text-[10px] font-bold text-slate-400 pt-1 text-right">
                          14:00
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300 mt-1.5 ring-4 ring-white" />
                        <div className="bg-slate-50 p-2 rounded-lg flex-1">
                          <p className="text-xs font-bold text-slate-700">
                            Tibetan Camp
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className={`md:col-span-1 rounded-[2.5rem] p-8 relative overflow-hidden group border ${theme.border} bg-white hover:shadow-2xl transition-all duration-500 flex flex-col`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
                      <Thermometer className="w-6 h-6" />
                    </div>
                    <div className="bg-sky-50 text-sky-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      Live
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Smart Forecast
                  </h3>
                  <p className="text-sm text-slate-500 mb-8">
                    Not just &quot;Sunny&quot;. We analyze visibility, leech
                    warnings, and UV index.
                  </p>
                  <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-100 rounded-full text-amber-500">
                        <Sun className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900 leading-none">
                          24°
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">
                          Feels like 26°
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 p-2 rounded-lg text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                          Visibility
                        </p>
                        <p className="text-sm font-bold text-slate-700">15km</p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                          Humidity
                        </p>
                        <p className="text-sm font-bold text-slate-700">45%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className={`md:col-span-1 rounded-[2.5rem] p-8 relative overflow-hidden group border ${theme.border} bg-white hover:shadow-2xl transition-all duration-500`}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                  <Backpack className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Packing Genius
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  Personalized lists based on your trek altitude and season.
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 group/item cursor-pointer">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-slate-400 line-through decoration-slate-300">
                      Raincoat
                    </span>
                  </div>
                  <div className="flex items-center gap-3 group/item cursor-pointer">
                    <Circle className="w-5 h-5 text-slate-300 group-hover/item:text-emerald-500 transition-colors" />
                    <span className="text-sm text-slate-700 font-medium">
                      Water filter
                    </span>
                  </div>
                  <div className="flex items-center gap-3 group/item cursor-pointer">
                    <Circle className="w-5 h-5 text-slate-300 group-hover/item:text-emerald-500 transition-colors" />
                    <span className="text-sm text-slate-700 font-medium">
                      Power bank
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="md:col-span-2 bg-slate-900 rounded-[2.5rem] px-8 py-10 relative overflow-hidden flex items-center group"
              >
                <div className="absolute inset-0 opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-1000">
                  <Image
                    src="https://images.unsplash.com/photo-1572099606223-6e29045d7de3?q=80&w=2000&auto=format&fit=crop"
                    alt="Map background"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent z-10" />
                <div className="relative z-20 max-w-lg">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-6">
                    <Map className="w-3.5 h-3.5" /> Offline Maps
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4 leading-tight">
                    Find the path <br /> less traveled.
                  </h3>
                  <p className="text-slate-300 mb-8 max-w-sm text-base">
                    Access detailed maps of Thamel alleys and Annapurna trails
                    even without internet. Verified by local guides.
                  </p>
                  <button className="h-12 px-6 rounded-full bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition-all flex items-center gap-2 group/btn">
                    Explore Hidden Gems
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden md:block z-20">
                  <div className="relative">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 animate-bounce">
                      <Navigation className="w-6 h-6 text-white fill-current" />
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/50 blur-sm rounded-full" />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CULTURAL SECTION */}
        <section id="cultural-guide" className="py-12 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
              variants={containerVariants}
              className="text-center max-w-2xl mx-auto mb-12"
            >
              <motion.h2
                variants={itemVariants}
                className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
              >
                Investigate every place.
              </motion.h2>
              <motion.p variants={itemVariants} className="text-slate-500">
                We don&apos;t just show you the map. We show you the soul of the
                place. History, food, and traditions, all curated by locals.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
              variants={containerVariants}
              className="grid md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[600px]"
            >
              {/* Big Heritage Image */}
              <motion.div
                variants={itemVariants}
                className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-3xl bg-slate-900 shadow-lg"
              >
                <div className="absolute inset-0 opacity-60 group-hover:scale-105 transition-transform duration-700">
                  <Image
                    src="https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1000&q=80"
                    alt="Kathmandu historical temple"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                <div className="absolute bottom-0 left-0 p-8 z-20">
                  <Landmark className="text-white w-8 h-8 mb-3" />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Historical Heritage
                  </h3>
                  <p className="text-slate-300 text-sm mb-4">
                    Discover the stories behind Swayambhunath, Patan Durbar
                    Square, and the ancient trade routes of Thamel.
                  </p>
                  <span className="text-white text-xs font-bold underline decoration-amber-500 underline-offset-4">
                    Read History
                  </span>
                </div>
              </motion.div>

              {/* Authentic Tastes – now with 2-image slider (Juju Dhau + Momos) */}
              <motion.div
                variants={itemVariants}
                className="md:col-span-2 relative group overflow-hidden rounded-3xl shadow-lg"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={AUTHENTIC_IMAGES[authenticIndex].src}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.7, ease: SMOOTH_EASE }}
                    className="absolute inset-0 opacity-90 group-hover:rotate-1 group-hover:scale-105 transition-transform duration-700"
                  >
                    <Image
                      src={AUTHENTIC_IMAGES[authenticIndex].src}
                      alt={AUTHENTIC_IMAGES[authenticIndex].alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </motion.div>
                </AnimatePresence>

                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors z-10" />
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-xl z-20">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-orange-600" />
                    <span className="font-bold text-slate-900 text-sm">
                      Authentic Tastes
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 z-20">
                  <h3 className="text-xl font-bold text-white drop-shadow-md">
                    Must-try: Juju Dhau &amp; Momos
                  </h3>
                </div>
              </motion.div>

              {/* Traditions */}
              <motion.div
                variants={itemVariants}
                className="relative group overflow-hidden rounded-3xl shadow-sm border border-slate-200"
              >
                <div className="absolute inset-0">
                  <Image
                    src="/images/tradition.jpg"
                    alt="Nepali traditional festival"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>

                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />

                <div className="relative z-10 p-6 flex flex-col justify-end h-full">
                  <h3 className="font-bold text-white mb-1">Traditions</h3>
                  <p className="text-xs text-slate-200">
                    Local etiquette, greetings, and festival calendars.
                  </p>
                </div>
              </motion.div>

              {/* Hidden Nature */}
              <motion.div
                variants={itemVariants}
                className="relative group overflow-hidden rounded-3xl bg-slate-900 shadow-sm"
              >
                <div className="absolute inset-0 opacity-80">
                  <Image
                    src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80"
                    alt="Hidden nature in Nepal"
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
                <div className="absolute bottom-6 left-6 z-10">
                  <h3 className="font-bold text-white">Hidden Nature</h3>
                  <p className="text-xs text-slate-300">Secret waterfalls.</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-12 px-4 sm:px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
              variants={containerVariants}
              className="text-center max-w-2xl mx-auto mb-12"
            >
              <motion.h2
                variants={itemVariants}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Ready to design your Nepal story?
              </motion.h2>
              <motion.p variants={itemVariants} className="text-slate-500">
                Turn scattered ideas into a clear, weather-smart itinerary.
                Start with one click, adjust everything with AI.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
              variants={scaleUpVariants}
              className="relative rounded-[3rem] overflow-hidden min-h-[500px] flex items-center justify-center shadow-2xl bg-slate-900"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`cta-${mood}`}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <Image
                    src={theme.heroImage}
                    alt="Nepal Scenery"
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                </motion.div>
              </AnimatePresence>

              <div className="absolute inset-0 bg-black/40 z-10" />

              <div className="relative z-20 w-full max-w-2xl px-6">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-slate-900 text-xs font-bold uppercase tracking-widest mb-8">
                    <Sparkles className="w-3.5 h-3.5 fill-slate-900" />
                    Your Journey Awaits
                  </div>

                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-sm">
                    Namaste, Traveler.
                  </h2>

                  <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed font-medium">
                    Experience Nepal through a lens crafted just for you.
                    Weather, culture, and vibes—perfectly aligned.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                      href="/auth/register"
                      className="w-full sm:w-auto h-14 px-10 rounded-full bg-white text-slate-900 font-bold text-lg hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-2"
                    >
                      Start Planning
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <span className="text-white/80 text-sm font-medium">
                      Free for your first 3 trips
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-8 left-8 text-white/60 text-xs font-mono hidden md:block z-20">
                COORD: 28.3949° N, 84.1240° E
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer theme={theme} />
    </div>
  );
}
