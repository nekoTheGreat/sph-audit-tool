module.exports = {
    apps: [
        {
            name: 'sph audit tool',
            port: '3001',
            exec_mode: 'cluster',
            instances: '1',
            script: 'node',
            args: "./dist/main.js"
        }
    ]
}
