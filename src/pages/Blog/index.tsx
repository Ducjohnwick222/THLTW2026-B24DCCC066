import React, { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  thumbnail: string;
  tags: string[];
  author: string;
  date: string;
  views: number;
  status: "draft" | "published";
}

const PAGE_SIZE = 9;

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px",
  borderBottom: "1px solid #f0f0f0",
};

const tdStyle: React.CSSProperties = {
  padding: "10px",
  borderBottom: "1px solid #f0f0f0",
};

export default function BlogApp() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [view, setView] = useState<"home" | "detail" | "manage" | "about">("home");
  const [current, setCurrent] = useState<Post | null>(null);

  const [search, setSearch] = useState("");
  const [debounce, setDebounce] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [form, setForm] = useState<Post>({
    id: 0,
    title: "",
    slug: "",
    content: "",
    thumbnail: "",
    tags: [],
    author: "Admin",
    date: "",
    views: 0,
    status: "draft",
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounce(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(debounce.toLowerCase());
      const matchTag = tagFilter ? p.tags.includes(tagFilter) : true;
      return matchSearch && matchTag && p.status === "published";
    });
  }, [posts, debounce, tagFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)));

  const related = useMemo(() => {
    if (!current) return [];
    return posts.filter(
      (p) => p.id !== current.id && p.tags.some((t) => current.tags.includes(t))
    );
  }, [current, posts]);

  const handleSubmit = () => {
    if (!form.title) return alert("Nhập tiêu đề");

    if (editingId) {
      setPosts(posts.map((p) => (p.id === editingId ? { ...form } : p)));
      setEditingId(null);
    } else {
      setPosts([
        {
          ...form,
          id: Date.now(),
          date: new Date().toISOString().split("T")[0],
          views: 0,
        },
        ...posts,
      ]);
    }

    setForm({
      id: 0,
      title: "",
      slug: "",
      content: "",
      thumbnail: "",
      tags: [],
      author: "Admin",
      date: "",
      views: 0,
      status: "draft",
    });
  };

  const editPost = (p: Post) => {
    setForm(p);
    setEditingId(p.id);
  };

  const deletePost = (id: number) => {
    if (window.confirm("Xóa bài viết?")) {
      setPosts(posts.filter((p) => p.id !== id));
    }
  };

  const openDetail = (p: Post) => {
    p.views += 1;
    setCurrent({ ...p });
    setView("detail");
  };

  if (view === "detail" && current) {
    return (
      <div className="p-4">
        <button onClick={() => setView("home")}>⬅ Back</button>
        <h1>{current.title}</h1>
        <p>{current.author} - {current.date} - 👁 {current.views}</p>
        <ReactMarkdown>{current.content}</ReactMarkdown>
        <div>
          {current.tags.map((t) => (
            <span key={t}>#{t} </span>
          ))}
        </div>
        <h3>Related</h3>
        {related.map((r) => (
          <div key={r.id} style={{ cursor: "pointer" }} onClick={() => openDetail(r)}>
            {r.title}
          </div>
        ))}
      </div>
    );
  }

  if (view === "about") {
    return (
      <div className="p-4">
        <button onClick={() => setView("home")}>⬅</button>
        <h1>About</h1>
        <p>Tác giả: Admin</p>
      </div>
    );
  }

  if (view === "manage") {
    return (
      <div className="p-4">
        <button onClick={() => setView("home")}>⬅</button>
        <h1>Manage</h1>

        <div style={{ border: "1px solid #f0f0f0", borderRadius: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#fafafa" }}>
              <tr>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Tags</th>
                <th style={thStyle}>Views</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td style={tdStyle}>{p.title}</td>
                  <td style={tdStyle}>{p.status}</td>
                  <td style={tdStyle}>{p.tags.join(", ")}</td>
                  <td style={tdStyle}>{p.views}</td>
                  <td style={tdStyle}>
                    <button onClick={() => editPost(p)}>Edit</button>
                    <button onClick={() => deletePost(p.id)} style={{ marginLeft: 8 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 style={{ marginTop: 20 }}>{editingId ? "Edit" : "Add"}</h3>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <textarea placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        <input placeholder="Thumbnail" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} />
        <input placeholder="Tags a,b" onChange={(e) => setForm({ ...form, tags: e.target.value.split(",") })} />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <button onClick={handleSubmit}>Save</button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1>Blog</h1>
      <button onClick={() => setView("about")}>About</button>
      <button onClick={() => setView("manage")}>Manage</button>

      <input placeholder="Search" onChange={(e) => setSearch(e.target.value)} />

      <div>
        {allTags.map((t) => (
          <button key={t} onClick={() => setTagFilter(t)}>
            #{t}
          </button>
        ))}
        <button onClick={() => setTagFilter(null)}>All</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {paginated.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ccc", cursor: "pointer" }} onClick={() => openDetail(p)}>
            <img src={p.thumbnail} width="100%" />
            <h3>{p.title}</h3>
            <p>{p.date}</p>
          </div>
        ))}
      </div>

      <div>
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i} onClick={() => setPage(i + 1)}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
