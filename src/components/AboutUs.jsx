import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import diavloImg from '../assets/foto_diavlo.png';

/**
 * Redesigned About Us page focused on the "Diavlo" persona.
 * Features a bento grid layout and aggressive brand storytelling.
 */
const AboutUs = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col">
            <main className="flex-grow pt-40 px-6 lg:px-12 max-w-[1600px] mx-auto w-full space-y-32 mb-40">
                
                {/* Navigation & Exit */}
                <div className="flex justify-between items-center -mt-20 mb-20">
                    <button 
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[4px] text-white/30 hover:text-white transition-all"
                    >
                        <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Volver al Hub
                    </button>
                </div>

                {/* 1. HERO: THE BIG QUESTION (Option A integrated) */}
                <section className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    <div className="lg:col-span-8 space-y-10 text-center lg:text-left z-10">
                        <motion.h1 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-6xl lg:text-9xl font-syne font-black uppercase tracking-[-0.04em] leading-[0.85] text-white"
                        >
                            ¿QUIÉN ES <br />
                            <span className="text-[#bf4a4a]">DIAVLO?</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-2xl lg:text-4xl font-syne font-black uppercase text-white/20 tracking-tighter"
                        >
                            Y por qué deberías agradecerle
                        </motion.p>
                    </div>

                    {/* Option A: Large Character Presence */}
                    <div className="lg:col-span-4 relative flex justify-center lg:justify-end">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 1, ease: "backOut" }}
                            className="relative w-64 lg:w-[400px] h-64 lg:h-[400px]"
                        >
                             <div className="absolute inset-0 bg-[#bf4a4a]/20 blur-[80px] rounded-full animate-pulse" />
                             <img 
                                src={diavloImg} 
                                className="w-full h-full object-contain relative z-10 drop-shadow-[0_40px_60px_rgba(191,74,74,0.4)]"
                                alt="Diavlo Character" 
                             />
                        </motion.div>
                    </div>
                </section>

                {/* 2. BENTO GRID: NARRATIVE & ORIGIN */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* The Epiphany Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-7 bg-[#1C1C1C] border border-white/5 p-10 lg:p-14 rounded-[56px] space-y-8 flex flex-col justify-center relative overflow-hidden group shadow-2xl"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#bf4a4a]/5 via-transparent to-transparent" />
                        <h2 className="text-[10px] font-black uppercase tracking-[5px] text-[#bf4a4a] relative z-10">La Epifanía</h2>
                        <div className="space-y-6 relative z-10">
                            <p className="text-white/90 text-xl lg:text-2xl font-medium leading-relaxed italic">
                                "Un día me detuve a mirar a mi alrededor y sentí una profunda lástima. Vi un mar de clones caminando por la calle, usando la misma ropa aburrida, genérica y sin alma que las grandes masas les imponen."
                            </p>
                            <p className="text-white/40 text-sm lg:text-base font-bold uppercase tracking-wider leading-relaxed">
                                Me di cuenta de que el mundo estaba sufriendo una crisis severa de estilo. Como nadie tenía el coraje ni el talento para solucionarlo, tuve que intervenir yo.
                            </p>
                        </div>
                    </motion.div>

                    {/* The Visual Card (Option B: Replacing shirt with Diavlo) */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="lg:col-span-5 aspect-square bg-[#1C1C1C] border border-white/5 rounded-[56px] overflow-visible relative group shadow-2xl flex items-center justify-center p-12"
                        style={{ isolation: 'isolate' }}
                    >
                        {/* Improved Staging */}
                        <div className="absolute inset-0 bg-[#000]/40 rounded-[56px] -z-10" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#bf4a4a15,transparent_70%)] rounded-[56px] -z-10" />
                        
                        <div className="relative w-full h-full flex items-center justify-center">
                            {/* Option B: Character - Static Version */}
                            <div className="relative w-full h-full flex items-center justify-center">
                                <img 
                                    src={diavloImg} 
                                    className="w-[90%] h-[90%] object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.8)] z-20" 
                                    alt="Diavlo Visual" 
                                />
                                <div className="absolute inset-0 text-[12rem] font-syne font-black text-white/[0.02] flex items-center justify-center pointer-events-none -z-10 group-hover:text-[#bf4a4a]/5 transition-colors duration-1000">
                                    DVL
                                </div>
                            </div>
                        </div>

                        {/* Technical Decoration */}
                        <div className="absolute top-10 left-10 space-y-1">
                             <div className="w-12 h-0.5 bg-[#bf4a4a]" />
                             <div className="text-[8px] font-black text-white/20 uppercase tracking-[4px]">Source Verified</div>
                        </div>
                    </motion.div>

                    {/* The Act of Charity Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-12 bg-[#1C1C1C] border border-white/5 p-10 lg:p-16 rounded-[56px] relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#bf4a4a]/5 blur-[120px] rounded-full translate-x-32 -translate-y-32" />
                        <div className="relative z-10 max-w-4xl space-y-8">
                            <h2 className="text-[10px] font-black uppercase tracking-[5px] text-[#bf4a4a]">Caridad Visual</h2>
                            <p className="text-white font-syne text-2xl lg:text-4xl font-black uppercase tracking-tighter leading-[0.95]">
                                No creé DVL Supply Co. para fundar otra tienda de ropa; la creé como un acto de caridad visual. 
                            </p>
                            <p className="text-white/40 text-sm lg:text-lg font-bold uppercase tracking-widest leading-relaxed">
                                Decidí encerrarme a diseñar piezas con un carácter fuerte, un corte oversize impecable y gráficos que realmente provoquen algo al pasar. Básicamente, bajé de mi trono para darles una oportunidad: vestir a mi nivel de flow.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* 3. THE COMMANDMENTS (Mandamientos with themed tints) */}
                <section className="space-y-16">
                    <div className="text-center space-y-3">
                        <h2 className="text-[10px] font-black uppercase tracking-[6px] text-[#bf4a4a]">Reglas Inquebrantables</h2>
                        <h3 className="text-4xl lg:text-6xl font-syne font-black uppercase text-white">LOS MANDAMIENTOS</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { 
                                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, 
                                title: 'CERO CONCESIONES', 
                                desc: 'No hacemos ropa para complacer a todos. Si te da miedo destacar, estás en la web equivocada.' 
                            },
                            { 
                                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3m18 8v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3m18-8l-2 2-2-2m-10 8l2-2 2 2"/></svg>, 
                                title: 'CALIDAD RIDÍCULA', 
                                desc: 'Algodón premium de 220g. Mis diseños merecen el mejor lienzo del mercado, y de paso, tu piel también.' 
                            },
                            { 
                                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>, 
                                title: 'DROPS LIMITADOS', 
                                desc: 'Cuando el inventario llega a cero, se fue para siempre. No repito drop, el flow no se recicla.' 
                            }
                        ].map((m, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-12 bg-[#1C1C1C] border border-white/5 rounded-[48px] space-y-8 group transition-all duration-700 hover:border-[#bf4a4a]/40 shadow-2xl relative overflow-hidden"
                                style={{ backgroundColor: 'rgba(191, 74, 74, 0.03)' }} // Persistent 3% red tint
                            >
                                {/* Inner Glow on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#bf4a4a]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                
                                <div className="text-[#bf4a4a] relative z-10 group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500">
                                    {m.icon}
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <h4 className="text-lg font-black uppercase tracking-[4px] text-white group-hover:text-[#bf4a4a] transition-colors">{m.title}</h4>
                                    <p className="text-white/30 text-xs font-bold uppercase leading-relaxed tracking-wider">{m.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 4. THE MANIFESTO BANNER */}
                <section className="relative h-[60vh] flex items-center justify-center overflow-hidden rounded-[80px] shadow-3xl">
                    <div className="absolute inset-0 bg-[#000] z-0" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#bf4a4a20,transparent_70%)]" />
                    <div className="absolute inset-0 opacity-5 pointer-events-none" 
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2 }}
                        className="relative z-10 text-center px-6"
                    >
                        <h2 className="text-5xl lg:text-8xl font-syne font-black uppercase tracking-tighter text-white leading-none mb-10">
                            "LA MODA ES PASAJERA, <br />
                            MI ESTILO ES <span className="text-[#bf4a4a]">ETERNO."</span>
                        </h2>
                        <p className="text-sm font-black uppercase tracking-[12px] text-white/40">— DIAVLO</p>
                    </motion.div>
                </section>

                {/* 5. PROCESS: DEL TALLER A LA CALLE */}
                <section className="space-y-16">
                    <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
                        <div className="space-y-2 text-left">
                            <h2 className="text-[10px] font-black uppercase tracking-[6px] text-[#bf4a4a]">El Trayecto</h2>
                            <h3 className="text-4xl lg:text-6xl font-syne font-black uppercase text-white">DEL TALLER A LA CALLE</h3>
                        </div>
                        <p className="text-white/20 text-[10px] font-black uppercase tracking-[4px] max-w-sm text-right">Trazabilidad total de cada pieza que sale del cuartel general.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'LA INSPIRACIÓN', desc: 'El trazo original de los gráficos de Diavlo. Arte sin filtros.' },
                            { step: '02', title: 'LA CONFECCIÓN', desc: 'Hecho con materiales de alta calidad y talleres locales seleccionados.' },
                            { step: '03', title: 'EL DESPACHO', desc: 'Empacado y enviado directamente desde el cuartel general.' }
                        ].map((p, i) => (
                            <div key={i} className="group p-10 bg-[#1C1C1C] border border-white/5 rounded-[48px] space-y-6 hover:bg-white/[0.04] transition-all relative overflow-hidden shadow-xl">
                                <div className="absolute top-0 right-0 p-8 text-8xl font-syne font-black text-white/[0.02] group-hover:text-[#bf4a4a]/5 transition-colors">{p.step}</div>
                                <span className="text-sm font-black uppercase tracking-[3px] text-[#bf4a4a] relative z-10">{p.step}</span>
                                <h4 className="text-lg font-black uppercase tracking-[3px] text-white relative z-10">{p.title}</h4>
                                <p className="text-white/20 text-xs font-bold uppercase leading-relaxed tracking-widest relative z-10">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="py-20 border-t border-white/5 text-center space-y-12">
                    <h2 className="text-4xl lg:text-6xl font-syne font-black uppercase tracking-tight text-white leading-none">
                        ¿LISTO PARA EL <br />
                        <span className="text-[#bf4a4a]">SIGUIENTE DROP?</span>
                    </h2>
                    <motion.button 
                        whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(191,74,74,0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        className="px-16 py-6 bg-white text-black font-syne font-black uppercase text-[12px] tracking-[6px] rounded-full shadow-3xl transition-all"
                        onClick={() => navigate('/')}
                    >
                        EXPLORAR EL FLOW
                    </motion.button>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default AboutUs;
