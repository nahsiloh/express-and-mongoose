const app = require("./app");
const env = app.get("env");

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`listening on port ${port} in ${env} mode`));
