import { attr, isInViewport, stopScroll, startScroll } from './utilities';
import { accordion } from './interactions/accordion';
import { banner } from './interactions/banner';
import { scrollIn } from './interactions/scroll-in';
import { marquee } from './interactions/marquee';
import { sliderComponent } from './interactions/slider';
import { scrolling } from './interactions/scrolling';
import { tabs } from './interactions/tabs';
import { loader } from './interactions/loader';

document.addEventListener('DOMContentLoaded', function () {
  // Comment out for production
  // console.log('Local Script');
  console.log('Custom Code Loaded');
  // register gsap plugins if available
  if (gsap.ScrollTrigger !== undefined) {
    gsap.registerPlugin(ScrollTrigger);
  }
  if (gsap.Flip !== undefined) {
    gsap.registerPlugin(Flip);
  }

  //////////////////////////////
  //Global Variables
  const hero = function () {
    const WRAP = '.hero_wrap';

    //elements
    const wrap = document.querySelector(WRAP);
    const loadTrigger = document.querySelector('.hero_load_trigger');
    const spacer = document.querySelector('.hero_header_spacer');
    const video = document.querySelector('.hero_video');
    const trigger = document.querySelector('.hero_trigger');
    const mask = document.querySelector('.hero_mask');
    const maskPath = document.querySelector('.hero_path');

    const bird = document.querySelector('.hero_bird');
    const overlay = document.querySelector('.hero_overlay');

    const newPath = 'M0 0 L0 0 L1 0 L1 0 L1 1 L0 1 Z';

    //guard clause

    if (!wrap) return;

    function createScrollTL() {
      let scrollTL = gsap.timeline({
        paused: true,
        defaults: {
          duration: 1,
          ease: 'power1.out',
        },
        scrollTrigger: {
          trigger: trigger,
          start: 'top top',
          end: 'bottom center',
          scrub: true,
          markers: false,
        },
      });
      scrollTL.fromTo(
        mask,
        {
          scale: 1,
        },
        {
          scale: 7,
        },
        '<'
      );
      scrollTL.fromTo(
        overlay,
        {
          '--number': '0',
        },
        {
          '--number': '70',
        },
        '<'
      );
      //morph tween not currently working
      // scrollTL.to(
      //   maskPath,
      //   {
      //     morphSVG: newPath,
      //   },
      //   '<'
      // );
    }

    let loadTL = gsap.timeline({
      paused: true,
      delay: 0.8,
      defaults: {
        duration: 1.2,
        ease: 'power2.out',
      },
      onComplete: () => {
        startScroll();
        createScrollTL();
      },
    });
    loadTL.fromTo(
      spacer,
      {
        '--number': '0',
      },
      {
        '--number': '100',
      }
    );
    loadTL.fromTo(
      bird,
      {
        x: '-80vw',
      },
      {
        x: '50vw',
        duration: 2,
      },
      '<'
    );
    loadTL.from(
      mask,
      {
        width: '0rem',
      },
      '<.2'
    );

    //check if the hero wrap is in view, if it is play the load animation, otherwise kill it.
    if (isInViewport(loadTrigger)) {
      // console.log('in view');
      stopScroll();
      loadTL.play();
    } else {
      // console.log('not in view');
      loadTL.progress(1);
      startScroll();
      createScrollTL();
    }
  };
  //////////////////////////////
  //Control Functions on page load
  const gsapInit = function () {
    let mm = gsap.matchMedia();
    mm.add(
      {
        //This is the conditions object
        isMobile: '(max-width: 767px)',
        isTablet: '(min-width: 768px)  and (max-width: 991px)',
        isDesktop: '(min-width: 992px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (gsapContext) => {
        let { isMobile, isTablet, isDesktop, reduceMotion } = gsapContext.conditions;
        //functional interactions
        hero(gsapContext);
        accordion(gsapContext);
        marquee(gsapContext);
        sliderComponent();
        tabs();
        banner(gsapContext);
        //conditional interactions
        if (!reduceMotion) {
          scrollIn(gsapContext);
          scrolling(gsapContext);
        }
      }
    );
  };
  gsapInit();

  //reset gsap on click of reset triggers
  const scrollReset = function () {
    //selector
    const RESET_EL = '[data-ix-reset]';
    //time option
    const RESET_TIME = 'data-ix-reset-time';
    const resetScrollTriggers = document.querySelectorAll(RESET_EL);
    resetScrollTriggers.forEach(function (item) {
      item.addEventListener('click', function (e) {
        //reset scrolltrigger
        ScrollTrigger.refresh();
        //if item has reset timer reset scrolltriggers after timer as well.
        if (item.hasAttribute(RESET_TIME)) {
          let time = attr(1000, item.getAttribute(RESET_TIME));
          //get potential timer reset
          setTimeout(() => {
            ScrollTrigger.refresh();
          }, time);
        }
      });
    });
  };
  scrollReset();

  const updaterFooterYear = function () {
    // set the fs-hacks selector
    const YEAR_SELECTOR = '[data-footer-year]';
    // get the the span element
    const yearSpan = document.querySelector(YEAR_SELECTOR);
    if (!yearSpan) return;
    // get the current year
    const currentYear = new Date().getFullYear();
    // set the year span element's text to the current year
    yearSpan.innerText = currentYear.toString();
  };
  updaterFooterYear();
});
