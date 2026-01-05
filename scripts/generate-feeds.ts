import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadPosts } from './load-posts.js';
import { generateRss } from './feed-generators/rss.js';
import { generateAtom } from './feed-generators/atom.js';
import type { FeedConfig } from './feed-generators/shared.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    console.log('Generating RSS and Atom feeds...');

    // Load posts (exclude drafts, limit to 22 most recent)
    const posts = loadPosts(false, 22);
    console.log(`Loaded ${posts.length} posts`);

    // Check if dist/ directory exists
    const distDir = path.join(__dirname, '../dist');
    if (!fs.existsSync(distDir)) {
      console.error('Error: dist/ directory does not exist. Run `pnpm build` first.');
      process.exit(1);
    }

    // Feed configuration
    const baseConfig = {
      title: 'Mert Yaşin',
      description: 'Personal blog',
      siteUrl: 'https://mertyas.in',
      author: {
        name: 'Mert Yaşin',
      },
    };

    // Generate RSS feed
    const rssConfig: FeedConfig = {
      ...baseConfig,
      feedUrl: 'https://mertyas.in/rss.xml',
    };
    const rssXml = generateRss(posts, rssConfig);
    const rssPath = path.join(distDir, 'rss.xml');
    fs.writeFileSync(rssPath, rssXml, 'utf-8');
    console.log(`✓ RSS feed generated: ${rssPath}`);

    // Generate Atom feed
    const atomConfig: FeedConfig = {
      ...baseConfig,
      feedUrl: 'https://mertyas.in/atom.xml',
    };
    const atomXml = generateAtom(posts, atomConfig);
    const atomPath = path.join(distDir, 'atom.xml');
    fs.writeFileSync(atomPath, atomXml, 'utf-8');
    console.log(`✓ Atom feed generated: ${atomPath}`);

    console.log('Feed generation complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error generating feeds:', error);
    process.exit(1);
  }
}

main();
