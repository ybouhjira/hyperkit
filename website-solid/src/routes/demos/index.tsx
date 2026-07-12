import { For } from 'solid-js';
import { A } from '@solidjs/router';
import { Title } from '@solidjs/meta';
import { Badge, Card, Text } from '@ybouhjira/hyperkit';
import { DEMO_APPS } from '../../data/demo-apps';
import '../../components/demos/demos.css';

export default function DemosGallery() {
  return (
    <main class="demos-gallery">
      <Title>Demo apps — HyperKit</Title>
      <header class="demos-gallery__hero">
        <Badge variant="success">full applications — not component swatches</Badge>
        <Text as="h1" size="2xl" weight="semibold">
          Demo apps
        </Text>
        <Text as="p" color="secondary">
          Five complete application surfaces, each built entirely from HyperKit and running
          natively in this site. Open one — menus, panels, palettes and data all work.
        </Text>
      </header>
      <div class="demos-gallery__grid">
        <For each={DEMO_APPS}>
          {(app) => (
            <A href={`/demos/${app.slug}`} class="demos-gallery__link">
              <Card padding="md" class="demos-gallery__card">
                <span class="demos-gallery__slug" aria-hidden="true">
                  ▸ /demos/{app.slug}
                </span>
                <Text as="h2" size="lg" weight="semibold">
                  {app.name}
                </Text>
                <Text as="p" size="sm" color="secondary">
                  {app.description}
                </Text>
                <div class="demos-gallery__chips">
                  <For each={app.built}>{(name) => <Badge>{name}</Badge>}</For>
                </div>
              </Card>
            </A>
          )}
        </For>
      </div>
    </main>
  );
}
