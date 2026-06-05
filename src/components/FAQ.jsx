import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

/**
 * FAQ & Legal Policies for DVL Supply Co.
 */
const FAQ = () => {
    const navigate = useNavigate();
    const faqs = [
        {
            q: "¿CUÁNTO TARDA EN LLEGAR MI ENVÍO NACIONAL?",
            a: "El flow no espera, pero la logística sí. Los envíos nacionales tardan de 3 a 5 días hábiles después de procesar tu orden. Recibirás un número de guía para que rastrees tu armadura en tiempo real."
        },
        {
            q: "¿PUEDO PAGAR EN EFECTIVO AL RECOGER EN CITADINA?",
            a: "No. Todas las transacciones deben ser liquidadas a través de nuestra plataforma para asegurar tu pieza. En Citadina (o nuestros puntos de recolección) solo realizamos la entrega técnica de tu drop."
        },
        {
            q: "¿HACEN CAMBIOS DE TALLA O DEVOLUCIONES?",
            a: "Escucha bien: Nuestros DROPS son de edición limitada. No reponemos stock. Por lo tanto, todas las ventas son finales. Revisa la Guía de Armadura antes de comprar; no hay segundas oportunidades."
        },
        {
            q: "¿LA ROPA ES REALMENTE OVERSIZE?",
            a: "Si buscas algo ajustado, estás en el lugar equivocado. Nuestras prendas están diseñadas con un corte industrial amplio y pesado (220g). Si quieres un look menos 'baggy', baja una talla, pero no nos culpes si pierdes el estilo."
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col">
            <main className="flex-grow pt-40 px-6 lg:px-12 max-w-4xl mx-auto w-full space-y-24 mb-40">
                
                {/* Navigation & Exit */}
                <div className="flex justify-between items-center -mt-20 mb-20">
                    <button 
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[4px] text-white/30 hover:text-white transition-all"
                    >
                        <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Volver al Hub
                    </button>
                </div>

                <section className="space-y-6">
                    <h1 className="text-5xl lg:text-7xl font-syne font-black uppercase tracking-[-0.04em] leading-[0.85] text-white text-center">
                        PREGUNTAS <br />
                        <span className="text-[#bf4a4a]">FRECUENTES</span>
                    </h1>
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[5px] text-center">Protocolos de Información de Diavlo</p>
                </section>

                <div className="space-y-4">
                    {faqs.map((f, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#1C1C1C] border border-white/5 p-8 lg:p-10 rounded-[32px] space-y-4"
                        >
                            <h3 className="text-sm lg:text-base font-black uppercase tracking-tight text-white flex gap-4">
                                <span className="text-[#bf4a4a] shrink-0">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 16h.01M12 8a2 2 0 0 0-1.812 1.1L12 11V16"/></svg>
                                </span>
                                {f.q}
                            </h3>
                            <div className="pl-9">
                                <p className="text-white/40 text-xs lg:text-sm font-bold uppercase leading-relaxed tracking-wider">
                                    {f.a}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Shipping & Returns Summary */}
                <section className="bg-white/[0.02] border border-white/5 rounded-[48px] p-10 lg:p-14 space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-syne font-black uppercase text-white">POLÍTICAS DE LOGÍSTICA</h2>
                        <div className="h-0.5 w-12 bg-[#bf4a4a]" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[4px] text-[#bf4a4a]">Envíos</h3>
                            <p className="text-white/30 text-[11px] font-bold uppercase leading-relaxed tracking-widest">
                                Enviamos a todo México vía FedEx/DHL. No nos hacemos responsables por retrasos de la paquetería, pero te ayudaremos a rastrear tu flow hasta que llegue.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[4px] text-[#bf4a4a]">Ventas Finales</h3>
                            <p className="text-white/30 text-[11px] font-bold uppercase leading-relaxed tracking-widest">
                                Debido a la naturaleza limitada de nuestros lanzamientos, no aceptamos devoluciones. Asegúrate de tu talla antes de ejecutar la inversión.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default FAQ;
