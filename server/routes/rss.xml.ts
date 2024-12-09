// server/routes/rss.ts
import { defineEventHandler } from "h3";
import { format } from "date-fns";

const siteURL = "https://ejfox.photos";
const siteName = "EJ Fox Photos";
const siteDescription = "Photography by EJ Fox";

// Escape special XML characters to prevent malformed RSS
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

export default defineEventHandler(async (event) => {
  try {
    const photos = await $fetch("/api/cloudinary", {
      method: "POST",
      body: JSON.stringify({
        numPhotos: 24,
        onlyPhotoblog: true,
      }),
    });

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>${siteName}</title>
  <description>${siteDescription}</description>
  <link>${siteURL}</link>
  <atom:link href="${siteURL}/rss.xml" rel="self" type="application/rss+xml" />
  <pubDate>${new Date().toUTCString()}</pubDate>
  ${photos
    .map((photo) => {
      const title = format(new Date(photo.created_at), "yyyy-MM-dd");
      const imageUrl = photo.secure_url;
      const content = `<img src="${imageUrl}" alt="${escapeXml(
        photo.filename
      )}" />`;

      return `<item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(imageUrl)}</link>
      <guid isPermaLink="true">${escapeXml(imageUrl)}</guid>
      <pubDate>${new Date(photo.created_at).toUTCString()}</pubDate>
      <content:encoded><![CDATA[${content}]]></content:encoded>
    </item>`;
    })
    .join("\n  ")}
</channel>
</rss>`;

    event.node.res.setHeader("Content-Type", "application/xml");
    return rss;
  } catch (error) {
    console.error(`Error generating RSS feed:`, error);
    event.node.res.statusCode = 500;
    return '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title><description>Error generating RSS feed</description></channel></rss>';
  }
});
