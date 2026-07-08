import type { Meta, StoryObj } from 'storybook-solidjs';
import { Show } from 'solid-js';
import { UserProvider, useUser, type UserStorage } from './UserProvider';
import type { User } from '../../effects/UserService';
import { Flex } from '../../primitives/Flex';
import { Text } from '../../primitives/Text';

const meta: Meta<typeof UserProvider> = {
  title: 'Composites/UserProvider',
  component: UserProvider,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UserProvider>;

const DEMO_USER: User = {
  id: 'u1',
  email: 'youssef@example.com',
  name: 'Youssef',
  role: 'developer',
  products: ['hyperbuild', 'vanguardpdf'],
  createdAt: new Date('2026-01-15T09:00:00Z'),
};

/** In-memory storage pre-seeded with a logged-in user. */
function demoStorage(): UserStorage {
  let current: User | null = DEMO_USER;
  return {
    getCurrentUser: () => Promise.resolve(current),
    register: (email, name) => Promise.resolve({ ...DEMO_USER, email, name }),
    login: (email) => Promise.resolve({ ...DEMO_USER, email }),
    logout: () => {
      current = null;
      return Promise.resolve();
    },
  };
}

/** Context provider — the demo renders a consumer showing the session. */
const WhoAmI = () => {
  const { user } = useUser();
  return (
    <Show when={user()} fallback={<Text>Signed out.</Text>}>
      {(u) => (
        <Flex gap="sm" align="center">
          <Text weight="semibold">{u().name}</Text>
          <Text>({u().email})</Text>
          <Text font="mono">{u().role}</Text>
        </Flex>
      )}
    </Show>
  );
};

export const WithSignedInUser: Story = {
  render: () => (
    <UserProvider storage={demoStorage()}>
      <WhoAmI />
    </UserProvider>
  ),
};
