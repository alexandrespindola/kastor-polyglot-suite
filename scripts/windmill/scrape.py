import requests
from bs4 import BeautifulSoup
import boto3
from datetime import datetime
import os
import re

def main(url: str) -> dict:
    """
    Web scraper that extracts content from URLs and saves to S3
    """
    try:
        # Headers to simulate browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Make HTTP request
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove unwanted elements
        for element in soup(["script", "style", "nav", "footer", "header", "aside"]):
            element.decompose()
        
        # Try to find main content
        main_content = None
        
        # Priority: article > main > .content > .post > body
        selectors = [
            'article',
            'main',
            '[class*="content"]',
            '[class*="post"]',
            '[class*="article"]',
            '.entry-content',
            '#content'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                main_content = element
                break
        
        # If not found, use body
        if not main_content:
            main_content = soup.find('body') or soup
        
        # Extract text
        text = main_content.get_text()
        
        # Clean text
        # Remove multiple spaces and newlines
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        
        # Limit size (optional)
        if len(text) > 10000:
            text = text[:10000] + "..."
        
        # Save to S3
        s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        
        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        # Clean URL for filename
        clean_url = re.sub(r'https?://', '', url).replace('/', '_').replace('.', '_')
        filename = f"scraped_content/{timestamp}_{clean_url}.txt"
        
        # Upload to S3
        s3_client.put_object(
            Bucket=os.getenv('S3_BUCKET', 'kastor-scraped-content'),
            Key=filename,
            Body=text.encode('utf-8'),
            ContentType='text/plain',
            Metadata={
                'source_url': url,
                'scraped_at': timestamp
            }
        )
        
        s3_url = f"s3://{os.getenv('S3_BUCKET', 'kastor-scraped-content')}/{filename}"
        
        return {
            "cleaned_text": text,
            "s3_url": s3_url,
            "filename": filename,
            "status": "success",
            "content_length": len(text)
        }
        
    except requests.RequestException as e:
        return {
            "error": f"Request failed: {str(e)}",
            "status": "error"
        }
    except Exception as e:
        return {
            "error": f"Processing failed: {str(e)}",
            "status": "error"
        }
