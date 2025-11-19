//utility function to stop the page from scrolling

export const stopScroll = function (lenis) {
  //non lenis version
  if (lenis) {
    //lenis version
    lenis.stop();
  } else {
    const body = document.querySelector('body');
    const NO_SCROLL_CLASS = 'no-scroll';
    body.classList.add(NO_SCROLL_CLASS);
  }
};
//utility function to start page  scrolling
export const startScroll = function (lenis) {
  //non lenis version
  if (lenis) {
    //lenis version
    lenis.start();
  } else {
    const body = document.querySelector('body');
    const NO_SCROLL_CLASS = 'no-scroll';
    body.classList.remove(NO_SCROLL_CLASS);
  }
};
// attribute value checker
export const attr = function (defaultVal, attrVal) {
  //get the type of the default
  const defaultValType = typeof defaultVal;
  if (typeof attrVal !== 'string' || attrVal.trim() === '') return defaultVal;
  if (attrVal === 'true' && defaultValType === 'boolean') return true;
  if (attrVal === 'false' && defaultValType === 'boolean') return false;
  if (isNaN(attrVal) && defaultValType === 'string') return attrVal;
  if (!isNaN(attrVal) && defaultValType === 'number') return +attrVal;
  return defaultVal;
};
//function to process data attributes and return the correct value if set (or nothing if not set)
export const attrIfSet = function (item, attributeName, defaultValue) {
  const hasAttribute = item.hasAttribute(attributeName);
  const attributeValue = attr(defaultValue, item.getAttribute(attributeName));
  // if the attribute is not set retun, otherwise update the attribute
  // (alternatively, could just include the default value)
  if (hasAttribute) {
    return attributeValue;
  } else {
    return;
  }
};

//split text utility
export const runSplit = function (text, types = 'lines, words') {
  if (!text) return;
  let typeSplit = SplitText.create(text, { type: types, autoSplit: true });
  return typeSplit;
};

//check for attributes to stop animation on specific breakpoints
export const checkBreakpoints = function (item, animationID, gsapContext) {
  //exit if items aren't found
  if (!item || !animationID || !gsapContext) {
    console.error(`GSAP checkBreakpoints Error in ${animationID}`);
    // if you want this error to stop the interaction return false
    return;
  }
  //create variables from GSAP context
  let { isMobile, isTablet, isDesktop, reduceMotion } = gsapContext.conditions;

  //check to see if GSAP context is working
  if (isMobile === undefined || isTablet === undefined || isDesktop === undefined) {
    console.error(`GSAP Match Media Conditions Not Defined`);
    // if you want this error to stop the interaction return false
    return;
  }
  //breakpoint options
  const RUN_DESKTOP = `data-ix-${animationID}-desktop`;
  const RUN_TABLET = `data-ix-${animationID}-tablet`;
  const RUN_MOBILE = `data-ix-${animationID}-mobile`;
  const RUN_ALL = `data-ix-${animationID}-run`;
  //check breakpoints and quit function if set on specific breakpoints
  runAll = attr(true, item.getAttribute(RUN_ALL));
  runMobile = attr(true, item.getAttribute(RUN_MOBILE));
  runTablet = attr(true, item.getAttribute(RUN_TABLET));
  runDesktop = attr(true, item.getAttribute(RUN_DESKTOP));
  if (runAll === false) return false;
  if (runMobile === false && isMobile) return false;
  if (runTablet === false && isTablet) return false;
  if (runDesktop === false && isDesktop) return false;
  // if no conditions match
  return true;
};

//utility function to get the clipping direction of items (horizontal or vertical only)
export const getClipDirection = function (attributeValue) {
  //set default return value to be the attribute value
  let clipMask = attributeValue;
  //get the clip direction
  const clipDirections = {
    left: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
    right: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
    top: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
    bottom: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
    full: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  };
  //check for each possible direction and map it to the correct clipping value
  if (attributeValue === 'left') {
    clipMask = clipDirections.left;
  }
  if (attributeValue === 'right') {
    clipMask = clipDirections.right;
  }
  if (attributeValue === 'top') {
    clipMask = clipDirections.top;
  }
  if (attributeValue === 'bottom') {
    clipMask = clipDirections.bottom;
  }
  if (attributeValue === 'full') {
    clipMask = clipDirections.full;
  }

  return clipMask;
};

export class ClassWatcher {
  constructor(targetNode, classToWatch, classAddedCallback, classRemovedCallback) {
    this.targetNode = targetNode;
    this.classToWatch = classToWatch;
    this.classAddedCallback = classAddedCallback;
    this.classRemovedCallback = classRemovedCallback;
    this.observer = null;
    this.lastClassState = targetNode.classList.contains(this.classToWatch);

    this.init();
  }

  init() {
    this.observer = new MutationObserver(this.mutationCallback);
    this.observe();
  }

  observe() {
    this.observer.observe(this.targetNode, { attributes: true });
  }

  disconnect() {
    this.observer.disconnect();
  }

  mutationCallback = (mutationsList) => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        let currentClassState = mutation.target.classList.contains(this.classToWatch);
        if (this.lastClassState !== currentClassState) {
          this.lastClassState = currentClassState;
          if (currentClassState) {
            this.classAddedCallback();
          } else {
            this.classRemovedCallback();
          }
        }
      }
    }
  };
}

//utility for finding children of an element without display: contents
// will go down layer by layer until it finds children without that value.
export function getNonContentsChildren(item) {
  if (!item || !(item instanceof Element)) return [];

  const result = [];

  function processChildren(parent) {
    const children = Array.from(parent.children);
    for (const child of children) {
      const display = window.getComputedStyle(child).display;
      if (display === 'contents') {
        processChildren(child); // Recurse into children of 'contents' elements
      } else {
        result.push(child); // Keep non-'contents' element
      }
    }
  }

  processChildren(item);
  return result;
}
