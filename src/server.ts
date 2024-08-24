import initApp from "./app";
import fs from 'fs'
import https, { Server as HttpsServer } from 'https';
import http, { Server as HttpServer } from 'http';
import SwaggerDocs from "./utils/swagger";

initApp().then((app) => {
  const PORT = parseInt(process.env.PORT) || 3001;
  let server: HttpServer | HttpsServer;
  SwaggerDocs(app, PORT);

  if (process.env.NODE_ENV !== 'production') {
    console.log('development');
    server = http.createServer(app).listen(PORT, () => {
      console.log(`HTTP Server is running on port ${PORT}`);
    });
    } else {
      console.log('PRODUCTION');
      const options2 = {
        key: fs.readFileSync('/cert/server.key'),
        cert: fs.readFileSync('/cert/server.crt')
      };
    server = https.createServer(options2, app).listen(PORT, () => {
      console.log(`HTTPS Server is running on port ${PORT}`);
    });
  }
});