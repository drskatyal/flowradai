#!/bin/bash

# Deployment optimization script
# This script can be used to further optimize your deployment process

set -e

echo "🚀 Starting deployment optimization..."

# Function to check and install rsync if not available
setup_rsync() {
    if ! command -v rsync &> /dev/null; then
        echo "📦 Installing rsync for faster file transfers..."
        case "$(uname -s)" in
            Linux*)
                if command -v apt-get &> /dev/null; then
                    sudo apt-get update && sudo apt-get install -y rsync
                elif command -v yum &> /dev/null; then
                    sudo yum install -y rsync
                fi
                ;;
            Darwin*)
                if command -v brew &> /dev/null; then
                    brew install rsync
                fi
                ;;
        esac
    fi
}

# Function to optimize SSH settings for deployment
optimize_ssh_config() {
    local host=$1
    echo "🔧 Optimizing SSH configuration for $host..."
    
    # Create optimized SSH config
    cat >> ~/.ssh/config << EOF

# Optimized settings for deployment to $host
Host $host
    Compression yes
    CompressionLevel 6
    TCPKeepAlive yes
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ControlMaster auto
    ControlPath ~/.ssh/control-%h-%p-%r
    ControlPersist 10m
    # Use faster cipher for better performance
    Ciphers aes128-ctr,aes192-ctr,aes256-ctr
    # Disable unnecessary features for deployment
    GSSAPIAuthentication no
    HashKnownHosts no
    UserKnownHostsFile /dev/null
    StrictHostKeyChecking no

EOF
}

# Function to create deployment verification script
create_health_check() {
    cat > health-check.sh << 'EOF'
#!/bin/bash
# Health check script for deployment verification

HEALTH_ENDPOINT=${1:-"http://localhost:3000/api/health"}
MAX_RETRIES=${2:-30}
RETRY_INTERVAL=${3:-2}

echo "🏥 Starting health check for $HEALTH_ENDPOINT"

for i in $(seq 1 $MAX_RETRIES); do
    if curl -f -s "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
        echo "✅ Health check passed (attempt $i/$MAX_RETRIES)"
        exit 0
    else
        echo "⏳ Health check failed, retrying in ${RETRY_INTERVAL}s (attempt $i/$MAX_RETRIES)"
        sleep $RETRY_INTERVAL
    fi
done

echo "❌ Health check failed after $MAX_RETRIES attempts"
exit 1
EOF

    chmod +x health-check.sh
}

# Function to optimize package.json for deployment
optimize_package_json() {
    echo "📦 Optimizing package.json for production deployment..."
    
    # Create optimized package.json for deployment
    node -e "
        const pkg = require('./package.json');
        const deployPkg = {
            name: pkg.name,
            version: pkg.version,
            scripts: {
                start: pkg.scripts.start,
                'start:prod': pkg.scripts['start:prod'] || pkg.scripts.start
            },
            dependencies: pkg.dependencies,
            engines: pkg.engines
        };
        require('fs').writeFileSync('./package.deploy.json', JSON.stringify(deployPkg, null, 2));
        console.log('✅ Created optimized package.deploy.json');
    "
}

# Function to create deployment rollback script
create_rollback_script() {
    cat > rollback.sh << 'EOF'
#!/bin/bash
# Rollback script for failed deployments

DEPLOY_PATH=${1:-"/var/www/app"}
HOST=${2:-"localhost"}

echo "🔄 Starting rollback process..."

# Find the most recent backup
LATEST_BACKUP=$(ssh ubuntu@$HOST "ls -1t $DEPLOY_PATH/backup_* 2>/dev/null | head -1")

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backup found for rollback"
    exit 1
fi

echo "📂 Rolling back to: $LATEST_BACKUP"

# Perform rollback
ssh ubuntu@$HOST "
    cd $DEPLOY_PATH && \
    rm -rf current && \
    cp -r $LATEST_BACKUP current && \
    cd current && \
    source ~/.bashrc && \
    source ~/.profile && \
    export NVM_DIR=\"\$HOME/.nvm\" && \
    [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\" && \
    pm2 reload ecosystem.config.js --update-env
"

echo "✅ Rollback completed successfully"
EOF

    chmod +x rollback.sh
}

# Main execution
main() {
    echo "🎯 Setting up deployment optimizations..."
    
    setup_rsync
    create_health_check
    optimize_package_json
    create_rollback_script
    
    echo "✅ Deployment optimization setup completed!"
    echo ""
    echo "📋 Files created:"
    echo "   - health-check.sh: For deployment verification"
    echo "   - rollback.sh: For quick rollbacks"
    echo "   - package.deploy.json: Optimized package.json"
    echo ""
    echo "💡 Usage tips:"
    echo "   - Use ./health-check.sh <endpoint> after deployment"
    echo "   - Use ./rollback.sh <deploy_path> <host> for quick rollbacks"
    echo "   - Consider using package.deploy.json for lighter deployments"
}

# Run if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 