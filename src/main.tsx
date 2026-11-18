import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './layout.css'
import App from './App.tsx'

if (typeof window !== 'undefined') {
  // Suppress harmless empty string src warning from dev console
  const origConsoleError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('An empty string ("") was passed to the src attribute')) {
      return;
    }
    return origConsoleError(...args);
  };

  // Prevent browser from re-downloading HTML document when src="" is set on img/video
  const origSetAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name: string, value: string) {
    if (name === 'src' && value === '' && (this.tagName === 'IMG' || this.tagName === 'VIDEO')) {
      return;
    }
    return origSetAttr.call(this, name, value);
  };

  const blockPexels = (url: string) => /videos\.pexels\.com/i.test(url) || /pexels\.com\/video-files/i.test(url);
  const origCreate = document.createElement.bind(document);
  (document.createElement as unknown as typeof origCreate) = ((tagName: string, options?: ElementCreationOptions) => {
    const el = origCreate(tagName, options);
    if (tagName.toLowerCase() === 'video') {
      const v = el as HTMLVideoElement;
      const desc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
      if (desc?.set) {
        Object.defineProperty(v, 'src', {
          get: desc.get,
          set(value: string) {
            if (!value || blockPexels(value)) { v.dataset.blocked = '1'; return; }
            return desc.set!.call(v, value);
          },
          configurable: true,
        });
      }
      const vSetAttr = v.setAttribute.bind(v);
      v.setAttribute = (name: string, value: string) => {
        if (name === 'src' && (!value || blockPexels(value))) { v.dataset.blocked = '1'; return; }
        return vSetAttr(name, value);
      };
    } else if (tagName.toLowerCase() === 'img') {
      const img = el as HTMLImageElement;
      const desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
      if (desc?.set) {
        Object.defineProperty(img, 'src', {
          get: desc.get,
          set(value: string) {
            if (value === '') return;
            return desc.set!.call(img, value);
          },
          configurable: true,
        });
      }
    }
    return el;
  }) as typeof origCreate;
  window.addEventListener('error', (e) => {
    const t = e.target as HTMLElement;
    if (t?.tagName === 'VIDEO' && t instanceof HTMLVideoElement && blockPexels(t.currentSrc || t.src)) {
      e.preventDefault(); e.stopPropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
