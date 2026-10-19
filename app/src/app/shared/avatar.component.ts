import { Component, computed, input } from '@angular/core';

const PALETTE = [
  ['#7c5cff', '#b05cff'], ['#ff5c9d', '#ff8a5c'], ['#12b886', '#22b8cf'], ['#4dabf7', '#7c5cff'],
  ['#ff9f43', '#ff5c9d'], ['#845ef7', '#4dabf7'], ['#f0476b', '#ff9f43'], ['#20c997', '#51cf66'],
];

@Component({
  selector: 'k-avatar',
  template: `<span class="av" [style.width.px]="size()" [style.height.px]="size()" [style.fontSize.px]="size() * 0.4" [style.background]="bg()">{{ initials() }}</span>`,
  styles: `
    :host { display: inline-flex; }
    .av { border-radius: 50%; display: grid; place-items: center; color: #fff; font-weight: 700; letter-spacing: -0.02em; flex: none; box-shadow: 0 0 0 2px var(--k-surface); }
  `,
})
export class AvatarComponent {
  name = input.required<string>();
  size = input(40);
  initials = computed(() => {
    const p = this.name().trim().split(/\s+/);
    return ((p[0]?.[0] ?? '?') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
  });
  bg = computed(() => {
    let h = 0;
    for (const c of this.name()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const [a, b] = PALETTE[h % PALETTE.length];
    return `linear-gradient(135deg, ${a}, ${b})`;
  });
}
