export default class Controls {
  constructor(experience) {
    this.experience = experience;

    // Input state
    this.input = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      brake: false
    };

    // Touch controls
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchCurrentX = 0;
    this.touchCurrentY = 0;
    this.isTouching = false;

    this.setupKeyboardControls();
    this.setupTouchControls();
    this.setupMouseControls();
  }

  setupKeyboardControls() {
    this.onKeyDown = (event) => {
      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          this.input.forward = true;
          break;
        case 's':
        case 'arrowdown':
          this.input.backward = true;
          break;
        case 'a':
        case 'arrowleft':
          this.input.left = true;
          break;
        case 'd':
        case 'arrowright':
          this.input.right = true;
          break;
        case ' ':
          this.input.brake = true;
          event.preventDefault();
          break;
      }
    };

    this.onKeyUp = (event) => {
      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          this.input.forward = false;
          break;
        case 's':
        case 'arrowdown':
          this.input.backward = false;
          break;
        case 'a':
        case 'arrowleft':
          this.input.left = false;
          break;
        case 'd':
        case 'arrowright':
          this.input.right = false;
          break;
        case ' ':
          this.input.brake = false;
          break;
      }
    };

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  setupTouchControls() {
    const canvas = this.experience.canvas;

    this.onTouchStart = (event) => {
      if (event.touches.length > 0) {
        this.isTouching = true;
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
        this.touchCurrentX = this.touchStartX;
        this.touchCurrentY = this.touchStartY;
      }
    };

    this.onTouchMove = (event) => {
      if (event.touches.length > 0 && this.isTouching) {
        this.touchCurrentX = event.touches[0].clientX;
        this.touchCurrentY = event.touches[0].clientY;

        const deltaX = this.touchCurrentX - this.touchStartX;
        const deltaY = this.touchCurrentY - this.touchStartY;

        // Vertical swipe for forward/backward
        const threshold = 30;
        if (deltaY < -threshold) {
          this.input.forward = true;
          this.input.backward = false;
        } else if (deltaY > threshold) {
          this.input.backward = true;
          this.input.forward = false;
        } else {
          this.input.forward = false;
          this.input.backward = false;
        }

        // Horizontal swipe for left/right
        if (deltaX < -threshold) {
          this.input.left = true;
          this.input.right = false;
        } else if (deltaX > threshold) {
          this.input.right = true;
          this.input.left = false;
        } else {
          this.input.left = false;
          this.input.right = false;
        }
      }
    };

    this.onTouchEnd = () => {
      this.isTouching = false;
      this.input.forward = false;
      this.input.backward = false;
      this.input.left = false;
      this.input.right = false;
    };

    canvas.addEventListener('touchstart', this.onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', this.onTouchMove, { passive: true });
    canvas.addEventListener('touchend', this.onTouchEnd, { passive: true });
  }

  setupMouseControls() {
    // Mouse wheel for camera zoom
    this.onWheel = (event) => {
      if (event.deltaY < 0) {
        this.experience.camera.zoomIn();
      } else {
        this.experience.camera.zoomOut();
      }
      event.preventDefault();
    };

    window.addEventListener('wheel', this.onWheel, { passive: false });
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('wheel', this.onWheel);

    const canvas = this.experience.canvas;
    canvas.removeEventListener('touchstart', this.onTouchStart);
    canvas.removeEventListener('touchmove', this.onTouchMove);
    canvas.removeEventListener('touchend', this.onTouchEnd);
  }
}
