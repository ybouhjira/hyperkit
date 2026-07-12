/**
 * Homepage — "THE SITE IS AN IDE" landing, ported 1:1 from the
 * Docusaurus React implementation (website/src/pages/index.tsx).
 */
import { Title, Meta } from '@solidjs/meta';
import { Hero, Stats } from '../components/home/Hero';
import { Systems } from '../components/home/Systems';
import { AiSection } from '../components/home/AiSection';
import { Themes } from '../components/home/Themes';
import { Diagrams } from '../components/home/Diagrams';
import { Gallery } from '../components/home/Gallery';
import { InstallCta, StatusStrip } from '../components/home/Cta';
import '../components/home/home.css';

export default function Home() {
  return (
    <>
      <Title>HyperKit — SolidJS component library</Title>
      <Meta
        name="description"
        content="Build IDE-grade apps, not just interfaces — 131 components, panel layouts, a navigation registry, 40 themes, a diagram engine, and an MCP server for SolidJS."
      />
      <div class="hkHome">
        <div class="backdrop" />
        <Hero />
        <Stats />
        <main>
          <Systems />
          <AiSection />
          <Themes />
          <Diagrams />
          <Gallery />
          <InstallCta />
        </main>
        <StatusStrip />
      </div>
    </>
  );
}
