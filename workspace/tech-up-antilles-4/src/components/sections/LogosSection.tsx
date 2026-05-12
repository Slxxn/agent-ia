import { motion } from 'framer-motion';
import { Smartphone, Battery, Headphones, Shield, Wifi, Camera } from 'lucide-react';

const brands = [
  { name: 'Apple', icon: Smartphone },
  { name: 'Samsung', icon: Smartphone },
  { name: 'Huawei', icon: Wifi },
  { name: 'Anker', icon: Battery },
  { name: 'JBL', icon: Headphones },
  { name: 'Spigen', icon: Shield },
  { name: 'Belkin', icon: Battery },
  { name: 'Sony', icon: Camera },
];

const LogosSection = () => {
  return (
    <section className="py-12 bg-violet-100 border-y border-violet-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-10"
        >
          Marques disponibles
        </motion.p>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-6 items-center">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-3 group cursor-default"
            >
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center group-hover:bg-violet-50 group-hover:border-violet-200 transition-all duration-300 shadow-sm">
                <brand.icon className="w-8 h-8 text-slate-400 group-hover:text-violet-600 transition-colors duration-300" />
              </div>
              <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">
                {brand.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogosSection;
