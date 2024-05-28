// server/routes/rss.ts
import RSS from "rss";
// import { serverQueryContent } from "#content/server";
import axios from "axios";
// import date formatting from date-fns
import { format } from "date-fns";

// make a nice date format for the rss feed photo titles
const formatDate = (date: string) => {
  return format(new Date(date), "yyyy-MM-dd");
};

export default defineEventHandler(async (event) => {
  // wrap everything in a try catch block
  try {
    const data = await $fetch("/api/cloudinary", {
      method: "POST",
      body: JSON.stringify({
        numPhotos: 24,
        onlyPhotoblog: true,
      }),
    });

    /*

    console.log(data[0]);

    { href:
    'https://res.cloudinary.com/ejf/image/upload/v1716595139/m7pkkinhixca9ra1hbdd.jpg',
    public_id: 'm7pkkinhixca9ra1hbdd',
    uploaded_at: '2024-05-24T23:58:59+00:00',
    asset_id: 'dd6ce4c91eb661af556d518aaf005c1a',
    folder: '',
    filename: 'm7pkkinhixca9ra1hbdd',
    format: 'jpg',
    version: 1716595139,
    resource_type: 'image',
    type: 'upload',
    created_at: '2024-05-24T23:58:59+00:00',
    bytes: 1216600,
    backup_bytes: 1216600,
    width: 1365,
    height: 2048,
    aspect_ratio: 0.6665,
    pixels: 2795520,
    tags: [ 'photo-blog' ],
    url:
    'http://res.cloudinary.com/ejf/image/upload/v1716595139/m7pkkinhixca9ra1hbdd.jpg',
    secure_url:
    'https://res.cloudinary.com/ejf/image/upload/v1716595139/m7pkkinhixca9ra1hbdd.jpg',
    status: 'active',
    access_mode: 'public',
    access_control: null,
    etag: '43d3769619d7eb653b2ebdec00ac3973',
    created_by: { access_key: '772121974764543' },
    uploaded_by: { access_key: '772121974764543' } }
    */

    // create new rss feed this will be our channel tag with website title and url
    const feed = new RSS({
      title: "EJ Fox",
      site_url: "https://ejfox.photos", // link to your website/blog
      feed_url: `https://ejfox.photos/rss.xml`, // path to your rss feed
    });

    // loop over each posts
    for (const post of data) {
      // console.log({ post });

      feed.item({
        // title: post.title, // title from post to item title
        title: formatDate(post.created_at), // title from post to item title
        // url: `https://ejfox.com${post._path}`, // full path to where our article is hosted
        url: post.secure_url,
        //description: '', // dev.to APIs doesn't return a description, if you have one you can add it here
        // description: post.readingTime.text + ' ' + post.description, // description from post to item description
        // description: `${post.readingTime.text} – ${post.description}`,
        // just make an HTML image tag with the src as the image url
        description: `<img src="${post.secure_url}" alt="${post.filename}" />`,
        // we should actually fill the description with the entire article
        // description: post.content, // content from post to item description
        date: post.created_at, // date post was created
        // categories: post?.tags.join(", "), // list of tags
      });
    }
    const feedString = feed.xml({ indent: true }); //This returns the XML as a string.

    event.node.res.setHeader("content-type", "text/xml"); // we need to tell nitro to return this as a xml file
    event.node.res.end(feedString); // send the HTTP response
  } catch (e) {
    // return an error
    return e;
  }
});
