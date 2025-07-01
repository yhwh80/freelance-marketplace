#!/bin/bash

# Setup Stripe Products and Prices for RecommendUsUK Marketplace
# This script uses Docker containers to create Stripe products and prices

set -e

echo "🏗️  Setting up Stripe products and prices for RecommendUsUK Marketplace..."

# Check if Stripe API key is provided
if [ -z "$STRIPE_API_KEY" ]; then
    echo "❌ Error: STRIPE_API_KEY environment variable is required"
    echo "   Please set your Stripe secret key: export STRIPE_API_KEY=sk_test_your_key_here"
    exit 1
fi

echo "✅ Using Stripe API key: ${STRIPE_API_KEY:0:12}..."

# Function to create a product and price using Stripe CLI
create_credit_package() {
    local name="$1"
    local credits="$2"
    local price_gbp="$3"
    local description="$4"
    
    echo "📦 Creating product: $name ($credits credits)"
    
    # Create product
    local product_response=$(docker run --rm \
        -e STRIPE_API_KEY="$STRIPE_API_KEY" \
        stripe/stripe-cli \
        products create \
        --name "$name" \
        --description "$description" \
        --metadata credits="$credits" \
        --metadata package_id="credits_$credits" \
        --format json)
    
    local product_id=$(echo "$product_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   Product ID: $product_id"
    
    # Convert price to pence
    local price_pence=$((price_gbp * 100))
    
    # Create price
    local price_response=$(docker run --rm \
        -e STRIPE_API_KEY="$STRIPE_API_KEY" \
        stripe/stripe-cli \
        prices create \
        --product "$product_id" \
        --currency gbp \
        --unit-amount "$price_pence" \
        --format json)
    
    local price_id=$(echo "$price_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   Price ID: $price_id (£$price_gbp)"
    echo ""
    
    # Output for .env file
    echo "# Add to .env.local:"
    echo "STRIPE_PRICE_CREDITS_${credits}=$price_id"
    echo ""
}

echo "🚀 Creating credit packages..."
echo ""

# Create all credit packages
create_credit_package \
    "10 Credits - RecommendUsUK" \
    "10" \
    "500" \
    "10 credits for posting jobs on RecommendUsUK marketplace"

create_credit_package \
    "25 Credits - RecommendUsUK (Most Popular)" \
    "25" \
    "1000" \
    "25 credits for posting jobs on RecommendUsUK marketplace - Most Popular"

create_credit_package \
    "50 Credits - RecommendUsUK (10% Savings)" \
    "50" \
    "1800" \
    "50 credits for posting jobs on RecommendUsUK marketplace - 10% savings"

create_credit_package \
    "100 Credits - RecommendUsUK (20% Savings)" \
    "100" \
    "3200" \
    "100 credits for posting jobs on RecommendUsUK marketplace - 20% savings"

echo "✅ All Stripe products and prices created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the price IDs to your .env.local file"
echo "2. Update src/lib/stripe.ts with the actual price IDs"
echo "3. Set up webhook endpoint in Stripe Dashboard:"
echo "   Endpoint URL: https://your-domain.com/api/stripe-webhook"
echo "   Events: checkout.session.completed, payment_intent.payment_failed"
echo ""
echo "🧪 For local testing, you can use:"
echo "   docker run --rm --network host stripe/stripe-cli listen --forward-to localhost:3001/api/stripe-webhook"
echo ""