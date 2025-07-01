#!/bin/bash

# Development script with Stripe Mock for testing
# This allows you to test payments without real Stripe credentials

set -e

echo "🚀 Starting development environment with Stripe Mock..."

# Start Stripe Mock
echo "📦 Starting Stripe Mock server..."
docker-compose -f docker-compose.stripe.yml up -d stripe-mock

# Wait for Stripe Mock to be ready
echo "⏳ Waiting for Stripe Mock to be ready..."
timeout=30
counter=0
until curl -s http://localhost:12111/v1/products > /dev/null 2>&1; do
    if [ $counter -eq $timeout ]; then
        echo "❌ Timeout waiting for Stripe Mock"
        exit 1
    fi
    echo "   Waiting... ($counter/$timeout)"
    sleep 1
    counter=$((counter + 1))
done

echo "✅ Stripe Mock is ready at http://localhost:12111"

# Update .env.local for development
echo "🔧 Updating .env.local for Stripe Mock..."
if [ -f .env.local ]; then
    # Backup original
    cp .env.local .env.local.backup
    
    # Replace Stripe URLs with mock
    sed -i.tmp 's|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_mock|' .env.local
    sed -i.tmp 's|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=sk_test_mock|' .env.local
    sed -i.tmp 's|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=whsec_test_mock|' .env.local
    
    # Add Stripe Mock URL if not present
    if ! grep -q "STRIPE_API_BASE" .env.local; then
        echo "STRIPE_API_BASE=http://localhost:12111" >> .env.local
    fi
    
    rm -f .env.local.tmp
    echo "   Updated .env.local (backup saved as .env.local.backup)"
fi

# Start Next.js development server
echo "🌐 Starting Next.js development server..."
npm run dev &
NEXT_PID=$!

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "📋 Available services:"
echo "   🌐 Next.js App: http://localhost:3001"
echo "   💳 Stripe Mock: http://localhost:12111"
echo ""
echo "🧪 Test payment with these mock cards:"
echo "   Success: 4242424242424242"
echo "   Declined: 4000000000000002"
echo "   Requires SCA: 4000002500003155"
echo ""
echo "📝 To stop development:"
echo "   Ctrl+C to stop Next.js"
echo "   Run: docker-compose -f docker-compose.stripe.yml down"
echo ""

# Wait for user to stop
trap cleanup INT
cleanup() {
    echo ""
    echo "🛑 Stopping development environment..."
    kill $NEXT_PID 2>/dev/null || true
    docker-compose -f docker-compose.stripe.yml down
    
    # Restore original .env.local
    if [ -f .env.local.backup ]; then
        mv .env.local.backup .env.local
        echo "   Restored original .env.local"
    fi
    
    echo "✅ Development environment stopped"
    exit 0
}

wait $NEXT_PID