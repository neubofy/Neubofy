This folder contains blog post JSON files. Add a new `.json` file here and it will automatically be picked up by the Blog page.


Required fields (example):

{
  "slug": "my-post-slug",
  "name": "Post Title",
  "shortDescription": "Short summary used on listing cards",
  "detailDescription": "Full article text (deprecated) — prefer using the `content` blocks below",
  "thumbnailUrl": "/src/assets/some-thumb.jpg",
  "imageUrls": ["/src/assets/image1.jpg", "/src/assets/image2.jpg"],
  "publishedAt": "2025-01-01",
  "tags": ["tag1", "tag2"],
  "author": "Author Name",
  "readTime": "5 min read",
  "category": "Category Name",
  "featured": true
}

Inline image support (preferred)
- To embed images at specific places inside your article, use the `content` array instead of a plain `detailDescription` string.
- `content` is an ordered array of blocks. Supported block types:
  - { "type": "paragraph", "text": "..." }
  - { "type": "image", "src": "/path/to/image.jpg", "caption": "Optional caption" }

Example:

[
  { "type": "paragraph", "text": "Intro paragraph..." },
  { "type": "image", "src": "/src/assets/figure1.jpg", "caption": "Figure 1" },
  { "type": "paragraph", "text": "More text after the image." }
]

Notes:
- Place images under `src/assets/` or use an external URL. When bundling with Vite, using `src`-prefixed paths (like `/src/assets/...`) works in dev and build.
- Listing thumbnails are displayed with a 4:5 aspect ratio (the listing uses `thumbnailUrl`).
- The detail page supports `content` blocks and will render images inline at the specified positions.
- The `slug` must be unique and will be used at `/blog/:slug`.
