class DetailsDisclosure extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector('details');
    this.content = this.mainDetailsToggle.querySelector('summary').nextElementSibling;

    this.mainDetailsToggle.addEventListener('focusout', this.onFocusOut.bind(this));
    this.mainDetailsToggle.addEventListener('toggle', this.onToggle.bind(this));
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    });
  }

  onToggle() {
    if (!this.animations) this.animations = this.content.getAnimations();

    if (this.mainDetailsToggle.hasAttribute('open')) {
      this.animations.forEach((animation) => animation.play());
    } else {
      this.animations.forEach((animation) => animation.cancel());
    }
  }

  close() {
    this.mainDetailsToggle.removeAttribute('open');
    this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', false);
  }
}

customElements.define('details-disclosure', DetailsDisclosure);

class HeaderMenu extends DetailsDisclosure {
  constructor() {
    super();
    this.header = document.querySelector('.header-wrapper');
    this.summary = this.mainDetailsToggle.querySelector('summary');
    this.hoverMedia = window.matchMedia('(min-width: 990px)');
    this.leaveTimer = null;
    this.onSummaryClick = this.onSummaryClick.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMqlChange = this.onMqlChange.bind(this);
  }

  connectedCallback() {
    if (this.summary) {
      this.summary.addEventListener('click', this.onSummaryClick);
    }
    this.initDesktopHover();
    this.hoverMedia.addEventListener('change', this.onMqlChange);
  }

  disconnectedCallback() {
    if (this.summary) {
      this.summary.removeEventListener('click', this.onSummaryClick);
    }
    this.destroyDesktopHover();
    this.hoverMedia.removeEventListener('change', this.onMqlChange);
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }
  }

  onSummaryClick(event) {
    if (!this.hoverMedia.matches) return;
    if (event.detail > 0) {
      event.preventDefault();
    }
  }

  initDesktopHover() {
    this.destroyDesktopHover();
    if (!this.hoverMedia.matches) return;
    this.addEventListener('mouseenter', this.onMouseEnter);
    this.addEventListener('mouseleave', this.onMouseLeave);
  }

  destroyDesktopHover() {
    this.removeEventListener('mouseenter', this.onMouseEnter);
    this.removeEventListener('mouseleave', this.onMouseLeave);
  }

  onMqlChange() {
    this.destroyDesktopHover();
    if (!this.hoverMedia.matches) {
      this.close();
    } else {
      this.initDesktopHover();
    }
  }

  onMouseEnter() {
    if (!this.hoverMedia.matches) return;
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }
    if (this.header) {
      this.header.querySelectorAll('header-menu').forEach((hm) => {
        if (hm !== this && typeof hm.close === 'function') hm.close();
      });
    }
    this.openFromHover();
  }

  onMouseLeave() {
    if (!this.hoverMedia.matches) return;
    this.leaveTimer = setTimeout(() => {
      this.close();
      this.leaveTimer = null;
    }, 200);
  }

  openFromHover() {
    if (this.mainDetailsToggle.hasAttribute('open')) return;
    this.mainDetailsToggle.setAttribute('open', '');
    if (this.summary) {
      this.summary.setAttribute('aria-expanded', 'true');
    }
  }

  onToggle() {
    if (!this.header) return;
    this.header.preventHide = this.mainDetailsToggle.open;

    if (document.documentElement.style.getPropertyValue('--header-bottom-position-desktop') !== '') return;
    document.documentElement.style.setProperty(
      '--header-bottom-position-desktop',
      `${Math.floor(this.header.getBoundingClientRect().bottom)}px`
    );
  }
}

customElements.define('header-menu', HeaderMenu);
