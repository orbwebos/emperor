module.exports = {
  apps: [{
    name: 'Emperor',
    script: './dist/index.js',
    watch: './dist',
    node_args: '-r dotenv/config',
    args: ['dotenv_config_path=config/.env'],
  }],

  deploy: {
    production: {
      user: 'SSH_USERNAME',
      host: 'SSH_HOSTMACHINE',
      ref: 'origin/master',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};
