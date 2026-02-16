import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

const SERVICES = [
  {
    id: "interior-contracting",
    order: "01",
    title: "INTERIOR CONTRACTING",
    scope: "Commercial",
    image: "/i2.jpg",
    imageAlt: "Interior contracting project execution",
    description: [
      "We execute interior works end to end from civil works, partitions, flooring, false ceiling, modular furniture, interior finishes to signage.",
      "As a team with design knowledge, we ensure that the design intent is never compromised.",
      "Our eye for detail enables us to execute every element to the smallest detail as per drawings.",
      "We do not tolerate even the slightest variation because precision protects our brand value.",
    ],
    points: [
      "End-to-end execution",
      "Design intent protection",
      "Detail-level precision",
    ],
  },
  {
    id: "turnkey-contracting",
    order: "02",
    title: "TURNKEY CONTRACTING",
    scope: "Commercial",
    image: "/i4.jpg",
    imageAlt: "Turnkey commercial interior delivery",
    description: [
      "We carry out all interior works, electrical, networking, plumbing, fire-fighting, HVAC, safety and security systems, and design services under one scope.",
      "We have expertise in each of these and ensure smooth completion through seamless coordination inside our team and with other stakeholders.",
      "Clients trust our control over project delivery and execution quality.",
    ],
    points: [
      "Single-scope responsibility",
      "Cross-functional coordination",
      "Reliable project control",
    ],
  },
  {
    id: "mep-services",
    order: "03",
    title: "MEP SERVICES",
    scope: "Engineering",
    image: "/i6.webp",
    imageAlt: "MEP and HVAC integration work",
    description: [
      "We understand the significance of timely service execution and seamlessly integrate Mechanical, Electrical, Plumbing (MEP) and HVAC services.",
      "We offer supply, erection, installation and commissioning of MEP and HVAC services in a project.",
      "Our dedicated site team works in unison with other agencies for speed, quality and excellent coordination.",
      "Leading consultants have recognized our execution quality and coordination standards.",
    ],
    points: [
      "MEP + HVAC integration",
      "Installation to commissioning",
      "Consultant-grade coordination",
    ],
  },
  {
    id: "residential-interiors",
    order: "04",
    title: "RESIDENTIAL INTERIORS",
    scope: "Home",
    image: "/i9.jpg",
    imageAlt: "Residential interior design setup",
    description: [
      "Sowron Interiors can transform your home into the interior style you desire, from a bold statement space to subtle color-led elegance.",
      "We provide creative elements and service for your home, work and life.",
      "Our technical expertise and product resources create a one-stop experience for customers.",
      "Our design service ranges from selecting laminates to creating and executing the full vision from start to finish.",
    ],
    points: [
      "Personalized home concepts",
      "Material and laminate guidance",
      "Start-to-finish delivery",
    ],
  },
  {
    id: "modular-solution",
    order: "05",
    title: "MODULAR SOLUTION",
    scope: "Office",
    image: "/i11.jpg",
    imageAlt: "Modern modular office furniture",
    description: [
      "Modern working methods require modern office solutions using intelligent furniture systems.",
      "We transform office landscapes into inspiring, versatile and multi-faceted environments.",
      "With a wide range for all office zones, we provide flexible and individual design possibilities.",
      "Our modular solutions combine quality, functionality, modern design and innovative technology.",
    ],
    points: [
      "Smart office planning",
      "Versatile workspace furniture",
      "Modern tech-enabled design",
    ],
  },
];

export default function Commercial() {
  const [activeId, setActiveId] = useState(SERVICES[0].id);

  const activeService = useMemo(
    () => SERVICES.find((service) => service.id === activeId) || SERVICES[0],
    [activeId]
  );

  return (
    <>
      <SEO
        title="Commercial Services | Sowron Interiors"
        description="Explore Sowron's commercial and residential service capabilities: interior contracting, turnkey contracting, MEP services, residential interiors and modular solutions."
      />

      <section className="relative min-h-screen mt-20 overflow-hidden">
        <motion.div
          className="absolute -inset-[30%] -z-10 rounded-full blur-3xl
            bg-[conic-gradient(at_top,rgba(255,60,60,0.18),rgba(255,210,80,0.12),rgba(255,60,60,0.18))]
            dark:bg-[conic-gradient(at_top,rgba(255,90,90,0.12),rgba(255,210,80,0.08),rgba(255,90,90,0.12))]"
          animate={{ rotate: 360 }}
          transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
        />

        <div
          className="absolute inset-0 -z-10
            bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),rgba(255,245,245,0.9),rgba(255,255,255,0.95))]
            dark:bg-[radial-gradient(circle_at_top,rgba(20,20,20,0.9),rgba(10,10,10,0.95),rgba(0,0,0,0.98))]"
        />

        <div className="max-w-7xl mx-auto px-6 pt-24 pb-10 text-center">
          <span
            className="inline-flex px-4 py-1.5 rounded-full
            text-[11px] tracking-[0.2em] uppercase font-semibold
            bg-brand-red/10 text-brand-red"
          >
            Commercial Tab
          </span>

          <h1
            className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight
            bg-gradient-to-r from-red-600 via-red-700 to-red-900
            bg-clip-text text-transparent"
          >
            Our Service Expertise
          </h1>

          <p className="mt-3 text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Select a service to view full scope, execution details and delivery
            strengths.
          </p>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 pb-24">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.35fr] items-start">
            <div
              className="rounded-3xl border border-black/10 dark:border-white/10
              bg-white/80 dark:bg-[#141414]/80 backdrop-blur-xl p-4"
            >
              <div className="space-y-3">
                {SERVICES.map((service) => {
                  const isActive = activeId === service.id;
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setActiveId(service.id)}
                      className={`w-full text-left rounded-2xl border p-4 transition
                        ${
                          isActive
                            ? "border-brand-red bg-brand-red/10 dark:bg-brand-red/15 shadow-[0_14px_35px_rgba(211,47,47,0.2)]"
                            : "border-black/10 dark:border-white/10 bg-white dark:bg-[#1b1b1b] hover:border-brand-red/30"
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold
                            ${
                              isActive
                                ? "bg-brand-red text-white"
                                : "bg-black/5 dark:bg-white/10 text-brand-lightText dark:text-brand-darkText"
                            }`}
                        >
                          {service.order}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm md:text-base text-brand-lightText dark:text-brand-darkText">
                            {service.title}
                          </p>
                          <p className="mt-1 text-xs md:text-sm text-brand-lightSubText dark:text-brand-darkSubText">
                            {service.scope}
                          </p>
                        </div>

                        <ArrowUpRight
                          size={16}
                          className={`shrink-0 mt-1 transition-transform ${
                            isActive
                              ? "rotate-45 text-brand-red"
                              : "text-brand-lightSubText dark:text-brand-darkSubText"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.article
                key={activeService.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl border border-black/10 dark:border-white/10
                  bg-white/85 dark:bg-[#161616] p-4 md:p-6"
              >
                <div className="relative rounded-2xl overflow-hidden">
                  <img
                    src={activeService.image}
                    alt={activeService.imageAlt}
                    className="h-[240px] md:h-[320px] w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <span
                    className="absolute top-4 left-4 px-3 py-1 rounded-full
                    bg-white/90 text-black text-[11px] uppercase tracking-widest font-semibold"
                  >
                    {activeService.scope}
                  </span>
                  <h2 className="absolute bottom-4 left-4 right-4 text-white text-xl md:text-2xl font-bold">
                    {activeService.title}
                  </h2>
                </div>

                <div
                  className="mt-5 space-y-3 text-sm md:text-[15px] leading-7
                  text-brand-lightSubText dark:text-brand-darkSubText"
                >
                  {activeService.description.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  {activeService.points.map((point) => (
                    <div
                      key={point}
                      className="rounded-xl border border-brand-yellow/40 bg-brand-yellowSoft/70
                        dark:bg-brand-yellow/15 dark:border-brand-yellow/30 px-3 py-2"
                    >
                      <p className="text-xs md:text-sm font-medium text-brand-lightText dark:text-brand-darkText flex items-center gap-2">
                        <BadgeCheck size={14} className="text-brand-red" />
                        {point}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-7">
                  <Link
                    to="/book-demo"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl
                      text-sm font-semibold text-white
                      bg-gradient-to-r from-brand-red to-brand-redDark
                      hover:shadow-[0_16px_30px_rgba(211,47,47,0.35)] transition"
                  >
                    Book Free Consultation
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  );
}
