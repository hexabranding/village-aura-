import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './layout.css'
import App from './App.tsx'

if (typeof window !== 'undefined') {
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
            if (blockPexels(value)) { v.dataset.blocked = '1'; return; }
            return desc.set!.call(v, value);
          },
          configurable: true,
        });
      }
      const origSetAttr = v.setAttribute.bind(v);
      v.setAttribute = (name: string, value: string) => {
        if (name === 'src' && blockPexels(value)) { v.dataset.blocked = '1'; return; }
        return origSetAttr(name, value);
      };
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
