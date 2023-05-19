const DEFAULT_LOCKER_BG_COLOR = 'rgb(0, 0, 0)';
const removeAllChildrens = (element) => {
  while (element.lastElementChild) {
    element.removeChild(element.lastElementChild);
  }
};
const replaceChild = (element, newElement) => {
  removeAllChildrens(element);
  element.appendChild(newElement);
};
const isDefaultColor = (color) => {
  return color === DEFAULT_LOCKER_BG_COLOR;
};
const isOpaque = (opacity) => {
  const opaque = '1';
  return opacity === opaque;
};
const createReplaceElement = () => {
  const replaceElement = document.createElement('div');
  replaceElement.style.height = '100vh';
  replaceElement.style.display = 'flex';
  replaceElement.style.justifyContent = 'center';
  // const imgSrc = 'https://dvblobcdnjp.azureedge.net//Content/ueditor/net/upload1/2021-09/e967dedb-5683-493d-a5c2-dfb30f55bbe1.png';
  const imgSrc =
    'https://github.com/roychen3/chrome-extension-shiba-inu-goalkeeper/blob/main/images/%E6%8B%96%E5%8E%BB%E6%A7%8D%E6%96%83.png?raw=true';
  replaceElement.innerHTML = `<img src="${imgSrc}">`;
  return replaceElement;
};

const lockerComponentTemplate = document.createElement('template');
lockerComponentTemplate.innerHTML = `
<style>
  locker-component .l-c__hidden {
    display: none;
  }

  locker-component .l-c__locker {
    background-color: ${DEFAULT_LOCKER_BG_COLOR};
    width: 100%;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100000;
  }

  locker-component .l-c__locker .l-c__layout {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
</style>

<div class="l-c__locker l-c__hidden">
  <div class="l-c__layout">
    <div>
      <div>
        <!-- 
        <img src="https://dvblobcdnjp.azureedge.net//Content/ueditor/net/upload1/2021-09/d2fc6feb-a48e-4ff6-8cd9-689a0cb43ff5.png">
        -->
        <img src="https://github.com/roychen3/chrome-extension-shiba-inu-goalkeeper/blob/main/images/%E4%B8%8D%E5%8F%AF%E4%BB%A5%E8%89%B2%E8%89%B2.png?raw=true">
      </div>
      <input type="password" class="l-c__password" placeholder="猜出來就給你看" />
    </div>
  </div>
</div>
`;
class LockerComponent extends HTMLElement {
  constructor() {
    super();

    this._props = {
      open: localStorage.getItem('extensionToolLocker') === 'show',
    };
    this._isMounted = false;
    this.template = lockerComponentTemplate;

    this.render = this.render.bind(this);
    this.showLock = this.showLock.bind(this);
    this.hidLock = this.hidLock.bind(this);
    this.onPasswordKeyDown = this.onPasswordKeyDown.bind(this);
    this.preventCheating = this.preventCheating.bind(this);
  }

  get props() {
    return this._props;
  }

  set props(newVal) {
    this._props = {
      ...this._props,
      ...newVal,
    };

    if (this._isMounted) {
      this.render();
    }
  }

  showLock() {
    const lockerElement = this.querySelector('.l-c__locker');
    lockerElement.classList.remove('l-c__hidden');
    localStorage.setItem('extensionToolLocker', 'show');
  }

  hidLock() {
    const lockerElement = this.querySelector('.l-c__locker');
    lockerElement.classList.add('l-c__hidden');
    localStorage.setItem('extensionToolLocker', 'hide');
  }

  onPasswordKeyDown(event) {
    if (event.key === 'Enter') {
      if (event.target.value === '1234') {
        this.props = { open: false };
        event.target.value = '';
      }
    }
  }

  preventCheating() {
    const replaceElement = createReplaceElement();
    const timer = setInterval(() => {
      if (this.props.open) {
        const lockerComponentElementStyle = getComputedStyle(this);
        if (!isOpaque(lockerComponentElementStyle.opacity)) {
          replaceChild(document.body, replaceElement);
          return clearInterval(timer);
        }

        const lockerElement = this.querySelector('.l-c__locker');
        if (!lockerElement) {
          replaceChild(document.body, replaceElement);
          return clearInterval(timer);
        }

        const lockerElementStyle = getComputedStyle(lockerElement);
        if (
          !isDefaultColor(lockerElementStyle.backgroundColor) ||
          !isOpaque(lockerElementStyle.opacity)
        ) {
          replaceChild(document.body, replaceElement);
          return clearInterval(timer);
        }
      }
    });
  }

  connectedCallback() {
    this.appendChild(this.template.content.cloneNode(true));
    this.querySelector('.l-c__password').addEventListener(
      'keyup',
      this.onPasswordKeyDown
    );
    this.render();
    this._isMounted = true;
    this.preventCheating();
  }

  disconnectedCallback() {
    console.log('LockerComponent - disconnectedCallback');
    this.querySelector('.l-c__password').removeEventListener(
      'click',
      this.onPasswordKeyDown
    );
  }

  render() {
    const { open } = this.props;
    if (open) {
      this.showLock();
    } else {
      this.hidLock();
    }
  }
}

const extensionToolTemplate = document.createElement('template');
extensionToolTemplate.innerHTML = `
<style>
  extension-tool .e-t__btn {
    background-color: black;
    color: white;
    border-radius: 8px;
    border-style: none;
    padding: 0.5rem 1rem;
  }

  extension-tool .e-t__container {
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    z-index: 10000;
  }
</style>

<locker-component></locker-component>
<div class="e-t__container">
  <button class="e-t__btn e-t__protect-btn">不可以唷</button>
</div>
`;
class ExtensionTool extends HTMLElement {
  constructor() {
    super();

    this._isMounted = false;
    this.template = extensionToolTemplate;

    this.onProtectButton = this.onProtectButton.bind(this);
    this.preventCheating = this.preventCheating.bind(this);
  }

  onProtectButton() {
    const lockerComponentElement = this.querySelector('locker-component');
    lockerComponentElement.props = {
      open: true,
    };
  }

  preventCheating() {
    const replaceElement = createReplaceElement();
    const timer = setInterval(() => {
      const extensionToolElementStyle = getComputedStyle(this);
      if (!isOpaque(extensionToolElementStyle.opacity)) {
        replaceChild(document.body, replaceElement);
        return clearInterval(timer);
      }
    });
  }

  connectedCallback() {
    this.appendChild(this.template.content.cloneNode(true));
    this.querySelector('.e-t__protect-btn').addEventListener(
      'click',
      this.onProtectButton
    );
    this._isMounted = true;
    this.preventCheating();
  }

  disconnectedCallback() {
    console.log('ExtensionTool - disconnectedCallback');
    this.querySelector('.e-t__protect-btn').removeEventListener(
      'click',
      this.onProtectButton
    );
  }
}

window.customElements.define('locker-component', LockerComponent);
window.customElements.define('extension-tool', ExtensionTool);
const appNode = document.createElement('extension-tool');
document.body.appendChild(appNode);
