const fs = require('fs');
const path = require('path');

const projectDir = path.join(__dirname, 'public', 'project');
const oldIndex = require(path.join(__dirname, 'public', 'project.json'));

const files = oldIndex.files || [];
const projects = [];

files.forEach(file => {
  const filePath = path.join(projectDir, file);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      projects.push({
        slug: data.slug || file.replace('.json', ''),
        name: data.name,
        shortDescription: data.shortDescription,
        thumbnailUrl: data.thumbnailUrl,
        category: data.category,
        tags: data.tags,
        publishedAt: data.publishedAt
      });
    } catch (e) {
      console.error('Error parsing', file, e);
    }
  }
});

fs.writeFileSync(path.join(__dirname, 'public', 'project.json'), JSON.stringify(projects, null, 2));
console.log('Project JSON restructured successfully.');
