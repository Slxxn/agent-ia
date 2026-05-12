import { Hero } from '../components/sections/Hero';
import { Services } from '../components/sections/Services';
import { Gallery } from '../components/sections/Gallery';
import { Pricing } from '../components/sections/Pricing';
import { CTA } from '../components/sections/CTA';

export const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <div id="services"><Services /></div>
      <div id="gallery"><Gallery /></div>
      <div id="pricing"><Pricing /></div>
      <CTA />
    </>
  );
};

export default Home;
