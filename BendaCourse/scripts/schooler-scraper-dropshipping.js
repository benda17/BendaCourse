/**
 * Schooler Course Scraper for Dropshipping Course
 * 
 * Instructions:
 * 1. Log into Schooler: https://my.schooler.biz/s/35614/login
 * 2. Navigate to course: https://my.schooler.biz/s/35614/1631284218338
 * 3. Open browser console (F12 → Console tab)
 * 4. Copy and paste this entire script
 * 5. Press Enter to run
 * 6. Copy the JSON output and save it to dropshipping-course-data.json
 */

(function() {
  console.log('Starting course extraction...');
  
  const courseData = {
    title: "הקורס המלא של בנדה לדרופשיפינג באיביי",
    description: "קורס מקצועי למסחר אונליין באיביי - מסלול מסודר מהבסיס עד לרמה של עסק אונליין אמיתי",
    modules: []
  };

  // Debug: Log page info
  console.log('Page URL:', window.location.href);
  console.log('Page Title:', document.title);
  
  // Try multiple selectors for sidebar/navigation
  const sidebarSelectors = [
    '.course-sidebar',
    '.course-navigation',
    'nav',
    'aside',
    '[class*="sidebar"]',
    '[class*="navigation"]',
    '[class*="menu"]',
    '[id*="sidebar"]',
    '[id*="navigation"]',
    '[id*="menu"]'
  ];

  let sidebar = null;
  for (const selector of sidebarSelectors) {
    sidebar = document.querySelector(selector);
    if (sidebar) {
      console.log(`Found sidebar with selector: ${selector}`);
      break;
    }
  }

  // If no sidebar, try to find any container with course links
  if (!sidebar) {
    console.log('No sidebar found, searching for course links in entire document...');
    const courseLinks = Array.from(document.querySelectorAll('a[href*="/s/35614/1631284218338/"], a[href*="1631284218338"], a[href*="/s/35614/"]'));
    if (courseLinks.length > 0) {
      console.log(`Found ${courseLinks.length} course links in document`);
      sidebar = courseLinks[0].closest('nav, aside, div, ul, ol, section') || document.body;
    }
  }

  if (!sidebar) {
    console.error('Could not find course sidebar or navigation. Make sure you are on the course page.');
    console.log('Available elements:', {
      navs: document.querySelectorAll('nav').length,
      asides: document.querySelectorAll('aside').length,
      allLinks: document.querySelectorAll('a').length,
      courseLinks: document.querySelectorAll('a[href*="35614"]').length
    });
    return;
  }

  // Try multiple selectors for lesson links
  const lessonSelectors = [
    'a[href*="/s/35614/1631284218338/"]',
    'a[href*="1631284218338"]',
    'a[href*="/s/35614/"]',
    'a[href*="lesson"]',
    '.lesson-link',
    '.course-item',
    'li a',
    'a[href^="/s/"]',
    'a[href*="35614"]'
  ];

  let allLinks = [];
  for (const selector of lessonSelectors) {
    const links = Array.from(sidebar.querySelectorAll(selector));
    if (links.length > 0) {
      allLinks = links;
      console.log(`Found ${links.length} links using selector: ${selector}`);
      break;
    }
  }

  if (allLinks.length === 0) {
    console.log('No links found in sidebar, searching entire document...');
    // Try to find any links in the entire document
    allLinks = Array.from(document.querySelectorAll('a[href*="/s/35614/1631284218338/"], a[href*="1631284218338"], a[href*="/s/35614/"]'));
    console.log(`Found ${allLinks.length} course links in entire document`);
    
    if (allLinks.length === 0) {
      console.error('No course links found!');
      console.log('Make sure:');
      console.log('1. You are logged into Schooler');
      console.log('2. You are on the course page: https://my.schooler.biz/s/35614/1631284218338');
      console.log('3. The course content is visible');
      return;
    }
  }

  // Group lessons by module/section
  let currentModule = null;
  let moduleOrder = 1;
  let lessonOrder = 1;

  // Try to find module headers
  const moduleHeaders = Array.from(sidebar.querySelectorAll('h2, h3, h4, .module-title, .chapter-title, [class*="module"], [class*="chapter"]'));
  
  console.log(`\nProcessing ${allLinks.length} links...\n`);

  allLinks.forEach((link, index) => {
    const href = link.getAttribute('href') || '';
    const text = link.textContent.trim();
    
    // More flexible matching - check if it's a lesson link
    const isLessonLink = href.includes('/s/35614/1631284218338/') || 
                        href.includes('1631284218338') ||
                        (href.includes('/s/35614/') && href.match(/\/(\d+)$/));
    
    // Skip if not a lesson link or empty text
    if (!isLessonLink || !text) {
      if (index < 5) {
        console.log(`Skipping link ${index + 1}: "${text.substring(0, 40)}" (href: ${href})`);
      }
      return;
    }

    // Check if this is a module header (usually appears before lessons)
    const isModuleHeader = moduleHeaders.some(header => {
      const headerText = header.textContent.trim();
      return headerText === text || text.includes(headerText);
    });

    // Extract lesson number from href or text
    const lessonMatch = href.match(/\/(\d+)$/) || text.match(/(\d+)/);
    const lessonNum = lessonMatch ? parseInt(lessonMatch[1]) : lessonOrder;

    // Check if we should start a new module
    // Modules usually have titles like "פרק", "חלק", "מודול"
    if (text.includes('פרק') || text.includes('חלק') || text.includes('מודול') || text.includes('Chapter') || isModuleHeader) {
      // Save previous module if exists
      if (currentModule && currentModule.lessons.length > 0) {
        courseData.modules.push(currentModule);
      }
      
      // Start new module
      currentModule = {
        title: text,
        order: moduleOrder++,
        lessons: []
      };
      lessonOrder = 1;
      return;
    }

    // If no current module, create one
    if (!currentModule) {
      currentModule = {
        title: `פרק ${moduleOrder}`,
        order: moduleOrder++,
        lessons: []
      };
    }

    // Extract duration if available
    const durationText = link.closest('li')?.textContent.match(/(\d+):(\d+)/);
    let duration = null;
    if (durationText) {
      const minutes = parseInt(durationText[1]);
      const seconds = parseInt(durationText[2]);
      duration = minutes * 60 + seconds;
    }

    // Add lesson
    const fullHref = href.startsWith('http') ? href : 
                    href.startsWith('/') ? `https://my.schooler.biz${href}` :
                    `https://my.schooler.biz/s/35614/1631284218338/${href}`;
    
    currentModule.lessons.push({
      title: text,
      href: fullHref,
      order: lessonOrder++,
      duration: duration,
      videoUrl: null // Will be filled manually or by video extraction script
    });
    
    if (lessonOrder <= 3) {
      console.log(`Added lesson ${lessonOrder - 1}: ${text.substring(0, 50)}`);
    }
  });

  // Add last module
  if (currentModule && currentModule.lessons.length > 0) {
    courseData.modules.push(currentModule);
  }

  console.log('\n=== EXTRACTION COMPLETE ===');
  console.log(`Found ${courseData.modules.length} modules`);
  const totalLessons = courseData.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  console.log(`Found ${totalLessons} lessons\n`);
  
  console.log('=== COPY THIS JSON ===');
  console.log(JSON.stringify(courseData, null, 2));
  console.log('\n=== NEXT STEPS ===');
  console.log('1. Copy the JSON above');
  console.log('2. Save it to: dropshipping-course-data.json');
  console.log('3. Extract video URLs (see instructions below)');
  console.log('4. Run: npm run import:dropshipping-course');
  
  return courseData;
})();

