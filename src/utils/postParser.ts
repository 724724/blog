export interface PostSection {
  type: 'intro' | 'pair';
  image?: { src: string; alt: string };
  text: string;
}

export function parsePostContent(content: string): PostSection[] {
  const sections: PostSection[] = [];
  
  // Split by markdown image syntax: ![alt](src)
  // The regex captures the alt and src, and splits the content around them.
  // We need to match images that start a block or are embedded.
  // Requirement: "Image ... Text ... Image ... Text"
  // Let's assume the user puts Images on their own lines or at the start of blocks.
  
  // Strategy: Find all images.
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  
  let lastIndex = 0;
  let match;
  
  // If there is text before the first image, it's an intro.
  // We will iterate through matches.
  
  while ((match = imageRegex.exec(content)) !== null) {
    const [fullMatch, alt, src] = match;
    const index = match.index;
    
    // Text before this image (since last match)
    const textBefore = content.slice(lastIndex, index).trim();
    
    if (lastIndex === 0 && textBefore) {
      // This is the very beginning text -> Intro
      sections.push({
        type: 'intro',
        text: textBefore
      });
    } else if (textBefore && sections.length > 0 && sections[sections.length - 1].type === 'pair') {
      // Text belonging to the previous image pair
      // Wait, the requirement says: "Image one, Text one, and Image one, Text one..."
      // So the text AFTER the image belongs to that image.
      // Therefore, the text captured in `textBefore` belongs to the *previous* image if it exists.
      
      const prevSection = sections[sections.length - 1];
      if (prevSection.type === 'pair') {
         // Append to previous pair? No, `textBefore` is basically the text *between* the previous image and the current image.
         // So yes, it belongs to the previous image.
         prevSection.text = textBefore;
      }
    }
    
    // Now start a new pair with this image
    sections.push({
      type: 'pair',
      image: { alt, src },
      text: '' // Text will be filled in the next iteration or after loop
    });
    
    lastIndex = index + fullMatch.length;
  }
  
  // Text after the last image
  const textAfter = content.slice(lastIndex).trim();
  if (textAfter && sections.length > 0) {
    const lastSection = sections[sections.length - 1];
    if (lastSection.type === 'pair') {
      lastSection.text = textAfter;
    } else {
       // Should trigger if no images found at all, but logically if we are here and sections > 0, last is pair or intro.
       // If last is intro (unlikely if we just processed an image), we might just append or create new?
       // If sections has items, and we just finished loop, last must be pair (from the `push` in loop).
       // Actually if textAfter exists, it belongs to the last image.
       lastSection.text = textAfter;
    }
  } else if (textAfter && sections.length === 0) {
    // No images, just text
    sections.push({
      type: 'intro',
      text: textAfter
    });
  }
  
  return sections;
}
