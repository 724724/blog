import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { loadPosts } from "../posts/loadPosts";

export default function PostsPage() {
  const posts = loadPosts();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize = 10;
  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => {
      const title = p.title.toLowerCase();
      const excerpt = (p.excerpt || "").toLowerCase();
      const content = (p.content || "").toLowerCase();
      return title.includes(q) || excerpt.includes(q) || content.includes(q);
    });
  }, [posts, query]);
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visiblePosts = filteredPosts.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        px: 2,
        width: "100%",
        alignSelf: "flex-start",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 720,
        }}
      >
        <Typography variant="h3" sx={{ mb: 1, textAlign: "left" }}>
          <strong>
            Posts
          </strong>
        </Typography>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            value={query}
            onChange={(e) => {
              const next = e.target.value;
              const params = new URLSearchParams(searchParams);
              if (next.trim()) {
                params.set("q", next);
              } else {
                params.delete("q");
              }
              params.set("page", "1");
              setSearchParams(params);
            }}
            placeholder="Search"
            variant="outlined"
            size="medium"
            sx={(theme) => ({
              borderRadius: 3,
              backgroundColor:
                theme.palette.mode === 'light'
                  ? 'rgba(255,255,255,0.6)'
                  : 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid',
              borderColor:
                theme.palette.mode === 'light'
                  ? 'rgba(0,0,0,0.08)'
                  : 'rgba(255,255,255,0.18)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              '& .MuiOutlinedInput-root': {
                color: theme.palette.text.primary,
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
              },
              '& .MuiSvgIcon-root': { color: theme.palette.text.secondary },
              '& input::placeholder': {
                color: theme.palette.text.secondary,
                opacity: 0.8,
              },
            })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {visiblePosts.map((post) => (
            <Card key={post.id} sx={{ borderRadius: 3, overflow: "hidden" }}>
              <CardActionArea component={RouterLink} to={`/posts/${post.slug}`}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "stretch",
                    gap: 0,
                  }}
                >
                  {post.thumbnail ? (
                    <CardMedia
                      component="img"
                      image={post.thumbnail}
                      alt={post.title}
                      sx={{
                        width: { xs: 160, sm: 200 },
                        height: { xs: 120, sm: 150 },
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: { xs: 160, sm: 200 },
                        height: { xs: 120, sm: 150 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'action.hover',
                        color: 'text.secondary',
                        flexShrink: 0,
                        fontWeight: 600,
                        fontSize: { xs: 14, sm: 16 },
                      }}
                    >
                      No Photo
                    </Box>
                  )}
                  <CardContent sx={{ flex: 1, py: 1.25, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h5" gutterBottom noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <strong>{post.title}</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
                      <Chip
                        size="small"
                        label={new Date(post.date).toLocaleDateString()}
                      />
                    </Box>
                  </CardContent>
                </Box>
              </CardActionArea>
            </Card>
          ))}
          {filteredPosts.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
              No posts found. Try a different search.
            </Typography>
          )}
          <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, value) => {
                const params = new URLSearchParams(searchParams);
                params.set("page", String(value));
                setSearchParams(params);
              }}
              color="primary"
              shape="rounded"
              showFirstButton
              showLastButton
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
