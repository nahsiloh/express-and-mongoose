const app = require("./app");
const env = app.get("env");

let port;
if (env === "development") {
  port = 5000;
}

app.listen(port, () => console.log(`listening on port ${port}`));
