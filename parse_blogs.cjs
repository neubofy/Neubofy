const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'public', 'blog');
const oldIndex = require(path.join(__dirname, 'public', 'blog_index.json'));

const files = oldIndex.blogPosts || [];
const blogs = [];

files.forEach(file => {
  const filePath = path.join(blogDir, file);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      blogs.push({
        id: data.id || Date.now() + Math.random(),
        slug: data.slug || file.replace('.json', ''),
        title: data.name || data.title || 'Untitled',
        excerpt: data.shortDescription || data.excerpt || '',
        author: data.author || 'Neubofy Team',
        date: data.publishedAt || data.date || new Date().toISOString(),
        readTime: data.readTime || '5 min read',
        tags: data.tags || [],
        thumbnail: data.thumbnailUrl || data.thumbnail || '/placeholder.svg',
        featured: !!data.featured,
        category: data.category || 'Uncategorized'
      });
    } catch (e) {
      console.error('Error parsing', file, e);
    }
  }
});

fs.writeFileSync(path.join(__dirname, 'public', 'blog.json'), JSON.stringify(blogs, null, 2));
fs.unlinkSync(path.join(__dirname, 'public', 'blog_index.json'));
console.log('Blog JSON restructured successfully.');
