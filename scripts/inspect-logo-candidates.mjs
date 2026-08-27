const urls = process.argv.slice(2);

for (const url of urls) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0 sponsor-research' },
    redirect: 'follow',
  });
  const html = await response.text();
  console.log(`\nURL ${url} -> ${response.url} ${response.status}`);

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    if (/logo|brand|header|Logotype/i.test(tag)) {
      console.log(tag.slice(0, 700));
    }
  }

  for (const match of html.matchAll(/<meta[^>]+(?:property|name)=["']([^"']+)["'][^>]+content=["']([^"']+)["'][^>]*>/gi)) {
    if (match[1].toLowerCase().includes('image')) {
      console.log(`META ${match[1]} ${match[2]}`);
    }
  }

  for (const match of html.matchAll(/<link[^>]+rel=["']([^"']+)["'][^>]+href=["']([^"']+)["'][^>]*>/gi)) {
    if (match[1].toLowerCase().includes('icon')) {
      console.log(`LINK ${match[1]} ${match[2]}`);
    }
  }
}
