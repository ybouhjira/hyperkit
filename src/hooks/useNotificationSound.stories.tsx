import { createSignal, onMount, onCleanup } from 'solid-js';
import { useNotificationSound } from './useNotificationSound';
import { Button } from '../primitives/Button';
import { Stack } from '../primitives/Stack';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export default {
  title: 'Hooks/useNotificationSound',
};

export const Basic = () => {
  const { play, setEnabled, setVolume, enabled, volume } = useNotificationSound();
  const [isTabVisible, setIsTabVisible] = createSignal(!document.hidden);

  const handleVisibilityChange = () => {
    setIsTabVisible(!document.hidden);
  };

  onMount(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  });

  onCleanup(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  });

  const handleForcePlay = () => {
    // Temporarily disable tab visibility check for demo
    if (!enabled()) {
      alert('Sound is disabled. Enable it first!');
      return;
    }

    // Create a test sound that ignores tab visibility
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 880; // A5 note
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume(), audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);

      oscillator.onended = () => {
        void audioContext.close();
      };
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  };

  return (
    <Box p="lg">
      <Stack gap="lg">
        <Box>
          <Text size="2xl" weight="bold" mb="sm">
            Notification Sound Hook
          </Text>
          <Text color="muted">
            Web Audio API-based notification sound that plays only when the tab is inactive.
          </Text>
        </Box>

        <Box p="md" bg="surface" radius="md">
          <Stack gap="md">
            <Box>
              <Text weight="bold" mb="xs">
                Tab Status
              </Text>
              <Badge variant={isTabVisible() ? 'success' : 'warning'}>
                {isTabVisible() ? 'Tab Visible' : 'Tab Hidden'}
              </Badge>
              <Text size="sm" color="muted" style={{ 'margin-top': '8px' }}>
                {isTabVisible()
                  ? 'Sound will NOT play when tab is visible. Switch to another tab and come back to test.'
                  : 'Sound will play when triggered.'}
              </Text>
            </Box>

            <Box>
              <Text weight="bold" mb="xs">
                Sound Status
              </Text>
              <Badge variant={enabled() ? 'success' : 'default'}>
                {enabled() ? 'Enabled' : 'Disabled'}
              </Badge>
            </Box>

            <Box>
              <Text weight="bold" mb="sm">
                Volume: {Math.round(volume() * 100)}%
              </Text>
              <input
                type="range"
                min="0"
                max="100"
                value={volume() * 100}
                onInput={(e) => setVolume(Number(e.currentTarget.value) / 100)}
                style={{
                  width: '100%',
                  height: '6px',
                  'border-radius': '3px',
                  outline: 'none',
                }}
              />
            </Box>

            <Stack direction="row" gap="sm">
              <Button onClick={() => setEnabled(!enabled())} variant="outline">
                {enabled() ? 'Disable' : 'Enable'} Sound
              </Button>
              <Button onClick={play} variant="primary">
                Play (Only When Tab Hidden)
              </Button>
              <Button onClick={handleForcePlay} variant="secondary">
                Force Play (Demo)
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Box p="md" bg="surface" radius="md">
          <Text weight="bold" mb="sm">
            How to Test
          </Text>
          <Stack gap="xs">
            <Text size="sm">1. Enable the sound using the toggle</Text>
            <Text size="sm">2. Click "Play (Only When Tab Hidden)"</Text>
            <Text size="sm">3. Switch to another browser tab immediately</Text>
            <Text size="sm">4. You should hear a beep sound (880Hz A5 note)</Text>
            <Text size="sm" color="muted" style={{ 'margin-top': '8px' }}>
              Or use "Force Play (Demo)" to hear the sound immediately without switching tabs.
            </Text>
          </Stack>
        </Box>

        <Box p="md" bg="surface" radius="md">
          <Text weight="bold" mb="sm">
            Configuration
          </Text>
          <Stack gap="xs">
            <Text size="sm">
              <strong>Frequency:</strong> 880Hz (A5 note)
            </Text>
            <Text size="sm">
              <strong>Duration:</strong> 150ms
            </Text>
            <Text size="sm">
              <strong>Wave Type:</strong> Sine
            </Text>
            <Text size="sm">
              <strong>Volume:</strong> Adjustable (0-100%)
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export const CustomFrequency = () => {
  const [frequency, setFrequency] = createSignal(880);
  const [isPlaying, setIsPlaying] = createSignal(false);

  const playCustomSound = () => {
    if (isPlaying()) return;

    setIsPlaying(true);

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency();
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);

      oscillator.onended = () => {
        void audioContext.close();
        setIsPlaying(false);
      };
    } catch (error) {
      console.error('Failed to play notification sound:', error);
      setIsPlaying(false);
    }
  };

  return (
    <Box p="lg">
      <Stack gap="lg">
        <Box>
          <Text size="2xl" weight="bold" mb="sm">
            Custom Frequency Demo
          </Text>
          <Text color="muted">Adjust the frequency to hear different notification tones.</Text>
        </Box>

        <Box p="md" bg="surface" radius="md">
          <Stack gap="md">
            <Box>
              <Text weight="bold" mb="sm">
                Frequency: {frequency()}Hz
              </Text>
              <input
                type="range"
                min="200"
                max="2000"
                step="50"
                value={frequency()}
                onInput={(e) => setFrequency(Number(e.currentTarget.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  'border-radius': '3px',
                  outline: 'none',
                }}
              />
              <Stack direction="row" gap="sm" style={{ 'margin-top': '8px' }}>
                <Text size="sm" color="muted">
                  200Hz (Low)
                </Text>
                <Text size="sm" color="muted" style={{ 'margin-left': 'auto' }}>
                  2000Hz (High)
                </Text>
              </Stack>
            </Box>

            <Box>
              <Button onClick={playCustomSound} disabled={isPlaying()} variant="primary">
                {isPlaying() ? 'Playing...' : 'Play Sound'}
              </Button>
            </Box>

            <Box>
              <Text weight="bold" mb="sm">
                Common Notes
              </Text>
              <Stack gap="xs">
                <Button
                  onClick={() => {
                    setFrequency(440);
                    playCustomSound();
                  }}
                  variant="outline"
                  size="sm"
                >
                  A4 (440Hz)
                </Button>
                <Button
                  onClick={() => {
                    setFrequency(880);
                    playCustomSound();
                  }}
                  variant="outline"
                  size="sm"
                >
                  A5 (880Hz) - Default
                </Button>
                <Button
                  onClick={() => {
                    setFrequency(1046);
                    playCustomSound();
                  }}
                  variant="outline"
                  size="sm"
                >
                  C6 (1046Hz)
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};
