import {
  Component,
  createSignal,
  createMemo,
  For,
  Show,
  createEffect,
  splitProps,
  JSX,
} from 'solid-js';
import { Portal } from 'solid-js/web';
import { SearchInput } from '../../primitives/SearchInput';
import '@ybouhjira/hyperkit-styles/composites/SessionSearch/SessionSearch.css';

export interface SessionSearchResult {
  sessionId: string;
  sessionName: string;
  messageId?: string;
  messageContent?: string;
  matchType: 'name' | 'content';
}

export interface SessionData {
  id: string;
  name: string;
  messages: Array<{
    id: string;
    content: string;
  }>;
}

export interface SessionSearchProps {
  sessions: SessionData[];
  onSelect: (result: SessionSearchResult) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  emptyMessage?: string;
  debounceMs?: number;
  class?: string;
}

export const SessionSearch: Component<SessionSearchProps> = (props) => {
  const [local] = splitProps(props, [
    'sessions',
    'onSelect',
    'open',
    'onOpenChange',
    'placeholder',
    'emptyMessage',
    'debounceMs',
    'class',
  ]);

  const [query, setQuery] = createSignal('');
  const [debouncedQuery, setDebouncedQuery] = createSignal('');
  const [selectedIndex, setSelectedIndex] = createSignal(0);

  // Debounce the search query
  createEffect(() => {
    const value = query();
    const timeout = setTimeout(() => {
      setDebouncedQuery(value);
    }, local.debounceMs ?? 300);

    return () => clearTimeout(timeout);
  });

  // Search across sessions and messages
  const searchResults = createMemo((): SessionSearchResult[] => {
    const q = debouncedQuery().toLowerCase().trim();

    if (!q) {
      return [];
    }

    const results: SessionSearchResult[] = [];

    local.sessions.forEach((session) => {
      // Search in session name
      if (session.name.toLowerCase().includes(q)) {
        results.push({
          sessionId: session.id,
          sessionName: session.name,
          matchType: 'name',
        });
      }

      // Search in message content
      session.messages.forEach((message) => {
        if (message.content.toLowerCase().includes(q)) {
          results.push({
            sessionId: session.id,
            sessionName: session.name,
            messageId: message.id,
            messageContent: message.content,
            matchType: 'content',
          });
        }
      });
    });

    return results;
  });

  // Reset selection when results change
  createEffect(() => {
    searchResults();
    setSelectedIndex(0);
  });

  // Auto-focus and reset when opened
  createEffect(() => {
    if (local.open) {
      setQuery('');
      setDebouncedQuery('');
      setSelectedIndex(0);
    }
  });

  // Scroll selected item into view
  createEffect(() => {
    const index = selectedIndex();
    const element = document.querySelector(`[data-result-index="${index}"]`);
    if (element) {
      element.scrollIntoView({ block: 'nearest' });
    }
  });

  const handleSelect = (result: SessionSearchResult) => {
    local.onSelect(result);
    local.onOpenChange(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const results = searchResults();

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const result = results[selectedIndex()];
      if (result) {
        handleSelect(result);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      local.onOpenChange(false);
    }
  };

  // Escape regex special characters
  const escapeRegex = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Highlight matching text using JSX instead of innerHTML
  const highlightMatch = (text: string, query: string): JSX.Element => {
    if (!query) return <>{text}</>;

    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        <For each={parts}>
          {(part) => {
            // Check if this part matches the query (case-insensitive)
            if (part.toLowerCase() === query.toLowerCase()) {
              return <mark class="sk-session-search__result-match">{part}</mark>;
            }
            return <>{part}</>;
          }}
        </For>
      </>
    );
  };

  // Get preview text for content matches (show context around match)
  const getPreviewText = (content: string, query: string, maxLength = 100): string => {
    const index = content.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return content.slice(0, maxLength);

    // Show context before and after the match
    const start = Math.max(0, index - 30);
    const end = Math.min(content.length, index + query.length + 70);
    let preview = content.slice(start, end);

    if (start > 0) preview = '...' + preview;
    if (end < content.length) preview = preview + '...';

    return preview;
  };

  return (
    <Show when={local.open}>
      <Portal>
        <div class="sk-session-search__overlay" onClick={() => local.onOpenChange(false)}>
          <div
            class="sk-session-search"
            classList={{ [local.class || '']: !!local.class }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            <div class="sk-session-search__input">
              <SearchInput
                value={query()}
                onChange={setQuery}
                placeholder={local.placeholder ?? 'Search sessions and messages...'}
                autofocus
              />
            </div>
            <div class="sk-session-search__results">
              <Show when={searchResults().length > 0 && debouncedQuery()}>
                <For each={searchResults()}>
                  {(result, index) => (
                    <div
                      class="sk-session-search__result"
                      classList={{
                        'sk-session-search__result--selected': selectedIndex() === index(),
                      }}
                      data-result-index={index()}
                      onMouseEnter={() => setSelectedIndex(index())}
                      onClick={() => handleSelect(result)}
                    >
                      <div class="sk-session-search__result-title">
                        {highlightMatch(result.sessionName, debouncedQuery())}
                      </div>
                      <Show when={result.matchType === 'content' && result.messageContent}>
                        {result.messageContent && (
                          <div class="sk-session-search__result-preview">
                            {highlightMatch(
                              getPreviewText(result.messageContent, debouncedQuery()),
                              debouncedQuery()
                            )}
                          </div>
                        )}
                      </Show>
                    </div>
                  )}
                </For>
              </Show>
              <Show when={searchResults().length === 0 && debouncedQuery()}>
                <div class="sk-session-search__empty">
                  {local.emptyMessage ?? 'No sessions or messages found'}
                </div>
              </Show>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
};
