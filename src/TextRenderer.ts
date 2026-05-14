const TYPING_SPEED_MS = 20;

export class TextRenderer {
  private element: HTMLElement;
  private abort: boolean = false;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  async show(text: string, append: boolean = false): Promise<void> {
    if (!append) this.element.innerHTML = '';
    this.abort = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'text-block';
    this.element.appendChild(wrapper);

    for (let i = 0; i < text.length; i++) {
      if (this.abort) {
        wrapper.textContent = (wrapper.textContent ?? '') + text.slice(i);
        break;
      }
      wrapper.textContent = (wrapper.textContent ?? '') + text[i];
      await this.sleep(TYPING_SPEED_MS);
    }

    this.scrollToBottom();
  }

  skip(): void {
    this.abort = true;
  }

  private scrollToBottom(): void {
    this.element.scrollTop = this.element.scrollHeight;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }

  clear(): void {
    this.element.innerHTML = '';
    this.abort = true;
  }

  appendHtml(html: string): void {
    const wrapper = document.createElement('div');
    wrapper.className = 'text-block';
    wrapper.innerHTML = html;
    this.element.appendChild(wrapper);
    this.scrollToBottom();
  }
}
