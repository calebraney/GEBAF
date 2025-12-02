(() => {
  // bin/live-reload.js
  new EventSource(`http://localhost:3000/esbuild`).addEventListener(
    "change",
    () => location.reload()
  );

  // src/utilities.js
  var stopScroll = function(lenis) {
    if (lenis) {
      lenis.stop();
    } else {
      const body = document.querySelector("body");
      const NO_SCROLL_CLASS = "no-scroll";
      body.classList.add(NO_SCROLL_CLASS);
    }
  };
  var startScroll = function(lenis) {
    if (lenis) {
      lenis.start();
    } else {
      const body = document.querySelector("body");
      const NO_SCROLL_CLASS = "no-scroll";
      body.classList.remove(NO_SCROLL_CLASS);
    }
  };
  var attr = function(defaultVal, attrVal) {
    const defaultValType = typeof defaultVal;
    if (typeof attrVal !== "string" || attrVal.trim() === "") return defaultVal;
    if (attrVal === "true" && defaultValType === "boolean") return true;
    if (attrVal === "false" && defaultValType === "boolean") return false;
    if (isNaN(attrVal) && defaultValType === "string") return attrVal;
    if (!isNaN(attrVal) && defaultValType === "number") return +attrVal;
    return defaultVal;
  };
  var attrIfSet = function(item2, attributeName, defaultValue) {
    const hasAttribute = item2.hasAttribute(attributeName);
    const attributeValue = attr(defaultValue, item2.getAttribute(attributeName));
    if (hasAttribute) {
      return attributeValue;
    } else {
      return;
    }
  };
  var checkBreakpoints = function(item2, animationID, gsapContext) {
    if (!item2 || !animationID || !gsapContext) {
      console.error(`GSAP checkBreakpoints Error in ${animationID}`);
      return;
    }
    let { isMobile, isTablet, isDesktop, reduceMotion } = gsapContext.conditions;
    if (isMobile === void 0 || isTablet === void 0 || isDesktop === void 0) {
      console.error(`GSAP Match Media Conditions Not Defined`);
      return;
    }
    const RUN_DESKTOP = `data-ix-${animationID}-desktop`;
    const RUN_TABLET = `data-ix-${animationID}-tablet`;
    const RUN_MOBILE = `data-ix-${animationID}-mobile`;
    const RUN_ALL = `data-ix-${animationID}-run`;
    runAll = attr(true, item2.getAttribute(RUN_ALL));
    runMobile = attr(true, item2.getAttribute(RUN_MOBILE));
    runTablet = attr(true, item2.getAttribute(RUN_TABLET));
    runDesktop = attr(true, item2.getAttribute(RUN_DESKTOP));
    if (runAll === false) return false;
    if (runMobile === false && isMobile) return false;
    if (runTablet === false && isTablet) return false;
    if (runDesktop === false && isDesktop) return false;
    return true;
  };
  var getClipDirection = function(attributeValue) {
    let clipMask = attributeValue;
    const clipDirections = {
      left: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
      right: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
      top: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      bottom: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      full: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
    };
    if (attributeValue === "left") {
      clipMask = clipDirections.left;
    }
    if (attributeValue === "right") {
      clipMask = clipDirections.right;
    }
    if (attributeValue === "top") {
      clipMask = clipDirections.top;
    }
    if (attributeValue === "bottom") {
      clipMask = clipDirections.bottom;
    }
    if (attributeValue === "full") {
      clipMask = clipDirections.full;
    }
    return clipMask;
  };
  function getNonContentsChildren(item2) {
    if (!item2 || !(item2 instanceof Element)) return [];
    const result = [];
    function processChildren(parent) {
      const children = Array.from(parent.children);
      for (const child of children) {
        const display = window.getComputedStyle(child).display;
        if (display === "contents") {
          processChildren(child);
        } else {
          result.push(child);
        }
      }
    }
    processChildren(item2);
    return result;
  }
  function isInViewport(element, fullyInView = false) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    if (fullyInView) {
      return rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
    }
    return rect.top < window.innerHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0;
  }

  // src/interactions/accordion.js
  var accordion = function(gsapContext) {
    const ANIMATION_ID = "accordion";
    const WRAP = '[data-ix-accordion="wrap"]';
    const ITEM = '[data-ix-accordion="item"]';
    const OPEN = '[data-ix-accordion="open"]';
    const OPTION_FIRST_OPEN = "data-ix-accordion-first-open";
    const OPTION_ONE_ACTIVE = "data-ix-accordion-one-active";
    const OPTION_KEEP_ONE_OPEN = "data-ix-accordion-keep-one-open";
    const OPTION_HOVER_OPEN = "data-ix-accordion-hover";
    const ACTIVE_CLASS = "is-active";
    const accordionLists = gsap.utils.toArray(WRAP);
    const openAccordion = function(item2, open = true) {
      if (open === true) {
        item2.classList.add(ACTIVE_CLASS);
      } else {
        item2.classList.remove(ACTIVE_CLASS);
      }
    };
    if (accordionLists.length === 0 || accordionLists === void 0) return;
    accordionLists.forEach((list) => {
      let runOnBreakpoint = checkBreakpoints(list, ANIMATION_ID, gsapContext);
      if (runOnBreakpoint === false) return;
      let firstOpen = attr(false, list.getAttribute(OPTION_FIRST_OPEN));
      let oneActive = attr(false, list.getAttribute(OPTION_ONE_ACTIVE));
      let keepOneOpen = attr(false, list.getAttribute(OPTION_KEEP_ONE_OPEN));
      let hoverOnly = attr(false, list.getAttribute(OPTION_HOVER_OPEN));
      const accordionItems = Array.from(list.querySelectorAll(ITEM));
      if (accordionItems.length === 0) return;
      const firstItem = list.firstElementChild;
      if (firstOpen) {
        openAccordion(firstItem);
      }
      if (!hoverOnly) {
        list.addEventListener("click", function(e) {
          const clickedEl = e.target.closest(OPEN);
          if (!clickedEl) return;
          const clickedItem = clickedEl.closest(ITEM);
          let clickedItemAlreadyActive = clickedItem.classList.contains(ACTIVE_CLASS);
          if (!clickedItemAlreadyActive) {
            if (oneActive) {
              accordionItems.forEach((item2) => {
                if (item2 === clickedItem) {
                  openAccordion(item2);
                } else {
                  openAccordion(item2, false);
                }
              });
            }
            if (!oneActive) {
              openAccordion(clickedItem);
            }
          }
          if (clickedItemAlreadyActive && !keepOneOpen) {
            openAccordion(clickedItem, false);
          }
          if (clickedItemAlreadyActive && keepOneActive) {
            const activeItems = accordionItems.filter(function(item2) {
              return item2.classList.contains(activeClass);
            });
            if (activeItems.length > 1) {
              openAccordion(item, false);
            }
          }
        });
      }
      if (hoverOnly) {
        accordionItems.forEach((item2) => {
          item2.addEventListener("mouseover", function() {
            openAccordion(item2);
          });
          item2.addEventListener("mouseout", function() {
            openAccordion(item2, false);
          });
        });
      }
    });
  };

  // src/interactions/banner.js
  var banner = function(gsapContext) {
    const ANIMATION_ID = "banner";
    const WRAP = '[data-ix-banner="wrap"]';
    const TRACK = '[data-ix-banner="track"]';
    const START = "data-ix-banner-start";
    const END = "data-ix-banner-end";
    const wraps = [...document.querySelectorAll(WRAP)];
    wraps.forEach((wrap) => {
      const track = wrap.querySelector(TRACK);
      if (!wrap || !track) return;
      let runOnBreakpoint = checkBreakpoints(wrap, ANIMATION_ID, gsapContext);
      if (runOnBreakpoint === false) return;
      let start = attr("center 80%", wrap.getAttribute(START));
      let end = attr("center 20%", wrap.getAttribute(END));
      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start,
          end,
          scrub: 1,
          markers: false
        }
      });
      tl.to(track, { xPercent: -100, ease: "none", duration: 1 });
    });
  };

  // src/interactions/scroll-in.js
  var scrollIn = function(gsapContext) {
    const ANIMATION_ID = "scrollin";
    const ATTRIBUTE = "data-ix-scrollin";
    const ELEMENT = "data-ix-scrollin";
    const WRAP = "wrap";
    const HEADING = "heading";
    const ITEM = "item";
    const CONTAINER = "container";
    const STAGGER = "stagger";
    const RICH_TEXT = "rich-text";
    const IMAGE_WRAP = "image-wrap";
    const IMAGE = "image";
    const LINE = "line";
    const SCROLL_TOGGLE_ACTIONS = "data-ix-scrollin-toggle-actions";
    const SCROLL_SCRUB = "data-ix-scrollin-scrub";
    const SCROLL_START = "data-ix-scrollin-start";
    const SCROLL_END = "data-ix-scrollin-end";
    const CLIP_DIRECTION = "data-ix-scrollin-clip-direction";
    const SCROLL_STAGGER = "data-ix-scrollin-stagger";
    const EASE_SMALL = 0.1;
    const EASE_LARGE = 0.3;
    const DURATION = 0.6;
    const EASE = "power1.out";
    const scrollInTL = function(item2) {
      const settings = {
        scrub: false,
        toggleActions: "play none none none",
        start: "top 90%",
        end: "top 75%"
      };
      settings.toggleActions = attr(settings.toggleActions, item2.getAttribute(SCROLL_TOGGLE_ACTIONS));
      settings.scrub = attr(settings.scrub, item2.getAttribute(SCROLL_SCRUB));
      settings.start = attr(settings.start, item2.getAttribute(SCROLL_START));
      settings.end = attr(settings.end, item2.getAttribute(SCROLL_END));
      const tl = gsap.timeline({
        defaults: {
          duration: DURATION,
          ease: EASE
        },
        scrollTrigger: {
          trigger: item2,
          start: settings.start,
          end: settings.end,
          toggleActions: settings.toggleActions,
          scrub: settings.scrub
        }
      });
      return tl;
    };
    const defaultTween = function(item2, tl, options = {}) {
      const varsFrom = {
        autoAlpha: 0,
        y: "2rem"
      };
      const varsTo = {
        autoAlpha: 1,
        y: "0rem"
      };
      if (options.stagger) {
        varsTo.stagger = { each: options.stagger, from: "start" };
      }
      if (options.stagger === "small") {
        varsTo.stagger = { each: EASE_SMALL, from: "start" };
      }
      if (options.stagger === "large") {
        varsTo.stagger = { each: EASE_LARGE, from: "start" };
      }
      const tween2 = tl.fromTo(item2, varsFrom, varsTo);
      return tween2;
    };
    const scrollInHeading = function(item2) {
      if (item2.classList.contains("w-richtext")) {
        item2 = item2.firstChild;
      }
      SplitText.create(item2, {
        type: "words",
        // 'chars, words, lines
        // linesClass: "line",
        wordsClass: "word",
        // charsClass: "char",
        // mask: 'lines',
        autoSplit: true,
        //have it auto adjust based on width
        // mask: 'lines',
        onSplit(self) {
          const tl = scrollInTL(item2);
          tween = defaultTween(self.words, tl, { stagger: "small" });
          const revertText = function(self2) {
            self2.revert();
          };
          tween.eventCallback("onComplete", revertText, [self]);
          return tween;
        }
      });
    };
    const scrollInItem = function(item2) {
      if (!item2) return;
      if (item2.classList.contains("w-richtext")) {
        const children = gsap.utils.toArray(item2.children);
        if (children.length === 0) return;
        children.forEach((child) => {
          const tl = scrollInTL(child);
          const tween2 = defaultTween(child, tl);
        });
      } else {
        const tl = scrollInTL(item2);
        const tween2 = defaultTween(item2, tl);
      }
    };
    const scrollInImage = function(item2) {
      if (!item2) return;
      const child = item2.firstChild;
      const tl = scrollInTL(item2);
      tl.fromTo(
        child,
        {
          scale: 1.2
        },
        {
          scale: 1,
          duration: 1
        }
      );
      tl.fromTo(
        item2,
        {
          scale: 0.9
        },
        {
          scale: 1,
          duration: 1
        },
        "<"
      );
    };
    const scrollInLine = function(item2) {
      if (!item2) return;
      const clipAttr = attr("left", item2.getAttribute(CLIP_DIRECTION));
      const clipStart = getClipDirection(clipAttr);
      const clipEnd = getClipDirection("full");
      const tl = scrollInTL(item2);
      tl.fromTo(
        item2,
        {
          clipPath: clipStart
        },
        {
          clipPath: clipEnd
        }
      );
    };
    const scrollInContainer = function(item2) {
      if (!item2) return;
      const children = gsap.utils.toArray(item2.children);
      if (children.length === 0) return;
      children.forEach((child) => {
        const tl = scrollInTL(child);
        const tween2 = defaultTween(child, tl);
      });
    };
    const scrollInStagger = function(item2) {
      if (!item2) return;
      const staggerAmount = attr(EASE_LARGE, item2.getAttribute(SCROLL_STAGGER));
      let children = getNonContentsChildren(item2);
      if (children.length === 0) return;
      const tl = scrollInTL(item2);
      const tween2 = defaultTween(children, tl, { stagger: staggerAmount });
    };
    const scrollInRichText = function(item2) {
      if (!item2) return;
      const children = gsap.utils.toArray(item2.children);
      if (children.length === 0) return;
      children.forEach((child) => {
        const childTag = child.tagName;
        if (["H1", "H2", "H3", "H4", "H5", "H6"].includes(childTag)) {
          scrollInHeading(child);
        }
        if (childTag === "FIGURE") {
          scrollInImage(child);
        } else {
          scrollInItem(child);
        }
      });
    };
    const wraps = gsap.utils.toArray(`[${ATTRIBUTE}="${WRAP}"]`);
    wraps.forEach((wrap) => {
      let runOnBreakpoint = checkBreakpoints(wrap, ANIMATION_ID, gsapContext);
      if (runOnBreakpoint === false && wrap.getAttribute("data-ix-load-run") === "false") return;
      const items = [...wrap.querySelectorAll(`[${ATTRIBUTE}]:not([${ATTRIBUTE}-run="false"])`)];
      if (items.length === 0) return;
      items.forEach((item2) => {
        if (!item2) return;
        const scrollInType = item2.getAttribute(ELEMENT);
        if (scrollInType === HEADING) {
          scrollInHeading(item2);
        }
        if (scrollInType === ITEM) {
          scrollInItem(item2);
        }
        if (scrollInType === IMAGE) {
          scrollInImage(item2);
        }
        if (scrollInType === LINE) {
          scrollInLine(item2);
        }
        if (scrollInType === CONTAINER) {
          scrollInContainer(item2);
        }
        if (scrollInType === STAGGER) {
          scrollInStagger(item2);
        }
        if (scrollInType === RICH_TEXT) {
          scrollInRichText(item2);
        }
      });
    });
  };

  // src/interactions/marquee.js
  var marquee = function(gsapContext) {
    const ANIMATION_ID = "marquee";
    const WRAP = '[data-ix-marquee="wrap"]';
    const LIST = '[data-ix-marquee="list"]';
    const VERTICAL = "data-ix-marquee-vertical";
    const REVERSE = "data-ix-marquee-reverse";
    const DURATION = "data-ix-marquee-duration";
    const DYNAMIC_DURATION = "data-ix-marquee-duration-dynamic";
    const DURATION_PER_ITEM = "data-ix-marquee-duration-per-item";
    const HOVER_EFFECT = "data-ix-marquee-hover";
    const ACCELERATE_ON_HOVER = "accelerate";
    const DECELERATE_ON_HOVER = "decelerate";
    const PAUSE_ON_HOVER = "pause";
    const DEFAULT_DURATION = 30;
    const DEFAULT_DYNAMIC_DURATION = 5;
    const wraps = document.querySelectorAll(WRAP);
    if (wraps.length === 0) return;
    wraps.forEach((wrap) => {
      let runOnBreakpoint = checkBreakpoints(wrap, ANIMATION_ID, gsapContext);
      if (runOnBreakpoint === false) return;
      const lists = [...wrap.querySelectorAll(LIST)];
      let vertical = attr(false, wrap.getAttribute(VERTICAL));
      let reverse = attr(false, wrap.getAttribute(REVERSE));
      let duration = attr(DEFAULT_DURATION, wrap.getAttribute(DURATION));
      let durationDynamic = attr(false, wrap.getAttribute(DYNAMIC_DURATION));
      let durationPerItem = attr(DEFAULT_DYNAMIC_DURATION, wrap.getAttribute(DURATION_PER_ITEM));
      let itemCount = lists[0].childElementCount;
      if (itemCount === 1) {
        itemCount = lists[0].firstElementChild.childElementCount;
      }
      if (durationDynamic) {
        duration = itemCount * durationPerItem;
      }
      let hoverEffect = attr("none", wrap.getAttribute(HOVER_EFFECT));
      let direction = 1;
      if (reverse) {
        direction = -1;
      }
      let tl = gsap.timeline({
        repeat: -1,
        defaults: {
          ease: "none"
        }
      });
      tl.fromTo(
        lists,
        {
          xPercent: 0,
          yPercent: 0
        },
        {
          // if vertical is true move yPercent, otherwise move x percent
          xPercent: vertical ? 0 : -100 * direction,
          yPercent: vertical ? -100 * direction : 0,
          duration
        }
      );
      if (hoverEffect === ACCELERATE_ON_HOVER) {
        wrap.addEventListener("mouseenter", (event) => {
          tl.timeScale(2);
        });
        wrap.addEventListener("mouseleave", (event) => {
          tl.timeScale(1);
        });
      }
      if (hoverEffect === DECELERATE_ON_HOVER) {
        wrap.addEventListener("mouseenter", (event) => {
          tl.timeScale(0.5);
        });
        wrap.addEventListener("mouseleave", (event) => {
          tl.timeScale(1);
        });
      }
      if (hoverEffect === PAUSE_ON_HOVER) {
        wrap.addEventListener("mouseenter", (event) => {
          tl.pause();
        });
        wrap.addEventListener("mouseleave", (event) => {
          tl.play();
        });
      }
    });
  };

  // src/interactions/slider.js
  var sliderComponent = function() {
    const ANIMATION_ID = "slider";
    const ATTRIBUTE = "data-ix-slider";
    const SLIDER = "[data-ix-slider='component']";
    const NEXT = "[data-ix-slider='next']";
    const PREVIOUS = "[data-ix-slider='previous']";
    const PAGINATION = ".slider_bullet_list";
    const PAGINATION_BUTTON = "slider_bullet_item";
    const SCROLLBAR = ".slider_scrollbar";
    const SCROLLBAR_HANDLE = "slider_scrollbar_handle";
    const FOLLOW_FINGER = "data-ix-slider-follow-finger";
    const MOUSEWHEEL = "data-ix-slider-mousewheel";
    const FREE_MODE = "data-ix-slider-free-mode";
    const SLIDE_TO_CLICKED = "data-ix-slider-slide-to-clicked";
    const LOOP = "data-ix-slider-loop";
    const SPEED = "data-ix-slider-speed";
    const ACTIVE_CLASS = "is-active";
    const sliders = document.querySelectorAll(`${SLIDER}:not(${SLIDER} ${SLIDER})`);
    sliders.forEach((component) => {
      if (component.dataset.scriptInitialized) return;
      component.dataset.scriptInitialized = "true";
      const swiperElement = component.querySelector(".slider_element");
      const swiperWrapper = component.querySelector(".slider_list");
      if (!swiperElement || !swiperWrapper) return;
      function removeCMSList(slot) {
        const dynList = Array.from(slot.children).find(
          (child) => child.classList.contains("w-dyn-list")
        );
        if (!dynList) return;
        const newSlides = dynList?.firstElementChild?.children;
        if (!newSlides) return;
        const slotChildren = [...slot.children];
        [...newSlides].forEach(
          (el) => el.firstElementChild && slot.appendChild(el.firstElementChild)
        );
        slotChildren.forEach((el) => el.remove());
      }
      function removeDisplayContents(slot) {
        const childWithDisplayContents = Array.from(slot.children).find(
          (child) => child.classList.contains("u-display-contents")
        );
        if (!childWithDisplayContents) return;
        const newSlides = childWithDisplayContents?.children;
        if (!newSlides) return;
        const slotChildren = [...slot.children];
        [...newSlides].forEach((el) => slot.appendChild(el));
        slotChildren.forEach((el) => el.remove());
      }
      removeCMSList(swiperWrapper);
      removeDisplayContents(swiperWrapper);
      [...swiperWrapper.children].forEach((el) => el.classList.add("swiper-slide"));
      const followFinger = attr(true, swiperElement.getAttribute(FOLLOW_FINGER));
      const freeMode = attr(true, swiperElement.getAttribute(FREE_MODE));
      const mousewheel = attr(true, swiperElement.getAttribute(MOUSEWHEEL));
      const slideToClickedSlide = attr(false, swiperElement.getAttribute(SLIDE_TO_CLICKED));
      const loopMode = attr(false, swiperElement.getAttribute(LOOP));
      const speed = attr(600, swiperElement.getAttribute(SPEED));
      new Swiper(swiperElement, {
        slidesPerView: "auto",
        followFinger,
        freeMode,
        slideToClickedSlide,
        centeredSlides: false,
        autoHeight: false,
        loop: loopMode,
        //   loopAdditionalSlides: 0,
        speed,
        mousewheel: {
          enabled: mousewheel,
          forceToAxis: true
        },
        keyboard: {
          enabled: true,
          onlyInViewport: true
        },
        navigation: {
          nextEl: component.querySelector(NEXT),
          prevEl: component.querySelector(PREVIOUS)
        },
        pagination: {
          el: component.querySelector(`${PAGINATION}`),
          bulletActiveClass: ACTIVE_CLASS,
          bulletClass: `${PAGINATION_BUTTON}`,
          bulletElement: "button",
          clickable: true
        },
        scrollbar: {
          el: component.querySelector(SCROLLBAR),
          draggable: true,
          dragClass: SCROLLBAR_HANDLE,
          snapOnRelease: true
        },
        slideActiveClass: ACTIVE_CLASS,
        slideDuplicateActiveClass: ACTIVE_CLASS
      });
    });
  };

  // src/interactions/scrolling.js
  var scrolling = function(gsapContext) {
    const ANIMATION_ID = "scrolling";
    const WRAP = `[data-ix-scrolling="wrap"]`;
    const TRIGGER = `[data-ix-scrolling="trigger"]`;
    const LAYER = '[data-ix-scrolling="layer"]';
    const START = "data-ix-scrolling-start";
    const END = "data-ix-scrolling-end";
    const TABLET_START = "data-ix-scrolling-start-tablet";
    const TABLET_END = "data-ix-scrolling-end-tablet";
    const MOBILE_START = "data-ix-scrolling-start-mobile";
    const MOBILE_END = "data-ix-scrolling-end-mobile";
    const SCRUB = "data-ix-scrolling-scrub";
    const POSITION = "data-ix-scrolling-position";
    const DURATION = "data-ix-scrolling-duration";
    const EASE = "data-ix-scrolling-ease";
    const X_START = "data-ix-scrolling-x-start";
    const X_END = "data-ix-scrolling-x-end";
    const Y_START = "data-ix-scrolling-y-start";
    const Y_END = "data-ix-scrolling-y-end";
    const SCALE_START = "data-ix-scrolling-scale-start";
    const SCALE_END = "data-ix-scrolling-scale-end";
    const SCALE_X_START = "data-ix-scrolling-scale-x-start";
    const SCALE_X_END = "data-ix-scrolling-scale-x-end";
    const SCALE_Y_START = "data-ix-scrolling-scale-y-start";
    const SCALE_Y_END = "data-ix-scrolling-scale-y-end";
    const WIDTH_START = "data-ix-scrolling-width-start";
    const WIDTH_END = "data-ix-scrolling-width-end";
    const HEIGHT_START = "data-ix-scrolling-height-start";
    const HEIGHT_END = "data-ix-scrolling-height-end";
    const ROTATE_X_START = "data-ix-scrolling-rotate-x-start";
    const ROTATE_X_END = "data-ix-scrolling-rotate-x-end";
    const ROTATE_Y_START = "data-ix-scrolling-rotate-y-start";
    const ROTATE_Y_END = "data-ix-scrolling-rotate-y-end";
    const ROTATE_Z_START = "data-ix-scrolling-rotate-z-start";
    const ROTATE_Z_END = "data-ix-scrolling-rotate-z-end";
    const OPACITY_START = "data-ix-scrolling-opacity-start";
    const OPACITY_END = "data-ix-scrolling-opacity-end";
    const RADIUS_START = "data-ix-scrolling-radius-start";
    const RADIUS_END = "data-ix-scrolling-radius-end";
    const CLIP_START = "data-ix-scrolling-clip-start";
    const CLIP_END = "data-ix-scrolling-clip-end";
    const scrollingItems = gsap.utils.toArray(WRAP);
    scrollingItems.forEach((scrollingItem) => {
      const layers = scrollingItem.querySelectorAll(LAYER);
      if (!scrollingItem || layers.length === 0) return;
      let trigger = scrollingItem.querySelector(TRIGGER);
      if (!trigger) {
        trigger = scrollingItem;
      }
      let runOnBreakpoint = checkBreakpoints(scrollingItem, ANIMATION_ID, gsapContext);
      if (runOnBreakpoint === false) return;
      let { isMobile, isTablet, isDesktop, reduceMotion } = gsapContext.conditions;
      const tlSettings = {
        scrub: 0.5,
        start: "top bottom",
        end: "bottom top",
        ease: "none"
      };
      tlSettings.start = attr(tlSettings.start, scrollingItem.getAttribute(START));
      tlSettings.end = attr(tlSettings.end, scrollingItem.getAttribute(END));
      tlSettings.scrub = attr(tlSettings.scrub, scrollingItem.getAttribute(SCRUB));
      tlSettings.ease = attr(tlSettings.ease, scrollingItem.getAttribute(EASE));
      if (isTablet && scrollingItem.getAttribute(TABLET_START)) {
        tlSettings.start = attr(tlSettings.start, scrollingItem.getAttribute(TABLET_START));
      }
      if (isTablet && scrollingItem.getAttribute(TABLET_END)) {
        tlSettings.start = attr(tlSettings.start, scrollingItem.getAttribute(TABLET_END));
      }
      if (isMobile && scrollingItem.getAttribute(MOBILE_START)) {
        tlSettings.start = attr(tlSettings.start, scrollingItem.getAttribute(MOBILE_START));
      }
      if (isMobile && scrollingItem.getAttribute(MOBILE_END)) {
        tlSettings.start = attr(tlSettings.start, scrollingItem.getAttribute(MOBILE_END));
      }
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger,
          start: tlSettings.start,
          end: tlSettings.end,
          scrub: tlSettings.scrub,
          markers: false
        },
        defaults: {
          duration: 1,
          ease: tlSettings.ease
        }
      });
      layers.forEach((layer) => {
        if (!layer) return;
        const varsFrom = {};
        const varsTo = {};
        varsFrom.x = attrIfSet(layer, X_START, "0%");
        varsTo.x = attrIfSet(layer, X_END, "0%");
        varsFrom.y = attrIfSet(layer, Y_START, "0%");
        varsTo.y = attrIfSet(layer, Y_END, "0%");
        varsFrom.scale = attrIfSet(layer, SCALE_START, 1);
        varsTo.scale = attrIfSet(layer, SCALE_END, 1);
        varsFrom.scaleX = attrIfSet(layer, SCALE_X_START, 1);
        varsTo.scaleX = attrIfSet(layer, SCALE_X_END, 1);
        varsFrom.scaleY = attrIfSet(layer, SCALE_Y_START, 1);
        varsTo.scaleY = attrIfSet(layer, SCALE_Y_END, 1);
        varsFrom.width = attrIfSet(layer, WIDTH_START, "0%");
        varsTo.width = attrIfSet(layer, WIDTH_END, "0%");
        varsFrom.height = attrIfSet(layer, HEIGHT_START, "0%");
        varsTo.height = attrIfSet(layer, HEIGHT_END, "0%");
        varsFrom.rotateX = attrIfSet(layer, ROTATE_X_START, 0);
        varsTo.rotateX = attrIfSet(layer, ROTATE_X_END, 0);
        varsFrom.rotateY = attrIfSet(layer, ROTATE_Y_START, 0);
        varsTo.rotateY = attrIfSet(layer, ROTATE_Y_END, 0);
        varsFrom.rotateZ = attrIfSet(layer, ROTATE_Z_START, 0);
        varsTo.rotateZ = attrIfSet(layer, ROTATE_Z_END, 0);
        varsFrom.opacity = attrIfSet(layer, OPACITY_START, 0);
        varsTo.opacity = attrIfSet(layer, OPACITY_END, 0);
        varsFrom.borderRadius = attrIfSet(layer, RADIUS_START, "string");
        varsTo.borderRadius = attrIfSet(layer, RADIUS_END, "string");
        const clipStart = attrIfSet(layer, CLIP_START, "left");
        const clipEnd = attrIfSet(layer, CLIP_END, "full");
        varsFrom.clipPath = getClipDirection(clipStart);
        varsTo.clipPath = getClipDirection(clipEnd);
        const position = attr("<", layer.getAttribute(POSITION));
        const duration = attr(1, layer.getAttribute(DURATION));
        varsTo.ease = attr(layer, EASE, "none");
        let tween2 = tl.fromTo(layer, varsFrom, varsTo, position);
      });
    });
  };

  // src/interactions/tabs.js
  var tabs = function() {
    const ANIMATION_ID = "tabs";
    const WRAP = '[data-ix-tabs="wrap"]';
    const NEXT_BTN = '[data-ix-tabs="next"]';
    const PREV_BTN = '[data-ix-tabs="previous"]';
    const PLAY_BTN = '[data-ix-tabs="toggle"]';
    const ACTIVE_CLASS = "is-active";
    const LOOP_CONTROLS = "data-ix-tabs-loop-controls";
    const SLIDE_TABS = "data-ix-tabs-slide-tabs";
    const AUTOPLAY = "data-ix-tabs-autoplay-duration";
    const DURATION = "data-ix-tabs-duration";
    const PAUSE_ON_HOVER = "data-ix-tabs-pause-on-hover";
    const AUTOPLAYVIDEOS = "data-ix-tabs-autoplay-videos";
    const AUTOPLAY_VIDEO_LENGTH = "data-ix-tabs-autoplay-video-length";
    const EASE = "data-ix-tabs-ease";
    const tabWraps = [...document.querySelectorAll(WRAP)];
    if (tabWraps.length === 0) return;
    tabWraps.forEach((tabWrap, componentIndex) => {
      let loopControls = attr(true, tabWrap.getAttribute(LOOP_CONTROLS));
      let slideTabs = attr(false, tabWrap.getAttribute(SLIDE_TABS));
      let autoplay = attr(0, tabWrap.getAttribute(AUTOPLAY));
      let duration = attr(0.2, tabWrap.getAttribute(DURATION));
      let pauseOnHover = attr(false, tabWrap.getAttribute(PAUSE_ON_HOVER));
      let autoplayVideos = attr(false, tabWrap.getAttribute(AUTOPLAYVIDEOS));
      let ease = attr("power1.out", tabWrap.getAttribute(EASE));
      let previousButton = tabWrap.querySelector(`${PREV_BTN} button`), nextButton = tabWrap.querySelector(`${NEXT_BTN} button`), toggleWrap = tabWrap.querySelector(PLAY_BTN), toggleButton = tabWrap.querySelector(`${PLAY_BTN} button`), buttonList = tabWrap.querySelector(".tab_button_list"), panelList = tabWrap.querySelector(".tab_content_list"), animating = false, canPlay = true, autoplayTl;
      function flattenDisplayContents(slot) {
        if (!slot) return;
        let child = slot.firstElementChild;
        while (child && child.classList.contains("u-display-contents")) {
          while (child.firstChild) {
            slot.insertBefore(child.firstChild, child);
          }
          slot.removeChild(child);
          child = slot.firstElementChild;
        }
      }
      flattenDisplayContents(buttonList);
      flattenDisplayContents(panelList);
      function removeCMSList(slot) {
        const dynList = Array.from(slot.children).find(
          (child) => child.classList.contains("w-dyn-list")
        );
        if (!dynList) return;
        const nestedItems = dynList?.querySelector(".w-dyn-items")?.children;
        if (!nestedItems) return;
        const staticWrapper = [...slot.children];
        [...nestedItems].forEach((el) => {
          const c = [...el.children].find((c2) => !c2.classList.contains("w-condition-invisible"));
          c && slot.appendChild(c);
        });
        staticWrapper.forEach((el) => el.remove());
      }
      removeCMSList(buttonList);
      removeCMSList(panelList);
      let buttonItems = Array.from(buttonList.children);
      let panelItems = Array.from(panelList.children);
      if (!buttonList || !panelList || !buttonItems.length || !panelItems.length) {
        console.warn("Missing elements in:", tabWrap);
        return;
      }
      panelItems.forEach((panel, i) => {
        panel.style.display = "none";
        panel.setAttribute("role", "tabpanel");
      });
      buttonItems.forEach((button, i) => {
        button.setAttribute("role", "tab");
      });
      panelList.removeAttribute("role");
      buttonList.setAttribute("role", "tablist");
      buttonItems.forEach((btn) => btn.setAttribute("role", "tab"));
      panelItems.forEach((panel) => panel.setAttribute("role", "tabpanel"));
      console.log("new tabs");
      let activeIndex = 0;
      const makeActive = (index, focus = false, animate = true, pause = true) => {
        if (animating) return;
        const previousPanel = panelItems[activeIndex];
        if (previousPanel) {
          const videos = previousPanel.querySelectorAll("video");
          videos.forEach((video) => {
            if (!video.paused) video.pause();
          });
        }
        buttonItems.forEach((btn, i) => {
          btn.classList.toggle("is-active", i === index);
          btn.setAttribute("aria-selected", i === index ? "true" : "false");
          btn.setAttribute("tabindex", i === index ? "0" : "-1");
        });
        panelItems.forEach((panel, i) => panel.classList.toggle("is-active", i === index));
        if (nextButton) nextButton.disabled = index === buttonItems.length - 1 && !loopControls;
        if (previousButton) previousButton.disabled = index === 0 && !loopControls;
        if (focus) buttonItems[index].focus();
        const currentPanel = panelItems[index];
        let direction = 1;
        if (activeIndex > index) direction = -1;
        if (autoplayVideos && currentPanel) {
          const currentVideos = currentPanel.querySelectorAll("video");
          currentVideos.forEach((video) => {
            if (video.paused) {
              const playPromise = video.play();
              if (playPromise instanceof Promise) {
                playPromise.catch(() => {
                });
              }
            }
          });
        }
        if (typeof gsap !== "undefined" && animate && activeIndex !== index) {
          if (autoplayTl && !canPlay && typeof autoplayTl.restart === "function") {
            autoplayTl.restart();
          }
          animating = true;
          let tl = gsap.timeline({
            onComplete: () => {
              animating = false;
              if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
            },
            defaults: { duration, ease: "power1.out" }
          });
          if (slideTabs) {
            tl.set(currentPanel, { display: "block", position: "relative" });
            if (previousPanel)
              tl.set(previousPanel, { position: "absolute", top: 0, left: 0, width: "100%" });
            if (previousPanel)
              tl.fromTo(previousPanel, { xPercent: 0 }, { xPercent: -120 * direction });
            tl.fromTo(currentPanel, { xPercent: 120 * direction }, { xPercent: 0 }, "<");
            if (previousPanel) tl.set(previousPanel, { display: "none" });
          } else {
            if (previousPanel) tl.to(previousPanel, { opacity: 0 });
            if (previousPanel) tl.set(previousPanel, { display: "none" });
            tl.set(currentPanel, { display: "block" });
            tl.fromTo(currentPanel, { opacity: 0 }, { opacity: 1 });
          }
        } else {
          if (previousPanel) previousPanel.style.display = "none";
          if (currentPanel) currentPanel.style.display = "block";
        }
        buttonList.scrollTo({ left: buttonItems[index].offsetLeft, behavior: "smooth" });
        activeIndex = index;
      };
      makeActive(0, false, false);
      const updateIndex = (delta, focus = false, pause = true) => makeActive(
        (activeIndex + delta + buttonItems.length) % buttonItems.length,
        focus,
        true,
        pause
      );
      nextButton?.addEventListener("click", () => updateIndex(1));
      previousButton?.addEventListener("click", () => updateIndex(-1));
      buttonItems.forEach((btn, index) => {
        let tabId = tabWrap.getAttribute("data-tab-component-id");
        tabId = tabId ? tabId.toLowerCase().replaceAll(" ", "-") : componentIndex + 1;
        let itemId = btn.getAttribute("data-tab-item-id");
        itemId = itemId ? itemId.toLowerCase().replaceAll(" ", "-") : index + 1;
        btn.setAttribute("id", "tab-button-" + tabId + "-" + itemId);
        btn.setAttribute("aria-controls", "tab-panel-" + tabId + "-" + itemId);
        panelItems[index]?.setAttribute("id", "tab-panel-" + tabId + "-" + itemId);
        panelItems[index]?.setAttribute("aria-labelledby", btn.id);
        if (new URLSearchParams(location.search).get("tab-id") === tabId + "-" + itemId)
          makeActive(index), autoplay = 0, tabWrap.scrollIntoView({ behavior: "smooth", block: "start" }), history.replaceState(
            {},
            "",
            ((u) => (u.searchParams.delete("tab-id"), u))(new URL(location.href))
          );
        btn.addEventListener("click", () => makeActive(index));
        btn.addEventListener("keydown", (e) => {
          if (["ArrowRight", "ArrowDown"].includes(e.key)) updateIndex(1, true);
          else if (["ArrowLeft", "ArrowUp"].includes(e.key)) updateIndex(-1, true);
        });
      });
      if (autoplay !== 0 && typeof gsap !== "undefined") {
        let updateAuto = function() {
          if (prefersReducedMotion || !inView || canPlay || isHovered || hasFocusInside)
            autoplayTl.pause();
          else autoplayTl.play();
        }, setButton = function() {
          canPlay = !canPlay;
          toggleButton?.setAttribute("aria-pressed", !canPlay ? "true" : "false");
          toggleWrap?.classList.toggle("is-pressed", !canPlay);
          if (!canPlay) isHovered = hasFocusInside = prefersReducedMotion = false;
          updateAuto();
        }, handleMotionChange = function(e) {
          prefersReducedMotion = e.matches;
          updateAuto();
          canPlay = !e.matches;
          setButton();
        };
        autoplayTl = gsap.timeline({ repeat: -1 }).fromTo(
          tabWrap,
          { "--progress": 0 },
          {
            onComplete: () => updateIndex(1, false, false),
            "--progress": 1,
            ease: "none",
            duration: autoplay
          }
        );
        let isHovered = false, hasFocusInside = false, prefersReducedMotion = false, inView = true;
        setButton();
        toggleButton?.addEventListener("click", function() {
          setButton();
        });
        handleMotionChange(window.matchMedia("(prefers-reduced-motion: reduce)"));
        window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", handleMotionChange);
        if (pauseOnHover)
          tabWrap.addEventListener("mouseenter", () => {
            isHovered = true;
            updateAuto();
          });
        if (pauseOnHover)
          tabWrap.addEventListener("mouseleave", () => {
            hasFocusInside = false;
            isHovered = false;
            updateAuto();
          });
        tabWrap.addEventListener("focusin", () => {
          hasFocusInside = true;
          updateAuto();
        });
        tabWrap.addEventListener("focusout", (e) => {
          if (!e.relatedTarget || !tabWrap.contains(e.relatedTarget)) {
            hasFocusInside = false;
            updateAuto();
          }
        });
        new IntersectionObserver(
          (e) => {
            inView = e[0].isIntersecting;
            updateAuto();
          },
          { threshold: 0 }
        ).observe(tabWrap);
      }
    });
  };

  // src/index.js
  document.addEventListener("DOMContentLoaded", function() {
    console.log("Custom Code Loaded");
    if (gsap.ScrollTrigger !== void 0) {
      gsap.registerPlugin(ScrollTrigger);
    }
    if (gsap.Flip !== void 0) {
      gsap.registerPlugin(Flip);
    }
    const hero = function() {
      const WRAP = ".hero_wrap";
      const wrap = document.querySelector(WRAP);
      const loadTrigger = document.querySelector(".hero_load_trigger");
      const spacer = document.querySelector(".hero_header_spacer");
      const video = document.querySelector(".hero_video");
      const trigger = document.querySelector(".hero_trigger");
      const mask = document.querySelector(".hero_mask");
      const maskPath = document.querySelector(".hero_path");
      const bird = document.querySelector(".hero_bird");
      const overlay = document.querySelector(".hero_overlay");
      const newPath = "M0 0 L0 0 L1 0 L1 0 L1 1 L0 1 Z";
      if (!wrap) return;
      function createScrollTL() {
        let scrollTL = gsap.timeline({
          paused: true,
          defaults: {
            duration: 1,
            ease: "power1.out"
          },
          scrollTrigger: {
            trigger,
            start: "top top",
            end: "bottom center",
            scrub: true,
            markers: false
          }
        });
        scrollTL.fromTo(
          mask,
          {
            scale: 1
          },
          {
            scale: 7
          },
          "<"
        );
        scrollTL.fromTo(
          overlay,
          {
            "--number": "0"
          },
          {
            "--number": "70"
          },
          "<"
        );
      }
      let loadTL = gsap.timeline({
        paused: true,
        delay: 0.8,
        defaults: {
          duration: 1.2,
          ease: "power2.out"
        },
        onComplete: () => {
          startScroll();
          createScrollTL();
        }
      });
      loadTL.fromTo(
        spacer,
        {
          "--number": "0"
        },
        {
          "--number": "100"
        }
      );
      loadTL.fromTo(
        bird,
        {
          x: "-80vw"
        },
        {
          x: "50vw",
          duration: 2
        },
        "<"
      );
      loadTL.from(
        mask,
        {
          width: "0rem"
        },
        "<.2"
      );
      if (isInViewport(loadTrigger)) {
        stopScroll();
        loadTL.play();
      } else {
        loadTL.progress(1);
        startScroll();
        createScrollTL();
      }
    };
    const gsapInit = function() {
      let mm = gsap.matchMedia();
      mm.add(
        {
          //This is the conditions object
          isMobile: "(max-width: 767px)",
          isTablet: "(min-width: 768px)  and (max-width: 991px)",
          isDesktop: "(min-width: 992px)",
          reduceMotion: "(prefers-reduced-motion: reduce)"
        },
        (gsapContext) => {
          let { isMobile, isTablet, isDesktop, reduceMotion } = gsapContext.conditions;
          hero(gsapContext);
          accordion(gsapContext);
          marquee(gsapContext);
          sliderComponent();
          tabs();
          banner(gsapContext);
          if (!reduceMotion) {
            scrollIn(gsapContext);
            scrolling(gsapContext);
          }
        }
      );
    };
    gsapInit();
    const scrollReset = function() {
      const RESET_EL = "[data-ix-reset]";
      const RESET_TIME = "data-ix-reset-time";
      const resetScrollTriggers = document.querySelectorAll(RESET_EL);
      resetScrollTriggers.forEach(function(item2) {
        item2.addEventListener("click", function(e) {
          ScrollTrigger.refresh();
          if (item2.hasAttribute(RESET_TIME)) {
            let time = attr(1e3, item2.getAttribute(RESET_TIME));
            setTimeout(() => {
              ScrollTrigger.refresh();
            }, time);
          }
        });
      });
    };
    scrollReset();
    const updaterFooterYear = function() {
      const YEAR_SELECTOR = "[data-footer-year]";
      const yearSpan = document.querySelector(YEAR_SELECTOR);
      if (!yearSpan) return;
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      yearSpan.innerText = currentYear.toString();
    };
    updaterFooterYear();
  });
})();
