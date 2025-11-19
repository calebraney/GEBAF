import { attr, checkBreakpoints, getNonContentsChildren, getClipDirection } from '../utilities';

export const scrollIn = function (gsapContext) {
  //animation ID
  const ANIMATION_ID = 'scrollin';
  // selectors
  const ATTRIBUTE = 'data-ix-scrollin';
  const ELEMENT = 'data-ix-scrollin';
  // types of scrolling elements (value for scrollin element attribute)
  const WRAP = 'wrap';
  const HEADING = 'heading';
  const ITEM = 'item';
  const CONTAINER = 'container';
  const STAGGER = 'stagger';
  const RICH_TEXT = 'rich-text';
  const IMAGE_WRAP = 'image-wrap';
  const IMAGE = 'image';
  const LINE = 'line';

  //options
  const SCROLL_TOGGLE_ACTIONS = 'data-ix-scrollin-toggle-actions';
  const SCROLL_SCRUB = 'data-ix-scrollin-scrub';
  const SCROLL_START = 'data-ix-scrollin-start';
  const SCROLL_END = 'data-ix-scrollin-end';
  const CLIP_DIRECTION = 'data-ix-scrollin-clip-direction';
  const SCROLL_STAGGER = 'data-ix-scrollin-stagger';

  // DEFAULTS
  const EASE_SMALL = 0.1;
  const EASE_LARGE = 0.3;
  const DURATION = 0.6;
  const EASE = 'power1.out';

  //resuable timeline creation with option attributes for individual customization per element
  const scrollInTL = function (item) {
    // default GSAP options
    const settings = {
      scrub: false,
      toggleActions: 'play none none none',
      start: 'top 90%',
      end: 'top 75%',
    };
    //override settings if an attribute is present and a valid type.
    settings.toggleActions = attr(settings.toggleActions, item.getAttribute(SCROLL_TOGGLE_ACTIONS));
    settings.scrub = attr(settings.scrub, item.getAttribute(SCROLL_SCRUB));
    settings.start = attr(settings.start, item.getAttribute(SCROLL_START));
    settings.end = attr(settings.end, item.getAttribute(SCROLL_END));
    const tl = gsap.timeline({
      defaults: {
        duration: DURATION,
        ease: EASE,
      },
      scrollTrigger: {
        trigger: item,
        start: settings.start,
        end: settings.end,
        toggleActions: settings.toggleActions,
        scrub: settings.scrub,
      },
    });
    return tl;
  };

  //resuable timeline creation with option attributes for individual customization per element
  const defaultTween = function (item, tl, options = {}) {
    const varsFrom = {
      autoAlpha: 0,
      y: '2rem',
    };
    const varsTo = {
      autoAlpha: 1,
      y: '0rem',
    };
    //optional adjustments to the tween
    // {stagger: 0.2}
    if (options.stagger) {
      varsTo.stagger = { each: options.stagger, from: 'start' };
    }
    // {stagger: large}
    if (options.stagger === 'small') {
      varsTo.stagger = { each: EASE_SMALL, from: 'start' };
    }
    if (options.stagger === 'large') {
      varsTo.stagger = { each: EASE_LARGE, from: 'start' };
    }

    // putting tween together
    const tween = tl.fromTo(item, varsFrom, varsTo);
    return tween;
  };

  const scrollInHeading = function (item) {
    //check if item is rich text
    if (item.classList.contains('w-richtext')) {
      item = item.firstChild;
    }
    //split the text
    SplitText.create(item, {
      type: 'words', // 'chars, words, lines
      // linesClass: "line",
      wordsClass: 'word',
      // charsClass: "char",
      // mask: 'lines',
      autoSplit: true, //have it auto adjust based on width
      // mask: 'lines',
      onSplit(self) {
        // animation to run for the item
        const tl = scrollInTL(item);

        tween = defaultTween(self.words, tl, { stagger: 'small' });
        //create callback function to revert text
        const revertText = function (self) {
          self.revert();
        };
        //revert text on animation complete
        tween.eventCallback('onComplete', revertText, [self]);
        //return tween for gsap to be able to manage it smartly
        return tween;
      },
    });
  };

  const scrollInItem = function (item) {
    if (!item) return;
    //check if item is rich text and if it is apply animation to each child
    if (item.classList.contains('w-richtext')) {
      //get the children of the item
      const children = gsap.utils.toArray(item.children);
      if (children.length === 0) return;
      children.forEach((child) => {
        const tl = scrollInTL(child);
        const tween = defaultTween(child, tl);
      });
    } else {
      const tl = scrollInTL(item);
      const tween = defaultTween(item, tl);
    }
  };

  const scrollInImage = function (item) {
    //item is the image wrap for this animation
    if (!item) return;
    //set clip path directions
    const child = item.firstChild;
    //create timeline
    const tl = scrollInTL(item);
    tl.fromTo(
      child,
      {
        scale: 1.2,
      },
      {
        scale: 1,
        duration: 1,
      }
    );
    tl.fromTo(
      item,
      {
        scale: 0.9,
      },
      {
        scale: 1,
        duration: 1,
      },
      '<'
    );
  };

  const scrollInLine = function (item) {
    if (!item) return;
    //set clip path directions
    const clipAttr = attr('left', item.getAttribute(CLIP_DIRECTION));
    const clipStart = getClipDirection(clipAttr);
    const clipEnd = getClipDirection('full');
    //create timeline
    const tl = scrollInTL(item);
    tl.fromTo(
      item,
      {
        clipPath: clipStart,
      },
      {
        clipPath: clipEnd,
      }
    );
  };

  const scrollInContainer = function (item) {
    if (!item) return;
    //get the children of the item
    const children = gsap.utils.toArray(item.children);
    if (children.length === 0) return;
    children.forEach((child) => {
      const tl = scrollInTL(child);
      const tween = defaultTween(child, tl);
    });
  };

  const scrollInStagger = function (item) {
    if (!item) return;
    const staggerAmount = attr(EASE_LARGE, item.getAttribute(SCROLL_STAGGER));
    // get the children of the item  without display contents
    let children = getNonContentsChildren(item);
    // const children = gsap.utils.toArray(item.children);
    if (children.length === 0) return;
    const tl = scrollInTL(item);
    const tween = defaultTween(children, tl, { stagger: staggerAmount });
  };

  const scrollInRichText = function (item) {
    if (!item) return;
    //get the children of the item
    const children = gsap.utils.toArray(item.children);
    if (children.length === 0) return;
    children.forEach((child) => {
      const childTag = child.tagName;
      //apply the items animation based on the child type
      if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(childTag)) {
        scrollInHeading(child);
      }
      if (childTag === 'FIGURE') {
        scrollInImage(child);
      } else {
        scrollInItem(child);
      }
    });
  };

  //get sections
  const wraps = gsap.utils.toArray(`[${ATTRIBUTE}="${WRAP}"]`);
  wraps.forEach((wrap) => {
    //check breakpoints and exit if set to false
    let runOnBreakpoint = checkBreakpoints(wrap, ANIMATION_ID, gsapContext);
    if (runOnBreakpoint === false && wrap.getAttribute('data-ix-load-run') === 'false') return;

    //get all items within the section
    const items = [...wrap.querySelectorAll(`[${ATTRIBUTE}]:not([${ATTRIBUTE}-run="false"])`)];
    if (items.length === 0) return;
    //get all elements and apply animations
    items.forEach((item) => {
      if (!item) return;
      //find the type of the scrolling animation
      const scrollInType = item.getAttribute(ELEMENT);
      if (scrollInType === HEADING) {
        scrollInHeading(item);
      }
      if (scrollInType === ITEM) {
        scrollInItem(item);
      }
      if (scrollInType === IMAGE) {
        scrollInImage(item);
      }
      if (scrollInType === LINE) {
        scrollInLine(item);
      }
      if (scrollInType === CONTAINER) {
        scrollInContainer(item);
      }
      if (scrollInType === STAGGER) {
        scrollInStagger(item);
      }
      if (scrollInType === RICH_TEXT) {
        scrollInRichText(item);
      }
    });
  });
};
