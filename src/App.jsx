import { useQuery } from "@tanstack/react-query";

function fetchPosts() {
  return fetch("https://jsonplaceholder.typicode.com/posts?_limit=8").then(
    (res) => {
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    }
  );
}

function formatTime(ms) {
  if (!ms) return "—";
  const d = new Date(ms);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function PostsDashboard() {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    staleTime: 60_000, // 60s: treat data as fresh
    cacheTime: 300_000, // 5m: keep inactive cache
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar__inner">
          <div>
            <h1 className="title">Posts Dashboard</h1>
            <p className="subtitle">
              Background refetching demo: data stays visible while React Query
              refreshes in the background.
            </p>
          </div>

          <div className="actions">
            <div className="meta">
              <span className="meta__label">Last updated</span>
              <span className="meta__value">{formatTime(dataUpdatedAt)}</span>
            </div>

            <button
              className="btn"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {isLoading && (
          <div className="state">
            <div className="spinner" />
            <p>Loading posts…</p>
          </div>
        )}

        {isError && (
          <div className="state state--error">
            <p className="state__title">Could not load posts</p>
            <p className="state__msg">{error?.message || "Unknown error"}</p>
            <button className="btn" onClick={() => refetch()}>
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="toolbar">
              <div className="pill">
                <span
                  className={`dot ${isFetching ? "dot--live" : "dot--idle"}`}
                />
                <span className="pill__text">
                  {isFetching ? "Refreshing in background" : "Up to date"}
                </span>
              </div>

              <p className="hint">
                Tip: switch tabs/windows and come back after <b>60s</b> — it
                will refetch on focus without clearing the list.
              </p>
            </div>

            <section className="grid">
              {data.map((post) => (
                <article key={post.id} className="card">
                  <div className="card__top">
                    <span className="badge">Post #{post.id}</span>
                    <span className="small">
                      {isFetching ? "syncing…" : "ready"}
                    </span>
                  </div>
                  <h3 className="card__title">{post.title}</h3>
                  <p className="card__body">{post.body}</p>
                </article>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
