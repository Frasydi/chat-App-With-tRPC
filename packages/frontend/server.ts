import express from "express"
import proxy from "http-proxy-middleware"


const app = express();

app.use(express.static('./dist'));

app.use('/api', proxy.createProxyMiddleware({ target: 'http://localhost:8000', changeOrigin: true }));

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
    res.sendFile('index.html', { root: './dist' });
});

const port = process.env.PORT || 5173;

app.listen(port)


console.log('App is listening on port ' + port);