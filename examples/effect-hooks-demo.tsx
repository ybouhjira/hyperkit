import { createSignal } from 'solid-js';
import { Effect, Stream, Schedule } from 'effect';
import { createEffectResource, createEffectStream } from '../src/hooks';

// Demo: Fetch user data with createEffectResource
function UserProfile() {
  const user = createEffectResource(
    () =>
      Effect.tryPromise({
        try: () => fetch('https://api.github.com/users/octocat').then((r) => r.json()),
        catch: (error) => new Error(String(error)),
      }),
    {
      onSuccess: (data) => console.log('User loaded:', data.login),
      onError: (err) => console.error('Failed:', err),
    }
  );

  return (
    <div class="card">
      <h2>GitHub User</h2>
      {user.loading() && <p>Loading...</p>}
      {user.error() && <p class="error">Error: {user.error()!.message}</p>}
      {user.data() && (
        <div>
          <img src={user.data()!.avatar_url} width={100} alt="avatar" />
          <h3>{user.data()!.name}</h3>
          <p>@{user.data()!.login}</p>
        </div>
      )}
      <button onClick={() => user.refetch()}>Reload</button>
    </div>
  );
}

// Demo: Real-time counter stream with createEffectStream
function LiveCounter() {
  const [paused, setPaused] = createSignal(false);

  // Create a stream that emits incrementing numbers every second
  const counter = createEffectStream(
    Stream.fromEffect(Effect.succeed(0)).pipe(
      Stream.concat(
        Stream.fromEffect(Effect.sync(() => Math.random())).pipe(
          Stream.repeatWith(Schedule.spaced('1 second')),
          Stream.scan(0, (acc, _) => acc + 1)
        )
      )
    ),
    {
      onItem: (n) => console.log('Counter:', n),
      onComplete: () => console.log('Counter stopped'),
    }
  );

  return (
    <div class="card">
      <h2>Live Counter Stream</h2>
      <div class="counter">
        <p class="big-number">{counter.latest() ?? 0}</p>
        <p class="label">Current Value</p>
      </div>
      <p>Total values received: {counter.items().length}</p>
      {counter.error() && <p class="error">Error: {counter.error()}</p>}
      <div class="controls">
        {counter.active() ? (
          <button onClick={() => counter.stop()}>Stop Stream</button>
        ) : (
          <p>Stream ended</p>
        )}
      </div>
    </div>
  );
}

// Demo: Combining both hooks
function CombinedDemo() {
  return (
    <div class="app">
      <h1>Effect-SolidJS Hooks Demo</h1>
      <div class="grid">
        <UserProfile />
        <LiveCounter />
      </div>
    </div>
  );
}

export default CombinedDemo;
