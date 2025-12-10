/**
 * Video URL Extraction Helper for Sales Course
 * 
 * Instructions:
 * 1. Open each lesson page from sales-course-data.json
 * 2. Open browser console (F12 → Console tab)
 * 3. Copy and paste this entire script
 * 4. Run: getVideoUrl()
 * 5. Copy the returned URL and update sales-course-data.json
 * 
 * Or use this automated version that tries all common patterns:
 */

function getVideoUrl() {
  console.log('🔍 Searching for video URL...\n');
  
  // Method 1: Check for YouTube iframes
  const iframes = Array.from(document.querySelectorAll('iframe'));
  for (const iframe of iframes) {
    if (iframe.src.includes('youtube') || iframe.src.includes('youtu.be')) {
      console.log('✅ Found YouTube iframe:', iframe.src);
      
      // Extract video ID from embed URL
      const embedMatch = iframe.src.match(/youtube\.com\/embed\/([^?&]+)/);
      if (embedMatch) {
        const videoUrl = `https://www.youtube.com/watch?v=${embedMatch[1]}`;
        console.log('📹 Video URL:', videoUrl);
        return videoUrl;
      }
      
      // Extract from youtu.be
      const shortMatch = iframe.src.match(/youtu\.be\/([^?&]+)/);
      if (shortMatch) {
        const videoUrl = `https://www.youtube.com/watch?v=${shortMatch[1]}`;
        console.log('📹 Video URL:', videoUrl);
        return videoUrl;
      }
    }
    
    // Check for Vimeo
    if (iframe.src.includes('vimeo')) {
      const vimeoMatch = iframe.src.match(/vimeo\.com\/video\/(\d+)/);
      if (vimeoMatch) {
        const videoUrl = `https://vimeo.com/${vimeoMatch[1]}`;
        console.log('📹 Vimeo URL:', videoUrl);
        return videoUrl;
      }
    }
  }
  
  // Method 2: Check for video elements
  const videos = Array.from(document.querySelectorAll('video'));
  for (const video of videos) {
    if (video.src) {
      console.log('✅ Found video element:', video.src);
      if (video.src.includes('youtube') || video.src.includes('youtu.be')) {
        const match = video.src.match(/youtube\.com\/watch\?v=([^&]+)/) || 
                     video.src.match(/youtu\.be\/([^?&]+)/);
        if (match) {
          const videoUrl = `https://www.youtube.com/watch?v=${match[1]}`;
          console.log('📹 Video URL:', videoUrl);
          return videoUrl;
        }
      }
      return video.src;
    }
  }
  
  // Method 3: Check script tags for YouTube URLs
  const scripts = Array.from(document.querySelectorAll('script'));
  for (const script of scripts) {
    const content = script.textContent || script.innerHTML || '';
    
    // Look for YouTube watch URLs
    const watchMatch = content.match(/youtube\.com\/watch\?v=([^"'\s&]+)/);
    if (watchMatch) {
      const videoUrl = `https://www.youtube.com/watch?v=${watchMatch[1]}`;
      console.log('✅ Found YouTube URL in script:', videoUrl);
      return videoUrl;
    }
    
    // Look for YouTube embed URLs
    const embedMatch = content.match(/youtube\.com\/embed\/([^"'\s?&]+)/);
    if (embedMatch) {
      const videoUrl = `https://www.youtube.com/watch?v=${embedMatch[1]}`;
      console.log('✅ Found YouTube embed in script:', videoUrl);
      return videoUrl;
    }
    
    // Look for youtu.be short URLs
    const shortMatch = content.match(/youtu\.be\/([^"'\s?&]+)/);
    if (shortMatch) {
      const videoUrl = `https://www.youtube.com/watch?v=${shortMatch[1]}`;
      console.log('✅ Found youtu.be URL in script:', videoUrl);
      return videoUrl;
    }
    
    // Look for video ID patterns
    const videoIdMatch = content.match(/["']([a-zA-Z0-9_-]{11})["']/);
    if (videoIdMatch && content.includes('youtube')) {
      const videoUrl = `https://www.youtube.com/watch?v=${videoIdMatch[1]}`;
      console.log('✅ Found YouTube video ID in script:', videoUrl);
      return videoUrl;
    }
  }
  
  // Method 4: Check data attributes
  const elementsWithData = Array.from(document.querySelectorAll('[data-video-id], [data-youtube-id], [data-src]'));
  for (const elem of elementsWithData) {
    const videoId = elem.getAttribute('data-video-id') || 
                   elem.getAttribute('data-youtube-id') ||
                   elem.getAttribute('data-src');
    if (videoId) {
      if (videoId.includes('youtube') || videoId.includes('youtu.be')) {
        const match = videoId.match(/watch\?v=([^&]+)/) || videoId.match(/youtu\.be\/([^?&]+)/) || videoId.match(/embed\/([^?&]+)/);
        if (match) {
          const videoUrl = `https://www.youtube.com/watch?v=${match[1]}`;
          console.log('✅ Found video URL in data attribute:', videoUrl);
          return videoUrl;
        }
      }
    }
  }
  
  // Method 5: Check page source for common video patterns
  const pageSource = document.documentElement.innerHTML;
  const sourceMatches = [
    ...pageSource.matchAll(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/g),
    ...pageSource.matchAll(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/g),
    ...pageSource.matchAll(/youtu\.be\/([a-zA-Z0-9_-]{11})/g)
  ];
  
  if (sourceMatches.length > 0) {
    const videoId = sourceMatches[0][1];
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log('✅ Found YouTube URL in page source:', videoUrl);
    return videoUrl;
  }
  
  console.log('❌ No video URL found');
  console.log('\nDebug info:');
  console.log('  - Iframes found:', iframes.length);
  console.log('  - Video elements found:', videos.length);
  console.log('  - Scripts found:', scripts.length);
  console.log('\n💡 Try:');
  console.log('  1. Check if the video is embedded in a different way');
  console.log('  2. Look at the Network tab to see video requests');
  console.log('  3. Inspect the video player element');
  
  return null;
}

// Auto-run and display result
const videoUrl = getVideoUrl();
if (videoUrl) {
  console.log('\n🎉 COPY THIS URL:');
  console.log(videoUrl);
  console.log('\n📋 To copy: Select the URL above and press Ctrl+C');
} else {
  console.log('\n⚠️  Could not find video URL automatically.');
  console.log('   Please inspect the page manually or check the Network tab.');
}

// Export function for manual use
window.getVideoUrl = getVideoUrl;

