class GloriousHeading extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.mousePosition = { x: 0, y: 0 };
    this.trailItems = [];
    this.colorIndex = 0;
    this.headingHovered = false;
  }

  static get observedAttributes() {
    return [
      'gradient-text', 'normal-text', 'font-size', 'font-family', 'font-color', 
      'text-alignment', 'background-color', 'gradient-colors', 'gradient-type', 
      'glow-color', 'heading-tag'
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this.handleResize = () => this.render();
    window.addEventListener('resize', this.handleResize);
    this.setupEventListeners();
    this.animateTrail();
    this.animateHeading();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mousemove', this.mouseMoveHandler);
    cancelAnimationFrame(this.trailAnimationId);
    cancelAnimationFrame(this.headingAnimationId);
  }

  setupEventListeners() {
    this.mouseMoveHandler = (event) => {
      this.mousePosition = { x: event.clientX, y: event.clientY };
    };
    window.addEventListener('mousemove', this.mouseMoveHandler);

    const heading = this.shadowRoot.querySelector('.heading');
    heading.addEventListener('mouseenter', () => {
      this.headingHovered = true;
    });
    heading.addEventListener('mouseleave', () => {
      this.headingHovered = false;
    });
  }

  createTrailItem(x, y) {
    const trail = this.shadowRoot.querySelector('#trail');
    const trailItem = document.createElement('div');
    trailItem.classList.add('trail-item');
    trailItem.style.left = `${x}px`;
    trailItem.style.top = `${y}px`;
    const gradientColors = this.getAttribute('gradient-colors')?.split(',') || ['#6ee7b7', '#3b82f6', '#8b5cf6'];
    trailItem.style.backgroundColor = gradientColors[this.colorIndex];
    trail.appendChild(trailItem);
    this.trailItems.push(trailItem);

    this.colorIndex = (this.colorIndex + 1) % gradientColors.length;

    setTimeout(() => {
      trailItem.style.opacity = '0';
      trailItem.style.transform = 'translate(-50%, -50%) scale(2)';
      setTimeout(() => {
        trailItem.remove();
        this.trailItems = this.trailItems.filter(item => item !== trailItem);
      }, 300);
    }, 10);
  }

  animateTrail() {
    this.createTrailItem(this.mousePosition.x, this.mousePosition.y);
    this.trailAnimationId = requestAnimationFrame(() => this.animateTrail());
  }

  animateHeading() {
    const heading = this.shadowRoot.querySelector('.heading');
    if (this.headingHovered) {
      const xOffset = Math.random() * 2 - 1;
      const yOffset = Math.random() * 2 - 1;
      heading.style.transform = `translate(${xOffset}px, ${yOffset}px) scale(1.05)`;
    } else {
      heading.style.transform = 'translate(0, 0) scale(1)';
    }
    this.headingAnimationId = requestAnimationFrame(() => this.animateHeading());
  }

  render() {
    const gradientText = this.getAttribute('gradient-text') || 'Glorious';
    const normalText = this.getAttribute('normal-text') || 'Heading';
    const fontSize = parseFloat(this.getAttribute('font-size')) || 4; // In vw
    const fontFamily = this.getAttribute('font-family') || 'Poppins';
    const fontColor = this.getAttribute('font-color') || '#ffffff';
    const textAlignment = this.getAttribute('text-alignment') || 'center';
    const backgroundColor = this.getAttribute('background-color') || '#121212';
    const gradientColors = this.getAttribute('gradient-colors') || 'rgba(110, 231, 183, 1),rgba(59, 130, 246, 1),rgba(139, 92, 246, 1)';
    const gradientType = this.getAttribute('gradient-type') || 'linear';
    const glowColor = this.getAttribute('glow-color') || 'rgba(255, 255, 255, 0.8)';
    const headingTag = this.getAttribute('heading-tag') || 'h1'; // Default to h1

    // Determine gradient style based on type
    let gradientStyle;
    switch (gradientType) {
      case 'inverted-linear':
        gradientStyle = `linear-gradient(270deg, ${gradientColors})`;
        break;
      case 'conic':
        gradientStyle = `conic-gradient(${gradientColors})`;
        break;
      case 'radial':
        gradientStyle = `radial-gradient(circle, ${gradientColors})`;
        break;
      case 'linear':
      default:
        gradientStyle = `linear-gradient(90deg, ${gradientColors})`;
        break;
    }

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

        :host {
          width: 100vw;
          height: 100vh;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: ${backgroundColor};
          font-family: ${fontFamily}, sans-serif;
          overflow: hidden;
        }

        .container {
          text-align: ${textAlignment};
          max-width: 80vw;
        }

        .heading {
          font-size: ${fontSize}vw;
          font-weight: 600;
          letter-spacing: 0.02em;
          transition: transform 0.2s ease, text-shadow 0.2s ease;
          cursor: pointer;
          display: inline-block;
          position: relative;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
          line-height: 1.2;
          color: ${fontColor};
          text-shadow: 0 0 10px ${glowColor};
        }

        .heading:hover {
          text-shadow: 0 0 15px ${glowColor};
        }

        .heading-gradient {
          background-image: ${gradientStyle};
          background-size: 200% 200%;
          animation: gradientAnimation 4s ease infinite;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          display: inline;
        }

        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        #trail {
          position: fixed;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 1000;
        }

        .trail-item {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.6);
          position: absolute;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: transform 0.1s ease, opacity 0.3s ease, background-color 0.2s ease;
          pointer-events: none;
        }
      </style>
      <div class="container">
        <${headingTag} class="heading">
          <span class="heading-gradient">${gradientText}</span>${normalText ? ' ' + normalText : ''}
        </${headingTag}>
      </div>
      <div id="trail"></div>
    `;
  }
}

customElements.define('glorious-heading', GloriousHeading);
