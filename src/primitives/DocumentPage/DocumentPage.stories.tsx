import type { Meta, StoryObj } from 'storybook-solidjs';
import { DocumentPage } from './DocumentPage';
import { Text } from '../Text';

const meta: Meta<typeof DocumentPage> = {
  title: 'Data Display/DocumentPage',
  component: DocumentPage,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DocumentPage>;

const sampleBody = (
  <>
    <h1>Quarterly Report</h1>
    <p>
      This document demonstrates the DocumentPage primitive: a print-ready paper simulation with
      A4/letter sizing, orientation, header, footer, and page numbering.
    </p>
    <p>
      The page surface intentionally stays paper-white in every theme; override the
      <code> --sk-doc-* </code> custom properties for themed document rendering.
    </p>
  </>
);

export const Default: Story = {
  render: () => <DocumentPage>{sampleBody}</DocumentPage>,
};

export const WithHeaderAndFooter: Story = {
  render: () => (
    <DocumentPage
      header={<Text weight="semibold">HyperfocusLabs — Internal</Text>}
      footer={<span>Confidential</span>}
      pageNumber={1}
    >
      {sampleBody}
    </DocumentPage>
  ),
};

export const LetterLandscape: Story = {
  render: () => (
    <DocumentPage size="letter" orientation="landscape" pageNumber={2}>
      {sampleBody}
    </DocumentPage>
  ),
};

export const CustomPadding: Story = {
  render: () => <DocumentPage padding="10mm">{sampleBody}</DocumentPage>,
};
