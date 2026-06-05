import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

/**
 * Redesigned About Us page focused on the "Diavlo" persona.
 * Features a bento grid layout and aggressive brand storytelling.
 */
const AboutUs = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col">
            <main className="flex-grow pt-40 px-6 lg:px-12 max-w-7xl mx-auto w-full space-y-32 mb-40">
                
                {/* Navigation & Exit */}
                <div className="flex justify-between items-center -mt-20 mb-20">
                    <button 
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[4px] text-white/30 hover:text-white transition-all"
                    >
                        <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Volver al Hub
                    </button>
                </div>

                {/* 1. HERO: THE BIG QUESTION */}
                <section className="space-y-10 text-center lg:text-left">
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl lg:text-8xl font-syne font-black uppercase tracking-[-0.04em] leading-[0.85] text-white"
                    >
                        ¿QUIÉN ES <span className="text-[#bf4a4a]">DIAVLO?</span> <br />
                        <span className="text-3xl lg:text-5xl opacity-40">(Y por qué deberías agradecerle)</span>
                    </motion.h1>
                </section>

                {/* 2. BENTO GRID: NARRATIVE & ORIGIN */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* The Epiphany Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="lg:col-span-7 bg-[#1C1C1C] border border-white/5 p-10 lg:p-14 rounded-[48px] space-y-8 flex flex-col justify-center"
                    >
                        <h2 className="text-[10px] font-black uppercase tracking-[5px] text-[#bf4a4a]">La Epifanía</h2>
                        <div className="space-y-6">
                            <p className="text-white/80 text-lg lg:text-xl font-medium leading-relaxed italic">
                                "Un día me detuve a mirar a mi alrededor y sentí una profunda lástima. Vi un mar de clones caminando por la calle, usando la misma ropa aburrida, genérica y sin alma que las grandes masas les imponen. Gente invisible, vistiendo ropa invisible."
                            </p>
                            <p className="text-white/40 text-sm lg:text-base font-bold uppercase tracking-wider leading-relaxed">
                                Me di cuenta de que el mundo estaba sufriendo una crisis severa de estilo. Y como nadie tenía el coraje ni el talento para solucionarlo, tuve que intervenir yo.
                            </p>
                        </div>
                    </motion.div>

                    {/* The Visual Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="lg:col-span-5 aspect-square lg:aspect-auto bg-[#1C1C1C] border border-white/5 rounded-[48px] overflow-hidden relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#bf4a4a]/20 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-[10rem] font-syne font-black text-white/[0.02] select-none group-hover:scale-110 transition-transform duration-1000">DVL</div>
                            <img src="/imagenes/04_DEVIL_WHITE.png" className="w-4/5 h-4/5 object-contain relative z-10 drop-shadow-[0_40px_60px_rgba(0,0,0,0.5)] group-hover:-translate-y-6 transition-transform duration-700" alt="Diavlo" />
                        </div>
                    </motion.div>

                    {/* The Act of Charity Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-12 bg-[#1C1C1C] border border-white/5 p-10 lg:p-14 rounded-[48px] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#bf4a4a]/5 blur-3xl rounded-full translate-x-20 -translate-y-20" />
                        <div className="relative z-10 max-w-4xl space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[5px] text-[#bf4a4a]">Caridad Visual</h2>
                            <p className="text-white/70 text-xl lg:text-2xl font-black uppercase tracking-tight leading-tight">
                                No creé DVL Supply Co. para fundar otra tienda de ropa; la creé como un acto de caridad visual. 
                            </p>
                            <p className="text-white/40 text-sm lg:text-base font-bold uppercase tracking-widest leading-relaxed">
                                Decidí encerrarme a diseñar piezas con un carácter fuerte, un corte oversize impecable y gráficos que realmente provoquen algo al pasar. Básicamente, bajé de mi trono para darles una oportunidad: la oportunidad de dejar de verse aburridos y vestir, por fin, a mi nivel de flow. O al menos, intentar acercarse.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* 3. THE COMMANDMENTS (Mandamientos) */}
                <section className="space-y-12">
                    <div className="text-center space-y-2">
                        <h2 className="text-[10px] font-black uppercase tracking-[6px] text-white/20">Reglas Inquebrantables</h2>
                        <h3 className="text-3xl lg:text-5xl font-syne font-black uppercase text-white">LOS MANDAMIENTOS</h3>
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
                                className="p-10 bg-[#1C1C1C] border border-white/5 rounded-[40px] space-y-6 group hover:border-[#bf4a4a]/30 transition-all duration-500"
                            >
                                <div className="text-[#bf4a4a] opacity-60 group-hover:opacity-100 transition-opacity">
                                    {m.icon}
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-[4px] text-[#bf4a4a]">{m.title}</h4>
                                <p className="text-white/30 text-xs font-bold uppercase leading-relaxed tracking-wider">{m.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 4. THE MANIFESTO BANNER */}
                <section className="relative h-[60vh] flex items-center justify-center overflow-hidden rounded-[60px]">
                    <div className="absolute inset-0 bg-[#000] z-0" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#bf4a4a15,transparent_70%)]" />
                    <div className="absolute inset-0 opacity-5 pointer-events-none" 
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="relative z-10 text-center px-6"
                    >
                        <h2 className="text-4xl lg:text-7xl font-syne font-black uppercase tracking-tighter text-white leading-none mb-6">
                            "LA MODA PASA DE MODA. <br />
                            MI FLOW ES <span className="text-[#bf4a4a]">ETERNO."</span>
                        </h2>
                        <p className="text-sm font-black uppercase tracking-[8px] text-white/30">— DIAVLO</p>
                    </motion.div>
                </section>

                {/* 5. PROCESS: DEL TALLER A LA CALLE */}
                <section className="space-y-16">
                    <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
                        <div className="space-y-2 text-left">
                            <h2 className="text-[10px] font-black uppercase tracking-[6px] text-[#bf4a4a]">El Trayecto</h2>
                            <h3 className="text-3xl lg:text-5xl font-syne font-black uppercase text-white">DEL TALLER A LA CALLE</h3>
                        </div>
                        <p className="text-white/20 text-[10px] font-black uppercase tracking-[4px] max-w-sm text-right">Trazabilidad total de cada pieza que sale del cuartel general.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { step: '01', title: 'LA INSPIRACIÓN', desc: 'El trazo original de los gráficos de Diavlo. Arte sin filtros.' },
                            { step: '02', title: 'LA CONFECCIÓN', desc: 'Hecho con materiales de alta calidad y talleres locales seleccionados.' },
                            { step: '03', title: 'EL DESPACHO', desc: 'Empacado y enviado directamente desde el cuartel general.' }
                        ].map((p, i) => (
                            <div key={i} className="group p-8 bg-[#1C1C1C] border border-white/5 rounded-[32px] space-y-4 hover:bg-white/[0.04] transition-all">
                                <span className="text-5xl font-syne font-black text-white/5 group-hover:text-[#bf4a4a]/20 transition-colors">{p.step}</span>
                                <h4 className="text-xs font-black uppercase tracking-[3px] text-white">{p.title}</h4>
                                <p className="text-white/20 text-[10px] font-bold uppercase leading-relaxed tracking-widest">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="py-20 border-t border-white/5 text-center space-y-10">
                    <h2 className="text-3xl lg:text-5xl font-syne font-black uppercase tracking-tight text-white">
                        ¿LISTO PARA EL <span className="text-[#bf4a4a]">SIGUIENTE DROP?</span>
                    </h2>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-12 py-5 bg-white text-black font-syne font-black uppercase text-[11px] tracking-[5px] rounded-full shadow-2xl hover:shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                        onClick={() => window.location.href = '/'}
                    >
                        EXPLORAR ARMAMENTO
                    </motion.button>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default AboutUs;
