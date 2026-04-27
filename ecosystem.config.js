module.exports = {
    apps: [
      {
        name: "client-app",
        script: "pnpm", 
        args: "next start ./apps/client --port 3000",
        cwd: "./",
      },
      {
        name: "admin-app",
        script: "pnpm", 
        args: "next start ./apps/admin --port 3001",
        cwd: "./",
      },
      {
        name: "server-app",
        script: "node", 
        args: "-r dotenv/config ./dist/apps/server/src/main.js dotenv_config_path=./apps/server/.env",
        cwd: "./",
      },
    ],

  // Optional: Deploy configuration if you want to use pm2 deploy
  // deploy: {
  //   staging: {
  //     user: "ubuntu",
  //     host: "ec2-65-0-88-30.ap-south-1.compute.amazonaws.com",
  //     ref: "origin/staging",
  //     repo: "your-git-repository-url",
  //     path: "/var/www/staging",
  //     "post-deploy": "pnpm install && pm2 reload ecosystem.config.js --env staging",
  //   },
  //   production: {
  //     user: "ubuntu",
  //     host: "ec2-65-0-88-30.ap-south-1.compute.amazonaws.com", // Update when production host is available
  //     ref: "origin/main",
  //     repo: "your-git-repository-url",
  //     path: "/var/www/production",
  //     "post-deploy": "pnpm install && pm2 reload ecosystem.config.js --env production",
  //   }
  // }
}
  