<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
<xsl:template match="/">
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>RSS Feed | <xsl:value-of select="/rss/channel/title"/></title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&amp;family=Work+Sans:wght@400;500;600;700&amp;display=swap"/>
<style>
  *{box-sizing:border-box}
  body{margin:0;font-family:"Work Sans",system-ui,sans-serif;color:#32312E;background:#F8F7F5;-webkit-font-smoothing:antialiased}
  h1,h2{font-family:"Libre Baskerville",Georgia,serif;color:#013121;font-weight:700;line-height:1.2}
  a{color:#1C6E42;text-decoration:none}
  a:hover{color:#498B68;text-decoration:underline}
  .header{background:#fff;border-bottom:1px solid rgba(150,143,142,0.2);padding:1.5rem 1.25rem}
  .header-inner{max-width:720px;margin:0 auto;display:flex;align-items:center;gap:0.75rem}
  .header img{width:40px;height:40px}
  .header-title{font-family:"Libre Baskerville",Georgia,serif;font-weight:700;font-size:1.125rem;color:#013121}
  .container{max-width:720px;margin:0 auto;padding:2.5rem 1.25rem 4rem}
  .banner{background:rgba(132,194,161,0.2);border:1px solid #84C2A1;border-radius:8px;padding:1rem 1.25rem;margin-bottom:2.5rem;font-size:0.95rem}
  .banner strong{color:#013121}
  .feed-title{font-size:2rem;margin:0 0 0.5rem}
  .feed-description{color:rgba(50,49,46,0.8);font-size:1.05rem;margin:0 0 2.5rem}
  .post{border-bottom:1px solid rgba(150,143,142,0.2);padding:1.5rem 0}
  .post:last-child{border-bottom:none}
  .post-date{font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em;color:#498B68;margin:0 0 0.5rem}
  .post-title{font-size:1.4rem;margin:0 0 0.5rem}
  .post-title a{color:#013121}
  .post-title a:hover{color:#1C6E42}
  .post-description{color:rgba(50,49,46,0.8);margin:0}
  @media(max-width:480px){.feed-title{font-size:1.5rem}.post-title{font-size:1.15rem}}
</style>
</head>
<body>
<header class="header">
  <div class="header-inner">
    <img src="/logos/emblem-dark-green.svg" alt=""/>
    <span class="header-title">Productized Coach</span>
  </div>
</header>
<div class="container">
  <div class="banner">
    <strong>This is an RSS feed.</strong> Subscribe by pasting this page's URL into a feed reader like Feedly, Inoreader, or Apple News &#8212; new posts will arrive automatically.
    Or just <a href="/">read the blog directly</a>.
  </div>
  <h1 class="feed-title"><xsl:value-of select="/rss/channel/title"/></h1>
  <p class="feed-description"><xsl:value-of select="/rss/channel/description"/></p>
  <xsl:for-each select="/rss/channel/item">
    <article class="post">
      <p class="post-date"><xsl:value-of select="pubDate"/></p>
      <h2 class="post-title">
        <a href="{link}"><xsl:value-of select="title"/></a>
      </h2>
      <p class="post-description"><xsl:value-of select="description"/></p>
    </article>
  </xsl:for-each>
</div>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
