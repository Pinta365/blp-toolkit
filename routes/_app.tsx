import { define } from "../utils.ts";

export default define.page(function App({ Component }) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>blp-toolkit</title>
      </head>
      <body class="bg-gray-100">
        <Component />
      </body>
    </html>
  );
});
