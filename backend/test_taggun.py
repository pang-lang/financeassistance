"""
Test script for Taggun API integration
Run this to verify your Taggun API key is working correctly
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from config import get_settings
from services.taggun_service import TaggunOCRService


async def test_health_check():
    """Test if Taggun is configured correctly."""
    print("🔍 Testing Taggun Configuration...")
    print("=" * 50)
    
    try:
        settings = get_settings()
        print(f"✓ API URL: {settings.taggun_api_url}")
        print(f"✓ API Key: {'*' * 20}{settings.taggun_api_key[-4:]}" if len(settings.taggun_api_key) > 4 else "Not set")
        print()
        
        service = TaggunOCRService()
        is_configured = await service.health_check()
        
        if is_configured:
            print("✅ Taggun is properly configured!")
            print("   You can now process receipts.")
        else:
            print("❌ Taggun is not configured!")
            print("   Please check your TAGGUN_API_KEY in .env file")
        
        print()
        return is_configured
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


async def test_with_sample_receipt():
    """Test with a sample receipt (if provided)."""
    print("\n📸 Testing Receipt Processing...")
    print("=" * 50)
    print("This test requires a receipt image file.")
    print("Place a receipt image in this directory and update the filename below.")
    print()
    
    # Check if sample file exists
    sample_file = Path(__file__).parent / "sample_receipt.jpg"
    
    if not sample_file.exists():
        print("ℹ️  No sample receipt found (sample_receipt.jpg)")
        print("   Upload a receipt image through the web interface to test.")
        return
    
    print(f"📄 Processing: {sample_file.name}")
    
    try:
        service = TaggunOCRService()
        
        # Read the file
        with open(sample_file, 'rb') as f:
            file_content = f.read()
        
        print("   Uploading to Taggun API...")
        result = await service.process_receipt(
            file_content=file_content,
            filename=sample_file.name,
            content_type="image/jpeg"
        )
        
        print("✅ Processing successful!")
        print()
        
        # Parse the result
        receipt_data = service.parse_taggun_response(result)
        
        print("📊 Extracted Data:")
        print(f"   Store: {receipt_data.store_name}")
        print(f"   Total: ${receipt_data.total_amount}")
        print(f"   Date: {receipt_data.date}")
        print(f"   Items: {len(receipt_data.items)} items found")
        print(f"   Confidence: {receipt_data.confidence:.2%}")
        print()
        
        if receipt_data.items:
            print("   Line Items:")
            for i, item in enumerate(receipt_data.items[:5], 1):
                print(f"     {i}. {item.name}: ${item.price}")
            if len(receipt_data.items) > 5:
                print(f"     ... and {len(receipt_data.items) - 5} more items")
        
    except Exception as e:
        print(f"❌ Error processing receipt: {e}")


async def main():
    """Main test function."""
    print("\n" + "=" * 50)
    print("   TAGGUN OCR INTEGRATION TEST")
    print("=" * 50 + "\n")
    
    # Test configuration
    is_configured = await test_health_check()
    
    if not is_configured:
        print("\n⚠️  Please configure your Taggun API key before testing.")
        print("   See ENV_SETUP.md for instructions.")
        return
    
    # Test with sample receipt
    await test_with_sample_receipt()
    
    print("\n" + "=" * 50)
    print("   TEST COMPLETE")
    print("=" * 50 + "\n")
    print("Next steps:")
    print("1. Start the backend: python main.py")
    print("2. Start the frontend: npm run dev")
    print("3. Visit: http://localhost:4028/receipt-scanner")
    print()


if __name__ == "__main__":
    asyncio.run(main())

