module.exports = {
    apps: [
        {
            name: 'sph audit tool',
            port: '3000',
            exec_mode: 'cluster',
            instances: '1',
            script: './.output/server/index.mjs'
        }
    ]
}