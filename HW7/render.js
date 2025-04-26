export function layout(title, content) {
    return `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 50px;
              background: #f9f9f9;
              color: #333;
            }
            h1 {
              color: #444;
            }
            #articles li {
              margin: 20px 0;
              border-bottom: 1px solid #ccc;
              padding-bottom: 10px;
            }
            input[type="text"],
            textarea {
              width: 100%;
              padding: 10px;
              margin: 5px 0;
              border-radius: 4px;
              border: 1px solid #ccc;
            }
          </style>
        </head>
        <body>
          <section>
            ${content}
          </section>
        </body>
      </html>
    `;
  }
  
  export function list(articles) {
    const items = articles.map(article => {
      const date = new Date(article.created_at).toLocaleString();
      return `
        <li>
          <h2>${article.title}</h2>
          <p><em>${date}</em></p>
          <p><a href="/article/${article.id}">Read More</a></p>
        </li>
      `;
    }).join("");
  
    const content = `
      <h1>All Articles</h1>
      <p>Total: ${articles.length}</p>
      <p><a href="/article/new">Write an Article</a></p>
      <ul id="articles">${items}</ul>
    `;
  
    return layout("Articles", content);
  }
  
  export function newArticle() {
    return layout("New Article", `
      <h1>Write a New Article</h1>
      <form action="/article" method="post">
        <p><input type="text" name="title" placeholder="Title" /></p>
        <p><textarea name="body" placeholder="Write your thoughts..."></textarea></p>
        <p><input type="submit" value="Submit" /></p>
      </form>
    `);
  }
  
  export function detail(article) {
    const date = new Date(article.created_at).toLocaleString();
    return layout(article.title, `
      <h1>${article.title}</h1>
      <p><strong>Published:</strong> ${date}</p>
      <pre>${article.body}</pre>
    `);
  }
  