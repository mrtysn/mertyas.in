const statusEl = document.getElementById('status');

function setStatus(msg) {
  statusEl.textContent = msg;
}

// Export: read full bookmark tree and save as JSON
document.getElementById('export-btn').addEventListener('click', async () => {
  setStatus('Exporting...');
  try {
    const tree = await browser.bookmarks.getTree();
    const json = JSON.stringify(tree[0], null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    await browser.downloads.download({
      url,
      filename: 'firefox-bookmarks-export.json',
      saveAs: true,
    });

    setStatus('Export complete.');
  } catch (err) {
    setStatus('Export failed: ' + err.message);
  }
});

// Import: read JSON file and create bookmarks
document.getElementById('import-btn').addEventListener('click', () => {
  document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setStatus('Reading file...');
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Expect Firefox JSON format with typeCode
    let created = 0;

    async function importNode(node, parentId) {
      if (node.typeCode === 2 && node.children) {
        // Folder
        const folder = await browser.bookmarks.create({
          parentId,
          title: node.title || 'Imported',
        });
        for (const child of node.children) {
          await importNode(child, folder.id);
        }
      } else if (node.typeCode === 1 && node.uri) {
        // Bookmark
        await browser.bookmarks.create({
          parentId,
          title: node.title || '',
          url: node.uri,
        });
        created++;
      }
    }

    // Import under "Other Bookmarks"
    const tree = await browser.bookmarks.getTree();
    const unfiledFolder = tree[0].children.find(c => c.id === 'unfiled_____') ||
                          tree[0].children[tree[0].children.length - 1];

    if (data.children) {
      for (const child of data.children) {
        await importNode(child, unfiledFolder.id);
      }
    }

    setStatus(`Imported ${created} bookmarks.`);
  } catch (err) {
    setStatus('Import failed: ' + err.message);
  }
});
