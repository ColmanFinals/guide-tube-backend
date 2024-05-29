import {Express} from "express";
import swaggerjsdoc from 'swagger-jsdoc';
import {version} from '../../package.json';
import swaggerUi from 'swagger-ui-express';

const swaggerPath = 'swagger';
const options: swaggerjsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: 'Horizon Hub\'s REST API Docs',
            version
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    in: 'header',
                },
            },
        },
    },
    apis: ["./src/routes/*.ts", "./src/models/*.ts"],
};

const swaggerSpec = swaggerjsdoc(options);

const SwaggerDocs = (app: Express, port: number) => {
    app.use(`/${swaggerPath}`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get(`${swaggerPath}.json`, (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });

    console.log(`Swagger available at http://localhost:${port}/${swaggerPath}`);
}

export default SwaggerDocs;